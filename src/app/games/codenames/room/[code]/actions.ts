"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RoomLookupRow = {
  id: string;
  room_code: string;
  status: string | null;
};

type ActorRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  is_host: boolean | null;
};

type TargetPlayerRow = {
  id: string;
  room_id: string;
};

type BasicPlayerRow = {
  id: string;
  team: string | null;
  role: string | null;
};

type WordBankRow = {
  word: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

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

  const room = roomData as RoomLookupRow;

  const { data: actorData, error: actorError } = await supabase
    .from("codenames_players")
    .select("id, room_id, guest_name, is_host")
    .eq("room_id", room.id)
    .eq("id", actorPlayerId)
    .maybeSingle();

  if (actorError || !actorData) {
    throw new Error(actorError?.message || "اللاعب الحالي غير موجود");
  }

  const actor = actorData as ActorRow;

  return { supabase, room, actor };
}

export async function updatePlayerTeam(formData: FormData) {
  const playerId = getString(formData, "player_id");
  const roomCode = getString(formData, "room_code").toUpperCase();
  const team = getString(formData, "team").toLowerCase();
  const actorPlayerId = getString(formData, "actor_player_id");

  if (!playerId || !roomCode || !actorPlayerId) return;
  if (!["red", "blue", "spectator"].includes(team)) return;

  const { supabase, room, actor } = await getRoomAndActor({
    roomCode,
    actorPlayerId,
  });

  const { data: targetData, error: targetError } = await supabase
    .from("codenames_players")
    .select("id, room_id")
    .eq("id", playerId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (targetError || !targetData) {
    throw new Error(targetError?.message || "اللاعب الهدف غير موجود");
  }

  const targetPlayer = targetData as TargetPlayerRow;

  const canManage = Boolean(actor.is_host) || actor.id === targetPlayer.id;
  if (!canManage) {
    throw new Error("غير مسموح لك تعديل هذا اللاعب");
  }

  const updatePayload =
    team === "spectator"
      ? { team: "spectator", role: "spectator" }
      : { team, role: "operative" };

  const { error } = await supabase
    .from("codenames_players")
    .update(updatePayload)
    .eq("id", targetPlayer.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}

export async function updatePlayerRole(formData: FormData) {
  const playerId = getString(formData, "player_id");
  const roomCode = getString(formData, "room_code").toUpperCase();
  const role = getString(formData, "role").toLowerCase();
  const actorPlayerId = getString(formData, "actor_player_id");

  if (!playerId || !roomCode || !actorPlayerId) return;
  if (!["spymaster", "operative"].includes(role)) return;

  const { supabase, room, actor } = await getRoomAndActor({
    roomCode,
    actorPlayerId,
  });

  const { data: targetData, error: targetError } = await supabase
    .from("codenames_players")
    .select("id, room_id, team")
    .eq("id", playerId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (targetError || !targetData) {
    throw new Error(targetError?.message || "اللاعب الهدف غير موجود");
  }

  const targetPlayer = targetData as TargetPlayerRow & { team?: string | null };

  const canManage = Boolean(actor.is_host) || actor.id === targetPlayer.id;
  if (!canManage) {
    throw new Error("غير مسموح لك تعديل هذا اللاعب");
  }

  if (targetPlayer.team === "spectator") {
    throw new Error("المشاهد لا يمكن إعطاؤه دورًا قبل نقله إلى فريق");
  }

  const { error } = await supabase
    .from("codenames_players")
    .update({ role })
    .eq("id", targetPlayer.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/games/codenames/room/${roomCode}`);
}

function shuffleArray<T>(items: T[]) {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export async function startCodenamesGame(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");

  try {
    if (!roomCode || !actorPlayerId) {
      throw new Error("بيانات الغرفة غير مكتملة");
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

    const allPlayers = (playersData ?? []) as BasicPlayerRow[];
    const activePlayers = allPlayers.filter((player) => player.team !== "spectator");

    const redPlayers = activePlayers.filter((player) => player.team === "red");
    const bluePlayers = activePlayers.filter((player) => player.team === "blue");
    const redSpymasters = redPlayers.filter((player) => player.role === "spymaster");
    const blueSpymasters = bluePlayers.filter((player) => player.role === "spymaster");

    if (redPlayers.length === 0 || bluePlayers.length === 0) {
      throw new Error("يجب وجود لاعب واحد على الأقل في كل فريق");
    }

    if (redSpymasters.length !== 1 || blueSpymasters.length !== 1) {
      throw new Error("يجب أن يكون لكل فريق Spymaster واحد فقط");
    }

    const { data: wordsData, error: wordsError } = await supabase
      .from("codenames_word_bank")
      .select("word")
      .eq("is_active", true)
      .limit(500);

    if (wordsError) {
      throw new Error(wordsError.message);
    }

    const words = (wordsData ?? []) as WordBankRow[];

    const uniqueWords = Array.from(
      new Map<string, WordBankRow>(words.map((item) => [item.word, item])).values()
    );

    if (uniqueWords.length < 25) {
      throw new Error("تحتاج على الأقل 25 كلمة نشطة لبدء اللعبة");
    }

    const selectedWords = shuffleArray(uniqueWords).slice(0, 25);
    const startingTeam = Math.random() < 0.5 ? "red" : "blue";

    const cardTypes = shuffleArray<string>([
      ...(startingTeam === "red" ? Array(9).fill("red") : Array(8).fill("red")),
      ...(startingTeam === "blue" ? Array(9).fill("blue") : Array(8).fill("blue")),
      ...Array(7).fill("neutral"),
      "assassin",
    ]);

    const cardsToInsert = selectedWords.map((item, index) => ({
      room_id: room.id,
      position_index: index,
      word: item.word,
      card_type: cardTypes[index],
      is_revealed: false,
    }));

    const { error: deleteOldCardsError } = await supabase
      .from("codenames_cards")
      .delete()
      .eq("room_id", room.id);

    if (deleteOldCardsError) {
      throw new Error(deleteOldCardsError.message);
    }

    const { error: insertCardsError } = await supabase
      .from("codenames_cards")
      .insert(cardsToInsert);

    if (insertCardsError) {
      throw new Error(insertCardsError.message);
    }

    const { error: deleteTurnsError } = await supabase
      .from("codenames_turns")
      .delete()
      .eq("room_id", room.id);

    if (deleteTurnsError) {
      throw new Error(deleteTurnsError.message);
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
    redirect(`/games/codenames/board/${roomCode}?player_id=${actor.id}`);
  } catch (error: any) {
    console.error("START GAME ERROR:", error);

    redirect(
      `/games/codenames/room/${roomCode}?player_id=${actorPlayerId}&error=${encodeURIComponent(
        error?.message || "unknown error"
      )}`
    );
  }
}