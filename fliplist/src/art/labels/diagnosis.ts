import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";

// 精神病図鑑（Diagnosis Archive）。
//
// 実物は1518年から2022年までの151の診断名を、番号・年・分類・地域とともに並べた索引。
// 生成りの紙、濃紺のインク、差し色の紅。人の絵はひとつも出てこない。
//
// だからこの1枚も、人を描かない。病室も、拘束具も、薬も、脳も描かない。
// 描くのは図書館の名刺箪笥 ——「名前が与えられ、分類され、時代とともに書き換えられてきた」
// という、そのことだけ。16本のなかでいちばん静かな1枚でよい。
//
// 前の版は 15杯を等間隔に並べていたので、本番の倍率だとただの格子模様に見えた。
// 反復は情報量ではないので、杯数を 6 に減らして1杯を倍の大きさにし、
// 名札に「A-C」のような読める見出しを入れた。1杯だけ開いていて、
// そこから索引の札が1枚持ち上がっている。札には、消された前の名前と、
// 引き直された今の名前が書いてある。図鑑の主題はこの1枚の札にある。

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

const DW = 19; // 抽斗の面の幅
const DH = 9; // 抽斗の面の高さ
const COLX = [4, 24, 44];
const ROWY = [20, 29];
const CAB_Y = 19; // 箪笥の天板
const CAB_H = 20;

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

/**
 * 抽斗ひとつ。名札には見出しの範囲だけを打つ。中身は書かない。
 * 字は必ず名札の枠から1pxあける。詰めると「刷りが切れている」ように見える。
 */
function drawer(g: PixelGfx, x: number, y: number, from: string, to: string, seed: number) {
  const aged = seed % 3 === 1;
  g.rect(x, y, DW, DH, WOOD);
  // 木目。1杯ずつ位置を変える。
  g.vline(x + 15 + (seed % 2), y + 1, DH - 2, "#b89a70");
  g.hline(x + 1, y + 1, DW - 2, WOOD_LT);
  g.hline(x + 1, y + DH - 2, DW - 2, WOOD_DK);
  g.frame(x, y, DW, DH, WOOD_DP);
  // 名札。真鍮の枠に紙をはさんである。古い札は日に焼けている。
  g.rect(x + 1, y + 1, 14, 7, aged ? "#e2d3ae" : PAPER);
  g.frame(x + 1, y + 1, 14, 7, "#8c7448");
  g.hline(x + 2, y + 2, 12, aged ? "#f0e4c4" : "#fdf8ec");
  g.text3x5(x + 3, y + 2, from, NAVY);
  g.hline(x + 7, y + 4, 2, NAVY);
  g.text3x5(x + 10, y + 2, to, NAVY);
  // 引き手
  g.rect(x + 16, y + 3, 2, 3, "#634c28");
  g.px(x + 16, y + 3, "#cdb68e");
  g.px(x + 17, y + 5, "#3f2f16");
}

export const art: LabelArt = {
  slug: "diagnosis",
  swatch: [PAPER, NAVY, CRIMSON, WOOD, CARD],
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
    // 和文は「索引」の二字だけにしてある。この題材で大きく打ってよいのは、
    // 中身ではなく器の名前だけ。病名は一つも書かない。
    jp(g, 4, 2, "索引", NAVY);

    // 年表。標題の右のあきへ移した。実物と同じ 1518 から 2022 まで。
    g.text3x5(36, 2, "1518", "#9aa1b6");
    g.hline(36, 9, 28, NAVY_LT);
    g.px(35, 9, NAVY);
    g.px(64, 9, NAVY);
    const MARKS = [1, 3, 5, 7, 8, 10, 12, 13, 15, 16, 17, 18, 19, 21, 23, 24];
    for (const m of MARKS) g.px(36 + m, 8, NAVY_LT);
    for (const m of [7, 13, 17, 23] as const) g.vline(36 + m, 7, 2, NAVY);
    // いま開いている抽斗が指している年
    g.vline(36 + 20, 7, 2, CRIMSON);
    g.text3x5(50, 11, "2022", "#9aa1b6");
    g.text3x5(36, 11, "151", CRIMSON);

    g.hline(4, 17, 60, NAVY_LT);
    g.hline(4, 17, 60, NAVY, "half");

    // ── 名刺箪笥 ───────────────────────────────────────────
    // 6杯。等間隔だが、数が少ないので格子には見えない。
    g.rect(3, CAB_Y, 61, CAB_H, CARCASS);
    g.hline(3, CAB_Y, 61, "#241a0e");
    g.hline(3, CAB_Y + CAB_H - 1, 61, "#241a0e");
    g.vline(3, CAB_Y, CAB_H, "#241a0e");
    g.vline(63, CAB_Y, CAB_H, "#4a3a20");

    // 開いているのは上段のいちばん右。だから見出しは I-M だけ欠けている。
    const OPEN_C = 2;
    const OPEN_R = 0;
    const LABELS: Array<Array<[string, string]>> = [
      [
        ["A", "C"],
        ["D", "H"],
        ["", ""],
      ],
      [
        ["N", "R"],
        ["S", "U"],
        ["V", "Z"],
      ],
    ];
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        if (r === OPEN_R && c === OPEN_C) continue;
        drawer(g, COLX[c], ROWY[r], LABELS[r][c][0], LABELS[r][c][1], r * 3 + c);
      }

    // ── 開いた抽斗 ─────────────────────────────────────────
    const ox = COLX[OPEN_C];
    const oy = ROWY[OPEN_R];
    g.rect(ox, oy, DW, DH, "#2a2114");
    g.rect(ox + 1, oy + 1, DW - 2, DH - 4, "#17110a");
    // 抽斗の側板。ここが無いと、ただの穴になる。
    g.vline(ox + 1, oy + 1, DH - 2, WOOD_DK);
    g.vline(ox + DW - 2, oy + 1, DH - 2, WOOD_DP);
    g.frame(ox, oy, DW, DH, WOOD_DP);
    // 立っている索引の札
    for (let i = 0; i < 7; i++) {
      const cx = ox + 3 + i * 2;
      g.vline(cx, oy + 2, DH - 6, i === 3 ? CARD : PAPER_DK);
      g.vline(cx + 1, oy + 2, DH - 6, PAPER_DP);
    }
    // 手前に倒れた前板。引き手が下を向いている。
    g.hline(ox + 1, oy + DH - 3, DW - 2, WOOD_LT);
    g.rect(ox + 1, oy + DH - 2, DW - 2, 2, WOOD);
    g.hline(ox + 1, oy + DH - 1, DW - 2, WOOD_DK);
    g.rect(ox + 8, oy + DH - 2, 3, 2, "#634c28");
    g.px(ox + 8, oy + DH - 2, "#cdb68e");

    // ── 持ち上がった1枚 ────────────────────────────────────
    // 消された前の名前と、引き直された今の名前。図鑑の主題はここにある。
    const lift = 1 + Math.round(3 * Math.max(0, Math.sin(t * Math.PI * 2)));
    const cx0 = ox + 5;
    const cy0 = oy - lift;
    g.rect(cx0 + 1, cy0 + 1, 9, 10, "#00000026");
    g.rect(cx0, cy0, 9, 10, CARD);
    g.frame(cx0, cy0, 9, 10, NAVY_PALE);
    g.hline(cx0 + 1, cy0 + 1, 7, "#ffffff");
    g.hline(cx0 + 2, cy0 + 2, 5, NAVY_PALE); // 番号
    g.hline(cx0 + 2, cy0 + 4, 6, PAPER_DP); // 消された前の名前
    g.hline(cx0 + 1, cy0 + 4, 7, CRIMSON);
    g.hline(cx0 + 2, cy0 + 6, 5, NAVY); // 引き直された今の名前
    g.hline(cx0 + 2, cy0 + 7, 4, NAVY);
    g.px(cx0 + 2, cy0 + 8, NAVY_PALE);
    g.px(cx0 + 4, cy0 + 8, NAVY_PALE);
    g.px(cx0 + 6, cy0 + 8, NAVY_PALE);

    // ── 枠 ─────────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。
    g.frame(0, 0, 68, 40, NAVY);
    mark(g, NAVY, PAPER);
  },
};
