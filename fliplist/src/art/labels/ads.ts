import type { LabelArt } from "./types";
import type { PixelGfx } from "../gfx";

// 世界一広告の多いゲーム。まだ制作中。
//
// 描くのは「ゲーム画面が広告に埋め尽くされている」その一枚。
// 先にゲームの画面をまるごと描いて、その上から広告で塗り潰す。
// 隙間の1pxから空と地面がのぞくのは、下にちゃんとゲームがあるという証拠。
// 閉じるボタンは必ず枠の外に置く。押せない。
//
// 実在の企業名・商標・ロゴは一切描かない。中身のない広告だけを描く。
// この1枚だけはわざとうるさくしてよいが、次の規律だけは崩さない:
//   - すべての面は軸に平行
//   - すべての面に同じ1pxの黒い縁
//   - 色は10色まで

const INK = "#14121c";
const WHITE = "#ffffff";
const CREAM = "#f4f0e0";
const MAGENTA = "#e02a86";
const YELLOW = "#ffd21e";
const CYAN = "#1ec8e0";
const ORANGE = "#f27a1e";
const LIME = "#8ede2a";
const RED = "#e63030";
const BLUE = "#2a52d0";
const GREEN = "#3a9e3a";

// ── 発行元の印 ──────────────────────────────────────────
// 16枚すべて同じ意匠・同じ位置・同じ大きさ。右下の隅に 5x5 のくまの顔。
const MARK = ["#...#", ".###.", "#####", "#o#o#", ".#o#."];
function mark(g: PixelGfx, body: string, eye: string) {
  g.blit(61, 33, MARK, { "#": body, o: eye });
}

/** 広告の面。縁と上辺のハイライトを必ず同じ作法で入れる。 */
function adBox(g: PixelGfx, x: number, y: number, w: number, h: number, bg: string) {
  g.rect(x + 1, y + 1, w, h, "#00000055");
  g.rect(x, y, w, h, bg);
  g.hline(x + 1, y + 1, w - 2, "#ffffff4d");
  g.frame(x, y, w, h, INK);
}

/** 斜めのストライプ。矩形の中だけに収める。 */
function stripes(g: PixelGfx, x: number, y: number, w: number, h: number, c: string, p = 7) {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) if ((i + j) % p < 3) g.px(x + i, y + j, c);
}

/** 閉じるボタン。いつも面の外にずれている。 */
function closeBtn(g: PixelGfx, x: number, y: number) {
  g.rect(x, y, 7, 7, WHITE);
  g.frame(x, y, 7, 7, INK);
  g.line(x + 2, y + 2, x + 4, y + 4, INK);
  g.line(x + 4, y + 2, x + 2, y + 4, INK);
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
/** 8方向に黒を回してから塗る。広告の地はどれも彩度が高いので、これが要る。 */
function jpEdge(g: PixelGfx, x: number, y: number, s: string, fill: string, edge: string) {
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
    jp(g, x + dx, y + dy, s, edge);
  jp(g, x, y, s, fill);
}

/** 中身のない社章。丸・三角・四角の組み合わせだけで作る。 */
function logo(g: PixelGfx, kind: number, x: number, y: number, a: string, b: string) {
  if (kind === 0) {
    g.rect(x, y, 7, 7, a);
    g.disc(x + 3, y + 3, 2, b);
  } else if (kind === 1) {
    g.disc(x + 3, y + 3, 3, a);
    g.poly(
      [
        [x + 3, y + 1],
        [x + 6, y + 5],
        [x, y + 5],
      ],
      b,
    );
  } else {
    g.rect(x, y, 7, 7, a);
    g.rect(x, y, 4, 4, b);
    g.rect(x + 4, y + 4, 3, 3, b);
  }
  g.frame(x, y, 7, 7, INK);
}

export const art: LabelArt = {
  slug: "ads",
  swatch: ["#e02a86", "#ffd21e", "#1ec8e0", "#8ede2a", "#14121c"],
  draw: (g, t) => {
    // ── 下にあるゲーム本体 ─────────────────────────────────
    // ほとんど見えなくなるが、隙間からのぞくので手は抜かない。
    g.rect(0, 0, 68, 40, "#1a2a5c");
    g.rect(0, 0, 68, 14, "#263f7e");
    g.rect(6, 5, 9, 3, "#5a7cc4");
    g.rect(40, 3, 11, 3, "#5a7cc4");
    g.rect(0, 27, 68, 13, GREEN);
    g.hline(0, 27, 68, "#63c455");
    g.rect(0, 30, 68, 10, "#7a4a20");
    g.rect(0, 30, 68, 10, "#5c3416", "quarter");
    for (let i = 0; i < 68; i += 9) g.rect(i, 20, 5, 3, "#c88a3a");
    // 草。広告の隙間からのぞくのはここだけなので、この2列に手を入れておく。
    for (let i = 2; i < 68; i += 5) {
      g.px(i, 28, "#2a7a2a");
      g.px(i + 2, 29, "#2a7a2a");
      g.px(i + 1, 28, "#8ede2a");
    }
    g.rect(24, 28, 3, 2, YELLOW);
    g.px(25, 27, YELLOW);
    g.rect(38, 26, 5, 4, "#2a7a2a");
    g.hline(38, 26, 5, "#63c455");
    // 主人公。1体だけ、はっきり描いておく。
    g.rect(30, 21, 5, 6, "#f2e0c0");
    g.rect(30, 21, 5, 2, RED);
    g.px(31, 24, INK);
    g.px(33, 24, INK);
    g.rect(29, 25, 2, 2, BLUE);
    g.rect(34, 25, 2, 2, BLUE);
    g.disc(47, 16, 2, YELLOW);

    // ── 広告 ───────────────────────────────────────────────
    // 題字も広告の一枚として組む。この企画に限っては、それが正しい。
    // 上の看板が「広告」、割り込みの全画面が「だらけ」。合わせて読ませる。
    // 下のゲームが見えるのは、帯と帯のあいだの2行と、右の細い窓だけ。

    // 上の看板。ここに和文の題字を大きく打つ。
    adBox(g, 1, 1, 66, 18, MAGENTA);
    stripes(g, 2, 2, 64, 16, YELLOW, 8);
    g.rect(2, 2, 64, 16, "#e02a86", "half");
    jpEdge(g, 3, 2, "広告", YELLOW, INK);
    // 右にたたき売りの札
    g.rect(41, 3, 23, 7, WHITE);
    g.frame(41, 3, 23, 7, INK);
    g.text3x5(43, 4, "SALE", RED, 1);
    g.hline(43, 8, 19, RED);
    logo(g, 2, 41, 11, WHITE, CYAN);
    g.rect(50, 11, 14, 6, YELLOW);
    g.frame(50, 11, 14, 6, INK);
    g.text3x5(53, 12, "NEW", INK);

    // 割り込みの全画面広告。ここが題字の2行目。
    adBox(g, 1, 21, 51, 18, CREAM);
    jpEdge(g, 3, 22, "だらけ", INK, CREAM);
    g.hline(2, 38, 49, RED);

    // 右の細い窓。追いやられたゲーム本体はここだけ。
    g.rect(52, 21, 15, 18, "#1a2a5c");
    g.rect(52, 30, 15, 9, GREEN);
    g.hline(52, 30, 15, "#63c455");
    g.rect(52, 33, 15, 6, "#7a4a20");
    g.rect(56, 25, 4, 5, "#f2e0c0");
    g.rect(56, 25, 4, 2, RED);
    g.px(57, 28, INK);
    g.px(59, 28, INK);
    g.disc(63, 24, 1, YELLOW);
    g.px(54, 23, WHITE);
    g.px(55, 23, WHITE);
    g.frame(52, 21, 15, 18, WHITE);
    g.frame(51, 20, 17, 20, INK);

    // ── 動き: バナーが1枚重なる ────────────────────────────
    if (t > 0.5) {
      adBox(g, 30, 10, 30, 12, BLUE);
      stripes(g, 31, 11, 28, 10, "#5c7ce8", 9);
      g.rect(32, 11, 26, 6, YELLOW);
      g.frame(32, 11, 26, 6, INK);
      g.text3x5(34, 12, "50%OFF", INK);
      g.text3x5(33, 18, "NO ADS", WHITE);
      closeBtn(g, 26, 18);
    }

    // ── 迷子の閉じるボタンたち ─────────────────────────────
    // どれも面の外にずれている。押せない。
    closeBtn(g, 45, 16);
    closeBtn(g, 8, 17);
    closeBtn(g, 60, 15);
    const left = Math.max(0, Math.round(10 * (1 - Math.min(1, t * 2))));
    g.rect(38, 32, 12, 4, WHITE);
    g.frame(38, 32, 12, 4, INK);
    g.rect(39, 33, left, 2, GREEN);

    // ── 画面の縁 ───────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。
    g.frame(0, 0, 68, 40, INK);
    mark(g, WHITE, INK);
  },
};
