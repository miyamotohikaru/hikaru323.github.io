import type { LabelArt } from "./types";
import { rng } from "../gfx";

// ゆらぎの拡張機能 — 実物は Chrome 拡張「ゆらぎ1/f」。
// 開いているページの本文を1文字ずつ span に割って、1/f ノイズで呼吸させる。
// ろうそく／心拍／木漏れ日／川／オーロラ／こすくま の6ジャンルを重ねがけできる。
// ポップアップは黒茶の板に、橙に光る球のダイヤル。
//
// だからラベルは「揺れているページ」と「その脇に浮いている球」。
// 罫のようにまっすぐ組まれた本文が、行ごとにわずかにたわむ。

// 拡張機能はどのページにもかかる。ここでは白いページの上で揺らしている。
// 手前の黒い板（ポップアップ）だけが橙に光る、という明暗にする。
const BG = "#181410";
const PAGE = "#efe9da";
const PAGE2 = "#c9c1ae";
const CHROME = "#5e6167";
const CHROME_D = "#efe9da";
const PANEL = "#1d1409";
const EDGE = "#55402c";
const EDGE_L = "#8a6440";

const TXT = "#403b31";
const TXT_D = "#8d8674";
const TXT_H = "#100e0a";

const ORB = "#ffb066";
const ORB_C = "#fff2e2";
const ORB_E = "#e9622b";
const TRACK = "#3d2a1b";
const TRACK_F = "#ff9a52";

const GENRE = ["#ff8a4c", "#e87b6b", "#cdb454", "#5fb6c4", "#b06ff0", "#e8ddc8"];

const CURSOR = ["K....", "KK...", "KWK..", "KWWK.", "KWWWK", "KWKKK", "KK.K."];

export const art: LabelArt = {
  slug: "yuragi",
  swatch: ["#14100c", "#ffb066", "#c9b79e", "#5fb6c4", "#55402c"],
  draw: (g, t) => {
    const TAU = Math.PI * 2;

    // ── 地 ────────────────────────────────────────────────
    g.rect(0, 0, 68, 40, BG);

    // ── 左：ブラウザの窓 ──────────────────────────────────
    const PW = 42; // 窓の幅（x=1..42）
    g.rect(1, 1, PW, 38, PAGE);
    g.noise(1, 8, PW, 24, "#f4eee0", 0.08, 3391);

    // 窓の上端。信号3つとタブ。
    g.rect(1, 1, PW, 7, CHROME);
    g.hline(1, 1, PW, "#a89e88");
    g.rect(3, 3, 2, 2, "#c9533c");
    g.rect(7, 3, 2, 2, "#d0a032");
    g.rect(11, 3, 2, 2, "#5f9450");
    // ひらいているタブ。ページと地続きに見えるよう白く抜く。
    g.rect(16, 1, 26, 7, CHROME_D);
    g.hline(16, 1, 26, "#8e836d");
    g.vline(15, 2, 6, "#8e836d");
    g.vline(42, 2, 6, "#8e836d");
    g.px(15, 1, CHROME);
    g.text3x5(18, 2, "YURAGI", "#3c372c");
    g.hline(1, 8, 14, "#8e836d");
    g.hline(43, 8, PW - 42, "#8e836d");

    // ── 本文。1/f でたわむ。 ─────────────────────────────
    // マウスの近くほど強く反応する、という実物の挙動もそのまま。
    const CX = 27;
    const CY = 23;
    const wob = (x: number, y: number, i: number) => {
      const a =
        Math.sin(x * 0.36 + t * TAU + i * 0.9) * 0.62 +
        Math.sin(x * 0.13 - t * TAU * 0.5 + i * 0.45) * 0.52;
      const d = Math.abs(x - CX) + Math.abs(y - CY) * 1.6;
      const near = Math.max(0, 1 - d / 15);
      return Math.round(a * (1 + near * 2.4));
    };

    // 見出し。太い字。
    {
      const r = rng(4471);
      let x = 3;
      while (x < 34) {
        const wlen = 3 + Math.floor(r() * 5);
        if (x + wlen > 34) break;
        for (let k = 0; k < wlen; k++) {
          const dy = wob(x + k, 10, 0);
          g.px(x + k, 9 + dy, TXT_H);
          g.px(x + k, 10 + dy, TXT_H);
        }
        x += wlen + 3;
      }
      // まっすぐなはずの罫。たわんでいることが、これで分かる。
      for (let x2 = 3; x2 < 41; x2++) {
        g.px(x2, 13 + wob(x2, 13, 1) * 2, "#c96a20");
        g.px(x2, 31 + wob(x2, 31, 5) * 2, "#a89e88");
      }
    }

    // 本文
    for (let i = 0; i < 5; i++) {
      const y0 = 16 + i * 3;
      const r = rng(9137 + i * 71);
      let x = 3;
      while (x < 40) {
        const wlen = 2 + Math.floor(r() * 5);
        if (x + wlen > 40) break;
        const dim = r() < 0.34;
        for (let k = 0; k < wlen; k++) {
          const px = x + k;
          g.px(px, y0 + wob(px, y0, i + 2), dim ? TXT_D : TXT);
        }
        x += wlen + 2;
      }
    }

    // 窓の右端の巻き取り
    g.vline(41, 8, 25, PAGE2);
    g.rect(41, 11, 1, 9, "#8e836d");

    // マウスの矢印。この周りだけ、字がつよく反応する。
    g.blit(CX - 1, CY - 3, CURSOR, { K: "#141109", W: "#fbf7ec" });
    g.px(CX + 5, CY - 5, "#c9b79e");
    g.px(CX - 6, CY + 4, "#c9b79e");

    // 窓の下の帯
    g.rect(1, 32, PW, 7, CHROME);
    g.hline(1, 32, PW, "#8e836d");
    g.hline(1, 33, PW, "#d2c9b4");
    g.text3x5(3, 34, "1/F", "#8c3f10");
    g.text3x5(18, 34, "HVC-YR", "#5c5648");

    // ── 右：ポップアップの板 ──────────────────────────────
    const PX0 = 44;
    g.rect(PX0, 2, 23, 36, PANEL);
    g.frame(PX0, 2, 23, 36, EDGE);
    g.hline(PX0 + 1, 3, 21, "#2f2115");
    g.hline(PX0 + 1, 2, 21, EDGE_L);
    g.px(PX0, 2, "#2b1f14");
    g.px(PX0 + 22, 2, "#2b1f14");
    g.px(PX0, 37, "#2b1f14");
    g.px(PX0 + 22, 37, "#2b1f14");

    // 見出しの罫
    g.hline(PX0 + 3, 6, 17, "#4a3626");
    g.px(PX0 + 3, 5, "#8a6a48");
    g.px(PX0 + 5, 5, "#8a6a48");
    g.px(PX0 + 7, 5, "#8a6a48");

    // 球のダイヤル。ゆっくり呼吸する。
    const cx = 55;
    const cy = 16;
    const breath = Math.sin(t * TAU) * 0.5 + 0.5;
    g.ring(cx, cy, 8, TRACK, 1);
    // 目盛りの弧。上から時計回りに7割ほど。
    for (let a = -145; a <= 145; a += 10) {
      const rad = (a * Math.PI) / 180;
      const on = a < 95;
      g.px(
        cx + Math.round(Math.sin(rad) * 8),
        cy - Math.round(Math.cos(rad) * 8),
        on ? TRACK_F : "#4a3524",
      );
    }
    // 球の光
    g.disc(cx, cy, 5, "#4a2612");
    g.disc(cx, cy, 4 + (breath > 0.55 ? 1 : 0), ORB_E);
    g.disc(cx, cy, 3, ORB);
    g.rect(cx - 2, cy - 2, 2, 2, ORB_C);
    g.px(cx - 2, cy - 2, "#ffffff");
    // つまみ
    g.rect(cx + 5, cy - 7, 2, 2, "#ffe0b8");
    g.px(cx + 6, cy - 8, "#ffffff");

    // 6つのジャンル。上の3つが点いている。
    for (let i = 0; i < 6; i++) {
      const gx = PX0 + 4 + (i % 3) * 6;
      const gy = 27 + Math.floor(i / 3) * 6;
      const on = i < 3;
      const c = GENRE[i];
      if (on) {
        g.disc(gx, gy, 2, c);
        g.px(gx - 1, gy - 1, "#fff2e2");
        g.px(gx + 1, gy + 1, "#00000055");
      } else {
        g.blit(gx - 2, gy - 2, [".KKK.", "K...K", "K...K", "K...K", ".KKK."], {
          K: "#503b28",
        });
      }
    }

    // 静寂 ←→ 自然 の目盛り
    g.hline(PX0 + 3, 35, 17, "#3d2a1b");
    g.hline(PX0 + 3, 35, 11, TRACK_F);
    g.rect(PX0 + 13, 34, 2, 3, "#ffe0b8");
    g.px(PX0 + 3, 33, "#6e5a44");
    g.px(PX0 + 19, 33, "#6e5a44");

    // ── ふち ──────────────────────────────────────────────
    g.frame(0, 0, 68, 40, "#0a0806");
    g.hline(1, 0, 66, "#8f8f8a");
    g.vline(0, 1, 38, "#75756f");
    g.vline(67, 1, 38, "#4c4c47");
    g.hline(1, 39, 66, "#4c4c47");
    g.px(0, 0, "#8f8f8a");
    g.px(67, 39, "#3a3a36");
  },
};
