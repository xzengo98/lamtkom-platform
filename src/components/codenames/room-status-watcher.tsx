"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  roomCode: string;
  playerId: string;
};

type RoomRealtimePayload = {
  new: {
    status?: string | null;
  } | null;
};

export default function RoomStatusWatcher({ roomCode, playerId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`codenames-room-${roomCode}`)
      .on(
        "postgres_changes" as any,
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
              `/games/codenames/board/${roomCode}?player_id=${encodeURIComponent(playerId)}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, playerId, router]);

  return null;
}