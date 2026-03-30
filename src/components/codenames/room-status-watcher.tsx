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
    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    const goToBoard = () => {
      router.replace(
        `/games/codenames/board/${roomCode}?player_id=${encodeURIComponent(playerId)}`
      );
    };

    const checkRoomStatus = async () => {
      if (!isMounted) return;

      const { data } = await supabase
        .from("codenames_rooms")
        .select("status")
        .eq("room_code", roomCode)
        .maybeSingle();

      if (data?.status === "active") {
        goToBoard();
      }
    };

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
            goToBoard();
          }
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      checkRoomStatus();
    }, 1000);

    checkRoomStatus();

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [roomCode, playerId, router]);

  return null;
}