import Link from "next/link";
import { joinCodenamesRoom } from "./actions";
import JoinFormClient from "./join-form-client";

type PageProps = {
  searchParams?: Promise<{ error?: string; room_code?: string }>;
};

const BLUE_PANEL_BG =
  "https://t3.ftcdn.net/jpg/00/86/56/12/360_F_86561234_8HJdzg2iBlPap18K38mbyetKfdw1oNrm.jpg";

const ORANGE_PANEL_BG =
  "https://img.freepik.com/free-vector/grunge-diagonal-stripe-background_1409-1366.jpg";

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

export default async function JoinCodenamesRoomPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = resolvedSearchParams?.error?.trim() || "";
  const roomCodeValue = resolvedSearchParams?.room_code?.trim() || "";

  return (
    <div className="mx-auto max-w-[1400px] p-3 md:p-5 xl:p-6">
      <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_22%),linear-gradient(180deg,#07111d_0%,#16283a_100%)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <TopPill active>Join Room</TopPill>
            <TopPill>Codenames</TopPill>
          </div>

          <Link
            href="/games/codenames"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10"
          >
            رجوع
          </Link>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_300px] xl:items-stretch">
          <div
            className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(10,18,30,0.78), rgba(10,18,30,0.9)), url(${BLUE_PANEL_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-center text-sm font-black uppercase tracking-[0.16em] text-cyan-100">
              Blue Team
            </div>
            <div className="mt-16 text-center text-xl font-black text-white">
              Join an existing room
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 px-5 py-6 text-center shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
            <div className="text-sm font-black uppercase tracking-[0.18em] text-white/55">
              Codenames
            </div>

            <h1 className="mt-4 text-3xl font-black text-white md:text-5xl">
              دخول غرفة
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              أدخل اسمك ورمز الغرفة، وسيتم إدخالك مباشرة إلى صفحة الانتظار.
              إذا دخلت عن طريق رابط دعوة مباشر فسيتم تعبئة رمز الغرفة تلقائيًا.
            </p>

            {errorMessage ? (
              <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                {decodeURIComponent(errorMessage)}
              </div>
            ) : null}

            <JoinFormClient
              action={joinCodenamesRoom}
              roomCodeValue={roomCodeValue}
            />
          </div>

          <div
            className="relative overflow-hidden rounded-[28px] border border-orange-300/20 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(20,10,6,0.78), rgba(20,10,6,0.9)), url(${ORANGE_PANEL_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-center text-sm font-black uppercase tracking-[0.16em] text-orange-100">
              Orange Team
            </div>
            <div className="mt-16 text-center text-xl font-black text-white">
              Enter your code and play
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}