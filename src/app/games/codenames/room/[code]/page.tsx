import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import RoomStatusWatcher from "@/components/codenames/room-status-watcher";
import {
  removePlayerFromRoom,
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

const BLUE_TEAM_IMAGE = "https://k.top4top.io/p_3739o1dbh1.png";
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

function TeamPreviewCard({
  title,
  image,
  tone,
}: {
  title: string;
  image: string;
  tone: "blue" | "orange";
}) {
  const borderTone =
    tone === "blue" ? "border-cyan-300/30" : "border-orange-300/30";

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border p-4 shadow-xl ${borderTone}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.18)), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/15" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/25 bg-black/20 shadow-xl">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div>
          <div className="text-sm font-black uppercase tracking-[0.18em] text-white/80">
            {tone === "blue" ? "🔵 Blue Team" : "🟠 Orange Team"}
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            Operatives + Spymaster
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamBlock({
  title,
  tone,
  players,
  emptyText,
  currentPlayer,
  canManagePlayer,
  roomCode,
}: {
  title: string;
  tone: "blue" | "orange" | "spectator";
  players: PlayerRow[];
  emptyText: string;
  currentPlayer: PlayerRow;
  canManagePlayer: (player: PlayerRow) => boolean;
  roomCode: string;
}) {
  const wrapperTone =
    tone === "blue"
      ? "border-cyan-300/25 bg-cyan-500/10"
      : tone === "orange"
      ? "border-orange-300/25 bg-orange-500/10"
      : "border-white/10 bg-white/5";

  const titleTone =
    tone === "blue"
      ? "text-cyan-100"
      : tone === "orange"
      ? "text-orange-100"
      : "text-white";

  return (
    <div className={`rounded-[28px] border p-5 shadow-xl ${wrapperTone}`}>
      <div className={`mb-4 flex items-center justify-between text-2xl font-black ${titleTone}`}>
        <span>{title}</span>
        <span className="text-base opacity-80">
          {tone === "blue" ? "🔵" : tone === "orange" ? "🟠" : "👁️"}
        </span>
      </div>

      <div className="space-y-4">
        {players.length > 0 ? (
          players.map((player) => {
            const canManage = canManagePlayer(player);

            return (
              <div
                key={player.id}
                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
              >
                <div className="text-2xl font-black text-white">{getPlayerDisplayName(player)}</div>
                <div className="mt-2 text-sm text-white/75">
                  {getRoleLabel(player.role)}
                  {player.is_host ? " • Host" : ""}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canManage ? (
                    <>
                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={roomCode} />
                        <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
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
                        <input type="hidden" name="room_code" value={roomCode} />
                        <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                        <input type="hidden" name="team" value="red" />
                        <button
                          type="submit"
                          className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-400"
                        >
                          Orange
                        </button>
                      </form>

                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={roomCode} />
                        <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
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
                            <input type="hidden" name="room_code" value={roomCode} />
                            <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
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
                            <input type="hidden" name="room_code" value={roomCode} />
                            <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
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

                      {currentPlayer.is_host && currentPlayer.id !== player.id && (
                        <form action={removePlayerFromRoom}>
                          <input type="hidden" name="player_id" value={player.id} />
                          <input type="hidden" name="room_code" value={roomCode} />
                          <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                          <button
                            type="submit"
                            className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 hover:bg-red-500/20"
                          >
                            حذف
                          </button>
                        </form>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-white/45">لا يمكنك تعديل هذا اللاعب</div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-white/45">
            {emptyText}
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
  const orangePlayers = players.filter((player) => player.team === "red");
  const spectators = players.filter((player) => player.team === "spectator");

  const blueSpymasters = bluePlayers.filter((player) => player.role === "spymaster");
  const orangeSpymasters = orangePlayers.filter((player) => player.role === "spymaster");
  const blueOperatives = bluePlayers.filter((player) => player.role === "operative");
  const orangeOperatives = orangePlayers.filter((player) => player.role === "operative");

  const canStartGame =
    blueOperatives.length >= 1 &&
    orangeOperatives.length >= 1 &&
    blueSpymasters.length === 1 &&
    orangeSpymasters.length === 1;

  function canManagePlayer(player: PlayerRow) {
    if (isHost) return true;
    return safeCurrentPlayer.id === player.id;
  }

  return (
    <div className="mx-auto max-w-[1700px] p-4 md:p-6">
      <RoomStatusWatcher
        roomId={room.id}
        roomCode={room.room_code}
        playerId={safeCurrentPlayer.id}
      />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_460px] xl:items-center">
            <div className="grid gap-4 md:grid-cols-2">
              <TeamPreviewCard title="Blue Team" image={BLUE_TEAM_IMAGE} tone="blue" />
              <TeamPreviewCard title="Orange Team" image={ORANGE_TEAM_IMAGE} tone="orange" />
            </div>

            <div className="text-right">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
                Room Lobby
              </div>

              <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
                Codenames
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-sm text-white/70">
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

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <Link
                  href="/games/codenames/create"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white hover:bg-white/10"
                >
                  ➕ إنشاء غرفة جديدة
                </Link>

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
              </div>
            </div>
          </div>

          {isHost && !canStartGame && (
            <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100">
              يجب أن يكون لكل فريق لاعب operative واحد على الأقل ولاعب spymaster واحد فقط.
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

          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-500/10 p-5 shadow-xl">
            <div className="text-sm font-semibold text-cyan-100/80">Blue Team</div>
            <div className="mt-3 text-4xl font-black text-white">{bluePlayers.length}</div>
          </div>

          <div className="rounded-[24px] border border-orange-300/20 bg-orange-500/10 p-5 shadow-xl">
            <div className="text-sm font-semibold text-orange-100/80">Orange Team</div>
            <div className="mt-3 text-4xl font-black text-white">{orangePlayers.length}</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className="text-sm font-semibold text-white/60">👁️ Spectators</div>
            <div className="mt-3 text-4xl font-black text-white">{spectators.length}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <TeamBlock
            title="Blue Team"
            tone="blue"
            players={bluePlayers}
            emptyText="لا يوجد لاعبون"
            currentPlayer={safeCurrentPlayer}
            canManagePlayer={canManagePlayer}
            roomCode={room.room_code}
          />

          <TeamBlock
            title="Spectators"
            tone="spectator"
            players={spectators}
            emptyText="لا يوجد مشاهدون"
            currentPlayer={safeCurrentPlayer}
            canManagePlayer={canManagePlayer}
            roomCode={room.room_code}
          />

          <TeamBlock
            title="Orange Team"
            tone="orange"
            players={orangePlayers}
            emptyText="لا يوجد لاعبون"
            currentPlayer={safeCurrentPlayer}
            canManagePlayer={canManagePlayer}
            roomCode={room.room_code}
          />
        </div>
      </div>
    </div>
  );
}