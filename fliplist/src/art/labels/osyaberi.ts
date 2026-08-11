import type { LabelArt } from "./types";
import { shade, type PixelGfx } from "../gfx";

// 元も子もないこすくまくん ── チャットでこすくまくんが身も蓋もないことを言う。
//
// 実物のサイトは、クラフト紙の地に切り絵の渦が縁取りされていて、
// 真ん中に薄い黄色のくま、下に吹き出し。その配置をそのままラベルに畳む。
// 左にくま、右に会話。くまは笑いも怒りもしない顔のままでいる。

const PAPER = "#cfb98f"; // クラフト紙
const PAPER_DK = "#b8a074";
const PAPER_LT = "#dfcda6";
const OUTLINE = "#2b2119";
const FUR = "#f7f0c2"; // こすくまくんの体
const FUR_SH = "#e3d79c";
const BUBBLE = "#fbf6e8";
const BUBBLE_SH = "#ded2b6";
const TAG = "#e58aae";
const TAG_DK = "#b8577f";

// 切り絵の縁。色紙を順に重ねて層に見せる
const CRAFT = ["#e8709c", "#f2a44a", "#4fb8a2", "#5f9fd8", "#a880d8", "#f0cf5e"];

// ── 発行元の印 ──────────────────────────────────────────
// 16枚すべて同じ意匠・同じ位置・同じ大きさ。右下の隅に 5x5 のくまの顔。
const MARK = ["#...#", ".###.", "#####", "#o#o#", ".#o#."];
function mark(g: PixelGfx, body: string, eye: string) {
  g.blit(61, 33, MARK, { "#": body, o: eye });
}

export const art: LabelArt = {
  slug: "osyaberi",
  swatch: [PAPER, FUR, "#e8bcca", TAG, OUTLINE],
  draw: (g, t) => {
    // ── 地。クラフト紙 ────────────────────────────────────
    g.rect(0, 0, 68, 40, PAPER);
    // 印刷された細かい市松。地が平らに見えないように
    for (let y = 0; y < 40; y++)
      for (let x = 0; x < 68; x++) {
        if ((x + y * 2) % 6 === 0 && (y + 1) % 3 === 0) g.px(x, y, PAPER_DK);
        else if ((x * 2 + y) % 7 === 0 && x % 3 === 0) g.px(x, y, PAPER_LT);
      }
    g.noise(0, 0, 68, 40, PAPER_DK, 0.08, 21);
    g.noise(0, 0, 68, 40, PAPER_LT, 0.05, 88);
    // 四隅を少し落として奥行きを出す
    for (const [cx0, cy0] of [
      [8, 8],
      [60, 8],
      [8, 32],
      [60, 32],
    ])
      g.ellipse(cx0, cy0, 14, 12, "#00000012", "half");

    // ── 切り絵の縁 ───────────────────────────────────────
    // 周に沿って色紙を長く貼り、深さで濃淡をつける。継ぎ目には白い切り口。
    const RUN = 17;
    /** 周に沿った位置 p と深さ d を1ドットに落とす */
    const layer = (x: number, y: number, d: number, p: number, w: number) => {
      const idx = Math.floor(p / RUN);
      const c = CRAFT[((idx % CRAFT.length) + CRAFT.length) % CRAFT.length];
      if (p % RUN === 0) {
        g.px(x, y, "#fdf6e6");
        return;
      }
      g.px(x, y, d === 0 ? shade(c, 0.22) : d === w - 1 ? shade(c, -0.34) : c);
    };
    // 外周1pxは枠のために空けておく。色紙はその内側から貼る。
    const edge = (x: number, y: number) => g.px(x, y, "#0000002e");
    for (let x = 1; x < 67; x++) {
      const w = 4 + Math.round(Math.sin(x * 0.33) * 1.2);
      for (let d = 0; d < w; d++) layer(x, 1 + d, d, x, w);
      edge(x, 1 + w);
      const w2 = 4 + Math.round(Math.sin(x * 0.29 + 2.2) * 1.2);
      for (let d = 0; d < w2; d++) layer(x, 38 - d, d, 176 + (67 - x), w2);
      edge(x, 38 - w2);
    }
    for (let y = 1; y < 39; y++) {
      const w = 4 + Math.round(Math.sin(y * 0.38 + 1.1) * 1.1);
      for (let d = 0; d < w; d++) layer(1 + d, y, d, 284 + (39 - y), w);
      edge(1 + w, y);
      const w2 = 4 + Math.round(Math.sin(y * 0.44 + 3.4) * 1.1);
      for (let d = 0; d < w2; d++) layer(66 - d, y, d, 68 + y, w2);
      edge(66 - w2, y);
    }
    // 渦。切り絵の帯の上でくるりと巻く
    for (const [cx0, cy0, dir] of [
      [4, 12, 1],
      [64, 24, -1],
      [26, 37, 1],
      [44, 2, -1],
    ]) {
      for (let i = 0; i < 15; i++) {
        const a = i * 0.62 * dir;
        const r = 0.5 + i * 0.2;
        g.px(Math.round(cx0 + Math.cos(a) * r), Math.round(cy0 + Math.sin(a) * r), i < 7 ? "#fdf6e6" : "#00000038");
      }
    }
    // 縁に散る小花と星
    const flower = (x: number, y: number, c: string, core: string) => {
      g.px(x, y - 1, c);
      g.px(x - 1, y, c);
      g.px(x + 1, y, c);
      g.px(x, y + 1, c);
      g.px(x, y, core);
    };
    flower(9, 2, "#fdf6e6", "#f0cf5e");
    flower(61, 4, "#fdf6e6", "#e8709c");
    flower(2, 24, "#fdf6e6", "#5f9fd8");
    flower(65, 36, "#fdf6e6", "#f0cf5e");
    flower(36, 37, "#fdf6e6", "#a880d8");
    flower(53, 2, "#fdf6e6", "#4fb8a2");
    // 星と紙のパンチ屑
    const star = (x: number, y: number, c: string) => {
      g.px(x, y, c);
      g.px(x - 1, y - 1, c);
      g.px(x + 1, y - 1, c);
      g.px(x - 1, y + 1, c);
      g.px(x + 1, y + 1, c);
    };
    star(20, 3, "#fdf6e6");
    star(46, 37, "#fdf6e6");
    star(3, 33, "#fdf6e6");
    star(65, 14, "#fdf6e6");
    for (const [x, y, c] of [
      [30, 3, "#e8709c"],
      [15, 37, "#5f9fd8"],
      [58, 37, "#f2a44a"],
      [3, 8, "#f0cf5e"],
      [64, 20, "#e8709c"],
      [42, 2, "#5f9fd8"],
      [11, 36, "#a880d8"],
    ] as Array<[number, number, string]>) {
      g.px(x, y, c);
      g.px(x + 1, y, c);
      g.px(x, y + 1, c);
      g.px(x + 1, y + 1, c);
    }
    // クラフト紙に散る色紙の粒
    for (const [x, y, c] of [
      [31, 12, "#e8a0bc"],
      [33, 33, "#9fc4dc"],
      [12, 8, "#e8a0bc"],
      [56, 31, "#c8b0e0"],
      [29, 24, "#e8c98a"],
      [8, 30, "#9fc4dc"],
      [64, 9, "#e8a0bc"],
    ] as Array<[number, number, string]>) {
      g.px(x, y, c);
      g.px(x + 1, y + 1, c);
    }

    // ── こすくまくん ─────────────────────────────────────
    const bx = 20;
    const headY = 16;
    const bodyY = 27;

    // 後ろに敷いた色紙の丸。切り絵の台
    const STAGE = "#e8bcca";
    const STAGE_DK = "#c0879c";
    g.disc(bx, 21, 15, "#00000014");
    g.disc(bx - 1, 20, 15, STAGE_DK);
    g.disc(bx - 1, 20, 14, STAGE);
    g.disc(bx - 1, 20, 10, "#f2d4de", "half");
    g.ring(bx - 1, 20, 12, "#f6e2e9", 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      g.px(Math.round(bx - 1 + Math.cos(a) * 12), Math.round(20 + Math.sin(a) * 12), STAGE_DK);
    }
    g.noise(5, 5, 32, 32, "#f4dde6", 0.07, 55);

    // 輪郭をまとめて置いてから中身を塗ると、実物と同じ一本線の縁になる
    // 影。紙に落ちる
    g.ellipse(bx + 2, bodyY + 8, 10, 2, "#00000018");
    // 耳
    g.disc(bx - 7, headY - 6, 4, OUTLINE);
    g.disc(bx + 7, headY - 6, 4, OUTLINE);
    // 体と頭
    g.ellipse(bx, bodyY, 11, 7, OUTLINE);
    g.disc(bx, headY, 8, OUTLINE);
    // 中身
    g.disc(bx - 7, headY - 6, 3, FUR);
    g.disc(bx + 7, headY - 6, 3, FUR);
    g.ellipse(bx, bodyY, 10, 6, FUR);
    g.disc(bx, headY, 7, FUR);
    // 体の陰。右下に薄く
    g.ellipse(bx + 4, bodyY + 2, 6, 4, FUR_SH, "quarter");
    g.ellipse(bx + 5, headY + 3, 3, 2, FUR_SH, "quarter");
    // 手
    g.ellipse(bx - 9, bodyY - 1, 3, 2, OUTLINE);
    g.ellipse(bx + 9, bodyY - 1, 3, 2, OUTLINE);
    g.ellipse(bx - 9, bodyY - 1, 2, 1, FUR);
    g.ellipse(bx + 9, bodyY - 1, 2, 1, FUR);
    // 足
    g.ellipse(bx - 5, bodyY + 6, 3, 2, OUTLINE);
    g.ellipse(bx + 5, bodyY + 6, 3, 2, OUTLINE);
    g.ellipse(bx - 5, bodyY + 6, 2, 1, FUR);
    g.ellipse(bx + 5, bodyY + 6, 2, 1, FUR);
    // お腹のほくろ
    g.px(bx + 7, bodyY + 2, OUTLINE);

    // 顔。なにも思っていない顔。まばたきだけする
    const blink = t > 0.62 && t < 0.7;
    if (blink) {
      g.hline(bx - 5, headY - 1, 3, OUTLINE);
      g.hline(bx + 3, headY - 1, 3, OUTLINE);
    } else {
      g.rect(bx - 5, headY - 2, 2, 3, OUTLINE);
      g.rect(bx + 4, headY - 2, 2, 3, OUTLINE);
      g.px(bx - 5, headY - 2, "#6b5a4a");
      g.px(bx + 4, headY - 2, "#6b5a4a");
    }
    g.vline(bx, headY + 1, 2, OUTLINE);
    g.px(bx - 1, headY + 2, OUTLINE);

    // ── 会話。右に3つ、時間が来ると4つめが出る ──────────────
    /** 吹き出し。tail が left なら左向きの尻尾がつく */
    const bubble = (
      x: number,
      y: number,
      w: number,
      h: number,
      fill: string,
      lines: number[],
      tail: "left" | "right" | null,
      lineC: string,
    ) => {
      g.rect(x, y, w, h, OUTLINE);
      g.px(x, y, null);
      g.px(x + w - 1, y, null);
      g.px(x, y + h - 1, null);
      g.px(x + w - 1, y + h - 1, null);
      g.rect(x + 1, y + 1, w - 2, h - 2, fill);
      g.hline(x + 1, y + h - 2, w - 2, BUBBLE_SH);
      if (tail === "left") {
        g.px(x - 1, y + h - 4, OUTLINE);
        g.px(x - 2, y + h - 3, OUTLINE);
        g.px(x - 1, y + h - 3, fill);
        g.px(x - 1, y + h - 2, OUTLINE);
      } else if (tail === "right") {
        g.px(x + w, y + h - 4, OUTLINE);
        g.px(x + w + 1, y + h - 3, OUTLINE);
        g.px(x + w, y + h - 3, fill);
        g.px(x + w, y + h - 2, OUTLINE);
      }
      // 中の文字。長さをばらして本文らしく見せる
      lines.forEach((len, i) => {
        g.hline(x + 3, y + 3 + i * 2, len, lineC);
        for (let k = 3; k < len; k += 5) g.px(x + 3 + k, y + 3 + i * 2, fill);
      });
    };

    // 相手（人間）の問いかけ。右寄せの小さいの。彩度を上げて紙から離す
    bubble(45, 9, 18, 7, "#f2b0ca", [11, 6], "right", "#8f3f60");
    // こすくまくんの名札つきの返事
    g.rect(36, 14, 13, 5, TAG_DK);
    g.rect(36, 14, 13, 4, TAG);
    g.hline(37, 14, 11, "#f4b3c9");
    g.px(36, 14, null);
    g.px(48, 14, null);
    for (let i = 0; i < 4; i++) g.vline(38 + i * 3, 15, 2, "#ffffff");
    bubble(36, 19, 27, 9, BUBBLE, [21, 22, 15], "left", "#4a3c2e");
    // 吹き出しの上端に色紙を1枚はさむ。白い長方形に見せない。
    g.hline(37, 20, 25, "#f2dde6");
    g.hline(37, 26, 15, "#e6d8c0");
    // 身も蓋もない一節にだけ朱が引いてある
    g.hline(39, 24, 13, "#c8506e");
    g.px(38, 24, "#c8506e");
    // 吹き出しの角にはられた切り絵の花
    flower(62, 19, "#fdf6e6", "#4fb8a2");
    flower(35, 18, "#fdf6e6", "#f2a44a");
    // とどめの一言。「……」だけ
    if (t > 0.45) {
      bubble(37, 29, 15, 8, BUBBLE, [], "left", "#4a3c2e");
      for (let i = 0; i < 3; i++) g.rect(40 + i * 4, 32, 2, 2, "#3b2f24");
    } else {
      // 打っている途中の点
      g.rect(38, 30, 12, 5, "#c0a880");
      g.frame(38, 30, 12, 5, "#9a8260");
      for (let i = 0; i < 3; i++) g.px(41 + i * 3, 32, "#6b5a4a");
    }
    // 返事についた反応。色紙で作ったボタンという体
    for (const [rx, rc] of [
      [52, "#e8709c"],
      [57, "#5f9fd8"],
      [62, "#f0cf5e"],
    ] as Array<[number, string]>) {
      g.disc(rx, 30, 2, OUTLINE);
      g.disc(rx, 30, 2, rc, "solid");
      g.ring(rx, 30, 2, OUTLINE, 1);
      g.px(rx - 1, 29, "#fdf6e6");
      g.px(rx, 32, "#00000033");
    }

    // ── 名札。題字を兼ねる ────────────────────────────────
    g.rect(33, 2, 24, 7, TAG_DK);
    g.rect(33, 2, 24, 6, TAG);
    g.hline(34, 2, 22, "#f4b3c9");
    g.text3x5(35, 3, "BLUNT", "#ffffff");
    g.px(33, 2, null);
    g.px(56, 2, null);
    g.px(33, 8, null);
    g.px(56, 8, null);
    // 名札を留めるピン
    g.px(58, 5, TAG_DK);
    g.px(59, 4, TAG_DK);
    g.px(59, 6, TAG_DK);
    g.px(60, 5, TAG_DK);

    // ── 枠 ──────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。切り絵の帯はその内側の絵。
    g.frame(0, 0, 68, 40, OUTLINE);
    mark(g, OUTLINE, FUR);
  },
};
