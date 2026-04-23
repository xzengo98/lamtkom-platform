"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createGamesAddedNotification,
  createNotificationForUser,
} from "@/lib/notifications/server";

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

type UpdateProfileDetailsResult = {
  ok: boolean;
  error?: string;
  profile?: {
    username: string;
    phone: string | null;
  };
};

type UpdatePasswordResult = {
  ok: boolean;
  error?: string;
  message?: string;
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

  const { data: beforeProfile, error: beforeProfileError } = await supabase
    .from("profiles")
    .select("games_remaining, account_tier")
    .eq("id", user.id)
    .maybeSingle();

  if (beforeProfileError) {
    return {
      ok: false,
      error: beforeProfileError.message || "تعذر قراءة بيانات الحساب.",
    };
  }

  const previousGamesRemaining = Number(beforeProfile?.games_remaining ?? 0);
  const previousTier = String(beforeProfile?.account_tier ?? "free");

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

  const rewardType = String(result.reward_type ?? "");
  const gamesAmount = Number(result.games_amount ?? 0);
  const targetTier = result.target_tier ?? null;

  if (rewardType === "games_balance" && gamesAmount > 0) {
    const newRemaining = previousGamesRemaining + gamesAmount;

    await createGamesAddedNotification({
      userId: user.id,
      addedGames: gamesAmount,
      previousRemaining: previousGamesRemaining,
      newRemaining,
    });
  }

  if (rewardType === "account_tier" && targetTier) {
    await createNotificationForUser({
      userId: user.id,
      type: "system",
      title: "تم ترقية حسابك بنجاح",
      body: `تم تفعيل الكوبون بنجاح وترقية حسابك من "${previousTier}" إلى "${targetTier}".`,
      actionUrl: "/account",
      payload: {
        previousTier,
        newTier: targetTier,
        source: "coupon",
        code: safeCode,
      },
    });
  }

  revalidatePath("/account");
  revalidatePath("/account/notifications");
  revalidatePath("/");
  revalidatePath("/game/start");
  revalidatePath("/pricing");

  return {
    ok: true,
    message: result.message || "تم تفعيل الكوبون بنجاح.",
    rewardType,
    gamesAmount,
    targetTier,
  };
}

export async function updateProfileDetailsAction(input: {
  username: string;
  phone: string;
}): Promise<UpdateProfileDetailsResult> {
  const safeUsername = String(input?.username ?? "").trim();
  const safePhoneRaw = String(input?.phone ?? "").trim();
  const safePhone = safePhoneRaw || null;

  if (!safeUsername) {
    return {
      ok: false,
      error: "يرجى إدخال اسم المستخدم.",
    };
  }

  if (safeUsername.length < 3) {
    return {
      ok: false,
      error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل.",
    };
  }

  if (safeUsername.length > 30) {
    return {
      ok: false,
      error: "اسم المستخدم طويل جدًا. الحد الأقصى 30 حرفًا.",
    };
  }

  if (
    safePhone &&
    !/^[0-9+()\-\s]{6,20}$/.test(safePhone)
  ) {
    return {
      ok: false,
      error: "رقم الهاتف غير صالح.",
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

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: safeUsername,
      phone: safePhone,
    })
    .eq("id", user.id)
    .select("username, phone")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message || "تعذر تحديث بيانات الحساب.",
    };
  }

  revalidatePath("/account");

  return {
    ok: true,
    profile: {
      username: String(data?.username ?? safeUsername),
      phone: (data?.phone as string | null | undefined) ?? safePhone,
    },
  };
}

export async function updatePasswordAction(input: {
  newPassword: string;
  confirmPassword: string;
}): Promise<UpdatePasswordResult> {
  const newPassword = String(input?.newPassword ?? "");
  const confirmPassword = String(input?.confirmPassword ?? "");

  if (!newPassword) {
    return {
      ok: false,
      error: "يرجى إدخال كلمة المرور الجديدة.",
    };
  }

  if (newPassword.length < 8) {
    return {
      ok: false,
      error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      error: "تأكيد كلمة المرور غير مطابق.",
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

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      ok: false,
      error: error.message || "تعذر تحديث كلمة المرور.",
    };
  }

  revalidatePath("/account");

  return {
    ok: true,
    message: "تم تحديث كلمة المرور بنجاح.",
  };
}
