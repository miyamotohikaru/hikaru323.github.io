"use client";

import { useEffect, useState } from "react";
import Cartridge from "@/components/Cartridge";
import Wordmark, { WORDMARK } from "@/components/Wordmark";
import Definition from "@/components/Definition";
import Colophon from "@/components/Colophon";
import { FLIPS, type Flip } from "@/data/flips";
import { LABELS } from "@/art/labels";
import { CART_BUFFER } from "@/art/spec";

const HOME = "https://kosukuma.com/home.html";

/**
 * 版面はドット絵の整数倍でしか組めない。
 * だから幅から段数と倍率を先に決め、紙の幅はその結果として出す。
 * こうすると天地の帯も奥付もカセットの段とぴったり揃う。
 */
type Tier = { cols: number; scale: number; pad: number; gutter: number };
type Layout = Tier & { logo: number; sheet: number };

const TIERS: Array<[number, Tier]> = [
  // 段間はカセット幅の15%弱。ここを詰めると16本が「表」に見えてしまう。
  // しきい値は「紙の幅＋机が見える余白」で決める（紙が画面いっぱいだと図録に見えない）
  [1344, { cols: 4, scale: 3, pad: 28, gutter: 40 }],
  [1024, { cols: 3, scale: 3, pad: 28, gutter: 40 }],
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
  const { cols, scale, logo, pad, gutter, sheet } = useLayout();
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
          <span className="k12">随時更新</span>
        </span>
      </div>

      {/* ── 見出し ─────────────────────────────── */}
      <header className="masthead">
        <div className="mast-logo">
          <h1 className="vh">ふりっぷ 一覧 — 株式会社こす.くま</h1>
          <Wordmark scale={logo} />
          <p className="mast-sub">
            {/* 「ふりっぷ」は FLIP の一種、という言い切り。
                FLIP だけ欧文のドット書体にして、外来の語だと見せる。 */}
            <span className="mast-sub-jp">ふりっぷとは</span>
            <span className="en">FLIP</span>
            <span className="mast-sub-jp">の一種。</span>
          </p>
        </div>

      </header>

      <Definition />

      {/* ── 目次 ───────────────────────────────── */}
      <section className="toc">
        <div className="band">
          <span className="band-en en">CONTENTS</span>
          <span className="band-n en">
            001 &ndash; {String(FLIPS.length).padStart(3, "0")}
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
}: {
  flip: Flip;
  n: number;
  scale: number;
}) {
  const swatch = LABELS[flip.slug]?.swatch ?? [];
  // 見せ方は「いま遊べるか」の二択だけにする。
  // 完成／制作中／構想の区別は棚の上では意味を持たないので、まとめて COMING SOON。
  const live = flip.status === "released" && Boolean(flip.url);

  /**
   * 図版がまず来て、そのあとに札（キャプション）が続く。
   * 札はぜんぶ薄い墨で組み、和名だけを本墨にする。
   * カセットの上には何も置かない。上の余白はカセットのためのもの。
   */
  const body = (
    <>
      <div className="cell-cart">
        <Cartridge flip={flip} scale={scale} animate soon={!live} />
      </div>

      {/* 色玉は図版の直下・左そろえ。カセットの持ち色をそのまま拾う */}
      <div className="dots" aria-hidden>
        {swatch.slice(0, 5).map((c, k) => (
          <span className="dot" key={k} style={{ background: c }} />
        ))}
      </div>

      <div className="cap">
        <div className="cell-head">
          <span className="cell-no en">{String(n).padStart(2, "0")}</span>
          <span className="cell-code en">{flip.code}</span>
        </div>

        <h3 className="ttl">{flip.title}</h3>
        <p className="romaji">{flip.romaji}</p>
        {flip.desc ? (
          <p className="dsc">{flip.desc}</p>
        ) : (
          <p className="dsc dsc-blank" aria-label="内容は未記入" />
        )}
      </div>
    </>
  );

  return (
    <li
      className={`cell${live ? "" : " is-soon"}`}
    >
      {live ? (
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
