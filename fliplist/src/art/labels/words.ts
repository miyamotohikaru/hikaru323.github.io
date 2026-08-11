import type { LabelArt } from "./types";
import { PixelGfx, rng } from "../gfx";

// 存在しない言葉辞典 / FICTIONARY。世の中にない言葉だけが載っている辞書。
//
// 図の骨組み: 上26行がえんじの布装の表紙で、題字を金の箔押しで2行に組む。
//   その下に窓が空いていて、そこから辞書の見開きが見えている。
//   見開き= ゆるく反った紙面。喉（のど）の影で2ページに分かれる。
//           各ページの頭に読める見出し語をひとつ、その下に罫、
//           さらに下は読ませない1pxの帯（＝語釈）。
// 動くもの: 右ページの語釈の末尾に、新しい見出し語が1つ増える。
//
// 題字を9文字とも入れるために、丈40行のうち25行(y=2..26)を題字に明け渡した。
// 見開きに残るのは11行(y=28..38)だけなので、木版の図は落とし、語釈は1行に詰めた。
// 丈で見せられなくなった本の反りは、喉へ向かう明暗と、天の2pxの落ち込みで見せる。

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

// ── 題字 ────────────────────────────────────────────────
// 9文字を1行に流すと 9x13=117px でラベルの倍近い。16pxでは1行4文字が限界
// （5文字で80px > 68px）なので、13px で「存在しない」「言葉辞典」の2行に割る。
// 13px は textJP の下限。12px にすると葉と辞の横画が繋がって黒い塊になる。
const T_SIZE = 13;
const T_A = "存在しない";
const T_B = "言葉辞典";
/** 上の行の天。枠(y=0)に金がくっつくと題字が枠から生えて見えるので1行あける。 */
const T_Y1 = 2;
/** 下の行の天。行間は1px。 */
const T_Y2 = 15;
/**
 * 字母を1bitに落とすときの閾値。
 * 既定の128だと13pxでは言・葉・辞の横画が中間調で繋がり、言はほぼ黒い塊になる
 * （16px設計の書体を13pxに縮めるので、1本の横画が0.8px幅になって隣と溶ける）。
 * 190まで上げると中間調が落ちて画と画の間が開き、9文字とも画数が数えられる。
 * 上げすぎ（230）ると今度は画そのものが消えるので、この辺りが底。
 */
const T_TH = 190;

// ── 和文を枡に据える ────────────────────────────────────
// textJP は「インクの外接矩形」の左上を (x,y) に置く。字送りではないので、
// 13px 間隔で流すと字ごとに左右上下へずれる。枡に入れ直すために墨の寸法を測る。
// 測り方: 空の紙に1文字だけ刷って、墨の付いた範囲を数える。字母は gfx 側で
// 使い回されるので、実費は1文字につき1回きり。
type Ink = { w: number; h: number };
const inkCache = new Map<string, Ink>();
function inkBox(ch: string, size: number, threshold: number): Ink {
  const key = `${ch}|${size}|${threshold}`;
  const hit = inkCache.get(key);
  if (hit) return hit;
  const probe = new PixelGfx(size * 2, size * 2);
  probe.textJP(0, 0, ch, "#ffffff", { size, threshold });
  let w = 0;
  let h = 0;
  for (let y = 0; y < probe.h; y++)
    for (let x = 0; x < probe.w; x++)
      if (probe.data[(y * probe.w + x) * 4 + 3] > 0) {
        if (x + 1 > w) w = x + 1;
        if (y + 1 > h) h = y + 1;
      }
  const box: Ink = { w, h };
  inkCache.set(key, box);
  return box;
}

/** 題字全体でいちばん背の高い字の墨。行の高さの基準。行ごとに測ると行間がずれる。 */
function ascent(s: string, size: number, threshold: number): number {
  let a = 0;
  for (const ch of s) a = Math.max(a, inkBox(ch, size, threshold).h);
  return a;
}

/**
 * 1行ぶんの題字。size幅の枡を並べて、墨を枡の中央に据える。
 *
 * 縦も横も「墨の中央」で揃えるのが正しい。この書体を実測すると、
 * 中央に据えた位置は書体自身の左サイドベアリング／ベースラインと
 * 9文字とも1pxの狂いもなく一致した（漢字は左0・仮名は左1、
 * 背の低い し=1 い=2 言=1 だけ下がる）。「ー」のように宙に浮く字も
 * 中央に据えれば正しい位置に来る（16pxで落とし7px＝旧JP_DROPと同値）。
 * 例外は「の」「ッ」のようにベースラインより下に垂れる字だけで、題字には無い。
 *
 * 行そのものも、字送りではなく墨の左右端でラベルの中央に合わせる。
 */
function jpRow(
  g: PixelGfx,
  y: number,
  s: string,
  c: string,
  size: number,
  asc: number,
  shadow?: string,
) {
  const chars = [...s];
  const lead = (ch: string) => Math.round((size - inkBox(ch, size, T_TH).w) / 2);
  const last = chars[chars.length - 1];
  const inkW = (chars.length - 1) * size + lead(last) + inkBox(last, size, T_TH).w - lead(chars[0]);
  const x0 = Math.round((68 - inkW) / 2) - lead(chars[0]);
  // 箔押しの窪み。閾値を上げた字は画が1pxまで細るので、布の目の上だと沈む。
  // 右下に1pxだけ影を敷くと、金が布から押し出されて見える。影が先、金が後。
  const passes: Array<[number, string]> = shadow ? [[1, shadow], [0, c]] : [[0, c]];
  for (const [off, col] of passes) {
    let cx = x0;
    for (const ch of chars) {
      const b = inkBox(ch, size, T_TH);
      g.textJP(cx + lead(ch) + off, y + Math.round((asc - b.h) / 2) + off, ch, col, {
        size,
        threshold: T_TH,
      });
      cx += size;
    }
  }
}

// ── 見開き ──────────────────────────────────────────────
const WIN_BOT = 38; // 窓の地。ここは小口の紙束
const SPINE = 33.5;
const HALF = 30.5;
/**
 * 紙の天。喉に近いほど下がる＝開いた本のハンモック形。
 * 丈が11行しかないので反りは2pxが限度だが、これが無いとただの紙片に見える。
 * 題字の墨は x=8..59 に来るので、そこだけは 28 より上げない（金と紙がくっつく）。
 */
const paperTop = (x: number) => {
  const d = (x - SPINE) / HALF;
  const y = 27 + Math.round((1 - d * d) * 2);
  return x >= 8 && x <= 59 ? Math.max(28, y) : y;
};

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

    // ── 題字。表紙の天に金の箔押しで2行 ──────────────────
    // 「存在しない」5文字 x 13px = 65px。ラベルの内側は66pxなので、
    // これが1行に入る最大。上の行 y=2..13、下の行 y=15..26。
    const asc = ascent(T_A + T_B, T_SIZE, T_TH);
    jpRow(g, T_Y1, T_A, GOLD, T_SIZE, asc, COVER_DK);
    jpRow(g, T_Y2, T_B, GOLD, T_SIZE, asc, COVER_DK);
    // 下の行は7px 短いので、両脇に箔押しの短い罫を入れて幅を揃える。
    g.hline(2, 20, 4, GOLD);
    g.hline(62, 20, 4, GOLD);

    // ── 紙面 ─────────────────────────────────────────────
    // 窓は x=3..64。左右に2pxずつ表紙を残して「表紙に空いた窓」に見せる。
    // 紙は喉へ向かって落ち込むので、喉に近いほど暗い。丈で見せられない反りを
    // 明暗で見せる。これが無いと、ただの白い帯にしか見えない。
    for (let x = 3; x <= 64; x++) {
      const top = paperTop(x);
      const dx = Math.abs(x - SPINE);
      const tone = dx < 5 ? "#dccfae" : dx < 9 ? "#e8dcbd" : PAPER;
      g.vline(x, top, 37 - top + 1, tone);
      g.px(x, top, dx < 9 ? tone : PAPER_HI); // 天は光を受ける。喉の底までは届かない
      g.px(x, 37, dx < 9 ? "#cdbf9c" : PAPER_DK); // 地は影が溜まる
      g.px(x, WIN_BOT, STACK1); // 小口に見える紙の束
    }
    // 小口の厚み。左右の端に紙の束の側面が1本見える。
    for (const x of [3, 64]) {
      g.vline(x, paperTop(x) + 1, WIN_BOT - paperTop(x), STACK1);
      g.px(x, WIN_BOT, STACK2);
    }
    g.px(4, WIN_BOT, STACK2);
    g.px(63, WIN_BOT, STACK2);
    // 喉の影
    for (const [x, c] of [
      [32, "#cfc09c"],
      [33, "#a89571"],
      [34, "#8a7a5a"],
      [35, "#c2b491"],
    ] as Array<[number, string]>) {
      const top = paperTop(x);
      g.vline(x, top, 38 - top, c);
      g.px(x, WIN_BOT, STACK2); // 喉の底は束が沈む
    }

    // ── 語釈 ─────────────────────────────────────────────
    // 読ませないのが本式。長さの違う墨の帯を並べて1行の文字に見せる。
    const gloss = (cx: number, cw: number, y: number, seed: number) => {
      const r = rng(seed);
      let x = cx;
      while (x < cx + cw) {
        const w = 2 + Math.floor(r() * 5);
        const room = cx + cw - x;
        if (room < 2) break;
        g.hline(x, y, Math.min(w, room), r() < 0.35 ? FAINT : SOFT);
        x += w + 2;
      }
    };

    // 左ページ。見出し語ひとつ、罫、語釈1行。
    g.text3x5(5, 30, "SOREBI", INK);
    g.hline(5, 35, 23, FAINT);
    gloss(5, 25, 36, 3307);

    // 右ページ。罫と語釈は左の段だけ。右の段は空けてある。
    g.text3x5(36, 30, "TOKEBI", INK);
    g.hline(36, 35, 13, FAINT);
    gloss(36, 13, 36, 3313);

    // ── 動くもの: 新しい見出し語が1つ載る ────────────────
    // 右ページの語釈の行、空けてあった末尾に項目が1つ増える。
    // 見出し語は語釈より濃い墨（INK）なので、増えたことは色で分かる。
    // 罫の行(35)に置くと下線の続きに見え、2pxに太らせると墨の箱に見えたので、
    // 語釈と同じ行に、同じ1pxで、色だけ濃く置く。
    if (t >= 0.5) {
      g.hline(50, 36, 6, INK); // 新しい見出し語
      g.hline(58, 36, 2, FAINT); // その読み
    }

    // ── しおり ───────────────────────────────────────────
    // 喉に沿って垂らす。紙面の途中で切れる。下は喉の影を見せたいので短く。
    g.rect(33, 29, 2, 5, RED);
    g.vline(33, 29, 5, "#e8506c");
    g.px(34, 33, "#8c0c24");

    // ── 外枠 ─────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。金の小口に見立てる。
    g.frame(0, 0, 68, 40, GOLD);
    mark(g, GOLD, COVER);
  },
};
