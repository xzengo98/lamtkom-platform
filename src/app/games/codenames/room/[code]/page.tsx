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
  joined_at?: string | null;
};

const BLUE_TEAM_IMAGE = "https://k.top4top.io/p_3741q6x0a1.png";
const ORANGE_TEAM_IMAGE = "https://l.top4top.io/p_3739qbt1f2.png";

function getPlayerDisplayName(player: PlayerRow) {
  return player.guest_name?.trim() || "لاعب";
}

function getRoleLabel(role: string | null) {
  if (role === "spymaster") return "🕵️ Spymaster";
  if (role === "spectator") return "👁️ Spectator";
  return "🎯 Operative";
}

function normalizePlayer(player: PlayerRow): PlayerRow {
  const normalizedTeam = player.team?.toLowerCase() || "spectator";
  const normalizedRole =
    player.role?.toLowerCase() || (normalizedTeam === "spectator" ? "spectator" : "operative");

  return {
    ...player,
    team: normalizedTeam,
    role: normalizedRole,
  };
}

function TeamLobbyCard({
  title,
  theme,
  image,
  players,
}: {
  title: string;
  theme: "blue" | "orange" | "neutral";
  image?: string;
  players: PlayerRow[];
}) {

  const wrapperClass =
    theme === "blue"
      ? "border-cyan-300/25 bg-cyan-500/10"
      : theme === "orange"
      ? "border-orange-300/25 bg-orange-500/10"
      : "border-white/10 bg-white/5";

  return (
    <div className={`rounded-[28px] border p-5 ${wrapperClass}`}>
      <div className="mb-4 text-2xl font-black text-white">{title}</div>

      <div className="space-y-4">
        {players.length > 0 ? (
          players.map((player) => (
            <div
              key={player.id}
              className="relative overflow-hidden rounded-[24px] border border-white/10 p-4"
              style={
                image
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-black/18" />
              <div className="relative z-10 rounded-2xl bg-black/20 p-4 backdrop-blur-[2px]">
                <div className="text-xl font-black text-white">{getPlayerDisplayName(player)}</div>
                <div className="mt-1 text-sm text-white/75">
                  {getRoleLabel(player.role)}
                  {player.is_host ? " • Host" : ""}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-white/45">
            {theme === "neutral" ? "لا يوجد مشاهدون" : "لا يوجد لاعبون"}
          </div>
        )}
      </div>
    </div>
  );
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

  const players = ((playersData ?? []) as PlayerRow[]).map(normalizePlayer);

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

  function SeatActions(player: PlayerRow) {
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
          <input type="hidden" name="team" value="spectator" />
          <button
            type="submit"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10"
          >
            Spectator
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
          <input type="hidden" name="team" value="blue" />
          <button
            type="submit"
            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-black text-white hover:bg-cyan-400"
          >
            Blue
          </button>
        </form>

        {player.team !== "spectator" && (
          <>
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1700px] p-4 md:p-6">
      <RoomStatusWatcher roomCode={room.room_code} playerId={safeCurrentPlayer.id} />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex-1">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
                Room Lobby
              </div>

              <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
                Codenames
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span>🏷️ رمز الغرفة</span>
                <span className="rounded-xl bg-black/30 px-3 py-1 font-mono text-white">
                  {room.room_code}
                </span>
              </div>

              <div className="mt-3 text-sm text-white/65">
                أنت داخل الغرفة باسم{" "}
                <span className="font-bold text-white">
                  {getPlayerDisplayName(safeCurrentPlayer)}
                </span>
              </div>
            </div>

            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <div
                className="rounded-[28px] border border-cyan-300/25 bg-cyan-500/10 p-5"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.22)), url(${BLUE_TEAM_IMAGE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="rounded-2xl bg-black/20 p-5 backdrop-blur-[2px]">
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
                    🔵 Blue Team
                  </div>
                  <div className="mt-3 text-3xl font-black text-white">
                    Operatives + Spymaster
                  </div>
                </div>
              </div>

              <div
                className="rounded-[28px] border border-orange-300/25 bg-orange-500/10 p-5"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.22)), url(${ORANGE_TEAM_IMAGE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="rounded-2xl bg-black/20 p-5 backdrop-blur-[2px]">
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-orange-100">
                    🟠 Orange Team
                  </div>
                  <div className="mt-3 text-3xl font-black text-white">
                    Operatives + Spymaster
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
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
                  🚀 ابدأ اللعبة
                </button>
              </form>
            )}

            <Link
              href="/games/codenames/create"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white hover:bg-white/10"
            >
              ➕ إنشاء غرفة جديدة
            </Link>
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
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 shadow-xl">
            <div className="text-sm font-semibold text-white/60">👥 إجمالي اللاعبين</div>
            <div className="mt-3 text-4xl font-black text-white">{players.length}</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className="text-sm font-semibold text-white/60">👁️ Spectators</div>
            <div className="mt-3 text-4xl font-black text-white">{spectators.length}</div>
          </div>

          <div className="rounded-[24px] border border-orange-300/20 bg-orange-500/10 p-5 shadow-xl">
            <div className="text-sm font-semibold text-orange-100/80">🟠 Red Team</div>
            <div className="mt-3 text-4xl font-black text-white">{redPlayers.length}</div>
          </div>

          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-500/10 p-5 shadow-xl">
            <div className="text-sm font-semibold text-cyan-100/80">🔵 Blue Team</div>
            <div className="mt-3 text-4xl font-black text-white">{bluePlayers.length}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <TeamLobbyCard
  title="Orange Team"
  theme="orange"
  image={ORANGE_TEAM_IMAGE}
  players={redPlayers}
/>

<TeamLobbyCard
  title="Spectators"
  theme="neutral"
  players={spectators}
/>

<TeamLobbyCard
  title="Blue Team"
  theme="blue"
  image={BLUE_TEAM_IMAGE}
  players={bluePlayers}
/>
        </div>

        <div className="hidden">
          {players.map((player) => (
            <div key={player.id}>{SeatActions(player)}</div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4">
            {redPlayers.length > 0 &&
              redPlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-[28px] border border-orange-300/25 bg-orange-500/10 p-5"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url(${ORANGE_TEAM_IMAGE})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="rounded-[24px] bg-black/20 p-4 backdrop-blur-[2px]">
                    <div className="text-2xl font-black text-white">{getPlayerDisplayName(player)}</div>
                    <div className="mt-2 text-sm text-white/80">
                      {getRoleLabel(player.role)}
                      {player.is_host ? " • Host" : ""}
                    </div>
                    <div className="mt-4">{SeatActions(player)}</div>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-4">
            {spectators.length > 0 &&
              spectators.map((player) => (
                <div
                  key={player.id}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl"
                >
                  <div className="rounded-[24px] bg-black/20 p-4">
                    <div className="text-2xl font-black text-white">{getPlayerDisplayName(player)}</div>
                    <div className="mt-2 text-sm text-white/80">
                      {getRoleLabel(player.role)}
                      {player.is_host ? " • Host" : ""}
                    </div>
                    <div className="mt-4">{SeatActions(player)}</div>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-4">
            {bluePlayers.length > 0 &&
              bluePlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-[28px] border border-cyan-300/25 bg-cyan-500/10 p-5"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url(${BLUE_TEAM_IMAGE})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="rounded-[24px] bg-black/20 p-4 backdrop-blur-[2px]">
                    <div className="text-2xl font-black text-white">{getPlayerDisplayName(player)}</div>
                    <div className="mt-2 text-sm text-white/80">
                      {getRoleLabel(player.role)}
                      {player.is_host ? " • Host" : ""}
                    </div>
                    <div className="mt-4">{SeatActions(player)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}