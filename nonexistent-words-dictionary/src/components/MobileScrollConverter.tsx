"use client";

import { useEffect } from "react";

export default function MobileScrollConverter() {
  useEffect(() => {
    // PC: wheelイベントで縦スクロール→横スクロール変換
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const container = target.closest(".h-scroll, .dictionary-page") as HTMLElement | null;
      if (!container || e.deltaY === 0) return;

      // 個別語ページ（/word/）ではページ縦スクロールを優先
      if (container.closest(".word-detail-content")) return;

      container.scrollLeft -= e.deltaY;
      e.preventDefault();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    // モバイル: touchイベントで左スワイプ→左スクロール変換
    let touchStartX = 0;
    let scrollStartX = 0;
    let activeContainer: HTMLElement | null = null;

    const shouldIgnore = (target: HTMLElement) => {
      return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        !!target.closest("[data-no-scroll-convert]")
      );
    };

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldIgnore(target)) return;
      const container = target.closest(".h-scroll, .dictionary-page") as HTMLElement | null;
      if (!container) return;
      // 個別語ページではスクロール変換しない
      if (container.closest(".word-detail-content")) return;
      activeContainer = container;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      scrollStartX = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldIgnore(target) || !activeContainer) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = touchStartX - currentX;
      const deltaY = touchStartY - currentY;

      // If vertical swipe is dominant, let the page scroll normally
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
        activeContainer = null;
        return;
      }

      const isRtl = getComputedStyle(activeContainer).direction === "rtl";
      activeContainer.scrollLeft = scrollStartX + (isRtl ? deltaX : -deltaX) * 1.5;
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      activeContainer = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return null;
}
