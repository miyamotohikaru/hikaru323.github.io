"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABEL, type StyleCategory } from "@/data/types";
import { MOODS } from "@/data/moods";

const CATS: (StyleCategory | "all")[] = ["all", "movement", "print", "screen", "internet", "japan", "world"];

/**
 * 図鑑の絞り込み。
 *
 * 種別はCSSだけで隠す（親の data-filter を切り替える）。
 * 語での絞り込みだけは、カードの data-q を見て data-hit を書き換える。
 * カード自体はサーバで描いてあるので、ここで動かすのは属性だけ。
 */
export default function AtlasControls({ total }: { total: number }) {
  const [cat, setCat] = useState<StyleCategory | "all">("all");
  const [q, setQ] = useState("");
  const [hit, setHit] = useState(total);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const grid = document.getElementById("atlas-grid");
    if (!grid) return;
    grid.dataset.filter = cat;

    const needle = q.trim().toLowerCase();
    let n = 0;
    grid.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
      const okCat = cat === "all" || el.dataset.cat === cat;
      const okQ = !needle || (el.dataset.q ?? "").includes(needle);
      const on = okCat && okQ;
      el.dataset.hit = on ? "1" : "0";
      if (on) n++;
    });
    setHit(n);
  }, [cat, q, total]);

  /* 「/」で検索欄に入る。図鑑を繰る手を止めない */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="ctl">
      <div className="ctl__cats" role="group" aria-label="種別でしぼる">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            className="ctl__cat"
            data-on={cat === c || undefined}
            onClick={() => setCat(c)}
          >
            {c === "all" ? "すべて" : CATEGORY_LABEL[c].ja}
          </button>
        ))}
      </div>

      <div className="ctl__search">
        {(cat !== "all" || q) && (
          <button type="button" className="ctl__clear" onClick={() => { setCat("all"); setQ(""); }}>
            解除
          </button>
        )}
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="バウハウス / riso / 1960s …"
          aria-label="名前や年代でしぼる"
          spellCheck={false}
        />
        <span className="ctl__count" aria-live="polite">
          {hit} / {total}
        </span>
      </div>

      {/* 気分から探す。様式名を知らない人の入口 */}
      <div className="ctl__moods">
        <span className="ctl__moodlabel">気分から</span>
        {MOODS.map((m) => (
          <button
            key={m.key}
            type="button"
            className="ctl__mood"
            data-on={q === m.label || undefined}
            title={m.note}
            onClick={() => { setQ(q === m.label ? "" : m.label); setCat("all"); }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {hit === 0 && (
        <p className="ctl__none">
          「{q}」に当てはまるものはありません。
          <button type="button" onClick={() => { setCat("all"); setQ(""); }}>すべて表示</button>
        </p>
      )}
    </div>
  );
}
