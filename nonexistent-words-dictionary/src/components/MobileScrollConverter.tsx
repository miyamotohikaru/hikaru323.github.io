"use client";

import { useEffect } from "react";

export default function MobileScrollConverter() {
  useEffect(() => {
    if (window.innerWidth > 640) return;

    let touchStartY = 0;
    let scrollStartX = 0;
    let activeContainer: HTMLElement | null = null;

    const findScrollContainer = (target: HTMLElement): HTMLElement | null => {
      return target.closest(".h-scroll, .dictionary-page") as HTMLElement | null;
    };

    const shouldIgnore = (target: HTMLElement) => {
      return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        !!target.closest("[data-no-scroll-convert]")
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldIgnore(target)) return;

      const container = findScrollContainer(target);
      if (!container) return;

      activeContainer = container;
      touchStartY = e.touches[0].clientY;
      scrollStartX = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldIgnore(target) || !activeContainer) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;

      // 縦の動きを横スクロールに変換（h-scrollはdirection:rtlなので符号反転）
      const isRtl = getComputedStyle(activeContainer).direction === "rtl";
      activeContainer.scrollLeft = scrollStartX + (isRtl ? -deltaY : deltaY) * 1.5;

      e.preventDefault();
    };

    const handleTouchEnd = () => {
      activeContainer = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return null;
}
