"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DeleteIncompleteGameResult = {
  ok: boolean;
  error?: string;
};

export async function deleteIncompleteGame(
  sessionId: string
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