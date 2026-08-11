import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";

// 価値観一覧図鑑。まだ構想しかない企画。
//
// 中身が無いので、中身のふりはしない。描くのは「器」だけ ——
// 標本箱、仕切り、留めピン、無記名の名札、そして上に載る分類表。
// 核は「相容れないものが同じ棚に並んでいる」こと。だから左右は必ず対にして、
// 中央の背の高いマスには、半分が地で半分が図の、どちらとも決まらない標本を据える。
// 具体的な価値観の言葉はひとつも書かない（書いたら嘘になる）。

const EDGE = "#150c26";
const FELT = "#241540";
const FELT_LT = "#2e1c50";
const FELT_DK = "#190e30";
const BRASS = "#c39a45";
const BRASS_DK = "#7a5a1c";
const BRASS_LT = "#e7c473";
const CREAM = "#efe4c2";
const CARD = "#ddd0ac";
const CARD_DK = "#a2946f";
const INK = "#3a2f18";
const SHADOW = "#170e2a";

const CYAN = "#45c8d8";
const ORANGE = "#e8853a";
const GREEN = "#5cc46a";
const RED = "#e0475a";
const MAGENTA = "#d060b0";
const GOLD = "#f0c64a";

/** 留めピン。標本は必ずこれで刺してある。 */
function pin(g: PixelGfx, x: number, top: number, len: number) {
  g.vline(x, top, len, BRASS_DK);
  g.vline(x, top, len - 1, BRASS);
  g.px(x, top, BRASS_LT);
  g.px(x + 1, top + 1, SHADOW);
}

/** 無記名の名札。文字は打たず、刻みだけ入れる。 */
function tag(g: PixelGfx, x: number, y: number, w = 7) {
  g.rect(x + 1, y + 1, w, 3, SHADOW);
  g.rect(x, y, w, 3, CARD);
  g.hline(x, y, w, "#f2e8cc");
  g.hline(x + 1, y + 1, w - 3, INK, "vstripe");
  g.hline(x + 1, y + 2, w - 5, CARD_DK, "vstripe");
}

/** 標本ひとつ。kind ごとに図形を変える。落ち影を必ず先に置く。 */
function specimen(g: PixelGfx, kind: string, cx: number, cy: number, c: string) {
  const S = (fn: (dx: number, dy: number, col: string) => void) => {
    fn(1, 1, SHADOW);
    fn(0, 0, c);
  };
  switch (kind) {
    case "disc":
      S((dx, dy, col) => g.disc(cx + dx, cy + dy, 3, col));
      g.px(cx - 1, cy - 2, "#ffffff");
      break;
    case "ring":
      S((dx, dy, col) => g.ring(cx + dx, cy + dy, 3, col, 1));
      g.px(cx - 1, cy - 3, "#ffffff");
      break;
    case "up":
      S((dx, dy, col) =>
        g.poly(
          [
            [cx + dx, cy - 3 + dy],
            [cx + 4 + dx, cy + 3 + dy],
            [cx - 4 + dx, cy + 3 + dy],
          ],
          col,
        ),
      );
      break;
    case "down":
      S((dx, dy, col) =>
        g.poly(
          [
            [cx - 4 + dx, cy - 3 + dy],
            [cx + 4 + dx, cy - 3 + dy],
            [cx + dx, cy + 3 + dy],
          ],
          col,
        ),
      );
      break;
    case "plus":
      S((dx, dy, col) => {
        g.rect(cx - 3 + dx, cy - 1 + dy, 7, 3, col);
        g.rect(cx - 1 + dx, cy - 3 + dy, 3, 7, col);
      });
      break;
    case "bar":
      S((dx, dy, col) => g.rect(cx - 3 + dx, cy - 1 + dy, 7, 3, col));
      break;
    case "square":
      S((dx, dy, col) => g.rect(cx - 3 + dx, cy - 3 + dy, 7, 7, col));
      g.hline(cx - 3, cy - 3, 7, "#ffffff");
      break;
  }
}

export const art: LabelArt = {
  slug: "values",
  swatch: ["#241540", "#c39a45", "#efe4c2", "#45c8d8", "#e8853a"],
  draw: (g, t) => {
    // ── 地 ─────────────────────────────────────────────────
    g.rect(0, 0, 68, 40, FELT);
    g.noise(2, 2, 64, 36, FELT_LT, 0.14, 5501);
    g.noise(2, 2, 64, 36, FELT_DK, 0.1, 8812);

    // ── 上の分類表 ─────────────────────────────────────────
    // 6つに分けたつもりが、下でひと組にまとまってしまう図。
    // 標題は字間を空けて黒で縁取る。真鍮の枠に負けない重さにする。
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ])
      g.text3x5(4 + dx, 2 + dy, "VALUES", "#14092a", 2);
    g.text3x5(4, 2, "VALUES", CREAM, 2);
    g.hline(4, 8, 26, BRASS_DK);
    g.px(31, 8, BRASS);

    const CHIPS = [CREAM, CYAN, ORANGE, GREEN, RED, MAGENTA];
    CHIPS.forEach((c, i) => {
      const x = 34 + i * 5;
      g.rect(x, 2, 3, 3, c);
      g.px(x, 2, "#ffffff");
      g.px(x + 2, 4, SHADOW);
      g.vline(x + 1, 5, 2, BRASS_DK);
    });
    g.hline(35, 7, 28, BRASS);
    g.px(34, 7, BRASS_DK);
    g.px(63, 7, BRASS_DK);
    g.vline(49, 8, 1, BRASS);

    // ── 標本箱 ─────────────────────────────────────────────
    const CX = 3;
    const CY = 9;
    const CW = 62;
    const CH = 28;
    g.rect(CX, CY, CW, CH, FELT_DK);
    g.frame(CX, CY, CW, CH, BRASS);
    g.hline(CX + 1, CY, CW - 2, BRASS_LT);
    g.hline(CX + 1, CY + CH - 1, CW - 2, BRASS_DK);
    g.vline(CX + CW - 1, CY + 1, CH - 2, BRASS_DK);
    // 内側の落ち影。ガラスの下に一段沈んで見えるように。
    g.rect(CX + 1, CY + 1, CW - 2, CH - 2, FELT);
    g.hline(CX + 1, CY + 1, CW - 2, "#1a0f30");
    g.vline(CX + 1, CY + 1, CH - 2, "#1a0f30");
    g.hline(CX + 1, CY + CH - 2, CW - 2, "#31205c");
    g.noise(CX + 2, CY + 2, CW - 4, CH - 4, FELT_LT, 0.1, 3391);

    // 仕切り。等間隔にしない。標本箱は入るものに合わせて割るものなので。
    for (const dx of [18, 32, 48]) {
      g.vline(dx, CY + 1, CH - 2, BRASS_DK);
      g.vline(dx + 1, CY + 1, CH - 2, "#452f10");
      g.vline(dx, CY + 1, CH - 3, BRASS);
    }
    // 横の仕切りは真ん中の列だけ通さない。中央が背の高い1マスになる。
    for (const [x0, w] of [
      [4, 14],
      [19, 13],
      [50, 14],
    ]) {
      g.hline(x0, 23, w, BRASS_DK);
      g.hline(x0, 22, w, "#3a2410");
      g.hline(x0, 24, w, "#452f10");
    }

    // マスの通し番号。中身が無くても番号だけは先に振ってある、という体。
    for (const [nx, ny, s] of [
      [5, 11, "1"],
      [5, 25, "2"],
      [20, 11, "3"],
      [20, 25, "4"],
      [51, 11, "5"],
      [51, 25, "6"],
    ] as Array<[number, number, string]>)
      g.text3x5(nx, ny, s, "#6b4f18");

    // ── 標本 ───────────────────────────────────────────────
    // 左右は必ず対。上と下で成り立たないものを並べる。
    pin(g, 10, 11, 3);
    specimen(g, "disc", 10, 17, CREAM);
    tag(g, 6, 20);

    pin(g, 10, 25, 2);
    specimen(g, "ring", 10, 30, CREAM);
    tag(g, 6, 34);

    pin(g, 25, 11, 2);
    specimen(g, "up", 25, 17, CYAN);
    tag(g, 21, 20);

    // 動き: このマスだけ標本が入れ替わる。差し替えの一瞬は空になる。
    pin(g, 25, 25, 2);
    const phase = t % 1;
    if (phase < 0.44) specimen(g, "down", 25, 30, ORANGE);
    else if (phase > 0.56) specimen(g, "square", 25, 30, MAGENTA);
    else {
      // 差し替えの一瞬。空いた枠だけが破線で残る。
      g.hline(21, 26, 9, "#6a5020", "vstripe");
      g.hline(21, 34, 9, "#6a5020", "vstripe");
      g.vline(21, 26, 9, "#6a5020", "hstripe");
      g.vline(29, 26, 9, "#6a5020", "hstripe");
      g.px(25, 28, BRASS_LT);
    }
    tag(g, 21, 34);

    pin(g, 56, 11, 2);
    specimen(g, "plus", 56, 17, GREEN);
    tag(g, 52, 20);

    pin(g, 56, 25, 2);
    specimen(g, "bar", 56, 30, RED);
    tag(g, 52, 34);

    // ── 中央：どちらとも決まらない標本 ─────────────────────
    // 左半分は地に図、右半分は図に地。同じものが同時に二通りある。
    const bx = 34;
    const by = 12;
    g.rect(bx + 1, by + 1, 13, 13, SHADOW);
    for (let j = 0; j < 13; j++)
      for (let i = 0; i < 13; i++) {
        const dx = i - 6;
        const dy = j - 6;
        const inDisc = dx * dx + dy * dy <= 18;
        g.px(bx + i, by + j, inDisc !== i >= 7 ? CREAM : "#17102a");
      }
    g.frame(bx, by, 13, 13, BRASS_DK);
    g.px(bx + 6, by, BRASS);
    pin(g, bx + 6, by - 2, 2);

    // 対になる矢印。噛み合わないまま向かい合っている。
    const ay = 28;
    g.hline(34, ay, 6, GOLD);
    g.px(38, ay - 1, GOLD);
    g.px(38, ay + 1, GOLD);
    g.px(37, ay - 2, GOLD);
    g.px(37, ay + 2, GOLD);
    g.hline(42, ay, 6, CYAN);
    g.px(43, ay - 1, CYAN);
    g.px(43, ay + 1, CYAN);
    g.px(44, ay - 2, CYAN);
    g.px(44, ay + 2, CYAN);
    g.px(40, ay - 1, "#ffffff");
    g.px(41, ay + 1, "#ffffff");
    tag(g, 36, 32, 9);

    // ── ガラス ─────────────────────────────────────────────
    // 斜めの照りを2本。標本箱がガラス越しであることだけ伝える。
    g.poly(
      [
        [5, 35],
        [15, 10],
        [21, 10],
        [11, 35],
      ],
      "#dbe8ff16",
    );
    g.poly(
      [
        [24, 35],
        [34, 10],
        [36, 10],
        [26, 35],
      ],
      "#dbe8ff14",
    );

    // ── 枠 ─────────────────────────────────────────────────
    g.frame(1, 1, 66, 38, BRASS_DK);
    g.frame(0, 0, 68, 40, EDGE);
    g.px(1, 1, BRASS_LT);
    g.px(66, 1, BRASS_LT);
    g.px(1, 38, BRASS_LT);
    g.px(66, 38, BRASS_LT);
  },
};
