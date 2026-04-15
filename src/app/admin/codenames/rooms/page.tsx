import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  q?: string;
}>;

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
  created_at: string | null;
  current_turn_team: string | null;
  starting_team: string | null;
  red_remaining: number | null;
  blue_remaining: number | null;
  winner_team: string | null;
  assassin_revealed: boolean | null;
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
  is_revealed: boolean;
};

type TurnRow = {
  id: string;
  room_id: string;
  team: string | null;
  clue_word: string | null;
  clue_number: number | null;
  turn_status: string | null;
  created_at: string | null;
};

function getStatusLabel(status: string | null) {
  if (status === "active") return "نشطة";
  if (status === "finished") return "منتهية";
  return "بانتظار البدء";
}

function getStatusTone(status: string | null) {
  if (status === "active") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "finished") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-100";
  }

  return "border-white/10 bg-white/5 text-white";
}

function formatDate(value: string | null) {
  if (!value) return "غير معروف";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير معروف";

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function ensureAdmin() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

async function deleteRoomAction(formData: FormData) {
  "use server";

  const roomId = String(formData.get("room_id") ?? "").trim();
  if (!roomId) return;

  const supabase = await ensureAdmin();

  await supabase.from("codenames_cards").delete().eq("room_id", roomId);
  await supabase.from("codenames_turns").delete().eq("room_id", roomId);
  await supabase.from("codenames_players").delete().eq("room_id", roomId);
  await supabase.from("codenames_rooms").delete().eq("id", roomId);

  revalidatePath("/admin/codenames/rooms");
  revalidatePath("/admin");
}

async function bulkDeleteByStatusAction(formData: FormData) {
  "use server";

  const status = String(formData.get("status") ?? "").trim();
  if (!status) return;

  const supabase = await ensureAdmin();

  const { data: rooms } = await supabase
    .from("codenames_rooms")
    .select("id")
    .eq("status", status);

  const roomRows = (rooms ?? []) as { id: string }[];
  const roomIds = roomRows.map((room) => room.id);

  if (roomIds.length === 0) return;

  await supabase.from("codenames_cards").delete().in("room_id", roomIds);
  await supabase.from("codenames_turns").delete().in("room_id", roomIds);
  await supabase.from("codenames_players").delete().in("room_id", roomIds);
  await supabase.from("codenames_rooms").delete().in("id", roomIds);

  revalidatePath("/admin/codenames/rooms");
  revalidatePath("/admin");
}

function StatCard({
  label,
  value,
  tone = "slate",
  icon,
}: {
  label: string;
  value: number;
  tone?: "cyan" | "orange" | "emerald" | "slate";
  icon: string;
}) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    slate: "border-white/10 bg-white/5 text-white",
  };

  return (
    <div className={`rounded-[24px] border p-5 shadow-xl ${tones[tone]}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold text-white/60">{label}</span>
      </div>
      <div className="text-4xl font-black">{value}</div>
    </div>
  );
}

export default async function AdminCodenamesRoomsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await ensureAdmin();
  const params = await searchParams;

  const statusFilter = params?.status?.trim() || "";
  const query = params?.q?.trim().toLowerCase() || "";

  const [
    roomsResult,
    playersResult,
    cardsResult,
    turnsResult,
    waitingCountResult,
    activeCountResult,
    finishedCountResult,
  ] = await Promise.all([
    supabase
      .from("codenames_rooms")
      .select(
        "id, room_code, status, created_at, current_turn_team, starting_team, red_remaining, blue_remaining, winner_team, assassin_revealed"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("codenames_players")
      .select("id, room_id, guest_name, team, role, is_host"),

    supabase
      .from("codenames_cards")
      .select("id, room_id, is_revealed"),

    supabase
      .from("codenames_turns")
      .select(
        "id, room_id, team, clue_word, clue_number, turn_status, created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("codenames_rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting"),

    supabase
      .from("codenames_rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("codenames_rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "finished"),
  ]);

  const rooms = (roomsResult.data ?? []) as RoomRow[];
  const players = (playersResult.data ?? []) as PlayerRow[];
  const cards = (cardsResult.data ?? []) as CardRow[];
  const turns = (turnsResult.data ?? []) as TurnRow[];

  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = statusFilter ? room.status === statusFilter : true;
    const matchesQuery = query
      ? room.room_code.toLowerCase().includes(query)
      : true;

    return matchesStatus && matchesQuery;
  });

  const roomStats = filteredRooms.map((room) => {
    const roomPlayers = players.filter((item) => item.room_id === room.id);
    const roomCards = cards.filter((item) => item.room_id === room.id);
    const roomTurns = turns.filter((item) => item.room_id === room.id);
    const activeTurn =
      roomTurns.find((item) => item.turn_status === "active") ?? null;
    const revealedCount = roomCards.filter((item) => item.is_revealed).length;
    const host = roomPlayers.find((item) => item.is_host) ?? null;

    return {
      room,
      players: roomPlayers,
      cards: roomCards,
      turns: roomTurns,
      activeTurn,
      revealedCount,
      host,
      bluePlayers: roomPlayers.filter((item) => item.team === "blue").length,
      redPlayers: roomPlayers.filter((item) => item.team === "red").length,
      spectatorPlayers: roomPlayers.filter((item) => item.team === "spectator")
        .length,
      spymasters: roomPlayers.filter((item) => item.role === "spymaster")
        .length,
    };
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="space-y-8">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
            إدارة غرف Codenames
          </div>

          <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
            غرف وجلسات Codenames
          </h1>

          <p className="mt-3 max-w-3xl text-white/65">
            راقب الغرف الحالية، راجع حالتها، واحذف الغرف المنتهية أو غير المكتملة
            بالكامل من لوحة التحكم.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
            >
              الرجوع للوحة التحكم
            </Link>

            <Link
              href="/admin/codenames"
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 font-bold text-cyan-100 hover:bg-cyan-400/15"
            >
              إدارة Codenames
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="غرف بانتظار البدء"
            value={waitingCountResult.count ?? 0}
            tone="slate"
            icon="⏳"
          />
          <StatCard
            label="غرف نشطة"
            value={activeCountResult.count ?? 0}
            tone="emerald"
            icon="🟢"
          />
          <StatCard
            label="غرف منتهية"
            value={finishedCountResult.count ?? 0}
            tone="orange"
            icon="🏁"
          />
          <StatCard
            label="الغرف الظاهرة"
            value={filteredRooms.length}
            tone="cyan"
            icon="🚪"
          />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#0a1020] p-5 shadow-xl">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
            <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input
                type="text"
                name="q"
                defaultValue={params?.q ?? ""}
                placeholder="ابحث برمز الغرفة"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />

              <select
                name="status"
                defaultValue={statusFilter}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option value="">كل الحالات</option>
                <option value="waiting">بانتظار البدء</option>
                <option value="active">نشطة</option>
                <option value="finished">منتهية</option>
              </select>

              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
              >
                تطبيق
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <form action={bulkDeleteByStatusAction}>
                <input type="hidden" name="status" value="finished" />
                <button
                  type="submit"
                  className="rounded-2xl border border-orange-300/20 bg-orange-400/10 px-5 py-3 font-bold text-orange-100 hover:bg-orange-400/15"
                >
                  حذف كل الغرف المنتهية
                </button>
              </form>

              <form action={bulkDeleteByStatusAction}>
                <input type="hidden" name="status" value="active" />
                <button
                  type="submit"
                  className="rounded-2xl border border-red-300/20 bg-red-500/10 px-5 py-3 font-bold text-red-100 hover:bg-red-500/15"
                >
                  حذف كل الغرف غير المكتملة
                </button>
              </form>
            </div>
          </div>
        </div>

        {roomStats.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-white/55">
            لا توجد غرف مطابقة للفلاتر الحالية
          </div>
        ) : (
          <div className="grid gap-5">
            {roomStats.map((entry) => (
              <div
                key={entry.room.id}
                className="rounded-[30px] border border-white/10 bg-[#0a1020] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
              >
                <div className="grid gap-5 xl:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl bg-black/30 px-4 py-2 font-mono text-lg font-black text-white">
                        {entry.room.room_code}
                      </div>

                      <div
                        className={`rounded-full border px-4 py-2 text-sm font-bold ${getStatusTone(
                          entry.room.status
                        )}`}
                      >
                        {getStatusLabel(entry.room.status)}
                      </div>

                      {entry.host ? (
                        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75">
                          الهوست: {entry.host.guest_name}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-white/55">تاريخ الإنشاء</div>
                        <div className="mt-2 font-bold text-white">
                          {formatDate(entry.room.created_at)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-white/55">اللاعبون</div>
                        <div className="mt-2 font-bold text-white">
                          {entry.players.length} لاعب
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-white/55">الكروت</div>
                        <div className="mt-2 font-bold text-white">
                          {entry.revealedCount}/{entry.cards.length} مكشوف
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-white/55">الدور الحالي</div>
                        <div className="mt-2 font-bold text-white">
                          {entry.room.current_turn_team || "غير محدد"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                        <div className="text-sm text-cyan-100/70">Blue Team</div>
                        <div className="mt-2 text-xl font-black text-cyan-100">
                          {entry.bluePlayers}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-4">
                        <div className="text-sm text-orange-100/70">
                          Orange Team
                        </div>
                        <div className="mt-2 text-xl font-black text-orange-100">
                          {entry.redPlayers}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-white/55">Spectators</div>
                        <div className="mt-2 text-xl font-black text-white">
                          {entry.spectatorPlayers}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                        <div className="text-sm text-emerald-100/70">
                          Spymasters
                        </div>
                        <div className="mt-2 text-xl font-black text-emerald-100">
                          {entry.spymasters}
                        </div>
                      </div>
                    </div>

                    {entry.activeTurn ? (
                      <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                        <div className="text-sm text-emerald-100/70">
                          الدور النشط الحالي
                        </div>
                        <div className="mt-2 font-bold text-emerald-100">
                          {entry.activeTurn.team || "غير محدد"} • clue:{" "}
                          {entry.activeTurn.clue_word || "-"} •{" "}
                          {entry.activeTurn.clue_number ?? 0}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col justify-between gap-3 xl:w-[220px]">
                    <Link
                      href={`/games/codenames/join?room_code=${encodeURIComponent(
                        entry.room.room_code
                      )}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center font-bold text-white hover:bg-white/10"
                    >
                      فتح صفحة الانضمام
                    </Link>

                    <form action={deleteRoomAction}>
                      <input type="hidden" name="room_id" value={entry.room.id} />
                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-red-300/20 bg-red-500/10 px-5 py-3 font-bold text-red-100 hover:bg-red-500/15"
                      >
                        حذف الغرفة بالكامل
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}