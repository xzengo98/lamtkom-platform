"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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