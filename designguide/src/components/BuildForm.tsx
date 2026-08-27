"use client";

import { useMemo, useState, useEffect, type ReactNode } from "react";
import BreakText from "@/components/BreakText";
import PromptBlock from "./PromptBlock";
import { FORMATS, FORMAT_KEYS, MOODS, MOOD_KEYS, composeJa, composeEn, type FormatKey, type MoodKey } from "@/lib/prompt";
import type { DesignStyle } from "@/data/types";

/** 主題の例。空欄のまま固まる人がいちばん多いので、押せば入る形で置く */
const EXAMPLES = [
  "海辺の小さな町の朝",
  "喫茶店のカウンターとコーヒー",
  "山あいの温泉宿",
  "夜の高速道路",
  "本棚のある部屋",
  "音楽フェスの告知",
  "焼き菓子の詰め合わせ",
  "架空の惑星の地図",
];

export default function BuildForm({
  styles,
  picker,
  initial,
}: {
  styles: DesignStyle[];
  /** 80枚の図版。サーバで描いたものを差し込む（クライアントに送らない） */
  picker: ReactNode;
  initial?: string;
}) {
  const [slug, setSlug] = useState(initial && styles.some((s) => s.slug === initial) ? initial : styles[0].slug);
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState<FormatKey>("poster");
  const [mood, setMood] = useState<MoodKey>("none");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  const style = useMemo(() => styles.find((s) => s.slug === slug) ?? styles[0], [styles, slug]);

  /* 選んだ1枚に印をつける。図版はサーバで描いてあるので属性だけ動かす */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-pick]").forEach((el) => {
      el.dataset.on = el.dataset.pick === slug ? "1" : "0";
    });
  }, [slug]);

  /* 語でしぼる */
  useEffect(() => {
    const needle = q.trim().toLowerCase();
    document.querySelectorAll<HTMLElement>("[data-pick]").forEach((el) => {
      el.dataset.hit = !needle || (el.dataset.q ?? "").includes(needle) ? "1" : "0";
    });
  }, [q]);

  /* 図版を押したら選ぶ。押せる領域はサーバ側の要素なので、まとめて拾う */
  useEffect(() => {
    const pool = document.getElementById("pick-pool");
    if (!pool) return;
    const onClick = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-pick]");
      if (el?.dataset.pick) {
        setSlug(el.dataset.pick);
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    pool.addEventListener("click", onClick);
    return () => pool.removeEventListener("click", onClick);
  }, []);

  const input = { style, subject, format, mood, text };
  const ja = composeJa(input);
  const en = composeEn(input);

  return (
    <div className="bld">
      {/* ── 左：組み立て ─────────────────────────────────────── */}
      <div className="bld__form">
        {/* 1 様式 */}
        <section className="fld">
          <div className="fld__h">
            <span className="fld__n">1</span>
            <h2>様式をえらぶ</h2>
            <span className="fld__now">{style.ja}</span>
          </div>

          <input
            className="fld__q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="バウハウス / riso / 1960s …"
            aria-label="様式をしぼる"
            spellCheck={false}
          />

          <div className="pick" id="pick-pool">{picker}</div>

          <div className="fld__chip">
            <div className="fld__pal" aria-hidden>
              {style.palette.map((c) => <i key={c} style={{ background: c }} />)}
            </div>
            <div>
              <b>{style.ja}</b>
              <span>{style.en}／{style.era}・{style.origin}</span>
            </div>
          </div>
        </section>

        {/* 2 主題 */}
        <section className="fld">
          <div className="fld__h">
            <span className="fld__n">2</span>
            <h2>何を描くか</h2>
          </div>
          <input
            className="fld__in"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="海辺の小さな町の朝"
            aria-label="主題"
          />
          <p className="fld__note">
            <BreakText text="空のままでも作れます。その場合は、様式そのものを主題にした一枚になります。" />
          </p>
          <div className="fld__egs">
            {EXAMPLES.map((e) => (
              <button key={e} type="button" className="eg" onClick={() => setSubject(e)}>{e}</button>
            ))}
          </div>
        </section>

        {/* 3 判型 */}
        <section className="fld">
          <div className="fld__h">
            <span className="fld__n">3</span>
            <h2>どの形で使うか</h2>
          </div>
          <div className="fmt">
            {FORMAT_KEYS.map((k) => {
              const f = FORMATS[k];
              const [w, h] = f.ratio.split(":").map(Number);
              return (
                <button
                  key={k}
                  type="button"
                  className="fmt__b"
                  data-on={format === k || undefined}
                  onClick={() => setFormat(k)}
                >
                  <span className="fmt__box" style={{ aspectRatio: `${w} / ${h}` }} aria-hidden />
                  <b>{f.ja}</b>
                  <em>{f.ratio}</em>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4 調子と文字 */}
        <section className="fld">
          <div className="fld__h">
            <span className="fld__n">4</span>
            <h2>調子と、入れる文字</h2>
            <span className="fld__opt">任意</span>
          </div>
          <div className="fld__row">
            <label className="fld__lab">
              <span>調子</span>
              <select value={mood} onChange={(e) => setMood(e.target.value as MoodKey)}>
                {MOOD_KEYS.map((k) => (
                  <option key={k} value={k}>{MOODS[k].ja}</option>
                ))}
              </select>
            </label>
            <label className="fld__lab">
              <span>画面に入れる文字</span>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="COASTAL MOMENTS"
              />
            </label>
          </div>
          <p className="fld__note">
            <BreakText text="文字を空にすると、「文字・ロゴ・透かしを入れない」と明示した指示になります。画像生成は文字が崩れやすいので、要らないときは空のままが安全です。" />
          </p>
        </section>
      </div>

      {/* ── 右：できたもの ───────────────────────────────────── */}
      <div className="bld__out">
        <div className="bld__sticky">
          <div className="fld__h fld__h--out">
            <span className="fld__n">5</span>
            <h2>できたプロンプト</h2>
          </div>
          <PromptBlock ja={ja} en={en} />
        </div>
      </div>
    </div>
  );
}
