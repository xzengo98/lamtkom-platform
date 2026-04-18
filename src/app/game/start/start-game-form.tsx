"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import type { CategoryAvailability } from "./page";

const heroLogo = "/logo.png";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
  sort_order?: number | null;
};

type CategorySection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type Props = {
  sections?: CategorySection[];
  categories?: Category[];
  gamesRemaining: number;
  action: (formData: FormData) => void | Promise<void>;
  categoryAvailability: Record<string, CategoryAvailability>;
  selectionMode: "fixed" | "dynamic";
  errorMessage?: string;
};

const REQUIRED_CATEGORY_COUNT = 6;

// ─── Section Themes (unchanged) ───────────────────────────────────────────────

const sectionThemes: Record<
  string,
  {
    sectionGlow: string;
    titleBar: string;
    nameBar: string;
    selectedRing: string;
    info: string;
    iconTint: string;
    iconBg: string;
  }
> = {
  general: {
    sectionGlow: "from-orange-400/10 via-orange-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#e18942_0%,#c36023_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f39a4e_0%,#df6c1d_100%)] text-white",
    selectedRing: "ring-4 ring-orange-300/80 shadow-[0_0_0_3px_rgba(253,186,116,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-orange-100",
    iconBg: "bg-[#112945]",
  },
  islamic: {
    sectionGlow: "from-emerald-400/10 via-emerald-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#2dbd8c_0%,#1c9b74_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#38c997_0%,#168765_100%)] text-white",
    selectedRing: "ring-4 ring-emerald-300/80 shadow-[0_0_0_3px_rgba(110,231,183,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-emerald-100",
    iconBg: "bg-[#112945]",
  },
  sports: {
    sectionGlow: "from-cyan-400/10 via-cyan-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#1798df_0%,#0b7fca_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#2baae8_0%,#0a79c4_100%)] text-white",
    selectedRing: "ring-4 ring-cyan-300/80 shadow-[0_0_0_3px_rgba(103,232,249,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-cyan-100",
    iconBg: "bg-[#112945]",
  },
  entertainment: {
    sectionGlow: "from-violet-400/10 via-fuchsia-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#8f67ff_0%,#6f47ec_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#9b6dff_0%,#6e3cff_100%)] text-white",
    selectedRing: "ring-4 ring-violet-300/80 shadow-[0_0_0_3px_rgba(196,181,253,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-violet-100",
    iconBg: "bg-[#112945]",
  },
  technology: {
    sectionGlow: "from-sky-400/10 via-cyan-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#2497dd_0%,#1280c9_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#32a4ea_0%,#1179bf_100%)] text-white",
    selectedRing: "ring-4 ring-cyan-300/80 shadow-[0_0_0_3px_rgba(103,232,249,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-cyan-100",
    iconBg: "bg-[#112945]",
  },
  science: {
    sectionGlow: "from-indigo-400/10 via-blue-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#5f7cff_0%,#3d5ce6_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#6f88ff_0%,#3c53cf_100%)] text-white",
    selectedRing: "ring-4 ring-indigo-300/80 shadow-[0_0_0_3px_rgba(165,180,252,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-indigo-100",
    iconBg: "bg-[#112945]",
  },
  history: {
    sectionGlow: "from-amber-400/10 via-yellow-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#d59a3c_0%,#a76b19_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#e2a84b_0%,#b8771f_100%)] text-white",
    selectedRing: "ring-4 ring-amber-300/80 shadow-[0_0_0_3px_rgba(252,211,77,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-amber-100",
    iconBg: "bg-[#112945]",
  },
  geography: {
    sectionGlow: "from-teal-400/10 via-emerald-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#1fad96_0%,#167f74_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#29baa3_0%,#166e65_100%)] text-white",
    selectedRing: "ring-4 ring-teal-300/80 shadow-[0_0_0_3px_rgba(94,234,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-teal-100",
    iconBg: "bg-[#112945]",
  },
  logos: {
    sectionGlow: "from-pink-400/10 via-rose-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ec6b9b_0%,#cf4378_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f27da9_0%,#cf3f71_100%)] text-white",
    selectedRing: "ring-4 ring-pink-300/80 shadow-[0_0_0_3px_rgba(249,168,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-pink-100",
    iconBg: "bg-[#112945]",
  },
  brands: {
    sectionGlow: "from-pink-400/10 via-rose-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ec6b9b_0%,#cf4378_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f27da9_0%,#cf3f71_100%)] text-white",
    selectedRing: "ring-4 ring-pink-300/80 shadow-[0_0_0_3px_rgba(249,168,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-pink-100",
    iconBg: "bg-[#112945]",
  },
  currencies: {
    sectionGlow: "from-lime-400/10 via-green-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#7fcb4c_0%,#499a2a_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#8ad953_0%,#428d23_100%)] text-white",
    selectedRing: "ring-4 ring-lime-300/80 shadow-[0_0_0_3px_rgba(190,242,100,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-lime-100",
    iconBg: "bg-[#112945]",
  },
  games: {
    sectionGlow: "from-rose-400/10 via-red-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ef5a6f_0%,#cf304b_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f56b7d_0%,#c52842_100%)] text-white",
    selectedRing: "ring-4 ring-rose-300/80 shadow-[0_0_0_3px_rgba(253,164,175,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-rose-100",
    iconBg: "bg-[#112945]",
  },
  girls: {
    sectionGlow: "from-pink-400/10 via-rose-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ec6b9b_0%,#cf4378_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f27da9_0%,#cf3f71_100%)] text-white",
    selectedRing: "ring-4 ring-pink-300/80 shadow-[0_0_0_3px_rgba(249,168,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-pink-100",
    iconBg: "bg-[#112945]",
  },
  jordan: {
    sectionGlow: "from-red-400/10 via-amber-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#e05353_0%,#b92f2f_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#e76363_0%,#b52a2a_100%)] text-white",
    selectedRing: "ring-4 ring-red-300/80 shadow-[0_0_0_3px_rgba(252,165,165,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-red-100",
    iconBg: "bg-[#112945]",
  },
  songs: {
    sectionGlow: "from-yellow-400/10 via-orange-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#f0b24d_0%,#db7a20_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f6bf5f_0%,#d86e19_100%)] text-white",
    selectedRing: "ring-4 ring-yellow-300/80 shadow-[0_0_0_3px_rgba(253,224,71,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-yellow-100",
    iconBg: "bg-[#112945]",
  },
  focus: {
    sectionGlow: "from-yellow-400/10 via-lime-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#d7c63f_0%,#9e8f16_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#e1cf4c_0%,#9a8b14_100%)] text-white",
    selectedRing: "ring-4 ring-yellow-200/80 shadow-[0_0_0_3px_rgba(254,240,138,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-yellow-100",
    iconBg: "bg-[#112945]",
  },
  arabic_art: {
    sectionGlow: "from-fuchsia-400/10 via-purple-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#8c58d9_0%,#6430b8_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#9967e4_0%,#5d24b4_100%)] text-white",
    selectedRing: "ring-4 ring-fuchsia-300/80 shadow-[0_0_0_3px_rgba(240,171,252,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-fuchsia-100",
    iconBg: "bg-[#112945]",
  },
  foreign_art: {
    sectionGlow: "from-indigo-400/10 via-violet-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#5f7cff_0%,#5b46d8_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#6f88ff_0%,#513dc8_100%)] text-white",
    selectedRing: "ring-4 ring-indigo-300/80 shadow-[0_0_0_3px_rgba(165,180,252,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-indigo-100",
    iconBg: "bg-[#112945]",
  },
  arts: {
    sectionGlow: "from-violet-400/10 via-blue-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#6f7cf2_0%,#3e52c7_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#7f8cff_0%,#374bbf_100%)] text-white",
    selectedRing: "ring-4 ring-violet-300/80 shadow-[0_0_0_3px_rgba(196,181,253,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-violet-100",
    iconBg: "bg-[#112945]",
  },
  default: {
    sectionGlow: "from-slate-300/10 via-slate-200/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#475e86_0%,#314968_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#546c95_0%,#304764_100%)] text-white",
    selectedRing: "ring-4 ring-white/70 shadow-[0_0_0_3px_rgba(255,255,255,0.18),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-white",
    iconBg: "bg-[#112945]",
  },
};

// ─── Logic helpers (unchanged) ─────────────────────────────────────────────────

function normalizeSectionKey(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[\s_-]+/g, "").trim();
}

function resolveSectionThemeKey(slug: string | null | undefined, name?: string | null) {
  const slugKey = normalizeSectionKey(slug);
  const nameKey = normalizeSectionKey(name);
  const combined = `${slugKey} ${nameKey}`;

  if (slugKey in sectionThemes) return slugKey as keyof typeof sectionThemes;
  if (combined.includes("general") || combined.includes("معلوماتعامة") || combined.includes("عام")) return "general";
  if (combined.includes("islamic") || combined.includes("اسلام")) return "islamic";
  if (combined.includes("sport") || combined.includes("رياض")) return "sports";
  if (combined.includes("football") || combined.includes("soccer") || combined.includes("كرةقدم")) return "sports";
  if (combined.includes("games") || combined.includes("العاب")) return "games";
  if (combined.includes("بنات") || combined.includes("girls")) return "girls";
  if (combined.includes("الاردن") || combined.includes("jordan")) return "jordan";
  if (combined.includes("اغاني") || combined.includes("songs") || combined.includes("music")) return "songs";
  if (combined.includes("ركز") || combined.includes("focus")) return "focus";
  if (combined.includes("فنانجنبي") || combined.includes("فنأجنبي") || combined.includes("foreignart") || combined.includes("foreignartist")) return "foreign_art";
  if (combined.includes("فنعربي") || combined.includes("arabart") || combined.includes("arabicart")) return "arabic_art";
  if (combined.includes("entertain") || combined.includes("movie") || combined.includes("film") || combined.includes("ترفيه") || combined.includes("افلام")) return "entertainment";
  if (combined.includes("technology") || combined.includes("تقن") || combined.includes("tech")) return "technology";
  if (combined.includes("science") || combined.includes("علوم") || combined.includes("علم")) return "science";
  if (combined.includes("history") || combined.includes("تاريخ")) return "history";
  if (combined.includes("geography") || combined.includes("جغراف") || combined.includes("مكان") || combined.includes("دول")) return "geography";
  if (combined.includes("logo") || combined.includes("brand") || combined.includes("شعار") || combined.includes("شعارات") || combined.includes("ماركات")) return "logos";
  if (combined.includes("currency") || combined.includes("عملات")) return "currencies";
  if (combined.includes("art") || combined.includes("فن") || combined.includes("رسم")) return "arts";
  return "default";
}

function getSectionTheme(slug: string | null | undefined, name?: string | null) {
  return sectionThemes[resolveSectionThemeKey(slug, name)] ?? sectionThemes.default;
}

function getAvailabilityBadge(availability: CategoryAvailability) {
  if (!availability?.isSelectable) {
    return {
      text: "غير متاح",
      className: "border-red-500/30 bg-red-500/20 text-red-200",
      exhausted: true,
    };
  }
  // Calculate available games: min of easy/medium/hard counts
  // Each game uses 1 of each. availableGames from server is pre-calculated.
  const count = availability.availableGames ?? 0;
  const gameLabel =
    count === 1 ? "لعبة واحدة" : count > 1 ? `${count} ألعاب` : "متاحة";
  return {
    text: gameLabel,
    className: "border-emerald-400/30 bg-emerald-500/18 text-emerald-200",
    exhausted: false,
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="8" width="17" height="8.5" rx="4.25" />
      <path d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01" />
    </svg>
  );
}

function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TicketIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 2-2V9Z" />
      <path d="M12 7v10" />
    </svg>
  );
}

/** قسم الإسلاميات */
function MosqueIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16" />
      <path d="M7 20v-6a5 5 0 0 1 10 0v6" />
      <path d="M12 3v4" />
      <path d="m10 7 2-2 2 2" />
      <path d="M18 8v12" />
    </svg>
  );
}

/** قسم الجغرافيا */
function GlobeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

/** قسم الترفيه / أفلام */
function FilmIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h18M3 15h18" />
    </svg>
  );
}

/** قسم الرياضة */
function TrophyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M5 6H3a2 2 0 0 0 2 4h2M19 6h2a2 2 0 0 1-2 4h-2" />
    </svg>
  );
}

/** قسم التقنية */
function CpuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
}

/** قسم العلوم — قارورة */
function FlaskIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M9 3v6l-5 8a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 20 17l-5-8V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

/** قسم التاريخ — كتاب */
function BookOpenIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10a3 3 0 0 1 2 1 3 3 0 0 1 2-1h4.5A2.5 2.5 0 0 1 21 6.5V19a1 1 0 0 1-1.4.92L14 17.5a4 4 0 0 0-4 0l-5.6 2.42A1 1 0 0 1 3 19V6.5Z" />
    </svg>
  );
}

/** قسم المعلومات العامة — كرة أرضية مع نجمة */
function StarGlobeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
    </svg>
  );
}

/** قسم الشعارات والماركات — علامة تجارية */
function TagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H7a2 2 0 0 0-2 2v5l9.29 9.29a2 2 0 0 0 2.83 0l4.58-4.58a2 2 0 0 0 0-2.83L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

/** قسم العملات — عملة معدنية */
function CoinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M9.5 18h5" />
    </svg>
  );
}

/** قسم الألعاب */
function GameIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01" />
    </svg>
  );
}

/** قسم البنات — قلب */
function HeartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

/** قسم الأردن — علم */
function FlagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z" />
      <path d="M4 22v-7" />
    </svg>
  );
}

/** قسم الأغاني — نوتة موسيقية */
function MusicIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

/** قسم التركيز — هدف/بصر */
function TargetIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

/** قسم الفن — فرشاة رسم */
function PaintbrushIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  );
}

function SparklesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
      <path d="M19 17l.7 1.8L21.5 19l-1.8.7L19 21.5l-.7-1.8L16.5 19l1.8-.2L19 17Z" />
    </svg>
  );
}

// ─── Icon mapping (improved) ───────────────────────────────────────────────────

function getSectionIcon(slug: string | null | undefined, name?: string | null) {
  const key = resolveSectionThemeKey(slug, name);

  const iconMap: Record<string, ReactNode> = {
    islamic: <MosqueIcon className="h-5 w-5" />,
    sports: <TrophyIcon className="h-5 w-5" />,
    entertainment: <FilmIcon className="h-5 w-5" />,
    general: <StarGlobeIcon className="h-5 w-5" />,
    technology: <CpuIcon className="h-5 w-5" />,
    science: <FlaskIcon className="h-5 w-5" />,
    history: <BookOpenIcon className="h-5 w-5" />,
    geography: <GlobeIcon className="h-5 w-5" />,
    logos: <TagIcon className="h-5 w-5" />,
    brands: <TagIcon className="h-5 w-5" />,
    currencies: <CoinIcon className="h-5 w-5" />,
    games: <GameIcon className="h-5 w-5" />,
    girls: <HeartIcon className="h-5 w-5" />,
    jordan: <FlagIcon className="h-5 w-5" />,
    songs: <MusicIcon className="h-5 w-5" />,
    focus: <TargetIcon className="h-5 w-5" />,
    arabic_art: <PaintbrushIcon className="h-5 w-5" />,
    foreign_art: <PaintbrushIcon className="h-5 w-5" />,
    arts: <PaintbrushIcon className="h-5 w-5" />,
  };

  return iconMap[key] ?? <BookOpenIcon className="h-5 w-5" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────


export default function StartGameForm({
  sections = [],
  categories = [],
  gamesRemaining,
  action,
  categoryAvailability,
  selectionMode,
  errorMessage = "",
}: Props) {
  const [gameName, setGameName] = useState("");
  const [teamOne, setTeamOne] = useState("");
  const [teamTwo, setTeamTwo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [localError, setLocalError] = useState("");
  const [tooltipCategoryId, setTooltipCategoryId] = useState<string | null>(null);

  const safeSections = Array.isArray(sections) ? sections : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const groupedSections = useMemo(() => {
    return safeSections
      .map((section) => ({
        ...section,
        categories: safeCategories.filter((c) => c.section_id === section.id),
      }))
      .filter((section) => section.categories.length > 0);
  }, [safeSections, safeCategories]);

  const uncategorized = useMemo(() => {
    return safeCategories.filter((c) => !c.section_id);
  }, [safeCategories]);

  const categoryById = useMemo(() => {
    return new Map(safeCategories.map((category) => [category.id, category]));
  }, [safeCategories]);

  const selectedCategorySet = useMemo(() => {
    return new Set(selectedCategories);
  }, [selectedCategories]);

  const selectedCategoryItems = useMemo(() => {
    return selectedCategories
      .map((id) => categoryById.get(id))
      .filter(Boolean) as Category[];
  }, [selectedCategories, categoryById]);

  const selectedCount = selectedCategories.length;
  const remainingSlots = Math.max(REQUIRED_CATEGORY_COUNT - selectedCount, 0);
  const isReadyToSubmit = selectedCount === REQUIRED_CATEGORY_COUNT;

  function toggleCategory(id: string) {
    const availability = categoryAvailability[id];

    if (!availability?.isSelectable) {
      setLocalError(
        "هذه الفئة غير متاحة حاليًا ولا تحتوي على عدد كافٍ من الأسئلة لبدء لعبة جديدة."
      );
      return;
    }

    setSelectedCategories((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        setLocalError("");
        return prev.filter((item) => item !== id);
      }

      if (prev.length >= REQUIRED_CATEGORY_COUNT) {
        setLocalError(`يمكنك اختيار ${REQUIRED_CATEGORY_COUNT} فئات فقط.`);
        return prev;
      }

      setLocalError("");
      return [...prev, id];
    });
  }

  function handleInfoToggle(
    event: ReactMouseEvent<HTMLButtonElement>,
    categoryId: string
  ) {
    event.preventDefault();
    event.stopPropagation();
    setTooltipCategoryId((prev) => (prev === categoryId ? null : categoryId));
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>, categoryId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCategory(categoryId);
      setTooltipCategoryId(null);
    }
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const cleanGameName = gameName.trim();
    const cleanTeamOne = teamOne.trim();
    const cleanTeamTwo = teamTwo.trim();

    if (!cleanGameName || !cleanTeamOne || !cleanTeamTwo) {
      event.preventDefault();
      setLocalError("اسم اللعبة واسم الفريق الأول واسم الفريق الثاني مطلوبة.");
      return;
    }

    if (selectedCategories.length !== REQUIRED_CATEGORY_COUNT) {
      event.preventDefault();
      setLocalError(`يجب اختيار ${REQUIRED_CATEGORY_COUNT} فئات بالضبط.`);
      return;
    }

    const invalidSelection = selectedCategories.find(
      (id) => !categoryAvailability[id]?.isSelectable
    );

    if (invalidSelection) {
      event.preventDefault();
      setLocalError("هناك فئة مختارة لم تعد متاحة، حدّث الاختيار ثم حاول مجددًا.");
      return;
    }

    if (gamesRemaining <= 0) {
      event.preventDefault();
      setLocalError("لا توجد ألعاب متبقية في حسابك.");
      return;
    }

    setLocalError("");
  }

  const visibleError = localError || errorMessage;
  const progressPct = Math.round((selectedCount / REQUIRED_CATEGORY_COUNT) * 100);

  const renderCategoryCard = (
    category: Category,
    theme: ReturnType<typeof getSectionTheme>
  ) => {
    const availability = categoryAvailability[category.id] ?? {
      availableGames: 0,
      isSelectable: false,
      mode: selectionMode,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
    };

    const active = selectedCategorySet.has(category.id);
    const badge = getAvailabilityBadge(availability);
    const isTooltipOpen = tooltipCategoryId === category.id;

    return (
      <div key={category.id} className="relative mx-auto w-full max-w-[210px]">
        {isTooltipOpen && (
          <div className="absolute -top-3 left-1/2 z-50 w-56 -translate-x-1/2 -translate-y-full rounded-2xl border border-white/12 bg-[rgba(8,14,32,0.97)] px-4 py-3 text-center text-sm leading-6 text-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div className="mb-1 text-xs font-black text-cyan-300">{category.name}</div>
            {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
            <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[rgba(8,14,32,0.97)]" />
          </div>
        )}

        <div
          role="button"
          tabIndex={availability.isSelectable ? 0 : -1}
          aria-disabled={!availability.isSelectable}
          onClick={() => {
            if (availability.isSelectable) {
              toggleCategory(category.id);
              setTooltipCategoryId(null);
            }
          }}
          onKeyDown={(event) => {
            if (!availability.isSelectable) return;
            handleCardKeyDown(event, category.id);
          }}
          className={[
            "group relative overflow-hidden rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.03)_100%)] shadow-[0_14px_32px_rgba(0,0,0,0.22)] transition duration-200",
            !availability.isSelectable
              ? "cursor-not-allowed border-white/6 opacity-70"
              : active
              ? "scale-[1.015] border-yellow-300 shadow-[0_0_0_3px_rgba(253,224,71,0.45),0_18px_34px_rgba(0,0,0,0.30)]"
              : "cursor-pointer border-white/10 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_36px_rgba(0,0,0,0.26)]",
          ].join(" ")}
        >
          <div className="relative overflow-hidden rounded-t-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(228,236,248,0.96)_100%)]">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-4xl">✨</div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_55%)]" />

            <button
              type="button"
              onClick={(event) => handleInfoToggle(event, category.id)}
              className="absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-[#203352] bg-[#24a7df] text-lg font-black text-white shadow-[0_6px_16px_rgba(0,0,0,0.22)] transition hover:brightness-110"
              aria-label={`عرض وصف ${category.name}`}
            >
              !
            </button>

            <div className={`absolute right-3 top-3 z-20 rounded-[1rem] px-4 py-2 text-sm font-black shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${theme.titleBar}`}>
              {badge.text}
            </div>

            {active && (
              <div className="absolute inset-0 rounded-t-[2rem] border-[3px] border-yellow-300/90" />
            )}

            {!availability.isSelectable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                <span className="rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs font-black text-red-200">
                  غير متاح
                </span>
              </div>
            )}
          </div>

          <div className={`relative px-3 pb-4 pt-3 text-center ${theme.nameBar}`}>
            <div className="text-[1.05rem] font-black leading-6 text-white">{category.name}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionBlock = (
    title: string,
    categoriesList: Category[],
    themeKeySlug?: string | null,
    themeName?: string | null,
    countLabel?: string
  ) => {
    const sectionTheme = getSectionTheme(themeKeySlug, themeName ?? title);

    return (
      <section className="space-y-5" key={title}>
        <div className="flex justify-center">
          <div className={`min-w-[240px] rounded-[1.4rem] px-7 py-3 text-center text-lg font-black shadow-[0_14px_28px_rgba(0,0,0,0.18)] ${sectionTheme.titleBar}`}>
            {title}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className={`rounded-[1.1rem] px-4 py-2 text-center text-xs font-black shadow-[0_10px_22px_rgba(0,0,0,0.16)] ${sectionTheme.titleBar}`}>
            {countLabel ?? `${categoriesList.length} فئة`}
          </div>
          <div className={`rounded-[1.1rem] px-4 py-2 text-center text-xs font-black shadow-[0_10px_22px_rgba(0,0,0,0.16)] ${sectionTheme.titleBar}`}>
            اختر الفئات المناسبة للجولة
          </div>
        </div>

        <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
          {categoriesList.map((category) => renderCategoryCard(category, sectionTheme))}
        </div>
      </section>
    );
  };

  return (
    <form
      action={action}
      onSubmit={validateBeforeSubmit}
      className="mx-auto max-w-[1360px] space-y-6 pt-4 pb-52 sm:pt-6 md:pb-56"
    >
      <input
        type="hidden"
        name="selectedCategories"
        value={selectedCategories.join(",")}
      />

      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-56 rounded-full bg-violet-500/8 blur-2xl" />

        <div className="relative grid gap-6 px-5 py-8 md:px-8 md:py-10 xl:grid-cols-[1.1fr_auto] xl:items-center xl:gap-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              إعداد اللعبة
            </div>

            <h1 className="text-2xl font-black leading-tight text-white md:text-4xl xl:text-5xl">
              جهّز الجولة
              <span className="mt-1 block bg-gradient-to-l from-cyan-400 via-violet-400 to-orange-400 bg-clip-text text-transparent">
                قبل البدء
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55 md:text-base">
              اختر اسم اللعبة وأسماء الفرق، ثم حدّد {REQUIRED_CATEGORY_COUNT} فئات تناسب جلستكم.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-300 ${
                  isReadyToSubmit
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                <GridIcon className="h-4 w-4 shrink-0" />
                <span>
                  {selectedCount} / {REQUIRED_CATEGORY_COUNT} فئات
                </span>
                {isReadyToSubmit && <span className="text-emerald-400">✓</span>}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70">
                <TicketIcon className="h-4 w-4 shrink-0" />
                <span>ألعاب متبقية: {gamesRemaining}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-sm font-bold text-cyan-300">
                <SparklesIcon className="h-4 w-4 shrink-0" />
                <span>
                  {selectionMode === "dynamic"
                    ? "لا تتكرر الأسئلة السابقة"
                    : "الحساب المجاني قد تتكرر الأسئلة"}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex xl:justify-end">
            <div className="relative flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(14,24,50,0.96)_0%,rgba(7,13,30,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.40)]">
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.07),transparent_70%)]" />
              <img
                src={heroLogo}
                alt="شعار لمتكم"
                className="h-[155px] w-[155px] object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(160deg,rgba(8,18,40,0.97)_0%,rgba(4,11,28,0.99)_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/8 to-transparent" />
  <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
  <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
  <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

  <div className="relative grid gap-8 px-5 py-8 md:px-8 md:py-10 xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] xl:items-center xl:gap-12">
    <div className="order-2 xl:order-1">
      <div className="mx-auto flex w-full max-w-[250px] items-center justify-center xl:mx-0">
        <div className="relative flex h-[210px] w-[210px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(12,24,50,0.98)_0%,rgba(7,13,30,0.99)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.40)] sm:h-[230px] sm:w-[230px]">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_68%)]" />
          <img
            src={heroLogo}
            alt="شعار لمتكم"
            className="h-[120px] w-[120px] object-contain drop-shadow-[0_0_22px_rgba(34,211,238,0.15)] sm:h-[138px] sm:w-[138px]"
            decoding="async"
          />
        </div>
      </div>
    </div>

    <div className="order-1 text-right xl:order-2">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
        </span>
        إعداد اللعبة
      </div>

      <h1 className="text-3xl font-black leading-[1.08] text-white sm:text-4xl xl:text-6xl">
        جهّز الجولة
        <span className="mt-2 block bg-gradient-to-l from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
          قبل البدء
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-8 text-white/58 md:text-base md:leading-9">
        اختر اسم اللعبة وأسماء الفرق، ثم حدّد {REQUIRED_CATEGORY_COUNT} فئات
        تناسب جلستكم لتبدأ الجولة بنفس هوية المنصة بشكل أوضح وأرتب.
      </p>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-300 ${
            isReadyToSubmit
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/5 text-white/70"
          }`}
        >
          <GridIcon className="h-4 w-4 shrink-0" />
          <span>
            {selectedCount} / {REQUIRED_CATEGORY_COUNT} فئات
          </span>
          {isReadyToSubmit && <span className="text-emerald-400">✓</span>}
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70">
          <TicketIcon className="h-4 w-4 shrink-0" />
          <span>ألعاب متبقية: {gamesRemaining}</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-sm font-bold text-cyan-300">
          <SparklesIcon className="h-4 w-4 shrink-0" />
          <span>
            {selectionMode === "dynamic"
              ? "لا تتكرر الأسئلة السابقة"
              : "الحساب المجاني قد تتكرر الأسئلة"}
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

      <section className="space-y-10">
        {groupedSections.map((section) =>
          renderSectionBlock(
            section.name,
            section.categories,
            section.slug,
            section.name,
            `${section.categories.length} فئة`
          )
        )}

        {uncategorized.length > 0
          ? renderSectionBlock(
              "فئات بدون قسم",
              uncategorized,
              "default",
              "فئات بدون قسم",
              `${uncategorized.length} فئة`
            )
          : null}
      </section>

      {tooltipCategoryId && (
        <div className="fixed inset-0 z-40" onClick={() => setTooltipCategoryId(null)} />
      )}

      {selectedCount > 0 && (
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-[760px] rounded-[2rem] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(10,28,54,0.97)_0%,rgba(5,16,34,0.98)_100%)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-cyan-300/80">
                {selectedCount} / {REQUIRED_CATEGORY_COUNT}
              </div>
              <div className="mt-1 text-lg font-black text-white">
                الفئات المختارة
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/55">
              اختر {remainingSlots > 0 ? `${remainingSlots} فئات إضافية` : "جاهز للبدء"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {selectedCategoryItems.map((category) => {
              const section = safeSections.find((item) => item.id === category.section_id) ?? null;
              const theme = getSectionTheme(section?.slug ?? category.slug, section?.name ?? category.name);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/5 text-right transition hover:border-white/20"
                >
                  <div className="h-20 overflow-hidden bg-[rgba(255,255,255,0.88)]">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">✨</div>
                    )}
                  </div>
                  <div className={`px-2 py-2 text-center text-[11px] font-black ${theme.nameBar}`}>
                    {category.name}
                  </div>
                </button>
              );
            })}

            {Array.from({ length: remainingSlots }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="flex h-[112px] items-center justify-center rounded-[1.1rem] border border-dashed border-cyan-400/20 bg-[#081a35] text-center text-xs font-bold text-white/28"
              >
                اختر فئة
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={!isReadyToSubmit || gamesRemaining <= 0}
            className="mt-4 inline-flex w-full items-center justify-center rounded-[1.3rem] bg-cyan-500 px-5 py-4 text-base font-black text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.20)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ابدأ اللعب
          </button>
        </div>
      </div>
      )}
    </form>
  );
}
