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

// ── 発行元の印 ──────────────────────────────────────────
// 16枚すべて同じ意匠・同じ位置・同じ大きさ。右下の隅に 5x5 のくまの顔。
const MARK = ["#...#", ".###.", "#####", "#o#o#", ".#o#."];
function mark(g: PixelGfx, body: string, eye: string) {
  g.blit(61, 33, MARK, { "#": body, o: eye });
}

// ── 和文の題字 ──────────────────────────────────────────
// 書体から起こした字母は「インクの外接矩形」で返ってくるので、
// 「一」のように中ほどだけに墨のある字は行の上端に貼りついてしまう。
// 16px の枡の中に据え直すための落とし幅。
const JP_DROP: Record<string, number> = { ー: 7, 一: 7, ッ: 3, ェ: 5, の: 2, る: 2 };
function jp(g: PixelGfx, x: number, y: number, s: string, c: string) {
  let cx = x;
  for (const ch of s) {
    g.textJP(cx, y + (JP_DROP[ch] ?? 0), ch, c);
    cx += 16;
  }
}

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

    // ── 題字 ─────────────────────────────────────────────
    // 実機の作法どおり、上の16行をまるごと題字に使う。
    // そのぶん標本箱は1段になった。「上下で成り立たない対」は諦めて、
    // 「左右で相容れない対」だけを残す。器の話なので、段が減っても嘘にはならない。
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const)
      jp(g, 3 + dx, 2 + dy, "価値観", "#14092a");
    jp(g, 3, 2, "価値観", CREAM);

    // 分類の色玉。6つに分けたつもりが、下でひと組にまとまってしまう図。
    const CHIPS = [CREAM, CYAN, ORANGE, GREEN, RED, MAGENTA];
    CHIPS.forEach((c, i) => {
      const x = 52 + (i % 2) * 7;
      const y = 3 + Math.floor(i / 2) * 4;
      g.rect(x, y, 5, 3, c);
      g.px(x, y, "#ffffff");
      g.px(x + 4, y + 2, SHADOW);
    });
    g.hline(52, 15, 12, BRASS);
    g.px(51, 15, BRASS_DK);
    g.px(64, 15, BRASS_DK);

    // ── 標本箱 ─────────────────────────────────────────────
    const CX = 3;
    const CY = 19;
    const CW = 62;
    const CH = 19;
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

    // マスの通し番号。中身が無くても番号だけは先に振ってある、という体。
    for (const [nx, ny, s] of [
      [5, 21, "1"],
      [20, 21, "2"],
      [51, 21, "3"],
    ] as Array<[number, number, string]>)
      g.text3x5(nx, ny, s, "#6b4f18");

    // ── 標本 ───────────────────────────────────────────────
    // 左右は必ず対。同じ棚で相容れないものを向かい合わせる。
    pin(g, 10, 21, 3);
    specimen(g, "disc", 10, 28, CREAM);
    tag(g, 6, 32);

    // 動き: このマスだけ標本が入れ替わる。差し替えの一瞬は空になる。
    pin(g, 25, 21, 2);
    const phase = t % 1;
    if (phase < 0.44) specimen(g, "down", 25, 28, ORANGE);
    else if (phase > 0.56) specimen(g, "square", 25, 28, MAGENTA);
    else {
      // 差し替えの一瞬。空いた枠だけが破線で残る。
      g.hline(21, 24, 9, "#6a5020", "vstripe");
      g.hline(21, 32, 9, "#6a5020", "vstripe");
      g.vline(21, 24, 9, "#6a5020", "hstripe");
      g.vline(29, 24, 9, "#6a5020", "hstripe");
      g.px(25, 26, BRASS_LT);
    }
    tag(g, 21, 32);

    pin(g, 56, 21, 2);
    specimen(g, "plus", 56, 28, GREEN);
    tag(g, 52, 32);

    // ── 中央：どちらとも決まらない標本 ─────────────────────
    // 左半分は地に図、右半分は図に地。同じものが同時に二通りある。
    const bx = 34;
    const by = 21;
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
    const ay = 35;
    g.hline(34, ay, 5, GOLD);
    g.px(37, ay - 1, GOLD);
    g.px(37, ay + 1, GOLD);
    g.hline(42, ay, 5, CYAN);
    g.px(43, ay - 1, CYAN);
    g.px(43, ay + 1, CYAN);
    g.px(40, ay - 1, "#ffffff");
    g.px(41, ay + 1, "#ffffff");

    // ── ガラス ─────────────────────────────────────────────
    // 斜めの照りを2本。標本箱がガラス越しであることだけ伝える。
    g.poly(
      [
        [7, 36],
        [16, 20],
        [22, 20],
        [13, 36],
      ],
      "#dbe8ff16",
    );
    g.poly(
      [
        [26, 36],
        [35, 20],
        [37, 20],
        [28, 36],
      ],
      "#dbe8ff14",
    );

    // ── 枠 ─────────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。標本箱の真鍮の縁は絵の側の線。
    g.frame(0, 0, 68, 40, BRASS);
    mark(g, BRASS_LT, EDGE);
  },
};
