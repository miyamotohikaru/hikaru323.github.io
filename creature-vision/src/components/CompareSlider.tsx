"use client";

import { useRef, useState, useCallback } from "react";

interface Props {
  creatureName: string;
  accentColor: string;
}

export default function CompareSlider({ creatureName, accentColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, x)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 cursor-col-resize select-none"
      onMouseDown={(e) => {
        setDragging(true);
        updatePosition(e.clientX);
      }}
      onMouseMove={(e) => dragging && updatePosition(e.clientX)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchStart={(e) => {
        setDragging(true);
        updatePosition(e.touches[0].clientX);
      }}
      onTouchMove={(e) => dragging && updatePosition(e.touches[0].clientX)}
      onTouchEnd={() => setDragging(false)}
    >
      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-20"
        style={{
          left: `${position}%`,
          width: 3,
          background: "#fff",
          boxShadow: "0 0 6px rgba(0,0,0,0.3)",
          transform: "translateX(-50%)",
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            left: "50%",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 900, color: "#2D2D2D" }}>⇔</span>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-3 left-3 z-20 px-3 py-1"
        style={{
          borderRadius: 100,
          background: accentColor,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {creatureName}
      </div>
      <div
        className="absolute top-3 right-3 z-20 px-3 py-1"
        style={{
          borderRadius: 100,
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        にんげん
      </div>
    </div>
  );
}

export function useCompareClipPath(position: number) {
  return {
    filtered: `inset(0 ${100 - position}% 0 0)`,
    original: `inset(0 0 0 ${position}%)`,
  };
}
