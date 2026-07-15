"use client";

// 直近の刺しイベントのフィード(最新4件)。国旗絵文字つきで左下に流れる。
// 勝利行は金色に光る。

import { useGameStore } from "@/game/store";
import "./ui.css";

/** ISO 3166-1 alpha-2 → 国旗絵文字。不明・不正なら 🌍 */
function flagEmoji(country: string | null): string {
  if (!country || country.length !== 2) return "🌍";
  const up = country.toUpperCase();
  const a = up.charCodeAt(0) - 65;
  const b = up.charCodeAt(1) - 65;
  if (a < 0 || a > 25 || b < 0 || b > 25) return "🌍";
  return String.fromCodePoint(0x1f1e6 + a, 0x1f1e6 + b);
}

export default function Feed() {
  const recent = useGameStore((s) => s.recent);
  const items = recent.slice(0, 4);
  if (items.length === 0) return null;
  return (
    <div className="feed" aria-live="polite">
      {items.map((e) => (
        <div
          key={`${e.at}-${e.holeId}`}
          className={e.win ? "feed-row feed-win" : "feed-row"}
        >
          <span className="feed-flag" aria-hidden="true">
            {flagEmoji(e.country)}
          </span>
          <span className="feed-text">
            {e.win
              ? "だれかが あたりを ひきあてた！！"
              : "だれかが けんを刺した…セーフ"}
          </span>
        </div>
      ))}
    </div>
  );
}
