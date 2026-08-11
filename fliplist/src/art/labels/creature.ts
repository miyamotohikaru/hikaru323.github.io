import type { LabelArt } from "./types";
import { shade, type PixelGfx } from "../gfx";

// 生き物の視点 ── 同じ写真を、24種の生き物の目で見る。
//
// 一枚の景色を境目で断ち割って、左は人の目、右は虫の目にする。
// 右側は複眼のます目に割れ、紫外線で見えている花の蜜標が浮かび上がる。
// 下の帯は実物の生き物セレクタ。境目は時間で左右に動く。

type Mode = "human" | "bug";

const P = {
  human: {
    sky1: "#5cb4e8",
    sky2: "#8fd4f4",
    sky3: "#c4ecfc",
    sun: "#fce890",
    sunEdge: "#f0c040",
    hill: "#2f7048",
    hill2: "#3d8c5a",
    field: "#4f9c58",
    field2: "#63b468",
    fieldDk: "#2f6b3c",
    stem: "#2f8a48",
    leaf: "#3d9c56",
    petal: "#f878b8",
    petalEdge: "#c8408c",
    petalDk: "#7a1450",
    guide: "#f878b8",
    core: "#f8d818",
    coreLt: "#fcec9c",
    bee: "#f0c020",
    cloud: "#ffffff",
    cloudSh: "#cfe6f8",
  },
  bug: {
    sky1: "#2b1d64",
    sky2: "#3f3596",
    sky3: "#5a56b8",
    sun: "#ffffff",
    sunEdge: "#a8f0f8",
    hill: "#14384a",
    hill2: "#215a62",
    field: "#164a52",
    field2: "#26706a",
    fieldDk: "#0f333c",
    stem: "#1f6a60",
    leaf: "#2f8474",
    petal: "#f4fcb4",
    petalEdge: "#c2d874",
    petalDk: "#6f8a46",
    guide: "#1c1442",
    core: "#241a52",
    coreLt: "#3c2c78",
    bee: "#e8f0ff",
    cloud: "#1d1550",
    cloudSh: "#150e3c",
  },
} as const;

/** 生き物セレクタの顔。実物の下端に並んでいる丸 */
const FACES: Array<[string, string, string]> = [
  // 体の色, 目の色, 種類の印
  ["#7cc86c", "#ffffff", "frog"],
  ["#e8b45c", "#ffffff", "owl"],
  ["#9a8fb4", "#ffffff", "bat"],
  ["#8c5a3c", "#ffffff", "roach"],
  ["#6cc0b4", "#ffffff", "mantis"],
  ["#7fb4e0", "#ffffff", "dolphin"],
];

/** 蜂。W=翅 #=縞 Y=体 */
const BEE = [".WW.WW.", "..###..", ".#Y#Y#.", "..###.."];

function drawScene(g: PixelGfx, m: Mode) {
  const c = P[m];
  // 空
  g.rect(0, 0, 68, 19, c.sky1);
  g.rect(0, 7, 68, 12, c.sky2);
  g.rect(0, 7, 68, 3, c.sky1, "half");
  g.rect(0, 14, 68, 5, c.sky3);
  g.rect(0, 14, 68, 2, c.sky2, "half");

  // 太陽
  g.disc(7, 5, 4, c.sunEdge);
  g.disc(7, 5, 3, c.sun);
  for (const [dx, dy] of [
    [0, -6],
    [6, 0],
    [0, 6],
    [-6, 0],
    [4, -4],
    [4, 4],
    [-4, 4],
    [-4, -4],
  ]) {
    g.px(7 + dx, 5 + dy, c.sunEdge);
    g.px(7 + Math.round(dx * 0.8), 5 + Math.round(dy * 0.8), c.sunEdge);
  }

  // 虫の目にだけ見える、空の偏光の縞
  if (m === "bug") {
    for (let y = 0; y < 20; y++)
      for (let x = 0; x < 68; x++) if ((x + y * 2) % 9 === 0) g.px(x, y, "#392c88");
    for (let i = 0; i < 7; i++) g.px(10 + i * 9, 2 + ((i * 5) % 12), "#7a72cc");
  }

  // 雲。境目をまたぐので「同じ景色」だと分かる
  const cloud = (x: number, y: number, w: number) => {
    g.ellipse(x, y, w, 2, c.cloud);
    g.ellipse(x - w + 2, y, 3, 1, c.cloud);
    g.ellipse(x + w - 3, y - 1, 3, 2, c.cloud);
    g.hline(x - w + 1, y + 2, w * 2 - 2, c.cloudSh);
  };
  cloud(28, 5, 7);
  cloud(58, 3, 5);

  // 遠い丘
  g.ellipse(12, 22, 22, 5, c.hill);
  g.ellipse(50, 21, 24, 5, c.hill);
  g.ellipse(50, 21, 22, 4, c.hill2);
  g.ellipse(12, 22, 20, 4, c.hill2);

  // 草原
  g.rect(0, 21, 68, 8, c.field);
  g.rect(0, 21, 68, 3, c.field2, "half");
  g.rect(0, 25, 68, 4, c.fieldDk, "half");
  g.rect(0, 27, 68, 2, c.fieldDk);
  for (let x = 1; x < 68; x += 4) {
    g.vline(x, 23, 2, c.field2);
    g.px(x + 2, 26, c.fieldDk);
  }

  // 小さい花（左右に一輪ずつ）
  const small = (sx: number, sy: number) => {
    g.vline(sx, sy, 28 - sy, c.stem);
    g.disc(sx, sy, 3, c.petalDk);
    g.disc(sx, sy, 2, c.petal);
    g.ring(sx, sy, 2, c.guide, 1);
    g.px(sx, sy, c.core);
  };
  small(9, 21);
  small(61, 19);

  // 主役の花。境目にまたがるように置く
  const fx = 37;
  const fy = 12;
  g.vline(fx, fy + 6, 13, c.stem);
  g.vline(fx + 1, fy + 9, 10, shade(c.stem, -0.3));
  g.ellipse(fx - 5, fy + 11, 5, 2, c.leaf);
  g.ellipse(fx + 6, fy + 14, 5, 2, c.leaf);
  g.ellipse(fx - 5, fy + 11, 4, 1, shade(c.leaf, 0.22));
  g.ellipse(fx + 6, fy + 14, 4, 1, shade(c.leaf, 0.22));
  // 花びらは付け根から先へ伸びる木の葉型。1枚ずつ縁取りしてから塗る
  const petal = (a: number, len: number, wid: number, col: string) => {
    const dx = Math.cos(a);
    const dy = Math.sin(a) * 0.92;
    const mid = 0.58;
    g.poly(
      [
        [fx + dx * len, fy + dy * len],
        [fx + dx * len * mid - dy * wid, fy + dy * len * mid + dx * wid],
        [fx + dx * 2, fy + dy * 2],
        [fx + dx * len * mid + dy * wid, fy + dy * len * mid - dx * wid],
      ],
      col,
    );
  };
  // 1枚ずつ縁取ってから塗る。重ねる順に描くと花びらの境目が残る
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    petal(a, 11.4, 4.6, c.petalDk);
    petal(a, 10.4, 3.4, c.petalEdge);
    petal(a, 9.2, 2.2, c.petal);
  }
  // 紫外線で見える蜜標。人の目には出ない模様
  g.ring(fx, fy, 5, c.guide, 2);
  g.disc(fx, fy, 3, c.core);
  g.disc(fx, fy, 2, c.coreLt, "half");
  g.px(fx - 1, fy - 1, c.coreLt);

  // 蜂
  g.blit(15, 7, BEE, { W: "#ffffffbb", "#": shade(c.bee, -0.62), Y: c.bee });
}

export const art: LabelArt = {
  slug: "creature",
  swatch: ["#5cb4e8", "#f878b8", "#f8d818", "#2b1d64", "#f4fcb4"],
  draw: (g, t) => {
    const SY0 = 1;
    const SY1 = 28;
    const split = 37 + Math.round(Math.sin(t * Math.PI * 2) * 4);

    // ── 同じ景色を2回。左は人の目、右は虫の目 ────────────────
    g.clip(1, SY0, split - 1, SY1 - SY0 + 1);
    drawScene(g, "human");
    g.clip(split, SY0, 67 - split, SY1 - SY0 + 1);
    drawScene(g, "bug");
    g.unclip();

    // ── 右側を複眼のます目に割る ───────────────────────────
    const hex = (v: number) => v.toString(16).padStart(2, "0");
    const CELL = 2;
    for (let row = 0; ; row++) {
      const cy = SY0 + row * CELL;
      if (cy > SY1) break;
      const off = row % 2 === 0 ? 0 : 1;
      for (let col = -1; ; col++) {
        const cx = split + col * CELL + off;
        if (cx > 66) break;
        const sx = Math.max(split, Math.min(66, cx));
        const sy = Math.min(SY1, cy);
        const [r, gg, b] = g.get(sx, sy);
        const base = `#${hex(r)}${hex(gg)}${hex(b)}`;
        const dim = shade(base, -0.24);
        for (let j = 0; j < CELL; j++)
          for (let i = 0; i < CELL; i++) {
            const x = cx + i;
            const y = cy + j;
            if (x < split || x > 66 || y < SY0 || y > SY1) continue;
            g.px(x, y, i === 0 && j === 0 ? dim : base);
          }
      }
    }

    // ── 境目。左右に動く ──────────────────────────────────
    g.vline(split - 1, SY0, SY1 - SY0 + 1, "#1a1a20");
    g.vline(split, SY0, SY1 - SY0 + 1, "#fdf8ec");
    g.vline(split + 1, SY0, SY1 - SY0 + 1, "#1a1a20");
    // つまみ。花にかからないよう下に置く
    const ky = 24;
    g.rect(split - 4, ky - 4, 9, 9, "#1a1a20");
    g.rect(split - 3, ky - 3, 7, 7, "#fdf8ec");
    g.px(split - 4, ky - 4, null);
    g.px(split + 4, ky - 4, null);
    g.px(split - 4, ky + 4, null);
    g.px(split + 4, ky + 4, null);
    g.hline(split - 3, ky + 3, 7, "#c8c0ac");
    // 左右の矢印
    g.px(split - 2, ky, "#1a1a20");
    g.vline(split - 1, ky - 1, 3, "#1a1a20");
    g.px(split + 2, ky, "#1a1a20");
    g.vline(split + 1, ky - 1, 3, "#1a1a20");

    // ── どちらの目か。ます目のあとに置くので潰れない ──────────
    const tag = (x: number, y: number, s: string, fg: string) => {
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ])
        g.text3x5(x + dx, y + dy, s, "#11131a");
      g.text3x5(x, y, s, fg);
    };
    tag(3, 23, "HUMAN", "#fdf8ec");
    tag(55, 23, "BEE", "#d8f4a0");

    // ── 下の帯。生き物セレクタ ─────────────────────────────
    g.rect(0, 29, 68, 11, "#efe6d0");
    g.hline(0, 29, 68, "#c0b498");
    g.rect(0, 37, 68, 3, "#ded2b4");
    g.noise(0, 30, 68, 9, "#e2d6bc", 0.12, 13);
    FACES.forEach(([body, eye, kind], i) => {
      const cx = 6 + i * 9;
      const cy = 34;
      g.disc(cx, cy, 4, "#00000018");
      g.disc(cx, cy, 3, shade(body, -0.35));
      g.disc(cx, cy, 3, body, "solid");
      g.ring(cx, cy, 3, shade(body, -0.3), 1);
      g.px(cx - 1, cy, "#241f18");
      g.px(cx + 1, cy, "#241f18");
      if (kind === "frog") {
        g.px(cx - 2, cy - 3, body);
        g.px(cx + 2, cy - 3, body);
        g.px(cx - 2, cy - 2, "#241f18");
        g.px(cx + 2, cy - 2, "#241f18");
      } else if (kind === "owl") {
        g.ring(cx - 1, cy, 1, eye, 1);
        g.ring(cx + 1, cy, 1, eye, 1);
        g.px(cx, cy + 1, "#8a5a20");
      } else if (kind === "bat") {
        g.px(cx - 3, cy - 3, "#241f18");
        g.px(cx + 3, cy - 3, "#241f18");
        g.px(cx - 2, cy - 3, shade(body, -0.2));
        g.px(cx + 2, cy - 3, shade(body, -0.2));
      } else if (kind === "roach") {
        g.px(cx - 2, cy - 4, "#241f18");
        g.px(cx + 2, cy - 4, "#241f18");
        g.px(cx - 1, cy - 3, "#241f18");
        g.px(cx + 1, cy - 3, "#241f18");
        g.vline(cx, cy - 1, 4, shade(body, -0.35));
      } else if (kind === "mantis") {
        g.px(cx - 2, cy - 4, shade(body, -0.4));
        g.px(cx + 2, cy - 4, shade(body, -0.4));
        g.px(cx - 3, cy - 1, "#241f18");
        g.px(cx + 3, cy - 1, "#241f18");
      } else {
        g.px(cx + 3, cy, body);
        g.px(cx + 4, cy + 1, body);
        g.hline(cx - 2, cy + 2, 3, shade(body, 0.3));
      }
      // いま選ばれているもの
      if (i === 4) {
        g.ring(cx, cy, 5, "#1a1a20", 1);
        g.px(cx, cy - 6, "#1a1a20");
        g.hline(cx - 1, cy - 7, 3, "#1a1a20");
      }
    });
    // 全24種
    g.text3x5(58, 32, "24", "#5c5346");
    g.px(57, 32, "#5c5346");
    g.px(57, 36, "#5c5346");
    g.hline(56, 31, 10, "#c0b498");
    g.hline(56, 37, 10, "#c0b498");

    // ── 枠 ──────────────────────────────────────────────
    g.frame(0, 0, 68, 40, "#1a1a20");
    g.frame(1, 1, 66, 38, "#3f6b46");
    g.px(1, 1, "#1a1a20");
    g.px(66, 1, "#1a1a20");
    g.px(1, 38, "#1a1a20");
    g.px(66, 38, "#1a1a20");
  },
};
