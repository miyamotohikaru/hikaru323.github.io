import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";

// インスタント人助け — 半径500m・10分以内。報酬もポイントもない。
// 実物は地図アプリ。近くで上がった「助けて」に、となりさんが駆けつける。
// 絵にするのは駆けつける瞬間。夕方の町、赤いピン、地面に落ちた 500m の輪、
// その輪の内側を走ってくるこすくま。

const INK = "#2a1710";
const INK2 = "#5a3218";

const SKY0 = "#fdf1cc";
const SKY1 = "#fce3a4";
const SKY2 = "#f9c874";
const SKY3 = "#f4a54c";
const SKY4 = "#ee8a3a";
const SUN = "#ffe07a";
const SUN2 = "#fff8d2";

const BLD = "#a94d28";
const BLD_D = "#77341a";
const BLD_L = "#c56438";
const WIN = "#ffdc82";
const WIN_D = "#a2591f";

const GND = "#ac8f6d";
const GND_D = "#8a7053";
const GND_L = "#cdb591";
const CURB = "#6a533a";

const FUR = "#f8efc6";
const FUR_S = "#dcc290";
const FUR_H = "#fffceb";

const RED = "#d92c14";
const RED_D = "#8f1408";
const RED_L = "#f2705a";
const CREAM = "#f6e9c8";

// ── 和文の題字 ──────────────────────────────────────────
// 書体から起こした字母は「インクの外接矩形」で返ってくるので、
// 「ー」のように中ほどだけに墨のある字は行の上端に貼りついてしまう。
// 16px の枡の中に据え直すための落とし幅。
const JP_DROP: Record<string, number> = { ー: 7, 一: 7, ッ: 3, ェ: 5, の: 2, る: 2 };
function jp(g: PixelGfx, x: number, y: number, s: string, c: string, sp = 0) {
  let cx = x;
  for (const ch of s) {
    g.textJP(cx, y + (JP_DROP[ch] ?? 0), ch, c);
    cx += 16 + sp;
  }
}
/** 8方向にふちを回してから塗る。夕空の上でも字が沈まない。 */
function jpEdge(
  g: PixelGfx,
  x: number,
  y: number,
  s: string,
  fill: string,
  edge: string,
  sp = 0,
) {
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
    jp(g, x + dx, y + dy, s, edge, sp);
  jp(g, x, y, s, fill, sp);
}

// こすくま。手前の腕だけ別にして、差し出す動きを付ける。
const BEAR = [
  ".KKKK...KKKK......",
  "KBBBBK.KBBBBK.....",
  "KBBBBK.KBBBBK.....",
  "KBHHHBKBBBBBK.....",
  "KHHHBBBBBBBBK.....",
  "KHHBBBBBBBBSK.....",
  "KBBKBBBBBKBSK.....",
  "KBBBBBBBBBSSK.....",
  "KBBBBKKKBBSSK.....",
  ".KBBBBBBSSSK......",
  "..KBBBBBBBK.......",
  "...KBBBBBK........",
  "..KBBBBBBBKK......",
  ".KHHHBBBBBBBK.....",
  ".KHHBBBBBBBSK.....",
  ".KHBBBBBBSSSK.....",
  ".KBBBSSSSSSBK.....",
  "..KBBKKKBBBK......",
  "..KKK...KKKK......",
];
const ARM = ["..KKK.", ".KBBBK", "KBBBBK", "KBHBBK", ".KKKK."];
const FURPAL = { K: INK, B: FUR, H: FUR_H, S: FUR_S };

// 助けを求めている人。片手を挙げている。
const PERSON = [
  "...KKK...",
  "..KSSSK..",
  "..KSNSK..",
  "..KSSSK..",
  "...KKK...",
  "KK..KCK..",
  "KSKKCCCK.",
  ".KKCCCCK.",
  "..KCCCDK.",
  "..KCDDDK.",
  "..KTTTK..",
  "..KTK.KTK",
  "..KKK.KKK",
];
const CASE = [".KKKK.", "KLLLLK", "KMMMMK", "KBBBBK", "KBBBBK", "KKKKKK"];

// ── 発行元の印 ──────────────────────────────────────────
// 16枚すべて同じ意匠・同じ位置・同じ大きさ。右下の隅に 5x5 のくまの顔。
const MARK = ["#...#", ".###.", "#####", "#o#o#", ".#o#."];
function mark(g: PixelGfx, body: string, eye: string) {
  g.blit(61, 33, MARK, { "#": body, o: eye });
}

export const art: LabelArt = {
  slug: "hitodasuke",
  swatch: ["#f4a54c", "#d92c14", "#f8efc6", "#2a1710", "#c8b298"],
  draw: (g, t) => {
    const hand = t < 0.5 ? 0 : 1;

    // ── 空 ────────────────────────────────────────────────
    g.rect(0, 0, 68, 22, SKY0);
    g.rect(0, 5, 68, 17, SKY1);
    g.rect(0, 5, 68, 3, SKY0, "half");
    g.rect(0, 11, 68, 11, SKY2);
    g.rect(0, 11, 68, 3, SKY1, "half");
    g.rect(0, 16, 68, 6, SKY3);
    g.rect(0, 16, 68, 2, SKY2, "half");
    g.rect(0, 20, 68, 2, SKY4);
    g.rect(0, 20, 68, 1, SKY3, "half");

    // 夕方の太陽
    g.disc(9, 6, 5, SUN);
    g.disc(8, 5, 3, SUN2);
    g.hline(15, 3, 2, SUN);
    g.hline(16, 7, 3, SUN);
    g.hline(1, 13, 3, SUN);
    g.hline(9, 14, 2, SUN);
    g.px(2, 1, SUN);
    g.px(15, 11, SUN);

    // 鳥
    g.px(46, 3, INK2);
    g.px(47, 2, INK2);
    g.px(48, 3, INK2);
    g.px(41, 6, INK2);
    g.px(42, 5, INK2);
    g.px(43, 6, INK2);

    // ── 町なみ ────────────────────────────────────────────
    const blds: Array<[number, number, number]> = [
      [0, 15, 7],
      [6, 12, 8],
      [13, 16, 6],
      [18, 13, 9],
      [26, 17, 7],
      [32, 14, 8],
      [39, 16, 6],
      [44, 12, 9],
      [52, 15, 7],
      [58, 13, 10],
    ];
    for (const [bx, by, bw] of blds) {
      const h = 22 - by;
      g.rect(bx, by, bw, h, BLD);
      g.vline(bx, by, h, BLD_L);
      g.vline(bx + bw - 1, by, h, BLD_D);
      g.hline(bx, by, bw, BLD_D);
      g.hline(bx + 1, by + 1, bw - 2, BLD_L);
      for (let wy = by + 3; wy < 21; wy += 3)
        for (let wx = bx + 2; wx < bx + bw - 1; wx += 2)
          g.px(wx, wy, (wx * 7 + wy * 3) % 5 === 0 ? WIN_D : WIN);
    }
    // 電柱と電線
    g.vline(30, 10, 12, INK2);
    g.hline(28, 12, 5, INK2);
    g.line(31, 13, 67, 10, INK2);
    g.line(0, 11, 29, 13, INK2);

    // ── 地面 ──────────────────────────────────────────────
    g.rect(0, 22, 68, 11, GND);
    g.hline(0, 22, 68, CURB);
    g.hline(0, 23, 68, GND_L);
    g.hline(0, 24, 68, "#bda07c");
    g.rect(0, 28, 68, 5, GND_D);
    g.hline(0, 28, 68, CURB);
    g.hline(0, 29, 68, "#9c8265");
    // 舗石の目地
    for (let x = 1; x < 68; x += 7) g.vline(x, 25, 3, "#96795a");
    for (let x = 4; x < 68; x += 9) g.vline(x, 30, 3, "#755c40");
    // マンホール
    g.ellipse(30, 26, 3, 1, "#6a533a");
    g.px(29, 26, GND_L);
    g.px(31, 26, GND_L);

    // 半径 500m の輪。この内側にいるふたりが、つながる。
    groundRing(g, 33, 27, 34, 4, "#fff6dc", "#5c4630");

    // 走ってきた足あと。こすくまから、助けを求めた人へ続く。
    for (let i = 0; i < 5; i++) {
      const x = 25 + i * 4;
      const y = 31 - (i % 2) * 2;
      g.px(x, y, "#6a533a");
      g.px(x + 1, y, "#6a533a");
      g.px(x, y - 1, "#6a533a");
      g.px(x + 1, y + 1, "#8a7053");
    }

    // 街かどの案内標識。地図アプリの絵なので、方角の板を立てる。
    g.vline(36, 22, 11, "#4a3a2a");
    g.vline(37, 22, 11, "#7a6448");
    g.hline(34, 32, 5, "#4a3a2a");
    g.rect(29, 15, 14, 7, "#2a1710");
    g.rect(30, 16, 12, 5, "#2f5a9e");
    g.hline(30, 16, 12, "#4a7cc4");
    g.hline(31, 20, 10, "#1e3c70");
    g.rect(31, 18, 4, 1, CREAM);
    g.px(31, 17, "#a8c4e8");
    g.px(33, 17, "#a8c4e8");
    // 右をさす矢印
    g.hline(36, 18, 4, CREAM);
    g.px(38, 17, CREAM);
    g.px(38, 19, CREAM);
    g.px(39, 18, CREAM);

    // 消火栓
    g.rect(25, 27, 4, 6, "#8f1408");
    g.rect(26, 28, 2, 5, RED);
    g.px(26, 28, RED_L);
    g.hline(24, 29, 6, "#8f1408");
    g.hline(25, 26, 2, "#8f1408");
    g.hline(24, 33, 6, "#5a2510");

    // ── 助けを求める人と荷物 ─────────────────────────────
    g.ellipse(52, 32, 5, 1, "#00000038");
    g.ellipse(61, 32, 3, 1, "#00000038");
    g.blit(48, 20, PERSON, {
      K: INK,
      S: "#f2b98a",
      N: "#c98a5e",
      C: "#3f74b8",
      D: "#2b4f86",
      T: "#3a3a4a",
    });
    g.blit(58, 27, CASE, { K: INK, B: "#a8641f", L: "#d59a4a", M: "#f0c070" });
    g.px(60, 26, INK);
    g.px(61, 26, INK);

    // ── 赤いピン ──────────────────────────────────────────
    // 合図は輪になって外へ広がる（この絵で動くのはここだけ）
    for (let k = 0; k < 3; k++) {
      const p = (t + k / 3) % 1;
      const r = 8 + Math.floor(p * 5);
      const c = p < 0.4 ? RED : p < 0.75 ? RED_L : "#f9c2b2";
      for (let a = -62; a <= 62; a += 7) {
        const rad = (a * Math.PI) / 180;
        g.px(57 + Math.round(Math.sin(rad) * r), 8 - Math.round(Math.cos(rad) * r), c);
      }
    }

    g.poly(
      [
        [50, 10],
        [64, 10],
        [57, 19],
      ],
      INK,
    );
    g.disc(57, 8, 6, INK);
    g.poly(
      [
        [51, 10],
        [63, 10],
        [57, 17],
      ],
      RED,
    );
    g.disc(57, 8, 5, RED);
    g.disc(55, 6, 2, RED_L);
    g.px(54, 5, "#ffc8b8");
    g.rect(52, 11, 11, 3, RED_D, "half");
    // ピンの中の「!」
    g.vline(57, 5, 4, CREAM);
    g.px(57, 10, CREAM);

    // ── こすくま。駆けつける。 ───────────────────────────
    g.ellipse(13, 33, 8, 1, "#00000040");
    g.blit(5, 15, BEAR, FURPAL);
    g.blit(16, 27 - hand, ARM, FURPAL);
    // ほお
    g.px(6, 22, "#f2a68c");
    g.px(7, 22, "#f2a68c");
    g.px(14, 22, "#f2a68c");
    // 走っている砂ぼこり
    g.px(2, 32, GND_L);
    g.px(3, 31, "#ffffff");
    g.px(0, 30, GND_L);

    // ── 題字 ──────────────────────────────────────────────
    // 実機の作法どおり、夕空に大きく。こすくまの耳の上を堂々と横切らせる。
    // 赤にクリームのふちを回す。夕焼けのどの段の上でも字が沈まない組み合わせ。
    jpEdge(g, 3, 2, "人助け", RED, CREAM);

    // ── 下の帯 ────────────────────────────────────────────
    // 型番は外装の下帯に刻印されているので、ラベルには入れない。
    // 性能の表記だけを、右端まで詰めずに置く。
    g.rect(0, 33, 68, 7, INK);
    g.hline(0, 33, 68, INK2);
    g.hline(0, 34, 68, "#6b3c1c", "half");
    g.text3x5(2, 34, "500M 10MIN", CREAM);

    // ── ふち ──────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。
    g.frame(0, 0, 68, 40, INK);
    mark(g, CREAM, INK);
  },
};

/** 地面に置いた輪。透視で潰れた楕円を破線で。 */
function groundRing(
  g: PixelGfx,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  c: string,
  cs: string,
) {
  for (let x = -rx; x <= rx; x++) {
    const k = 1 - (x * x) / (rx * rx);
    if (k < 0) continue;
    const dy = Math.round(ry * Math.sqrt(k));
    if ((((x + 100) / 2) | 0) % 2 === 0) {
      g.px(cx + x, cy + dy, c);
      g.px(cx + x, cy + dy + 1, cs);
      g.px(cx + x, cy - dy, c);
      g.px(cx + x, cy - dy + 1, cs);
    }
  }
}
