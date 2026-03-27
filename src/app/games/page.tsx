import Link from "next/link";

const gameCards = [
  {
    title: "لمّتنا",
    subtitle: "أسئلة وأجوبة",
    description:
      "اللعبة المبنية على الفئات والأسئلة والنقاط بين فريقين.",
    href: "/game/start",
    image:
      "https://a.top4top.io/p_3738qob7g1.png",
    active: true,
  },
  {
    title: "برا السالفة",
    subtitle: "لعبة جماعية",
    description:
      "اختر الفئة، أضف اللاعبين، ودع اللعبة تختار شخصًا واحدًا فقط يكون برا السالفة.",
    href: "/game/bara-alsalfah",
    image:
      "https://l.top4top.io/p_373887e151.png",
    active: true,
  },
  {
    title: "قريبًا",
    subtitle: "ألعاب أخرى",
    description:
      "مكان مخصص للألعاب القادمة داخل الموقع. سنضيف هنا ألعابًا جديدة لاحقًا.",
    href: "#",
    image:
      "https://i.top4top.io/p_3738ncix61.png",
    active: false,
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#020817] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
          <div className="max-w-4xl">
            <div className="text-cyan-300">صفحة الألعاب</div>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              اختر اللعبة التي تريدها
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              هنا ستجد ألعاب المنصة بالكامل في مكان واحد. اختر اللعبة التي تريد بدءها الآن،
              ومع الوقت سنضيف ألعابًا جديدة.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {gameCards.map((card, index) =>
            card.active ? (
              <Link
                key={index}
                href={card.href}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#071126] shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071126] via-[#071126]/40 to-transparent" />
                  <div className="absolute bottom-4 right-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
                    متاحة الآن
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-cyan-300">{card.subtitle}</div>
                  <h2 className="mt-2 text-3xl font-black">{card.title}</h2>
                  <p className="mt-4 leading-8 text-white/70">
                    {card.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-cyan-400">
                    ابدأ اللعبة
                    <span>←</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071126] opacity-90 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071126] via-[#071126]/40 to-transparent" />
                  <div className="absolute bottom-4 right-4 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
                    قريبًا
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-cyan-300">{card.subtitle}</div>
                  <h2 className="mt-2 text-3xl font-black">{card.title}</h2>
                  <p className="mt-4 leading-8 text-white/70">
                    {card.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/80">
                    قريبًا
                  </div>
                </div>
              </div>
            ),
          )}
        </section>
      </div>
    </div>
  );
}