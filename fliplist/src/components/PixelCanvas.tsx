"use client";

import { useEffect, useRef } from "react";
import { PixelGfx, jpFontReady } from "@/art/gfx";

/**
 * 1周を何コマに割るか。当時のアニメも十数コマで回っていたし、
 * ラベル側の動き（火が揺れる／数字が1つ進む）はもともとコマ数が少ない。
 * 60コマ出しても見た目は変わらず、塗る量だけが増える。
 */
const STEPS = 12;

type Props = {
  w: number;
  h: number;
  scale: number;
  /** t は 0..1 を循環する。静止画なら t を無視してよい */
  draw: (g: PixelGfx, t: number) => void;
  /** true のあいだだけ毎フレーム描き直す */
  animate?: boolean;
  /** 1周にかける秒数 */
  period?: number;
  className?: string;
  ariaLabel?: string;
};

/**
 * PixelGfx の中身をそのまま canvas に出す。
 *
 * putImageData は等倍でしか置けないので、いったん等倍の裏キャンバスに置いてから
 * 補間を切って拡大する。CSS の拡大に任せるとブラウザによって滲む。
 *
 * 実画素ぶんまで拡大しておくのが要点。scale も devicePixelRatio も整数なので、
 * 積も整数になり、最近傍のまま1ドットが正確に n×n の正方形になる。
 * ここを CSS 任せにすると、Retina で1ドットが 1.5px 幅になって列ごとに太さが変わる。
 *
 * 16本ぶんが同時に回ると重いので、
 *   ・画面に入っていないカセットは描かない
 *   ・「動きを減らす」設定の環境では最初の1枚だけ描く
 */
export default function PixelCanvas({
  w,
  h,
  scale,
  draw,
  animate = false,
  period = 2,
  className,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const visible = useRef(true);

  // 画面外では回さない
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
    const zoom = scale * dpr;
    canvas.width = w * zoom;
    canvas.height = h * zoom;
    canvas.style.width = `${w * scale}px`;
    canvas.style.height = `${h * scale}px`;

    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    const g = new PixelGfx(w, h);
    const reduce =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let start = 0;

    const paint = (t: number) => {
      g.clear();
      g.origin(0, 0);
      g.unclip();
      drawRef.current(g, t);
      offCtx.putImageData(g.toImageData(), 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    };

    // 和文の字母は書体から起こしているので、読み込み前に描くと文字が消える。
    // 一度目は待たずに描き（書体が既にあれば正しく出る）、整い次第もう一度描く。
    let alive = true;
    let lastStep = -1;
    const start2 = () => {
      if (!alive) return;
      if (!animate || reduce) {
        paint(0);
        return;
      }
      const loop = (now: number) => {
        if (!start) start = now;
        if (visible.current) {
          // 毎フレーム描き直さない。ドット絵の動きは元々コマ数が少ないので、
          // 1周を STEPS 等分した「コマ」が変わったときだけ描く。
          // 16本が同時に回っても、塗る量が 1/5 以下になる。
          const phase = ((now - start) / (period * 1000)) % 1;
          const step = Math.floor(phase * STEPS);
          if (step !== lastStep) {
            lastStep = step;
            paint(step / STEPS);
          }
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    start2();
    jpFontReady().then(() => {
      if (!alive) return;
      if (!animate || reduce) paint(0);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [w, h, scale, animate, period]);

  return (
    <canvas
      ref={ref}
      className={`pixel ${className ?? ""}`}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
    />
  );
}
