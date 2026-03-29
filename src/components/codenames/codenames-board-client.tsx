"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
  current_turn_team: string | null;
  starting_team: string | null;
  red_remaining: number | null;
  blue_remaining: number | null;
  winner_team?: string | null;
  assassin_revealed?: boolean | null;
};

type CardRow = {
  id: string;
  room_id: string;
  position_index: number;
  word: string;
  card_type: string;
  is_revealed: boolean;
};

type PlayerRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  team: string | null;
  role: string | null;
  is_host: boolean | null;
};

type TurnRow = {
  id: string;
  room_id: string;
  team: string | null;
  clue_word: string;
  clue_number: number;
  turn_status: string | null;
  guesses_made: number | null;
  created_at?: string | null;
};

type RealtimePayload<T> = {
  new: T | null;
  old: T | null;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

type Props = {
  initialRoom: RoomRow;
  initialCards: CardRow[];
  initialPlayers: PlayerRow[];
  initialTurns: TurnRow[];
  currentPlayerId: string;
  submitClueAction: ServerAction;
  revealCardAction: ServerAction;
  endTurnAction: ServerAction;
};

export default function CodenamesBoardClient({
  initialRoom,
  initialCards,
  initialPlayers,
  initialTurns,
  currentPlayerId,
  submitClueAction,
  revealCardAction,
  endTurnAction,
}: Props) {
  const [room, setRoom] = useState<RoomRow>(initialRoom);
  const [cards, setCards] = useState<CardRow[]>(initialCards);
  const [players, setPlayers] = useState<PlayerRow[]>(initialPlayers);
  const [turns, setTurns] = useState<TurnRow[]>(initialTurns);

  const currentPlayer = useMemo(
    () => players.find((player) => player.id === currentPlayerId) || null,
    [players, currentPlayerId]
  );

  const activeTurn = useMemo(
    () => turns.find((turn) => turn.turn_status === "active") || null,
    [turns]
  );

  if (!currentPlayer) {
    return null;
  }

  const isSpymaster = currentPlayer.role === "spymaster";
  const isOperative = currentPlayer.role === "operative";
  const isCurrentTeam = currentPlayer.team === room.current_turn_team;
  const canSubmitClue = Boolean(
    isSpymaster && isCurrentTeam && room.status === "active"
  );
  const canRevealCard = Boolean(
    isOperative && isCurrentTeam && activeTurn && room.status === "active"
  );
  const canEndTurn = Boolean(isCurrentTeam && room.status === "active");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const roomChannel = supabase
      .channel(`board-room-${room.room_code}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "codenames_rooms",
          filter: `room_code=eq.${room.room_code}`,
        },
        (payload: RealtimePayload<RoomRow>) => {
          if (payload.new) setRoom(payload.new);
        }
      )
      .subscribe();

    const cardsChannel = supabase
      .channel(`board-cards-${room.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "codenames_cards",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("codenames_cards")
            .select("id, room_id, position_index, word, card_type, is_revealed")
            .eq("room_id", room.id)
            .order("position_index", { ascending: true });

          setCards((data ?? []) as CardRow[]);
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`board-players-${room.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "codenames_players",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("codenames_players")
            .select("id, room_id, guest_name, team, role, is_host")
            .eq("room_id", room.id);

          setPlayers((data ?? []) as PlayerRow[]);
        }
      )
      .subscribe();

    const turnsChannel = supabase
      .channel(`board-turns-${room.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "codenames_turns",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("codenames_turns")
            .select(
              "id, room_id, team, clue_word, clue_number, turn_status, guesses_made, created_at"
            )
            .eq("room_id", room.id)
            .order("created_at", { ascending: false });

          setTurns((data ?? []) as TurnRow[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(turnsChannel);
    };
  }, [room.id, room.room_code]);

  function getCardClasses(card: CardRow) {
    const showSpymasterColor = isSpymaster && !card.is_revealed;

    if (card.is_revealed) {
      if (card.card_type === "red") {
        return "rounded-[22px] border border-red-400/30 bg-[#ef5b47] text-white shadow-[inset_0_-6px_0_rgba(120,0,0,0.25)]";
      }
      if (card.card_type === "blue") {
        return "rounded-[22px] border border-cyan-300/30 bg-[#20a8e0] text-white shadow-[inset_0_-6px_0_rgba(0,60,120,0.25)]";
      }
      if (card.card_type === "assassin") {
        return "rounded-[22px] border border-white/10 bg-[#3b3b3b] text-white shadow-[inset_0_-6px_0_rgba(0,0,0,0.35)]";
      }
      return "rounded-[22px] border border-[#d8c1a8]/30 bg-[#e6c8a9] text-[#6f553e] shadow-[inset_0_-6px_0_rgba(110,80,40,0.18)]";
    }

    if (showSpymasterColor) {
      if (card.card_type === "red") {
        return "rounded-[22px] border border-red-400/30 bg-red-500/25 text-white";
      }
      if (card.card_type === "blue") {
        return "rounded-[22px] border border-cyan-300/30 bg-cyan-500/25 text-white";
      }
      if (card.card_type === "assassin") {
        return "rounded-[22px] border border-white/10 bg-black/70 text-white";
      }
      return "rounded-[22px] border border-[#d8c1a8]/30 bg-[#e6c8a9]/80 text-[#6f553e]";
    }

    return "rounded-[22px] border border-[#d8c1a8]/30 bg-[#e6c8a9] text-[#6f553e] shadow-[inset_0_-6px_0_rgba(110,80,40,0.18)] hover:brightness-95";
  }

  function SidePanel({
    title,
    players,
    theme,
  }: {
    title: string;
    players: PlayerRow[];
    theme: "blue" | "red";
  }) {
    const wrapper =
      theme === "blue"
        ? "rounded-[28px] border border-cyan-300/25 bg-cyan-500/10 p-4"
        : "rounded-[28px] border border-red-300/25 bg-red-500/10 p-4";

    return (
      <div className={wrapper}>
        <div className="text-center text-sm font-black uppercase tracking-wide text-white/70">
          {title}
        </div>
        <div className="mt-4 space-y-3">
          {players.length > 0 ? (
            players.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <div className="text-center text-lg font-black text-white">
                  {player.guest_name}
                </div>
                <div className="mt-1 text-center text-xs font-semibold text-white/60">
                  {player.role}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center text-sm text-white/50">
              لا يوجد لاعبون
            </div>
          )}
        </div>
      </div>
    );
  }

  const bluePlayers = players.filter((player) => player.team === "blue");
  const redPlayers = players.filter((player) => player.team === "red");

  return (
    <div className="mx-auto max-w-[1500px] p-3 md:p-5">
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <SidePanel title="Blue Team" players={bluePlayers} theme="blue" />
        </div>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-white/10 bg-[#101522] px-5 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black uppercase tracking-wide text-white">
              {room.status === "finished"
                ? "Game Finished"
                : activeTurn
                ? "Give your operatives a clue"
                : room.current_turn_team === "blue"
                ? "Blue Team Turn"
                : "Red Team Turn"}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-100">
                Blue: {room.blue_remaining ?? 0}
              </div>
              <div className="rounded-full border border-red-300/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100">
                Red: {room.red_remaining ?? 0}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75">
                Turn: {room.current_turn_team || "-"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {cards.map((card) => {
              const classes = getCardClasses(card);

              if (canRevealCard && !card.is_revealed) {
                return (
                  <form key={card.id} action={revealCardAction}>
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                    <input type="hidden" name="card_id" value={card.id} />
                    <button
                      type="submit"
                      className={`${classes} flex min-h-[98px] w-full items-center justify-center px-2 py-4 text-center text-xl font-black uppercase tracking-wide transition md:min-h-[122px] md:text-2xl`}
                    >
                      {card.word}
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={card.id}
                  className={`${classes} flex min-h-[98px] items-center justify-center px-2 py-4 text-center text-xl font-black uppercase tracking-wide md:min-h-[122px] md:text-2xl`}
                >
                  {card.word}
                </div>
              );
            })}
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#101522] p-4 shadow-2xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white/60">آخر clue</div>
                  {activeTurn ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-xl font-black text-white">
                        {activeTurn.clue_word}
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-xl font-black text-white">
                        {activeTurn.clue_number}
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white/70">
                        Guesses: {activeTurn.guesses_made ?? 0}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-white/50">لا يوجد clue حتى الآن</div>
                  )}
                </div>

                {canSubmitClue ? (
                  <form action={submitClueAction} className="space-y-3">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={currentPlayer.id} />

                    <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                      <input
                        name="clue_word"
                        placeholder="YOUR CLUE"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg font-bold uppercase text-white outline-none placeholder:text-white/35"
                      />
                      <input
                        type="number"
                        name="clue_number"
                        min={1}
                        defaultValue={1}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-lg font-black text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-white hover:bg-emerald-400"
                      >
                        Send Clue
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-white/55">
                    فقط Spymaster الخاص بالفريق الذي عليه الدور يستطيع إرسال clue
                  </div>
                )}
              </div>

              <div className="flex items-end">
                {canEndTurn && (
                  <form action={endTurnAction}>
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black text-white hover:bg-orange-400"
                    >
                      إنهاء الدور
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SidePanel title="Red Team" players={redPlayers} theme="red" />
        </div>
      </div>
    </div>
  );
}