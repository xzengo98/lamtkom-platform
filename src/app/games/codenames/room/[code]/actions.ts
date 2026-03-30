"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
};

type PlayerRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  team: string | null;
  role: string | null;
  is_host: boolean | null;
};

type WordRow = {
  word: string;
};

async function getRoomAndActor({
  roomCode,
  actorPlayerId,
}: {
  roomCode: string;
  actorPlayerId: string;
}) {
  const supabase = await getSupabaseServerClient();

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code, status")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError || !roomData) {
    throw new Error(roomError?.message || "الغرفة غير موجودة");
  }

  const room = roomData as RoomRow;

  const { data: actorData, error: actorError } = await supabase
    .from("codenames_players")
    .select("id, room_id, guest_name, team, role, is_host")
    .eq("room_id", room.id)
    .eq("id", actorPlayerId)
    .maybeSingle();

  if (actorError || !actorData) {
    throw new Error(actorError?.message || "تعذر تحديد اللاعب الحالي");
  }

  const actor = actorData as PlayerRow;

  return { supabase, room, actor };
}

export async function updatePlayerTeam(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");
  const playerId = getString(formData, "player_id");
  const team = getString(formData, "team").toLowerCase();

  if (!roomCode || !actorPlayerId || !playerId || !team) {
    throw new Error("بيانات غير مكتملة");
  }

  const allowedTeams = ["blue", "red", "spectator"];
  if (!allowedTeams.includes(team)) {
    throw new Error("فريق غير صالح");
  }

  const { supabase, room, actor } = await getRoomAndActor({
    roomCode,
    actorPlayerId,
  });

  const { data: targetPlayer, error: targetPlayerError } = await supabase
    .from("codenames_players")
    .select("id, room_id, team, role")
    .eq("room_id", room.id)
    .eq("id", playerId)
    .maybeSingle();

  if (targetPlayerError || !targetPlayer) {
    throw new Error(targetPlayerError?.message || "اللاعب غير موجود");
  }

  const canManage = actor.is_host || actor.id === playerId;
  if (!canManage) {
    throw new Error("لا تملك صلاحية تعديل هذا اللاعب");
  }

  const nextRole = team === "spectator" ? "spectator" : "operative";

  const { error: updateError } = await supabase
    .from("codenames_players")
    .update({
      team,
      role: nextRole,
    })
    .eq("id", playerId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}

export async function updatePlayerRole(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");
  const playerId = getString(formData, "player_id");
  const role = getString(formData, "role").toLowerCase();

  if (!roomCode || !actorPlayerId || !playerId || !role) {
    throw new Error("بيانات غير مكتملة");
  }

  const allowedRoles = ["operative", "spymaster"];
  if (!allowedRoles.includes(role)) {
    throw new Error("دور غير صالح");
  }

  const { supabase, room, actor } = await getRoomAndActor({
    roomCode,
    actorPlayerId,
  });

  const { data: targetPlayer, error: targetPlayerError } = await supabase
    .from("codenames_players")
    .select("id, room_id, team, role")
    .eq("room_id", room.id)
    .eq("id", playerId)
    .maybeSingle();

  if (targetPlayerError || !targetPlayer) {
    throw new Error(targetPlayerError?.message || "اللاعب غير موجود");
  }

  const canManage = actor.is_host || actor.id === playerId;
  if (!canManage) {
    throw new Error("لا تملك صلاحية تعديل هذا اللاعب");
  }

  const target = targetPlayer as { team: string | null };
  if ((target.team ?? "spectator").toLowerCase() === "spectator") {
    throw new Error("المشاهد لا يمكن إعطاؤه دورًا قبل اختيار فريق");
  }

  if (role === "spymaster") {
    const { data: existingSpy } = await supabase
      .from("codenames_players")
      .select("id")
      .eq("room_id", room.id)
      .eq("team", target.team)
      .eq("role", "spymaster");

    const existingSpyId = (existingSpy ?? []).find((item) => item.id !== playerId)?.id;
    if (existingSpyId) {
      throw new Error("يوجد Spymaster لهذا الفريق بالفعل");
    }
  }

  const { error: updateError } = await supabase
    .from("codenames_players")
    .update({ role })
    .eq("id", playerId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}

export async function removePlayerFromRoom(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");
  const playerId = getString(formData, "player_id");

  if (!roomCode || !actorPlayerId || !playerId) {
    throw new Error("بيانات غير مكتملة");
  }

  const { supabase, room, actor } = await getRoomAndActor({
    roomCode,
    actorPlayerId,
  });

  if (!actor.is_host) {
    throw new Error("فقط منشئ الغرفة يستطيع حذف اللاعبين");
  }

  if (actor.id === playerId) {
    throw new Error("لا يمكنك حذف نفسك من الغرفة");
  }

  const { error: deleteError } = await supabase
    .from("codenames_players")
    .delete()
    .eq("room_id", room.id)
    .eq("id", playerId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}

export async function startCodenamesGame(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");

  if (!roomCode || !actorPlayerId) {
    throw new Error("بيانات غير مكتملة");
  }

  const { supabase, room, actor } = await getRoomAndActor({
    roomCode,
    actorPlayerId,
  });

  if (!actor.is_host) {
    throw new Error("فقط منشئ الغرفة يستطيع بدء اللعبة");
  }

  const { data: playersData, error: playersError } = await supabase
    .from("codenames_players")
    .select("id, team, role")
    .eq("room_id", room.id);

  if (playersError) {
    throw new Error(playersError.message);
  }

  const players = (playersData ?? []).map((player) => ({
    ...player,
    team: player.team?.toLowerCase() ?? null,
    role: player.role?.toLowerCase() ?? null,
  }));

  const bluePlayers = players.filter((player) => player.team === "blue");
  const orangePlayers = players.filter((player) => player.team === "red");
  const blueSpymasters = bluePlayers.filter((player) => player.role === "spymaster");
  const orangeSpymasters = orangePlayers.filter((player) => player.role === "spymaster");
  const blueOperatives = bluePlayers.filter((player) => player.role === "operative");
  const orangeOperatives = orangePlayers.filter((player) => player.role === "operative");

  if (
    blueOperatives.length < 1 ||
    orangeOperatives.length < 1 ||
    blueSpymasters.length !== 1 ||
    orangeSpymasters.length !== 1
  ) {
    throw new Error(
      "يجب أن يكون لكل فريق لاعب operative واحد على الأقل و Spymaster واحد فقط"
    );
  }

  const { data: wordsData, error: wordsError } = await supabase
    .from("codenames_word_bank")
    .select("word")
    .eq("is_active", true)
    .limit(500);

  if (wordsError) {
    throw new Error(wordsError.message);
  }

  const words = (wordsData ?? []) as WordRow[];
  const uniqueWords = Array.from(
    new Map(words.map((item) => [item.word, item])).values()
  );

  if (uniqueWords.length < 25) {
    throw new Error("يجب وجود 25 كلمة نشطة على الأقل");
  }

  const selectedWords = shuffleArray(uniqueWords).slice(0, 25);
  const startingTeam = Math.random() < 0.5 ? "red" : "blue";

  const cardTypes = shuffleArray<string>([
    ...(startingTeam === "red" ? Array(9).fill("red") : Array(8).fill("red")),
    ...(startingTeam === "blue" ? Array(9).fill("blue") : Array(8).fill("blue")),
    ...Array(7).fill("neutral"),
    "assassin",
  ]);

  await supabase.from("codenames_cards").delete().eq("room_id", room.id);
  await supabase.from("codenames_turns").delete().eq("room_id", room.id);

  const cardsToInsert = selectedWords.map((item, index) => ({
    room_id: room.id,
    position_index: index,
    word: item.word,
    card_type: cardTypes[index],
    is_revealed: false,
  }));

  const { error: insertCardsError } = await supabase
    .from("codenames_cards")
    .insert(cardsToInsert);

  if (insertCardsError) {
    throw new Error(insertCardsError.message);
  }

  const { error: roomUpdateError } = await supabase
    .from("codenames_rooms")
    .update({
      status: "active",
      starting_team: startingTeam,
      current_turn_team: startingTeam,
      red_remaining: startingTeam === "red" ? 9 : 8,
      blue_remaining: startingTeam === "blue" ? 9 : 8,
      winner_team: null,
      assassin_revealed: false,
    })
    .eq("id", room.id);

  if (roomUpdateError) {
    throw new Error(roomUpdateError.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
  revalidatePath(`/games/codenames/board/${roomCode}`);
}