import type { LabelArt } from "./types";
import { rng, shade, mix, type PixelGfx } from "../gfx";

// 超巨大こすくまくん黒髭危機一髪。
//
// 実物（kosukuma-kikiippatsu.vercel.app）は、深い宇宙にぽつんと浮かぶ巨大な月の上に
// こすくまくんが座っていて、月の全面に世界中から刺された短剣がびっしり生えている。
// その一枚絵をそのまま 68x40 に落とす。主役は「球体・剣・くま」の3つだけ。
// 星と星雲は余韻ぶんだけ。16本のなかでいちばん派手にしていい枠。

const SKY_DEEP = "#06081a";
const SKY_MID = "#0b1030";
const NEBULA = "#171d4a";

// 月の階調。底に落ちる青紫の影から、頂点が受ける光まで5段。
const MOON = ["#2f355f", "#464f7c", "#66708f", "#8b95ab", "#bdc6d3"];

const STEEL = "#e4e9f2";
const STEEL_DK = "#7b849c";
const GOLD = "#e8b23c";
const GOLD_DK = "#96690f";
// 柄の色は5つまで、しかも彩度を落とす。
// 明るい色をたくさん散らすと紙吹雪になって「刺さっている」感じが消える。
// 剣の群れは銀色に見えているのが正しい。色は柄頭の点だけでいい。
const HILTS = ["#b4335f", "#2f68b8", "#b8412e", "#c49b28", "#2f8f86"];

const CORAL = "#f2564a";
const BEAR_L = "#fbf4dd";
const BEAR_C = "#e9dcb6";
const BEAR_S = "#c2b088";
const BEAR_T = "#d6ab77";
const BEAR_K = "#2f2942";

const MCX = 40;
const MCY = 47;
const R = 25;

// 4x4 の整列ディザ。階調の境目をNESらしく刻む。
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// 光の向き。左上やや手前から。
const LX = -0.42;
const LY = -0.72;
const LZ = 0.55;

/**
 * 月面のどこがどの階調かを返す。0..4 の連続値。
 * クレーターもここから引く。描いた色を読み返して暗くすると、
 * 重なったところが際限なく黒くなって穴に見えてしまう。
 */
function moonLevel(x: number, y: number): number {
  const nx = (x - MCX) / R;
  const ny = (y - MCY) / R;
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  const lam = Math.max(0, nx * LX + ny * LY + nz * LZ) * 1.42 + 0.03;
  return Math.max(0, Math.min(MOON.length - 1.001, lam * (MOON.length - 1)));
}
const step = (x: number, y: number, d: number) =>
  MOON[Math.max(0, Math.min(MOON.length - 1, Math.floor(moonLevel(x, y)) + d))];

// こすくまくん。丸い耳・点の目・小さな口。輪郭線は引かず、明るさだけで抜く。
const KUMA = [
  "..CCC.......CCC..",
  ".CLTLC.....CLLSC.",
  ".CLLLC.....CLLSC.",
  ".CCLLCCCCCCCLLSC.",
  "..CCCCCCCCCCCCC..",
  ".CCLLLLLLLLLLLSC.",
  "CCLLLLLLLLLLLLLSC",
  "CLLLLLLLLLLLLLLSC",
  "CLLKKLLLLLLLKKLSC",
  "CLLKKLLLLLLLKKLSC",
  "CLLLLLLLLLLLLLLSC",
  "CLLLLLLKLKLLLLLSC",
  "CLLLLLLLKLLLLLLSC",
  ".CCLLLLLLLLLLLSC.",
  "..CCLLLLLLLLLSC..",
  "...CCCCCCCCCCC...",
];
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
function jp(g: PixelGfx, x: number, y: number, s: string, c: string, sp = 0) {
  let cx = x;
  for (const ch of s) {
    g.textJP(cx, y + (JP_DROP[ch] ?? 0), ch, c);
    cx += 16 + sp;
  }
}
/** 8方向に黒を回してから塗る。字と字のあいだにも黒が入って、画数が繋がらない。 */
function jpEdge(
  g: PixelGfx,
  x: number,
  y: number,
  s: string,
  fill: string,
  edge: string,
  sp = 0,
) {
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
    jp(g, x + dx, y + dy, s, edge, sp);
  jp(g, x, y, s, fill, sp);
}

const KUMA_PAL: Record<string, string> = {
  C: BEAR_C,
  L: BEAR_L,
  S: BEAR_S,
  T: BEAR_T,
  K: BEAR_K,
};

/**
 * 月に刺さった短剣を1本。ang は月の中心から見た向き、base は根元の半径。
 * 手前の面に立つものは奥行きで縮んで見えるので、根元が中心に近いほど短くする。
 */
function dagger(
  g: PixelGfx,
  ang: number,
  base: number,
  len: number,
  hilt: string,
  cx = MCX,
  cy = MCY,
  stuck = true,
) {
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  const nx = -uy;
  const ny = ux;
  const P = (r: number, o = 0) =>
    [Math.round(cx + ux * r + nx * o), Math.round(cy + uy * r + ny * o)] as [number, number];

  // 長さは固定。月に対する実寸で描くと 4px になって剣に見えないので、
  // 「刀身・鍔・柄」の3つが判る最小寸に決め打ちする。
  // 太さは必ず 2px。1px だと引っかき傷にしか見えない。
  const L = len;
  const guardR = base + (L >= 7 ? 4 : 2);
  const seg = (r0: number, r1: number, o: number, c: string) => {
    const a = P(r0, o);
    const b = P(r1, o);
    g.line(a[0], a[1], b[0], b[1], c);
  };
  // 刺さり口の影
  if (stuck) {
    const s = P(base - 1, 1);
    g.px(s[0], s[1], "#171b3a");
  }
  // 両側に暗い縁。月の上でも空でも輪郭が残る。
  seg(base, base + L, 1, "#171b3a");
  seg(base, base + L, -2, "#171b3a");
  // 刀身。左上側に照りを入れる。剣の群れが銀色に見えるのが正しい。
  seg(base, guardR - 1, -1, STEEL);
  seg(base, guardR - 1, 0, STEEL_DK);
  // 鍔は4px。
  for (const o of [-2, -1, 0, 1]) {
    const p = P(guardR, o);
    g.px(p[0], p[1], o === -1 || o === 0 ? GOLD : GOLD_DK);
  }
  // 柄と柄頭
  seg(guardR + 1, base + L - 1, -1, hilt);
  seg(guardR + 1, base + L - 1, 0, shade(hilt, -0.3));
  const p0 = P(base + L, -1);
  const p1 = P(base + L, 0);
  g.px(p0[0], p0[1], shade(hilt, 0.45));
  g.px(p1[0], p1[1], shade(hilt, 0.1));
}

export const art: LabelArt = {
  slug: "kikiippatsu",
  swatch: ["#0a0e28", "#68718f", "#f2564a", "#e8b23c", "#e9dcb6"],
  draw: (g, t) => {
    // ── 宇宙 ───────────────────────────────────────────────
    g.rect(0, 0, 68, 40, SKY_DEEP);
    g.rect(0, 12, 68, 28, SKY_MID, "half");
    g.rect(0, 20, 68, 20, SKY_MID);
    // 斜めに流れる星雲。1段だけ、うっすら。
    g.poly(
      [
        [-4, 22],
        [22, -4],
        [40, -4],
        [10, 30],
      ],
      NEBULA,
      "quarter",
    );
    g.poly(
      [
        [-2, 17],
        [20, -4],
        [30, -4],
        [4, 23],
      ],
      "#232a63",
      "eighth",
    );

    // ── 星 ─────────────────────────────────────────────────
    const rs = rng(9137);
    for (let i = 0; i < 62; i++) {
      const x = 1 + Math.floor(rs() * 66);
      const y = 1 + Math.floor(rs() * 36);
      const k = rs();
      if (k < 0.14) g.px(x, y, "#ffffff");
      else if (k < 0.42) g.px(x, y, "#b9c6f0");
      else g.px(x, y, "#5c68a0");
    }

    // 遠くの地球。剣を刺しているのは世界中の人なので、出どころを1つ置いておく。
    g.disc(59, 11, 3, "#2c62c4");
    g.disc(58, 10, 2, "#3f7ce0");
    g.px(58, 12, "#3f9e52");
    g.px(59, 12, "#3f9e52");
    g.px(60, 11, "#3f9e52");
    g.px(57, 9, "#4f9e6a");
    g.px(58, 9, "#8fd6ff");
    g.px(61, 13, "#1c3f86");
    g.px(60, 13, "#1c3f86");
    // 地球から月へ、点線の航跡
    for (let i = 0; i < 5; i++) {
      const p = 0.16 + i * 0.16;
      const x = Math.round(59 - p * 22);
      const y = Math.round(11 + p * p * 14);
      g.px(x, y, i % 2 === 0 ? "#6f7cb8" : "#48538c");
    }

    // ── 月 ─────────────────────────────────────────────────
    // ランバートを5段に量子化し、境目を整列ディザで繋ぐ。
    for (let y = 21; y < 40; y++) {
      for (let x = 1; x < 67; x++) {
        const dx = x - MCX;
        const dy = y - MCY;
        if (dx * dx + dy * dy > R * R + R * 0.6) continue;
        const f = moonLevel(x, y);
        const idx = Math.floor(f);
        const th = (BAYER[y & 3][x & 3] + 0.5) / 16;
        g.px(x, y, MOON[f - idx > th ? idx + 1 : idx]);
      }
    }
    // 輪郭。左上は照り、右下は落ち込ませて球であることを決める。
    for (let a = -Math.PI * 0.995; a < -0.005; a += 0.02) {
      const x = Math.round(MCX + Math.cos(a) * (R - 0.4));
      const y = Math.round(MCY + Math.sin(a) * (R - 0.4));
      if (y < 21 || y > 39) continue;
      g.px(x, y, Math.cos(a) < 0.1 ? "#cfd8e4" : "#4d5578");
    }

    // クレーター。下地の色を読んで、その場の階調から掘る。
    const rc = rng(4471);
    for (let i = 0; i < 34; i++) {
      const a = -Math.PI + rc() * Math.PI;
      const rr = Math.sqrt(rc()) * (R - 3);
      const cx = Math.round(MCX + Math.cos(a) * rr);
      const cy = Math.round(MCY + Math.sin(a) * rr);
      if (cy < 22 || cy > 38 || cx < 2 || cx > 65) continue;
      const rad = rc() < 0.6 ? 1 : 2;
      g.disc(cx, cy, rad, step(cx, cy, -1));
      g.px(cx + rad, cy + rad - 1, step(cx, cy, 1));
      g.px(cx + rad, cy, step(cx, cy, 1));
      g.px(cx, cy - rad, step(cx, cy, 1));
    }
    // 海。球の大きさを出すために2つだけ、輪郭をぼかして置く。
    for (const [sx, sy, rx, ry] of [
      [24, 33, 7, 3],
      [48, 29, 5, 2],
    ]) {
      g.ellipse(sx, sy, rx, ry, step(sx, sy, -1), "half");
      g.ellipse(sx, sy, rx - 2, ry - 1, step(sx, sy, -1));
    }

    // ── 短剣 ───────────────────────────────────────────────
    // 縁から外へ突き出るものと、手前の面に立っているもの。
    // 真上（くまが座っている範囲）には長い剣を置かない。角を生やさないため。
    const LIMB: Array<[number, number, number]> = [
      [-2.76, 8, 0],
      [-2.5, 9, 3],
      [-2.24, 8, 1],
      [-2.0, 8, 2],
      [-1.14, 9, 4],
      [-0.88, 8, 0],
      [-0.62, 8, 2],
      [-0.38, 9, 3],
      [-0.14, 8, 1],
    ];
    for (const [a, len, h] of LIMB) dagger(g, a, R - 1, len, HILTS[h]);

    // 手前の面に生えたぶん。短く、間隔をあけて棘立って見せる。
    // 数を詰めすぎると球が見えなくなるので、下半分は空けておく。
    const FACE: Array<[number, number, number]> = [
      [-2.86, 20, 1],
      [-2.6, 15, 4],
      [-2.34, 21, 3],
      [-2.02, 13, 2],
      [-1.74, 20, 0],
      [-1.4, 22, 1],
      [-1.1, 15, 4],
      [-0.78, 21, 3],
      [-0.44, 14, 2],
    ];
    for (const [a, rr, h] of FACE) dagger(g, a, rr, 6, HILTS[h]);

    // まだ届いていない剣。左の空いた宙に2本、軌跡の点を引いて飛ばす。
    const FLYING: Array<[number, number, number, number]> = [[13, 37, 0.72, 1]];
    for (const [fx, fy, a, h] of FLYING) {
      for (let i = 1; i <= 4; i++) {
        g.px(
          Math.round(fx - Math.cos(a) * (i * 2 + 3)),
          Math.round(fy - Math.sin(a) * (i * 2 + 3)),
          i < 3 ? "#4d5789" : "#2a3160",
        );
      }
      dagger(g, a, 0, 6, HILTS[h], fx, fy, false);
    }

    // 動き1: 剣が1本増える。刺さった瞬間だけ小さく火花。
    if (t > 0.5) {
      dagger(g, -1.6, R - 1, 9, HILTS[2]);
      if (t < 0.62) {
        const sx = Math.round(MCX + Math.cos(-1.6) * (R - 1));
        const sy = Math.round(MCY + Math.sin(-1.6) * (R - 1));
        g.px(sx - 3, sy, "#fff2b0");
        g.px(sx + 3, sy, "#fff2b0");
        g.px(sx - 2, sy - 2, "#f2564a");
        g.px(sx + 2, sy - 2, "#f2564a");
      }
    }

    // ── こすくまくん ───────────────────────────────────────
    const bx = 32;
    const by = 7;
    // 月の上に落ちる接地影
    g.ellipse(40, 23, 6, 1, "#4a5378");
    g.hline(37, 23, 6, "#3b446a");
    g.blit(bx, by, KUMA, KUMA_PAL);
    // 前足。胴から少しだけはみ出す。
    g.disc(bx - 1, by + 12, 1, BEAR_C);
    g.disc(bx + 17, by + 12, 1, BEAR_C);
    g.px(bx - 1, by + 13, BEAR_S);
    g.px(bx + 17, by + 13, BEAR_S);
    // 目の艶、ほっぺ、頭のてっぺんの照り
    g.px(bx + 4, by + 8, "#7b7396");
    g.px(bx + 13, by + 8, "#7b7396");
    g.px(bx + 2, by + 11, "#eeb69c");
    g.px(bx + 14, by + 11, "#eeb69c");
    g.hline(bx + 6, by + 5, 5, "#fffdf2");

    // ── 瞬く星 ─────────────────────────────────────────────
    // 動き2: 4つだけ明滅する。全体は動かさない。
    const TWINK: Array<[number, number]> = [
      [7, 8],
      [59, 10],
      [50, 3],
      [63, 24],
    ];
    TWINK.forEach(([x, y], i) => {
      const b = 0.5 + 0.5 * Math.sin((t * 2 + i * 0.31) * Math.PI * 2);
      const c = mix("#3f4a80", "#ffffff", b);
      g.px(x, y, c);
      if (b > 0.74) {
        g.px(x - 1, y, mix(SKY_MID, c, 0.55));
        g.px(x + 1, y, mix(SKY_MID, c, 0.55));
        g.px(x, y - 1, mix(SKY_MID, c, 0.55));
        g.px(x, y + 1, mix(SKY_MID, c, 0.55));
      }
    });

    // ── 題字 ───────────────────────────────────────────────
    // 実機の作法どおり、左に2行で組む。1行4字は幅いっぱいになって月を全部食うので、
    // 2字ずつ縦に積んで、右半分を月とくまに明け渡した。
    // 8方向に黒を回す。字間0でも黒が挟まるので、画数の多い漢字が繋がらない。
    jpEdge(g, 3, 2, "危機", "#ffe9a8", "#05071a");
    jpEdge(g, 3, 18, "一髪", CORAL, "#05071a");

    // ── 枠 ─────────────────────────────────────────────────
    // 16枚共通の作法。外周1pxの単色だけ。四隅の飾りはやめた。
    g.frame(0, 0, 68, 40, "#cdd4e4");
    mark(g, "#cdd4e4", SKY_DEEP);
  },
};
