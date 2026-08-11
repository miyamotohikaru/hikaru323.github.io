import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";

// 精神病図鑑（Diagnosis Archive）。
//
// 実物は1518年から2022年までの151の診断名を、番号・年・分類・地域とともに並べた索引。
// 生成りの紙、濃紺のインク、差し色の紅。人の絵はひとつも出てこない。
//
// だからこの1枚も、人を描かない。病室も、拘束具も、薬も、脳も描かない。
// 描くのは図書館の名刺箪笥 ——「名前が与えられ、分類され、時代とともに書き換えられてきた」
// という、そのことだけ。名札には、まだ名前のない抽斗も、
// 線を引いて書き直された抽斗もある。下には年表が一本通る。
// 16本のなかでいちばん静かな1枚でよい。

const PAPER = "#ece3ce";
const PAPER_DK = "#dccfb2";
const PAPER_DP = "#c5b590";
const NAVY = "#232a46";
const NAVY_LT = "#464f70";
const NAVY_PALE = "#8189a4";
const CRIMSON = "#c8405f";
// 抽斗の面は明るく、箪笥の躯体は暗く。ここに差がないと格子が潰れる。
const WOOD = "#c1a274";
const WOOD_DK = "#9a7f52";
const WOOD_DP = "#6b532e";
const WOOD_LT = "#dcc59c";
const CARCASS = "#382b18";
const CARD = "#f7f1e2";

const COLS = 5;
const ROWS = 3;
const DW = 12;
const DH = 8;
const GX = 4;
const GY = 9;

/**
 * 名札。3行ぶんの余白があるので、
 * 上に今の名前、下に前の名前の残り、書き換えられたものには紅の線を引く。
 */
function plate(
  g: PixelGfx,
  x: number,
  y: number,
  ticks: number,
  old: number,
  rewritten: boolean,
  aged = false,
) {
  // 古い名札は日に焼けている。同じ棚に、違う時代の紙が並んでいる。
  g.rect(x, y, 7, 5, aged ? "#d8c69c" : PAPER);
  g.frame(x, y, 7, 5, "#8c7448");
  g.hline(x + 1, y + 1, 5, aged ? "#e8d9b2" : "#fdf8ec");
  for (let i = 0; i < ticks; i++) g.px(x + 1 + i, y + 2, NAVY);
  for (let i = 0; i < old; i++) g.px(x + 1 + i, y + 3, PAPER_DP);
  if (rewritten) {
    g.hline(x + 1, y + 3, 5, CRIMSON);
    g.px(x + 1, y + 2, CRIMSON);
  }
}

/** 抽斗ひとつ。面は 11x7、右と下に1pxだけ箪笥の躯体を残して隣と切る。 */
function drawer(
  g: PixelGfx,
  x: number,
  y: number,
  ticks: number,
  old: number,
  rewritten = false,
  seed = 0,
  aged = false,
) {
  g.rect(x, y, DW - 1, DH - 1, WOOD);
  // 木目。1本ずつ位置を変える。
  g.vline(x + 8 + (seed % 2), y + 1, DH - 3, "#b89a70");
  g.vline(x + 9, y + 1, DH - 3, WOOD_DK);
  g.hline(x + 1, y + 1, DW - 3, WOOD_LT);
  g.hline(x + 1, y + DH - 3, DW - 3, WOOD_DK);
  g.frame(x, y, DW - 1, DH - 1, WOOD_DP);
  plate(g, x + 1, y + 1, ticks, old, rewritten, aged);
  // 引き手
  g.disc(x + 9, y + 3, 1, "#634c28");
  g.px(x + 8, y + 2, "#cdb68e");
  g.px(x + 10, y + 4, "#3f2f16");
}

export const art: LabelArt = {
  slug: "diagnosis",
  swatch: ["#ece3ce", "#232a46", "#c8405f", "#ac9066", "#f7f1e2"],
  draw: (g, t) => {
    // ── 紙 ─────────────────────────────────────────────────
    g.rect(0, 0, 68, 40, PAPER);
    g.noise(1, 1, 66, 38, PAPER_DK, 0.1, 7717);
    g.noise(1, 1, 66, 38, "#f5eeda", 0.08, 2213);
    // 綴じ側の日焼けと、版面の縦罫
    g.rect(1, 1, 4, 38, PAPER_DK, "quarter");
    g.vline(1, 1, 38, PAPER_DK);
    g.vline(2, 2, 36, PAPER_DP);
    g.vline(65, 2, 36, PAPER_DP);

    // ── 標題 ───────────────────────────────────────────────
    // 標題は字間を空けて紙色の縁を回す。図鑑の扉らしく、重いが騒がしくない。
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ])
      g.text3x5(5 + dx, 2 + dy, "DIAGNOSIS", "#f7f1e0", 2);
    g.text3x5(5, 2, "DIAGNOSIS", NAVY, 2);
    g.px(48, 6, CRIMSON);
    g.text3x5(53, 2, "151", CRIMSON);
    g.hline(53, 1, 11, NAVY_PALE);
    g.hline(5, 7, 58, NAVY_LT);
    g.hline(5, 7, 58, NAVY, "half");

    // ── 名刺箪笥 ───────────────────────────────────────────
    g.rect(GX - 1, GY - 1, COLS * DW + 2, ROWS * DH + 2, CARCASS);
    g.hline(GX - 1, GY - 1, COLS * DW + 2, "#241a0e");
    g.hline(GX - 1, GY + ROWS * DH, COLS * DW + 2, "#241a0e");

    // 名札の刻みは1つずつ変える。0 は「まだ名前がついていない」抽斗。
    const TICKS = [
      [5, 3, 4, 3, 5],
      [4, 5, 3, 5, 0],
      [3, 4, 5, 4, 2],
    ];
    const OLD = [
      [2, 0, 3, 0, 2],
      [0, 2, 0, 2, 0],
      [2, 0, 3, 0, 3],
    ];
    // 名前のない抽斗（TICKS=0）は書き換えようがないので、そこには紅を引かない。
    const REWRITTEN = new Set(["0,3", "2,1", "2,3"]);
    const AGED = new Set(["0,0", "0,4", "1,1", "2,2", "2,4"]);

    // 動き: 抽斗が1つだけ、ゆっくり開いて閉じる。
    const open = Math.round(4 * Math.max(0, Math.sin(t * Math.PI * 2)));
    const OPEN_R = 1;
    const OPEN_C = 2;

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (r === OPEN_R && c === OPEN_C) continue;
        drawer(
          g,
          GX + c * DW,
          GY + r * DH,
          TICKS[r][c],
          OLD[r][c],
          REWRITTEN.has(`${r},${c}`),
          r * 5 + c,
          AGED.has(`${r},${c}`),
        );
      }

    // ── 開いた抽斗 ─────────────────────────────────────────
    // 中には索引の札が立っている。1枚だけ持ち上がって、書き直しの跡が見える。
    const ox = GX + OPEN_C * DW;
    const oy = GY + OPEN_R * DH;
    if (open > 0) {
      g.rect(ox, oy, DW - 1, DH - 1, "#2b2114");
      g.rect(ox + 1, oy + 1, DW - 3, DH - 3, "#1b150e");
      for (let i = 0; i < 4; i++) {
        const cx = ox + 1 + i * 2;
        g.vline(cx, oy + 1, DH - 3, i === 2 ? CARD : PAPER_DK);
        g.vline(cx + 1, oy + 1, DH - 3, PAPER_DP);
      }
      const lift = open;
      g.rect(ox + 2, oy - lift, 6, 7, CARD);
      g.frame(ox + 2, oy - lift, 6, 7, NAVY_PALE);
      g.hline(ox + 3, oy + 2 - lift, 4, NAVY);
      g.hline(ox + 3, oy + 4 - lift, 4, PAPER_DP);
      g.hline(ox + 3, oy + 4 - lift, 4, CRIMSON, "vstripe");
    }
    drawer(g, ox, oy + open, TICKS[OPEN_R][OPEN_C], OLD[OPEN_R][OPEN_C], true, 7);

    // ── 年表 ───────────────────────────────────────────────
    // 名前が与えられた年に目盛りを打つ。実物と同じ 1518 から 2022 まで。
    const AY = 36;
    g.text3x5(5, AY - 2, "1518", "#9aa1b6");
    g.text3x5(49, AY - 2, "2022", "#9aa1b6");
    g.hline(21, AY, 26, NAVY_LT);
    g.px(20, AY, NAVY);
    g.px(47, AY, NAVY);
    const MARKS = [1, 3, 6, 8, 11, 13, 14, 16, 17, 19, 20, 21, 22, 23, 24];
    for (const m of MARKS) g.px(21 + m, AY - 1, NAVY_LT);
    for (const m of [8, 17, 22]) g.vline(21 + m, AY - 2, 2, NAVY);
    // いま開いている抽斗が指している年
    g.vline(21 + 19, AY - 3, 3, CRIMSON);
    g.px(21 + 18, AY - 4, CRIMSON);
    g.px(21 + 20, AY - 4, CRIMSON);
    g.hline(5, AY + 3, 58, PAPER_DP, "vstripe");

    // ── 枠 ─────────────────────────────────────────────────
    g.frame(0, 0, 68, 40, NAVY);
    g.px(1, 1, NAVY_PALE);
    g.px(66, 1, NAVY_PALE);
    g.px(1, 38, NAVY_PALE);
    g.px(66, 38, NAVY_PALE);
  },
};
