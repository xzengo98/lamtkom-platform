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
          if (payload.new) {
            setRoom(payload.new);
          }
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
        return "rounded-2xl border border-red-500/20 bg-red-500/20 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
      }
      if (card.card_type === "blue") {
        return "rounded-2xl border border-blue-500/20 bg-blue-500/20 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
      }
      if (card.card_type === "assassin") {
        return "rounded-2xl border border-white/10 bg-black p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
      }
      return "rounded-2xl border border-white/10 bg-white/10 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
    }

    if (showSpymasterColor) {
      if (card.card_type === "red") {
        return "rounded-2xl border border-red-500/20 bg-red-500/10 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
      }
      if (card.card_type === "blue") {
        return "rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
      }
      if (card.card_type === "assassin") {
        return "rounded-2xl border border-white/10 bg-black/70 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
      }
      return "rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
    }

    return "rounded-2xl border border-white/10 bg-black/20 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold hover:bg-black/30";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">لوحة Codenames</h1>
            <div className="mt-2 text-sm text-white/70">
              رمز الغرفة:
              <span className="ml-2 rounded-xl bg-black/30 px-3 py-1 font-mono text-white">
                {room.room_code}
              </span>
            </div>

            <div className="mt-2 text-sm text-white/60">
              اللاعب الحالي:
              <span className="mx-2 font-semibold text-white">
                {currentPlayer.guest_name}
              </span>
              • {currentPlayer.role}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              الأحمر المتبقي: {room.red_remaining ?? 0}
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
              الأزرق المتبقي: {room.blue_remaining ?? 0}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              الدور الحالي: {room.current_turn_team || "-"}
            </div>
          </div>
        </div>
      </div>

      {room.status === "finished" && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-100">
          <div className="text-2xl font-bold">
            انتهت اللعبة - الفائز: {room.winner_team === "red" ? "الأحمر" : "الأزرق"}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">آخر clue</h2>

            {activeTurn ? (
              <div className="mt-4 space-y-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm text-white/60">الكلمة</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {activeTurn.clue_word}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm text-white/60">العدد</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {activeTurn.clue_number}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm text-white/60">عدد الاختيارات الحالية</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {activeTurn.guesses_made ?? 0}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                لا يوجد clue حتى الآن
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">إرسال clue</h2>

            {canSubmitClue ? (
              <form action={submitClueAction} className="mt-4 space-y-3">
                <input type="hidden" name="room_code" value={room.room_code} />
                <input type="hidden" name="actor_player_id" value={currentPlayer.id} />

                <div>
                  <label className="mb-2 block text-sm text-white/70">الـ clue</label>
                  <input
                    name="clue_word"
                    placeholder="مثال: سفر"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    عدد الكلمات
                  </label>
                  <input
                    type="number"
                    name="clue_number"
                    min={1}
                    defaultValue={1}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
                >
                  إرسال clue
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                فقط Spymaster الخاص بالفريق الذي عليه الدور يستطيع إرسال clue
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">التحكم بالدور</h2>

            {canEndTurn ? (
              <form action={endTurnAction} className="mt-4">
                <input type="hidden" name="room_code" value={room.room_code} />
                <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-500"
                >
                  إنهاء الدور
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                لا يمكنك إنهاء الدور الآن
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {cards.map((card) => {
            const classes = getCardClasses(card);

            if (canRevealCard && !card.is_revealed) {
              return (
                <form key={card.id} action={revealCardAction}>
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                  <input type="hidden" name="card_id" value={card.id} />
                  <button type="submit" className={`${classes} w-full`}>
                    {card.word}
                  </button>
                </form>
              );
            }

            return (
              <div key={card.id} className={classes}>
                {card.word}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}