"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : 0;
}

type RoomRow = {
  id: string;
  room_code: string;
  current_turn_team: string | null;
};

type PlayerRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  team: string | null;
  role: string | null;
  is_host: boolean | null;
};

export async function submitCodenamesClue(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorName = getString(formData, "actor_name");
  const clueWord = getString(formData, "clue_word");
  const clueNumber = getNumber(formData, "clue_number");

  if (!roomCode || !actorName) {
    throw new Error("بيانات غير مكتملة");
  }

  if (!clueWord) {
    throw new Error("الـ clue مطلوب");
  }

  if (clueNumber < 1) {
    throw new Error("عدد الكلمات يجب أن يكون 1 أو أكثر");
  }

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code, current_turn_team")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError || !roomData) {
    throw new Error(roomError?.message || "الغرفة غير موجودة");
  }

  const room = roomData as RoomRow;

  const { data: playerData, error: playerError } = await supabase
    .from("codenames_players")
    .select("id, room_id, guest_name, team, role, is_host")
    .eq("room_id", room.id)
    .eq("guest_name", actorName)
    .maybeSingle();

  if (playerError || !playerData) {
    throw new Error(playerError?.message || "اللاعب غير موجود");
  }

  const player = playerData as PlayerRow;

  if (player.role !== "spymaster") {
    throw new Error("فقط الـ Spymaster يستطيع إرسال clue");
  }

  if (player.team !== room.current_turn_team) {
    throw new Error("ليس دور فريقك الآن");
  }

  const { error: closeOldTurnsError } = await supabase
    .from("codenames_turns")
    .update({
      turn_status: "ended",
      ended_at: new Date().toISOString(),
    })
    .eq("room_id", room.id)
    .eq("turn_status", "active");

  if (closeOldTurnsError) {
    throw new Error(closeOldTurnsError.message);
  }

  const { error: insertTurnError } = await supabase
    .from("codenames_turns")
    .insert({
      room_id: room.id,
      team: room.current_turn_team,
      spymaster_player_id: player.id,
      clue_word: clueWord,
      clue_number: clueNumber,
      guesses_made: 0,
      turn_status: "active",
    });

  if (insertTurnError) {
    throw new Error(insertTurnError.message);
  }

  revalidatePath(`/games/codenames/board/${roomCode}`);
}