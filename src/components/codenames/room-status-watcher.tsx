"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  roomId: string;
  roomCode: string;
  playerId: string;
};

type RoomRealtimePayload = {
  new: {
    status?: string | null;
  } | null;
};

export default function RoomStatusWatcher({
  roomId,
  roomCode,
  playerId,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    const goToBoard = () => {
      router.replace(
        `/games/codenames/board/${roomCode}?player_id=${encodeURIComponent(playerId)}`
      );
    };

    const refreshRoom = () => {
      router.refresh();
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

    const roomChannel = supabase
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
            return;
          }

          refreshRoom();
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`codenames-room-players-${roomId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "codenames_players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          refreshRoom();
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
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [roomId, roomCode, playerId, router]);

  return null;
}