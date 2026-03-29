import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ name?: string }>;
};

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
  current_turn_team: string | null;
  starting_team: string | null;
  red_remaining: number | null;
  blue_remaining: number | null;
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

export default async function CodenamesBoardPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await getSupabaseServerClient();
  const { code } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentName = resolvedSearchParams?.name?.trim() || "";
  const roomCode = code.toUpperCase();

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .select(
      "id, room_code, status, current_turn_team, starting_team, red_remaining, blue_remaining"
    )
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!roomData) {
    notFound();
  }

  const room = roomData as RoomRow;

  const { data: cardsData, error: cardsError } = await supabase
    .from("codenames_cards")
    .select("id, room_id, position_index, word, card_type, is_revealed")
    .eq("room_id", room.id)
    .order("position_index", { ascending: true });

  if (cardsError) {
    throw new Error(cardsError.message);
  }

  const { data: playersData, error: playersError } = await supabase
    .from("codenames_players")
    .select("id, room_id, guest_name, team, role, is_host")
    .eq("room_id", room.id);

  if (playersError) {
    throw new Error(playersError.message);
  }

  const cards = (cardsData ?? []) as CardRow[];
  const players = (playersData ?? []) as PlayerRow[];
  const currentPlayer =
    players.find((player) => (player.guest_name?.trim() || "") === currentName) || null;

  const isSpymaster = currentPlayer?.role === "spymaster";

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
            {currentPlayer && (
              <div className="mt-2 text-sm text-white/60">
                اللاعب الحالي:
                <span className="mx-2 font-semibold text-white">
                  {currentPlayer.guest_name}
                </span>
                {isSpymaster ? "• Spymaster" : "• Operative"}
              </div>
            )}
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((card) => {
          const showSpymasterColor = isSpymaster && !card.is_revealed;

          let cardClasses =
            "rounded-2xl border border-white/10 bg-black/20 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";

          if (card.is_revealed) {
            if (card.card_type === "red") {
              cardClasses =
                "rounded-2xl border border-red-500/20 bg-red-500/20 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            } else if (card.card_type === "blue") {
              cardClasses =
                "rounded-2xl border border-blue-500/20 bg-blue-500/20 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            } else if (card.card_type === "assassin") {
              cardClasses =
                "rounded-2xl border border-white/10 bg-black p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            } else {
              cardClasses =
                "rounded-2xl border border-white/10 bg-white/10 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            }
          } else if (showSpymasterColor) {
            if (card.card_type === "red") {
              cardClasses =
                "rounded-2xl border border-red-500/20 bg-red-500/10 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            } else if (card.card_type === "blue") {
              cardClasses =
                "rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            } else if (card.card_type === "assassin") {
              cardClasses =
                "rounded-2xl border border-white/10 bg-black/70 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            } else {
              cardClasses =
                "rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[110px] flex items-center justify-center text-center text-white font-semibold";
            }
          }

          return (
            <div key={card.id} className={cardClasses}>
              {card.word}
            </div>
          );
        })}
      </div>
    </div>
  );
}