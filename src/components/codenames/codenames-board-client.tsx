"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  resetGameAction: ServerAction;
};

const BLUE_TEAM_IMAGE = "https://k.top4top.io/p_3739o1dbh1.png";
const ORANGE_TEAM_IMAGE = "https://l.top4top.io/p_3739qbt1f2.png";

const BLUE_PANEL_BG =
  "https://t3.ftcdn.net/jpg/00/86/56/12/360_F_86561234_8HJdzg2iBlPap18K38mbyetKfdw1oNrm.jpg";

const ORANGE_PANEL_BG =
  "https://img.freepik.com/free-vector/grunge-diagonal-stripe-background_1409-1366.jpg";

const CARD_BACKGROUNDS = {
  neutral: "https://d.top4top.io/p_3740ccnwr3.png",
  blue: "https://t3.ftcdn.net/jpg/00/86/56/12/360_F_86561234_8HJdzg2iBlPap18K38mbyetKfdw1oNrm.jpg",
  orange:
    "https://img.freepik.com/free-vector/grunge-diagonal-stripe-background_1409-1366.jpg",
  black:
    "https://img.freepik.com/free-photo/dark-abstract-background_1048-1920.jpg",
};

function getCardBackground(cardType: string) {
  if (cardType === "blue") return CARD_BACKGROUNDS.blue;
  if (cardType === "red") return CARD_BACKGROUNDS.orange;
  if (cardType === "assassin") return CARD_BACKGROUNDS.black;
  return CARD_BACKGROUNDS.neutral;
}

function getWinnerLabel(team: string | null | undefined) {
  if (team === "blue") return "الفريق الأزرق";
  if (team === "red") return "الفريق البرتقالي";
  return "غير محدد";
}

function getTurnLabel(team: string | null) {
  if (team === "blue") return "Blue Team";
  if (team === "red") return "Orange Team";
  return "-";
}

function normalizePlayers(rows: PlayerRow[]) {
  return rows.map((player) => ({
    ...player,
    team: player.team?.toLowerCase() ?? null,
    role: player.role?.toLowerCase() ?? null,
  }));
}

function TeamPanel({
  title,
  theme,
  operatives,
  spymasters,
  remaining,
}: {
  title: string;
  theme: "blue" | "orange";
  operatives: PlayerRow[];
  spymasters: PlayerRow[];
  remaining: number | null;
}) {
  const isBlue = theme === "blue";
  const imageUrl = isBlue ? BLUE_TEAM_IMAGE : ORANGE_TEAM_IMAGE;
  const panelBg = isBlue ? BLUE_PANEL_BG : ORANGE_PANEL_BG;

  const titleClass = isBlue
    ? "border-cyan-300/20 text-cyan-100"
    : "border-orange-300/20 text-orange-100";

  const blockClass = isBlue
    ? "border-cyan-300/25 bg-cyan-500/12"
    : "border-orange-300/25 bg-orange-500/14";

  const numberClass = isBlue ? "text-cyan-100" : "text-orange-100";

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        className={`rounded-full border px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.18em] shadow-lg sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.22em] ${titleClass}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,10,20,0.88), rgba(6,10,20,0.78)), ${
            isBlue
              ? "linear-gradient(90deg, rgba(8,72,114,0.35), rgba(12,19,34,0.15))"
              : "linear-gradient(90deg, rgba(157,64,11,0.34), rgba(34,18,10,0.18))"
          }`,
        }}
      >
        {title}
      </div>

      <div
        className={`rounded-[22px] border p-3 sm:rounded-[28px] sm:p-4 ${blockClass}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.18)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="rounded-[18px] bg-black/25 p-3 backdrop-blur-[2px] sm:rounded-[22px] sm:p-4">
          <div className="mb-2 text-center text-xs font-black uppercase tracking-wider text-white/85 sm:mb-3 sm:text-sm">
            👥 Operatives
          </div>
          <div className="space-y-2 sm:space-y-3">
            {operatives.length > 0 ? (
              operatives.map((player) => (
                <div
                  key={player.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-center text-base font-black text-white shadow-inner sm:rounded-2xl sm:p-3 sm:text-xl"
                >
                  {player.guest_name}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-black/25 p-2.5 text-center text-xs text-white/45 sm:rounded-2xl sm:p-3 sm:text-sm">
                لا يوجد
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`rounded-[22px] border p-3 sm:rounded-[28px] sm:p-4 ${blockClass}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.18)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="rounded-[18px] bg-black/25 p-3 backdrop-blur-[2px] sm:rounded-[22px] sm:p-4">
          <div className="mb-2 text-center text-xs font-black uppercase tracking-wider text-white/85 sm:mb-3 sm:text-sm">
            🕵️ Spymasters
          </div>
          <div className="space-y-2 sm:space-y-3">
            {spymasters.length > 0 ? (
              spymasters.map((player) => (
                <div
                  key={player.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-center text-base font-black text-white shadow-inner sm:rounded-2xl sm:p-3 sm:text-xl"
                >
                  {player.guest_name}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-black/25 p-2.5 text-center text-xs text-white/45 sm:rounded-2xl sm:p-3 sm:text-sm">
                لا يوجد
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[22px] border border-white/10 px-3 py-4 text-center shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:rounded-[26px] sm:px-4 sm:py-6"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,10,20,0.86), rgba(6,10,20,0.78)), url(${panelBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10">
          <div className="text-xs font-semibold text-white/65 sm:text-sm">🎴 Cards Remaining</div>
          <div
            className={`mt-2 text-4xl font-black drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:mt-3 sm:text-6xl ${numberClass}`}
          >
            {remaining ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CodenamesBoardClient({
  initialRoom,
  initialCards,
  initialPlayers,
  initialTurns,
  currentPlayerId,
  submitClueAction,
  revealCardAction,
  endTurnAction,
  resetGameAction,
}: Props) {
  const [room, setRoom] = useState<RoomRow>(initialRoom);
  const [cards, setCards] = useState<CardRow[]>(initialCards);
  const [players, setPlayers] = useState<PlayerRow[]>(normalizePlayers(initialPlayers));
  const [turns, setTurns] = useState<TurnRow[]>(initialTurns);
  const [selectedCard, setSelectedCard] = useState<CardRow | null>(null);
  const [previewSelection, setPreviewSelection] = useState<PreviewSelection>(null);
  const [inspectedCard, setInspectedCard] = useState<CardRow | null>(null);
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const previousCardsRef = useRef<CardRow[]>(initialCards);

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

  if (!currentPlayer) return null;
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
  const orangePlayers = players.filter((player) => player.team === "red");
  const spectators = players.filter((player) => player.team === "spectator");

  const blueOperatives = bluePlayers.filter((player) => player.role === "operative");
  const blueSpymasters = bluePlayers.filter((player) => player.role === "spymaster");
  const orangeOperatives = orangePlayers.filter((player) => player.role === "operative");
  const orangeSpymasters = orangePlayers.filter((player) => player.role === "spymaster");

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
    if (playersRes.data) setPlayers(normalizePlayers(playersRes.data as PlayerRow[]));
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
      .on(
        "broadcast" as any,
        { event: "preview-selection" },
        ({ payload }: { payload: PreviewSelection }) => {
          setPreviewSelection(payload);
        }
      )
      .on("broadcast" as any, { event: "clear-preview" }, () => {
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

  useEffect(() => {
    const previousCards = previousCardsRef.current;

    for (const nextCard of cards) {
      const previousCard = previousCards.find((card) => card.id === nextCard.id);
      if (previousCard && !previousCard.is_revealed && nextCard.is_revealed) {
        setRevealingCardId(nextCard.id);
        const timeout = window.setTimeout(() => {
          setRevealingCardId((current) => (current === nextCard.id ? null : current));
        }, 760);
        previousCardsRef.current = cards;
        return () => window.clearTimeout(timeout);
      }
    }

    previousCardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    if (!selectedCard) return;
    const stillExists = cards.find((card) => card.id === selectedCard.id);
    if (stillExists?.is_revealed) {
      setSelectedCard(null);
      setPreviewSelection(null);
    }
  }, [cards]);

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

  function getCardView(card: CardRow) {
    const isPending = selectedCard?.id === card.id;
    const realBg = getCardBackground(card.card_type);

    const baseStyle: React.CSSProperties = {
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };

    if (card.is_revealed) {
      return {
        className: `card-shell ${revealingCardId === card.id ? "card-flip-reveal" : ""} ${
          isPending ? "card-pending" : ""
        }`,
        style: {
          ...baseStyle,
          backgroundImage: `url(${realBg})`,
        },
        label: "تم الكشف",
      };
    }

    if (isSpymaster) {
      return {
        className: `card-shell ${isPending ? "card-pending" : ""}`,
        style: {
          ...baseStyle,
          backgroundImage: `url(${realBg})`,
        },
        label: card.word,
      };
    }

    return {
      className: `card-shell ${isPending ? "card-pending" : ""}`,
      style: {
        ...baseStyle,
        backgroundImage: `url(${CARD_BACKGROUNDS.neutral})`,
      },
      label: card.word,
    };
  }

  return (
    <div className="relative mx-auto w-full max-w-[1700px] p-2 sm:p-3 md:p-5 xl:p-6">
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_28%),linear-gradient(180deg,#0d1320_0%,#16283a_100%)] sm:rounded-[40px]" />

      <div className="grid gap-3 sm:gap-4 lg:gap-5 xl:grid-cols-[240px_minmax(0,1fr)_240px] 2xl:grid-cols-[260px_minmax(0,1fr)_260px]">
        <div className="order-2 space-y-3 sm:space-y-4 lg:space-y-5 xl:order-1">
          <TeamPanel
            title="Orange Team"
            theme="orange"
            operatives={orangeOperatives}
            spymasters={orangeSpymasters}
            remaining={room.red_remaining}
          />

          <div
            className="rounded-[22px] border border-white/10 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] sm:rounded-[28px] sm:p-4"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(34,44,60,0.86), rgba(28,36,50,0.92))",
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/75 sm:px-3 sm:text-xs">
                Live
              </div>
              <div className="text-lg font-black text-white sm:text-2xl">Game Log</div>
            </div>

            <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1 sm:max-h-[320px] sm:space-y-3">
              {previewSelection && (
                <div className="rounded-xl border border-lime-300/20 bg-lime-500/10 p-3 sm:rounded-2xl">
                  <div className="text-[10px] font-black uppercase text-lime-100 sm:text-xs">
                    Preview
                  </div>
                  <div className="mt-2 text-sm font-black text-white sm:text-base">
                    {previewSelection.playerName} حدّد: {previewSelection.word}
                  </div>
                </div>
              )}

              {sortedTurns.length > 0 ? (
                sortedTurns.map((turn, index) => (
                  <div
                    key={turn.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-3 sm:rounded-2xl"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase sm:px-3 sm:text-xs ${
                          turn.team === "blue"
                            ? "bg-cyan-500/15 text-cyan-100"
                            : "bg-orange-500/15 text-orange-100"
                        }`}
                      >
                        {turn.team === "red" ? "orange" : turn.team}
                      </div>
                      <div className="text-[10px] font-semibold text-white/40 sm:text-xs">
                        #{sortedTurns.length - index}
                      </div>
                    </div>

                    <div className="mt-2 text-base font-black text-white sm:mt-3 sm:text-lg">
                      {turn.clue_word} • {turn.clue_number}
                    </div>

                    <div className="mt-1 text-[11px] font-semibold text-white/45 sm:text-xs">
                      guesses: {turn.guesses_made ?? 0} • {turn.turn_status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-xs text-white/45 sm:rounded-2xl sm:text-sm">
                  لا يوجد سجل بعد
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-1 min-w-0 space-y-3 sm:space-y-4 lg:space-y-5 xl:order-2">
          <div
            className="rounded-[24px] border border-white/10 px-3 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:rounded-[30px] sm:px-4 sm:py-4 md:rounded-[34px] md:px-5 md:py-5"
            style={{
              backgroundImage:
                room.current_turn_team === "blue"
                  ? `linear-gradient(180deg, rgba(8,16,30,0.86), rgba(8,16,30,0.88)), url(${BLUE_PANEL_BG})`
                  : room.current_turn_team === "red"
                  ? `linear-gradient(180deg, rgba(20,10,6,0.84), rgba(20,10,6,0.9)), url(${ORANGE_PANEL_BG})`
                  : "linear-gradient(180deg, rgba(16,21,34,0.92), rgba(16,21,34,0.9))",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-center text-xl font-black uppercase leading-tight tracking-wide text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              {room.status === "finished"
                ? room.assassin_revealed
                  ? "Assassin was revealed"
                  : "Game Finished"
                : selectedCard
                ? "Confirm your choice"
                : previewSelection
                ? `${previewSelection.playerName} يفكر في ${previewSelection.word}`
                : getTurnLabel(room.current_turn_team)}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3">
              <div
                className="rounded-full border border-white/10 px-3 py-2 text-[11px] font-bold text-white shadow-lg sm:px-4 sm:py-2.5 sm:text-sm md:px-5 md:py-3"
                style={{
                  background:
                    room.current_turn_team === "blue"
                      ? "linear-gradient(90deg, rgba(10,73,110,0.55), rgba(17,24,39,0.85))"
                      : room.current_turn_team === "red"
                      ? "linear-gradient(90deg, rgba(180,88,17,0.48), rgba(17,24,39,0.85))"
                      : "rgba(255,255,255,0.06)",
                }}
              >
                🎯 TURN: {getTurnLabel(room.current_turn_team)}
              </div>

              <div
                className="rounded-full border border-orange-300/25 px-3 py-2 text-[11px] font-bold text-orange-100 shadow-lg sm:px-4 sm:py-2.5 sm:text-sm md:px-5 md:py-3"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(170,74,8,0.55), rgba(46,20,8,0.72)), url(${ORANGE_PANEL_BG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                ORANGE {room.red_remaining ?? 0}
              </div>

              <div
                className="rounded-full border border-cyan-300/25 px-3 py-2 text-[11px] font-bold text-cyan-100 shadow-lg sm:px-4 sm:py-2.5 sm:text-sm md:px-5 md:py-3"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(11,88,133,0.55), rgba(11,24,46,0.75)), url(${BLUE_PANEL_BG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                BLUE {room.blue_remaining ?? 0}
              </div>
            </div>
          </div>

          <div className="board-grid grid grid-cols-5 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
            {cards.map((card) => {
              const cardView = getCardView(card);

              if (card.is_revealed) {
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setInspectedCard(card)}
                    className={`${cardView.className} board-card flex aspect-[0.76] min-h-0 items-center justify-center px-1.5 py-2 text-center sm:aspect-[0.8] sm:px-2 sm:py-2.5 md:min-h-[112px] md:px-3 md:py-4 lg:min-h-[132px]`}
                    style={cardView.style}
                  >
                    <div className="card-inner-overlay" />
                    <div className="relative z-10 card-word-text">{cardView.label}</div>
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
                    className={`${cardView.className} board-card card-hover-up flex aspect-[0.76] min-h-0 items-center justify-center px-1.5 py-2 text-center sm:aspect-[0.8] sm:px-2 sm:py-2.5 md:min-h-[112px] md:px-3 md:py-4 lg:min-h-[132px]`}
                    style={cardView.style}
                  >
                    <div className="card-inner-overlay" />
                    <div className="relative z-10 card-word-text">{cardView.label}</div>
                  </button>
                );
              }

              return (
                <div
                  key={card.id}
                  className={`${cardView.className} board-card flex aspect-[0.76] min-h-0 items-center justify-center px-1.5 py-2 text-center sm:aspect-[0.8] sm:px-2 sm:py-2.5 md:min-h-[112px] md:px-3 md:py-4 lg:min-h-[132px]`}
                  style={cardView.style}
                >
                  <div className="card-inner-overlay" />
                  <div className="relative z-10 card-word-text">{cardView.label}</div>
                </div>
              );
            })}
          </div>

          {selectedCard && canRevealCard && room.status !== "finished" && (
            <div className="rounded-[20px] border border-lime-300/25 bg-lime-500/10 p-3 shadow-xl backdrop-blur-sm sm:rounded-[24px] sm:p-4">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.15em] text-lime-100 sm:text-sm sm:tracking-[0.2em]">
                Tap to confirm
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-lg font-black text-white sm:rounded-2xl sm:px-5 sm:py-4 sm:text-2xl">
                  {selectedCard.word}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setSelectedCard(null);
                    await sendPreview(null);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-black text-white hover:bg-white/10 sm:rounded-2xl sm:px-5 sm:py-4"
                >
                  إلغاء
                </button>

                <form
                  action={async (formData) => {
                    await revealCardAction(formData);
                    setSelectedCard(null);
                    await sendPreview(null);
                  }}
                >
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                  <input type="hidden" name="card_id" value={selectedCard.id} />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-lime-500 px-5 py-3 font-black text-white hover:bg-lime-400 sm:rounded-2xl sm:px-6 sm:py-4"
                  >
                    تأكيد الاختيار
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="rounded-[22px] border border-white/10 bg-[#101522]/90 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:rounded-[26px] sm:p-4 md:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 sm:rounded-2xl sm:p-4">
                  <div className="text-xs font-semibold text-white/60 sm:text-sm">🧠 آخر clue</div>
                  {activeTurn ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="rounded-xl bg-white/5 px-3 py-2.5 text-lg font-black text-white sm:rounded-2xl sm:px-4 sm:py-3 sm:text-2xl">
                        {activeTurn.clue_word}
                      </div>
                      <div className="rounded-xl bg-white/5 px-3 py-2.5 text-lg font-black text-white sm:rounded-2xl sm:px-4 sm:py-3 sm:text-2xl">
                        {activeTurn.clue_number}
                      </div>
                      <div className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-bold text-white/70 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
                        Used: {activeTurn.guesses_made ?? 0}
                      </div>
                      <div className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-bold text-white/70 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
                        Max: {(activeTurn.clue_number ?? 0) + 1}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-white/45">لا يوجد clue حتى الآن</div>
                  )}
                </div>

                {canSubmitClue ? (
                  <form action={submitClueAction} className="space-y-3">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />

                    <div className="grid gap-3 md:grid-cols-[1fr_130px]">
                      <input
                        name="clue_word"
                        placeholder="YOUR CLUE"
                        className="rounded-xl border border-white/10 bg-white px-4 py-3 text-right text-lg font-black text-black outline-none placeholder:text-black/30 shadow-inner sm:rounded-2xl sm:px-5 sm:py-4 sm:text-2xl"
                      />
                      <input
                        type="number"
                        name="clue_number"
                        min={1}
                        defaultValue={1}
                        className="rounded-xl border border-white/10 bg-white px-4 py-3 text-center text-lg font-black text-black outline-none shadow-inner sm:rounded-2xl sm:px-5 sm:py-4 sm:text-2xl"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-lg font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:bg-emerald-400 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-xl"
                    >
                      إرسال الـ clue
                    </button>
                  </form>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-white/55 sm:rounded-2xl">
                    {activeTurn
                      ? "تم إرسال clue بالفعل، الآن دور الـ operatives"
                      : "فقط Spymaster الخاص بالفريق الذي عليه الدور يستطيع إرسال clue"}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-end gap-3">
                {canEndTurn && (
                  <form action={endTurnAction} className="w-full">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-orange-500 px-5 py-3 text-lg font-black text-white shadow-[0_10px_25px_rgba(249,115,22,0.25)] hover:bg-orange-400 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-xl"
                    >
                      إنهاء الدور
                    </button>
                  </form>
                )}

                {safeCurrentPlayer.is_host && (
                  <form action={resetGameAction} className="w-full">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-red-300/20 bg-red-500/10 px-5 py-3 text-base font-black text-red-100 hover:bg-red-500/20 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg"
                    >
                      🔄 إعادة اللعبة
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-3 space-y-3 sm:space-y-4 lg:space-y-5 xl:order-3">
          <TeamPanel
            title="Blue Team"
            theme="blue"
            operatives={blueOperatives}
            spymasters={blueSpymasters}
            remaining={room.blue_remaining}
          />

          <div
            className="rounded-[22px] border border-white/10 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] sm:rounded-[28px] sm:p-4"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(34,44,60,0.86), rgba(28,36,50,0.92))",
            }}
          >
            <div className="mb-3 text-center text-xs font-black uppercase tracking-wider text-white/75 sm:text-sm">
              👁️ Spectators
            </div>
            <div className="space-y-2 sm:space-y-3">
              {spectators.length > 0 ? (
                spectators.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-2.5 text-center text-base font-black text-white sm:rounded-2xl sm:p-3 sm:text-lg"
                  >
                    {player.guest_name}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center text-xs text-white/45 sm:rounded-2xl sm:text-sm">
                  لا يوجد مشاهدون
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {inspectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-md rounded-[22px] border border-white/10 bg-[#101522] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:rounded-[24px] sm:p-6">
            <div className="text-xl font-black text-white sm:text-2xl">تفاصيل الكرت</div>

            <div
              className="mt-4 h-28 rounded-2xl border border-white/10 shadow-lg sm:mt-5 sm:h-32"
              style={{
                backgroundImage: `url(${getCardBackground(inspectedCard.card_type)})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:rounded-2xl">
              <div className="text-sm font-semibold text-white/50">الكلمة</div>
              <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {inspectedCard.word}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:rounded-2xl">
              <div className="text-sm font-semibold text-white/50">النوع</div>
              <div className="mt-2 text-lg font-black text-white sm:text-xl">
                {inspectedCard.card_type === "red"
                  ? "orange"
                  : inspectedCard.card_type}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectedCard(null)}
              className="mt-5 w-full rounded-xl bg-white/10 px-5 py-3 font-black text-white hover:bg-white/15 sm:rounded-2xl"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {room.status === "finished" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-2xl rounded-[22px] border border-white/10 bg-[#101522] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:rounded-[28px] sm:p-8">
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-white/45 sm:text-sm sm:tracking-[0.3em]">
                Game Over
              </div>

              <div className="mt-4 text-2xl font-black text-white sm:text-4xl md:text-5xl">
                {room.assassin_revealed ? "تم كشف الكرت الأسود" : "انتهت اللعبة"}
              </div>

              <div className="mt-4 text-lg font-bold text-white/80 sm:text-2xl">
                الفائز:{" "}
                <span
                  className={
                    room.winner_team === "blue"
                      ? "text-cyan-200"
                      : room.winner_team === "red"
                      ? "text-orange-200"
                      : "text-white"
                  }
                >
                  {getWinnerLabel(room.winner_team)}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/games/codenames/room/${room.room_code}?player_id=${safeCurrentPlayer.id}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white hover:bg-white/10 sm:rounded-2xl sm:px-6"
                >
                  العودة للروم
                </Link>

                <Link
                  href="/games/codenames/create"
                  className="rounded-xl bg-emerald-500 px-5 py-3 font-black text-white hover:bg-emerald-400 sm:rounded-2xl sm:px-6"
                >
                  إنشاء لعبة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card-shell {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 10px 22px rgba(0, 0, 0, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          min-width: 0;
        }

        .card-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.04) 0%,
              rgba(255, 255, 255, 0.01) 24%,
              rgba(0, 0, 0, 0.08) 100%
            );
          pointer-events: none;
        }

        .card-inner-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 35%),
            linear-gradient(180deg, transparent 62%, rgba(0,0,0,0.12) 100%);
          pointer-events: none;
        }

        .card-hover-up:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow:
            0 18px 38px rgba(0, 0, 0, 0.26),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .card-pending {
          border-color: rgba(163, 230, 53, 0.95) !important;
          box-shadow:
            0 0 0 2px rgba(163, 230, 53, 0.22),
            0 16px 38px rgba(101, 163, 13, 0.22);
          animation: pulseBorder 1.25s ease-in-out infinite;
        }

        .card-flip-reveal {
          animation: flipRevealPro 760ms cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center center;
          will-change: transform, filter, box-shadow;
        }

        .card-word-text {
          width: 100%;
          max-width: 100%;
          text-align: center;
          color: #f7fafc;
          font-size: clamp(0.92rem, 2.35vw, 1.85rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: 0;
          text-transform: none;
          text-shadow:
            0 2px 0 rgba(0, 0, 0, 0.5),
            0 6px 20px rgba(0, 0, 0, 0.55),
            0 0 12px rgba(0, 0, 0, 0.25);
          filter: drop-shadow(0 2px 10px rgba(0,0,0,0.35));
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
        }

        @keyframes flipRevealPro {
          0% {
            transform: perspective(1100px) rotateY(0deg) scale(1);
            filter: brightness(0.95);
          }
          22% {
            transform: perspective(1100px) rotateY(88deg) scale(0.985);
            filter: brightness(0.75);
          }
          48% {
            transform: perspective(1100px) rotateY(180deg) scale(1.015);
            filter: brightness(1.18);
          }
          72% {
            transform: perspective(1100px) rotateY(358deg) scale(1.02);
            filter: brightness(1.08);
          }
          100% {
            transform: perspective(1100px) rotateY(360deg) scale(1);
            filter: brightness(1);
          }
        }

        @keyframes pulseBorder {
          0%,
          100% {
            box-shadow:
              0 0 0 2px rgba(163, 230, 53, 0.22),
              0 16px 38px rgba(101, 163, 13, 0.18);
          }
          50% {
            box-shadow:
              0 0 0 3px rgba(163, 230, 53, 0.32),
              0 18px 42px rgba(101, 163, 13, 0.28);
          }
        }

        @media (max-width: 1024px) {
          .card-shell {
            border-radius: 14px;
            box-shadow:
              0 8px 18px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }
        }

        @media (max-width: 640px) {
          .card-word-text {
            font-size: clamp(0.82rem, 3.7vw, 1.15rem);
            line-height: 1.06;
          }
        }

        @media (max-width: 430px) {
          .card-word-text {
            font-size: clamp(0.8rem, 3.45vw, 1rem);
          }
        }

        @media (orientation: landscape) and (max-width: 1024px) {
          .board-grid {
            gap: 0.55rem !important;
          }

          .board-card {
            aspect-ratio: 0.9 / 1 !important;
          }

          .card-word-text {
            font-size: clamp(0.78rem, 2vw, 1.02rem);
            line-height: 1.02;
          }
        }

        @media (orientation: landscape) and (max-width: 900px) and (max-height: 520px) {
          .board-grid {
            gap: 0.45rem !important;
          }

          .board-card {
            aspect-ratio: 1.02 / 1 !important;
          }

          .card-shell {
            border-radius: 12px;
          }

          .card-word-text {
            font-size: clamp(0.74rem, 1.8vw, 0.96rem);
            line-height: 1;
          }
        }
      `}</style>
    </div>
  );
}