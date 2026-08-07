"use client";

// チャーム(10本刺すごとに手に入る、剣にぶら下げるかざり)の棚と、獲得の瞬間のお祝い。
//
// - CharmDisc : 成型プラスチックのまるいチャーム1個(絵柄は絵文字のシール扱い)
// - CharmShelf: 12個ぶんの受け皿。持っている数と「つぎは何本で・あと何本」を出す
// - CharmGet  : 「チャーム ゲット！」のポップ(音の "charm-get" と同時に出す)

import { useEffect, useState, type CSSProperties } from "react";
import { CHARMS, charmLevelOf } from "@/lib/config";
import { useGameStore } from "@/game/store";
import { onGameEvent } from "@/game/events";

interface CharmDiscProps {
  /** CHARMS の index */
  index: number;
  /** 直径(px) */
  size?: number;
  /** まだ持っていない表示(からっぽの受け皿に薄く出す) */
  ghost?: boolean;
  className?: string;
}

export function CharmDisc({ index, size = 34, ghost, className }: CharmDiscProps) {
  const c = CHARMS[index];
  if (!c) return null;
  const style = {
    "--kk-charm-c": c.hex,
    "--kk-charm-d": `${size}px`,
  } as CSSProperties;
  return (
    <span
      className={`kk-disc${ghost ? " ghost" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      aria-hidden="true"
    >
      <span className="kk-disc-face">{c.emoji}</span>
    </span>
  );
}

/** チャームの棚。持っている数と、つぎの1個までの道のりを見せる */
export function CharmShelf() {
  const myTotal = useGameStore((s) => s.myTotal);
  const level = charmLevelOf(myTotal);
  const next = CHARMS[level];
  const prevNeed = level > 0 ? CHARMS[level - 1].need : 0;
  const span = next ? next.need - prevNeed : 1;
  const pct = next
    ? Math.max(0, Math.min(1, (myTotal - prevNeed) / span)) * 100
    : 100;
  const remain = next ? Math.max(1, next.need - myTotal) : 0;

  return (
    <div className="kk-charms">
      <div className="kk-charms-head">
        <span className="kk-sec-label">チャーム</span>
        <span className="kk-charms-count">
          <b>{level}</b>/{CHARMS.length}
        </span>
      </div>

      <ul className="kk-charms-grid">
        {CHARMS.map((c, i) => {
          const got = i < level;
          const isNext = i === level;
          return (
            <li
              key={c.name}
              className={`kk-charm-slot${got ? " got" : ""}${
                isNext ? " next" : ""
              }`}
              aria-label={
                got
                  ? `${c.name} もってる`
                  : `${c.name} ${c.need}本で もらえる`
              }
            >
              {got ? (
                <CharmDisc index={i} size={30} />
              ) : (
                <span className="kk-charm-empty" aria-hidden="true">
                  {/* つぎの1個だけ、うっすら中身を見せて期待させる */}
                  {isNext ? <CharmDisc index={i} size={22} ghost /> : "?"}
                </span>
              )}
              <span className="kk-charm-need">{c.need}</span>
            </li>
          );
        })}
      </ul>

      <div className="kk-charms-next">
        {next ? (
          <>
            <p className="kk-charms-line">
              つぎは <b>{next.need}本</b>で {next.emoji}
              {next.name} <em>あと{remain}本！</em>
            </p>
            <div className="kk-charms-bar" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <p className="kk-charms-line kk-charms-done">
            ぜんぶ あつめた！ すごい！ 🎉
          </p>
        )}
      </div>
    </div>
  );
}

/** チャームを手に入れた瞬間のお祝い。数秒でひとりでに消える */
export function CharmGet() {
  const clearNewCharm = useGameStore((s) => s.clearNewCharm);
  const [shown, setShown] = useState<{ id: number; index: number } | null>(null);

  // 音("charm-get")と同時に出したいのでイベント購読で起動する。
  // newCharm は store が先に立てているので、そのときの値を読めばよい。
  useEffect(
    () =>
      onGameEvent((t) => {
        if (t !== "charm-get") return;
        const i = useGameStore.getState().newCharm;
        if (i === null) return;
        setShown({ id: Date.now(), index: i });
      }),
    []
  );

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => {
      setShown(null);
      clearNewCharm(); // 演出しきったので store を片付ける
    }, 2900);
    return () => clearTimeout(timer);
  }, [shown, clearNewCharm]);

  if (!shown) return null;
  const c = CHARMS[shown.index];
  if (!c) return null;

  return (
    <div className="kk-charmget" role="status" key={shown.id}>
      <div className="kk-charmget-in">
        <div className="kk-charmget-rays" aria-hidden="true" />
        <div className="kk-charmget-ring" aria-hidden="true" />
        <CharmDisc index={shown.index} size={78} className="kk-charmget-disc" />
        <div className="kk-charmget-title">チャーム ゲット！</div>
        <div className="kk-charmget-name">
          {c.emoji} {c.name}
        </div>
      </div>
    </div>
  );
}
