"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateRoomCode } from "@/lib/codenames/room-code";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function generateUniqueRoomCode() {
  const supabase = await getSupabaseServerClient();

  for (let i = 0; i < 10; i += 1) {
    const code = generateRoomCode(6);

    const { data } = await supabase
      .from("codenames_rooms")
      .select("id")
      .eq("room_code", code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  throw new Error("تعذر إنشاء رمز غرفة فريد");
}

export async function createCodenamesRoom(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const guestName = getString(formData, "guest_name");
  if (!guestName) {
    throw new Error("الاسم مطلوب");
  }

  const roomCode = await generateUniqueRoomCode();

  const { data: room, error: roomError } = await supabase
    .from("codenames_rooms")
    .insert({
      room_code: roomCode,
      status: "waiting",
    })
    .select("id, room_code")
    .single();

  if (roomError || !room) {
    throw new Error(roomError?.message || "فشل إنشاء الغرفة");
  }

  const { error: playerError } = await supabase.from("codenames_players").insert({
    room_id: room.id,
    guest_name: guestName,
    is_host: true,
    team: "red",
    role: "spymaster",
  });

  if (playerError) {
    throw new Error(playerError.message);
  }

  redirect(`/games/codenames/room/${room.room_code}?name=${encodeURIComponent(guestName)}`);
}