import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function handleLogout(request: Request) {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}