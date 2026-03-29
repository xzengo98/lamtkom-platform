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
  searchParams?: Promise<{ player_id?: string }>;
};

type RoomRow = {
  id: string;
  room_code: string;
  status: string | null;
  created_at: string | null;
};

type PlayerRow = {
  id: string;
  room_id: string;
  user_id: string | null;
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
  return role === "spymaster" ? "Spymaster" : "Operative";
}

export default async function CodenamesRoomPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await getSupabaseServerClient();
  const { code } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPlayerId = resolvedSearchParams?.player_id?.trim() || "";
  const roomCode = code.toUpperCase();

  const { data: roomData, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("id, room_code, status, created_at")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          <h1 className="text-xl font-bold">تعذر تحميل الغرفة</h1>
          <p className="mt-2 text-sm">{roomError.message}</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    notFound();
  }

  const room = roomData as RoomRow;

  const { data: playersData, error: playersError } = await supabase
    .from("codenames_players")
    .select("id, room_id, user_id, guest_name, team, role, is_host, joined_at")
    .eq("room_id", room.id)
    .order("joined_at", { ascending: true });

  if (playersError) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          <h1 className="text-xl font-bold">تعذر تحميل اللاعبين</h1>
          <p className="mt-2 text-sm">{playersError.message}</p>
        </div>
      </div>
    );
  }

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

  if (room.status === "active") {
    redirect(`/games/codenames/board/${room.room_code}?player_id=${currentPlayer.id}`);
  }

  const isHost = Boolean(currentPlayer.is_host);

  const redPlayers = players.filter((player) => player.team === "red");
  const bluePlayers = players.filter((player) => player.team === "blue");
  const unassignedPlayers = players.filter(
    (player) => player.team !== "red" && player.team !== "blue"
  );

  function canManagePlayer(player: PlayerRow) {
    if (isHost) return true;
    return currentPlayer.id === player.id;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <RoomStatusWatcher roomCode={room.room_code} playerId={currentPlayer.id} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">غرفة Codenames</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
              <span>رمز الغرفة</span>
              <span className="rounded-xl bg-black/30 px-3 py-1 font-mono text-white">
                {room.room_code}
              </span>
            </div>
            <div className="mt-2 text-sm text-white/60">
              أنت داخل الغرفة باسم:
              <span className="mx-2 font-semibold text-white">
                {getPlayerDisplayName(currentPlayer)}
              </span>
              {isHost ? "• Host" : ""}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              الحالة: {room.status || "waiting"}
            </div>

            {isHost && (
              <form action={startCodenamesGame}>
                <input type="hidden" name="room_code" value={room.room_code} />
                <input type="hidden" name="actor_player_id" value={currentPlayer.id} />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
                >
                  ابدأ اللعبة
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm text-white/60">إجمالي اللاعبين</div>
          <div className="mt-2 text-2xl font-bold text-white">{players.length}</div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="text-sm text-red-100/80">الفريق الأحمر</div>
          <div className="mt-2 text-2xl font-bold text-red-100">
            {redPlayers.length}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <div className="text-sm text-blue-100/80">الفريق الأزرق</div>
          <div className="mt-2 text-2xl font-bold text-blue-100">
            {bluePlayers.length}
          </div>
        </div>
      </div>

      {unassignedPlayers.length > 0 && (
        <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
          <h2 className="text-lg font-bold text-yellow-100">لاعبون بدون فريق</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {unassignedPlayers.map((player) => {
              const canManage = canManagePlayer(player);

              return (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="font-semibold text-white">
                    {getPlayerDisplayName(player)}
                  </div>

                  {canManage ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={room.room_code} />
                        <input
                          type="hidden"
                          name="actor_player_id"
                          value={currentPlayer.id}
                        />
                        <input type="hidden" name="team" value="red" />
                        <button
                          type="submit"
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
                        >
                          انقله للأحمر
                        </button>
                      </form>

                      <form action={updatePlayerTeam}>
                        <input type="hidden" name="player_id" value={player.id} />
                        <input type="hidden" name="room_code" value={room.room_code} />
                        <input
                          type="hidden"
                          name="actor_player_id"
                          value={currentPlayer.id}
                        />
                        <input type="hidden" name="team" value="blue" />
                        <button
                          type="submit"
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                        >
                          انقله للأزرق
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-white/50">
                      فقط المنشئ أو اللاعب نفسه يمكنه تعديل هذا اللاعب
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-red-100">الفريق الأحمر</h2>
            <span className="rounded-xl border border-red-300/20 px-3 py-1 text-sm text-red-100/80">
              {redPlayers.length} لاعب
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {redPlayers.length > 0 ? (
              redPlayers.map((player) => {
                const canManage = canManagePlayer(player);

                return (
                  <div
                    key={player.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="font-semibold text-white">
                          {getPlayerDisplayName(player)}
                        </div>
                        <div className="mt-1 text-sm text-white/60">
                          {getRoleLabel(player.role)}
                          {player.is_host ? " • Host" : ""}
                        </div>
                      </div>

                      {canManage ? (
                        <div className="flex flex-wrap gap-2">
                          <form action={updatePlayerRole}>
                            <input type="hidden" name="player_id" value={player.id} />
                            <input type="hidden" name="room_code" value={room.room_code} />
                            <input
                              type="hidden"
                              name="actor_player_id"
                              value={currentPlayer.id}
                            />
                            <input type="hidden" name="role" value="spymaster" />
                            <button
                              type="submit"
                              className={`rounded-xl px-4 py-2 text-sm ${
                                player.role === "spymaster"
                                  ? "bg-white text-black"
                                  : "border border-white/10 text-white hover:bg-white/5"
                              }`}
                            >
                              Spymaster
                            </button>
                          </form>

                          <form action={updatePlayerRole}>
                            <input type="hidden" name="player_id" value={player.id} />
                            <input type="hidden" name="room_code" value={room.room_code} />
                            <input
                              type="hidden"
                              name="actor_player_id"
                              value={currentPlayer.id}
                            />
                            <input type="hidden" name="role" value="operative" />
                            <button
                              type="submit"
                              className={`rounded-xl px-4 py-2 text-sm ${
                                player.role === "operative"
                                  ? "bg-white text-black"
                                  : "border border-white/10 text-white hover:bg-white/5"
                              }`}
                            >
                              Operative
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="text-sm text-white/50">لا يمكنك تعديل هذا اللاعب</div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                لا يوجد لاعبون في الفريق الأحمر
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-blue-100">الفريق الأزرق</h2>
            <span className="rounded-xl border border-blue-300/20 px-3 py-1 text-sm text-blue-100/80">
              {bluePlayers.length} لاعب
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {bluePlayers.length > 0 ? (
              bluePlayers.map((player) => {
                const canManage = canManagePlayer(player);

                return (
                  <div
                    key={player.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="font-semibold text-white">
                          {getPlayerDisplayName(player)}
                        </div>
                        <div className="mt-1 text-sm text-white/60">
                          {getRoleLabel(player.role)}
                          {player.is_host ? " • Host" : ""}
                        </div>
                      </div>

                      {canManage ? (
                        <div className="flex flex-wrap gap-2">
                          <form action={updatePlayerRole}>
                            <input type="hidden" name="player_id" value={player.id} />
                            <input type="hidden" name="room_code" value={room.room_code} />
                            <input
                              type="hidden"
                              name="actor_player_id"
                              value={currentPlayer.id}
                            />
                            <input type="hidden" name="role" value="spymaster" />
                            <button
                              type="submit"
                              className={`rounded-xl px-4 py-2 text-sm ${
                                player.role === "spymaster"
                                  ? "bg-white text-black"
                                  : "border border-white/10 text-white hover:bg-white/5"
                              }`}
                            >
                              Spymaster
                            </button>
                          </form>

                          <form action={updatePlayerRole}>
                            <input type="hidden" name="player_id" value={player.id} />
                            <input type="hidden" name="room_code" value={room.room_code} />
                            <input
                              type="hidden"
                              name="actor_player_id"
                              value={currentPlayer.id}
                            />
                            <input type="hidden" name="role" value="operative" />
                            <button
                              type="submit"
                              className={`rounded-xl px-4 py-2 text-sm ${
                                player.role === "operative"
                                  ? "bg-white text-black"
                                  : "border border-white/10 text-white hover:bg-white/5"
                              }`}
                            >
                              Operative
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="text-sm text-white/50">لا يمكنك تعديل هذا اللاعب</div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                لا يوجد لاعبون في الفريق الأزرق
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}