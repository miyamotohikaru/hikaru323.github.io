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
    // 左右の縦バナー。まず外周を潰す。
    adBox(g, 1, 9, 14, 21, CYAN);
    stripes(g, 2, 10, 12, 19, "#5ce0f2", 9);
    logo(g, 0, 4, 11, WHITE, MAGENTA);
    g.text3x5(4, 19, "AD", INK);
    g.rect(3, 24, 11, 5, YELLOW);
    g.frame(3, 24, 11, 5, INK);
    g.poly(
      [
        [8, 25],
        [11, 26],
        [8, 27],
      ],
      RED,
    );
    g.px(5, 26, RED);
    g.px(6, 26, RED);

    adBox(g, 50, 8, 17, 19, ORANGE);
    stripes(g, 51, 9, 15, 17, "#ffab54", 9);
    logo(g, 1, 52, 10, WHITE, BLUE);
    g.rect(60, 10, 5, 7, WHITE);
    g.frame(60, 10, 5, 7, INK);
    g.px(61, 12, INK);
    g.px(63, 12, INK);
    g.hline(61, 14, 3, INK);
    g.rect(52, 18, 13, 7, WHITE);
    g.frame(52, 18, 13, 7, INK);
    g.text3x5(54, 19, "NEW", RED, 1);

    // 上の帯。看板がいちばん大きい。
    // 左端の白い札だけが広告ではなく、このゲームの題字。まだ塗り潰されていない。
    adBox(g, 1, 1, 66, 9, MAGENTA);
    stripes(g, 2, 2, 64, 7, YELLOW, 8);
    g.rect(2, 2, 64, 7, "#e02a86", "half");
    g.rect(19, 2, 34, 7, MAGENTA);
    g.text3x5(21, 3, "MEGA SALE", WHITE);
    g.rect(2, 2, 15, 7, WHITE);
    g.frame(2, 2, 15, 7, INK);
    g.text3x5(4, 3, "ADS", INK, 1);
    g.hline(4, 7, 11, RED);
    logo(g, 2, 58, 2, WHITE, CYAN);

    // 下の帯。
    adBox(g, 1, 30, 47, 9, LIME);
    stripes(g, 2, 31, 45, 7, "#b6f05c", 9);
    logo(g, 1, 3, 31, WHITE, RED);
    // 文字は下地の上に直に置く。白い箱で敷くと帯の色が消えてしまう。
    g.text3x5(12, 33, "TAP HERE", "#4c7a12");
    g.text3x5(12, 32, "TAP HERE", INK);
    g.rect(43, 31, 4, 7, WHITE);
    g.frame(43, 31, 4, 7, INK);
    g.poly(
      [
        [44, 33],
        [46, 34],
        [44, 36],
      ],
      RED,
    );

    // ── ゲーム本体が追いやられた窓 ─────────────────────────
    // 残ったのは右下のこれだけ。中身はさっき描いた画面の切り抜き。
    // 右下の隅は発行元の印にあけてあるので、窓はそのぶん細い。
    const gx = 49;
    const gy = 28;
    const gw = 10;
    g.rect(gx, gy, gw, 11, "#1a2a5c");
    g.rect(gx, gy + 6, gw, 5, GREEN);
    g.hline(gx, gy + 6, gw, "#63c455");
    g.rect(gx, gy + 8, gw, 3, "#7a4a20");
    g.rect(gx + 3, gy + 2, 3, 4, "#f2e0c0");
    g.rect(gx + 3, gy + 2, 3, 1, RED);
    g.px(gx + 3, gy + 4, INK);
    g.px(gx + 5, gy + 4, INK);
    g.disc(gx + 8, gy + 3, 1, YELLOW);
    g.px(gx + 1, gy + 1, WHITE);
    g.px(gx + 2, gy + 1, WHITE);
    g.frame(gx, gy, gw, 11, WHITE);
    g.frame(gx - 1, gy - 1, gw + 2, 13, INK);

    // ── 割り込みの全画面広告 ───────────────────────────────
    // 見出し帯・図・文言・残り時間。ふつうの広告の作法どおりに組む。
    // うるさくてよいが、読める場所は必ず確保する。
    adBox(g, 15, 11, 34, 17, CREAM);
    g.rect(16, 12, 32, 6, RED);
    g.text3x5(17, 12, "CONGRATS", WHITE, 1);
    g.hline(16, 17, 32, "#a01818");
    // 左に図、右に文言。光条は図の後ろだけに収める。
    for (let a = 0; a < 12; a++) {
      const th = (a / 12) * Math.PI * 2;
      g.line(
        23,
        22,
        Math.round(23 + Math.cos(th) * 7),
        Math.round(22 + Math.sin(th) * 4),
        a % 2 ? "#ffe98a" : YELLOW,
      );
    }
    g.disc(23, 22, 4, YELLOW);
    g.disc(23, 22, 2, "#fff3b0");
    g.px(22, 20, WHITE);
    g.text3x5(31, 18, "WIN!", RED);
    // 星の評価。広告にはいつも付いている。
    for (let i = 0; i < 5; i++) {
      const sx = 31 + i * 4;
      g.px(sx + 1, 24, YELLOW);
      g.hline(sx, 25, 3, YELLOW);
      g.px(sx, 26, YELLOW);
      g.px(sx + 2, 26, YELLOW);
    }
    // 残り時間。減りきると次の広告が出る。
    g.rect(17, 23, 12, 4, WHITE);
    g.frame(17, 23, 12, 4, INK);
    const left = Math.max(0, Math.round(10 * (1 - Math.min(1, t * 2))));
    g.rect(18, 24, left, 2, GREEN);
    g.frame(15, 11, 34, 17, INK);
    // 閉じるボタンは枠の外、左下。
    closeBtn(g, 11, 26);

    // ── 動き: バナーが1枚重なる ────────────────────────────
    if (t > 0.5) {
      adBox(g, 17, 19, 30, 14, BLUE);
      stripes(g, 18, 20, 28, 12, "#5c7ce8", 9);
      g.rect(19, 20, 26, 7, YELLOW);
      g.frame(19, 20, 26, 7, INK);
      g.text3x5(21, 21, "50%OFF", INK);
      g.text3x5(20, 27, "NO ADS", WHITE);
      logo(g, 0, 38, 26, WHITE, MAGENTA);
      closeBtn(g, 13, 31);
    }

    // ── 迷子の閉じるボタンたち ─────────────────────────────
    closeBtn(g, 60, 10);
    closeBtn(g, 9, 27);
    g.rect(44, 6, 10, 7, YELLOW);
    g.frame(44, 6, 10, 7, INK);
    g.text3x5(46, 7, "AD", INK, 1);

    // ── 画面の縁 ───────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。
    g.frame(0, 0, 68, 40, INK);
    mark(g, WHITE, INK);
  },
};
