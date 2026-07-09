"use client";

// タイトル画面。後ろに3Dの月が見えるよう背景は透過。
// ロゴは1文字ずつ跳ねて登場し、「危機一髪」は赤系で強調する。

import { useGameStore } from "@/game/store";
import "./ui.css";

/** ロゴ1行分。offset は全体を通した文字番号(アニメの時差用) */
function LogoLine({
  text,
  offset,
  danger = false,
}: {
  text: string;
  offset: number;
  danger?: boolean;
}) {
  return (
    <div className="logo-line">
      {[...text].map((ch, i) => {
        const n = offset + i;
        return (
          <span
            key={i}
            className={danger ? "logo-char logo-char-danger" : "logo-char"}
            style={{
              // 1つ目: 登場ポップ / 2つ目: その後のぴょこぴょこ(ずらして波にする)
              animationDelay: `${0.06 * n}s, ${1.2 + 0.09 * n}s`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export default function TitleScreen() {
  const phase = useGameStore((s) => s.phase);
  const ready3d = useGameStore((s) => s.ready3d);
  const start = useGameStore((s) => s.start);

  if (phase !== "boot" && phase !== "title") return null;

  // サーバー状態(boot→title)と3Dアセットの両方が揃ったら遊べる
  const ready = phase === "title" && ready3d;

  return (
    <div className="title-screen">
      <div className="title-head">
        <h1 className="title-logo">
          <LogoLine text="こすくまくん" offset={0} />
          <LogoLine text="危機一髪" offset={6} danger />
        </h1>
        <p className="title-copy">
          月にささった こすくまくんを
          <br />
          たすけて…いや、飛ばして！
        </p>
      </div>
      <div className="title-bottom">
        <button
          type="button"
          className="btn btn-start"
          disabled={!ready}
          onClick={start}
        >
          {ready ? "はじめる" : "よみこみちゅう…"}
        </button>
        <p className="title-note">⚔️ 1000のあなの どれか1つが あたり</p>
      </div>
    </div>
  );
}
