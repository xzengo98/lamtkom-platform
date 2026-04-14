"use client";

import { useEffect, useRef } from "react";
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
  const refreshTimerRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    const goToBoard = () => {
      router.replace(
        `/games/codenames/board/${roomCode}?player_id=${encodeURIComponent(playerId)}`
      );
    };

    const refreshRoom = (delay = 80) => {
      const now = Date.now();
      if (now - lastRefreshAtRef.current < 250) return;

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = window.setTimeout(() => {
        lastRefreshAtRef.current = Date.now();
        router.refresh();
      }, delay);
    };

    const checkRoomStatus = async () => {
      if (!isMounted) return;

      const { data } = await supabase
        .from("codenames_rooms")
        .select("status")
        .eq("room_code", roomCode)
        .maybeSingle();

      if (!isMounted) return;

      if (data?.status === "active") {
        goToBoard();
        return;
      }

      refreshRoom(60);
    };

    const roomChannel = supabase
      .channel(`codenames-room-${roomCode}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
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
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          void checkRoomStatus();
        }
      });

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

    const interval = window.setInterval(() => {
      void checkRoomStatus();
    }, 2500);

    const handleFocus = () => {
      void checkRoomStatus();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkRoomStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [roomId, roomCode, playerId, router]);

  return null;
}
