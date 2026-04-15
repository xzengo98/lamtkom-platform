"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ExistingPlayerRow = {
  id: string;
  guest_name: string | null;
};

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGuestName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildJoinRedirect(params: {
  roomCode?: string;
  error?: string;
}) {
  const search = new URLSearchParams();

  if (params.roomCode) {
    search.set("room_code", params.roomCode);
  }

  if (params.error) {
    search.set("error", params.error);
  }

  const query = search.toString();
  return query ? `/games/codenames/join?${query}` : "/games/codenames/join";
}

export async function joinCodenamesRoom(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const roomCode = getString(formData, "room_code").toUpperCase();
  const guestName = getString(formData, "guest_name");

  if (!roomCode) {
    redirect(
      buildJoinRedirect({
        error: "رمز الغرفة مطلوب",
      })
    );
  }

  if (!guestName) {
    redirect(
      buildJoinRedirect({
        roomCode,
        error: "الاسم مطلوب",
      })
    );
  }

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code, status")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError || !roomData) {
    redirect(
      buildJoinRedirect({
        roomCode,
        error: roomError?.message || "الغرفة غير موجودة",
      })
    );
  }

  const room = roomData as RoomRow;
  const normalizedGuestName = normalizeGuestName(guestName);

  const { data: existingPlayersData, error: existingPlayersError } =
    await supabase
      .from("codenames_players")
      .select("id, guest_name")
      .eq("room_id", room.id);

  if (existingPlayersError) {
    redirect(
      buildJoinRedirect({
        roomCode: room.room_code,
        error: existingPlayersError.message || "تعذر فحص أسماء اللاعبين",
      })
    );
  }

  const existingPlayers = (existingPlayersData ?? []) as ExistingPlayerRow[];

  const duplicatePlayer = existingPlayers.find((player) => {
    return normalizeGuestName(player.guest_name ?? "") === normalizedGuestName;
  });

  if (duplicatePlayer) {
    redirect(
      buildJoinRedirect({
        roomCode: room.room_code,
        error: "هذا الاسم مستخدم بالفعل داخل هذه الغرفة",
      })
    );
  }

  const { data: playerData, error: playerError } = await supabase
    .from("codenames_players")
    .insert({
      room_id: room.id,
      guest_name: guestName,
      team: "spectator",
      role: "spectator",
      is_host: false,
    })
    .select("id")
    .single();

  if (playerError || !playerData) {
    redirect(
      buildJoinRedirect({
        roomCode: room.room_code,
        error: playerError?.message || "تعذر الانضمام إلى الغرفة",
      })
    );
  }

  if (room.status === "active") {
    redirect(`/games/codenames/board/${room.room_code}?player_id=${playerData.id}`);
  }

  redirect(`/games/codenames/room/${room.room_code}?player_id=${playerData.id}`);
}