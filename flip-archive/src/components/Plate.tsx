"use client";

import { useEffect, useRef } from "react";
import { type Case } from "@/data/types";
import { plateParamsFor } from "@/lib/plateParams";
import { drawPlate } from "@/webgl/plateRenderer";

/**
 * 単票の図版。
 * 静止時は《変容前の配置》を示し、ホバー／画面内到達で《配置操作》が走る。
 */
export default function Plate({
  c,
  active = false,
  autoplay = false,
  className = "",
}: {
  c: Case;
  /** 親からホバー状態を渡す場合に使う */
  active?: boolean;
  /** 画面に入ったら一度だけ操作を走らせる */
  autoplay?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const targetRef = useRef(0);
  const raf = useRef(0);
  const kickRef = useRef<() => void>(() => {});

  const { seed, plate } = plateParamsFor(c);

  useEffect(() => {
    targetRef.current = active ? 1 : 0;
    kickRef.current();
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      drawPlate(el, {
        seed,
        plate,
        progress: progress.current,
        aspect: el.clientWidth / Math.max(1, el.clientHeight),
      });
    };

    const tick = () => {
      const diff = targetRef.current - progress.current;
      if (Math.abs(diff) > 0.0015) {
        progress.current += diff * (reduced ? 1 : 0.075);
        paint();
        raf.current = requestAnimationFrame(tick);
      } else if (progress.current !== targetRef.current) {
        progress.current = targetRef.current;
        paint();
        raf.current = 0;
      } else {
        raf.current = 0;
      }
    };

    const kick = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    kickRef.current = kick;

    paint();

    const ro = new ResizeObserver(() => paint());
    ro.observe(el);

    let io: IntersectionObserver | null = null;
    if (autoplay) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            targetRef.current = e.isIntersecting ? 1 : 0;
            kick();
          });
        },
        { threshold: 0.45 },
      );
      io.observe(el);
    }

    return () => {
      kickRef.current = () => {};
      ro.disconnect();
      io?.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [seed, plate, autoplay]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ boxShadow: "0 6px 20px -10px rgba(18,17,16,0.28)" }}
      role="img"
      aria-label={`${c.titleJa}の配置図（図鑑が生成した図版であり、実物の写真ではない）`}
    />
  );
}
