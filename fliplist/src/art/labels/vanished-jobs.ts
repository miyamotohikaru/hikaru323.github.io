import type { LabelArt } from "./types";
import { rng } from "../gfx";
import type { PixelGfx } from "../gfx";

// 消えた職業図鑑 — 151件の、もう無い仕事の記録。
// このラベルは、その図鑑から抜いた一葉という体裁にする。
// 図版は「点灯夫」。日暮れに街灯を一つずつ点けてまわった仕事で、
// 電気が来て消えた。いちばん奥の灯りが、いま落ちるところ。

const NIGHT0 = "#181430";
const NIGHT1 = "#2c1d3e";
const NIGHT2 = "#552e4a";
const NIGHT3 = "#a85c4e";

const WALL = "#241d33";
const WALL2 = "#342a48";
const ROOF = "#100d1c";
const ROOF_L = "#4e4270";
const WINDOW = "#e09a34";
const WINDOW_L = "#ffd97e";

const ROAD = "#241c2c";
const STONE1 = "#33283a";
const STONE2 = "#1d1726";
const STONE3 = "#42324a";

const GOLD = "#ffd97e";
const GOLD2 = "#f0a838";
const GOLD3 = "#9c6420";
const IRON = "#0c0912";
const IRON_L = "#463854";

const PLATE = "#c8a25c";
const PAPER = "#ece0c4";
const BAND = "#181018";
const RUST = "#c0453a";

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
function jp(g: PixelGfx, x: number, y: number, s: string, c: string, sp = 0) {
  let cx = x;
  for (const ch of s) {
    g.textJP(cx, y + (JP_DROP[ch] ?? 0), ch, c);
    cx += 16 + sp;
  }
}

const MAN = [
  "..KKKK..",
  ".KKKKKK.",
  "..KDKR..",
  "..KDKR..",
  ".KKDDKR.",
  "KKDDDKR.",
  "KKDDDKR.",
  "KKDDDKR.",
  ".KDDDKR.",
  ".KDDDKR.",
  ".KK.KKR.",
  ".KK.KK..",
  "KKK.KKK.",
];

export const art: LabelArt = {
  slug: "vanished-jobs",
  swatch: ["#1b1630", "#ffd97e", "#4c2b36", "#c8a25c", "#171322"],
  draw: (g, t) => {
    // 奥のランプの寿命。3コマで、点いて／弱って／落ちる。
    const step = Math.floor(t * 3) % 3;

    // ── 夜空。日が落ちたばかりの、下だけ赤い空。 ─────────
    g.rect(0, 0, 68, 32, NIGHT0);
    g.rect(0, 5, 68, 27, "#211838");
    g.rect(0, 9, 68, 23, NIGHT1);
    g.rect(0, 13, 68, 19, "#3f2646");
    g.rect(0, 16, 68, 16, NIGHT2);
    g.rect(0, 19, 68, 13, "#6b374c");
    g.rect(0, 21, 68, 11, "#8c4a4c");
    g.rect(0, 23, 68, 9, NIGHT3);

    // 星
    const sr = rng(3311);
    for (let i = 0; i < 34; i++) {
      const x = 2 + Math.floor(sr() * 64);
      const y = 2 + Math.floor(sr() * 16);
      g.px(x, y, sr() < 0.45 ? "#7f74a4" : "#d6cce8");
    }

    // 月。題字に左を明け渡したので、右上へ寄せてある。
    g.disc(54, 5, 4, "#ded2b2");
    g.disc(53, 4, 3, "#fdf6dc");
    g.px(55, 3, "#c8bb9a");
    g.px(56, 6, "#c8bb9a");
    g.px(52, 7, "#c8bb9a");
    g.ring(54, 5, 6, "#463a60", 1);

    // ── 街なみ。切妻の続く古い通り。 ─────────────────────
    const houses: Array<[number, number, number]> = [
      [-3, 16, 13],
      [9, 13, 11],
      [19, 18, 9],
      [27, 14, 13],
      [39, 17, 9],
      [47, 12, 13],
      [59, 16, 11],
    ];
    for (const [hx, hy, hw] of houses) {
      const roofH = Math.ceil(hw / 2);
      const wallTop = hy + roofH;
      g.rect(hx, wallTop, hw, 25 - wallTop, WALL);
      g.vline(hx, wallTop, 25 - wallTop, WALL2);
      g.vline(hx + hw - 1, wallTop, 25 - wallTop, ROOF);
      // 切妻。左の斜面に月の光がのる。
      for (let i = 0; i < roofH; i++) {
        const w = hw - i * 2;
        if (w <= 0) break;
        g.hline(hx + i, wallTop - i, w, ROOF);
        g.px(hx + i, wallTop - i, i > 0 ? ROOF_L : ROOF);
      }
      g.px(hx + roofH - 1, hy, ROOF_L);
      // 煙突
      g.rect(hx + hw - 3, hy + 1, 2, 4, ROOF);
      g.px(hx + hw - 3, hy + 1, ROOF_L);
      // 窓
      for (let wy = wallTop + 2; wy < 24; wy += 4)
        for (let wx = hx + 2; wx < hx + hw - 2; wx += 4) {
          const lit = (wx * 5 + wy * 3) % 7 < 3;
          g.rect(wx, wy, 2, 2, lit ? WINDOW : "#181327");
          if (lit) g.px(wx, wy, WINDOW_L);
          g.px(wx - 1, wy - 1, ROOF);
        }
    }

    // ── 石畳 ──────────────────────────────────────────────
    g.rect(0, 25, 68, 7, ROAD);
    const cr = rng(5501);
    for (let row = 0; row < 4; row++) {
      const y = 25 + row * 2;
      const off = (row % 2) * 2;
      for (let x = -off; x < 68; x += 4) {
        const v = cr();
        g.rect(x, y, 3, 2, v < 0.22 ? STONE3 : v < 0.62 ? STONE1 : STONE2);
      }
    }
    g.hline(0, 24, 68, "#7a4e5c");
    g.hline(0, 25, 68, "#0d0a16", "half");
    // まだ灯りのついている店先。歩道にこぼれている。
    g.rect(37, 18, 8, 7, "#0f0c18");
    g.rect(38, 19, 6, 5, "#e8a838");
    g.vline(41, 19, 5, "#0f0c18");
    g.hline(38, 21, 6, "#b07820");
    g.hline(38, 18, 8, "#4e4270");
    g.px(37, 17, "#4e4270");
    g.px(44, 17, "#4e4270");
    g.ellipse(41, 26, 5, 2, "#8a5a2855");
    g.ellipse(41, 26, 3, 1, "#a86a2855");

    // 雨あがりの水たまり。灯りが1本ぶんだけ映る。
    g.ellipse(24, 30, 7, 2, "#2a2334");
    g.ellipse(24, 30, 6, 1, "#3b2f42");
    g.vline(24, 28, 4, "#7a5a2e");
    g.px(24, 29, "#a87a34");
    g.px(23, 30, "#4a3a2e");

    // ── 街灯。奥へ続く列。いちばん奥から順に落ちてゆく。 ─
    // 題字に上の16行をゆずったので、笠の位置はぜんぶ下げてある。
    // すでに落ちて久しい1本。柱だけが残っている。
    lamp(g, 5, 20, 27, 1, 0);
    // いま落ちるところ
    lamp(g, 22, 19, 28, 2, step === 0 ? 1 : step === 1 ? 0.5 : 0);
    if (step === 2) {
      // 消えたあとの一筋
      g.px(22, 20, "#7d6f84");
      g.px(23, 18, "#63557a");
    }
    // 点灯夫がいま点けている1本
    lamp(g, 59, 12, 31, 3, 1);

    // ── 点灯夫 ────────────────────────────────────────────
    g.blit(46, 18, MAN, { K: IRON, D: "#251e33", R: "#c08a4a" });
    g.px(52, 20, "#e8b96e"); // 灯りを受けた頬
    g.px(53, 24, "#a67a44");
    // 長い点火棒。手から、いま点けた笠へ。
    g.line(52, 22, 57, 18, "#1c1520");
    g.line(53, 22, 58, 18, "#7d5c36");
    g.px(58, 17, GOLD);
    g.px(59, 17, "#fff6dc");
    // 足もとの照り返し
    g.hline(46, 30, 8, "#4a3040");
    g.hline(47, 31, 7, "#5c3c30");

    // ── 図鑑の版面 ───────────────────────────────────────
    // 小札は題字に場所を譲った。番号と年だけ、題字の右のあきに置く。
    g.rect(2, 26, 17, 7, "#130e21c0");
    g.hline(2, 26, 17, "#5e4a2a");
    g.text3x5(3, 27, "1957", "#9c8558");
    // 絶滅の印
    for (const [dx, dy] of [
      [0, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, 1],
    ] as const)
      g.px(64 + dx, 4 + dy, RUST);

    // 褪せた紙。よごれは控えめに。
    g.noise(1, 1, 66, 30, "#a89478", 0.012, 7717);
    g.rect(1, 1, 7, 7, "#0a0810", "eighth");
    g.rect(60, 1, 7, 7, "#0a0810", "eighth");
    g.rect(1, 24, 7, 7, "#0a0810", "eighth");

    // ── 題字 ──────────────────────────────────────────────
    // 夜空と石畳という暗い地なので、1色べたで置けば抜ける。ふち取りはしない
    // （画数の多い漢字はふちを回すと潰れる）。上は紙色、下は街灯の金色。
    // 「仕事」「職業」は 16px のこの書体だと横画が繋がって黒い塊になる。
    // 読めない字を大きく置くのは題字ではないので、和文は「消えた」1行にして、
    // 何が消えたのかは下の帯の欧文に持たせている。
    jp(g, 2, 2, "消えた", PAPER);

    // ── 下の見出し帯 ──────────────────────────────────────
    g.rect(0, 32, 68, 8, BAND);
    g.hline(0, 32, 68, PLATE);
    g.hline(0, 33, 68, "#2e2028");
    g.text3x5(2, 34, "VANISHED JOBS", PAPER);
    g.px(55, 35, RUST);
    g.px(56, 36, RUST);
    g.px(55, 37, RUST);
    g.px(54, 36, RUST);

    // ── ふち ──────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。
    g.frame(0, 0, 68, 40, "#7d6136");
    mark(g, PLATE, BAND);
  },
};

/**
 * ガス灯。size は笠の半幅、lit は 0..1 の明るさ。
 * 消えかけの1本を作るためだけに、明るさを外から渡せるようにしてある。
 */
function lamp(g: PixelGfx, x: number, top: number, base: number, size: number, lit: number) {
  const gy = top + size + 2; // ほやの中心
  const armY = top + size * 2 + 3;

  // 光のかさ。下の街なみを消さないよう、狭く薄く。
  if (lit > 0) {
    const bright = lit > 0.6;
    g.disc(x, gy, size + (bright ? 4 : 2), bright ? "#e8901e2a" : "#a8681e20");
    if (bright) g.disc(x, gy, size + 2, "#f0a83840");
  }

  // 笠
  for (let i = 0; i <= size; i++) g.hline(x - i, top + size - i, i * 2 + 1, IRON);
  g.px(x, top - 1, IRON);
  g.px(x - size, top + size, IRON);
  // ほや
  const gw = size * 2 - 1;
  g.rect(x - size + 1, top + size + 1, gw, size + 2, IRON);
  if (lit > 0) {
    g.rect(x - size + 2, top + size + 1, gw - 2, size + 1, lit > 0.6 ? "#ffbe44" : "#7a5426");
    if (lit > 0.6) {
      g.vline(x, gy - 1, 3, "#fff2c0");
      g.px(x, gy, "#ffffff");
      g.px(x - 1, gy, GOLD);
      g.px(x + 1, gy, GOLD);
      g.hline(x - size + 2, top + size + 1, gw - 2, GOLD2);
    } else {
      g.px(x, gy, GOLD3);
    }
  } else {
    g.rect(x - size + 2, top + size + 1, gw - 2, size + 1, "#2a2130");
  }

  // 腕木と柱
  g.hline(x - size, armY, size * 2 + 1, IRON);
  g.vline(x, armY, base - armY, IRON);
  if (size >= 3) g.vline(x - 1, armY + 2, base - armY - 2, IRON_L);
  g.hline(x - 1, base - 1, 3, IRON);
  g.hline(x - 2, base, 5, IRON);

  // 石畳に落ちるあかり
  if (lit > 0) {
    const w = size * 2 + 2;
    g.ellipse(x, base + 1, w, 2, lit > 0.6 ? "#6b4622" : "#3a2c26");
    g.ellipse(x, base + 1, w - 3, 1, lit > 0.6 ? "#9c6a2a" : "#4a382c");
  }
}
