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

    // ── 題字。表紙の天に金の箔押しで ──────────────────────
    // 実機の作法どおり、上の16行をまるごと題字に使う。
    // 窓（見開き）はそのぶん下へ下げて、丈を詰めた。
    jp(g, 2, 2, "言葉辞典", GOLD);
    g.px(2, 19, GOLD);
    g.px(65, 19, GOLD);

    // ── 紙面 ─────────────────────────────────────────────
    const PTOP = 20;
    const PBOT = 37;
    for (let x = 3; x <= 64; x++) {
      const b = bow(x);
      const top = PTOP + b;
      const bot = PBOT - b;
      g.vline(x, top, bot - top + 1, PAPER);
      g.px(x, top, PAPER_HI); // 天は光を受ける
      g.px(x, bot, PAPER_DK);
      g.px(x, bot + 1, STACK1); // 小口に見える紙の束
    }
    // 喉の影
    for (const [x, c] of [
      [32, "#e0d3b1"],
      [33, "#bfae87"],
      [34, "#9c8a66"],
      [35, "#d2c4a1"],
    ] as Array<[number, string]>) {
      const b = bow(x);
      g.vline(x, PTOP + b, PBOT - PTOP + 1 - 2 * b, c);
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

    // 左ページ。見出し語ひとつと、木版の図。
    g.text3x5(5, 22, "SOREBI", INK);
    g.hline(5, 27, 26, FAINT);
    column(19, 12, 29, 35, 3307);

    // ── 語釈にはさまった木版の図 ─────────────────────────
    // 鍵に見えるが、鍵ではない。何を開けるためのものかは書かれていない。
    // 存在しない言葉の図なので、分からないのが正しい。
    g.rect(5, 29, 13, 7, PAPER_HI);
    g.frame(5, 29, 13, 7, INK);
    g.rect(6, 30, 11, 5, PAPER);
    g.blit(
      6,
      30,
      [".##........", "#..#.......", "#..########", "#..#....#.#", ".##.....#.."],
      { "#": INK },
    );
    g.px(8, 31, FAINT); // 彫りの中の白
    g.px(15, 33, SOFT);

    // 右ページ
    g.text3x5(36, 22, "TOKEBI", INK);
    g.hline(36, 27, 26, FAINT);
    column(36, 12, 29, 35, 3313);
    column(50, 12, 29, 32, 3319); // ここだけ末尾が空いている

    // ── 動くもの: 新しい見出し語が1つ載る ────────────────
    if (t >= 0.5) {
      g.rect(50, 34, 6, 2, INK);
      g.hline(58, 35, 3, FAINT);
      g.px(48, 34, GOLD); // 追加された印
      g.px(48, 35, RED);
    }

    // ── しおり ───────────────────────────────────────────
    // 天から垂らす。題字の金の下から出て、紙面の途中で切れる。
    g.rect(33, 18, 2, 9, RED);
    g.vline(33, 18, 9, "#e8506c");
    g.px(34, 26, "#8c0c24");

    // ── 表紙の小口 ───────────────────────────────────────
    g.hline(1, 38, 66, COVER_DK);
    // ノンブルは紙面が詰まったので落とした。字を入れる余白がもう無い。

    // ── 外枠 ─────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。金の小口に見立てる。
    g.frame(0, 0, 68, 40, GOLD);
    mark(g, GOLD, COVER);
  },
};
