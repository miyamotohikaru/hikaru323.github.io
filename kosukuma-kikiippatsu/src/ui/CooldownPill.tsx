"use client";

// クールダウン中の残り秒ピル。減っていくリングと秒カウントダウンを描く。
// 残りがないときは何も出さない。

import { useEffect, useState } from "react";
import { useGameStore } from "@/game/store";
import { COOLDOWN_SEC } from "@/lib/config";
import "./ui.css";

const RING_R = 9;
const RING_C = 2 * Math.PI * RING_R;

export default function CooldownPill() {
  const cooldownUntil = useGameStore((s) => s.cooldownUntil);
  const [now, setNow] = useState(() => Date.now());
  const active = cooldownUntil > now;

  // 残りがあるあいだだけ 250ms ごとに時刻を進める
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [active, cooldownUntil]);

  if (!active) return null;

  const remainMs = cooldownUntil - now;
  const sec = Math.max(1, Math.ceil(remainMs / 1000));
  const frac = Math.min(1, Math.max(0, remainMs / (COOLDOWN_SEC * 1000)));

  return (
    <div
      className="cooldown-pill"
      role="timer"
      aria-label={`つぎに刺せるまで あと${sec}びょう`}
    >
      <svg
        className="cooldown-ring"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        aria-hidden="true"
      >
        <circle className="ring-bg" cx="12" cy="12" r={RING_R} />
        <circle
          className="ring-fg"
          cx="12"
          cy="12"
          r={RING_R}
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - frac)}
          transform="rotate(-90 12 12)"
        />
      </svg>
      {/* 減っていくリングが「待ち」を伝えているので、スマホでは前置きを畳んで
          「あとN びょう」だけにする(読み上げ用の文は aria-label が持っている) */}
      <span>
        <span className="cd-lead">つぎに刺せるまで </span>あと<b>{sec}</b>びょう
      </span>
    </div>
  );
}
