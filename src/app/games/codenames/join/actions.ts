"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ExistingPlayerRow = {
  id: string;
  guest_name: string | null;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGuestName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export async function joinCodenamesRoom(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const roomCode = getString(formData, "room_code").toUpperCase();
  const guestName = getString(formData, "guest_name");

  if (!roomCode) {
    throw new Error("رمز الغرفة مطلوب");
  }

  if (!guestName) {
    throw new Error("الاسم مطلوب");
  }

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError || !roomData) {
    throw new Error(roomError?.message || "الغرفة غير موجودة");
  }

  const normalizedGuestName = normalizeGuestName(guestName);

  const { data: existingPlayersData, error: existingPlayersError } = await supabase
    .from("codenames_players")
    .select("id, guest_name")
    .eq("room_id", roomData.id);

  if (existingPlayersError) {
    throw new Error(existingPlayersError.message || "تعذر فحص أسماء اللاعبين");
  }

  const existingPlayers = (existingPlayersData ?? []) as ExistingPlayerRow[];

  const duplicatePlayer = existingPlayers.find((player: ExistingPlayerRow) => {
    return normalizeGuestName(player.guest_name ?? "") === normalizedGuestName;
  });

  if (duplicatePlayer) {
    redirect(
      `/games/codenames/join?room_code=${encodeURIComponent(
        roomData.room_code,
      )}&error=${encodeURIComponent("هذا الاسم مستخدم بالفعل داخل هذه الغرفة")}`,
    );
  }

  const { data: playerData, error: playerError } = await supabase
    .from("codenames_players")
    .insert({
      room_id: roomData.id,
      guest_name: guestName,
      team: "spectator",
      role: "spectator",
      is_host: false,
    })
    .select("id")
    .single();

  if (playerError || !playerData) {
    throw new Error(playerError?.message || "تعذر الانضمام إلى الغرفة");
  }

  redirect(`/games/codenames/room/${roomData.room_code}?player_id=${playerData.id}`);
}