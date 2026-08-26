/**
 * ピクセルアート。
 *
 * 画素が高価だった時代の絵。色数を絞り、輪郭を1画素で作り、
 * 足りない階調はディザ（市松）で目に混ぜさせる。
 *
 * ■ 決め手は4つ
 *   1. 解像度。粗すぎると「ドット絵」ではなく「大きい四角」に見える。
 *      初稿を24×32で描いて失敗した。48×64（1マス12.5px）が下限。
 *   2. 色数を絞ること。ここでは14色。中間色は作らずディザで作る。
 *   3. 稜線をなめらかな関数から作ること。手で刻むとギザギザの塊になる。
 *   4. 暖色を1点だけ置くこと。全部寒色だと絵が沈む。
 *
 * ■ 検分で直したこと
 *   題字だけ本物の書体で刷ってあり、ここだけ画素の格子から外れて
 *   滑らかだった。ドット絵の版で文字がアンチエイリアスされているのは、
 *   網点の版に写真を貼るのと同じ種類の嘘になる。3×5 の字母を起こして
 *   題字も同じマスに乗せた。
 *   ついでに「14 COLOURS」も嘘だった（実際は20色）ので、
 *   数を刷るのをやめ、使った色をそのまま帯に並べた。数えれば分かる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "px";
const COLS = 48;
const ROWS = 64;
const CELL = 600 / COLS; // 12.5

const C = {
  sky: ["#0a0b1c", "#0e1125", "#13172f", "#1a1e3b", "#212648", "#2a3057"],
  moon: "#f6f2dc",
  moonMid: "#ded8bc",
  moonDark: "#b3ad92",
  star: "#e8e4d0",
  starDim: "#8f8d9e",
  far: "#3b3d7a",
  farLit: "#585ba0",
  near: "#191b33",
  nearLit: "#282b48",
  water: "#4a5cd6",
  waterDeep: "#39479f",
  waterLit: "#8bd6f2",
  warm: "#f2c14e",
  red: "#e85c4a",
} as const;

const Px = ({ x, y, w = 1, h = 1, fill, o }: { x: number; y: number; w?: number; h?: number; fill: string; o?: number }) => (
  <rect x={x * CELL} y={y * CELL} width={w * CELL} height={h * CELL} fill={fill} opacity={o} />
);

/** 3×5 の字母。
    絵と同じ48マスで字を組むと、たった9文字で版面の3/4を占めてしまう。
    実機も同じ問題を抱えていて、答えは決まっていた——
    **文字だけ倍の解像度の面に持つ**（アーケード基板やX68000のテキスト面）。
    ここでも字は 1/2 マスの格子に置く。格子から外れてはいないので、
    アンチエイリアスは一切かからない。 */
const FONT: Record<string, string[]> = {
  A: ["###", "#.#", "###", "#.#", "#.#"],
  C: ["###", "#..", "#..", "#..", "###"],
  E: ["###", "#..", "###", "#..", "###"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  L: ["#..", "#..", "#..", "#..", "###"],
  P: ["###", "#.#", "###", "#..", "#.."],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "8": ["###", "#.#", "###", "#.#", "###"],
  " ": ["...", "...", "...", "...", "..."],
};

/** 字母をマスに置く。字送りは4マス（字3＋あき1） */
const Word = ({ s, x, y, fill, o }: { s: string; x: number; y: number; fill: string; o?: number }) => (
  <>
    {s.split("").flatMap((ch, i) => {
      const g = FONT[ch];
      if (!g) return [];
      return g.flatMap((row, ry) =>
        row
          .split("")
          .map((c, rx) =>
            c === "#" ? <Px key={`${i}_${ry}_${rx}`} x={x + i * 4 + rx} y={y + ry} fill={fill} o={o} /> : null,
          ),
      );
    })}
  </>
);

/** なめらかな稜線。2つの正弦を重ねてマスに丸める */
const ridge = (x: number, base: number, amp: number, f1: number, f2: number, ph: number) =>
  Math.round(base + amp * (Math.sin(x * f1 + ph) * 0.62 + Math.sin(x * f2 + ph * 1.7) * 0.38));

export default function Plate() {
  const r = rand(20260827);

  const WATER = 41; // 水平線の行
  const far = Array.from({ length: COLS }, (_, x) => ridge(x, 32, 4.2, 0.19, 0.41, 0.4));
  const near = Array.from({ length: COLS }, (_, x) => ridge(x, 37, 2.6, 0.26, 0.62, 2.1));

  /* 星。山より上、月から離れた所に置く */
  const moonCx = 33.5;
  const moonCy = 12.5;
  const moonR = 7.2;
  const stars = Array.from({ length: 54 }, () => {
    const x = Math.floor(r(0, COLS));
    const y = Math.floor(r(0, 30));
    const d = Math.hypot(x - moonCx, y - moonCy);
    return { x, y, d, bright: r() > 0.62 };
  }).filter((s) => s.d > moonR + 2.5);

  /* 月。円をマスに落とし、右下の縁を2段に翳らせる */
  const moon: { x: number; y: number; c: string }[] = [];
  for (let y = 0; y < 26; y++) {
    for (let x = 0; x < COLS; x++) {
      const dx = x + 0.5 - moonCx;
      const dy = y + 0.5 - moonCy;
      const d = Math.hypot(dx, dy);
      if (d > moonR) continue;
      const lim = (dx + dy) / (moonR * 1.42); // 右下ほど大きい
      moon.push({ x, y, c: lim > 0.62 ? C.moonDark : lim > 0.26 ? C.moonMid : C.moon });
    }
  }
  /* クレーター。2つだけ。多いと汚れに見える */
  const craters = [
    { x: 31, y: 10, r: 1.8 },
    { x: 36, y: 15, r: 1.2 },
  ];
  const craterCells = new Set(
    craters.flatMap((c) =>
      moon.filter((m) => Math.hypot(m.x + 0.5 - c.x, m.y + 0.5 - c.y) <= c.r).map((m) => `${m.x},${m.y}`),
    ),
  );

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ピクセルアート様式の図版" shapeRendering="crispEdges">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {/* ディザ。1マス市松 */}
        <pattern id={`${P}-d`} width={CELL * 2} height={CELL * 2} patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width={CELL} height={CELL} fill="#fff" />
          <rect x={CELL} y={CELL} width={CELL} height={CELL} fill="#fff" />
        </pattern>
        <mask id={`${P}-md`}><rect width="600" height="800" fill={`url(#${P}-d)`} /></mask>
        {/* 疎いディザ（4マスに1つ）。段の境目を2行かけて渡すのに使う。
            1行の市松だけで繋ぐと、破線が画面を横切って見える（2稿目でそうなった） */}
        <pattern id={`${P}-d4`} width={CELL * 2} height={CELL * 2} patternUnits="userSpaceOnUse">
          <rect x={CELL} y="0" width={CELL} height={CELL} fill="#fff" />
        </pattern>
        <mask id={`${P}-md4`}><rect width="600" height="800" fill={`url(#${P}-d4)`} /></mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* 空。6段。境目を1行のディザでなじませる */}
        {C.sky.map((c, i) => (
          <Px key={`s${i}`} x={0} y={i * 7} w={COLS} h={7} fill={c} />
        ))}
        {/* 段の境目。上の行に疎く、下の行に市松で、2行かけて渡す */}
        <g mask={`url(#${P}-md4)`} opacity="0.9">
          {C.sky.slice(1).map((c, i) => (
            <Px key={`sd4${i}`} x={0} y={(i + 1) * 7 - 2} w={COLS} h={1} fill={c} />
          ))}
        </g>
        <g mask={`url(#${P}-md)`} opacity="0.9">
          {C.sky.slice(1).map((c, i) => (
            <Px key={`sd${i}`} x={0} y={(i + 1) * 7 - 1} w={COLS} h={1} fill={c} />
          ))}
        </g>

        {/* 星 */}
        {stars.map((s, i) => (
          <Px key={`st${i}`} x={s.x} y={s.y} fill={s.bright ? C.star : C.starDim} o={s.bright ? 1 : 0.7} />
        ))}

        {/* 月 */}
        {moon.map((m, i) => (
          <Px key={`m${i}`} x={m.x} y={m.y} fill={craterCells.has(`${m.x},${m.y}`) ? C.moonDark : m.c} />
        ))}

        {/* 遠山 */}
        {far.map((top, x) => (
          <Px key={`f${x}`} x={x} y={top} w={1} h={WATER - top} fill={C.far} />
        ))}
        {/* 遠山の月あかり。稜線が下がる列の頭だけ明るく */}
        {far.map((top, x) =>
          x > 0 && far[x - 1] > top ? <Px key={`fl${x}`} x={x} y={top} fill={C.farLit} /> : null,
        )}
        {/* 遠山の裾をディザで空になじませる */}
        <g mask={`url(#${P}-md)`} opacity="0.5">
          {far.map((top, x) => <Px key={`fd${x}`} x={x} y={top} w={1} h={2} fill={C.sky[5]} />)}
        </g>

        {/* 近山 */}
        {near.map((top, x) => (
          <Px key={`n${x}`} x={x} y={top} w={1} h={WATER - top} fill={C.near} />
        ))}
        {near.map((top, x) =>
          x > 0 && near[x - 1] > top ? <Px key={`nl${x}`} x={x} y={top} fill={C.farLit} o={0.55} /> : null,
        )}

        {/* 水。深いほど暗く、上ほど明るい */}
        <Px x={0} y={WATER} w={COLS} h={ROWS - WATER} fill={C.waterDeep} />
        <Px x={0} y={WATER} w={COLS} h={8} fill={C.water} />
        <g mask={`url(#${P}-md)`} opacity="0.7">
          <Px x={0} y={WATER + 8} w={COLS} h={2} fill={C.water} />
        </g>
        <g mask={`url(#${P}-md4)`} opacity="0.7">
          <Px x={0} y={WATER + 10} w={COLS} h={2} fill={C.water} />
        </g>

        {/* 月の映り込み。月の真下に軸を置き、下へ行くほど細く、左右に振る。
            軸をずらすと、月と無関係の雲に見える（2稿目でそうなった） */}
        {Array.from({ length: 21 }, (_, i) => {
          const y = WATER + i;
          const w = Math.max(1, Math.round(9 - i * 0.38)) + (i % 2 === 0 ? 1 : 0);
          const jitter = [0, -1, 1, 0, 2, -2, 1, -1][i % 8];
          const x = Math.round(moonCx - w / 2) + jitter;
          return <Px key={`rf${i}`} x={x} y={y} w={w} h={1} fill={C.waterLit} o={0.95 - i * 0.032} />;
        })}

        {/* 波。横1マスの線。下ほど長く、まばらに */}
        {[[3, 44, 5], [38, 45, 4], [9, 47, 7], [24, 49, 5], [2, 52, 6], [41, 53, 5],
          [14, 55, 9], [30, 58, 7], [5, 60, 6], [36, 62, 8], [19, 63, 5]].map(([x, y, w], i) => (
          <Px key={`w${i}`} x={x} y={y} w={w} h={1} fill={C.waterLit} o={0.62} />
        ))}

        {/* 小舟と提灯。暖色はここだけ */}
        <Px x={17} y={49} w={9} h={1} fill={C.near} />
        <Px x={18} y={48} w={7} h={1} fill={C.near} />
        <Px x={19} y={47} w={4} h={1} fill={C.near} />
        <Px x={23} y={44} w={1} h={4} fill={C.near} />
        <Px x={23} y={43} w={1} h={1} fill={C.red} />
        <Px x={22} y={45} w={1} h={1} fill={C.warm} />
        <Px x={22} y={46} w={1} h={1} fill={C.warm} o={0.5} />
        {/* 提灯の映り */}
        <Px x={22} y={50} w={1} h={1} fill={C.warm} o={0.45} />
        <Px x={22} y={52} w={1} h={1} fill={C.warm} o={0.25} />

        {/* 走査線 */}
        <rect width="600" height="800" fill={`url(#${ATLAS.scanlines})`} opacity="0.12" />

        {/* 題字。字母もマスに乗せる。ここだけ滑らかだと版が崩れる。
            影を1マスずらして敷くのは、当時の題字の作法そのもの */}
        <g transform={`scale(${0.5})`}>
          <Word s="PIXEL ART" x={5} y={105} fill="#070812" o={0.8} />
          <Word s="PIXEL ART" x={4} y={104} fill={C.moon} />
          <Word s="48X64" x={4} y={114} fill={C.waterLit} o={0.9} />
        </g>
        {/* 使った色の帯。数を刷るより、並べたほうが確かめられる。
            初稿は「14 COLOURS」と刷ってあったが、実際は20色だった */}
        {[C.sky[0], C.sky[1], C.sky[2], C.sky[3], C.sky[4], C.sky[5],
          C.near, C.nearLit, C.far, C.farLit,
          C.waterDeep, C.water, C.waterLit,
          C.starDim, C.star, C.moonDark, C.moonMid, C.moon,
          C.warm, C.red].map((c, i) => (
          <Px key={`pal${i}`} x={26 + i} y={58} w={1} h={3} fill={c} />
        ))}
        <Px x={26} y={57} w={20} h={1} fill="#070812" o={0.5} />
      </g>
    </svg>
  );
}
