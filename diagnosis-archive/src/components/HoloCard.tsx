"use client";

import { useEffect, useRef } from "react";
import type { Card } from "@/data/cards";
import ArchiveCard from "@/components/ArchiveCard";

const STARS =
  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjQgMTI0Ij48cGF0aCBkPSJNMTggMTkuNEwxOC43OCAyMS4yMkwyMC42IDIyTDE4Ljc4IDIyLjc4TDE4IDI0LjZMMTcuMjIgMjIuNzhMMTUuNCAyMkwxNy4yMiAyMS4yMloiIGZpbGw9IiNmZmQ5ZTIiIG9wYWNpdHk9IjAuOSIvPjxwYXRoIGQ9Ik02NCAxMC4yTDY0LjU0IDExLjQ2TDY1LjggMTJMNjQuNTQgMTIuNTRMNjQgMTMuOEw2My40NiAxMi41NEw2Mi4yIDEyTDYzLjQ2IDExLjQ2WiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC42NSIvPjxwYXRoIGQ9Ik0xMDIgMzUuOEwxMDIuNjYgMzcuMzRMMTA0LjIgMzhMMTAyLjY2IDM4LjY2TDEwMiA0MC4yTDEwMS4zNCAzOC42Nkw5OS44IDM4TDEwMS4zNCAzNy4zNFoiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPjxwYXRoIGQ9Ik0zOCA1Ni41TDM4LjQ1IDU3LjU1TDM5LjUgNThMMzguNDUgNTguNDVMMzggNTkuNUwzNy41NSA1OC40NUwzNi41IDU4TDM3LjU1IDU3LjU1WiIgZmlsbD0iI2ZmZDllMiIgb3BhY2l0eT0iMC42NSIvPjxwYXRoIGQ9Ik04NiA3MS4yTDg2Ljg0IDczLjE2TDg4LjggNzRMODYuODQgNzQuODRMODYgNzYuOEw4NS4xNiA3NC44NEw4My4yIDc0TDg1LjE2IDczLjE2WiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC45Ii8+PHBhdGggZD0iTTE0IDkwLjFMMTQuNTcgOTEuNDNMMTUuOSA5MkwxNC41NyA5Mi41N0wxNCA5My45TDEzLjQzIDkyLjU3TDEyLjEgOTJMMTMuNDMgOTEuNDNaIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjY1Ii8+PHBhdGggZD0iTTU4IDEwMi40TDU4LjQ4IDEwMy41Mkw1OS42IDEwNEw1OC40OCAxMDQuNDhMNTggMTA1LjZMNTcuNTIgMTA0LjQ4TDU2LjQgMTA0TDU3LjUyIDEwMy41MloiIGZpbGw9IiNmZmQ5ZTIiIG9wYWNpdHk9IjAuNjUiLz48cGF0aCBkPSJNMTA4IDk0LjZMMTA4LjQyIDk1LjU4TDEwOS40IDk2TDEwOC40MiA5Ni40MkwxMDggOTcuNEwxMDcuNTggOTYuNDJMMTA2LjYgOTZMMTA3LjU4IDk1LjU4WiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC42NSIvPjxwYXRoIGQ9Ik03NiA0Mi44TDc2LjM2IDQzLjY0TDc3LjIgNDRMNzYuMzYgNDQuMzZMNzYgNDUuMkw3NS42NCA0NC4zNkw3NC44IDQ0TDc1LjY0IDQzLjY0WiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC42NSIvPjxwYXRoIGQ9Ik0zMCAxMTAuMEwzMC42IDExMS40TDMyLjAgMTEyTDMwLjYgMTEyLjZMMzAgMTE0LjBMMjkuNCAxMTIuNkwyOC4wIDExMkwyOS40IDExMS40WiIgZmlsbD0iI2ZmZDllMiIgb3BhY2l0eT0iMC42NSIvPjwvc3ZnPg==\")";

// ごく薄いプリズム光沢（レアカードのホロ加工の気配だけ）
const PRISM =
  "linear-gradient(115deg, transparent 30%, rgb(255 180 200 / 0.14) 42%, rgb(180 200 255 / 0.11) 50%, rgb(255 238 180 / 0.11) 58%, transparent 70%)";

/** ポインタ追従で傾く「ホロカード」。中身は一覧と同じ ArchiveCard（同比率・3Dレイヤー） */
export default function HoloCard({ card }: { card: Card }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const glitterRef = useRef<HTMLDivElement>(null);
  const state = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, raf: 0, active: false });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const s = state.current;

    const tick = () => {
      s.cx += (s.tx - s.cx) * 0.12;
      s.cy += (s.ty - s.cy) * 0.12;
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${(-s.cy * 10).toFixed(2)}deg) rotateY(${(s.cx * 12).toFixed(2)}deg)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.background = `radial-gradient(360px circle at ${50 + s.cx * 45}% ${
          42 + s.cy * 45
        }%, rgb(248 242 230 / 0.4), transparent 55%)`;
        sheenRef.current.style.opacity = s.active ? "1" : "0";
      }
      if (glitterRef.current) {
        glitterRef.current.style.backgroundPosition = `${(-s.cx * 22).toFixed(1)}px ${(-s.cy * 22).toFixed(1)}px, ${(
          50 + s.cx * 42
        ).toFixed(1)}% ${(50 + s.cy * 42).toFixed(1)}%`;
        glitterRef.current.style.opacity = s.active ? "1" : "0";
      }
      if (Math.abs(s.tx - s.cx) > 0.001 || Math.abs(s.ty - s.cy) > 0.001 || s.active) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.raf = 0;
      }
    };
    const start = () => {
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    };

    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      s.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      s.active = true;
      start();
    };
    const onLeave = () => {
      s.tx = 0;
      s.ty = 0;
      s.active = false;
      start();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  return (
    <div ref={wrapRef} className="select-none [touch-action:pan-y]" style={{ perspective: "900px" }}>
      <div
        ref={cardRef}
        className="relative will-change-transform"
        style={{ transformStyle: "preserve-3d", transition: "none" }}
      >
        {/* 光沢（ポインタ追従の面反射） */}
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-0 z-[2] rounded-[3px] opacity-0 transition-opacity duration-300 [transform:translateZ(42px)]"
        />
        {/* キラキラ（星屑＋ごく薄いプリズム） */}
        <div
          ref={glitterRef}
          className="pointer-events-none absolute inset-0 z-[3] rounded-[3px] opacity-0 transition-opacity duration-500 [transform:translateZ(44px)]"
          style={{
            backgroundImage: `${STARS}, ${PRISM}`,
            backgroundSize: "124px 124px, 240% 240%",
            backgroundPosition: "0px 0px, 50% 50%",
          }}
        />
        <ArchiveCard card={card} depth />
      </div>
    </div>
  );
}
