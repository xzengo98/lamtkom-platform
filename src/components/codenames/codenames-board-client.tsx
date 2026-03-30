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
    <div className="space-y-4">
      <div
        className={`rounded-full border px-4 py-3 text-center text-sm font-black uppercase tracking-[0.22em] shadow-lg ${titleClass}`}
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
        className={`rounded-[28px] border p-4 ${blockClass}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.18)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="rounded-[22px] bg-black/25 p-4 backdrop-blur-[2px]">
          <div className="mb-3 text-center text-sm font-black uppercase tracking-wider text-white/85">
            👥 Operatives
          </div>
          <div className="space-y-3">
            {operatives.length > 0 ? (
              operatives.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center text-xl font-black text-white shadow-inner"
                >
                  {player.guest_name}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center text-sm text-white/45">
                لا يوجد
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`rounded-[28px] border p-4 ${blockClass}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.18)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="rounded-[22px] bg-black/25 p-4 backdrop-blur-[2px]">
          <div className="mb-3 text-center text-sm font-black uppercase tracking-wider text-white/85">
            🕵️ Spymasters
          </div>
          <div className="space-y-3">
            {spymasters.length > 0 ? (
              spymasters.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center text-xl font-black text-white shadow-inner"
                >
                  {player.guest_name}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center text-sm text-white/45">
                لا يوجد
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[26px] border border-white/10 px-4 py-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,10,20,0.86), rgba(6,10,20,0.78)), url(${panelBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10">
          <div className="text-sm font-semibold text-white/65">🎴 Cards Remaining</div>
          <div
            className={`mt-3 text-6xl font-black drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] ${numberClass}`}
          >
            {remaining ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileTeamSummary({
  title,
  theme,
  operativesCount,
  spymastersCount,
  remaining,
}: {
  title: string;
  theme: "blue" | "orange";
  operativesCount: number;
  spymastersCount: number;
  remaining: number | null;
}) {
  const isBlue = theme === "blue";
  const bgImage = isBlue ? BLUE_PANEL_BG : ORANGE_PANEL_BG;

  return (
    <div
      className={`mobile-summary-card relative overflow-hidden rounded-[18px] border p-2.5 ${
        isBlue ? "border-cyan-300/20" : "border-orange-300/20"
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(12,18,30,0.82), rgba(12,18,30,0.9)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10">
        <div
          className={`text-center text-[10px] font-black uppercase tracking-[0.12em] ${
            isBlue ? "text-cyan-100" : "text-orange-100"
          }`}
        >
          {title}
        </div>

        <div className="mt-2 text-center">
          <div className={`text-3xl font-black ${isBlue ? "text-cyan-100" : "text-orange-100"}`}>
            {remaining ?? 0}
          </div>
          <div className="text-[10px] font-semibold text-white/65">Cards</div>
        </div>

        <div className="mt-2 grid gap-1.5">
          <div className="rounded-xl bg-black/30 px-2 py-1.5 text-center text-[10px] font-bold text-white">
            Operatives {operativesCount}
          </div>
          <div className="rounded-xl bg-black/30 px-2 py-1.5 text-center text-[10px] font-bold text-white">
            Spymasters {spymastersCount}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileGameLog({
  previewSelection,
  sortedTurns,
}: {
  previewSelection: PreviewSelection;
  sortedTurns: TurnRow[];
}) {
  return (
    <div className="mobile-log-card rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(58,64,74,0.92),rgba(36,40,46,0.96))] p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
      <div className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
        Game Log
      </div>

      <div className="mt-2 h-[114px] overflow-y-auto rounded-[14px] border border-white/10 bg-black/10 p-2">
        {previewSelection ? (
          <div className="rounded-xl border border-lime-300/20 bg-lime-500/10 p-2">
            <div className="text-[10px] font-black uppercase text-lime-100">Preview</div>
            <div className="mt-1 text-xs font-black text-white">
              {previewSelection.playerName}: {previewSelection.word}
            </div>
          </div>
        ) : sortedTurns.length > 0 ? (
          <div className="space-y-2">
            {sortedTurns.slice(0, 3).map((turn, index) => (
              <div key={turn.id} className="rounded-xl border border-white/10 bg-black/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                      turn.team === "blue"
                        ? "bg-cyan-500/15 text-cyan-100"
                        : "bg-orange-500/15 text-orange-100"
                    }`}
                  >
                    {turn.team === "red" ? "orange" : turn.team}
                  </div>
                  <div className="text-[9px] font-semibold text-white/35">
                    #{sortedTurns.length - index}
                  </div>
                </div>

                <div className="mt-1 text-xs font-black text-white">
                  {turn.clue_word} • {turn.clue_number}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-[11px] font-semibold text-white/40">
            لا يوجد سجل بعد
          </div>
        )}
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
    <div className="relative mx-auto max-w-[1700px] p-2 sm:p-4 md:p-6">
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_28%),linear-gradient(180deg,#0d1320_0%,#16283a_100%)] sm:rounded-[40px]" />

      {/* MOBILE LAYOUT */}
      <div className="xl:hidden">
        <div className="space-y-3">
          <div className="grid grid-cols-[minmax(88px,1fr)_minmax(110px,1.15fr)_minmax(88px,1fr)] gap-2">
            <MobileTeamSummary
              title="Blue"
              theme="blue"
              operativesCount={blueOperatives.length}
              spymastersCount={blueSpymasters.length}
              remaining={room.blue_remaining}
            />

            <MobileGameLog
              previewSelection={previewSelection}
              sortedTurns={sortedTurns}
            />

            <MobileTeamSummary
              title="Orange"
              theme="orange"
              operativesCount={orangeOperatives.length}
              spymastersCount={orangeSpymasters.length}
              remaining={room.red_remaining}
            />
          </div>

          <div
            className="rounded-[18px] border border-white/10 px-3 py-3 text-center shadow-[0_14px_36px_rgba(0,0,0,0.26)]"
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
            <div className="text-base font-black uppercase leading-tight text-white">
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

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              <div
                className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg"
                style={{
                  background:
                    room.current_turn_team === "blue"
                      ? "linear-gradient(90deg, rgba(10,73,110,0.55), rgba(17,24,39,0.85))"
                      : room.current_turn_team === "red"
                      ? "linear-gradient(90deg, rgba(180,88,17,0.48), rgba(17,24,39,0.85))"
                      : "rgba(255,255,255,0.06)",
                }}
              >
                TURN: {getTurnLabel(room.current_turn_team)}
              </div>

              <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-bold text-cyan-100">
                BLUE {room.blue_remaining ?? 0}
              </div>

              <div className="rounded-full border border-orange-300/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold text-orange-100">
                ORANGE {room.red_remaining ?? 0}
              </div>
            </div>
          </div>

          <div className="mobile-board-wrap rounded-[20px] border border-white/10 bg-[#0d1522]/70 p-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
            <div className="grid grid-cols-5 gap-2">
              {cards.map((card) => {
                const cardView = getCardView(card);

                if (card.is_revealed) {
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setInspectedCard(card)}
                      className={`${cardView.className} mobile-card flex aspect-[0.74] min-h-0 items-center justify-center px-1.5 py-2 text-center`}
                      style={cardView.style}
                    >
                      <div className="card-inner-overlay" />
                      <div className="relative z-10 card-word-text mobile-card-word">
                        {cardView.label}
                      </div>
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
                      className={`${cardView.className} mobile-card card-hover-up flex aspect-[0.74] min-h-0 items-center justify-center px-1.5 py-2 text-center`}
                      style={cardView.style}
                    >
                      <div className="card-inner-overlay" />
                      <div className="relative z-10 card-word-text mobile-card-word">
                        {cardView.label}
                      </div>
                    </button>
                  );
                }

                return (
                  <div
                    key={card.id}
                    className={`${cardView.className} mobile-card flex aspect-[0.74] min-h-0 items-center justify-center px-1.5 py-2 text-center`}
                    style={cardView.style}
                  >
                    <div className="card-inner-overlay" />
                    <div className="relative z-10 card-word-text mobile-card-word">
                      {cardView.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCard && canRevealCard && room.status !== "finished" && (
            <div className="rounded-[18px] border border-lime-300/25 bg-lime-500/10 p-3 shadow-xl backdrop-blur-sm">
              <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.15em] text-lime-100">
                Tap to confirm
              </div>

              <div className="grid gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-lg font-black text-white">
                  {selectedCard.word}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setSelectedCard(null);
                      await sendPreview(null);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-black text-white hover:bg-white/10"
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
                      className="w-full rounded-2xl bg-lime-500 px-4 py-3 font-black text-white hover:bg-lime-400"
                    >
                      تأكيد
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[20px] border border-white/10 bg-[#101522]/90 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/60">🧠 آخر clue</div>
                {activeTurn ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="rounded-xl bg-white/5 px-3 py-2 text-base font-black text-white">
                      {activeTurn.clue_word}
                    </div>
                    <div className="rounded-xl bg-white/5 px-3 py-2 text-base font-black text-white">
                      {activeTurn.clue_number}
                    </div>
                    <div className="rounded-xl bg-white/5 px-3 py-2 text-[11px] font-bold text-white/70">
                      Used: {activeTurn.guesses_made ?? 0}
                    </div>
                    <div className="rounded-xl bg-white/5 px-3 py-2 text-[11px] font-bold text-white/70">
                      Max: {(activeTurn.clue_number ?? 0) + 1}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-white/45">لا يوجد clue حتى الآن</div>
                )}
              </div>

              {canSubmitClue ? (
                <form action={submitClueAction} className="space-y-2">
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />

                  <div className="grid grid-cols-[1fr_96px] gap-2">
                    <input
                      name="clue_word"
                      placeholder="YOUR CLUE"
                      className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-right text-lg font-black text-black outline-none placeholder:text-black/30 shadow-inner"
                    />
                    <input
                      type="number"
                      name="clue_number"
                      min={1}
                      defaultValue={1}
                      className="rounded-2xl border border-white/10 bg-white px-3 py-3 text-center text-lg font-black text-black outline-none shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-base font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:bg-emerald-400"
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

              <div className="grid gap-2">
                {canEndTurn && (
                  <form action={endTurnAction} className="w-full">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-base font-black text-white shadow-[0_10px_25px_rgba(249,115,22,0.25)] hover:bg-orange-400"
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
                      className="w-full rounded-2xl border border-red-300/20 bg-red-500/10 px-5 py-3 text-base font-black text-red-100 hover:bg-red-500/20"
                    >
                      🔄 إعادة اللعبة
                    </button>
                  </form>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-center text-xs font-black uppercase tracking-wider text-white/75">
                  👁️ Spectators
                </div>
                <div className="space-y-2">
                  {spectators.length > 0 ? (
                    spectators.map((player) => (
                      <div
                        key={player.id}
                        className="rounded-xl border border-white/10 bg-black/20 p-2.5 text-center text-sm font-black text-white"
                      >
                        {player.guest_name}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 text-center text-xs text-white/45">
                      لا يوجد مشاهدون
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden xl:grid xl:grid-cols-[260px_minmax(0,1fr)_260px] xl:gap-5">
        <div className="space-y-5">
          <TeamPanel
            title="Orange Team"
            theme="orange"
            operatives={orangeOperatives}
            spymasters={orangeSpymasters}
            remaining={room.red_remaining}
          />

          <div
            className="rounded-[28px] border border-white/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(34,44,60,0.86), rgba(28,36,50,0.92))",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/75">
                Live
              </div>
              <div className="text-2xl font-black text-white">Game Log</div>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
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
                            : "bg-orange-500/15 text-orange-100"
                        }`}
                      >
                        {turn.team === "red" ? "orange" : turn.team}
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
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center text-sm text-white/45">
                  لا يوجد سجل بعد
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[34px] border border-white/10 px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm"
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
            <div className="text-center text-3xl font-black uppercase tracking-wide text-white md:text-5xl">
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

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg"
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
                className="rounded-full border border-orange-300/25 px-5 py-3 text-sm font-bold text-orange-100 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(170,74,8,0.55), rgba(46,20,8,0.72)), url(${ORANGE_PANEL_BG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                ORANGE {room.red_remaining ?? 0}
              </div>

              <div
                className="rounded-full border border-cyan-300/25 px-5 py-3 text-sm font-bold text-cyan-100 shadow-lg"
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

          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {cards.map((card) => {
              const cardView = getCardView(card);

              if (card.is_revealed) {
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setInspectedCard(card)}
                    className={`${cardView.className} flex min-h-[112px] items-center justify-center px-3 py-4 text-center md:min-h-[132px]`}
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
                    className={`${cardView.className} card-hover-up flex min-h-[112px] items-center justify-center px-3 py-4 text-center md:min-h-[132px]`}
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
                  className={`${cardView.className} flex min-h-[112px] items-center justify-center px-3 py-4 text-center md:min-h-[132px]`}
                  style={cardView.style}
                >
                  <div className="card-inner-overlay" />
                  <div className="relative z-10 card-word-text">{cardView.label}</div>
                </div>
              );
            })}
          </div>

          {selectedCard && canRevealCard && room.status !== "finished" && (
            <div className="rounded-[24px] border border-lime-300/25 bg-lime-500/10 p-4 shadow-xl backdrop-blur-sm">
              <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.2em] text-lime-100">
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
                    className="rounded-2xl bg-lime-500 px-6 py-4 font-black text-white hover:bg-lime-400"
                  >
                    تأكيد الاختيار
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="rounded-[26px] border border-white/10 bg-[#101522]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white/60">🧠 آخر clue</div>
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

                    <div className="grid gap-3 md:grid-cols-[1fr_130px]">
                      <input
                        name="clue_word"
                        placeholder="YOUR CLUE"
                        className="rounded-2xl border border-white/10 bg-white px-5 py-4 text-right text-2xl font-black text-black outline-none placeholder:text-black/30 shadow-inner"
                      />
                      <input
                        type="number"
                        name="clue_number"
                        min={1}
                        defaultValue={1}
                        className="rounded-2xl border border-white/10 bg-white px-5 py-4 text-center text-2xl font-black text-black outline-none shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-xl font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:bg-emerald-400"
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

              <div className="flex flex-col justify-end gap-3">
                {canEndTurn && (
                  <form action={endTurnAction} className="w-full">
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-xl font-black text-white shadow-[0_10px_25px_rgba(249,115,22,0.25)] hover:bg-orange-400"
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
                      className="w-full rounded-2xl border border-red-300/20 bg-red-500/10 px-6 py-4 text-lg font-black text-red-100 hover:bg-red-500/20"
                    >
                      🔄 إعادة اللعبة
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <TeamPanel
            title="Blue Team"
            theme="blue"
            operatives={blueOperatives}
            spymasters={blueSpymasters}
            remaining={room.blue_remaining}
          />

          <div
            className="rounded-[28px] border border-white/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(34,44,60,0.86), rgba(28,36,50,0.92))",
            }}
          >
            <div className="mb-3 text-center text-sm font-black uppercase tracking-wider text-white/75">
              👁️ Spectators
            </div>
            <div className="space-y-3">
              {spectators.length > 0 ? (
                spectators.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center text-lg font-black text-white"
                  >
                    {player.guest_name}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center text-sm text-white/45">
                  لا يوجد مشاهدون
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {inspectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#101522] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="text-2xl font-black text-white">تفاصيل الكرت</div>

            <div
              className="mt-5 h-32 rounded-2xl border border-white/10 shadow-lg"
              style={{
                backgroundImage: `url(${getCardBackground(inspectedCard.card_type)})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/50">الكلمة</div>
              <div className="mt-2 text-3xl font-black text-white">
                {inspectedCard.word}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/50">النوع</div>
              <div className="mt-2 text-xl font-black text-white">
                {inspectedCard.card_type === "red"
                  ? "orange"
                  : inspectedCard.card_type}
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

      {room.status === "finished" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#101522] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="text-center">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-white/45">
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

      <style>{`
        .card-shell {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
          transform-style: preserve-3d;
          backface-visibility: hidden;
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
          text-align: center;
          color: #f7fafc;
          font-size: 1.85rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: 0;
          text-transform: none;
          text-shadow:
            0 2px 0 rgba(0, 0, 0, 0.5),
            0 6px 20px rgba(0, 0, 0, 0.55),
            0 0 12px rgba(0, 0, 0, 0.25);
          filter: drop-shadow(0 2px 10px rgba(0,0,0,0.35));
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .mobile-card {
          border-radius: 14px;
          box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .mobile-card-word {
          font-size: clamp(0.72rem, 3.1vw, 1rem);
          line-height: 1.05;
        }

        .mobile-summary-card,
        .mobile-log-card,
        .mobile-board-wrap {
          backdrop-filter: blur(6px);
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

        @media (max-width: 420px) {
          .mobile-card-word {
            font-size: clamp(0.68rem, 3vw, 0.92rem);
          }
        }

        @media (orientation: landscape) and (max-width: 1180px) {
          .mobile-card {
            aspect-ratio: 0.92 / 1 !important;
          }

          .mobile-card-word {
            font-size: clamp(0.68rem, 1.8vw, 0.95rem);
            line-height: 1.02;
          }
        }
      `}</style>
    </div>
  );
}