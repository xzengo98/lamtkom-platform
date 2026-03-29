"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function joinCodenamesRoom(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const guestName = getString(formData, "guest_name");
  const roomCode = getString(formData, "room_code").toUpperCase();

  if (!guestName || !roomCode) {
    throw new Error("الاسم ورمز الغرفة مطلوبان");
  }

  const { data: room, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError || !room) {
    throw new Error(roomError?.message || "الغرفة غير موجودة");
  }

  const { data: existingPlayer } = await supabase
    .from("codenames_players")
    .select("id")
    .eq("room_id", room.id)
    .eq("guest_name", guestName)
    .maybeSingle();

  if (existingPlayer?.id) {
    redirect(`/games/codenames/room/${roomCode}?player_id=${existingPlayer.id}`);
  }

  const { data: player, error: playerError } = await supabase
    .from("codenames_players")
    .insert({
      room_id: room.id,
      guest_name: guestName,
      team: null,
      role: "operative",
      is_host: false,
    })
    .select("id")
    .single();

  if (playerError || !player) {
    throw new Error(playerError?.message || "فشل إضافة اللاعب");
  }

  redirect(`/games/codenames/room/${roomCode}?player_id=${player.id}`);
}