"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const INCLUDED_PREFIXES = ["/account", "/admin", "/game/start"];
const EXCLUDED_PREFIXES = ["/game/board", "/games/codenames"];
const MIN_HIDDEN_DURATION_MS = 30000;
const MIN_REFRESH_INTERVAL_MS = 15000;

export default function AppResumeRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const hiddenAtRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const isExcluded = EXCLUDED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isExcluded) return;

    const isIncluded = INCLUDED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isIncluded) return;

    const refreshIfNeeded = (force = false) => {
      const now = Date.now();
      const hiddenFor = hiddenAtRef.current ? now - hiddenAtRef.current : 0;
      const refreshedRecently =
        now - lastRefreshAtRef.current < MIN_REFRESH_INTERVAL_MS;

      if (refreshedRecently) return;
      if (!force && hiddenFor < MIN_HIDDEN_DURATION_MS) return;

      lastRefreshAtRef.current = now;
      router.refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (document.visibilityState === "visible") {
        refreshIfNeeded(false);
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshIfNeeded(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, router]);

  return null;
}