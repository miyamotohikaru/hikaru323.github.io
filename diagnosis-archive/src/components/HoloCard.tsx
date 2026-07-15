"use client";

import { useEffect, useRef } from "react";
import type { Card } from "@/data/cards";
import ArchiveCard from "@/components/ArchiveCard";

// ごく薄いシルバーの光沢（レアカードの銀箔の気配だけ・カラフルにしない）
const PRISM =
  "linear-gradient(115deg, transparent 32%, rgb(255 255 255 / 0.14) 44%, rgb(214 220 232 / 0.20) 50%, rgb(255 255 255 / 0.14) 56%, transparent 68%)";

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
        glitterRef.current.style.backgroundPosition = `${(50 + s.cx * 42).toFixed(1)}% ${(50 + s.cy * 42).toFixed(1)}%`;
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
        {/* ホログラムの光沢（シルバーの帯のみ・形は入れない） */}
        <div
          ref={glitterRef}
          className="pointer-events-none absolute inset-0 z-[3] rounded-[3px] opacity-0 transition-opacity duration-500 [transform:translateZ(44px)]"
          style={{
            backgroundImage: PRISM,
            backgroundSize: "240% 240%",
            backgroundPosition: "50% 50%",
          }}
        />
        <ArchiveCard card={card} depth />
      </div>
    </div>
  );
}
