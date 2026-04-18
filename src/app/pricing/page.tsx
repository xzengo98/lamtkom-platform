import Link from "next/link";

// ─── Types (unchanged) ────────────────────────────────────────────────────────
type PlanFeature = { text: string };
type Plan = { name: string; badge: string; price: string; description: string; highlight?: string; cta: string; href: string; featured?: boolean; features: PlanFeature[]; };
type GameCard = { title: string; description: string; points: string[]; };
type FaqItem = { question: string; answer: string; };

// ─── Data (unchanged) ─────────────────────────────────────────────────────────
const heroLogo = "/logo.png";

const plans: Plan[] = [
  { name: "الخطة المجانية", badge: "للتجربة", price: "0 JD", description: "مناسبة لتجربة المنصة والتعرّف على طريقة اللعب قبل الانتقال إلى خطة أعلى.", cta: "ابدأ مجانًا", href: "/signup", features: [ { text: "إنشاء حساب والبدء مباشرة" }, { text: "الوصول للتجربة الأساسية" }, { text: "مناسبة للتجربة الأولى" }, { text: "متابعة الألعاب غير المكتملة من الحساب" } ] },
  { name: "الخطة المميزة", badge: "الأكثر طلبًا", price: "10 JD", description: "أفضل خيار للمستخدم الذي يريد لعبًا أكثر وتجربة أكثر استمرارية.", highlight: "مناسبة للأفراد والمجموعات الصغيرة والاستخدام المستمر", cta: "اشترِ الآن", href: "/payment?plan=featured", featured: true, features: [ { text: "عدد ألعاب أكبر بحسب التفعيل" }, { text: "أنسب للتجربة المستمرة" }, { text: "متابعة الجولات غير المكتملة بسهولة" }, { text: "استفادة أفضل من كامل تجربة المنصة" } ] },
  { name: "Premium خطة", badge: "احترافي", price: "20 JD", description: "خطة أعلى للمستخدم الذي يريد تجربة أقوى وأكثر مرونة واستخدامًا متقدمًا.", cta: "اشترِ الآن", href: "/payment?plan=premium", features: [ { text: "مرونة أعلى في الاستخدام" }, { text: "أنسب للتوسع أو الاستخدام الاحترافي" }, { text: "حل مناسب للمهتمين بالتفعيل الكامل" }, { text: "مستوى أعلى من الاستفادة من المنصة" } ] },
  { name: "شراء ألعاب منفردة", badge: "مرن", price: "1 JD / لعبة", description: "إذا كنت لا تريد شراء باقة كاملة، يمكنك شراء عدد ألعاب معين خاص بلعبة لمتكم فقط.", cta: "اشترِ الآن", href: "/payment?plan=games", features: [ { text: "مرونة في شراء عدد الألعاب فقط" }, { text: "مخصص للعبة لمتكم" }, { text: "مناسب للمستخدم الذي يحتاج تفعيلًا محدودًا" }, { text: "1 JD لكل لعبة واحدة" } ] },
];

const games: GameCard[] = [
  { title: "لعبة الأسئلة الرئيسية", description: "تجربة تنافسية منظمة مناسبة للعرض على الشاشات، مع فئات وأسئلة ونظام نقاط واضح بين الفرق.", points: ["لوحة لعب مرتبة", "فئات متعددة", "نظام نقاط", "مناسبة للفعاليات"] },
  { title: "برا السالفة", description: "لعبة اجتماعية تفاعلية داخل المنصة تضيف تنوعًا أكبر للتجربة، وتناسب الجلسات والمجموعات بشكل ممتع وسريع.", points: ["تجربة جماعية", "تفاعل مباشر", "مناسبة للجلسات", "تنوع داخل المنصة"] },
  { title: "Codenames", description: "تجربة كلمات وتلميحات تضيف بعدًا مختلفًا داخل المنصة، وتناسب من يريد أسلوب لعب جماعي يعتمد على التفكير والتعاون.", points: ["كلمات", "تلميحات", "فرق", "تعاون"] },
];

const faqs: FaqItem[] = [
  { question: "هل أحتاج الدفع قبل تجربة الموقع؟", answer: "لا، يمكن بدء التجربة أولًا من خلال الخطة المجانية، وبعدها اختيار الخطة المناسبة حسب استخدامك." },
  { question: "هل أستطيع شراء عدد ألعاب فقط؟", answer: "نعم، تم إضافة خيار شراء ألعاب منفردة للعبة لمتكم بسعر 1 JD لكل لعبة واحدة." },
  { question: "هل الباقات مخصصة للعبة واحدة فقط؟", answer: "لا، الباقات مخصصة للاستفادة من المنصة بشكل عام، بينما خيار شراء الألعاب المنفردة مخصص للعبة لمتكم فقط." },
  { question: "هل المنصة مناسبة للفعاليات أو الجهات؟", answer: "نعم، تصميم المنصة مناسب للجلسات، الفعاليات، والعروض الجماعية بشكل واضح ومرتب." },
];

// ─── Plan visual config ───────────────────────────────────────────────────────
const planCfg = [
  { bar: "bg-white/25", badge: "border-white/12 bg-white/6 text-white/55", price: "text-white", check: "text-white/35", btn: "border border-white/12 bg-white/6 text-white/70 hover:bg-white/10 hover:text-white", card: "border-white/8 bg-[linear-gradient(160deg,rgba(14,22,46,0.92)_0%,rgba(5,10,24,0.98)_100%)]", glow: "", icon: "🎮" },
  { bar: "bg-cyan-400",   badge: "border-cyan-400/30 bg-cyan-400/12 text-cyan-300",   price: "text-cyan-300",   check: "text-cyan-400",   btn: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_4px_24px_rgba(34,211,238,0.32)]",   card: "border-cyan-400/28 bg-[linear-gradient(160deg,rgba(6,22,56,0.98)_0%,rgba(3,10,28,0.99)_100%)]",   glow: "shadow-[0_28px_72px_rgba(34,211,238,0.13)]", icon: "⭐" },
  { bar: "bg-violet-400", badge: "border-violet-400/25 bg-violet-400/10 text-violet-300", price: "text-violet-300", check: "text-violet-400", btn: "border border-violet-400/22 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18", card: "border-violet-400/16 bg-[linear-gradient(160deg,rgba(18,10,48,0.94)_0%,rgba(5,10,24,0.98)_100%)]", glow: "shadow-[0_24px_60px_rgba(139,92,246,0.09)]", icon: "🚀" },
  { bar: "bg-emerald-400", badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", price: "text-emerald-300", check: "text-emerald-400", btn: "border border-emerald-400/22 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/18", card: "border-emerald-400/16 bg-[linear-gradient(160deg,rgba(5,24,20,0.94)_0%,rgba(5,10,24,0.98)_100%)]", glow: "shadow-[0_24px_60px_rgba(52,211,153,0.09)]", icon: "💎" },
];

const gameAcc = [
  { bar: "bg-cyan-400",   card: "border-cyan-400/14",   badge: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",     icon: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",   tag: "border-cyan-400/15 bg-cyan-400/6 text-cyan-400/80" },
  { bar: "bg-orange-400", card: "border-orange-400/14", badge: "border-orange-400/20 bg-orange-400/8 text-orange-300", icon: "border-orange-400/20 bg-orange-400/8 text-orange-300", tag: "border-orange-400/15 bg-orange-400/6 text-orange-400/80" },
  { bar: "bg-violet-400", card: "border-violet-400/14", badge: "border-violet-400/20 bg-violet-400/8 text-violet-300", icon: "border-violet-400/20 bg-violet-400/8 text-violet-300", tag: "border-violet-400/15 bg-violet-400/6 text-violet-400/80" },
];
const gameEmoji = ["🎯", "🕵️", "🔤"];

const faqNumColors = ["border-cyan-400/20 bg-cyan-400/8 text-cyan-400", "border-orange-400/20 bg-orange-400/8 text-orange-400", "border-violet-400/20 bg-violet-400/8 text-violet-400", "border-emerald-400/20 bg-emerald-400/8 text-emerald-400"];

// ─── Icons ────────────────────────────────────────────────────────────────────
function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}
function ShieldIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" /></svg>;
}
function HomeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" /></svg>;
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/50"><span className="h-1 w-1 rounded-full bg-cyan-400" />{children}</span>;
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const c = planCfg[index] ?? planCfg[0];
  const isFeatured = plan.featured ?? false;
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1.5 ${c.card} ${c.glow}`}>
      <div className={`h-[2.5px] w-full ${c.bar} ${isFeatured ? "opacity-100" : "opacity-55"}`} />
      {isFeatured && (
        <div className="absolute right-4 top-0">
          <div className="rounded-b-xl bg-cyan-400 px-3 py-1.5 text-[10px] font-black text-slate-950 shadow-[0_4px_14px_rgba(34,211,238,0.35)]">★ الأكثر طلبًا</div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl ${c.badge}`}>{c.icon}</div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black ${c.badge}`}>{plan.badge}</span>
        </div>
        <h3 className="text-xl font-black text-white">{plan.name}</h3>
        <p className="mt-2 text-sm leading-7 text-white/45">{plan.description}</p>
        <div className={`my-5 rounded-2xl border px-4 py-4 ${isFeatured ? "border-cyan-400/22 bg-cyan-400/7" : "border-white/8 bg-white/[0.035]"}`}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/28">السعر</div>
          <div className={`mt-1.5 text-[2rem] font-black leading-none tracking-tight ${c.price}`}>{plan.price}</div>
          {plan.highlight && <div className="mt-2 text-[11px] font-bold leading-5 text-white/38">{plan.highlight}</div>}
        </div>
        <div className="mb-4 h-px bg-white/6" />
        <ul className="mb-6 flex-1 space-y-2.5">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-start gap-2.5">
              <span className={`mt-0.5 shrink-0 ${c.check}`}><CheckIcon className="h-4 w-4" /></span>
              <span className="text-sm leading-7 text-white/58">{f.text}</span>
            </li>
          ))}
        </ul>
        <Link href={plan.href} className={`inline-flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-sm font-black transition duration-200 active:scale-[0.97] ${c.btn}`}>
          <span>{plan.cta}</span>
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── FaqCard ─────────────────────────────────────────────────────────────────
function FaqCard({ item, index }: { item: FaqItem; index: number }) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,46,0.88)_0%,rgba(5,10,24,0.96)_100%)] transition duration-200 hover:border-white/12">
      <div className="flex items-start gap-3.5 px-5 py-5 sm:px-6">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black ${faqNumColors[index % 4]}`}>{index + 1}</div>
        <h3 className="text-base font-black leading-7 text-white">{item.question}</h3>
      </div>
      <div className="mx-5 h-px bg-white/6 sm:mx-6" />
      <div className="flex items-start gap-3.5 px-5 py-4 sm:px-6">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/4 text-xs font-bold text-white/30">ج</div>
        <p className="text-sm leading-7 text-white/52">{item.answer}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">

      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ── */}
        <section className="relative mb-8 overflow-hidden rounded-[2.6rem] border border-white/8">
          <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(7,14,34,1)_100%)]" />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-60 w-80 rounded-full bg-violet-500/7 blur-[60px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-80 rounded-full bg-emerald-500/5 blur-[60px]" />
          <div className="pointer-events-none absolute left-6 top-6 h-2 w-2 rounded-full bg-cyan-400/40" />
          <div className="pointer-events-none absolute right-6 top-6 h-1.5 w-1.5 rounded-full bg-violet-400/35" />
          <div className="pointer-events-none absolute bottom-6 right-6 h-2 w-2 rounded-full bg-cyan-400/22" />

          <div className="relative grid gap-8 px-7 py-14 md:px-12 md:py-16 xl:grid-cols-[1fr_auto] xl:items-center xl:gap-14">
            <div>
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-xs font-bold text-white/28">
                <Link href="/" className="flex items-center gap-1.5 transition hover:text-white/55">
                  <HomeIcon />الرئيسية
                </Link>
                <span>/</span>
                <span className="text-white/45">الباقات والخطط</span>
              </div>

              {/* Live badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/22 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                الباقات والأسعار
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl xl:text-[3.4rem]">
                اختر الخطة المناسبة
                <span className="mt-2 block bg-gradient-to-l from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  لتجربة لمتكم
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/48 md:text-base">
                خطط واضحة تناسب الجميع — سواء أردت البدء مجاناً، أو الترقية للاستخدام المستمر، أو شراء ألعاب منفردة.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { label: "ابدأ مجاناً بدون بطاقة", jsx: <CheckIcon className="h-3 w-3 text-white/30" /> },
                  { label: "دفع آمن ومضمون",          jsx: <ShieldIcon /> },
                  { label: "3 ألعاب متاحة",            jsx: <span>🎮</span> },
                ].map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-3.5 py-1.5 text-xs font-bold text-white/38">
                    {p.jsx}{p.label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 active:scale-[0.98]">
                  ابدأ مجاناً <ArrowIcon />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-black text-white/65 transition hover:bg-white/8 hover:text-white">
                  <HomeIcon />الرئيسية
                </Link>
              </div>
            </div>

            {/* Logo card — desktop */}
            <div className="hidden xl:flex xl:justify-end">
              <div className="relative">
                <div className="absolute -inset-5 rounded-[2.5rem] bg-cyan-400/5 blur-2xl" />
                <div className="relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-cyan-400/14 bg-[linear-gradient(160deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,0.99)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.60)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_68%)]" />
                  <div className="absolute inset-6 rounded-[1.8rem] border border-cyan-400/8" />
                  <div className="absolute left-5 top-5 h-2 w-2 rounded-full bg-cyan-400/35" />
                  <div className="absolute right-5 top-5 h-1.5 w-1.5 rounded-full bg-violet-400/28" />
                  <div className="absolute bottom-5 right-5 h-2 w-2 rounded-full bg-emerald-400/25" />
                  <img src={heroLogo} alt="شعار لمتكم" className="relative h-[170px] w-[170px] object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.18)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Plans: 4 side by side ── */}
        <section className="mb-14">
          <div className="mb-8">
            <SectionBadge>الباقات المتاحة</SectionBadge>
            <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">خطط واضحة تناسب طريقة استخدامك</h2>
            <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/48 md:text-base">تم تنظيم الخطط لتغطي الاحتياجات الأساسية، الاستخدام المستمر، الاحترافي، أو شراء ألعاب منفردة.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} />)}
          </div>

          {/* Comparison strip */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/6 bg-white/[0.02]">
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-white/6 sm:grid-cols-4">
              {[
                { label: "مجاني",       val: "للتجربة",      color: "text-white/50"   },
                { label: "10 JD",       val: "الأشهر طلبًا", color: "text-cyan-300"   },
                { label: "20 JD",       val: "احترافي",      color: "text-violet-300" },
                { label: "1 JD / لعبة", val: "مرن",          color: "text-emerald-300"},
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-0.5 px-3 py-3 text-center">
                  <div className={`text-sm font-black ${item.color}`}>{item.label}</div>
                  <div className="text-[10px] font-bold text-white/22">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Games inside platform ── */}
        <section className="mb-14">
          <SectionBadge>ماذا تشمل المنصة؟</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">المنصة تضم أكثر من تجربة لعب</h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/48 md:text-base">الباقات تخدم استخدام المنصة ككل، مع وجود خيار مستقل أيضًا لشراء ألعاب منفردة للعبة لمتكم.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {games.map((item, i) => {
              const a = gameAcc[i] ?? gameAcc[0];
              return (
                <div key={item.title} className={`group relative overflow-hidden rounded-[1.8rem] border bg-[linear-gradient(160deg,rgba(14,22,46,0.90)_0%,rgba(5,10,24,0.97)_100%)] p-5 transition duration-300 hover:-translate-y-0.5 ${a.card}`}>
                  <div className={`absolute inset-x-0 top-0 h-[2px] ${a.bar} opacity-60`} />
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${a.icon}`}>{gameEmoji[i]}</div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${a.badge}`}>داخل المنصة</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-7 text-white/52">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.points.map((point) => (
                      <span key={point} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${a.tag}`}>{point}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-14">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionBadge>أسئلة شائعة</SectionBadge>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">كل ما يحتاجه الزائر قبل اختيار الخطة</h2>
            </div>
            <div className="shrink-0 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-2 text-xs font-bold text-white/32">{faqs.length} سؤال</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item, i) => <FaqCard key={item.question} item={item} index={i} />)}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="mb-2">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-cyan-400/16 bg-[linear-gradient(135deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,1)_100%)] px-7 py-12 md:px-12 md:py-14">
            <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[60px]" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-500/7 blur-[60px]" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />
            <div className="relative flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-right">
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/22 bg-cyan-400/8 px-3.5 py-1.5 text-xs font-bold text-cyan-300">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-400" />
                  جاهز للبدء؟
                </span>
                <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">جرّب لمتكم مجاناً الآن</h3>
                <p className="mt-2.5 max-w-md text-sm leading-7 text-white/48">ابدأ بالخطة المجانية بدون أي التزام — وعندما تكون مستعداً اختر الخطة التي تناسبك.</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.30)] transition hover:bg-cyan-400 active:scale-[0.98]">
                  إنشاء حساب مجاني <ArrowIcon />
                </Link>
                <Link href="/games" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/6 px-8 py-4 text-sm font-black text-white/70 transition hover:bg-white/10 active:scale-[0.98]">
                  تصفّح الألعاب
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer strip */}
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