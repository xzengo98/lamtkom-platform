"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updatePlayerTeam(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const playerId = getString(formData, "player_id");
  const roomCode = getString(formData, "room_code");
  const team = getString(formData, "team");

  if (!playerId || !roomCode) return;
  if (!["red", "blue"].includes(team)) return;

  const { error } = await supabase
    .from("codenames_players")
    .update({ team })
    .eq("id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}

export async function updatePlayerRole(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const playerId = getString(formData, "player_id");
  const roomCode = getString(formData, "room_code");
  const role = getString(formData, "role");

  if (!playerId || !roomCode) return;
  if (!["spymaster", "operative"].includes(role)) return;

  const { error } = await supabase
    .from("codenames_players")
    .update({ role })
    .eq("id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}