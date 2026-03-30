"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function createUniqueRoomCode(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>
) {
  for (let i = 0; i < 20; i += 1) {
    const code = generateRoomCode();

    const { data } = await supabase
      .from("codenames_rooms")
      .select("id")
      .eq("room_code", code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  throw new Error("تعذر توليد رمز غرفة جديد");
}

export async function createCodenamesRoom(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const guestName = getString(formData, "guest_name");

  if (!guestName) {
    throw new Error("الاسم مطلوب");
  }

  const roomCode = await createUniqueRoomCode(supabase);

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .insert({
      room_code: roomCode,
      status: "waiting",
    })
    .select("id, room_code")
    .single();

  if (roomError || !roomData) {
    throw new Error(roomError?.message || "تعذر إنشاء الغرفة");
  }

  const { data: playerData, error: playerError } = await supabase
    .from("codenames_players")
    .insert({
      room_id: roomData.id,
      guest_name: guestName,
      team: "spectator",
      role: "spectator",
      is_host: true,
    })
    .select("id")
    .single();

  if (playerError || !playerData) {
    throw new Error(playerError?.message || "تعذر إضافة اللاعب إلى الغرفة");
  }

  redirect(`/games/codenames/room/${roomData.room_code}?player_id=${playerData.id}`);
}