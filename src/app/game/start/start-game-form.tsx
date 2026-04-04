"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { CategoryAvailability } from "./page";

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

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
    selectedRing:
      "ring-4 ring-orange-300/80 shadow-[0_0_0_3px_rgba(253,186,116,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-orange-100",
    iconBg: "bg-[#112945]",
  },
  islamic: {
    sectionGlow: "from-emerald-400/10 via-emerald-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#2dbd8c_0%,#1c9b74_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#38c997_0%,#168765_100%)] text-white",
    selectedRing:
      "ring-4 ring-emerald-300/80 shadow-[0_0_0_3px_rgba(110,231,183,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-emerald-100",
    iconBg: "bg-[#112945]",
  },
  sports: {
    sectionGlow: "from-cyan-400/10 via-cyan-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#1798df_0%,#0b7fca_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#2baae8_0%,#0a79c4_100%)] text-white",
    selectedRing:
      "ring-4 ring-cyan-300/80 shadow-[0_0_0_3px_rgba(103,232,249,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-cyan-100",
    iconBg: "bg-[#112945]",
  },
  entertainment: {
    sectionGlow: "from-violet-400/10 via-fuchsia-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#8f67ff_0%,#6f47ec_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#9b6dff_0%,#6e3cff_100%)] text-white",
    selectedRing:
      "ring-4 ring-violet-300/80 shadow-[0_0_0_3px_rgba(196,181,253,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-violet-100",
    iconBg: "bg-[#112945]",
  },
  technology: {
    sectionGlow: "from-sky-400/10 via-cyan-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#2497dd_0%,#1280c9_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#32a4ea_0%,#1179bf_100%)] text-white",
    selectedRing:
      "ring-4 ring-cyan-300/80 shadow-[0_0_0_3px_rgba(103,232,249,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-cyan-100",
    iconBg: "bg-[#112945]",
  },
  science: {
    sectionGlow: "from-indigo-400/10 via-blue-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#5f7cff_0%,#3d5ce6_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#6f88ff_0%,#3c53cf_100%)] text-white",
    selectedRing:
      "ring-4 ring-indigo-300/80 shadow-[0_0_0_3px_rgba(165,180,252,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-indigo-100",
    iconBg: "bg-[#112945]",
  },
  history: {
    sectionGlow: "from-amber-400/10 via-yellow-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#d59a3c_0%,#a76b19_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#e2a84b_0%,#b8771f_100%)] text-white",
    selectedRing:
      "ring-4 ring-amber-300/80 shadow-[0_0_0_3px_rgba(252,211,77,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-amber-100",
    iconBg: "bg-[#112945]",
  },
  geography: {
    sectionGlow: "from-teal-400/10 via-emerald-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#1fad96_0%,#167f74_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#29baa3_0%,#166e65_100%)] text-white",
    selectedRing:
      "ring-4 ring-teal-300/80 shadow-[0_0_0_3px_rgba(94,234,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-teal-100",
    iconBg: "bg-[#112945]",
  },
  logos: {
    sectionGlow: "from-pink-400/10 via-rose-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ec6b9b_0%,#cf4378_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f27da9_0%,#cf3f71_100%)] text-white",
    selectedRing:
      "ring-4 ring-pink-300/80 shadow-[0_0_0_3px_rgba(249,168,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-pink-100",
    iconBg: "bg-[#112945]",
  },
  brands: {
    sectionGlow: "from-pink-400/10 via-rose-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ec6b9b_0%,#cf4378_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f27da9_0%,#cf3f71_100%)] text-white",
    selectedRing:
      "ring-4 ring-pink-300/80 shadow-[0_0_0_3px_rgba(249,168,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-pink-100",
    iconBg: "bg-[#112945]",
  },
  currencies: {
    sectionGlow: "from-lime-400/10 via-green-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#7fcb4c_0%,#499a2a_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#8ad953_0%,#428d23_100%)] text-white",
    selectedRing:
      "ring-4 ring-lime-300/80 shadow-[0_0_0_3px_rgba(190,242,100,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-lime-100",
    iconBg: "bg-[#112945]",
  },
  games: {
    sectionGlow: "from-rose-400/10 via-red-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ef5a6f_0%,#cf304b_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f56b7d_0%,#c52842_100%)] text-white",
    selectedRing:
      "ring-4 ring-rose-300/80 shadow-[0_0_0_3px_rgba(253,164,175,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-rose-100",
    iconBg: "bg-[#112945]",
  },
  girls: {
    sectionGlow: "from-pink-400/10 via-rose-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#ec6b9b_0%,#cf4378_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f27da9_0%,#cf3f71_100%)] text-white",
    selectedRing:
      "ring-4 ring-pink-300/80 shadow-[0_0_0_3px_rgba(249,168,212,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-pink-100",
    iconBg: "bg-[#112945]",
  },
  jordan: {
    sectionGlow: "from-red-400/10 via-amber-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#e05353_0%,#b92f2f_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#e76363_0%,#b52a2a_100%)] text-white",
    selectedRing:
      "ring-4 ring-red-300/80 shadow-[0_0_0_3px_rgba(252,165,165,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-red-100",
    iconBg: "bg-[#112945]",
  },
  songs: {
    sectionGlow: "from-yellow-400/10 via-orange-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#f0b24d_0%,#db7a20_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#f6bf5f_0%,#d86e19_100%)] text-white",
    selectedRing:
      "ring-4 ring-yellow-300/80 shadow-[0_0_0_3px_rgba(253,224,71,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-yellow-100",
    iconBg: "bg-[#112945]",
  },
  focus: {
    sectionGlow: "from-yellow-400/10 via-lime-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#d7c63f_0%,#9e8f16_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#e1cf4c_0%,#9a8b14_100%)] text-white",
    selectedRing:
      "ring-4 ring-yellow-200/80 shadow-[0_0_0_3px_rgba(254,240,138,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-yellow-100",
    iconBg: "bg-[#112945]",
  },
  arabic_art: {
    sectionGlow: "from-fuchsia-400/10 via-purple-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#8c58d9_0%,#6430b8_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#9967e4_0%,#5d24b4_100%)] text-white",
    selectedRing:
      "ring-4 ring-fuchsia-300/80 shadow-[0_0_0_3px_rgba(240,171,252,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-fuchsia-100",
    iconBg: "bg-[#112945]",
  },
  foreign_art: {
    sectionGlow: "from-indigo-400/10 via-violet-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#5f7cff_0%,#5b46d8_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#6f88ff_0%,#513dc8_100%)] text-white",
    selectedRing:
      "ring-4 ring-indigo-300/80 shadow-[0_0_0_3px_rgba(165,180,252,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-indigo-100",
    iconBg: "bg-[#112945]",
  },
  arts: {
    sectionGlow: "from-violet-400/10 via-blue-300/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#6f7cf2_0%,#3e52c7_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#7f8cff_0%,#374bbf_100%)] text-white",
    selectedRing:
      "ring-4 ring-violet-300/80 shadow-[0_0_0_3px_rgba(196,181,253,0.28),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-violet-100",
    iconBg: "bg-[#112945]",
  },
  default: {
    sectionGlow: "from-slate-300/10 via-slate-200/5 to-transparent",
    titleBar: "bg-[linear-gradient(180deg,#475e86_0%,#314968_100%)] text-white",
    nameBar: "bg-[linear-gradient(180deg,#546c95_0%,#304764_100%)] text-white",
    selectedRing:
      "ring-4 ring-white/70 shadow-[0_0_0_3px_rgba(255,255,255,0.18),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-white",
    iconBg: "bg-[#112945]",
  },
};

function normalizeSectionKey(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .trim();
}

function resolveSectionThemeKey(slug: string | null | undefined, name?: string | null) {
  const slugKey = normalizeSectionKey(slug);
  const nameKey = normalizeSectionKey(name);
  const combined = `${slugKey} ${nameKey}`;

  if (slugKey in sectionThemes) return slugKey as keyof typeof sectionThemes;

  if (
    combined.includes("general") ||
    combined.includes("معلوماتعامة") ||
    combined.includes("عام")
  ) {
    return "general";
  }

  if (combined.includes("islamic") || combined.includes("اسلام")) {
    return "islamic";
  }

  if (combined.includes("sport") || combined.includes("رياض")) {
    return "sports";
  }

  if (combined.includes("games") || combined.includes("العاب")) {
    return "games";
  }

  if (combined.includes("بنات") || combined.includes("girls")) {
    return "girls";
  }

  if (combined.includes("الاردن") || combined.includes("jordan")) {
    return "jordan";
  }

  if (combined.includes("اغاني") || combined.includes("songs") || combined.includes("music")) {
    return "songs";
  }

  if (combined.includes("ركز") || combined.includes("focus")) {
    return "focus";
  }

  if (
    (combined.includes("فنانجنبي") || combined.includes("فنأجنبي") || combined.includes("foreignart") || combined.includes("foreignartist"))
  ) {
    return "foreign_art";
  }

  if (
    (combined.includes("فنعربي") || combined.includes("arabart") || combined.includes("arabicart"))
  ) {
    return "arabic_art";
  }

  if (
    combined.includes("entertain") ||
    combined.includes("movie") ||
    combined.includes("film") ||
    combined.includes("ترفيه") ||
    combined.includes("افلام")
  ) {
    return "entertainment";
  }

  if (combined.includes("technology") || combined.includes("تقن") || combined.includes("tech")) {
    return "technology";
  }

  if (combined.includes("science") || combined.includes("علوم") || combined.includes("علم")) {
    return "science";
  }

  if (combined.includes("history") || combined.includes("تاريخ")) {
    return "history";
  }

  if (
    combined.includes("geography") ||
    combined.includes("جغراف") ||
    combined.includes("مكان") ||
    combined.includes("دول")
  ) {
    return "geography";
  }

  if (
    combined.includes("logo") ||
    combined.includes("brand") ||
    combined.includes("شعار") ||
    combined.includes("شعارات") ||
    combined.includes("ماركات")
  ) {
    return "logos";
  }

  if (combined.includes("currency") || combined.includes("عملات")) {
    return "currencies";
  }

  if (combined.includes("art") || combined.includes("فن") || combined.includes("رسم")) {
    return "arts";
  }

  return "default";
}

function getSectionTheme(slug: string | null | undefined, name?: string | null) {
  return sectionThemes[resolveSectionThemeKey(slug, name)] ?? sectionThemes.default;
}

function getAvailabilityBadge(availability: CategoryAvailability) {
  if (!availability?.isSelectable) {
    return {
      text: "غير متاحة",
      className: "border-red-500/30 bg-[#34161b] text-red-200",
    };
  }

  return {
    text: "متاحة",
    className: "border-emerald-400/30 bg-[#0f2e2a] text-emerald-200",
  };
}

function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="8" width="17" height="8.5" rx="4.25" />
      <path d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01" />
    </svg>
  );
}

function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TicketIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 2-2V9Z" />
      <path d="M12 7v10" />
    </svg>
  );
}

function MosqueIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16" />
      <path d="M7 20v-6a5 5 0 0 1 10 0v6" />
      <path d="M12 3v4" />
      <path d="m10 7 2-2 2 2" />
      <path d="M18 8v12" />
    </svg>
  );
}

function GlobeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function FilmIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h18M3 15h18" />
    </svg>
  );
}

function TrophyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M5 6H3a2 2 0 0 0 2 4h2" />
      <path d="M19 6h2a2 2 0 0 1-2 4h-2" />
    </svg>
  );
}

function CpuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
}

function SparklesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
      <path d="M19 17l.7 1.8L21.5 19l-1.8.7L19 21.5l-.7-1.8L16.5 19l1.8-.2L19 17Z" />
    </svg>
  );
}

function BookOpenIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10a3 3 0 0 1 2 1 3 3 0 0 1 2-1h4.5A2.5 2.5 0 0 1 21 6.5V19a1 1 0 0 1-1.4.92L14 17.5a4 4 0 0 0-4 0l-5.6 2.42A1 1 0 0 1 3 19V6.5Z" />
    </svg>
  );
}

function getSectionIcon(slug: string | null | undefined, name?: string | null) {
  const key = resolveSectionThemeKey(slug, name);

  if (key === "islamic") return <MosqueIcon className="h-5 w-5" />;
  if (key === "sports") return <TrophyIcon className="h-5 w-5" />;
  if (key === "entertainment") return <FilmIcon className="h-5 w-5" />;
  if (key === "general") return <GlobeIcon className="h-5 w-5" />;
  if (key === "technology") return <CpuIcon className="h-5 w-5" />;
  if (key === "science") return <SparklesIcon className="h-5 w-5" />;
  if (key === "history") return <BookOpenIcon className="h-5 w-5" />;
  if (key === "geography") return <GlobeIcon className="h-5 w-5" />;
  if (key === "logos") return <GridIcon className="h-5 w-5" />;
  if (key === "currencies") return <TicketIcon className="h-5 w-5" />;
  if (key === "games") return <GamepadIcon className="h-5 w-5" />;
  if (key === "girls") return <SparklesIcon className="h-5 w-5" />;
  if (key === "jordan") return <GlobeIcon className="h-5 w-5" />;
  if (key === "songs") return <FilmIcon className="h-5 w-5" />;
  if (key === "focus") return <SparklesIcon className="h-5 w-5" />;
  if (key === "arabic_art") return <BookOpenIcon className="h-5 w-5" />;
  if (key === "foreign_art") return <FilmIcon className="h-5 w-5" />;
  if (key === "arts") return <SparklesIcon className="h-5 w-5" />;
  return <BookOpenIcon className="h-5 w-5" />;
}

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
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  const safeSections = Array.isArray(sections) ? sections : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const groupedSections = useMemo(() => {
    return safeSections
      .map((section) => ({
        ...section,
        categories: safeCategories.filter(
          (category) => category.section_id === section.id,
        ),
      }))
      .filter((section) => section.categories.length > 0);
  }, [safeSections, safeCategories]);

  const uncategorized = useMemo(() => {
    return safeCategories.filter((category) => !category.section_id);
  }, [safeCategories]);

  const selectedCount = selectedCategories.length;
  const isReadyToSubmit = selectedCount === REQUIRED_CATEGORY_COUNT;

  function toggleCategory(id: string) {
    const availability = categoryAvailability[id];

    if (!availability?.isSelectable) {
      setLocalError(
        "هذه الفئة غير متاحة حاليًا ولا تحتوي على عدد كافٍ من الأسئلة لبدء لعبة جديدة.",
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

  function handleInfoClick(event: ReactMouseEvent, categoryId: string) {
    event.preventDefault();
    event.stopPropagation();
    setOpenInfoId((prev) => (prev === categoryId ? null : categoryId));
  }

  function validateBeforeSubmit(event: FormEvent) {
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
      (id) => !categoryAvailability[id]?.isSelectable,
    );

    if (invalidSelection) {
      event.preventDefault();
      setLocalError(
        "هناك فئة مختارة لم تعد متاحة، حدّث الاختيار ثم حاول مجددًا.",
      );
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

  return (
    <form
      action={action}
      onSubmit={validateBeforeSubmit}
      className="mx-auto max-w-[1360px] space-y-8"
    >
      <input
        type="hidden"
        name="selectedCategories"
        value={selectedCategories.join(",")}
      />

      {/* Premium Hero */}
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-7 xl:p-8">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />

        <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              <GamepadIcon className="h-4 w-4" />
              <span>إعداد اللعبة</span>
            </div>

            <h1 className="text-3xl font-black text-white md:text-5xl">
              جهّز الجولة
              <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
                قبل البدء
              </span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
              اختر اسم اللعبة وأسماء الفرق ثم حدّد 6 فئات مناسبة للجلسة. 
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white">
                <GridIcon className="h-4 w-4" />
                <span>
                  المختار {selectedCount} / {REQUIRED_CATEGORY_COUNT}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white">
                <TicketIcon className="h-4 w-4" />
                <span>الألعاب المتبقية {gamesRemaining}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100">
                <SparklesIcon className="h-4 w-4" />
                <span>
                  {selectionMode === "dynamic"
                    ? "هذا الحساب لا يعيد الأسئلة السابقة"
                    : "الحساب المجاني قد تتكرر له الأسئلة"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center xl:justify-end">
            <div className="relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,26,55,0.96)_0%,rgba(8,16,36,0.96)_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:h-[300px] md:w-[300px]">
              <div className="absolute inset-0 rounded-[inherit] border border-white/5" />
              <img
                src={heroLogo}
                alt="شعار لمتكم"
                className="h-[150px] w-[150px] object-contain md:h-[210px] md:w-[210px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Setup Card */}
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              بيانات الجولة
            </div>
            <h2 className="text-2xl font-black text-white">إعدادات اللعبة الأساسية :</h2>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 md:block">
            ابدأ بعد اكتمال اختيار 6 فئات
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              اسم اللعبة
            </label>
            <input
              name="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="مثال: تحدي الأذكياء"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              الفريق الأول
            </label>
            <input
              name="teamOne"
              value={teamOne}
              onChange={(e) => setTeamOne(e.target.value)}
              placeholder="اسم الفريق الأول"
              className="w-full rounded-2xl border border-cyan-300/10 bg-[#0b1733] px-4 py-4 text-white outline-none transition focus:border-cyan-300/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              الفريق الثاني
            </label>
            <input
              name="teamTwo"
              value={teamTwo}
              onChange={(e) => setTeamTwo(e.target.value)}
              placeholder="اسم الفريق الثاني"
              className="w-full rounded-2xl border border-orange-300/10 bg-[#24150d] px-4 py-4 text-white outline-none transition focus:border-orange-300/50"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!isReadyToSubmit || gamesRemaining <= 0}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ابدأ اللعبة
            </button>
          </div>
        </div>

        {visibleError ? (
          <div className="mt-4 rounded-[1.2rem] border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100">
            {visibleError}
          </div>
        ) : null}
      </section>

      {/* Categories */}
      <section className="space-y-6">
        {groupedSections.map((section) => {
          const theme = getSectionTheme(section.slug, section.name);

          return (
            <div
              key={section.id}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]"
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${theme.sectionGlow}`}
              />

              <div className="relative mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconTint}`}
                  >
                    {getSectionIcon(section.slug, section.name)}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {section.name}
                    </h3>
                    <div className="mt-1 text-sm font-bold text-white/50">
                      {section.categories.length} فئة
                    </div>
                  </div>
                </div>

                <div
                  className={`hidden rounded-full px-4 py-2 text-xs font-black md:inline-flex ${theme.titleBar}`}
                >
                  قسم منظم وجاهز للاختيار
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {section.categories.map((category) => {
                  const availability = categoryAvailability[category.id] ?? {
                    availableGames: 0,
                    isSelectable: false,
                    mode: selectionMode,
                    easyCount: 0,
                    mediumCount: 0,
                    hardCount: 0,
                  };

                  const active = selectedCategories.includes(category.id);
                  const badge = getAvailabilityBadge(availability);
                  const infoOpen = openInfoId === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`group relative w-[calc(50%-0.5rem)] min-w-[150px] max-w-[180px] shrink-0 overflow-hidden rounded-[1.7rem] border border-black/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-0 text-right shadow-[0_16px_32px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-1 sm:w-[172px] ${
                        active ? `${theme.selectedRing} scale-[1.01]` : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(event) => handleInfoClick(event, category.id)}
                        className={`absolute left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-lg ${theme.info}`}
                        aria-label={`عرض وصف ${category.name}`}
                      >
                        i
                      </button>

                      <div
                        className={`absolute right-3 top-3 z-20 inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black ${badge.className}`}
                      >
                        {badge.text}
                      </div>

                      {active ? (
                        <div className="absolute bottom-3 left-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white shadow-lg">
                          ✓
                        </div>
                      ) : null}

                      <div className="overflow-hidden rounded-t-[1.7rem] border-b border-white/10 bg-[#cfd3d8]">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-3xl text-slate-500">
                            ✨
                          </div>
                        )}
                      </div>

                      <div className={`px-4 py-3 text-center text-lg font-black ${theme.nameBar}`}>
                        {category.name}
                      </div>

                      {infoOpen ? (
                        <div className="border-t border-white/10 bg-slate-950/85 px-4 py-4 text-sm leading-7 text-white/80">
                          <div className="mb-2 text-base font-black text-white">
                            {category.name}
                          </div>
                          <div>
                            {category.description ||
                              "لا يوجد وصف متاح لهذه الفئة حاليًا."}
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {uncategorized.length > 0 ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#112945] text-white">
                  <BookOpenIcon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    فئات بدون قسم
                  </h3>
                  <div className="mt-1 text-sm font-bold text-white/50">
                    {uncategorized.length} فئة
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {uncategorized.map((category) => {
                const theme = getSectionTheme("default");
                const availability = categoryAvailability[category.id] ?? {
                  availableGames: 0,
                  isSelectable: false,
                  mode: selectionMode,
                  easyCount: 0,
                  mediumCount: 0,
                  hardCount: 0,
                };

                const active = selectedCategories.includes(category.id);
                const badge = getAvailabilityBadge(availability);
                const infoOpen = openInfoId === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`group relative w-[calc(50%-0.5rem)] min-w-[150px] max-w-[180px] shrink-0 overflow-hidden rounded-[1.7rem] border border-black/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-0 text-right shadow-[0_16px_32px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-1 sm:w-[172px] ${
                      active ? `${theme.selectedRing} scale-[1.01]` : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(event) => handleInfoClick(event, category.id)}
                      className={`absolute left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-lg ${theme.info}`}
                      aria-label={`عرض وصف ${category.name}`}
                    >
                      i
                    </button>

                    <div
                      className={`absolute right-3 top-3 z-20 inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black ${badge.className}`}
                    >
                      {badge.text}
                    </div>

                    {active ? (
                      <div className="absolute bottom-3 left-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white shadow-lg">
                        ✓
                      </div>
                    ) : null}

                    <div className="overflow-hidden rounded-t-[1.7rem] border-b border-white/10 bg-[#cfd3d8]">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center text-3xl text-slate-500">
                          ✨
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="text-lg font-black text-white">
                        {category.name}
                      </div>
                    </div>

                    {infoOpen ? (
                      <div className="border-t border-white/10 bg-slate-950/85 px-4 py-4 text-sm leading-7 text-white/80">
                        <div className="mb-2 text-base font-black text-white">
                          {category.name}
                        </div>
                        <div>
                          {category.description ||
                            "لا يوجد وصف متاح لهذه الفئة حاليًا."}
                        </div>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    </form>
  );
}