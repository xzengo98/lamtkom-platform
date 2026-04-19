import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "من نحن | لمتكم",
  description:
    "تعرف على منصة لمتكم — قصتها، رؤيتها، وما الذي يجعلها وجهة مختلفة للألعاب الجماعية العربية.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Pillar    = { title: string; description: string };
type Audience  = { title: string; description: string };
type ValueItem = { title: string; description: string };
type GameType  = { title: string; description: string; tags: string[] };
type Milestone = { year: string; label: string; description: string };

// ─── Data ─────────────────────────────────────────────────────────────────────

const heroLogo = "/logo.webp";

const stats = [
  { val: "٣",    label: "ألعاب متاحة",        accent: "cyan" },
  { val: "١٠٠٪", label: "واجهة عربية بالكامل", accent: "orange" },
  { val: "٣+",   label: "لاعبين لكل جلسة",    accent: "violet" },
  { val: "∞",    label: "جولات بلا حدود",      accent: "emerald" },
];

const milestones: Milestone[] = [
  {
    year: "البداية",
    label: "فكرة وُلدت من جلسة",
    description:
      "بدأت لمتكم من موقف بسيط: جلسة مع أصدقاء والحاجة إلى لعبة جماعية منظمة وسهلة بدون تعقيد.",
  },
  {
    year: "البناء",
    label: "منصة عربية من الصفر",
    description:
      "تم بناء المنصة بتركيز كامل على تجربة المستخدم العربي — من التصميم إلى طريقة اللعب.",
  },
  {
    year: "التوسع",
    label: "أكثر من لعبة واحدة",
    description:
      "أُضيفت ألعاب جديدة تدريجيًا: برا السالفة وCodenames، لتصبح المنصة وجهة متكاملة.",
  },
  {
    year: "اليوم",
    label: "منصة في طور النمو",
    description:
      "لمتكم اليوم تخدم الجلسات والمدارس والفعاليات، وتواصل التطور لتقديم تجربة أفضل.",
  },
];

const pillars: Pillar[] = [
  {
    title: "منصة عربية بهوية واضحة",
    description:
      "تم تصميم لمتكم لتخاطب المستخدم العربي بشكل حديث وواضح، مع تجربة استخدام مرتبة وسهلة الفهم من أول زيارة.",
  },
  {
    title: "ألعاب جماعية منظمة",
    description:
      "الفكرة ليست مجرد لعبة، بل تقديم جلسات لعب أكثر ترتيبًا ووضوحًا — سواء بين الأصدقاء أو أمام جمهور أو ضمن فعالية.",
  },
  {
    title: "تجارب متعددة داخل مكان واحد",
    description:
      "لمتكم تجمع أكثر من نوع لعبة داخل منصة واحدة، بحيث يحصل المستخدم على تنوع أكبر بدون تشتيت.",
  },
];

const audiences: Audience[] = [
  { title: "الأصدقاء والعائلة",    description: "لجلسات سريعة وممتعة تضيف جوًا تفاعليًا واضحًا ومنظمًا بدون تعقيد." },
  { title: "المدارس والمبادرات",   description: "لتقديم مسابقات وأنشطة تعليمية أو ترفيهية بطريقة أوضح وأسهل أمام الطلاب." },
  { title: "الفعاليات والمناسبات", description: "لمن يريد تشغيل ألعاب جماعية مرتبة على شاشة أو ضمن فقرة تفاعلية." },
  { title: "المستخدم المستمر",     description: "لمن يريد منصة يرجع لها باستمرار ويكمل منها اللعب بدون أن يبدأ من الصفر." },
];

const values: ValueItem[] = [
  { title: "وضوح في التصميم",        description: "كل جزء في المنصة مبني ليكون سهل الفهم، سواء للزائر الجديد أو للمستخدم الدائم." },
  { title: "سرعة في الوصول",         description: "الانتقال بين الصفحات، بدء اللعبة، والرجوع للحساب — كلها خطوات مباشرة." },
  { title: "تجربة قابلة للتوسع",    description: "المنصة مبنية لتخدم أكثر من نوع لعبة وأكثر من نوع استخدام." },
  { title: "عرض احترافي على كل الأجهزة", description: "واجهة لمتكم مصممة لتظهر بشكل أنيق على الهاتف وعلى الشاشات الكبيرة." },
];

const gameTypes: GameType[] = [
  {
    title: "لمتكم",
    description: "اللعبة الرئيسية المبنية على الفئات والأسئلة والنقاط، وتناسب المسابقات والجلسات بين فريقين.",
    tags: ["أسئلة وأجوبة", "فئات", "نقاط", "منافسة"],
  },
  {
    title: "برا السالفة",
    description: "لعبة اجتماعية ممتعة يختار فيها النظام شخصًا واحدًا لا يعرف الكلمة، والباقي يحاولون كشفه.",
    tags: ["اجتماعية", "جلسات", "تفاعل مباشر", "تنوع"],
  },
  {
    title: "Codenames",
    description: "نسخة داخل المنصة من لعبة الكلمات والتلميحات الشهيرة، تعتمد على التفكير والعمل الجماعي.",
    tags: ["كلمات", "تلميحات", "فرق", "4 لاعبين+"],
  },
];

const roadmapItems = [
  { label: "أسئلة مخصصة",        desc: "إمكانية إضافة أسئلتك وفئاتك الخاصة.", color: "cyan" },
  { label: "جلسات خاصة",         desc: "روابط جلسات لمشاركتها مع مجموعتك مباشرة.", color: "orange" },
  { label: "لوحة نتائج حية",     desc: "متابعة النتائج والجولات في الوقت الفعلي.", color: "violet" },
  { label: "ألعاب جديدة",        desc: "توسيع المنصة بألعاب جماعية عربية جديدة.", color: "emerald" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function GlobeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function GamesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="3" /><path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01" />
    </svg>
  );
}

function ExpandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" />
      <path d="M3 20a5 5 0 0 1 10 0" /><path d="M11 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

function SchoolIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}

function EventIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}

function DesignIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function ZapIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function MobileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18h2" />
    </svg>
  );
}

function QuizIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11h6M9 15h4" />
      <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function SocialIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" />
      <path d="M3 20a5 5 0 0 1 10 0" /><path d="M11 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

function WordIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M12 2v5h5M8 13h8M8 17h5" />
    </svg>
  );
}

function RocketIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionBadge({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "cyan" | "orange" | "violet" | "emerald" }) {
  const styles: Record<string, string> = {
    default:  "border-white/10 bg-white/5 text-white/50",
    cyan:     "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
    orange:   "border-orange-400/20 bg-orange-400/8 text-orange-300",
    violet:   "border-violet-400/20 bg-violet-400/8 text-violet-300",
    emerald:  "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
  };
  const dotStyles: Record<string, string> = {
    default: "bg-cyan-400", cyan: "bg-cyan-400", orange: "bg-orange-400",
    violet: "bg-violet-400", emerald: "bg-emerald-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wide ${styles[color]}`}>
      <span className={`h-1 w-1 rounded-full ${dotStyles[color]}`} />
      {children}
    </span>
  );
}

function SectionHeader({ badge, badgeColor = "default", title, subtitle }: {
  badge: string; badgeColor?: "default" | "cyan" | "orange" | "violet" | "emerald";
  title: React.ReactNode; subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <SectionBadge color={badgeColor}>{badge}</SectionBadge>
      <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">{subtitle}</p>
      )}
    </div>
  );
}

// ─── PillarCard ───────────────────────────────────────────────────────────────

const pillarMeta = [
  { bar: "from-cyan-400/70 to-cyan-400/0",    icon: <GlobeIcon   className="h-5 w-5" />, iconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"   },
  { bar: "from-orange-400/70 to-orange-400/0", icon: <GamesIcon  className="h-5 w-5" />, iconClass: "border-orange-400/20 bg-orange-400/10 text-orange-300" },
  { bar: "from-violet-400/70 to-violet-400/0", icon: <ExpandIcon className="h-5 w-5" />, iconClass: "border-violet-400/20 bg-violet-400/10 text-violet-300" },
];

function PillarCard({ item, index }: { item: Pillar; index: number }) {
  const meta = pillarMeta[index] ?? pillarMeta[0];
  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.92)_0%,rgba(6,12,28,0.98)_100%)] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/14 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${meta.bar}`} />
      <div className="mb-4 flex items-center gap-3">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${meta.iconClass}`}>
          {meta.icon}
        </div>
      </div>
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">{item.description}</p>
    </div>
  );
}

// ─── AudienceCard ─────────────────────────────────────────────────────────────

const audienceMeta = [
  { bar: "from-cyan-400/60 to-transparent",    icon: <UsersIcon  className="h-5 w-5" />, iconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",    num: "text-cyan-400/25"    },
  { bar: "from-emerald-400/60 to-transparent", icon: <SchoolIcon className="h-5 w-5" />, iconClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", num: "text-emerald-400/25" },
  { bar: "from-orange-400/60 to-transparent",  icon: <EventIcon  className="h-5 w-5" />, iconClass: "border-orange-400/20 bg-orange-400/10 text-orange-300",  num: "text-orange-400/25"  },
  { bar: "from-violet-400/60 to-transparent",  icon: <UserIcon   className="h-5 w-5" />, iconClass: "border-violet-400/20 bg-violet-400/10 text-violet-300",  num: "text-violet-400/25"  },
];

function AudienceCard({ item, index }: { item: Audience; index: number }) {
  const meta = audienceMeta[index] ?? audienceMeta[0];
  const nums = ["١", "٢", "٣", "٤"];
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.025] p-5 transition duration-300 hover:bg-white/[0.045] hover:border-white/12">
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${meta.bar}`} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${meta.iconClass}`}>
          {meta.icon}
        </div>
        <span className={`text-4xl font-black ${meta.num} select-none`}>{nums[index]}</span>
      </div>
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-2.5 text-sm leading-7 text-white/55">{item.description}</p>
    </div>
  );
}

// ─── ValueCard ────────────────────────────────────────────────────────────────

const valueMeta = [
  { icon: <DesignIcon className="h-5 w-5" />, iconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",       num: "text-cyan-400/20"    },
  { icon: <ZapIcon    className="h-5 w-5" />, iconClass: "border-orange-400/20 bg-orange-400/10 text-orange-300",  num: "text-orange-400/20"  },
  { icon: <ExpandIcon className="h-5 w-5" />, iconClass: "border-violet-400/20 bg-violet-400/10 text-violet-300",  num: "text-violet-400/20"  },
  { icon: <MobileIcon className="h-5 w-5" />, iconClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", num: "text-emerald-400/20" },
];

function ValueCard({ item, index }: { item: ValueItem; index: number }) {
  const meta = valueMeta[index] ?? valueMeta[0];
  const nums = ["٠١", "٠٢", "٠٣", "٠٤"];
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.025] p-5 transition duration-300 hover:bg-white/[0.045]">
      <span className={`absolute -left-2 -top-3 select-none text-6xl font-black ${meta.num}`}>{nums[index]}</span>
      <div className={`relative mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${meta.iconClass}`}>
        {meta.icon}
      </div>
      <h3 className="relative text-lg font-black text-white">{item.title}</h3>
      <p className="mt-2.5 text-sm leading-7 text-white/55">{item.description}</p>
    </div>
  );
}

// ─── GameTypeCard ─────────────────────────────────────────────────────────────

const gameMeta = [
  { bar: "from-cyan-400/70 to-transparent",    icon: <QuizIcon   className="h-5 w-5" />, iconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"   },
  { bar: "from-orange-400/70 to-transparent",  icon: <SocialIcon className="h-5 w-5" />, iconClass: "border-orange-400/20 bg-orange-400/10 text-orange-300" },
  { bar: "from-violet-400/70 to-transparent",  icon: <WordIcon   className="h-5 w-5" />, iconClass: "border-violet-400/20 bg-violet-400/10 text-violet-300" },
];

function GameTypeCard({ item, index }: { item: GameType; index: number }) {
  const meta = gameMeta[index] ?? gameMeta[0];
  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.92)_0%,rgba(6,12,28,0.98)_100%)] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/14">
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${meta.bar}`} />
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${meta.iconClass}`}>
        {meta.icon}
      </div>
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">{item.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-bold text-white/40">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── MilestoneItem ────────────────────────────────────────────────────────────

const milestoneColors = [
  { dot: "bg-cyan-400",    ring: "border-cyan-400/30 bg-cyan-400/10",    text: "text-cyan-300"    },
  { dot: "bg-orange-400",  ring: "border-orange-400/30 bg-orange-400/10",  text: "text-orange-300"  },
  { dot: "bg-violet-400",  ring: "border-violet-400/30 bg-violet-400/10",  text: "text-violet-300"  },
  { dot: "bg-emerald-400", ring: "border-emerald-400/30 bg-emerald-400/10", text: "text-emerald-300" },
];

function MilestoneItem({ item, index, isLast }: { item: Milestone; index: number; isLast: boolean }) {
  const c = milestoneColors[index] ?? milestoneColors[0];
  return (
    <div className="relative flex gap-5">
      {/* Line */}
      <div className="flex flex-col items-center">
        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${c.ring}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-white/8" />}
      </div>
      {/* Content */}
      <div className={`pb-8 ${isLast ? "" : ""}`}>
        <span className={`inline-block rounded-full border border-current/20 px-2.5 py-0.5 text-xs font-black ${c.text} mb-2`}>
          {item.year}
        </span>
        <h3 className="text-lg font-black text-white">{item.label}</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-7 text-white/50">{item.description}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="min-h-screen text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-80 rounded-full bg-violet-500/7 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-64 rounded-full bg-orange-500/5 blur-2xl" />
          {/* Subtle grid pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative grid gap-8 px-7 py-12 md:px-10 md:py-16 xl:grid-cols-[1.25fr_auto] xl:items-center xl:gap-16">
            {/* Left — text */}
            <div>
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-xs font-bold text-white/30">
                <Link href="/" className="flex items-center gap-1.5 transition hover:text-white/55">
                  <HomeIcon className="h-3.5 w-3.5" /> الرئيسية
                </Link>
                <span>/</span>
                <span className="text-white/50">من نحن</span>
              </div>

              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
                <SparkIcon className="h-3.5 w-3.5" /> قصة لمتكم
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl xl:text-[3.4rem]">
                منصة ألعاب جماعية
                <span className="mt-2 block bg-gradient-to-l from-cyan-400 via-violet-400 to-orange-400 bg-clip-text text-transparent">
                  صُنعت خصيصًا للمستخدم العربي
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/60 md:text-base">
                لمتكم ليست مجرد لعبة — بل منصة بُنيت لتحوّل أي جلسة عادية إلى تجربة منظمة
                وممتعة، سواء في البيت أو في فعالية أو مع الأصدقاء.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-8 text-white/38 md:text-base">
                فكرة بسيطة: اللعب الجماعي العربي يستحق واجهة أحترف وأوضح — بدون أن يفقد
                خفته ومتعته.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  استكشف الألعاب <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  عرض الباقات
                </Link>
              </div>
            </div>

            {/* Right — logo card */}
            <div className="hidden xl:flex xl:justify-end">
              <div className="relative flex h-[230px] w-[230px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(14,24,50,0.96)_0%,rgba(7,13,30,0.98)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_70%)]" />
                <div className="absolute inset-5 rounded-[1.5rem] border border-cyan-400/8" />
                <Image
                  src={heroLogo}
                  alt="شعار لمتكم"
                  width={160}
                  height={160}
                  priority
                  className="relative object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.18)]"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Stats Bar ───────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => {
            const colorMap: Record<string, string> = {
              cyan:    "border-cyan-400/15 bg-cyan-400/5 text-cyan-300",
              orange:  "border-orange-400/15 bg-orange-400/5 text-orange-300",
              violet:  "border-violet-400/15 bg-violet-400/5 text-violet-300",
              emerald: "border-emerald-400/15 bg-emerald-400/5 text-emerald-300",
            };
            return (
              <div key={s.label} className={`flex flex-col items-center justify-center rounded-[1.4rem] border py-5 text-center ${colorMap[s.accent]}`}>
                <span className="text-3xl font-black">{s.val}</span>
                <span className="mt-1 text-xs font-bold opacity-70">{s.label}</span>
              </div>
            );
          })}
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Vision + Mission ────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          {/* Vision */}
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(14,28,56,0.97)_0%,rgba(6,12,28,0.99)_100%)] p-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-2xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> رؤيتنا
              </div>
              <h2 className="text-2xl font-black leading-tight text-white">
                أن تكون لمتكم من أفضل التجارب العربية للألعاب الجماعية
              </h2>
              <div className="mt-4 h-px bg-cyan-400/15" />
              <p className="mt-4 text-sm leading-8 text-white/60">
                تجربة حديثة، مرتبة، وسهلة الاستخدام — تناسب أكثر من نوع جمهور وأكثر من نوع مناسبة.
              </p>
              <div className="mt-5 text-5xl font-black leading-none text-cyan-400/8 select-none">"</div>
            </div>
          </div>

          {/* Mission */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.92)_0%,rgba(6,12,28,0.98)_100%)] p-7">
            <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-violet-500/8 blur-2xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3.5 py-1.5 text-xs font-bold text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> مهمتنا
              </div>
              <h2 className="text-2xl font-black leading-tight text-white">
                تحويل اللعب الجماعي إلى تجربة أسهل وأوضح وأجمل بصريًا
              </h2>
              <div className="mt-4 h-px bg-white/6" />
              <p className="mt-4 text-sm leading-8 text-white/55">
                من خلال واجهات منظمة وتجارب متنوعة داخل نفس المنصة، مع تركيز على سهولة الاستخدام وسرعة الوصول.
              </p>
              <div className="mt-5 text-5xl font-black leading-none text-violet-400/8 select-none">"</div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Story / Timeline ────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <div className="overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,24,50,0.97)_0%,rgba(6,12,28,0.99)_100%)] px-7 py-10 md:px-12 md:py-12">
            <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-orange-500/5 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/35 to-transparent" />

            <SectionHeader
              badge="قصة المنصة"
              badgeColor="orange"
              title="من فكرة إلى منصة"
              subtitle="لمتكم لم تُبنَ في يوم واحد — هي نتيجة ملاحظة حقيقية وحاجة فعلية."
            />

            <div className="grid gap-0 md:grid-cols-2 md:gap-x-14">
              <div>
                {milestones.slice(0, 2).map((m, i) => (
                  <MilestoneItem key={m.year} item={m} index={i} isLast={false} />
                ))}
              </div>
              <div>
                {milestones.slice(2).map((m, i) => (
                  <MilestoneItem key={m.year} item={m} index={i + 2} isLast={i === milestones.slice(2).length - 1} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Pillars ─────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <SectionHeader
            badge="مرتكزات المنصة"
            title="ما الذي تقوم عليه لمتكم؟"
            subtitle="المنصة مبنية على ثلاثة مرتكزات أساسية تشكّل كل قرار في تصميمها وتطويرها."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pillars.map((item, i) => <PillarCard key={item.title} item={item} index={i} />)}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Why created — quote block ────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,24,50,0.97)_0%,rgba(6,12,28,0.99)_100%)] px-7 py-10 md:px-12 md:py-12">
            <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-orange-500/6 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-cyan-500/6 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />

            <div className="relative">
              <SectionBadge color="orange">لماذا أُنشئت المنصة؟</SectionBadge>
              <h2 className="mt-4 text-2xl font-black text-white md:text-3xl">
                لأن كثيرًا من جلسات اللعب الجماعي تحتاج طريقة أوضح وأرتب
              </h2>
              <div className="mt-6 flex gap-4">
                <div className="w-1 shrink-0 rounded-full bg-gradient-to-b from-orange-400/60 to-transparent" />
                <div className="space-y-4">
                  <p className="text-sm leading-8 text-white/60 md:text-base">
                    في كثير من الأحيان تكون الفكرة نفسها ممتعة، لكن المشكلة تكون في طريقة التقديم أو إدارة الجولة أو التنقل بين الأسئلة أو متابعة ما تم لعبه. هنا تأتي لمتكم لتقدم تجربة منظمة من غير أن تقتل روح العفوية والمتعة.
                  </p>
                  <p className="text-sm leading-8 text-white/45 md:text-base">
                    لهذا السبب تم بناء المنصة لتجمع بين سهولة الوصول، وضوح العرض، وإمكانية التوسع إلى أكثر من نوع لعبة وأكثر من نوع استخدام.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Audience ────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <SectionHeader
            badge="لمن صُممت؟"
            title="المنصة مناسبة لأكثر من نوع مستخدم"
            subtitle="سواء كنت تلعب مع الأصدقاء في البيت أو تدير نشاطًا أمام جمهور — لمتكم مبنية لتناسبك."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {audiences.map((item, i) => <AudienceCard key={item.title} item={item} index={i} />)}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Games ───────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionBadge>داخل لمتكم</SectionBadge>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                المنصة لا تتحدث عن لعبة واحدة فقط
              </h2>
              <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
                لمتكم منصة متكاملة فيها أكثر من نوع تجربة — لعبة الأسئلة، برا السالفة، وCodenames.
              </p>
            </div>
            <Link
              href="/games"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              كل الألعاب <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gameTypes.map((item, i) => <GameTypeCard key={item.title} item={item} index={i} />)}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Values ──────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <SectionHeader
            badge="مبادئنا"
            title="ماذا تريد لمتكم أن تقدم للمستخدم؟"
            subtitle="كل قرار في المنصة مبني على أحد هذه المبادئ الأربعة."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((item, i) => <ValueCard key={item.title} item={item} index={i} />)}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── Roadmap ─────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,24,50,0.97)_0%,rgba(6,12,28,0.99)_100%)] px-7 py-10 md:px-12 md:py-12">
            <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-violet-500/6 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

            <div className="relative">
              <SectionBadge color="violet">ما القادم؟</SectionBadge>
              <h2 className="mt-4 text-2xl font-black text-white md:text-3xl">
                لمتكم في طور التطور المستمر
              </h2>
              <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50">
                نعمل باستمرار على تطوير المنصة وإضافة ميزات جديدة تحسّن تجربة اللعب.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {roadmapItems.map((r) => {
                  const colorMap: Record<string, string> = {
                    cyan:    "border-cyan-400/15 bg-cyan-400/5 text-cyan-300",
                    orange:  "border-orange-400/15 bg-orange-400/5 text-orange-300",
                    violet:  "border-violet-400/15 bg-violet-400/5 text-violet-300",
                    emerald: "border-emerald-400/15 bg-emerald-400/5 text-emerald-300",
                  };
                  const iconColor: Record<string, string> = {
                    cyan: "text-cyan-400", orange: "text-orange-400", violet: "text-violet-400", emerald: "text-emerald-400",
                  };
                  return (
                    <div key={r.label} className={`relative rounded-[1.4rem] border p-5 ${colorMap[r.color]}`}>
                      <div className={`mb-2 ${iconColor[r.color]}`}>
                        <RocketIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-white">{r.label}</h3>
                      <p className="mt-1.5 text-xs leading-6 text-white/50">{r.desc}</p>
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-bold opacity-70">
                        قريبًا
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mb-0">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(14,24,50,0.97)_0%,rgba(7,13,30,0.99)_100%)] px-7 py-10 md:px-12 md:py-12">
            <div className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-cyan-500/7 blur-2xl" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-violet-500/7 blur-2xl" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-right">
              <div>
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3.5 py-1.5 text-xs font-bold text-cyan-300">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  ابدأ رحلتك مع لمتكم
                </div>
                <h3 className="text-2xl font-black text-white md:text-3xl">
                  جرّب المنصة بنفسك واكتشف الفرق
                </h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/50">
                  سواء كنت تبحث عن تجربة خفيفة مع الأصدقاء أو منصة مرتبة للفعاليات — لمتكم تعطيك بداية أقوى وتجربة أوضح.
                </p>
                <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-start">
                  {["تسجيل مجاني", "بدون تعقيد", "تعمل على كل الأجهزة"].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs font-bold text-white/40">
                      <CheckIcon className="h-3.5 w-3.5 text-cyan-400" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  إنشاء حساب مجاني <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/6 px-7 py-3.5 text-sm font-black text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  استعراض الباقات
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer strip ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/20">
          <span>لمتكم © {new Date().getFullYear()}</span>
          <div className="flex gap-5">
            <Link href="/terms"   className="transition hover:text-white/45">الشروط</Link>
            <Link href="/privacy" className="transition hover:text-white/45">الخصوصية</Link>
            <Link href="/contact" className="transition hover:text-white/45">تواصل معنا</Link>
          </div>
        </div>

      </div>
    </main>
  );
}
