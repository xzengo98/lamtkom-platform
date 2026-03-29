"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  roomCode: string;
  currentName: string;
};

type RoomRealtimePayload = {
  new: {
    status?: string | null;
  } | null;
};

export default function RoomStatusWatcher({ roomCode, currentName }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`codenames-room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "codenames_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload: RoomRealtimePayload) => {
          const next = payload.new;

          if (next?.status === "active") {
            router.replace(
              `/games/codenames/board/${roomCode}?name=${encodeURIComponent(currentName)}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, currentName, router]);

  return null;
}