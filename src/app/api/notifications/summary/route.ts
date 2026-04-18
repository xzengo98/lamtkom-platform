import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMyNotifications,
  getMyUnreadNotificationsCount,
} from "@/lib/notifications/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        unreadCount: 0,
        latestNotifications: [],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const [latestNotifications, unreadCount] = await Promise.all([
    getMyNotifications({ limit: 5 }),
    getMyUnreadNotificationsCount(),
  ]);

  return NextResponse.json(
    {
      unreadCount,
      latestNotifications,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}