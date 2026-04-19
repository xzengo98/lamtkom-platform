"use client";

import { useEffect } from "react";

export default function DisableImageContextMenu() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target instanceof HTMLImageElement ||
        target.closest("img") ||
        (target instanceof HTMLElement &&
          getComputedStyle(target).backgroundImage !== "none");

      if (isImage) {
        event.preventDefault();
      }
    };

    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target instanceof HTMLImageElement || Boolean(target.closest("img"));

      if (isImage) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return null;
}