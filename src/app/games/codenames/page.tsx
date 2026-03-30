import Link from "next/link";

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

function ActionCard({
  title,
  description,
  href,
  tone,
  button,
}: {
  title: string;
  description: string;
  href: string;
  tone: "blue" | "orange";
  button: string;
}) {
  const isBlue = tone === "blue";

  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
        isBlue ? "border-cyan-300/20" : "border-orange-300/20"
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, ${
          isBlue
            ? "rgba(10,18,30,0.85)"
            : "rgba(20,10,6,0.85)"
        }, rgba(10,18,30,0.92)), url(${
          isBlue ? BLUE_PANEL_BG : ORANGE_PANEL_BG
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10">
        <div
          className={`text-sm font-black uppercase tracking-[0.18em] ${
            isBlue ? "text-cyan-100" : "text-orange-100"
          }`}
        >
          Codenames
        </div>

        <div className="mt-4 text-3xl font-black text-white md:text-4xl">
          {title}
        </div>

        <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
          {description}
        </p>

        <Link
          href={href}
          className={`mt-6 inline-block rounded-2xl px-6 py-3 text-lg font-black text-white ${
            isBlue
              ? "bg-cyan-500 hover:bg-cyan-400"
              : "bg-orange-500 hover:bg-orange-400"
          }`}
        >
          {button}
        </Link>
      </div>
    </div>
  );
}

export default function CodenamesHomePage() {
  return (
    <div className="mx-auto max-w-[1600px] p-3 md:p-6">
      <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_22%),linear-gradient(180deg,#07111d_0%,#16283a_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.4)] md:p-8">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <TopPill active>Codenames</TopPill>
            <TopPill>Multiplayer</TopPill>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10"
          >
            رجوع للرئيسية
          </Link>
        </div>

        {/* HERO */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-black text-white md:text-6xl">
            CODENAMES
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-white/70 md:text-lg">
            لعبة جماعية تعتمد على الذكاء والربط بين الكلمات  
            قائد الفريق يعطي تلميح واحد، وعلى الفريق اكتشاف الكلمات الصحيحة  
            لكن احذر… كلمة واحدة خاطئة قد تنهي اللعبة فورًا 😈
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          
          <ActionCard
            title="إنشاء غرفة"
            description="ابدأ لعبة جديدة وكن أنت الـ Host. قم بدعوة أصدقائك وابدأ توزيع اللاعبين بين الفريقين ثم ابدأ الجولة."
            href="/games/codenames/create"
            tone="blue"
            button="إنشاء الآن"
          />

          <ActionCard
            title="دخول غرفة"
            description="لديك كود غرفة؟ أدخل الكود واسمك وانضم مباشرة إلى اللعبة وابدأ التحدي مع الفريق."
            href="/games/codenames/join"
            tone="orange"
            button="انضم الآن"
          />

        </div>

        {/* GAME INFO */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <div className="text-sm text-white/60">عدد الفرق</div>
            <div className="mt-2 text-3xl font-black text-white">2</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <div className="text-sm text-white/60">نوع اللعبة</div>
            <div className="mt-2 text-3xl font-black text-white">
              جماعية
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <div className="text-sm text-white/60">عدد اللاعبين</div>
            <div className="mt-2 text-3xl font-black text-white">
              مفتوح
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}