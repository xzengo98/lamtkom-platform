import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import RoomStatusWatcher from "@/components/codenames/room-status-watcher";
import CodenamesInviteLink from "@/components/codenames/codenames-invite-link";
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
      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold text-white ${
        active
          ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
          : "border-white/10 bg-white/5 text-white/60"
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
  const barColor  = tone === "blue" ? "bg-cyan-400" : tone === "orange" ? "bg-orange-400" : "bg-white/30";
  const numColor  = tone === "blue" ? "text-cyan-300" : tone === "orange" ? "text-orange-300" : "text-white/80";
  const lblColor  = tone === "blue" ? "text-cyan-400/55" : tone === "orange" ? "text-orange-400/55" : "text-white/35";
  const bdColor   = tone === "blue" ? "border-cyan-400/15 bg-cyan-400/6" : tone === "orange" ? "border-orange-400/15 bg-orange-400/6" : "border-white/8 bg-white/4";

  return (
    <div className={`overflow-hidden rounded-2xl border ${bdColor}`}>
      <div className={`h-[2px] w-full ${barColor} opacity-55`} />
      <div className="px-4 py-4 text-center">
        <div className={`text-xs font-bold ${lblColor}`}>{title}</div>
        <div className={`mt-1.5 text-3xl font-black ${numColor}`}>{value}</div>
      </div>
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
    <div className={`overflow-hidden rounded-[2rem] border p-4 ${wrapperTone}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className={`text-xl font-black md:text-2xl ${titleTone}`}>{title}</div>
        <div className="text-lg">{badge}</div>
      </div>

      <div className="space-y-4">
        {players.length > 0 ? (
          players.map((player, index) => {
            const canManage = canManagePlayer(player);
            const isBlue = player.team === "blue";
            const isOrange = player.team === "red";
            const isSpectator = player.team === "spectator";

            return (
              <div
                key={player.id}
                className="lobby-player-card rounded-[24px] border border-white/10 bg-black/20 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
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
                          className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-white transition hover:bg-cyan-400 active:scale-[0.98]"
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
                          className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-black text-white transition hover:bg-orange-400 active:scale-[0.98]"
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
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/60 transition hover:bg-white/8 hover:text-white"
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
                            className="rounded-xl border border-red-400/20 bg-red-500/8 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98]"
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
          <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.02] p-5 text-sm text-white/35 text-center">
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_60%,#020814_100%)] px-3 py-4 text-white md:px-5 md:py-5 xl:px-6">
      <div className="mx-auto max-w-[1840px]">
      <RoomStatusWatcher
        roomId={room.id}
        roomCode={room.room_code}
        playerId={safeCurrentPlayer.id}
      />

      <div className="space-y-4">
        {/* ── Lobby header ── */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,18,42,0.98)_0%,rgba(4,10,26,1)_55%,rgba(6,12,32,0.98)_100%)]">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-56 rounded-full bg-violet-500/6 blur-2xl" />

          <div className="relative px-5 py-5 md:px-7">
            {/* Top nav bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TopPill active>Room Lobby</TopPill>
                <TopPill>{getPlayerDisplayName(safeCurrentPlayer)}</TopPill>
                <TopPill>#{room.room_code}</TopPill>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  room.status === "active"
                    ? "border-emerald-400/25 bg-emerald-400/8 text-emerald-300"
                    : "border-white/10 bg-white/5 text-white/45"
                }`}>
                  {room.status || "waiting"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/games/codenames/create"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  + New Room
                </Link>

                {isHost && canStartGame && (
                  <form action={startCodenamesGame}>
                    <input type="hidden" name="room_code" value={room.room_code} />
                    <input type="hidden" name="actor_player_id" value={safeCurrentPlayer.id} />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-black text-white shadow-[0_3px_14px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400 active:scale-[0.98]"
                    >
                      🚀 ابدأ اللعبة
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Invite link */}
            <div className="mt-4">
              <CodenamesInviteLink roomCode={room.room_code} />
            </div>

            {/* Team prep center */}
            <div className="mt-5 grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_220px] xl:items-start">
              <TeamHeaderCard title="Blue Team" theme="blue" subtitle="Operatives + Spymaster" />

              <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,40,0.90)_0%,rgba(4,10,24,0.95)_100%)] px-5 py-5 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-widest text-white/40 uppercase">
                  Codenames · Lobby
                </span>
                <div className="mt-3 text-2xl font-black uppercase text-white md:text-3xl">
                  Prepare the Teams
                </div>
                <div className="mt-2 text-sm text-white/45">
                  اختر الفريق والدور لكل لاعب، ثم ابدأ الجولة
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/6 px-3 py-2.5 text-center">
                    <div className="text-[10px] font-bold text-cyan-400/55">Blue Ops</div>
                    <div className="text-xl font-black text-cyan-300">{blueOperatives.length}</div>
                  </div>
                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/6 px-3 py-2.5 text-center">
                    <div className="text-[10px] font-bold text-cyan-400/55">Blue Spy</div>
                    <div className="text-xl font-black text-cyan-300">{blueSpymasters.length}</div>
                  </div>
                  <div className="rounded-xl border border-orange-400/15 bg-orange-400/6 px-3 py-2.5 text-center">
                    <div className="text-[10px] font-bold text-orange-400/55">Orange Ops</div>
                    <div className="text-xl font-black text-orange-300">{orangeOperatives.length}</div>
                  </div>
                  <div className="rounded-xl border border-orange-400/15 bg-orange-400/6 px-3 py-2.5 text-center">
                    <div className="text-[10px] font-bold text-orange-400/55">Orange Spy</div>
                    <div className="text-xl font-black text-orange-300">{orangeSpymasters.length}</div>
                  </div>
                </div>
              </div>

              <TeamHeaderCard title="Orange Team" theme="orange" subtitle="Operatives + Spymaster" />
            </div>

            {/* Alerts */}
            {isHost && !canStartGame && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/8 px-4 py-3.5 text-sm font-bold text-amber-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>
                يجب أن يكون لكل فريق operative واحد على الأقل وspymaster واحد فقط.
              </div>
            )}

            {errorMessage && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3.5 text-sm font-bold text-red-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>
                {decodeURIComponent(errorMessage)}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
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

      <style>{`
        .lobby-player-card {
          opacity: 0;
          transform: translateY(14px) scale(0.985);
          animation: lobbyPlayerIn 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes lobbyPlayerIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
}