"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const EXCLUDED_PREFIXES = ["/game/board", "/games/codenames"];

export default function AppResumeRefresh() {
  const router = useRouter();
  const pathname = usePathname();

  const hiddenAtRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const shouldSkip = EXCLUDED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (shouldSkip) return;

    const refreshIfNeeded = (force = false) => {
      const now = Date.now();
      const hiddenFor = hiddenAtRef.current ? now - hiddenAtRef.current : 0;
      const refreshedRecently = now - lastRefreshAtRef.current < 5000;

      if (refreshedRecently) return;
      if (!force && hiddenFor < 10000) return;

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

    const handleFocus = () => {
      refreshIfNeeded(false);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshIfNeeded(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, router]);

  return null;
}