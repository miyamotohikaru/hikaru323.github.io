import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";
import { rng } from "../gfx";

// 存在しない言葉辞典 / FICTIONARY。世の中にない言葉だけが載っている辞書。
//
// 図の骨組み: ラベル全面がえんじの表紙で、真ん中の窓から見開きが見えている。
//   外  = 布装の表紙。下端に金の箔押しで題名
//   中  = ゆるく反った紙面。喉（のど）の影で2ページに分かれる
//   紙面= 各ページの頭に読める見出し語をひとつ。その下は二段組の
//         1px の帯（＝読めなくていい語釈）と、木版の図がひとつ。
// 動くもの: 右ページ右段の末尾に、新しい見出し語が1行ぶん増える。

// ── 発行元の印 ──────────────────────────────────────────
// 16枚すべて同じ意匠・同じ位置・同じ大きさ。右下の隅に 5x5 のくまの顔。
const MARK = ["#...#", ".###.", "#####", "#o#o#", ".#o#."];
function mark(g: PixelGfx, body: string, eye: string) {
  g.blit(61, 33, MARK, { "#": body, o: eye });
}

const PAPER = "#f0e6cc";
const PAPER_HI = "#faf3e0";
const PAPER_DK = "#d8caa6";
const STACK1 = "#c6b58a";
const STACK2 = "#9c8964";
const INK = "#2b2118";
const SOFT = "#6e6250";
const FAINT = "#a2947c";
const COVER = "#8c2434";
const COVER_LT = "#a63a48";
const COVER_DK = "#521018";
const GOLD = "#d8a83c";
const RED = "#c8203c";

const SPINE = 33.5;
const HALF = 30.5;
/** 開いた紙の反り。喉に近いほど2px下がる */
const bow = (x: number) => {
  const d = (x - SPINE) / HALF;
  return Math.round((1 - d * d) * 2);
};

export const art: LabelArt = {
  slug: "words",
  swatch: [COVER, GOLD, PAPER, INK, RED],

  draw: (g, t) => {
    // ── 表紙 ─────────────────────────────────────────────
    g.rect(0, 0, 68, 40, COVER);
    g.noise(1, 1, 66, 38, "#7a1c2a", 0.16, 991); // 布装の目
    g.noise(1, 1, 66, 38, "#9c3040", 0.08, 55);
    g.hline(1, 1, 66, COVER_LT);
    g.vline(1, 1, 38, COVER_LT);
    g.hline(1, 38, 66, COVER_DK);
    g.vline(66, 1, 38, COVER_DK);

    // ── 紙面 ─────────────────────────────────────────────
    for (let x = 3; x <= 64; x++) {
      const b = bow(x);
      const top = 3 + b;
      const bot = 33 - b;
      g.vline(x, top, bot - top + 1, PAPER);
      g.px(x, top, PAPER_HI); // 天は光を受ける
      g.px(x, bot, PAPER_DK);
      g.px(x, bot + 1, STACK1); // 小口に見える紙の束
      g.px(x, bot + 2, STACK2);
    }
    // 喉の影
    for (const [x, c] of [
      [32, "#e0d3b1"],
      [33, "#bfae87"],
      [34, "#9c8a66"],
      [35, "#d2c4a1"],
    ] as Array<[number, string]>) {
      const b = bow(x);
      g.vline(x, 3 + b, 31 - 2 * b, c);
    }

    // ── 段組 ─────────────────────────────────────────────
    // 見出し語は2pxの帯、語釈は1pxの帯。読ませないのが本式。
    const column = (
      cx: number,
      cw: number,
      y0: number,
      y1: number,
      seed: number,
    ) => {
      const r = rng(seed);
      let y = y0;
      let since = 9;
      while (y <= y1) {
        if (since >= 2 && r() < 0.5) {
          const w = 4 + Math.floor(r() * 4);
          g.rect(cx, y, w, 2, INK);
          g.hline(cx + w + 2, y + 1, Math.min(3, cw - w - 2), FAINT); // 読み
          y += 3;
          since = 0;
        } else {
          const ind = since === 0 ? 2 : 0;
          const full = cw - ind;
          const w =
            since >= 2 && r() < 0.5
              ? Math.max(4, Math.floor(full * 0.55))
              : full;
          g.hline(cx + ind, y, w, SOFT);
          y += 2;
          since++;
        }
      }
    };

    // 左ページ
    g.text3x5(5, 6, "SOREBI", INK);
    g.hline(5, 12, 26, FAINT);
    // 外の段は木版の図で切れる。内の段は紙の下端まで流す
    column(5, 12, 14, 18, 3301);
    column(19, 12, 14, 30, 3307);

    // ── 語釈にはさまった木版の図 ─────────────────────────
    // 鍵に見えるが、鍵ではない。何を開けるためのものかは書かれていない。
    // 存在しない言葉の図なので、分からないのが正しい。
    g.rect(5, 20, 13, 7, PAPER_HI);
    g.frame(5, 20, 13, 7, INK);
    g.rect(6, 21, 11, 5, PAPER);
    g.blit(
      6,
      21,
      [".##........", "#..#.......", "#..########", "#..#....#.#", ".##.....#.."],
      { "#": INK },
    );
    g.px(8, 22, FAINT); // 彫りの中の白
    g.px(15, 24, SOFT);
    g.text3x5(4, 28, "128", FAINT); // ノンブル

    // 右ページ
    g.text3x5(36, 6, "TOKEBI", INK);
    g.hline(36, 12, 26, FAINT);
    column(36, 12, 14, 30, 3313);
    column(50, 12, 14, 23, 3319); // ここだけ末尾が空いている
    g.text3x5(63 - g.text3x5Width("129"), 28, "129", FAINT);

    // ── 動くもの: 新しい見出し語が1つ載る ────────────────
    if (t >= 0.5) {
      g.rect(50, 25, 6, 2, INK);
      g.hline(58, 26, 3, FAINT);
      g.px(48, 25, GOLD); // 追加された印
      g.px(48, 26, RED);
    }

    // ── しおり ───────────────────────────────────────────
    // 表紙の下端より先には出さない。題字の上を横切ると字が読めなくなる。
    g.rect(33, 28, 2, 6, RED);
    g.vline(33, 28, 6, "#e8506c");
    g.px(34, 33, "#8c0c24");

    // ── 表紙の下端。ここに金の箔押しで題名が入る ─────────
    // ラベル全面が表紙で、真ん中の窓から見開きが見えている、という組み方。
    g.rect(1, 33, 66, 6, COVER);
    g.noise(1, 33, 66, 6, "#7a1c2a", 0.16, 992);
    g.noise(1, 33, 66, 6, "#9c3040", 0.07, 57);
    g.hline(1, 33, 66, COVER_DK);
    g.hline(1, 34, 66, COVER_LT, "half");
    g.text3x5(4, 34, "FICTIONARY", GOLD);
    g.px(46, 36, GOLD);
    g.px(48, 36, GOLD);

    // ── 外枠 ─────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。金の小口に見立てる。
    g.frame(0, 0, 68, 40, GOLD);
    mark(g, GOLD, COVER);
  },
};
