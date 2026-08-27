"use client";

import { useState } from "react";
import Copy from "./Copy";
import BreakText from "./BreakText";

/**
 * プロンプトの表示。日本語の仕様書と、英語の1文を切り替える。
 *
 * 貼る先で要る形がちがう。ChatGPT / Gemini / Claude には日本語の
 * 章立てがそのまま効く。Midjourney / Stable Diffusion は1文＋除外語。
 * どちらか片方しか出さないと、片方の人が自分で書き直すことになる。
 */
export default function PromptBlock({
  ja,
  en,
  compact = false,
}: {
  ja: string;
  en: string;
  compact?: boolean;
}) {
  const [tab, setTab] = useState<"ja" | "en">("ja");
  const body = tab === "ja" ? ja : en;

  return (
    <div className="pb" data-compact={compact || undefined}>
      <div className="pb__bar">
        <div className="pb__tabs" role="tablist" aria-label="貼り先で切り替える">
          <button
            type="button" role="tab" aria-selected={tab === "ja"}
            className="pb__tab" data-on={tab === "ja" || undefined}
            onClick={() => setTab("ja")}
          >
            <span>日本語の仕様書</span>
            <em>ChatGPT / Gemini / Claude</em>
          </button>
          <button
            type="button" role="tab" aria-selected={tab === "en"}
            className="pb__tab" data-on={tab === "en" || undefined}
            onClick={() => setTab("en")}
          >
            <span>English</span>
            <em>Midjourney / SD / Flux</em>
          </button>
        </div>
        <Copy text={body} className="pb__copy" />
      </div>

      <pre className="pb__body" tabIndex={0}>{body}</pre>

      <p className="pb__foot">
        <BreakText
          text={
            tab === "ja"
              ? "そのまま貼って送るだけ。主題の行だけ書き換えれば、別のものが同じ様式で出ます。"
              : "1行目が本文、— Negative: 以降が除外語です。Midjourney は --no のあとに続けてください。"
          }
        />
      </p>
    </div>
  );
}
