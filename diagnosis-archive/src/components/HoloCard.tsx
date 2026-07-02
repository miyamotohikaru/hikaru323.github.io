"use client";

import { useEffect, useRef } from "react";
import type { Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import { useLang } from "@/lib/i18n";
import { REGION_LABELS, STATUS_META, cardText, yearLabel } from "@/lib/meta";

/** ポインタ追従で傾く「ホロカード」 */
export default function HoloCard({ card }: { card: Card }) {
  const { lang, tx } = useLang();
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const state = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, raf: 0, active: false });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const s = state.current;

    const tick = () => {
      s.cx += (s.tx - s.cx) * 0.12;
      s.cy += (s.ty - s.cy) * 0.12;
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${(-s.cy * 9).toFixed(2)}deg) rotateY(${(s.cx * 11).toFixed(2)}deg)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.background = `radial-gradient(360px circle at ${50 + s.cx * 45}% ${
          42 + s.cy * 45
        }%, rgb(255 255 255 / 0.35), transparent 55%)`;
        sheenRef.current.style.opacity = s.active ? "1" : "0";
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

  const t = cardText(card, lang);

  return (
    <div ref={wrapRef} className="touch-none select-none" style={{ perspective: "900px" }}>
      <div ref={cardRef} className="da-card relative px-6 pb-5 pt-5 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <div ref={sheenRef} className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-300" />

        <header className="flex items-baseline justify-between">
          <span className="font-display text-3xl italic text-da-accent">
            <span className="text-lg">№</span>
            {card.num}
          </span>
          <span className="font-mono text-xs tracking-[0.15em]">{yearLabel(card)}</span>
        </header>

        <CardIcon card={card} className="mx-auto my-4 aspect-square w-[70%] max-w-[190px]" />

        <div className="border-t da-hairline pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-da-muted">{t.enName}</p>
          <h2 className="font-mincho mt-1 text-2xl font-bold leading-snug">{t.name}</h2>
          <p className="da-clamp-3 mt-2 text-xs leading-relaxed text-da-muted">{t.meaning}</p>
        </div>

        <footer className="mt-4 flex items-center justify-between border-t da-hairline pt-2">
          <span className="font-mono text-[11px] tracking-[0.12em]">
            <span className="mr-1.5 text-da-accent">−</span>
            {tx(STATUS_META[card.cat].label)}
          </span>
          <span className="font-mono text-[11px] tracking-[0.12em] text-da-accent">{tx(REGION_LABELS[card.region])}</span>
        </footer>
      </div>
    </div>
  );
}
