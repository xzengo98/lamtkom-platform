import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CodenamesBoardClient from "@/components/codenames/codenames-board-client";
import { submitCodenamesClue } from "./actions";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ name?: string }>;
};

export default async function CodenamesBoardPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await getSupabaseServerClient();
  const { code } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentName = resolvedSearchParams?.name?.trim() || "";
  const roomCode = code.toUpperCase();

  const { data: roomData } = await supabase
    .from("codenames_rooms")
    .select(
      "id, room_code, status, current_turn_team, starting_team, red_remaining, blue_remaining"
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

  const { data: turnsData } = await supabase
    .from("codenames_turns")
    .select(
      "id, room_id, team, clue_word, clue_number, turn_status, guesses_made, created_at"
    )
    .eq("room_id", roomData.id)
    .order("created_at", { ascending: false });

  async function boardFormAction(formData: FormData) {
    "use server";

    const intent = formData.get("intent");

    if (intent === "submit-clue") {
      await submitCodenamesClue(formData);
      return;
    }
  }

  return (
    <form action={boardFormAction}>
      <CodenamesBoardClient
        initialRoom={roomData}
        initialCards={(cardsData ?? []) as never[]}
        initialPlayers={(playersData ?? []) as never[]}
        initialTurns={(turnsData ?? []) as never[]}
        currentName={currentName}
      />
    </form>
  );
}