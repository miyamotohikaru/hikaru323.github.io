"use client";

// HUDオーバーレイ。バッジ・フィード・確認シート・各フェーズのバナー・
// 白フラッシュ・ヘルプまで、ゲーム中のUIはすべてここから出す。
// root は pointer-events:none で、押せる要素だけ auto(3D操作を邪魔しない)。

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/game/store";
import { onGameEvent } from "@/game/events";
import Feed from "./Feed";
import CooldownPill from "./CooldownPill";
import HelpModal from "./HelpModal";
import "./ui.css";

export default function Hud() {
  const phase = useGameStore((s) => s.phase);
  const roundNo = useGameStore((s) => s.roundNo);
  const stabCount = useGameStore((s) => s.stabCount);
  const connected = useGameStore((s) => s.connected);
  const muted = useGameStore((s) => s.muted);
  const setMuted = useGameStore((s) => s.setMuted);
  const launchInfo = useGameStore((s) => s.launchInfo);
  const wonName = useGameStore((s) => s.wonName);
  const confirmStab = useGameStore((s) => s.confirmStab);
  const cancelSelect = useGameStore((s) => s.cancelSelect);

  const [helpOpen, setHelpOpen] = useState(false);
  const [flashId, setFlashId] = useState(0);

  // 当たりの瞬間の白フラッシュ(単発イベントを購読して0.15秒で消す)
  useEffect(
    () =>
      onGameEvent((t) => {
        if (t === "win-flash") setFlashId(Date.now());
      }),
    []
  );

  // Xでじまんするリンク(勝者のトロフィー画面用)
  const shareUrl = useMemo(() => {
    if (!launchInfo) return "#";
    const text = `こすくまくん第${launchInfo.roundNo}代を宇宙へ飛ばしました ⚔️🌙`;
    const url = typeof window === "undefined" ? "" : window.location.origin;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
  }, [launchInfo]);

  if (phase === "boot" || phase === "title") return null;

  // new-round 中は store の roundNo がまだ古いことがあるので launchInfo で補正
  const genNo =
    phase === "new-round" && launchInfo
      ? Math.max(roundNo, launchInfo.roundNo + 1)
      : roundNo;

  // フィードを出すのは月をさわれる(見ていられる)フェーズだけ
  const showFeed =
    phase === "idle" ||
    phase === "stabbing" ||
    phase === "suspense" ||
    phase === "safe";

  return (
    <div className="hud">
      {/* ── 上部バー ── */}
      <div className="hud-top">
        <div className="hud-badges">
          <div className="hud-badge hud-badge-gen">
            第<b>{genNo}</b>代 こすくまくん
          </div>
          <div className="hud-badge">
            みんなの ちょうせん <b>{stabCount.toLocaleString()}</b>回
          </div>
        </div>
        <div className="hud-top-right">
          <Link href="/trophies" className="icon-btn" aria-label="トロフィーホール">
            🏆
          </Link>
          <button
            type="button"
            className="icon-btn"
            aria-label={muted ? "おとを だす" : "おとを けす"}
            aria-pressed={muted}
            onClick={() => setMuted(!muted)}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="あそびかた"
            onClick={() => setHelpOpen(true)}
          >
            ❓
          </button>
        </div>
      </div>

      {/* ── 下部: クールダウン + フィード ── */}
      {showFeed && (
        <div className="hud-bottom">
          <CooldownPill />
          <Feed />
        </div>
      )}

      {/* ── 確認シート ── */}
      {phase === "confirming" && (
        <div className="confirm-sheet" role="dialog" aria-label="かくにん">
          <p className="confirm-text">この あなに けんを 刺す…？</p>
          <div className="confirm-buttons">
            <button type="button" className="btn btn-cancel" onClick={cancelSelect}>
              やめとく
            </button>
            <button
              type="button"
              className="btn btn-stab"
              onClick={() => void confirmStab()}
            >
              刺す！
            </button>
          </div>
        </div>
      )}

      {/* ── セーフ！スタンプ ── */}
      {phase === "safe" && (
        <div className="center-stage">
          <div className="stamp">セーフ！</div>
        </div>
      )}

      {/* ── 発射バナー ── */}
      {phase === "launch" && launchInfo && (
        <div className="center-stage">
          <div className="launch-banner">
            {launchInfo.isMe ? (
              <>
                <div className="banner-big banner-hit">🎯 あたり！！</div>
                <div className="banner-sub">こすくまくん、宇宙へ！！</div>
              </>
            ) : (
              <>
                <div className="banner-big">
                  {launchInfo.name ?? "だれか"}さんが あてた！
                </div>
                <div className="banner-sub">
                  第{launchInfo.roundNo}代こすくまくん、宇宙へ
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── トロフィー授与バナー ── */}
      {phase === "trophy" && launchInfo && (
        <div className="trophy-banner">
          <div className="trophy-gen">⚔️ 第{launchInfo.roundNo}代 とばした人</div>
          <div className="trophy-name">{wonName ?? launchInfo.name ?? "ななし"}</div>
          <a
            className="btn btn-share"
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
          >
            Xで じまんする
          </a>
        </div>
      )}

      {/* ── 新ラウンド降臨バナー ── */}
      {phase === "new-round" && (
        <div className="center-stage">
          <div className="newround-banner">
            <span className="newround-gen">第{genNo}代 こすくまくん</span>
            <span className="newround-sub">あらわる！</span>
          </div>
        </div>
      )}

      {/* ── 通信状態 ── */}
      {!connected && <div className="conn-warn">つうしん よわい…</div>}

      {/* ── 当たりの白フラッシュ ── */}
      {flashId !== 0 && (
        <div
          key={flashId}
          className="win-flash"
          onAnimationEnd={() => setFlashId(0)}
        />
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
