"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createCampaignAndDispatch } from "@/lib/notifications/server";
import type {
  NotificationAudienceType,
  NotificationRoleTarget,
  NotificationType,
} from "@/lib/notifications/types";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}

function normalizeTextarea(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeOptionalText(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : null;
}

export async function sendAdminNotificationAction(formData: FormData) {
  const user = await requireAdmin();

  const category = String(formData.get("category") ?? "").trim() as NotificationType;
  const audienceType = String(formData.get("audienceType") ?? "").trim() as NotificationAudienceType;
  const audienceRoleRaw = String(formData.get("audienceRole") ?? "").trim();
  const title = normalizeTextarea(formData.get("title"), 140);
  const body = normalizeTextarea(formData.get("body"), 1000);
  const actionUrl = normalizeOptionalText(formData.get("actionUrl"), 300);

  if (!category || !audienceType || !title || !body) {
    throw new Error("يرجى تعبئة الحقول المطلوبة");
  }

  const allowedCategories: NotificationType[] = [
    "announcement",
    "games_added",
    "game_created",
    "game_consumed",
    "low_balance",
    "balance_empty",
    "role_changed",
    "system",
  ];

  const allowedAudienceTypes: NotificationAudienceType[] = ["all", "role", "users"];
  const allowedRoles: NotificationRoleTarget[] = ["admin", "premium", "user"];

  if (!allowedCategories.includes(category)) {
    throw new Error("نوع الإشعار غير صالح");
  }

  if (!allowedAudienceTypes.includes(audienceType)) {
    throw new Error("نوع الجمهور غير صالح");
  }

  let audienceRole: NotificationRoleTarget | null = null;

  if (audienceType === "role") {
    if (!allowedRoles.includes(audienceRoleRaw as NotificationRoleTarget)) {
      throw new Error("الرتبة المحددة غير صالحة");
    }
    audienceRole = audienceRoleRaw as NotificationRoleTarget;
  }

  await createCampaignAndDispatch({
    createdBy: user.id,
    category,
    audienceType,
    audienceRole,
    title,
    body,
    actionUrl,
    payload: {
      source: "admin_panel",
    },
  });

  revalidatePath("/admin/notifications");
  revalidatePath("/account/notifications");
  revalidatePath("/");
}