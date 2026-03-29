"use client";

import Link from "next/link";
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

type PreviewSelection = {
  playerId: string;
  playerName: string;
  cardId: string;
  word: string;
  team: string | null;
} | null;

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
  const [selectedCard, setSelectedCard] = useState<CardRow | null>(null);
  const [previewSelection, setPreviewSelection] = useState<PreviewSelection>(null);
  const [inspectedCard, setInspectedCard] = useState<CardRow | null>(null);

  const currentPlayer = useMemo(
    () => players.find((player) => player.id === currentPlayerId) || null,
    [players, currentPlayerId]
  );

  const activeTurn = useMemo(
    () => turns.find((turn) => turn.turn_status === "active") || null,
    [turns]
  );

  const sortedTurns = useMemo(() => {
    return [...turns].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [turns]);

  if (!currentPlayer) {
    return null;
  }

  const safeCurrentPlayer = currentPlayer as PlayerRow;
  const isSpymaster = safeCurrentPlayer.role === "spymaster";
  const isOperative = safeCurrentPlayer.role === "operative";
  const isCurrentTeam = safeCurrentPlayer.team === room.current_turn_team;
  const canSubmitClue = Boolean(
    isSpymaster && isCurrentTeam && room.status === "active" && !activeTurn
  );
  const canRevealCard = Boolean(
    isOperative && isCurrentTeam && activeTurn && room.status === "active"
  );
  const canEndTurn = Boolean(isCurrentTeam && room.status === "active" && activeTurn);

  const bluePlayers = players.filter((player) => player.team === "blue");
  const redPlayers = players.filter((player) => player.team === "red");
  const spectators = players.filter((player) => player.team === "spectator");

  const blueOperatives = bluePlayers.filter((player) => player.role === "operative");
  const blueSpymasters = bluePlayers.filter((player) => player.role === "spymaster");
  const redOperatives = redPlayers.filter((player) => player.role === "operative");
  const redSpymasters = redPlayers.filter((player) => player.role === "spymaster");

  async function fetchLatestState() {
    const supabase = getSupabaseBrowserClient();

    const [roomRes, cardsRes, playersRes, turnsRes] = await Promise.all([
      supabase
        .from("codenames_rooms")
        .select(
          "id, room_code, status, current_turn_team, starting_team, red_remaining, blue_remaining, winner_team, assassin_revealed"
        )
        .eq("id", room.id)
        .maybeSingle(),
      supabase
        .from("codenames_cards")
        .select("id, room_id, position_index, word, card_type, is_revealed")
        .eq("room_id", room.id)
        .order("position_index", { ascending: true }),
      supabase
        .from("codenames_players")
        .select("id, room_id, guest_name, team, role, is_host")
        .eq("room_id", room.id),
      supabase
        .from("codenames_turns")
        .select(
          "id, room_id, team, clue_word, clue_number, turn_status, guesses_made, created_at"
        )
        .eq("room_id", room.id)
        .order("created_at", { ascending: false }),
    ]);

    if (roomRes.data) setRoom(roomRes.data as RoomRow);
    if (cardsRes.data) setCards(cardsRes.data as CardRow[]);
    if (playersRes.data) setPlayers(playersRes.data as PlayerRow[]);
    if (turnsRes.data) setTurns(turnsRes.data as TurnRow[]);
  }

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseBrowserClient();
    const previewChannel = supabase.channel(`codenames-preview-${room.room_code}`);

    const safeRefresh = async () => {
      if (!isMounted) return;
      await fetchLatestState();
    };

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
        async (_payload: RealtimePayload<RoomRow>) => {
          await safeRefresh();
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
          await safeRefresh();
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
          await safeRefresh();
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
          await safeRefresh();
        }
      )
      .subscribe();

    previewChannel
      .on("broadcast", { event: "preview-selection" }, ({ payload }: { payload: PreviewSelection }) => {
        setPreviewSelection(payload);
      })
      .on("broadcast", { event: "clear-preview" }, () => {
        setPreviewSelection(null);
      })
      .subscribe();

    const interval = setInterval(() => {
      safeRefresh();
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(turnsChannel);
      supabase.removeChannel(previewChannel);
    };
  }, [room.id, room.room_code]);

  async function sendPreview(card: CardRow | null) {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`codenames-preview-${room.room_code}`);

    if (!card) {
      await channel.send({
        type: "broadcast",
        event: "clear-preview",
        payload: {},
      });
      return;
    }

    await channel.send({
      type: "broadcast",
      event: "preview-selection",
      payload: {
        playerId: safeCurrentPlayer.id,
        playerName: safeCurrentPlayer.guest_name || "لاعب",
        cardId: card.id,
        word: card.word,
        team: safeCurrentPlayer.team,
      } satisfies PreviewSelection,
    });
  }

  useEffect(() => {
    if (!selectedCard) return;
    const stillExists = cards.find((card) => card.id === selectedCard.id);
    if (!stillExists || stillExists.is_revealed) {
      setSelectedCard(null);
      setPreviewSelection(null);
    }
  }, [cards, selectedCard]);

  function getCardClasses(card: CardRow) {
    const isPending = selectedCard?.id === card.id;
    const showSpymasterColor = isSpymaster && !card.is_revealed;

    if (card.is_revealed) {
      if (card.card_type === "red") {
        return "rounded-[24px] border border-red-300/30 bg-[#ef5b47] text-white shadow-[inset_0_-8px_0_rgba(120,0,0,0.22)]";
      }
      if (card.card_type === "blue") {
        return "rounded-[24px] border border-cyan-300/30 bg-[#1da7e6] text-white shadow-[inset_0_-8px_0_rgba(0,60,120,0.22)]";
      }
      if (card.card_type === "assassin") {
        return "rounded-[24px] border border-white/10 bg-[#3b3b3b] text-white shadow-[inset_0_-8px_0_rgba(0,0,0,0.35)]";
      }
      return "rounded-[24px] border border-[#d8c1a8]/30 bg-[#e7c8a9] text-[#6d533d] shadow-[inset_0_-8px_0_rgba(110,80,40,0.15)]";
    }

    if (showSpymasterColor) {
      if (card.card_type === "red") {
        return `rounded-[24px] border ${
          isPending ? "border-lime-300" : "border-red-300/30"
        } bg-red-500/20 text-white`;
      }
      if (card.card_type === "blue") {
        return `rounded-[24px] border ${
          isPending ? "border-lime-300" : "border-cyan-300/30"
        } bg-cyan-500/20 text-white`;
      }
      if (card.card_type === "assassin") {
        return `rounded-[24px] border ${
          isPending ? "border-lime-300" : "border-white/10"
        } bg-black/70 text-white`;
      }
      return `rounded-[24px] border ${
        isPending ? "border-lime-300" : "border-[#d8c1a8]/30"
      } bg-[#e7c8a9]/85 text-[#6d533d]`;
    }

    return `rounded-[24px] border ${
      isPending ? "border-lime-300" : "border-[#d8c1a8]/35"
    } bg-[#e7c8a9] text-[#6d533d] shadow-[inset_0_-8px_0_rgba(110,80,40,0.15)] hover:brightness-95`;
  }

  function SideTeam({
    theme,
    operatives,
    spymasters,
    remaining,
  }: {
    theme: "blue" | "red";
    operatives: PlayerRow[];
    spymasters: PlayerRow[];
    remaining: number | null;
  }) {
    const wrapper =
      theme === "blue"
        ? "rounded-[28px] border border-cyan-300/25 bg-cyan-500/10 p-4"
        : "rounded-[28px] border border-red-300/25 bg-red-500/10 p-4";

    return (
      <div className="space-y-4">
        <div
          className={`rounded-[28px] border border-white/10 bg-black/20 px-4 py-3 text-center text-sm font-black uppercase tracking-wide ${
            theme === "blue" ? "text-cyan-100" : "text-red-100"
          }`}
        >
          {theme === "blue" ? "Blue Team" : "Red Team"}
        </div>

        <div className={wrapper}>
          <div className="text-center text-sm font-black uppercase tracking-wide text-white/70">
            Operatives
          </div>
          <div className="mt-3 space-y-3">
            {operatives.length > 0 ? (
              operatives.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="text-center text-lg font-black text-white">
                    {player.guest_name}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center text-sm text-white/45">
                لا يوجد
              </div>
            )}
          </div>
        </div>

        <div className={wrapper}>
          <div className="text-center text-sm font-black uppercase tracking-wide text-white/70">
            Spymasters
          </div>
          <div className="mt-3 space-y-3">
            {spymasters.length > 0 ? (
              spymasters.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="text-center text-lg font-black text-white">
                    {player.guest_name}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center text-sm text-white/45">
                لا يوجد
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/25 px-4 py-5 text-center">
          <div className="text-sm font-semibold text-white/55">Cards Remaining</div>
          <div
            className={`mt-2 text-5xl font-black ${
              theme === "blue" ? "text-cyan-100" : "text-red-100"
            }`}
          >
            {remaining ?? 0}
          </div>
        </div>
      </div>
    );
  }

  const finished = room.status === "finished";
  const winnerLabel =
    room.winner_team === "blue"
      ? "الفريق الأزرق"
      : room.winner_team === "red"
      ? "الفريق الأحمر"
      : "لا يوجد";

  return (
    <div className="mx-auto max-w-[1600px] p-3 md:p-5">
      <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_230px]">
        <div className="space-y-4">
          <SideTeam
            theme="blue"
            operatives={blueOperatives}
            spymasters={blueSpymasters}
            remaining={room.blue_remaining}
          />

          {spectators.length > 0 && (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-center text-sm font-black uppercase tracking-wide text-white/70">
                Spectators
              </div>
              <div className="space-y-3">
                {spectators.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center text-sm font-bold text-white"
                  >
                    {player.guest_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-white/10 bg-[#101522] px-5 py-4 shadow-2xl">
            <div className="text-center text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
              {finished
                ? room.assassin_revealed
                  ? "Assassin was revealed"
                  : "Game Finished"
                : selectedCard
                ? "Confirm your choice"
                : previewSelection
                ? `${previewSelection.playerName} يفكر في ${previewSelection.word}`
                : activeTurn
                ? "Give your operatives a clue"
                : room.current_turn_team === "blue"
                ? "Blue Team Turn"
                : "Red Team Turn"}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-100">
                BLUE {room.blue_remaining ?? 0}
              </div>
              <div className="rounded-full border border-red-300/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100">
                RED {room.red_remaining ?? 0}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75">
                TURN: {room.current_turn_team || "-"}
              </div>
              {activeTurn && (
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white">
                  CLUE: {activeTurn.clue_word} • {activeTurn.clue_number} • USED{" "}
                  {activeTurn.guesses_made ?? 0}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {cards.map((card) => {
              const classes = getCardClasses(card);

              if (card.is_revealed) {
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setInspectedCard(card)}
                    className={`${classes} flex min-h-[98px] items-center justify-center px-2 py-4 text-center text-xl font-black uppercase tracking-wide md:min-h-[122px] md:text-2xl`}
                  >
                    تم الكشف
                  </button>
                );
              }

              if (canRevealCard) {
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={async () => {
                      setSelectedCard(card);
                      await sendPreview(card);
                    }}
                    className={`${classes} flex min-h-[98px] items-center justify-center px-2 py-4 text-center text-xl font-black uppercase tracking-wide transition md:min-h-[122px] md:text-2xl`}
                  >
                    {card.word}
                  </button>
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

          {selectedCard && canRevealCard && !finished && (
            <div className="rounded-[30px] border border-lime-300/25 bg-lime-500/10 p-4 shadow-xl">
              <div className="mb-3 text-center text-sm font-black uppercase tracking-widest text-lime-100">
                Tap to confirm
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center text-2xl font-black text-white">
                  {selectedCard.word}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setSelectedCard(null);
                    await sendPreview(null);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-black text-white hover:bg-white/10"
                >
                  إلغاء
                </button>

                <form
                  action={revealCardAction}
                  onSubmit={async () => {
                    setSelectedCard(null);
                    await sendPreview(null);
                  }}
                >
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                  <input type="hidden" name="card_id" value={selectedCard.id} />
                  <button
                    type="submit"
                    className="rounded-2xl bg-lime-500 px-6 py-4 font-black text-white hover:bg-lime-400"
                  >
                    تأكيد الاختيار
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="rounded-[30px] border border-white/10 bg-[#101522] p-4 shadow-2xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_190px]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white/60">آخر clue</div>
                  {activeTurn ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-2xl font-black text-white">
                        {activeTurn.clue_word}
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-2xl font-black text-white">
                        {activeTurn.clue_number}
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white/70">
                        Used: {activeTurn.guesses_made ?? 0}
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white/70">
                        Max: {(activeTurn.clue_number ?? 0) + 1}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-white/45">لا يوجد clue حتى الآن</div>
                  )}
                </div>

                {canSubmitClue ? (
                  <form action={submitClueAction} className="space-y-3">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />

                    <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                      <input
                        name="clue_word"
                        placeholder="YOUR CLUE"
                        className="rounded-2xl border border-white/10 bg-white px-5 py-4 text-right text-2xl font-black text-black outline-none placeholder:text-black/30"
                      />
                      <input
                        type="number"
                        name="clue_number"
                        min={1}
                        defaultValue={1}
                        className="rounded-2xl border border-white/10 bg-white px-5 py-4 text-center text-2xl font-black text-black outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-xl font-black text-white hover:bg-emerald-400"
                    >
                      إرسال الـ clue
                    </button>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-white/55">
                    {activeTurn
                      ? "تم إرسال clue بالفعل، الآن دور الـ operatives"
                      : "فقط Spymaster الخاص بالفريق الذي عليه الدور يستطيع إرسال clue"}
                  </div>
                )}
              </div>

              <div className="flex items-end">
                {canEndTurn && (
                  <form action={endTurnAction} className="w-full">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-xl font-black text-white hover:bg-orange-400"
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
          <SideTeam
            theme="red"
            operatives={redOperatives}
            spymasters={redSpymasters}
            remaining={room.red_remaining}
          />

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-black text-white">Game Log</div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/60">
                Live
              </div>
            </div>

            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {previewSelection && (
                <div className="rounded-2xl border border-lime-300/20 bg-lime-500/10 p-3">
                  <div className="text-xs font-black uppercase text-lime-100">Preview</div>
                  <div className="mt-2 text-base font-black text-white">
                    {previewSelection.playerName} حدّد: {previewSelection.word}
                  </div>
                </div>
              )}

              {sortedTurns.length > 0 ? (
                sortedTurns.map((turn, index) => (
                  <div
                    key={turn.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                          turn.team === "blue"
                            ? "bg-cyan-500/15 text-cyan-100"
                            : "bg-red-500/15 text-red-100"
                        }`}
                      >
                        {turn.team}
                      </div>
                      <div className="text-xs font-semibold text-white/40">
                        #{sortedTurns.length - index}
                      </div>
                    </div>

                    <div className="mt-3 text-lg font-black text-white">
                      {turn.clue_word} • {turn.clue_number}
                    </div>

                    <div className="mt-1 text-xs font-semibold text-white/45">
                      guesses: {turn.guesses_made ?? 0} • {turn.turn_status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
                  لا يوجد سجل بعد
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {inspectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#101522] p-6 shadow-2xl">
            <div className="text-2xl font-black text-white">تفاصيل الكرت</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/50">الكلمة</div>
              <div className="mt-2 text-3xl font-black text-white">
                {inspectedCard.word}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/50">النوع</div>
              <div className="mt-2 text-xl font-black text-white">
                {inspectedCard.card_type}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInspectedCard(null)}
              className="mt-5 w-full rounded-2xl bg-white/10 px-5 py-3 font-black text-white hover:bg-white/15"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-[34px] border border-white/10 bg-[#101522] p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-white/50">
                Game Over
              </div>

              <div className="mt-4 text-4xl font-black text-white md:text-5xl">
                {room.assassin_revealed ? "تم كشف الكرت الأسود" : "انتهت اللعبة"}
              </div>

              <div className="mt-4 text-2xl font-bold text-white/80">
                الفائز:{" "}
                <span
                  className={
                    room.winner_team === "blue"
                      ? "text-cyan-200"
                      : room.winner_team === "red"
                      ? "text-red-200"
                      : "text-white"
                  }
                >
                  {room.winner_team === "blue"
                    ? "الفريق الأزرق"
                    : room.winner_team === "red"
                    ? "الفريق الأحمر"
                    : "غير محدد"}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/games/codenames/room/${room.room_code}?player_id=${safeCurrentPlayer.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white hover:bg-white/10"
                >
                  العودة للروم
                </Link>
                <Link
                  href="/games/codenames/create"
                  className="rounded-2xl bg-emerald-500 px-6 py-3 font-black text-white hover:bg-emerald-400"
                >
                  إنشاء لعبة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}