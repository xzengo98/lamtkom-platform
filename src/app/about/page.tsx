import Link from "next/link";

export const metadata = {
  title: "من نحن | لمّتنا",
  description:
    "تعرف على منصة لمّتنا، رؤيتها، فكرتها، والألعاب والتجارب التي تقدمها للمستخدمين والفعاليات.",
};

type Pillar = {
  title: string;
  description: string;
};

type Audience = {
  title: string;
  description: string;
};

type ValueItem = {
  title: string;
  description: string;
};

type GameType = {
  title: string;
  description: string;
  tags: string[];
};

const pillars: Pillar[] = [
  {
    title: "تجربة عربية واضحة",
    description:
      "تم تصميم المنصة لتخاطب المستخدم العربي بأسلوب بسيط ومباشر، مع واجهات مرتبة وسهلة الفهم والتنقل.",
  },
  {
    title: "ألعاب جماعية منظمة",
    description:
      "بدل الفوضى المعتادة في إدارة الجلسات والمسابقات، توفّر المنصة تجربة أكثر ترتيبًا وسلاسة من البداية حتى النهاية.",
  },
  {
    title: "مناسبة للترفيه والفعاليات",
    description:
      "المنصة ليست فقط للعب الفردي أو العائلي، بل مناسبة أيضًا للمدارس والمناسبات والأنشطة والجلسات الجماعية.",
  },
];

const audiences: Audience[] = [
  {
    title: "الأصدقاء والعائلة",
    description:
      "لجلسات ممتعة وسريعة تعطي جوًا تفاعليًا بدون تعقيد أو تجهيزات صعبة.",
  },
  {
    title: "المدارس والمبادرات",
    description:
      "لتقديم مسابقات وأنشطة تعليمية أو ترفيهية بشكل أوضح وأسهل أمام الطلاب أو الحضور.",
  },
  {
    title: "الفعاليات والمناسبات",
    description:
      "لمن يريد تشغيل ألعاب جماعية منظمة على شاشة أو ضمن فقرة تفاعلية داخل فعالية.",
  },
  {
    title: "المستخدم المستمر",
    description:
      "لمن يريد منصة يرجع لها باستمرار ويكمل منها اللعب والجولات بدون أن يبدأ من الصفر كل مرة.",
  },
];

const values: ValueItem[] = [
  {
    title: "وضوح في التصميم",
    description:
      "كل جزء في المنصة مبني ليكون سهل الفهم، سواء للزائر الجديد أو للمستخدم الذي يلعب باستمرار.",
  },
  {
    title: "سرعة في الوصول",
    description:
      "الانتقال بين الصفحات، بدء اللعبة، والرجوع للحساب كلها خطوات مباشرة وبدون تعقيد زائد.",
  },
  {
    title: "تجربة قابلة للتوسع",
    description:
      "المنصة مبنية لتخدم أكثر من نوع لعبة وأكثر من نوع استخدام، وليس تجربة محدودة بفكرة واحدة فقط.",
  },
  {
    title: "أسلوب عرض احترافي",
    description:
      "الواجهات مناسبة لأن تظهر بشكل جيد على الهاتف وعلى الشاشات الأكبر عند الاستخدام الجماعي أو أثناء الفعاليات.",
  },
];

const gameTypes: GameType[] = [
  {
    title: "لعبة الأسئلة الرئيسية",
    description:
      "تعتمد على تجربة تنافسية واضحة بفئات وأسئلة ونظام عرض منظم، ومناسبة للمسابقات والجلسات التي تحتاج وضوحًا في اللعب.",
    tags: ["لوحة لعب", "فئات", "أسئلة", "تنافس"],
  },
  {
    title: "برا السالفة",
    description:
      "تجربة اجتماعية تضيف تنوعًا داخل المنصة، وتركّز أكثر على التفاعل بين المشاركين وإعطاء الجلسة طابعًا أخف وأكثر حيوية.",
    tags: ["اجتماعية", "تفاعلية", "جلسات", "تنوع"],
  },
  {
    title: "تجربة الحساب والمتابعة",
    description:
      "المنصة لا تقتصر على اللعب فقط، بل تشمل أيضًا حساب المستخدم، متابعة الجولات، والرجوع للألعاب غير المكتملة بسهولة.",
    tags: ["حساب", "متابعة", "استمرارية", "سهولة"],
  },
];

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function PillarCard({ item }: { item: Pillar }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
        <SparkIcon />
      </div>
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-8 text-slate-300">{item.description}</p>
    </div>
  );
}

function AudienceCard({ item }: { item: Audience }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
    </div>
  );
}

function ValueCard({ item }: { item: ValueItem }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
        <CheckIcon />
      </div>
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
    </div>
  );
}

function GameTypeCard({ item }: { item: GameType }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur">
      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
        داخل المنصة
      </div>

      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-8 text-slate-300">{item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)] text-white">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur">
          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-extrabold text-cyan-100">
                من نحن
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                لمّتنا منصة عربية للألعاب الجماعية
                <br />
                تجمع بين <span className="text-cyan-300">الترفيه</span> و
                <span className="text-cyan-300"> التنظيم</span> و
                <span className="text-cyan-300"> سهولة الاستخدام</span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                لمّتنا ليست مجرد صفحة لعبة واحدة، بل منصة مصممة لتقديم تجارب لعب
                جماعية أكثر ترتيبًا ووضوحًا، بحيث يستطيع المستخدم أو المجموعة
                الدخول بسرعة والبدء في تجربة ممتعة، سواء داخل المنزل أو في جلسة
                مع أصدقاء أو ضمن فعالية أو نشاط منظم.
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                الفكرة الأساسية وراء المنصة هي جعل اللعب الجماعي العربي أكثر
                احترافية من حيث الشكل والتنظيم، من غير أن يفقد خفته ومتعة التفاعل
                بين الناس.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-base font-extrabold text-slate-950 transition hover:bg-cyan-300"
                >
                  عرض الباقات
                  <ArrowLeftIcon />
                </Link>

                <Link
                  href="/game/start"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base font-bold text-white transition hover:bg-white/10"
                >
                  ابدأ اللعب
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-sm font-bold text-slate-400">رؤيتنا</div>
                <div className="mt-2 text-xl font-black text-white">
                  أن تكون لمّتنا من أفضل التجارب العربية للألعاب الجماعية
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  تجربة حديثة، مرتبة، وسهلة الاستخدام، وتناسب أكثر من نوع جمهور
                  وأكثر من نوع مناسبة.
                </p>
              </div>

              <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/10 p-5">
                <div className="text-sm font-bold text-cyan-100">مهمتنا</div>
                <div className="mt-2 text-xl font-black text-white">
                  تحويل اللعب الجماعي إلى تجربة أسهل وأوضح وأجمل بصريًا
                </div>
                <p className="mt-3 text-sm leading-7 text-cyan-50/90">
                  من خلال واجهات منظمة وتجارب متنوعة داخل نفس المنصة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
            مرتكزات المنصة
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            ما الذي تقوم عليه لمّتنا؟
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
            المنصة مبنية على فكرة أن الترفيه يمكن أن يكون منظمًا، وأن واجهة اللعب
            الجميلة لا يجب أن تكون معقدة أو بعيدة عن المستخدم العربي.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((item) => (
            <PillarCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-900/95 to-slate-950/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.24)] lg:p-8">
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-extrabold text-cyan-100">
              لماذا أُنشئت المنصة؟
            </div>

            <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
              لأن كثيرًا من جلسات اللعب الجماعي تحتاج طريقة أوضح وأرتب
            </h2>

            <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
              في كثير من الأحيان تكون الفكرة نفسها ممتعة، لكن المشكلة تكون في
              طريقة التقديم أو إدارة الجولة أو التنقل بين الأسئلة أو متابعة ما
              تم لعبه. هنا تأتي لمّتنا لتقدم تجربة منظمة من غير أن تقتل روح
              العفوية والمتعة.
            </p>

            <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
              لهذا السبب تم بناء المنصة لتجمع بين سهولة الوصول، وضوح العرض،
              وإمكانية التوسع إلى أكثر من نوع لعبة وأكثر من نوع استخدام.
            </p>
          </div>

          <div>
            <div className="mb-6">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
                لمن صُممت؟
              </div>
              <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                المنصة مناسبة لأكثر من نوع مستخدم
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {audiences.map((item) => (
                <AudienceCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
            داخل لمّتنا
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            المنصة لا تتحدث عن لعبة واحدة فقط
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
            الصفحة الجديدة توضح أن لمّتنا منصة متكاملة فيها أكثر من نوع تجربة،
            مع حساب مستخدم وتنظيم أوضح واستمرارية أفضل.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {gameTypes.map((item) => (
            <GameTypeCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
            قيمتنا
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            ماذا تريد لمّتنا أن تقدم للمستخدم؟
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {values.map((item) => (
            <ValueCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 via-slate-900/95 to-slate-950/95 p-8 text-center shadow-[0_20px_80px_rgba(8,47,73,0.35)]">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-extrabold text-cyan-100">
            ابدأ رحلتك مع لمّتنا
          </div>

          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            جرّب المنصة بنفسك واكتشف الفرق
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            سواء كنت تبحث عن تجربة خفيفة مع الأصدقاء أو منصة مرتبة لعرض الألعاب
            والأنشطة بشكل أجمل، لمّتنا تعطيك بداية أقوى وتجربة أوضح.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-base font-extrabold text-slate-950 transition hover:bg-cyan-300"
            >
              إنشاء حساب
              <ArrowLeftIcon />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
            >
              استعراض الباقات
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}