"use client";

import { useEffect } from "react";

export default function HorizontalScroll() {
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        document.documentElement.scrollLeft += e.deltaY;
      }
    };
    document.addEventListener("wheel", handler, { passive: false });
    return () => document.removeEventListener("wheel", handler);
  }, []);

  return null;
}
