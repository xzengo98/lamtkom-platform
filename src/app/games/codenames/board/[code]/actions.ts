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
  status: string | null;
  current_turn_team: string | null;
  red_remaining: number | null;
  blue_remaining: number | null;
  winner_team: string | null;
};

type PlayerRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  team: string | null;
  role: string | null;
  is_host: boolean | null;
};

type CardRow = {
  id: string;
  room_id: string;
  position_index: number;
  word: string;
  card_type: string;
  is_revealed: boolean;
};

type TurnRow = {
  id: string;
  room_id: string;
  team: string | null;
  clue_word: string;
  clue_number: number;
  turn_status: string | null;
  guesses_made: number | null;
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
    .select("id, room_code, status, current_turn_team, red_remaining, blue_remaining, winner_team")
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
    throw new Error(actorError?.message || "اللاعب الحالي غير موجود");
  }

  const actor = actorData as PlayerRow;

  return { supabase, room, actor };
}

async function getActiveTurn(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>, roomId: string) {
  const { data, error } = await supabase
    .from("codenames_turns")
    .select("id, room_id, team, clue_word, clue_number, turn_status, guesses_made")
    .eq("room_id", roomId)
    .eq("turn_status", "active")
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as TurnRow | null) ?? null;
}

function oppositeTeam(team: string | null) {
  return team === "red" ? "blue" : "red";
}

export async function submitCodenamesClue(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");
  const clueWord = getString(formData, "clue_word");
  const clueNumber = getNumber(formData, "clue_number");

  if (!roomCode || !actorPlayerId) {
    throw new Error("بيانات غير مكتملة");
  }

  if (!clueWord) {
    throw new Error("الـ clue مطلوب");
  }

  if (clueNumber < 1) {
    throw new Error("عدد الكلمات يجب أن يكون 1 أو أكثر");
  }

  const { supabase, room, actor } = await getRoomAndActor({ roomCode, actorPlayerId });

  if (room.status !== "active") {
    throw new Error("اللعبة ليست نشطة");
  }

  if (actor.role !== "spymaster") {
    throw new Error("فقط الـ Spymaster يستطيع إرسال clue");
  }

  if (actor.team !== room.current_turn_team) {
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
      spymaster_player_id: actor.id,
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

export async function endCodenamesTurn(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");

  const { supabase, room, actor } = await getRoomAndActor({ roomCode, actorPlayerId });

  if (room.status !== "active") {
    throw new Error("اللعبة ليست نشطة");
  }

  if (actor.team !== room.current_turn_team) {
    throw new Error("ليس دور فريقك");
  }

  const activeTurn = await getActiveTurn(supabase, room.id);

  if (activeTurn) {
    const { error: closeTurnError } = await supabase
      .from("codenames_turns")
      .update({
        turn_status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("id", activeTurn.id);

    if (closeTurnError) {
      throw new Error(closeTurnError.message);
    }
  }

  const nextTeam = oppositeTeam(room.current_turn_team);

  const { error: roomUpdateError } = await supabase
    .from("codenames_rooms")
    .update({
      current_turn_team: nextTeam,
      updated_at: new Date().toISOString(),
    })
    .eq("id", room.id);

  if (roomUpdateError) {
    throw new Error(roomUpdateError.message);
  }

  revalidatePath(`/games/codenames/board/${roomCode}`);
}

export async function revealCodenamesCard(formData: FormData) {
  const roomCode = getString(formData, "room_code").toUpperCase();
  const actorPlayerId = getString(formData, "actor_player_id");
  const cardId = getString(formData, "card_id");

  if (!roomCode || !actorPlayerId || !cardId) {
    throw new Error("بيانات غير مكتملة");
  }

  const { supabase, room, actor } = await getRoomAndActor({ roomCode, actorPlayerId });

  if (room.status !== "active") {
    throw new Error("اللعبة ليست نشطة");
  }

  if (actor.role !== "operative") {
    throw new Error("فقط الـ Operative يستطيع كشف الكروت");
  }

  if (actor.team !== room.current_turn_team) {
    throw new Error("ليس دور فريقك");
  }

  const activeTurn = await getActiveTurn(supabase, room.id);

  if (!activeTurn) {
    throw new Error("يجب إرسال clue أولًا");
  }

  const { data: cardData, error: cardError } = await supabase
    .from("codenames_cards")
    .select("id, room_id, position_index, word, card_type, is_revealed")
    .eq("id", cardId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (cardError || !cardData) {
    throw new Error(cardError?.message || "الكرت غير موجود");
  }

  const card = cardData as CardRow;

  if (card.is_revealed) {
    return;
  }

  const { error: revealError } = await supabase
    .from("codenames_cards")
    .update({
      is_revealed: true,
      revealed_by_player_id: actor.id,
      revealed_at: new Date().toISOString(),
    })
    .eq("id", card.id);

  if (revealError) {
    throw new Error(revealError.message);
  }

  const nextGuessesMade = (activeTurn.guesses_made ?? 0) + 1;

  const { error: updateTurnError } = await supabase
    .from("codenames_turns")
    .update({
      guesses_made: nextGuessesMade,
    })
    .eq("id", activeTurn.id);

  if (updateTurnError) {
    throw new Error(updateTurnError.message);
  }

  const currentTeam = room.current_turn_team;
  const nextTeam = oppositeTeam(currentTeam);

  let redRemaining = room.red_remaining ?? 0;
  let blueRemaining = room.blue_remaining ?? 0;
  let roomStatus = room.status;
  let winnerTeam = room.winner_team;
  let assassinRevealed = false;
  let shouldEndTurn = false;

  if (card.card_type === "red") {
    redRemaining -= 1;
    if (redRemaining <= 0) {
      redRemaining = 0;
      roomStatus = "finished";
      winnerTeam = "red";
    }
    if (currentTeam !== "red") {
      shouldEndTurn = true;
    }
  } else if (card.card_type === "blue") {
    blueRemaining -= 1;
    if (blueRemaining <= 0) {
      blueRemaining = 0;
      roomStatus = "finished";
      winnerTeam = "blue";
    }
    if (currentTeam !== "blue") {
      shouldEndTurn = true;
    }
  } else if (card.card_type === "neutral") {
    shouldEndTurn = true;
  } else if (card.card_type === "assassin") {
    assassinRevealed = true;
    roomStatus = "finished";
    winnerTeam = nextTeam;
    shouldEndTurn = true;
  }

  if (roomStatus === "finished") {
    const { error: finishRoomError } = await supabase
      .from("codenames_rooms")
      .update({
        status: roomStatus,
        winner_team: winnerTeam,
        red_remaining: redRemaining,
        blue_remaining: blueRemaining,
        assassin_revealed: assassinRevealed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", room.id);

    if (finishRoomError) {
      throw new Error(finishRoomError.message);
    }

    const { error: closeTurnError } = await supabase
      .from("codenames_turns")
      .update({
        turn_status: "ended",
        ended_at: new Date().toISOString(),
        guesses_made: nextGuessesMade,
      })
      .eq("id", activeTurn.id);

    if (closeTurnError) {
      throw new Error(closeTurnError.message);
    }

    revalidatePath(`/games/codenames/board/${roomCode}`);
    return;
  }

  if (shouldEndTurn) {
    const { error: closeTurnError } = await supabase
      .from("codenames_turns")
      .update({
        turn_status: "ended",
        ended_at: new Date().toISOString(),
        guesses_made: nextGuessesMade,
      })
      .eq("id", activeTurn.id);

    if (closeTurnError) {
      throw new Error(closeTurnError.message);
    }

    const { error: roomUpdateError } = await supabase
      .from("codenames_rooms")
      .update({
        current_turn_team: nextTeam,
        red_remaining: redRemaining,
        blue_remaining: blueRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq("id", room.id);

    if (roomUpdateError) {
      throw new Error(roomUpdateError.message);
    }
  } else {
    const { error: roomUpdateError } = await supabase
      .from("codenames_rooms")
      .update({
        red_remaining: redRemaining,
        blue_remaining: blueRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq("id", room.id);

    if (roomUpdateError) {
      throw new Error(roomUpdateError.message);
    }
  }

  revalidatePath(`/games/codenames/board/${roomCode}`);
}