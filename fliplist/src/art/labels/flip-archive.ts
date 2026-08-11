import type { LabelArt } from "./types";
import { rng } from "../gfx";
import type { PixelGfx } from "../gfx";

// 世界のFLIP図鑑 — 常識をひっくり返した事例の記録。
// 実物は生成りの紙に墨と朱の、たいへん静かな版面で、
// 図版が斜めのカスケードになって奥へ流れてゆく。
// だからこの1枚だけはドット絵でも「紙もの」の顔をさせる。
// 主役は活字。FLIP と、その真下でひっくり返った FLIP。

const PAPER = "#efe9d8";
const PAPER2 = "#e4ddc7";
const PAPER3 = "#f8f4e8";
const RULE = "#b9b096";
const RULE2 = "#d3cbb4";
const INK = "#1b1a17";
const INK2 = "#514c40";
const RED = "#c8402c";
const SHADOW = "#cdc4ac";

const BIG: Record<string, string[]> = {
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
};

function rot180(rows: string[]): string[] {
  return rows
    .slice()
    .reverse()
    .map((r) => r.split("").reverse().join(""));
}

function word(g: PixelGfx, x: number, y: number, s: string, c: string, flip = false) {
  const chars = flip ? s.split("").reverse() : s.split("");
  let cx = x;
  for (const ch of chars) {
    const rows = BIG[ch];
    if (rows) g.blit(cx, y, flip ? rot180(rows) : rows, { "#": c });
    cx += 6;
  }
}

/** 図版の板。斜めの帯になって奥へ流れてゆく、そのひとつ。 */
function plate(g: PixelGfx, x: number, y: number, kind: number) {
  const W = 12;
  const H = 16;
  // 落ち影
  g.rect(x + 1, y + 1, W, H, SHADOW);
  g.rect(x, y, W, H, PAPER3);
  g.frame(x, y, W, H, INK2);
  // 標題の罫
  g.hline(x + 2, y + 2, 3, INK);
  g.hline(x + 6, y + 2, 4, RULE);
  if (kind === 0) {
    // 塗りつぶしの図版
    g.rect(x + 2, y + 5, 8, 6, INK);
    g.hline(x + 3, y + 6, 6, "#3c382e");
    g.hline(x + 2, y + 13, 5, RULE);
  } else {
    // 格子の図版
    for (let i = 0; i <= 3; i++) g.hline(x + 2, y + 5 + i * 2, 8, RULE);
    for (let i = 0; i <= 4; i++) g.vline(x + 2 + i * 2, y + 5, 7, RULE);
    g.rect(x + 4, y + 7, 2, 2, INK);
    g.hline(x + 2, y + 13, 7, RULE);
  }
  // 右下の小さな目盛り
  g.vline(x + W - 4, y + H - 3, 2, RULE);
  g.vline(x + W - 2, y + H - 3, 2, RULE);
}

export const art: LabelArt = {
  slug: "flip-archive",
  swatch: ["#efe9d8", "#1b1a17", "#c8402c", "#b9b096", "#f8f4e8"],
  draw: (g, t) => {
    // ── 生成りの紙 ────────────────────────────────────────
    g.rect(0, 0, 68, 40, PAPER);
    g.noise(0, 0, 68, 40, PAPER3, 0.1, 8821);
    g.noise(0, 0, 68, 40, PAPER2, 0.12, 4409);
    // 紙の繊維
    const fr = rng(6673);
    for (let i = 0; i < 14; i++) {
      const x = Math.floor(fr() * 66);
      const y = Math.floor(fr() * 38);
      g.hline(x, y, 1 + Math.floor(fr() * 2), "#dcd4bd");
    }

    // ── 斜めの帯。図版がひとつぶん流れる。 ───────────────
    // 板2種を交互に並べ、1周でちょうど2枚ぶん送る。継ぎ目が出ない。
    const slide = t * 16;
    for (let i = 6; i >= -4; i--) {
      const px = Math.round(24 + i * 8 + slide);
      const py = Math.round(20 - i * 4 - slide / 2);
      if (px > 68 || px < -14 || py > 40 || py < -18) continue;
      plate(g, px, py, ((i % 2) + 2) % 2);
    }
    // 帯の下をうっすら紙に戻して、版面の余白を作る
    g.rect(0, 31, 68, 9, PAPER);
    g.noise(0, 31, 68, 9, PAPER2, 0.1, 991);
    g.rect(0, 0, 68, 3, PAPER);
    g.noise(0, 0, 68, 3, PAPER3, 0.1, 313);

    // ── 見出しまわり ──────────────────────────────────────
    g.rect(3, 3, 3, 3, RED);
    g.text3x5(8, 3, "HVC-FA", INK2);
    g.hline(3, 9, 44, INK);
    g.hline(3, 10, 44, RULE2);

    // ── 主役の活字。上は正しく、下はひっくり返っている。 ─
    // 白場を作って、紙に刷った活字らしく見せる
    g.rect(3, 13, 28, 17, SHADOW);
    g.rect(2, 12, 28, 17, PAPER);
    g.noise(2, 12, 28, 17, PAPER3, 0.16, 77);
    g.frame(2, 12, 28, 17, RULE);
    word(g, 4, 13, "FLIP", INK);
    g.hline(4, 20, 24, INK);
    word(g, 4, 22, "FLIP", RED, true);
    // ひっくり返る、の印
    g.px(31, 18, RED);
    g.px(32, 19, RED);
    g.px(33, 20, RED);
    g.px(32, 21, RED);
    g.px(31, 22, RED);

    // ── 下の罫と欄外 ──────────────────────────────────────
    g.hline(3, 30, 62, INK);
    g.hline(3, 31, 62, RULE2);
    g.text3x5(3, 32, "FLIP ARCHIVE", INK2);
    g.text3x5(53, 32, "N01", INK2);
    g.rect(62, 32, 3, 3, RED);

    // ── ふち ──────────────────────────────────────────────
    g.frame(0, 0, 68, 40, INK);
    g.frame(1, 1, 66, 38, PAPER);
    g.frame(2, 2, 64, 36, RULE);
  },
};
