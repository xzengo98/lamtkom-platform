import Link from "next/link";
import { joinCodenamesRoom } from "./actions";

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
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">

        {/* ── Header ── */}
        <div className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,18,42,0.98)_0%,rgba(4,10,26,1)_100%)]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-orange-500/7 blur-3xl" />

          <div className="relative px-7 py-9 md:px-10">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-white/30">
              <Link href="/" className="transition hover:text-white/55">الرئيسية</Link>
              <span>/</span>
              <Link href="/games/codenames" className="transition hover:text-white/55">Codenames</Link>
              <span>/</span>
              <span className="text-white/50">دخول غرفة</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/8 px-3.5 py-1.5 text-xs font-bold text-orange-300">
                  <span className="h-1 w-1 rounded-full bg-orange-400" />
                  Join Room
                </span>
                <h1 className="mt-3 text-2xl font-black text-white md:text-3xl">
                  دخول غرفة
                </h1>
                <p className="mt-1.5 text-sm text-white/45">
                  أدخل اسمك ورمز الغرفة للانضمام مباشرة.
                </p>
              </div>
              <Link
                href="/games/codenames"
                className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
              >
                رجوع
              </Link>
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.94)_0%,rgba(5,10,24,0.98)_100%)]">
          <div className="h-[2px] w-full bg-orange-400 opacity-60" />

          <div className="p-6 md:p-8">
            {/* Team side cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div
                className="relative overflow-hidden rounded-2xl border border-cyan-400/20 p-4"
                style={{
                  backgroundImage: `linear-gradient(160deg, rgba(8,16,30,0.92), rgba(4,10,24,0.96)), url(${BLUE_PANEL_BG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="text-center text-xs font-black uppercase tracking-widest text-cyan-300">Blue Team</div>
                <div className="mt-3 text-center text-sm font-bold text-white/60">Operatives + Spymaster</div>
              </div>
              <div
                className="relative overflow-hidden rounded-2xl border border-orange-400/20 p-4"
                style={{
                  backgroundImage: `linear-gradient(160deg, rgba(20,10,6,0.92), rgba(10,5,3,0.96)), url(${ORANGE_PANEL_BG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="text-center text-xs font-black uppercase tracking-widest text-orange-300">Orange Team</div>
                <div className="mt-3 text-center text-sm font-bold text-white/60">Operatives + Spymaster</div>
              </div>
            </div>

            {errorMessage ? (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3.5 text-sm font-bold text-red-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>
                {decodeURIComponent(errorMessage)}
              </div>
            ) : null}

            <form
              id="join-codenames-room-form"
              action={joinCodenamesRoom}
              className="space-y-4"
            >
              <div>
                <label htmlFor="guest_name" className="mb-1.5 block text-xs font-bold text-white/45">
                  اسمك <span className="text-red-400">*</span>
                </label>
                <input
                  id="guest_name"
                  name="guest_name"
                  type="text"
                  required
                  placeholder="اكتب اسمك هنا..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/60"
                />
              </div>

              <div>
                <label htmlFor="room_code" className="mb-1.5 block text-xs font-bold text-white/45">
                  رمز الغرفة <span className="text-red-400">*</span>
                </label>
                <input
                  id="room_code"
                  name="room_code"
                  type="text"
                  required
                  defaultValue={roomCodeValue}
                  placeholder="مثال: ABC123"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-sm font-bold uppercase text-white outline-none transition placeholder:normal-case placeholder:text-white/25 focus:border-orange-400/60"
                />
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  id="join-codenames-room-submit"
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.25)] transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  دخول الغرفة
                </button>
                <Link
                  href="/games/codenames"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  إلغاء
                </Link>
              </div>
            </form>

            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (() => {
                    const form = document.getElementById("join-codenames-room-form");
                    const button = document.getElementById("join-codenames-room-submit");
                    if (!form || !button) return;

                    let locked = false;

                    form.addEventListener("submit", function (event) {
                      if (locked) {
                        event.preventDefault();
                        return;
                      }

                      locked = true;
                      button.setAttribute("disabled", "true");
                      button.textContent = "جارٍ الدخول...";
                    });
                  })();
                `,
              }}
            />
          </div>
        </div>

      </div>
    </main>
  );
}