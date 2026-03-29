import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { updatePlayerRole, updatePlayerTeam } from "./actions";

type PageProps = {
  params: { code: string };
  searchParams: { name?: string };
};

type RoomRow = {
  id: string;
  room_code: string;
  status: string;
  created_at: string;
};

type PlayerRow = {
  id: string;
  room_id: string;
  guest_name: string | null;
  user_id: string | null;
  team: string | null;
  role: string | null;
  is_host: boolean;
  joined_at: string;
};

export default async function CodenamesRoomPage({
  params,
}: PageProps) {
  const supabase = await getSupabaseServerClient();
  const code = params.code;
  const roomCode = code.toUpperCase();

  const { data: room, error: roomError } = await supabase
    .from("codenames_rooms")
    .select("*")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!room) {
    notFound();
  }

  const typedRoom = room as RoomRow;

  const { data: playersData, error: playersError } = await supabase
    .from("codenames_players")
    .select("*")
    .eq("room_id", typedRoom.id)
    .order("joined_at", { ascending: true });

  if (playersError) {
    throw new Error(playersError.message);
  }

  const players = (playersData ?? []) as PlayerRow[];

  const redPlayers = players.filter((player) => player.team === "red");
  const bluePlayers = players.filter((player) => player.team === "blue");
  const unassignedPlayers = players.filter((player) => !player.team);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">غرفة Codenames</h1>
            <p className="mt-2 text-sm text-white/70">
              رمز الغرفة:
              <span className="ml-2 rounded-xl bg-black/30 px-3 py-1 font-mono text-white">
                {typedRoom.room_code}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
            الحالة: {typedRoom.status}
          </div>
        </div>
      </div>

      {!!unassignedPlayers.length && (
        <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
          <h2 className="text-lg font-bold text-yellow-100">لاعبون بدون فريق</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="font-semibold text-white">
                  {player.guest_name || "لاعب"}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={updatePlayerTeam}>
                    <input type="hidden" name="player_id" value={player.id} />
                    <input type="hidden" name="room_code" value={typedRoom.room_code} />
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
                    <input type="hidden" name="room_code" value={typedRoom.room_code} />
                    <input type="hidden" name="team" value="blue" />
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                    >
                      انقله للأزرق
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <h2 className="text-xl font-bold text-red-100">الفريق الأحمر</h2>
          <div className="mt-4 space-y-3">
            {redPlayers.length ? (
              redPlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">
                        {player.guest_name || "لاعب"}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {player.role === "spymaster" ? "Spymaster" : "Operative"}
                        {player.is_host ? " • Host" : ""}
                      </div>
                    </div>

                    <form action={updatePlayerRole}>
                      <input type="hidden" name="player_id" value={player.id} />
                      <input type="hidden" name="room_code" value={typedRoom.room_code} />
                      <select
                        name="role"
                        defaultValue={player.role ?? "operative"}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="spymaster">Spymaster</option>
                        <option value="operative">Operative</option>
                      </select>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                لا يوجد لاعبون في الفريق الأحمر
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
          <h2 className="text-xl font-bold text-blue-100">الفريق الأزرق</h2>
          <div className="mt-4 space-y-3">
            {bluePlayers.length ? (
              bluePlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">
                        {player.guest_name || "لاعب"}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {player.role === "spymaster" ? "Spymaster" : "Operative"}
                        {player.is_host ? " • Host" : ""}
                      </div>
                    </div>

                    <form action={updatePlayerRole}>
                      <input type="hidden" name="player_id" value={player.id} />
                      <input type="hidden" name="room_code" value={typedRoom.room_code} />
                      <select
                        name="role"
                        defaultValue={player.role ?? "operative"}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="spymaster">Spymaster</option>
                        <option value="operative">Operative</option>
                      </select>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                لا يوجد لاعبون في الفريق الأزرق
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">الخطوة التالية</h2>
        <p className="mt-2 text-sm text-white/70">
          بعد التأكد أن إنشاء الغرفة والانضمام وتوزيع الفرق يعملون، سنضيف زر بدء
          اللعبة وتوليد بطاقات 5×5 وربطها بالجولة.
        </p>
      </div>
    </div>
  );
}