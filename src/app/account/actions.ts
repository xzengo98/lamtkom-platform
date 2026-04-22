"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DeleteIncompleteGameResult = {
  ok: boolean;
  error?: string;
};

type RedeemCouponResult = {
  ok: boolean;
  error?: string;
  message?: string;
  rewardType?: string;
  gamesAmount?: number;
  targetTier?: string | null;
};

export async function deleteIncompleteGame(
  sessionId: string,
): Promise<DeleteIncompleteGameResult> {
  const safeSessionId = String(sessionId ?? "").trim();

  if (!safeSessionId) {
    return {
      ok: false,
      error: "معرّف اللعبة غير صالح.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "يجب تسجيل الدخول أولًا.",
    };
  }

  const admin = getSupabaseAdminClient();

  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("id, user_id, status")
    .eq("id", safeSessionId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (sessionError) {
    return {
      ok: false,
      error: sessionError.message || "تعذر التحقق من اللعبة.",
    };
  }

  if (!session) {
    return {
      ok: false,
      error: "لم يتم العثور على لعبة نشطة قابلة للحذف.",
    };
  }

  const { error: deleteSessionQuestionsError } = await admin
    .from("game_session_questions")
    .delete()
    .eq("session_id", safeSessionId);

  if (deleteSessionQuestionsError) {
    return {
      ok: false,
      error:
        deleteSessionQuestionsError.message ||
        "تعذر حذف أسئلة الجلسة المرتبطة.",
    };
  }

  const { error: deleteSessionError } = await admin
    .from("game_sessions")
    .delete()
    .eq("id", safeSessionId)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (deleteSessionError) {
    return {
      ok: false,
      error: deleteSessionError.message || "تعذر حذف الجلسة.",
    };
  }

  revalidatePath("/account");
  revalidatePath("/game/board");
  revalidatePath("/game/start");

  return { ok: true };
}

export async function redeemCouponAction(
  code: string,
): Promise<RedeemCouponResult> {
  const safeCode = String(code ?? "").trim().replace(/\s+/g, "").toUpperCase();

  if (!safeCode) {
    return {
      ok: false,
      error: "يرجى إدخال كود الكوبون.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "يجب تسجيل الدخول أولًا.",
    };
  }

  const { data, error } = await supabase.rpc("redeem_coupon", {
    p_code: safeCode,
  });

  if (error) {
    return {
      ok: false,
      error: error.message || "تعذر تفعيل الكوبون.",
    };
  }

  const result = (data ?? null) as
    | {
        ok?: boolean;
        error?: string;
        message?: string;
        reward_type?: string;
        games_amount?: number;
        target_tier?: string | null;
      }
    | null;

  if (!result?.ok) {
    return {
      ok: false,
      error: result?.message || "تعذر تفعيل الكوبون.",
    };
  }

  revalidatePath("/account");
  revalidatePath("/game/start");
  revalidatePath("/pricing");

  return {
    ok: true,
    message: result.message || "تم تفعيل الكوبون بنجاح.",
    rewardType: result.reward_type,
    gamesAmount: result.games_amount,
    targetTier: result.target_tier ?? null,
  };
}