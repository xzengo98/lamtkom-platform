"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  cardIds: string[];
  words: string[];
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
  updatePlayerInGameAction: ServerAction;
};

const BLUE_TEAM_IMAGE = "https://k.top4top.io/p_3739o1dbh1.png";
const ORANGE_TEAM_IMAGE = "https://l.top4top.io/p_3739qbt1f2.png";

const BLUE_PANEL_BG =
  "https://k.top4top.io/p_3742ekh784.png";

const ORANGE_PANEL_BG =
  "https://j.top4top.io/p_3742lmfye3.png";

const CARD_BACKGROUNDS = {
  neutral: "https://h.top4top.io/p_3742cs7mz1.png",
  blue: "https://k.top4top.io/p_3742ekh784.png",
  orange:
    "https://j.top4top.io/p_3742lmfye3.png",
  black:
    "https://i.top4top.io/p_3742tlx0q2.png",
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

function getPlayerDisplayName(player: PlayerRow) {
  return player.guest_name?.trim() || "لاعب";
}

function getRoleLabel(role: string | null | undefined) {
  if (role === "spymaster") return "Spymaster";
  if (role === "spectator") return "Spectator";
  return "Operative";
}

function normalizePlayers(rows: PlayerRow[]) {
  return rows.map((player) => {
    const normalizedTeam = player.team?.toLowerCase() ?? "spectator";
    const normalizedRole =
      player.role?.toLowerCase() ??
      (normalizedTeam === "spectator" ? "spectator" : "operative");

    return {
      ...player,
      team: normalizedTeam,
      role: normalizedRole,
    };
  });
}

function TeamSidebarCard({
  theme,
  operatives,
  spymasters,
  remaining,
  reverseScore = false,
}: {
  theme: "blue" | "orange";
  operatives: PlayerRow[];
  spymasters: PlayerRow[];
  remaining: number | null;
  reverseScore?: boolean;
}) {
  const isBlue = theme === "blue";
  const imageUrl = isBlue ? BLUE_TEAM_IMAGE : ORANGE_TEAM_IMAGE;
  const panelBg = isBlue ? BLUE_PANEL_BG : ORANGE_PANEL_BG;

  return (
    <div className="space-y-4">
      <div
        className={`sidebar-role-card relative overflow-hidden rounded-[28px] border ${
          isBlue ? "border-cyan-300/25" : "border-orange-300/25"
        }`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(16,26,40,0.78), rgba(16,26,40,0.9)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative z-10 p-4">
          <div
            className={`text-center text-sm font-black uppercase tracking-wide ${
              isBlue ? "text-cyan-100" : "text-orange-100"
            }`}
          >
            Operatives
          </div>
          <div className="mt-16 min-h-[16px]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      <div className={`score-strip ${reverseScore ? "flex-row-reverse" : ""}`}>
        <div
          className="score-number"
          style={{
            color: isBlue ? "#bff4ff" : "#fff5f5",
            textShadow: isBlue
              ? "0 0 0 rgba(0,0,0,0), 0 3px 0 #0266a8, 0 7px 18px rgba(0,0,0,.35)"
              : "0 0 0 rgba(0,0,0,0), 0 3px 0 #b12f0e, 0 7px 18px rgba(0,0,0,.35)",
          }}
        >
          {remaining ?? 0}
        </div>

        <div
          className="relative overflow-hidden rounded-[18px] border border-white/15"
          style={{
            width: 126,
            height: 86,
            backgroundImage: `linear-gradient(180deg, rgba(10,16,28,0.68), rgba(10,16,28,0.8)), url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      <div
        className={`sidebar-role-card relative overflow-hidden rounded-[28px] border ${
          isBlue ? "border-cyan-300/25" : "border-orange-300/25"
        }`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(16,26,40,0.78), rgba(16,26,40,0.9)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative z-10 p-4">
          <div
            className={`text-center text-sm font-black uppercase tracking-wide ${
              isBlue ? "text-cyan-100" : "text-orange-100"
            }`}
          >
            Spymasters
          </div>

          <div className="mt-4">
            {spymasters.length > 0 ? (
              <div className="space-y-2">
                {spymasters.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-2xl bg-black/25 px-3 py-2 text-center text-2xl font-black text-white"
                  >
                    {getPlayerDisplayName(player)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-black/20 px-3 py-5 text-center text-sm text-white/45">
                لا يوجد
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[24px] border border-white/12 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.26)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(14,25,40,0.88), rgba(14,25,40,0.94)), url(${panelBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center text-sm font-black uppercase tracking-wide text-white/90">
          Team Members
        </div>

        <div className="mt-3 space-y-2">
          {[...spymasters, ...operatives].length > 0 ? (
            [...spymasters, ...operatives].map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-center text-base font-black text-white"
              >
                {getPlayerDisplayName(player)}
                <div className="mt-1 text-[11px] font-semibold uppercase text-white/50">
                  {getRoleLabel(player.role)}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4 text-center text-sm text-white/45">
              لا يوجد لاعبون
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileTeamTopCard({
  title,
  theme,
  remaining,
  operatives,
  spymasters,
}: {
  title: string;
  theme: "blue" | "orange";
  remaining: number | null;
  operatives: PlayerRow[];
  spymasters: PlayerRow[];
}) {
  const isBlue = theme === "blue";
  const bg = isBlue ? BLUE_PANEL_BG : ORANGE_PANEL_BG;

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border ${
        isBlue ? "border-cyan-300/25" : "border-orange-300/25"
      } p-2.5`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(18,28,42,0.85), rgba(18,28,42,0.93)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/85">
        {title}
      </div>

      <div
        className={`mt-2 text-center text-3xl font-black ${
          isBlue ? "text-cyan-100" : "text-orange-100"
        }`}
      >
        {remaining ?? 0}
      </div>

      <div className="mt-2 space-y-1">
        <div className="rounded-xl bg-black/25 px-2 py-1 text-center text-[10px] font-bold text-white">
          Operatives {operatives.length}
        </div>
        <div className="rounded-xl bg-black/25 px-2 py-1 text-center text-[10px] font-bold text-white">
          Spymasters {spymasters.length}
        </div>
      </div>
    </div>
  );
}

function MobileLogCard({
  previewSelection,
  sortedTurns,
}: {
  previewSelection: PreviewSelection;
  sortedTurns: TurnRow[];
}) {
  return (
    <div className="rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(78,78,82,0.86),rgba(42,42,46,0.96))] p-2.5 shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
      <div className="text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/60">
        Game Log
      </div>

      <div className="mt-2 h-[114px] overflow-y-auto rounded-[14px] border border-white/10 bg-black/10 p-2">
        {previewSelection ? (
          <div className="rounded-xl border border-lime-300/20 bg-lime-500/10 p-2">
            <div className="text-[10px] font-black uppercase text-lime-100">Preview</div>
            <div className="mt-1 text-xs font-black text-white">
              {previewSelection.playerName}: {previewSelection.words.join(" • ")}
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
  updatePlayerInGameAction,
}: Props) {
  const [room, setRoom] = useState<RoomRow>(initialRoom);
  const [cards, setCards] = useState<CardRow[]>(initialCards);
  const [players, setPlayers] = useState<PlayerRow[]>(normalizePlayers(initialPlayers));
  const [turns, setTurns] = useState<TurnRow[]>(initialTurns);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [previewSelection, setPreviewSelection] = useState<PreviewSelection>(null);
  const [openedRevealedCardIds, setOpenedRevealedCardIds] = useState<string[]>([]);
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [cluePopup, setCluePopup] = useState<{
    turnId: string;
    word: string;
    number: number;
    team: string | null;
  } | null>(null);

  const previousCardsRef = useRef<CardRow[]>(initialCards);
  const lastShownTurnIdRef = useRef<string | null>(null);
  const cluePopupTimeoutRef = useRef<number | null>(null);

  const currentPlayer = useMemo(
    () => players.find((player) => player.id === currentPlayerId) || null,
    [players, currentPlayerId]
  );

  const activeTurn = useMemo(
    () =>
      [...turns]
        .filter((turn) => turn.turn_status === "active")
        .sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        })[0] || null,
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

  const selectedCardSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);
  const previewCardSet = useMemo(
    () => new Set(previewSelection?.cardIds ?? []),
    [previewSelection]
  );
  const openedRevealedCardSet = useMemo(
    () => new Set(openedRevealedCardIds),
    [openedRevealedCardIds]
  );

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
    if (!selectedCardIds.length) return;

    const remainingSelectedIds = selectedCardIds.filter((id) => {
      const target = cards.find((card) => card.id === id);
      return target && !target.is_revealed;
    });

    if (remainingSelectedIds.length !== selectedCardIds.length) {
      setSelectedCardIds(remainingSelectedIds);
      const selectedCards = cards.filter((card) => remainingSelectedIds.includes(card.id));
      void sendPreview(selectedCards);
    }
  }, [cards, selectedCardIds]);

  useEffect(() => {
    const validOpenedIds = openedRevealedCardIds.filter((id) => {
      const target = cards.find((card) => card.id === id);
      return Boolean(target?.is_revealed);
    });

    if (validOpenedIds.length !== openedRevealedCardIds.length) {
      setOpenedRevealedCardIds(validOpenedIds);
    }
  }, [cards, openedRevealedCardIds]);

  useEffect(() => {
    if (!canRevealCard || room.status === "finished") {
      if (selectedCardIds.length > 0) {
        setSelectedCardIds([]);
        void sendPreview([]);
      }
    }
  }, [canRevealCard, room.status, selectedCardIds.length]);

  useEffect(() => {
    if (!activeTurn?.id) return;

    if (lastShownTurnIdRef.current === activeTurn.id) return;

    lastShownTurnIdRef.current = activeTurn.id;

    if (cluePopupTimeoutRef.current) {
      window.clearTimeout(cluePopupTimeoutRef.current);
    }

    setCluePopup({
      turnId: activeTurn.id,
      word: activeTurn.clue_word,
      number: activeTurn.clue_number,
      team: activeTurn.team,
    });

    cluePopupTimeoutRef.current = window.setTimeout(() => {
      setCluePopup(null);
    }, 5000);

    return () => {
      if (cluePopupTimeoutRef.current) {
        window.clearTimeout(cluePopupTimeoutRef.current);
      }
    };
  }, [activeTurn?.id, activeTurn?.clue_word, activeTurn?.clue_number, activeTurn?.team]);

  useEffect(() => {
    return () => {
      if (cluePopupTimeoutRef.current) {
        window.clearTimeout(cluePopupTimeoutRef.current);
      }
    };
  }, []);

  async function sendPreview(selectedCards: CardRow[]) {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`codenames-preview-${room.room_code}`);

    if (!selectedCards.length) {
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
        cardIds: selectedCards.map((card) => card.id),
        words: selectedCards.map((card) => card.word),
        team: safeCurrentPlayer.team,
      } satisfies PreviewSelection,
    });
  }

  function toggleCardSelection(card: CardRow) {
    if (!canRevealCard || card.is_revealed) return;

    setSelectedCardIds((prev) => {
      const next = prev.includes(card.id)
        ? prev.filter((id) => id !== card.id)
        : [...prev, card.id];

      const nextSelectedCards = cards.filter((item) => next.includes(item.id));
      void sendPreview(nextSelectedCards);

      return next;
    });
  }

  function toggleOpenedRevealedCard(cardId: string) {
    setOpenedRevealedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  }

  function getCardView(card: CardRow) {
    const isPending = selectedCardSet.has(card.id);
    const realBg = getCardBackground(card.card_type);

    const baseStyle: CSSProperties = {
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
        label: "",
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

  function renderSettingsModal() {
    if (!showSettings || !safeCurrentPlayer.is_host) return null;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
        <div className="w-full max-w-3xl rounded-[24px] border border-white/10 bg-[#15181f] shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
            <div className="text-lg font-black text-white sm:text-2xl">⚙️ إعدادات اللعبة وإدارة اللاعبين</div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-black text-white hover:bg-white/10"
            >
              إغلاق
            </button>
          </div>

          <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-5">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-sm font-semibold text-white/55">إجمالي اللاعبين</div>
                <div className="mt-2 text-3xl font-black text-white">{players.length}</div>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4 text-center">
                <div className="text-sm font-semibold text-cyan-100/80">Blue Team</div>
                <div className="mt-2 text-3xl font-black text-cyan-100">{bluePlayers.length}</div>
              </div>
              <div className="rounded-2xl border border-orange-300/20 bg-orange-500/10 p-4 text-center">
                <div className="text-sm font-semibold text-orange-100/80">Orange Team</div>
                <div className="mt-2 text-3xl font-black text-orange-100">{orangePlayers.length}</div>
              </div>
            </div>

            <div className="space-y-3">
              {players.map((player) => (
                <form
                  key={player.id}
                  action={updatePlayerInGameAction}
                  className="rounded-[20px] border border-white/10 bg-white/5 p-3 sm:p-4"
                >
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                  <input type="hidden" name="target_player_id" value={player.id} />

                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-black text-white">
                        {getPlayerDisplayName(player)}
                      </div>
                      <div className="mt-1 text-xs font-semibold uppercase text-white/45">
                        {getRoleLabel(player.role)} • {player.team || "spectator"}
                        {player.is_host ? " • Host" : ""}
                      </div>
                    </div>

                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/70">
                      ID: {player.id.slice(0, 8)}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <select
                      name="team"
                      defaultValue={player.team ?? "spectator"}
                      className="rounded-2xl border border-white/10 bg-[#0d1118] px-4 py-3 font-bold text-white outline-none"
                    >
                      <option value="blue">Blue Team</option>
                      <option value="red">Orange Team</option>
                      <option value="spectator">Spectator</option>
                    </select>

                    <select
                      name="role"
                      defaultValue={
                        player.team === "spectator"
                          ? "spectator"
                          : player.role ?? "operative"
                      }
                      className="rounded-2xl border border-white/10 bg-[#0d1118] px-4 py-3 font-bold text-white outline-none"
                    >
                      <option value="operative">Operative</option>
                      <option value="spymaster">Spymaster</option>
                      <option value="spectator">Spectator</option>
                    </select>

                    <button
                      type="submit"
                      className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white hover:bg-emerald-400"
                    >
                      حفظ
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSpectatorJoinBox() {
    if (safeCurrentPlayer.team !== "spectator") return null;

    return (
      <div className="rounded-[20px] border border-yellow-300/25 bg-yellow-500/10 p-3 shadow-[0_14px_32px_rgba(0,0,0,0.2)] sm:p-4">
        <div className="text-center text-sm font-black uppercase tracking-[0.14em] text-yellow-100">
          يمكنك الانضمام للعبة الآن
        </div>

        <div className="mt-2 text-center text-sm font-semibold text-white/75">
          دخلت كمشاهد لأن اللعبة بدأت بالفعل لكن يمكنك اختيار فريقك الآن
        </div>

        <form action={updatePlayerInGameAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="room_code" value={room.room_code} />
          <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
          <input type="hidden" name="target_player_id" value={safeCurrentPlayer.id} />

          <select
            name="team"
            defaultValue="blue"
            className="rounded-2xl border border-white/10 bg-[#0d1118] px-4 py-3 font-bold text-white outline-none"
          >
            <option value="blue">Blue Team</option>
            <option value="red">Orange Team</option>
          </select>

          <select
            name="role"
            defaultValue="operative"
            className="rounded-2xl border border-white/10 bg-[#0d1118] px-4 py-3 font-bold text-white outline-none"
          >
            <option value="operative">Operative</option>
            <option value="spymaster">Spymaster</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400"
          >
            انضم الآن
          </button>
        </form>
      </div>
    );
  }

  function renderTurnIndicator() {
    const isBlueTurn = room.current_turn_team === "blue";
    const isOrangeTurn = room.current_turn_team === "red";

    return (
      <div
        className="rounded-[22px] border border-white/10 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)]"
        style={{
          backgroundImage:
            isBlueTurn
              ? `linear-gradient(180deg, rgba(8,16,30,0.88), rgba(8,16,30,0.92)), url(${BLUE_PANEL_BG})`
              : isOrangeTurn
              ? `linear-gradient(180deg, rgba(20,10,6,0.86), rgba(20,10,6,0.92)), url(${ORANGE_PANEL_BG})`
              : "linear-gradient(180deg, rgba(18,24,36,0.92), rgba(18,24,36,0.96))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center text-xs font-black uppercase tracking-[0.18em] text-white/55">
          Turn Indicator
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <div
            className={`rounded-full px-4 py-2 text-sm font-black uppercase ${
              isBlueTurn
                ? "bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-300/30"
                : "bg-white/8 text-white/65"
            }`}
          >
            🔵 Blue Team
          </div>

          <div className="text-sm font-black text-white/35">VS</div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-black uppercase ${
              isOrangeTurn
                ? "bg-orange-500/20 text-orange-100 ring-2 ring-orange-300/30"
                : "bg-white/8 text-white/65"
            }`}
          >
            🟠 Orange Team
          </div>
        </div>

        <div className="mt-3 text-center text-xl font-black text-white md:text-2xl">
          {room.status === "finished"
            ? "انتهت اللعبة"
            : `الدور الحالي: ${getTurnLabel(room.current_turn_team)}`}
        </div>
      </div>
    );
  }

  function renderRevealedCard(card: CardRow, mobile: boolean) {
    const cardView = getCardView(card);
    const isOpened = openedRevealedCardSet.has(card.id);
    const wrapperClass = mobile
      ? "mobile-card aspect-[1.05] min-h-0"
      : "board-desktop-card min-h-[122px]";

    return (
      <button
        key={card.id}
        type="button"
        onClick={() => toggleOpenedRevealedCard(card.id)}
        className={`${cardView.className} ${wrapperClass} group relative flex items-center justify-center px-3 py-4 text-center`}
        style={cardView.style}
      >
        <div className="card-inner-overlay" />

        {isOpened ? (
          <div className="card-open-word-panel">
            <div className="card-open-word-text">{card.word}</div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/5 opacity-0 transition group-hover:opacity-100" />
        )}
      </button>
    );
  }

  function renderSelectableCard(card: CardRow, mobile: boolean) {
    const cardView = getCardView(card);
    const isSelected = selectedCardSet.has(card.id);
    const isPreviewed = previewCardSet.has(card.id);
    const isRemotePreview =
      isPreviewed && previewSelection && previewSelection.playerId !== safeCurrentPlayer.id;

    const wrapperClass = mobile
      ? "mobile-card aspect-[1.05] min-h-0"
      : "board-desktop-card min-h-[122px]";

    const textClass = mobile ? "mobile-card-word" : "card-word-text";

    return (
      <div key={card.id} className="relative">
        <button
          type="button"
          onClick={() => {
            if (canRevealCard) {
              toggleCardSelection(card);
            }
          }}
          className={`${cardView.className} ${wrapperClass} ${
            canRevealCard ? "card-hover-up" : ""
          } flex w-full items-center justify-center px-3 py-4 text-center ${
            isPreviewed ? "card-previewed" : ""
          }`}
          style={cardView.style}
        >
          <div className="card-inner-overlay" />
          <div className={`relative z-10 ${textClass}`}>{cardView.label}</div>
        </button>

        {isPreviewed && previewSelection && (
          <div className="pointer-events-none absolute inset-x-2 bottom-2 z-20">
            <div
              className={`rounded-full px-2 py-1 text-center text-[10px] font-black uppercase shadow-lg ${
                previewSelection.team === "blue"
                  ? "bg-cyan-500/90 text-white"
                  : previewSelection.team === "red"
                  ? "bg-orange-500/90 text-white"
                  : "bg-white/90 text-black"
              }`}
            >
              {isRemotePreview
                ? `${previewSelection.playerName} يفكر`
                : "تم التحديد"}
            </div>
          </div>
        )}

        {isSelected && canRevealCard && (
          <form
            action={async (formData) => {
              await revealCardAction(formData);
              const nextIds = selectedCardIds.filter((id) => id !== card.id);
              setSelectedCardIds(nextIds);
              const nextCards = cards.filter((item) => nextIds.includes(item.id));
              await sendPreview(nextCards);
            }}
            className="absolute right-2 top-2 z-30"
          >
            <input type="hidden" name="room_code" value={room.room_code} />
            <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
            <input type="hidden" name="card_id" value={card.id} />
            <button
              type="submit"
              className="confirm-card-btn flex h-10 w-10 items-center justify-center rounded-full bg-lime-500 text-lg font-black text-white shadow-[0_8px_22px_rgba(101,163,13,0.35)] hover:bg-lime-400"
              title="تأكيد الاختيار"
            >
              ✓
            </button>
          </form>
        )}
      </div>
    );
  }

  function renderSpyMasterCard(card: CardRow, mobile: boolean) {
    const cardView = getCardView(card);
    const wrapperClass = mobile
      ? "mobile-card aspect-[1.05] min-h-0"
      : "board-desktop-card min-h-[122px]";
    const textClass = mobile ? "mobile-card-word" : "card-word-text";

    return (
      <button
        key={card.id}
        type="button"
        className={`${cardView.className} ${wrapperClass} flex w-full items-center justify-center px-3 py-4 text-center`}
        style={cardView.style}
      >
        <div className="card-inner-overlay" />
        <div className={`relative z-10 ${textClass}`}>{cardView.label}</div>
      </button>
    );
  }

  function renderNeutralUnrevealedCard(card: CardRow, mobile: boolean) {
    const cardView = getCardView(card);
    const wrapperClass = mobile
      ? "mobile-card aspect-[1.05] min-h-0"
      : "board-desktop-card min-h-[122px]";
    const textClass = mobile ? "mobile-card-word" : "card-word-text";

    return (
      <div
        key={card.id}
        className={`${cardView.className} ${wrapperClass} flex items-center justify-center px-3 py-4 text-center`}
        style={cardView.style}
      >
        <div className="card-inner-overlay" />
        <div className={`relative z-10 ${textClass}`}>{cardView.label}</div>
      </div>
    );
  }

  function renderBoardCard(card: CardRow, mobile: boolean) {
    if (card.is_revealed) {
      return renderRevealedCard(card, mobile);
    }

    if (canRevealCard) {
      return renderSelectableCard(card, mobile);
    }

    if (isSpymaster) {
      return renderSpyMasterCard(card, mobile);
    }

    return renderNeutralUnrevealedCard(card, mobile);
  }

  return (
    <div className="relative mx-auto w-full max-w-[1840px] p-2 sm:p-3 xl:p-4">
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_28%),linear-gradient(180deg,#07111d_0%,#16283a_100%)] sm:rounded-[40px]" />

      {renderSettingsModal()}

      {cluePopup && (
        <div className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div
            className={`clue-popup rounded-[30px] border px-10 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl ${
              cluePopup.team === "blue"
                ? "border-cyan-300/25 bg-cyan-950/60"
                : cluePopup.team === "red"
                ? "border-orange-300/25 bg-orange-950/60"
                : "border-white/20 bg-black/70"
            }`}
          >
            <div className="text-sm font-black uppercase tracking-[0.2em] text-white/60">
              CLUE
            </div>

            <div className="mt-2 text-5xl font-black text-white md:text-6xl">
              {cluePopup.word}
            </div>

            <div
              className={`mt-2 text-xl font-black ${
                cluePopup.team === "blue"
                  ? "text-cyan-100"
                  : cluePopup.team === "red"
                  ? "text-orange-100"
                  : "text-white/80"
              }`}
            >
              {cluePopup.number}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-black/20 px-3 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/games/codenames/room/${room.room_code}?player_id=${safeCurrentPlayer.id}`}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-sm font-black text-white hover:bg-white/10"
          >
            العودة للروم
          </Link>

          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-black text-white">
            {getPlayerDisplayName(safeCurrentPlayer)}
          </div>
        </div>

        <div className="hidden text-center xl:block">
          <div className="text-4xl font-black uppercase text-white">
            {room.status === "finished"
              ? room.assassin_revealed
                ? "Assassin was revealed"
                : "Game Finished"
              : previewSelection
              ? `${previewSelection.playerName} يفكر في ${previewSelection.words.join(" • ")}`
              : "Give your operatives a clue"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {safeCurrentPlayer.is_host && (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-black text-white hover:bg-white/10"
            >
              ⚙️ Settings
            </button>
          )}
        </div>
      </div>

      {/* MOBILE / TABLET */}
      <div className="xl:hidden">
        <div className="space-y-3">
          {renderTurnIndicator()}

          <div className="grid grid-cols-[92px_minmax(115px,1fr)_92px] gap-2">
            <MobileTeamTopCard
              title="Blue"
              theme="blue"
              remaining={room.blue_remaining}
              operatives={blueOperatives}
              spymasters={blueSpymasters}
            />

            <MobileLogCard
              previewSelection={previewSelection}
              sortedTurns={sortedTurns}
            />

            <MobileTeamTopCard
              title="Orange"
              theme="orange"
              remaining={room.red_remaining}
              operatives={orangeOperatives}
              spymasters={orangeSpymasters}
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
                : previewSelection
                ? `${previewSelection.playerName} يفكر في ${previewSelection.words.join(" • ")}`
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

          {renderSpectatorJoinBox()}

          <div className="mobile-board-wrap rounded-[20px] border border-white/10 bg-[#0d1522]/70 p-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
            <div className="grid grid-cols-5 gap-2">
              {cards.map((card) => renderBoardCard(card, true))}
            </div>
          </div>

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
                        {getPlayerDisplayName(player)}
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

      {/* DESKTOP */}
      <div className="hidden xl:grid xl:grid-cols-[280px_minmax(0,1fr)_280px] xl:gap-6">
        <div className="space-y-5">
          <TeamSidebarCard
            theme="blue"
            operatives={blueOperatives}
            spymasters={blueSpymasters}
            remaining={room.blue_remaining}
          />
        </div>

        <div className="space-y-5">
          {renderTurnIndicator()}
          {renderSpectatorJoinBox()}

          <div className="grid grid-cols-5 gap-4">
            {cards.map((card) => renderBoardCard(card, false))}
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[#101522]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_230px]">
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
          <TeamSidebarCard
            theme="orange"
            operatives={orangeOperatives}
            spymasters={orangeSpymasters}
            remaining={room.red_remaining}
            reverseScore
          />

          <div
            className="rounded-[28px] border border-white/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(66,66,70,0.9), rgba(34,34,38,0.96))",
            }}
          >
            <div className="mb-3 text-center text-sm font-black uppercase tracking-wider text-white/75">
              Game Log
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {previewSelection && (
                <div className="rounded-2xl border border-lime-300/20 bg-lime-500/10 p-3">
                  <div className="text-xs font-black uppercase text-lime-100">Preview</div>
                  <div className="mt-2 text-base font-black text-white">
                    {previewSelection.playerName} حدّد: {previewSelection.words.join(" • ")}
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
                    {getPlayerDisplayName(player)}
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

      {room.status === "finished" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
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
          border-radius: 18px;
          border: 2px solid rgba(255, 255, 255, 0.12);
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

.card-word-text {
  font-size: clamp(1.2rem, 1.6vw, 1.9rem);
  font-weight: 900;
  line-height: 1.1;
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
        }

        .card-previewed {
          border-color: rgba(255, 255, 255, 0.42) !important;
          box-shadow:
            0 0 0 2px rgba(255, 255, 255, 0.08),
            0 16px 32px rgba(0, 0, 0, 0.2);
        }

        .card-flip-reveal {
          animation: flipRevealPro 760ms cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center center;
          will-change: transform, filter, box-shadow;
        }

        .board-desktop-card {
          border-radius: 16px;
          box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .sidebar-role-card {
          min-height: 170px;
          box-shadow:
            0 18px 38px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .score-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .score-number {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1;
        }

        .mobile-card {
          border-radius: 14px;
          box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .mobile-card-word {
  width: 100%;
  text-align: center;
  color: #f7fafc;

  /* 👇 تكبير الخط بشكل واضح */
  font-size: clamp(0.95rem, 3.8vw, 1.35rem);

  font-weight: 900;
  line-height: 1.15;

  text-shadow:
    0 2px 0 rgba(0, 0, 0, 0.6),
    0 6px 20px rgba(0, 0, 0, 0.65),
    0 0 12px rgba(0, 0, 0, 0.3);

  word-break: break-word;
  overflow-wrap: anywhere;
}

        .confirm-card-btn {
          animation: confirmPopIn 180ms ease;
        }

        .clue-popup {
          animation: cluePopIn 320ms ease, cluePopOut 420ms ease 4.55s forwards;
        }

        .card-open-word-panel {
          position: absolute;
          inset: auto 12px 12px 12px;
          z-index: 12;
          border-radius: 14px;
          border: 2px solid rgba(255,255,255,0.16);
          background: rgba(14, 83, 138, 0.92);
          box-shadow:
            0 10px 24px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.08);
          padding: 12px;
          animation: cardPanelIn 180ms ease;
        }

        .card-open-word-text {
          text-align: center;
          color: #ffffff;
          font-size: clamp(1rem, 2.4vw, 1.8rem);
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
          text-shadow:
            0 2px 0 rgba(0, 0, 0, 0.35),
            0 8px 18px rgba(0, 0, 0, 0.28);
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        @keyframes cardPanelIn {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes confirmPopIn {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes cluePopIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes cluePopOut {
          to {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(6px);
          }
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

        @media (max-width: 420px) {
          .mobile-card-word {
            font-size: clamp(0.68rem, 3vw, 0.95rem);
          }

          .card-open-word-text {
            font-size: clamp(0.82rem, 3.2vw, 1rem);
          }

          .card-open-word-panel {
            inset: auto 8px 8px 8px;
            padding: 8px;
          }
        }

        @media (orientation: landscape) and (max-width: 1180px) {
  .mobile-card-word {
    font-size: clamp(0.8rem, 2.2vw, 1.1rem);
    line-height: 1.05;
  }
}

          .mobile-card-word {
            font-size: clamp(0.66rem, 1.8vw, 0.92rem);
            line-height: 1.02;
          }

          .card-open-word-text {
            font-size: clamp(0.74rem, 1.8vw, 0.96rem);
          }
        }
      `}</style>
    </div>
  );
}