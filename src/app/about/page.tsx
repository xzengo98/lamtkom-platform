import Link from "next/link";

export const metadata = {
  title: "من نحن | لمتكم",
  description:
    "تعرف على منصة لمتكم، رؤيتها، فكرتها، والألعاب الجماعية التي تقدمها للمستخدمين والفعاليات.",
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

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const pillars: Pillar[] = [
  {
    title: "منصة عربية بهوية واضحة",
    description:
      "تم تصميم لمتكم لتخاطب المستخدم العربي بشكل حديث وواضح، مع تجربة استخدام مرتبة وسهلة الفهم من أول زيارة.",
  },
  {
    title: "ألعاب جماعية منظمة",
    description:
      "الفكرة ليست مجرد لعبة، بل تقديم جلسات لعب أكثر ترتيبًا ووضوحًا، سواء بين الأصدقاء أو أمام جمهور أو ضمن فعالية.",
  },
  {
    title: "تجارب متعددة داخل مكان واحد",
    description:
      "لمتكم تجمع أكثر من نوع لعبة داخل منصة واحدة، بحيث يحصل المستخدم على تنوع أكبر بدون تشتيت أو واجهات منفصلة.",
  },
];

const audiences: Audience[] = [
  {
    title: "الأصدقاء والعائلة",
    description:
      "لجلسات سريعة وممتعة تضيف جوًا تفاعليًا واضحًا ومنظمًا بدون تعقيد.",
  },
  {
    title: "المدارس والمبادرات",
    description:
      "لتقديم مسابقات وأنشطة تعليمية أو ترفيهية بطريقة أوضح وأسهل أمام الطلاب أو الحضور.",
  },
  {
    title: "الفعاليات والمناسبات",
    description:
      "لمن يريد تشغيل ألعاب جماعية مرتبة على شاشة أو ضمن فقرة تفاعلية داخل فعالية.",
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
    title: "عرض احترافي على كل الأجهزة",
    description:
      "واجهة لمتكم مصممة لتظهر بشكل أنيق على الهاتف، وعلى الشاشات الأكبر، وفي الاستخدام الجماعي أيضًا.",
  },
];

const gameTypes: GameType[] = [
  {
    title: "لمتكم",
    description:
      "اللعبة الرئيسية المبنية على الفئات والأسئلة والنقاط، وتناسب المسابقات والجلسات التي تحتاج وضوحًا في اللعب بين فريقين.",
    tags: ["أسئلة وأجوبة", "فئات", "نقاط", "منافسة"],
  },
  {
    title: "برا السالفة",
    description:
      "لعبة اجتماعية ممتعة يختار فيها النظام شخصًا واحدًا فقط يكون برا السالفة، والباقي يحاولون كشفه.",
    tags: ["اجتماعية", "جلسات", "تفاعل مباشر", "تنوع"],
  },
  {
    title: "Codenames",
    description:
      "نسخة داخل المنصة من لعبة الكلمات والتلميحات الشهيرة، وتضيف طابعًا مختلفًا يعتمد على التفكير والعمل الجماعي.",
    tags: ["كلمات", "تلميحات", "فرق", "4 لاعبين+"],
  },
];

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
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
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function PillarCard({ item }: { item: Pillar }) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.20)]">
      <div className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
        مرتكز أساسي
      </div>
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
    </div>
  );
}

function AudienceCard({ item }: { item: Audience }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
    </div>
  );
}

function ValueCard({ item }: { item: ValueItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
      <div className="mb-3 text-cyan-300">
        <CheckIcon />
      </div>
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
    </div>
  );
}

function GameTypeCard({ item }: { item: GameType }) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.20)]">
      <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
        داخل المنصة
      </div>

      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/75"
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8 xl:p-10">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative grid gap-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                من نحن
              </div>

              <h1 className="text-3xl font-black text-white md:text-5xl">
                لمتكم منصة عربية
                <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
                  للألعاب الجماعية الحديثة
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
                لمتكم ليست مجرد صفحة لعبة واحدة، بل منصة مصممة لتقديم تجارب لعب
                جماعية أكثر ترتيبًا ووضوحًا، بحيث يستطيع المستخدم أو المجموعة
                الدخول بسرعة والبدء في تجربة ممتعة، سواء داخل المنزل أو في جلسة
                مع الأصدقاء أو ضمن فعالية أو نشاط منظم.
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
                الفكرة الأساسية وراء المنصة هي جعل اللعب الجماعي العربي أكثر
                احترافية من حيث الشكل والتنظيم، من غير أن يفقد خفته ومتعة التفاعل
                بين الناس.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  استكشف الألعاب
                  <ArrowLeftIcon />
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  عرض الباقات
                </Link>
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="relative flex h-[260px] w-[260px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,26,55,0.96)_0%,rgba(8,16,36,0.96)_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:h-[320px] md:w-[320px]">
                <div className="absolute inset-0 rounded-[inherit] border border-white/5" />
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="h-[170px] w-[170px] object-contain md:h-[230px] md:w-[230px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Vision / Mission */}
        <section className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.8rem] border border-cyan-300/20 bg-cyan-400/10 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-slate-950/20 px-3 py-1.5 text-xs font-black text-cyan-100">
              رؤيتنا
            </div>
            <h2 className="text-2xl font-black text-white">
              أن تكون لمتكم من أفضل التجارب العربية للألعاب الجماعية
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/80">
              تجربة حديثة، مرتبة، وسهلة الاستخدام، وتناسب أكثر من نوع جمهور
              وأكثر من نوع مناسبة.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
              مهمتنا
            </div>
            <h2 className="text-2xl font-black text-white">
              تحويل اللعب الجماعي إلى تجربة أسهل وأوضح وأجمل بصريًا
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/72">
              من خلال واجهات منظمة وتجارب متنوعة داخل نفس المنصة، مع تركيز واضح
              على سهولة الاستخدام، سرعة الوصول، واستمرارية اللعب.
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              مرتكزات المنصة
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              ما الذي تقوم عليه لمتكم؟
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              المنصة مبنية على فكرة أن الترفيه يمكن أن يكون منظمًا، وأن واجهة
              اللعب الجميلة لا يجب أن تكون معقدة أو بعيدة عن المستخدم العربي.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pillars.map((item) => (
              <PillarCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {/* Why created */}
        <section className="mb-10 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 md:p-8">
          <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
            لماذا أُنشئت المنصة؟
          </div>
          <h2 className="text-2xl font-black text-white md:text-3xl">
            لأن كثيرًا من جلسات اللعب الجماعي تحتاج طريقة أوضح وأرتب
          </h2>
          <p className="mt-4 text-sm leading-8 text-white/72 md:text-base">
            في كثير من الأحيان تكون الفكرة نفسها ممتعة، لكن المشكلة تكون في
            طريقة التقديم أو إدارة الجولة أو التنقل بين الأسئلة أو متابعة ما تم
            لعبه. هنا تأتي لمتكم لتقدم تجربة منظمة من غير أن تقتل روح العفوية
            والمتعة.
          </p>
          <p className="mt-4 text-sm leading-8 text-white/72 md:text-base">
            لهذا السبب تم بناء المنصة لتجمع بين سهولة الوصول، وضوح العرض،
            وإمكانية التوسع إلى أكثر من نوع لعبة وأكثر من نوع استخدام.
          </p>
        </section>

        {/* Audience */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              لمن صُممت؟
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              المنصة مناسبة لأكثر من نوع مستخدم
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map((item) => (
              <AudienceCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {/* Games */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              داخل لمتكم
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              المنصة لا تتحدث عن لعبة واحدة فقط
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              لمتكم منصة متكاملة فيها أكثر من نوع تجربة: لعبة الأسئلة الرئيسية،
              برا السالفة، وCodenames، إضافة إلى حساب مستخدم يساعد على متابعة
              اللعب والرجوع للجولات غير المكتملة.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gameTypes.map((item) => (
              <GameTypeCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              قيمتنا
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              ماذا تريد لمتكم أن تقدم للمستخدم؟
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {values.map((item) => (
              <ValueCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-8">
          <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
            ابدأ رحلتك مع لمتكم
          </div>
          <h2 className="text-2xl font-black text-white md:text-3xl">
            جرّب المنصة بنفسك واكتشف الفرق
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
            سواء كنت تبحث عن تجربة خفيفة مع الأصدقاء أو منصة مرتبة لعرض الألعاب
            والأنشطة بشكل أجمل، لمتكم تعطيك بداية أقوى وتجربة أوضح.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              إنشاء حساب
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              استعراض الباقات
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}