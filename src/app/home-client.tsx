"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────
   Scroll-reveal wrapper
   ───────────────────────────────────────────── */
export function AnimateOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: `opacity 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Count-up hook
   ───────────────────────────────────────────── */
function useCountUp(end: number, duration = 1600, started = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setCount(Math.round(eased * end));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [started, end, duration]);

  return count;
}

/* ─────────────────────────────────────────────
   Stats Bar – animated count-up
   ───────────────────────────────────────────── */
const STATS = [
  { value: 500,   suffix: "+",  label: "عضو مسجّل",    color: "text-cyan-300"   },
  { value: 3,     suffix: "",   label: "ألعاب متاحة",  color: "text-violet-300" },
  { value: 10000, suffix: "+",  label: "جولة لُعبت",   color: "text-orange-300" },
  { value: 100,   suffix: "%",  label: "مجاني تماماً", color: "text-emerald-300"},
] as const;

function StatItem({
  value,
  suffix,
  label,
  color,
  visible,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  color: string;
  visible: boolean;
  index: number;
}) {
  const count = useCountUp(value, 1800, visible);
  const display = value >= 1000
    ? count >= 1000 ? `${Math.floor(count / 1000)}K` : `${count}`
    : `${count}`;

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-6 text-center backdrop-blur-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.65s ease ${index * 120}ms, transform 0.65s ease ${index * 120}ms`,
      }}
    >
      <span className={`text-4xl font-black sm:text-5xl ${color}`}>
        {display}{suffix}
      </span>
      <span className="text-xs font-bold tracking-wide text-white/40">{label}</span>
    </div>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STATS.map((s, i) => (
        <StatItem key={s.label} {...s} visible={visible} index={i} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated background orbs (client-only to avoid SSR mismatch)
   ───────────────────────────────────────────── */
export function AnimatedOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-48 top-1/4 h-[560px] w-[560px] rounded-full bg-cyan-500/[0.05] blur-[90px]"
        style={{ animation: "lamtkom-orb-1 20s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-48 top-2/5 h-[480px] w-[480px] rounded-full bg-violet-500/[0.05] blur-[90px]"
        style={{ animation: "lamtkom-orb-2 26s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-500/[0.04] blur-[90px]"
        style={{ animation: "lamtkom-orb-3 32s ease-in-out infinite" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Features strip items (client for hover effects)
   ───────────────────────────────────────────── */
export { };
