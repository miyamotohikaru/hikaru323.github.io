"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * カードを「手に持っている」ように見せるラッパー。
 * カード自体のデザインには触れず、外側で 3D の傾き・光沢・持ち上がりだけを足す。
 * - PC: マウス位置に追従して傾き、光がすべる
 * - 携帯: 指でなぞると傾き、離すと戻る（タップでの遷移は妨げない）
 * prefers-reduced-motion が有効なときは何もしない。
 */

export type TiltVariant = "index" | "hero";

const CONF: Record<
  TiltVariant,
  { tilt: number; lift: number; scale: number; glare: number }
> = {
  // 索引はカードが小さく枚数も多いので控えめに
  index: { tilt: 7, lift: 5, scale: 1.03, glare: 0.5 },
  // 詳細ページの主役カードはしっかり動かす
  hero: { tilt: 13, lift: 8, scale: 1.02, glare: 0.66 },
};

/** 端末が細かい指定のできるポインタ（＝マウス）を持っているか */
function hasFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function TiltCard({
  variant = "index",
  className = "",
  children,
}: {
  variant?: TiltVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const conf = CONF[variant];

  /** ポインタ位置（要素内 0〜1）から傾きと光沢位置を決める */
  const track = useCallback(
    (clientX: number, clientY: number, pressed: boolean) => {
      const el = ref.current;
      if (!el) return;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
        const py = Math.min(Math.max((clientY - r.top) / r.height, 0), 1);
        // 中心を0として -1〜1 に。上を触ったら奥に倒れる（＝手前が持ち上がる）
        el.style.setProperty("--ry", `${(px - 0.5) * 2 * conf.tilt}deg`);
        el.style.setProperty("--rx", `${(0.5 - py) * 2 * conf.tilt}deg`);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
        el.style.setProperty("--lift", `${-conf.lift}px`);
        el.style.setProperty("--tscale", `${pressed ? 0.985 : conf.scale}`);
        el.style.setProperty("--glare", `${conf.glare}`);
      });
    },
    [conf]
  );

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.classList.remove("is-live");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--lift", "0px");
    el.style.setProperty("--tscale", "1");
    el.style.setProperty("--glare", "0");
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const begin = () => {
    if (prefersReducedMotion()) return false;
    ref.current?.classList.add("is-live");
    return true;
  };

  return (
    <div
      ref={ref}
      className={`vja-tilt ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || !hasFinePointer()) return;
        if (begin()) track(e.clientX, e.clientY, false);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" && !hasFinePointer()) return;
        if (!ref.current?.classList.contains("is-live")) return;
        track(e.clientX, e.clientY, e.pressure > 0 && e.pointerType !== "mouse");
      }}
      onPointerDown={(e) => {
        // 指・ペンは触れた時点から追従させる（タップでのリンク遷移は止めない）
        if (e.pointerType === "mouse") return;
        // ここでは振動させない（スクロール開始のたびに震えてしまうため）
        if (begin()) track(e.clientX, e.clientY, true);
      }}
      onPointerLeave={reset}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        reset();
      }}
      onPointerCancel={reset}
    >
      {children}
      <span className="vja-glare" aria-hidden />
      <span className="vja-holo" aria-hidden />
    </div>
  );
}
