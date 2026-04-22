"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function normalizeCode(input: string) {
  return input.trim().replace(/\s+/g, "").toUpperCase();
}

function generateCouponCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (length: number) =>
    Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `LMTK-${part(4)}-${part(4)}`;
}

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return { supabase, userId: user.id };
}

function toNullableDateTime(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue ? new Date(stringValue).toISOString() : null;
}

export async function createCouponAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin();

  const rewardType = String(formData.get("rewardType") ?? "").trim();
  const rawCode = String(formData.get("code") ?? "").trim();
  const code = normalizeCode(rawCode || generateCouponCode());

  const targetGame = String(formData.get("targetGame") ?? "lamtkom").trim() || "lamtkom";
  const gamesAmount = Number(formData.get("gamesAmount") ?? 0);
  const targetTier = String(formData.get("targetTier") ?? "").trim() || null;
  const assignedUserId = String(formData.get("assignedUserId") ?? "").trim() || null;
  const maxRedemptions = Number(formData.get("maxRedemptions") ?? 1);
  const singleUsePerUser = formData.get("singleUsePerUser") === "on";
  const startsAt = toNullableDateTime(formData.get("startsAt"));
  const expiresAt = toNullableDateTime(formData.get("expiresAt"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!["games_balance", "account_tier"].includes(rewardType)) {
    redirect("/admin/coupons?error=" + encodeURIComponent("نوع الكوبون غير صالح."));
  }

  if (rewardType === "games_balance" && (!Number.isFinite(gamesAmount) || gamesAmount <= 0)) {
    redirect("/admin/coupons?error=" + encodeURIComponent("عدد الألعاب يجب أن يكون أكبر من صفر."));
  }

  if (rewardType === "account_tier" && !targetTier) {
    redirect("/admin/coupons?error=" + encodeURIComponent("يرجى تحديد الرتبة المستهدفة."));
  }

  if (!Number.isFinite(maxRedemptions) || maxRedemptions < 1) {
    redirect("/admin/coupons?error=" + encodeURIComponent("عدد مرات الاستخدام يجب أن يكون 1 أو أكثر."));
  }

  const payload = {
    code,
    is_active: true,
    reward_type: rewardType,
    target_game: rewardType === "games_balance" ? targetGame : null,
    games_amount: rewardType === "games_balance" ? gamesAmount : 0,
    target_tier: rewardType === "account_tier" ? targetTier : null,
    assigned_user_id: assignedUserId,
    max_redemptions: maxRedemptions,
    single_use_per_user: singleUsePerUser,
    starts_at: startsAt,
    expires_at: expiresAt,
    notes,
    created_by: userId,
  };

  const { error } = await supabase.from("coupons").insert(payload);

  if (error) {
    redirect(
      "/admin/coupons?error=" +
        encodeURIComponent(error.message || "تعذر إنشاء الكوبون."),
    );
  }

  revalidatePath("/admin/coupons");
  redirect(
    "/admin/coupons?success=" +
      encodeURIComponent(`تم إنشاء الكوبون بنجاح: ${code}`),
  );
}

export async function toggleCouponStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const couponId = String(formData.get("couponId") ?? "").trim();
  const nextActive = String(formData.get("nextActive") ?? "").trim() === "true";

  if (!couponId) {
    redirect("/admin/coupons?error=" + encodeURIComponent("معرف الكوبون مفقود."));
  }

  const { error } = await supabase
    .from("coupons")
    .update({ is_active: nextActive })
    .eq("id", couponId);

  if (error) {
    redirect(
      "/admin/coupons?error=" +
        encodeURIComponent(error.message || "تعذر تحديث حالة الكوبون."),
    );
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?success=" + encodeURIComponent("تم تحديث حالة الكوبون."));
}