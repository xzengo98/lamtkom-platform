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
const BLUE_PANEL_BG =
  "https://t3.ftcdn.net/jpg/00/86/56/12/360_F_86561234_8HJdzg2iBlPap18K38mbyetKfdw1oNrm.jpg";
const ORANGE_PANEL_BG =
  "https://img.freepik.com/free-vector/grunge-diagonal-stripe-background_1409-1366.jpg";

function getPlayerDisplayName(player: PlayerRow) {
  return player.guest_name?.trim() || "لاعب";
}

function getRoleLabel(role: string | null) {
  if (role === "spymaster") return "Spymaster";
  if (role === "spectator") return "Spectator";
  return "Operative";
}

function normalizePlayer(player: PlayerRow): PlayerRow {
  const normalizedTeam = player.team?.toLowerCase() || "spectator";
  const normalizedRole =
    player.role?.toLowerCase() ||
    (normalizedTeam === "spectator" ? "spectator" : "operative");

  return {
    ...player,
    team: normalizedTeam,
    role: normalizedRole,
  };
}

function TopPill({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-full border px-4 py-2 text-sm font-black text-white shadow-lg ${
        active
          ? "border-white/25 bg-white/10"
          : "border-white/20 bg-black/15"
      }`}
    >
      {children}
    </div>
  );
}

function TeamHeaderCard({
  title,
  theme,
  subtitle,
}: {
  title: string;
  theme: "blue" | "orange";
  subtitle: string;
}) {
  const isBlue = theme === "blue";
  const image = isBlue ? BLUE_TEAM_IMAGE : ORANGE_TEAM_IMAGE;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border p-4 shadow-[0_18px_42px_rgba(0,0,0,0.28)] ${
        isBlue ? "border-cyan-300/25" : "border-orange-300/25"
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,18,30,0.74), rgba(10,18,30,0.88)), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10">
        <div
          className={`text-center text-sm font-black uppercase tracking-[0.16em] ${
            isBlue ? "text-cyan-100" : "text-orange-100"
          }`}
        >
          {title}
        </div>

        <div className="mt-16 text-center text-lg font-black text-white md:text-xl">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function TeamStatMini({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "blue" | "orange" | "neutral";
}) {
  const toneClass =
    tone === "blue"
      ? "border-cyan-300/20 bg-cyan-500/10 text-cyan-100"
      : tone === "orange"
      ? "border-orange-300/20 bg-orange-500/10 text-orange-100"
      : "border-white/10 bg-white/5 text-white";

  return (
    <div className={`rounded-[22px] border p-4 shadow-xl ${toneClass}`}>
      <div className="text-sm font-semibold opacity-80">{title}</div>
      <div className="mt-2 text-4xl font-black">{value}</div>
    </div>
  );
}

function TeamLobbyColumn({
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

  const badge =
    tone === "blue" ? "🔵" : tone === "orange" ? "🟠" : "👁️";

  return (
    <div className={`rounded-[30px] border p-4 shadow-[0_18px_42px_rgba(0,0,0,0.24)] ${wrapperTone}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className={`text-xl font-black md:text-2xl ${titleTone}`}>{title}</div>
        <div className="text-lg">{badge}</div>
      </div>

      <div className="space-y-4">
        {players.length > 0 ? (
          players.map((player) => {
            const canManage = canManagePlayer(player);
            const isBlue = player.team === "blue";
            const isOrange = player.team === "red";
            const isSpectator = player.team === "spectator";

            return (
              <div
                key={player.id}
                className="rounded-[24px] border border-white/10 bg-black/20 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-white md:text-xl">
                      {getPlayerDisplayName(player)}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/50">
                      {getRoleLabel(player.role)}
                      {player.is_host ? " • Host" : ""}
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                      isBlue
                        ? "bg-cyan-500/15 text-cyan-100"
                        : isOrange
                        ? "bg-orange-500/15 text-orange-100"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {isSpectator ? "Spectator" : player.team}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canManage ? (
                    <>
                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={roomCode} />
                        <input
                          type="hidden"
                          name="actor_player_id"
                          value={currentPlayer.id}
                        />
                        <input type="hidden" name="team" value="blue" />
                        <button
                          type="submit"
                          className="rounded-2xl bg-cyan-500 px-3 py-2 text-xs font-black text-white hover:bg-cyan-400"
                        >
                          Blue
                        </button>
                      </form>

                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={roomCode} />
                        <input
                          type="hidden"
                          name="actor_player_id"
                          value={currentPlayer.id}
                        />
                        <input type="hidden" name="team" value="red" />
                        <button
                          type="submit"
                          className="rounded-2xl bg-orange-500 px-3 py-2 text-xs font-black text-white hover:bg-orange-400"
                        >
                          Orange
                        </button>
                      </form>

                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={roomCode} />
                        <input
                          type="hidden"
                          name="actor_player_id"
                          value={currentPlayer.id}
                        />
                        <input type="hidden" name="team" value="spectator" />
                        <button
                          type="submit"
                          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white hover:bg-white/10"
                        >
                          Spectator
                        </button>
                      </form>

                      {player.team !== "spectator" && (
                        <>
                          <form action={updatePlayerRole}>
                            <input type="hidden" name="player_id" value={player.id} />
                            <input type="hidden" name="room_code" value={roomCode} />
                            <input
                              type="hidden"
                              name="actor_player_id"
                              value={currentPlayer.id}
                            />
                            <input type="hidden" name="role" value="spymaster" />
                            <button
                              type="submit"
                              className={`rounded-2xl px-3 py-2 text-xs font-black ${
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
                            <input
                              type="hidden"
                              name="actor_player_id"
                              value={currentPlayer.id}
                            />
                            <input type="hidden" name="role" value="operative" />
                            <button
                              type="submit"
                              className={`rounded-2xl px-3 py-2 text-xs font-black ${
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
                          <input
                            type="hidden"
                            name="actor_player_id"
                            value={currentPlayer.id}
                          />
                          <button
                            type="submit"
                            className="rounded-2xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20"
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
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-white/45">
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
    <div className="mx-auto max-w-[1840px] p-3 md:p-5 xl:p-6">
      <RoomStatusWatcher
        roomId={room.id}
        roomCode={room.room_code}
        playerId={safeCurrentPlayer.id}
      />

      <div className="space-y-5">
        <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_22%),linear-gradient(180deg,#07111d_0%,#16283a_100%)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <TopPill active>Room Lobby</TopPill>
              <TopPill>{getPlayerDisplayName(safeCurrentPlayer)}</TopPill>
              <TopPill>Code: {room.room_code}</TopPill>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/games/codenames/create"
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10"
              >
                ➕ New Room
              </Link>

              <div className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-black text-white/80">
                الحالة: {room.status || "waiting"}
              </div>

              {isHost && canStartGame && (
                <form action={startCodenamesGame}>
                  <input type="hidden" name="room_code" value={room.room_code} />
                  <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-black text-white hover:bg-emerald-400"
                  >
                    🚀 ابدأ اللعبة
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_250px] xl:items-start">
            <TeamHeaderCard
              title="Blue Team"
              theme="blue"
              subtitle="Operatives + Spymaster"
            />

            <div className="rounded-[30px] border border-white/10 bg-black/20 px-5 py-6 text-center shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-white/55">
                Codenames
              </div>

              <div className="mt-4 text-3xl font-black uppercase text-white md:text-5xl">
                Prepare the teams
              </div>

              <div className="mt-4 text-sm text-white/65 md:text-base">
                اختر اللاعبين لكل فريق وحدد الـ Spymaster ثم ابدأ الجولة
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100">
                  Blue Operatives: {blueOperatives.length}
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100">
                  Blue Spymasters: {blueSpymasters.length}
                </div>
                <div className="rounded-full border border-orange-300/20 bg-orange-500/10 px-4 py-2 text-sm font-black text-orange-100">
                  Orange Operatives: {orangeOperatives.length}
                </div>
                <div className="rounded-full border border-orange-300/20 bg-orange-500/10 px-4 py-2 text-sm font-black text-orange-100">
                  Orange Spymasters: {orangeSpymasters.length}
                </div>
              </div>
            </div>

            <TeamHeaderCard
              title="Orange Team"
              theme="orange"
              subtitle="Operatives + Spymaster"
            />
          </div>

          {isHost && !canStartGame && (
            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100">
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
          <TeamStatMini title="إجمالي اللاعبين" value={players.length} tone="neutral" />
          <TeamStatMini title="Blue Team" value={bluePlayers.length} tone="blue" />
          <TeamStatMini title="Orange Team" value={orangePlayers.length} tone="orange" />
          <TeamStatMini title="Spectators" value={spectators.length} tone="neutral" />
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <TeamLobbyColumn
            title="Blue Team"
            tone="blue"
            players={bluePlayers}
            emptyText="لا يوجد لاعبون"
            currentPlayer={safeCurrentPlayer}
            canManagePlayer={canManagePlayer}
            roomCode={room.room_code}
          />

          <TeamLobbyColumn
            title="Spectators"
            tone="spectator"
            players={spectators}
            emptyText="لا يوجد مشاهدون"
            currentPlayer={safeCurrentPlayer}
            canManagePlayer={canManagePlayer}
            roomCode={room.room_code}
          />

          <TeamLobbyColumn
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