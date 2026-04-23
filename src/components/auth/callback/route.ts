import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto =
        request.headers.get("x-forwarded-proto") ?? "https";
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(
          `${forwardedProto}://${forwardedHost}${next}`,
        );
      }

      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent(
      "تعذر تسجيل الدخول عبر جوجل. حاول مرة أخرى.",
    )}`,
  );
}