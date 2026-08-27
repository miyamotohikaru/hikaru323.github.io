/**
 * アシッド・グラフィックス。
 *
 * 90年代英国のレイヴのフライヤー。蛍光インク×黒の刷り物で、
 * 90年代の3D CGとY2Kのクロムが、後に一度まとめて掘り起こされた。
 *
 * ■ ここで作っている「らしさ」
 *   1. クロム。ただの銀色ではない。空を映す上半分と地面を映す下半分が
 *      「地平線」で切れている、という構造がクロムの正体。
 *      だから塗りは上から 水色→白→暗い地平線→桃→白→黄緑 と並べた。
 *      初稿で単純な白→灰のグラデにしたら、ただの立体文字になった。
 *   2. 歪み。文字は弧に乗せ、字送りを引き伸ばす。真っ直ぐ組むと
 *      とたんに普通のポスターになる。
 *   3. 溶けた市松。格子の各点を正弦で押しているので、
 *      升目が場所ごとに違う形に潰れる。均一な市松は「柄」でしかない。
 *   4. スマイリー。真円を置くと記号になるので、半径を正弦で揺らし、
 *      下辺から蛍光インクを垂らした。
 *
 * ■ 蛍光の光り方
 *   蛍光インクは紙の上で滲んで光って見える。放射のグラデを1枚敷いて、
 *   黒地が完全な黒に沈まないようにしている。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "acid";
const BLACK = "#0b0b0b";
const LIME = "#c6ff00";
const PINK = "#ff2d95";
const CYAN = "#00e5ff";
const WHITE = "#f5f5f5";

/** 揺れた円。真円を置くと記号になる */
function wobble(cx: number, cy: number, R: number, seed: number) {
  const r = rand(seed);
  const p1 = r(0, 6.28);
  const p2 = r(0, 6.28);
  const n = 84;
  return (
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = R * (1 + 0.05 * Math.sin(a * 3 + p1) + 0.028 * Math.sin(a * 5 + p2));
      return `${(cx + Math.cos(a) * k).toFixed(1)},${(cy + Math.sin(a) * k).toFixed(1)}`;
    }).join(" L").replace(/^/, "M") + " Z"
  );
}

/** クロムの文字。押し出し→縁→本体→照りの順に4層で組む */
const Chrome = ({
  href, size, letter, offset, len,
}: { href: string; size: number; letter: number; offset: number; len: number }) => {
  const T = ({ ...rest }: React.SVGProps<SVGTextElement>) => (
    <text
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize={size}
      fontWeight="800"
      letterSpacing={letter}
      textLength={len}
      lengthAdjust="spacingAndGlyphs"
      {...rest}
    >
      <textPath href={href} startOffset={offset}>ACID</textPath>
    </text>
  );
  return (
    <g>
      {/* 押し出し。奥へ7段 */}
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`translate(${(7 - i) * 1.7} ${(7 - i) * 2.2})`}>
          <T fill={i < 3 ? "#3a0a24" : "#141414"} stroke={i < 3 ? "#3a0a24" : "#141414"} strokeWidth="7" />
        </g>
      ))}
      {/* 縁。桃の一本 */}
      <T fill="none" stroke={PINK} strokeWidth="13" strokeLinejoin="round" />
      <T fill="none" stroke={BLACK} strokeWidth="7" strokeLinejoin="round" />
      {/* 本体。地平線で切れる塗り */}
      <T fill={`url(#${P}-chrome)`} />
      {/* 照り。上の稜線だけ白く走る */}
      <T fill="none" stroke={WHITE} strokeWidth="1.4" opacity="0.75" />
    </g>
  );
};

export default function Plate() {
  const r = rand(19881231);

  /* 溶けた市松。格子の各点を正弦で押す */
  const COLS = 17;
  const ROWS = 5;
  const gx = (i: number, j: number) => -20 + (i / COLS) * 640 + Math.sin(j * 0.95 + i * 0.38) * 11;
  const gy = (i: number, j: number) => 614 + (j / ROWS) * 152 + Math.sin(i * 0.52 + j * 0.44) * 15;

  /* 星。四芒星。近くで見るときの取っ掛かり */
  const stars = Array.from({ length: 15 }, () => ({ x: r(20, 580), y: r(40, 600), s: r(4, 13) }));

  /* スマイリーから垂れる蛍光インク。
     初稿は輪の真下に短く垂らしたので、地の語に隠れて1本も見えなかった。
     題字の上まで流し、黒の縁を付けて字を食わせるほうが正しい */
  const drips = [
    { x: -96, len: 74, w: 16 },
    { x: -18, len: 152, w: 26 },
    { x: 52, len: 56, w: 13 },
    { x: 104, len: 112, w: 20 },
  ];
  /* 垂れの形。平行な棒だと硝子の破片に見えた（3稿目でそうなった）。
     根元から先へ細り、先端だけが玉になるのが液体の落ち方 */
  const dripPath = (d: { x: number; len: number; w: number }) => {
    const y0 = 40; // 輪の内側から始めて、根元を輪に隠す
    const yE = y0 + d.len;
    const nw = d.w * 0.26;
    const rb = d.w * 0.55;
    return (
      `M ${d.x - d.w / 2},${y0} L ${(d.x - nw).toFixed(1)},${(yE - rb).toFixed(1)} ` +
      `C ${(d.x - nw - rb * 0.5).toFixed(1)},${(yE + rb).toFixed(1)} ${(d.x + nw + rb * 0.5).toFixed(1)},${(yE + rb).toFixed(1)} ${(d.x + nw).toFixed(1)},${(yE - rb).toFixed(1)} ` +
      `L ${d.x + d.w / 2},${y0} Z`
    );
  };

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="アシッド・グラフィックス様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* クロム。上半分が空、下半分が地面。境目が地平線 */}
        <linearGradient id={`${P}-chrome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CYAN} />
          <stop offset="0.26" stopColor={WHITE} />
          <stop offset="0.44" stopColor="#7f93a6" />
          <stop offset="0.50" stopColor="#101018" />
          <stop offset="0.57" stopColor={PINK} />
          <stop offset="0.80" stopColor={WHITE} />
          <stop offset="1" stopColor={LIME} />
        </linearGradient>
        <linearGradient id={`${P}-chrome2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WHITE} />
          <stop offset="0.42" stopColor="#8f9fae" />
          <stop offset="0.5" stopColor="#101018" />
          <stop offset="0.6" stopColor={CYAN} />
          <stop offset="1" stopColor={WHITE} />
        </linearGradient>

        {/* 蛍光の滲み。黒地を完全な黒に沈めない */}
        <radialGradient id={`${P}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={LIME} stopOpacity="0.42" />
          <stop offset="0.55" stopColor={LIME} stopOpacity="0.1" />
          <stop offset="1" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}-glowP`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={PINK} stopOpacity="0.5" />
          <stop offset="1" stopColor={PINK} stopOpacity="0" />
        </radialGradient>

        {/* 液体の玉。上に光の点、下に色の照り返し */}
        <radialGradient id={`${P}-blobC`} cx="0.34" cy="0.28" r="0.82">
          <stop offset="0" stopColor={WHITE} />
          <stop offset="0.3" stopColor={CYAN} />
          <stop offset="1" stopColor="#0a4a5c" />
        </radialGradient>
        <radialGradient id={`${P}-blobP`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={WHITE} />
          <stop offset="0.32" stopColor={PINK} />
          <stop offset="1" stopColor="#5c0a33" />
        </radialGradient>

        <path id={`${P}-arc`} d="M 16 216 Q 292 44 522 176" fill="none" />
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={BLACK} />

        {/* 蛍光の滲み */}
        <rect x="112" y="140" width="524" height="524" fill={`url(#${P}-glow)`} />
        <rect x="330" y="80" width="330" height="330" fill={`url(#${P}-glowP)`} opacity="0.5" />

        {/* 星 */}
        <g fill={WHITE} opacity="0.85">
          {stars.map((s, i) => (
            <path
              key={i}
              d={`M ${s.x},${s.y - s.s} Q ${s.x + s.s * 0.16},${s.y - s.s * 0.16} ${s.x + s.s},${s.y}
                  Q ${s.x + s.s * 0.16},${s.y + s.s * 0.16} ${s.x},${s.y + s.s}
                  Q ${s.x - s.s * 0.16},${s.y + s.s * 0.16} ${s.x - s.s},${s.y}
                  Q ${s.x - s.s * 0.16},${s.y - s.s * 0.16} ${s.x},${s.y - s.s} Z`}
              opacity={0.45 + (i % 3) * 0.2}
            />
          ))}
        </g>

        {/* 液体の玉。クロムと同じ世界の材質 */}
        <path d={wobble(508, 244, 62, 3)} fill={`url(#${P}-blobC)`} />
        <path d={wobble(96, 250, 44, 5)} fill={`url(#${P}-blobP)`} />

        {/* ── 地の語。蛍光の一色ベタ ──────────────────────────── */}
        <g transform="translate(34 596) scale(0.86 1)">
          <text
            x="0" y="0" fill={PINK}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="104" fontWeight="800" letterSpacing="-1"
            transform="translate(5 4)"
          >
            GRAPHICS
          </text>
          <text
            x="0" y="0" fill={LIME}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="104" fontWeight="800" letterSpacing="-1"
          >
            GRAPHICS
          </text>
        </g>

        {/* 垂れ。地の語の上を流れて字を食う */}
        <g transform="translate(372 404)" fill={LIME} stroke={BLACK} strokeWidth="3.6" strokeLinejoin="round">
          {drips.map((d, i) => <path key={i} d={dripPath(d)} />)}
          {/* ちぎれた雫。近くで見る細部 */}
          <ellipse cx="-18" cy="228" rx="7.5" ry="9.5" />
          <ellipse cx="106" cy="186" rx="5" ry="6.6" />
        </g>

        {/* ── スマイリー。真円を避け、下から蛍光を垂らす ─────────── */}
        <g transform="translate(372 404)">
          <path d={wobble(0, 0, 140, 11)} fill={LIME} />
          {/* クロムの輪。材質を1つ挿すと画面が金物になる */}
          <path d={wobble(0, 0, 140, 11)} fill="none" stroke={`url(#${P}-chrome2)`} strokeWidth="9" />
          <path d={wobble(0, 0, 140, 11)} fill="none" stroke={BLACK} strokeWidth="2" opacity="0.6" />
          {/* 目。縦長の楕円。左右で傾きを変えて生き物にする */}
          <ellipse cx="-48" cy="-34" rx="15" ry="30" fill={BLACK} transform="rotate(-7 -48 -34)" />
          <ellipse cx="50" cy="-34" rx="15" ry="30" fill={BLACK} transform="rotate(6 50 -34)" />
          {/* 口。太い弧。端は丸く */}
          <path d="M -70,22 A 78 78 0 0 0 70,22" fill="none" stroke={BLACK} strokeWidth="21" strokeLinecap="round" />
          {/* 頬の照り。蛍光が紙で光る所 */}
          <ellipse cx="-84" cy="-72" rx="26" ry="15" fill={WHITE} opacity="0.5" transform="rotate(-32 -84 -72)" />
        </g>

        {/* ── クロムの題字。弧に乗せ、字送りを引き伸ばす ─────────── */}
        <Chrome href={`#${P}-arc`} size={132} letter={2} offset={12} len={498} />

        {/* 小さいスマイリー。目だけの版。左の柱の頭 */}
        <g transform="translate(104 356)">
          <circle r="46" fill="none" stroke={PINK} strokeWidth="7" />
          <circle r="46" fill={BLACK} />
          <circle r="46" fill={`url(#${P}-glowP)`} opacity="0.7" />
          <circle cx="-15" cy="-11" r="5.5" fill={PINK} />
          <circle cx="15" cy="-11" r="5.5" fill={PINK} />
          <path d="M -23,8 A 26 26 0 0 0 23,8" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* 注意標識。レイヴのフライヤーの常連 */}
        <g transform="translate(102 486)">
          <path d="M 0,-32 L 30,22 L -30,22 Z" fill={LIME} />
          <path d="M 0,-32 L 30,22 L -30,22 Z" fill="none" stroke={BLACK} strokeWidth="4" />
          <rect x="-3.6" y="-16" width="7.2" height="22" fill={BLACK} />
          <rect x="-3.6" y="10" width="7.2" height="7.2" fill={BLACK} />
        </g>

        {/* 縦組み。版面の左端を1本の線で締める */}
        <text
          transform="translate(28 592) rotate(-90)"
          fill={CYAN}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="11.5" fontWeight="700" letterSpacing="4.4"
        >
          STRICTLY 12&quot; — NO CAMERAS
        </text>
        <rect x="40" y="272" width="1.6" height="320" fill={CYAN} opacity="0.55" />

        {/* ── 溶けた市松。格子の点を正弦で押した ────────────────── */}
        <g>
          {Array.from({ length: ROWS }, (_, j) =>
            Array.from({ length: COLS }, (_, i) => {
              if ((i + j) % 2) return null;
              const pts = [
                [gx(i, j), gy(i, j)],
                [gx(i + 1, j), gy(i + 1, j)],
                [gx(i + 1, j + 1), gy(i + 1, j + 1)],
                [gx(i, j + 1), gy(i, j + 1)],
              ];
              return (
                <polygon
                  key={`${i}-${j}`}
                  points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
                  fill={j === 2 ? CYAN : LIME}
                  opacity={j === 4 ? 0.55 : 1}
                />
              );
            }),
          )}
          {/* 格子の骨。溶けた形をなぞる細い線 */}
          <g stroke={PINK} strokeWidth="1" opacity="0.6" fill="none">
            {Array.from({ length: ROWS + 1 }, (_, j) => (
              <polyline
                key={j}
                points={Array.from({ length: COLS + 1 }, (_, i) => `${gx(i, j).toFixed(1)},${gy(i, j).toFixed(1)}`).join(" ")}
              />
            ))}
          </g>
        </g>

        {/* 地の小さな文字と、掛け値なしの細部 */}
        <text
          x="34" y="784" fill={WHITE}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="10.5" fontWeight="700" letterSpacing="2.8" opacity="0.85"
        >
          FLUORO 2C ON BLACK / 08:00 TILL LATE
        </text>
        {/* バーコード。刷り物である証拠 */}
        <g fill={WHITE} opacity="0.9">
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={430 + i * 5} y={764} width={r(0.9, 3.2)} height={i % 7 === 0 ? 22 : 16} />
          ))}
        </g>

        {/* 蛍光インクは紙の上で均一に乗らない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grainCoarse})`}
          opacity="0.2"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
