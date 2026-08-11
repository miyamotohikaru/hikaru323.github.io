import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";
import { NES } from "../palette";
import { shade } from "../gfx";

// ── 発行元の印 ──────────────────────────────────────────
// 16枚すべて同じ意匠・同じ位置・同じ大きさ。右下の隅に 5x5 のくまの顔。
const MARK = ["#...#", ".###.", "#####", "#o#o#", ".#o#."];
function mark(g: PixelGfx, body: string, eye: string) {
  g.blit(61, 33, MARK, { "#": body, o: eye });
}

// ともだちジェネレーター。さみしい写真に、知らない人がどんどん足される。
//
// 図の骨組み: 現像された1枚の写真そのもの。
//   写真の中 = 空・雲・太陽・草地に、後列10人＋前列10人の集合写真。
//              顔検出のような白い鉤で囲まれた1人だけが本物で、
//              あとは生成されたともだち。
//   下の白場 = 「1 → 20」の見出しと、読ませない細字とカメラ。
// 動くもの: 右端にもう1人フレームインして、数が1つ増える。

const PRINT = "#f4f2ea"; // 印画紙
const EDGE = "#20242c";
const RED = "#d82800";
const GRASS = "#3aa03c";
const GRASS_DK = "#1f7030";

// 7x13 の人。h=髪 f=肌 e=目 s=服 S=服の陰 p=ズボン b=靴
const BODY = [
  "..hhh..",
  ".hhhhh.",
  ".hfffh.",
  ".fefef.",
  ".fffff.",
  ".SsssS.",
  "sssssss",
  "sssssss",
  ".sssss.",
  ".ppppp.",
  ".pp.pp.",
  ".pp.pp.",
  ".bb.bb.",
];
const HEAD = BODY.slice(0, 7);

type Person = {
  h: string;
  f: string;
  s: string;
  p: string;
  /** cap=帽子 long=長い髪 wave=手を挙げている */
  acc?: "cap" | "long" | "wave";
};

const SKIN_A = NES.skin;
const SKIN_B = "#d8935c";
const SKIN_C = "#ffd9b4";

// 前列。左から4人目だけが本物
const FRONT: Person[] = [
  { h: "#2a1a18", f: SKIN_A, s: NES.red, p: "#26315c" },
  { h: "#7a4a1c", f: SKIN_B, s: NES.cyan, p: "#4d5a66", acc: "cap" },
  { h: NES.gold, f: SKIN_C, s: "#f0f0e8", p: NES.brown, acc: "long" },
  { h: "#2a1a18", f: SKIN_A, s: NES.yellow, p: NES.blue }, // 本物
  { h: "#a5a5ad", f: SKIN_A, s: NES.green, p: "#26315c", acc: "wave" },
  { h: "#7a4a1c", f: SKIN_C, s: NES.purple, p: "#5a3a1c" },
  { h: "#2a1a18", f: SKIN_B, s: NES.orange, p: "#4d5a66", acc: "cap" },
  { h: NES.pink, f: SKIN_C, s: NES.blueLt, p: "#26315c", acc: "long" },
  { h: "#7a4a1c", f: SKIN_A, s: NES.pink, p: "#3a3a44" },
  { h: "#2a1a18", f: SKIN_C, s: NES.teal, p: "#5a3a1c", acc: "cap" },
];
// 後列。頭だけ見えている
const BACK: Person[] = [
  { h: "#7a4a1c", f: SKIN_A, s: NES.magenta, p: "#000" },
  { h: "#2a1a18", f: SKIN_C, s: NES.lime, p: "#000" },
  { h: NES.gold, f: SKIN_B, s: NES.blue, p: "#000" },
  { h: "#2a1a18", f: SKIN_A, s: NES.orange, p: "#000", acc: "cap" },
  { h: "#7a4a1c", f: SKIN_C, s: NES.cyanLt, p: "#000" },
  { h: "#a5a5ad", f: SKIN_A, s: NES.red, p: "#000" },
  { h: NES.pink, f: SKIN_B, s: NES.yellow, p: "#000", acc: "long" },
  { h: "#2a1a18", f: SKIN_C, s: NES.greenLt, p: "#000" },
  { h: "#7a4a1c", f: SKIN_A, s: NES.violet, p: "#000", acc: "cap" },
  { h: NES.gold, f: SKIN_C, s: NES.red, p: "#000" },
];
const NEWCOMER: Person = {
  h: NES.gold,
  f: SKIN_B,
  s: NES.lime,
  p: NES.brown,
  acc: "wave",
};

export const art: LabelArt = {
  slug: "friends",
  swatch: [PRINT, NES.blueLt, GRASS, NES.yellow, RED],

  draw: (g, t) => {
    const person = (
      x: number,
      y: number,
      p: Person,
      rows: readonly string[],
    ) => {
      g.blit(x, y, rows, {
        h: p.h,
        f: p.f,
        e: "#2a1a18",
        s: p.s,
        S: shade(p.s, -0.3),
        p: p.p,
        b: "#241f1c",
      });
      if (p.acc === "cap") {
        g.hline(x + 1, y, 5, NES.red);
        g.hline(x, y + 1, 7, NES.redDk);
        g.px(x + 3, y - 1, NES.red);
      }
      if (p.acc === "long") {
        g.vline(x + 1, y + 2, 5, p.h);
        g.vline(x + 5, y + 2, 5, p.h);
      }
      if (p.acc === "wave" && rows.length > 7) {
        g.vline(x + 6, y + 3, 3, p.s);
        g.px(x + 6, y + 2, p.f);
        g.px(x + 5, y + 2, p.f);
      }
    };

    // ── 印画紙 ────────────────────────────────────────────
    g.rect(0, 0, 68, 40, PRINT);
    g.rect(2, 2, 64, 30, EDGE); // 写真のふち
    g.clip(3, 3, 62, 28); // ここから先は写真の中だけ

    // ── 空 ───────────────────────────────────────────────
    g.ditherV(3, 3, 62, 23, "#3cbcfc", "#b4f0fc");
    // 太陽
    g.disc(56, 7, 4, NES.yellow);
    g.disc(56, 7, 2, "#fff4b0");
    for (let a = 0; a < 8; a++) {
      const rad = (a * Math.PI) / 4;
      const sx = 56 + Math.round(Math.cos(rad) * 6);
      const sy = 7 + Math.round(Math.sin(rad) * 6);
      // 写真の縁にかかる光条は出さない。切れた1pxが消し忘れに見える。
      if (sy < 5) continue;
      g.px(sx, sy, NES.gold);
    }
    // 雲
    g.blit(7, 4, ["..###..", ".#####.", "#######"], { "#": "#fcfcfc" });
    g.blit(6, 6, [".#####.."], { "#": "#dceef8" });
    g.blit(30, 3, ["..####..", ".######.", "########"], { "#": "#fcfcfc" });
    g.blit(29, 5, [".######."], { "#": "#dceef8" });
    g.blit(44, 7, ["..###.", ".#####"], { "#": "#eaf8fc" });

    // ── 草地 ─────────────────────────────────────────────
    g.rect(3, 26, 62, 5, GRASS);
    g.hline(3, 26, 62, "#5cc44c");
    g.rect(3, 28, 62, 3, GRASS_DK, "half");
    g.hline(3, 30, 62, "#175a26");
    for (let i = 0; i < 22; i++)
      g.px(4 + i * 3 - (i & 1), 27 + (i % 3), "#7ad85c");

    // ── 後列 ─────────────────────────────────────────────
    for (let i = 0; i < BACK.length; i++) person(4 + i * 6, 8, BACK[i], HEAD);

    // ── 前列 ─────────────────────────────────────────────
    for (let i = 0; i < FRONT.length; i++)
      person(1 + i * 6, 14, FRONT[i], BODY);

    // ── 動くもの: 右端からもう1人フレームインする ───────
    const joined = t >= 0.5;
    if (joined) person(60, 14, NEWCOMER, BODY);

    // ── 本物はこの1人だけ。顔検出のような四隅の鉤で囲う ──
    // 群衆は赤い服だらけなので、鉤は白＋影にして必ず抜けるようにする
    const rx = 1 + 3 * 6 + 3; // 前列4人目の頭の中心
    const bracket = (c: string, o: number) => {
      for (const [sx, sy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const cx = rx + sx * 6 + o;
        const cy = 17 + sy * 6 + o;
        g.hline(sx < 0 ? cx : cx - 3, cy, 4, c);
        g.vline(cx, sy < 0 ? cy : cy - 3, 4, c);
      }
    };
    bracket("#101418", 1);
    bracket(NES.white, 0);
    g.px(rx + 6, 11, RED);
    g.px(rx - 6, 23, RED);

    g.unclip();
    g.frame(3, 3, 62, 28, "#00000033");
    g.frame(2, 2, 64, 30, EDGE);

    // ── 下の白場 ─────────────────────────────────────────
    // 題字・実数・カメラ・発行元。読ませない細字はやめて、題字に置き換えた。
    g.text3x5(3, 33, "FRIENDS", EDGE);
    g.text3x5(33, 33, "1", EDGE);
    g.hline(38, 35, 5, EDGE); // 矢印
    g.px(42, 34, EDGE);
    g.px(42, 36, EDGE);
    g.px(41, 33, EDGE);
    g.px(41, 37, EDGE);
    g.text3x5(45, 33, joined ? "21" : "20", RED);
    // 小さなカメラ
    g.blit(
      53,
      32,
      ["..##...", "#######", "#..#..#", "#.###.#", "#..#..#", "#######"],
      {
        "#": "#585660",
      },
    );
    g.px(56, 34, "#a8c8e8");
    g.px(56, 35, "#a8c8e8");
    g.px(55, 35, "#7098c8");

    // ── 外枠 ─────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。
    g.frame(0, 0, 68, 40, EDGE);
    mark(g, EDGE, PRINT);
  },
};
