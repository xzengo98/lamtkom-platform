import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CodenamesBoardClient from "@/components/codenames/codenames-board-client";
import {
  endCodenamesTurn,
  revealCodenamesCard,
  resetCodenamesGame,
  submitCodenamesClue,
} from "./actions";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ player_id?: string }>;
};

type PlayerLookupRow = {
  id: string;
};

export default async function CodenamesBoardPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await getSupabaseServerClient();
  const { code } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPlayerId = resolvedSearchParams?.player_id?.trim() || "";
  const roomCode = code.toUpperCase();

  const { data: roomData } = await supabase
    .from("codenames_rooms")
    .select(
      "id, room_code, status, current_turn_team, starting_team, red_remaining, blue_remaining, winner_team, assassin_revealed"
    )
    .eq("room_code", roomCode)
    .maybeSingle();

  if (!roomData) {
    notFound();
  }

  const { data: cardsData } = await supabase
    .from("codenames_cards")
    .select("id, room_id, position_index, word, card_type, is_revealed")
    .eq("room_id", roomData.id)
    .order("position_index", { ascending: true });

  const { data: playersData } = await supabase
    .from("codenames_players")
    .select("id, room_id, guest_name, team, role, is_host")
    .eq("room_id", roomData.id);

  const currentPlayer =
    ((playersData ?? []) as PlayerLookupRow[]).find(
      (player: PlayerLookupRow) => player.id === currentPlayerId
    ) || null;

  if (!currentPlayer) {
    notFound();
  }

  const { data: turnsData } = await supabase
    .from("codenames_turns")
    .select(
      "id, room_id, team, clue_word, clue_number, turn_status, guesses_made, created_at"
    )
    .eq("room_id", roomData.id)
    .order("created_at", { ascending: false });

  return (
    <CodenamesBoardClient
      initialRoom={roomData as never}
      initialCards={(cardsData ?? []) as never[]}
      initialPlayers={(playersData ?? []) as never[]}
      initialTurns={(turnsData ?? []) as never[]}
      currentPlayerId={currentPlayerId}
      submitClueAction={submitCodenamesClue}
      revealCardAction={revealCodenamesCard}
      endTurnAction={endCodenamesTurn}
      resetGameAction={resetCodenamesGame}
    />
  );
}