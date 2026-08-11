"use client";

import { useEffect, useState } from "react";
import Cartridge from "@/components/Cartridge";
import Wordmark, { WORDMARK } from "@/components/Wordmark";
import Definition from "@/components/Definition";
import Colophon from "@/components/Colophon";
import { FLIPS, type Flip, type FlipStatus } from "@/data/flips";
import { LABELS } from "@/art/labels";
import { CART_BUFFER } from "@/art/spec";

const HOME = "https://kosukuma.com/home.html";

const STATUS: Record<FlipStatus, { jp: string; en: string; key: string }> = {
  released: { jp: "公開中", en: "RELEASED", key: "released" },
  done: { jp: "完成", en: "DONE", key: "done" },
  wip: { jp: "制作中", en: "IN PROGRESS", key: "wip" },
  idea: { jp: "構想", en: "IDEA", key: "idea" },
};
const ORDER: FlipStatus[] = ["released", "done", "wip", "idea"];

const dot = (d: string) => d.replace(/-/g, ".");

/**
 * 版面はドット絵の整数倍でしか組めない。
 * だから幅から段数と倍率を先に決め、紙の幅はその結果として出す。
 * こうすると天地の帯も奥付もカセットの段とぴったり揃う。
 */
type Tier = { cols: number; scale: number; pad: number; gutter: number };
type Layout = Tier & { logo: number; sheet: number };

const TIERS: Array<[number, Tier]> = [
  [1232, { cols: 4, scale: 3, pad: 28, gutter: 24 }],
  [932, { cols: 3, scale: 3, pad: 28, gutter: 24 }],
  // 2段のときは段間を広めに取る。こうすると見出しロゴが2倍で入る
  [672, { cols: 2, scale: 3, pad: 24, gutter: 72 }],
  [624, { cols: 2, scale: 3, pad: 24, gutter: 24 }],
  [0, { cols: 2, scale: 2, pad: 8, gutter: 6 }],
];

function measure(w: number): Layout {
  const t = (TIERS.find(([min]) => w >= min) ?? TIERS[TIERS.length - 1])[1];
  const cart = CART_BUFFER.W * t.scale;
  const inner = t.cols * cart + (t.cols - 1) * t.gutter;
  const logo = inner >= WORDMARK.W * 3 ? 3 : inner >= WORDMARK.W * 2 ? 2 : 1;
  return { ...t, logo, sheet: inner + t.pad * 2 };
}

function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(() => measure(1440));
  useEffect(() => {
    const calc = () => {
      const next = measure(window.innerWidth);
      setLayout((p) => (p.cols === next.cols && p.scale === next.scale ? p : next));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return layout;
}

export default function Page() {
  const [hover, setHover] = useState<string | null>(null);
  const { cols, scale, logo, pad, gutter, sheet } = useLayout();
  const count = (s: FlipStatus) => FLIPS.filter((f) => f.status === s).length;
  const cartW = CART_BUFFER.W * scale;

  return (
    <main
      className="sheet"
      data-cols={cols}
      data-scale={scale}
      style={
        {
          maxWidth: `min(${sheet}px, 100%)`,
          "--pad": `${pad}px`,
          "--gutter": `${gutter}px`,
        } as React.CSSProperties
      }
    >
      <span className="reg reg-tl" aria-hidden />
      <span className="reg reg-tr" aria-hidden />

      {/* ── 天の帯 ─────────────────────────────── */}
      <div className="bar">
        <a className="bar-l" href={HOME}>
          <span className="k12">株式会社こす.くま</span>
          <span className="k8 en">KOSU.KUMA CO.,LTD.</span>
        </a>
        <span className="bar-fill" aria-hidden />
        <span className="bar-r">
          <span className="k8 en">CATALOGUE OF FLIPS</span>
          <span className="k12">第1版</span>
        </span>
      </div>

      {/* ── 見出し ─────────────────────────────── */}
      <header className="masthead">
        <div className="mast-logo">
          <h1 className="vh">ふりっぷ 一覧 — 株式会社こす.くま</h1>
          <Wordmark scale={logo} />
          <p className="mast-sub">
            <span className="en">FLIP</span>
            <span className="mast-sub-jp">
              こす.くまがつくった小さなあそびと実験。
            </span>
          </p>
        </div>

        <div className="mast-side">
          <p className="mast-lead">
            1本を1本のカセットに見立てて、つくった順にならべています。
            ラベルの絵は、ふりっぷごとに描き下ろしました。
          </p>
          <div className="tally plate">
            <span className="plate-tab en">INDEX</span>
            <table className="tally-t">
              <tbody>
                {ORDER.map((s) => (
                  <tr key={s}>
                    <td>
                      <i className={`mark mark-${s}`} aria-hidden />
                      {STATUS[s].jp}
                    </td>
                    <td className="tally-n en">{String(count(s)).padStart(2, "0")}</td>
                  </tr>
                ))}
                <tr className="tally-sum">
                  <td>合計</td>
                  <td className="tally-n en">{String(FLIPS.length).padStart(2, "0")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </header>

      <Definition />

      {/* ── 目次 ───────────────────────────────── */}
      <section className="toc">
        <div className="band">
          <span className="band-en en">CONTENTS</span>
          <span className="band-jp">もくじ ／ ふりっぷ 全{FLIPS.length}本</span>
          <span className="band-n en">
            001 &ndash; {String(FLIPS.length).padStart(3, "0")}
          </span>
        </div>

        <div className="legend">
          <span className="legend-head k8 en">KEY</span>
          {ORDER.map((s) => (
            <span className="legend-i" key={s}>
              <i className={`mark mark-${s}`} aria-hidden />
              {STATUS[s].jp}
              <b className="en">{STATUS[s].en}</b>
            </span>
          ))}
          <span className="legend-i legend-i--empty">
            <i className="mark mark-empty" aria-hidden />
            未挿入
            <b className="en">NO CART</b>
          </span>
        </div>

        <ol
          className="grid"
          style={
            {
              gridTemplateColumns: `repeat(${cols}, minmax(0, ${cartW}px))`,
              "--cart-w": `${cartW}px`,
            } as React.CSSProperties
          }
        >
          {FLIPS.map((flip, i) => (
            <Item
              key={flip.slug}
              flip={flip}
              n={i + 1}
              scale={scale}
              hovered={hover === flip.slug}
              onHover={setHover}
            />
          ))}
        </ol>
      </section>

      <Colophon />
      <span className="reg reg-bl" aria-hidden />
      <span className="reg reg-br" aria-hidden />
      <a className="vh" href={HOME}>
        株式会社こす.くま へもどる
      </a>
    </main>
  );
}

function Item({
  flip,
  n,
  scale,
  hovered,
  onHover,
}: {
  flip: Flip;
  n: number;
  scale: number;
  hovered: boolean;
  onHover: (s: string | null) => void;
}) {
  const st = STATUS[flip.status];
  const swatch = LABELS[flip.slug]?.swatch ?? [];
  const open = Boolean(flip.url);

  const body = (
    <>
      <div className="cell-head">
        <span className="cell-no en">{String(n).padStart(2, "0")}</span>
        <span className="cell-code en">{flip.code}</span>
        <span className="cell-state">
          <i className={`mark mark-${open ? st.key : "empty"}`} aria-hidden />
          {open ? st.jp : "未挿入"}
        </span>
      </div>

      <div className="cell-cart">
        <Cartridge flip={flip} scale={scale} animate={hovered} />
      </div>

      {open ? (
        <div className="dots" aria-hidden>
          {swatch.slice(0, 5).map((c, k) => (
            <span className="dot" key={k} style={{ background: c }} />
          ))}
        </div>
      ) : (
        <div className="slotbar">
          <span className="slotbar-jp">ラベル未着</span>
          <span className="slotbar-en en">EMPTY SLOT</span>
        </div>
      )}

      <h3 className="ttl">{flip.title}</h3>
      <p className="romaji en">{flip.romaji}</p>
      {flip.desc ? (
        <p className="dsc">{flip.desc}</p>
      ) : (
        <p className="dsc dsc-blank" aria-label="内容は未記入" />
      )}

      <div className="meta">
        <span className="meta-date">
          <b>{flip.status === "released" ? "公開" : "予定"}</b>
          {dot(flip.date)}
        </span>
        <span className="meta-owner">{flip.owner}</span>
      </div>
    </>
  );

  return (
    <li
      className={`cell${open ? "" : " is-empty"}`}
      onMouseEnter={() => onHover(flip.slug)}
      onMouseLeave={() => onHover(null)}
    >
      {open ? (
        <a className="cell-in" href={flip.url} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      ) : (
        <div className="cell-in" aria-disabled="true">
          {body}
        </div>
      )}
    </li>
  );
}
