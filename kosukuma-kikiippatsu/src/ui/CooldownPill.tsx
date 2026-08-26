"use client";

// クールダウン中の残り秒ピル。減っていくリングと秒カウントダウンを描く。
//
// 待ちが明けた瞬間は、黙って消えるのではなく **一拍だけ「どうぞ」に変わって**
// から消える。同じ瞬間に3D側のこすくまくんが「はっ」と伸び上がり、鈴が鳴り、
// セリフが出るので、そちらと合図をそろえるため(`cooldown-ready` を購読する)。

import { useEffect, useState } from "react";
import { useGameStore } from "@/game/store";
import { onGameEvent } from "@/game/events";
import { COOLDOWN_SEC } from "@/lib/config";
import "./ui.css";

const RING_R = 9;
const RING_C = 2 * Math.PI * RING_R;

/** 「どうぞ」を見せている時間(ms)。長いと居座るので、ひと呼吸だけ */
const READY_MS = 1500;

export default function CooldownPill() {
  const cooldownUntil = useGameStore((s) => s.cooldownUntil);
  const [now, setNow] = useState(() => Date.now());
  /** 明けた合図を出している最中か(0 = 出していない) */
  const [readyAt, setReadyAt] = useState(0);
  const active = cooldownUntil > now;

  // 残りがあるあいだだけ 250ms ごとに時刻を進める
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [active, cooldownUntil]);

  // 3D側が待ちあけを見張っていて、明けた瞬間に1回だけ投げてくる
  useEffect(
    () =>
      onGameEvent((type) => {
        if (type === "cooldown-ready") setReadyAt(Date.now());
      }),
    []
  );

  // ひと呼吸おいて自分で引っこむ
  useEffect(() => {
    if (readyAt === 0) return;
    const t = setTimeout(() => setReadyAt(0), READY_MS);
    return () => clearTimeout(t);
  }, [readyAt]);

  const ready = !active && readyAt !== 0;
  if (!active && !ready) return null;

  const remainMs = cooldownUntil - now;
  const sec = Math.max(1, Math.ceil(remainMs / 1000));
  const frac = ready
    ? 1 // 明けた合図ではリングを満ちきらせる
    : Math.min(1, Math.max(0, remainMs / (COOLDOWN_SEC * 1000)));

  return (
    <div
      className={ready ? "cooldown-pill is-ready" : "cooldown-pill"}
      role="timer"
      aria-label={ready ? "つぎの1本が刺せるよ" : `つぎに刺せるまで あと${sec}びょう`}
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
      {ready ? (
        <span>さあ、どうぞ</span>
      ) : (
        /* 減っていくリングが「待ち」を伝えているので、スマホでは前置きを畳んで
           「あとN びょう」だけにする(読み上げ用の文は aria-label が持っている) */
        <span>
          <span className="cd-lead">つぎに刺せるまで </span>あと<b>{sec}</b>びょう
        </span>
      )}
    </div>
  );
}
