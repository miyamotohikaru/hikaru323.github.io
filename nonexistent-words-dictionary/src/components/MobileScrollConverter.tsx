"use client";

import { useEffect } from "react";

export default function MobileScrollConverter() {
  useEffect(() => {
    if (window.innerWidth > 640) return;

    document.body.style.overflowY = "hidden";
    document.body.style.overflowX = "auto";
    document.body.style.height = "100vh";

    let touchStartY = 0;
    let scrollStartX = 0;

    const shouldIgnore = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        !!target.closest("[data-no-scroll-convert]")
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (shouldIgnore(e)) return;
      touchStartY = e.touches[0].clientY;
      scrollStartX = window.scrollX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (shouldIgnore(e)) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      window.scrollTo({ left: scrollStartX + deltaY * 1.5, behavior: "auto" });
      e.preventDefault();
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      document.body.style.overflowY = "";
      document.body.style.overflowX = "";
      document.body.style.height = "";
    };
  }, []);

  return null;
}
