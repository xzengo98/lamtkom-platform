import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import RoomStatusWatcher from "@/components/codenames/room-status-watcher";
import {
  startCodenamesGame,
  updatePlayerRole,
  updatePlayerTeam,
} from "./actions";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ player_id?: string; error?: string }>;
};

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
};

type PlayerRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  team: string | null;
  role: string | null;
  is_host: boolean | null;
  joined_at: string | null;
};

function getPlayerDisplayName(player: PlayerRow) {
  return player.guest_name?.trim() || "لاعب";
}

function getRoleLabel(role: string | null) {
  if (role === "spymaster") return "Spymaster";
  if (role === "spectator") return "Spectator";
  return "Operative";
}

export default async function CodenamesRoomPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await getSupabaseServerClient();
  const { code } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPlayerId = resolvedSearchParams?.player_id?.trim() || "";
  const errorMessage = resolvedSearchParams?.error?.trim() || "";
  const roomCode = code.toUpperCase();

  const { data: roomData } = await supabase
    .from("codenames_rooms")
    .select("id, room_code, status")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (!roomData) {
    notFound();
  }

  const room = roomData as RoomRow;

  const { data: playersData } = await supabase
    .from("codenames_players")
    .select("id, room_id, guest_name, team, role, is_host, joined_at")
    .eq("room_id", room.id)
    .order("joined_at", { ascending: true });

  const players = ((playersData ?? []) as PlayerRow[]).map((player) => ({
    ...player,
    team: player.team?.toLowerCase() ?? null,
    role: player.role?.toLowerCase() ?? "operative",
  }));

  const currentPlayer = players.find((player) => player.id === currentPlayerId) || null;

  if (!currentPlayer) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          <h1 className="text-xl font-bold">تعذر تحديد اللاعب الحالي</h1>
          <p className="mt-2 text-sm">تأكد أن رابط الغرفة يحتوي على player_id صحيح</p>
        </div>
      </div>
    );
  }

  const safeCurrentPlayer = currentPlayer as PlayerRow;

  if (room.status === "active") {
    redirect(`/games/codenames/board/${room.room_code}?player_id=${safeCurrentPlayer.id}`);
  }

  const isHost = Boolean(safeCurrentPlayer.is_host);

  const bluePlayers = players.filter((player) => player.team === "blue");
  const redPlayers = players.filter((player) => player.team === "red");
  const spectators = players.filter((player) => player.team === "spectator");

  const blueSpymasters = bluePlayers.filter((player) => player.role === "spymaster");
  const redSpymasters = redPlayers.filter((player) => player.role === "spymaster");

  const canStartGame =
    bluePlayers.length > 0 &&
    redPlayers.length > 0 &&
    blueSpymasters.length === 1 &&
    redSpymasters.length === 1;

  function canManagePlayer(player: PlayerRow) {
    if (isHost) return true;
    return safeCurrentPlayer.id === player.id;
  }

  function SeatActions({ player }: { player: PlayerRow }) {
    const canManage = canManagePlayer(player);

    if (!canManage) {
      return <div className="text-sm text-white/45">لا يمكنك تعديل هذا اللاعب</div>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        <form action={updatePlayerTeam}>
          <input type="hidden" name="player_id" value={player.id} />
          <input type="hidden" name="room_code" value={room.room_code} />
          <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
          <input type="hidden" name="team" value="blue" />
          <button
            type="submit"
            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-black text-white hover:bg-cyan-400"
          >
            Blue
          </button>
        </form>

        <form action={updatePlayerTeam}>
          <input type="hidden" name="player_id" value={player.id} />
          <input type="hidden" name="room_code" value={room.room_code} />
          <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
          <input type="hidden" name="team" value="red" />
          <button
            type="submit"
            className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-black text-white hover:bg-red-400"
          >
            Red
          </button>
        </form>

        <form action={updatePlayerTeam}>
          <input type="hidden" name="player_id" value={player.id} />
          <input type="hidden" name="room_code" value={room.room_code} />
          <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
          <input type="hidden" name="team" value="spectator" />
          <button
            type="submit"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10"
          >
            Spectator
          </button>
        </form>

        {player.team !== "spectator" && (
          <>
            <form action={updatePlayerRole}>
              <input type="hidden" name="player_id" value={player.id} />
              <input type="hidden" name="room_code" value={room.room_code} />
              <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
              <input type="hidden" name="role" value="operative" />
              <button
                type="submit"
                className={`rounded-2xl px-4 py-2 text-sm font-black ${
                  player.role === "operative"
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Operative
              </button>
            </form>

            <form action={updatePlayerRole}>
              <input type="hidden" name="player_id" value={player.id} />
              <input type="hidden" name="room_code" value={room.room_code} />
              <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
              <input type="hidden" name="role" value="spymaster" />
              <button
                type="submit"
                className={`rounded-2xl px-4 py-2 text-sm font-black ${
                  player.role === "spymaster"
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Spymaster
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  function PlayerCard({
    player,
    theme,
  }: {
    player: PlayerRow;
    theme: "blue" | "red" | "spectator";
  }) {
    const wrapper =
      theme === "blue"
        ? "rounded-[24px] border border-cyan-300/25 bg-cyan-500/10 p-4"
        : theme === "red"
        ? "rounded-[24px] border border-red-300/25 bg-red-500/10 p-4"
        : "rounded-[24px] border border-white/10 bg-white/5 p-4";

    return (
      <div className={wrapper}>
        <div className="text-xl font-black text-white">{getPlayerDisplayName(player)}</div>
        <div className="mt-1 text-sm text-white/60">
          {getRoleLabel(player.role)}
          {player.is_host ? " • Host" : ""}
        </div>
        <div className="mt-4">
          <SeatActions player={player} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <RoomStatusWatcher roomCode={room.room_code} playerId={safeCurrentPlayer.id} />

      <div className="space-y-6">
        <div className="rounded-[34px] border border-white/10 bg-[#0a1020] p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/65">
                Room Lobby
              </div>
              <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
                Codenames
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span>رمز الغرفة</span>
                <span className="rounded-xl bg-black/30 px-3 py-1 font-mono text-white">
                  {room.room_code}
                </span>
              </div>
              <div className="mt-3 text-sm text-white/60">
                أنت داخل الغرفة باسم{" "}
                <span className="font-bold text-white">
                  {getPlayerDisplayName(safeCurrentPlayer)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/70">
                الحالة: {room.status || "waiting"}
              </div>

              {isHost && canStartGame && (
                <form action={startCodenamesGame}>
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                  <button
                    type="submit"
                    className="rounded-2xl bg-emerald-500 px-6 py-3 font-black text-white transition hover:bg-emerald-400"
                  >
                    ابدأ اللعبة
                  </button>
                </form>
              )}

              <Link
                href="/games/codenames/create"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white hover:bg-white/10"
              >
                إنشاء غرفة جديدة
              </Link>
            </div>
          </div>

          {isHost && !canStartGame && (
            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100">
              يجب أن يكون لكل فريق لاعب واحد على الأقل وSpymaster واحد فقط
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
              {decodeURIComponent(errorMessage)}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-500/10 p-5">
            <div className="text-sm font-semibold text-cyan-100/80">Blue Team</div>
            <div className="mt-3 text-4xl font-black text-white">{bluePlayers.length}</div>
          </div>

          <div className="rounded-[24px] border border-red-300/20 bg-red-500/10 p-5">
            <div className="text-sm font-semibold text-red-100/80">Red Team</div>
            <div className="mt-3 text-4xl font-black text-white">{redPlayers.length}</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white/60">Spectators</div>
            <div className="mt-3 text-4xl font-black text-white">{spectators.length}</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-semibold text-white/60">إجمالي اللاعبين</div>
            <div className="mt-3 text-4xl font-black text-white">{players.length}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-cyan-300/25 bg-cyan-500/10 p-5">
              <div className="mb-4 text-2xl font-black text-white">Blue Team</div>
              <div className="space-y-4">
                {bluePlayers.length > 0 ? (
                  bluePlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} theme="blue" />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-white/45">
                    لا يوجد لاعبون
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="mb-4 text-2xl font-black text-white">Spectators</div>
              <div className="space-y-4">
                {spectators.length > 0 ? (
                  spectators.map((player) => (
                    <PlayerCard key={player.id} player={player} theme="spectator" />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-white/45">
                    لا يوجد مشاهدون
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-red-300/25 bg-red-500/10 p-5">
              <div className="mb-4 text-2xl font-black text-white">Red Team</div>
              <div className="space-y-4">
                {redPlayers.length > 0 ? (
                  redPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} theme="red" />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-white/45">
                    لا يوجد لاعبون
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}