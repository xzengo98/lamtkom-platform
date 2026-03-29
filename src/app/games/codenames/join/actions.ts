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

  if (!guestName) {
    throw new Error("الاسم مطلوب");
  }

  if (!roomCode) {
    throw new Error("رمز الغرفة مطلوب");
  }

  const { data: room, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code, status")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  const { data: existingPlayer } = await supabase
    .from("codenames_players")
    .select("id")
    .eq("room_id", room.id)
    .eq("guest_name", guestName)
    .maybeSingle();

  if (!existingPlayer) {
    const { error: insertError } = await supabase.from("codenames_players").insert({
      room_id: room.id,
      guest_name: guestName,
      is_host: false,
      team: null,
      role: "operative",
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  redirect(`/games/codenames/room/${room.room_code}?name=${encodeURIComponent(guestName)}`);
}