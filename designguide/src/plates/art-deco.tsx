/**
 * アール・デコ。
 *
 * 1925年パリ「現代産業装飾芸術国際博覧会」の版面と、
 * クライスラー・ビル（1930）の王冠を軸に組んだ。
 *
 * ■ ここで作っている「らしさ」
 *   1. 厳密な左右対称と垂直性。装飾の系譜の中で、これだけが定規で割れる。
 *      有機曲線は一本も使っていない。円弧・直線・三角形だけ。
 *   2. 階段（セットバック）。塔も台座も額の角も、必ず段で上がり段で下がる。
 *      1916年のニューヨーク建築法が生んだ形が、そのまま装飾語彙になった。
 *   3. 扇（サンバースト）。地平の一点から放射する細い線。
 *      ここでは版面の下・外側に中心を置き、塔の背後に開かせている。
 *   4. 金は「細い線」で使う。面で塗ると成金の看板になる。
 *      冠だけは金の階調（暗い金→明るい金→生成り）で金属の照りを作る。
 *
 * ■ 隣（ヴィクトリアン／バロック）と混ざらないようにしたこと
 *   同じ金でも、あちらは渦と過剰、こちらは直線と間引き。
 *   地色を暗い青緑（#0e1a1f）に振って、茶金の一族から抜いてある。
 */
import { ATLAS, rand, rad, shift, alpha } from "@/lib/plate";

const P = "dc";
const NIGHT = "#0e1a1f";
const GOLD = "#c9a227";
const TEAL = "#1e5f74";
const CREAM = "#e8dcc4";
const RED = "#8c1c13";

/** 冠の弧。外から内へ。金が明るくなるほど中心に近い＝照り */
const CROWN = [
  { w: 178, h: 128, base: 470, fill: shift(TEAL, -0.08), win: 15 },
  { w: 146, h: 112, base: 424, fill: shift(GOLD, -0.55), win: 13 },
  { w: 116, h: 96, base: 380, fill: shift(GOLD, -0.24), win: 11 },
  { w: 88, h: 80, base: 338, fill: GOLD, win: 9 },
  { w: 62, h: 62, base: 298, fill: CREAM, win: 7 },
];

/** 段の台座。下へ行くほど広い。段差ごとに金の細線を1本 */
const STEPS = [
  { x: 176, y: 470, w: 248, h: 30 },
  { x: 148, y: 500, w: 304, h: 34 },
  { x: 116, y: 534, w: 368, h: 38 },
  { x: 84, y: 572, w: 432, h: 44 },
];

export default function Plate() {
  const r = rand(1925);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="アール・デコ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-field`}>
          <rect x="38" y="38" width="524" height="724" />
        </clipPath>
        {/* 地の空。上ほど深く、地平ほど明るい。デコの夜空は必ず段階を持つ */}
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shift(NIGHT, -0.35)} />
          <stop offset="58%" stopColor={NIGHT} />
          <stop offset="100%" stopColor={shift(TEAL, -0.5)} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={NIGHT} />
        <g clipPath={`url(#${P}-field)`}>
          <rect x="38" y="38" width="524" height="724" fill={`url(#${P}-sky)`} />

          {/* ── 扇。版面の下・外に中心を置き、塔の背後に開かせる ────── */}
          <g>
            {Array.from({ length: 33 }, (_, i) => {
              const a = -80 + i * 5;
              const wide = i % 4 === 0;
              const half = wide ? 1.5 : 0.55;
              const x1 = 300 + Math.sin(rad(a - half)) * 760;
              const y1 = 726 - Math.cos(rad(a - half)) * 760;
              const x2 = 300 + Math.sin(rad(a + half)) * 760;
              const y2 = 726 - Math.cos(rad(a + half)) * 760;
              return (
                <polygon
                  key={i}
                  points={`300,726 ${x1},${y1} ${x2},${y2}`}
                  fill={wide ? GOLD : TEAL}
                  opacity={wide ? 0.16 : 0.3}
                />
              );
            })}
            {/* 同心の弧。虹のリング。デコの版面はこれで奥行きを作る */}
            {[196, 286, 376, 466, 556, 646].map((rr, i) => (
              <circle key={i} cx="300" cy="726" r={rr} fill="none" stroke={GOLD} strokeWidth={i % 2 === 0 ? 1.2 : 0.6} opacity="0.22" />
            ))}
          </g>

          {/* ── 左右の付柱。頂に段。垂直性を支える ─────────────────── */}
          {[74, 526].map((x, k) => (
            <g key={k}>
              <rect x={x - 15} y="196" width="30" height="420" fill={shift(TEAL, -0.45)} stroke={GOLD} strokeWidth="1" />
              {/* 縦の溝。3本。フルーティング */}
              {[-7, 0, 7].map((d, i) => (
                <line key={i} x1={x + d} y1="206" x2={x + d} y2="606" stroke={GOLD} strokeWidth="0.7" opacity="0.55" />
              ))}
              {/* 頂の段。3段で細くする */}
              <rect x={x - 19} y="184" width="38" height="12" fill={GOLD} />
              <rect x={x - 13} y="170" width="26" height="14" fill={shift(GOLD, -0.25)} />
              <rect x={x - 7} y="156" width="14" height="14" fill={CREAM} />
              <polygon points={`${x},${132} ${x - 7},${156} ${x + 7},${156}`} fill={GOLD} />
              <circle cx={x} cy="126" r="4" fill={CREAM} />
              {/* 足元の段 */}
              <rect x={x - 19} y="616" width="38" height="12" fill={GOLD} />
              <rect x={x - 25} y="628" width="50" height="12" fill={shift(TEAL, -0.3)} stroke={GOLD} strokeWidth="0.8" />
            </g>
          ))}

          {/* ── 冠。クライスラーの入れ子の弧。窓は三角で抜く ─────────── */}
          {CROWN.map((c, k) => (
            <g key={k}>
              <path
                d={`M${300 - c.w} ${c.base} A${c.w} ${c.h} 0 0 1 ${300 + c.w} ${c.base} Z`}
                fill={c.fill}
                stroke={GOLD}
                strokeWidth="1.4"
              />
              {/* 段の踏み面。ここを引かないと入れ子の弧が一つの饅頭に見える */}
              <rect x={300 - c.w} y={c.base - 4} width={c.w * 2} height="4" fill={shift(GOLD, -0.3)} />
              <rect x={300 - c.w} y={c.base - 5} width={c.w * 2} height="1.4" fill={GOLD} />
              {/* 弧に沿った三角窓。放射方向に向ける。デコの窓は必ず三角 */}
              {Array.from({ length: c.win }, (_, i) => {
                const t = Math.PI - ((i + 0.5) / c.win) * Math.PI;
                const px = 300 + c.w * Math.cos(t);
                const py = c.base - c.h * Math.sin(t);
                const nx = Math.cos(t);
                const ny = -Math.sin(t);
                const ax = px - nx * 10;
                const ay = py - ny * 10;
                const bx = px - nx * 30;
                const by = py - ny * 30;
                const tx = -ny;
                const ty = nx;
                return (
                  <polygon
                    key={i}
                    points={`${ax},${ay} ${bx + tx * 5.4},${by + ty * 5.4} ${bx - tx * 5.4},${by - ty * 5.4}`}
                    fill={shift(NIGHT, -0.2)}
                    opacity="0.92"
                  />
                );
              })}
              {/* 弧の縁を金の細線でなぞる */}
              <path d={`M${300 - c.w} ${c.base} A${c.w} ${c.h} 0 0 1 ${300 + c.w} ${c.base}`} fill="none" stroke={GOLD} strokeWidth="1" opacity="0.9" />
            </g>
          ))}

          {/* ── 尖塔。細い三角と球 ─────────────────────────────── */}
          <polygon points="300,120 289,232 311,232" fill={CREAM} />
          <polygon points="300,120 300,232 311,232" fill={shift(GOLD, -0.2)} />
          <circle cx="300" cy="110" r="7" fill={GOLD} stroke={NIGHT} strokeWidth="1" />
          <circle cx="300" cy="110" r="2.6" fill={CREAM} />
          {[152, 176, 200].map((y, i) => (
            <line key={i} x1={294 - i * 2} y1={y} x2={306 + i * 2} y2={y} stroke={NIGHT} strokeWidth="1.4" opacity="0.8" />
          ))}

          {/* ── 段の台座。溝と赤の点 ───────────────────────────── */}
          {STEPS.map((s, i) => (
            <g key={i}>
              <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={i % 2 === 0 ? shift(TEAL, -0.15) : shift(TEAL, -0.32)} />
              <rect x={s.x} y={s.y} width={s.w} height="3" fill={GOLD} />
              {/* 縦の溝。段ごとに本数を増やす */}
              {Array.from({ length: 7 + i * 4 }, (_, j) => {
                const x = s.x + (s.w / (7 + i * 4 + 1)) * (j + 1);
                return <line key={j} x1={x} y1={s.y + 5} x2={x} y2={s.y + s.h} stroke={GOLD} strokeWidth="0.7" opacity="0.5" />;
              })}
            </g>
          ))}
          {/* 台座の赤。ここだけ朱を差す。面積は小さく */}
          {[-150, -50, 50, 150].map((d, i) => (
            <rect key={i} x={300 + d - 9} y="620" width="18" height="18" fill={RED} stroke={GOLD} strokeWidth="0.8" />
          ))}
          <rect x="66" y="616" width="468" height="4" fill={GOLD} />
          <rect x="52" y="638" width="496" height="7" fill={shift(TEAL, -0.4)} stroke={GOLD} strokeWidth="0.8" />

          {/* ── 山形の帯。デコの句読点 ─────────────────────────── */}
          <g fill="none" stroke={GOLD} strokeWidth="2">
            {Array.from({ length: 21 }, (_, i) => {
              const x = 62 + i * 24;
              return <path key={i} d={`M${x} ${666} L${x + 12} ${656} L${x + 24} ${666}`} opacity="0.85" />;
            })}
          </g>

          {/* ── 題字。細く、広く、大文字だけ ─────────────────────
              扇の線が文字の背後に透けて騒がしかったので、無地の板を敷く */}
          <rect x="38" y="682" width="524" height="80" fill={shift(NIGHT, -0.12)} />
          <line x1="62" y1="684" x2="538" y2="684" stroke={GOLD} strokeWidth="1.6" />
          <line x1="62" y1="688" x2="538" y2="688" stroke={GOLD} strokeWidth="0.6" />
          <text
            x="300" y="726" textAnchor="middle" fill={CREAM}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="33" fontWeight="300" letterSpacing="15"
          >
            ART DÉCO
          </text>
          <text
            x="300" y="748" textAnchor="middle" fill={GOLD}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="8.6" fontWeight="500" letterSpacing="4.4"
          >
            EXPOSITION INTERNATIONALE · PARIS · MCMXXV
          </text>
        </g>

        {/* ── 額。角を段で落とす。四角いままだとデコにならない ─────── */}
        <path
          d="M26 46 L46 26 L554 26 L574 46 L574 754 L554 774 L46 774 L26 754 Z"
          fill="none" stroke={GOLD} strokeWidth="2.6"
        />
        <path
          d="M36 52 L52 36 L548 36 L564 52 L564 748 L548 764 L52 764 L36 748 Z"
          fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.75"
        />
        {/* 角の小さな段。近くで見たときの細部 */}
        {[
          [26, 46, 1, 1],
          [574, 46, -1, 1],
          [26, 754, 1, -1],
          [574, 754, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} fill={GOLD}>
            <rect x="4" y="-4" width="14" height="3" opacity="0.9" />
            <rect x="10" y="-12" width="3" height="14" opacity="0.9" />
            <circle cx="20" cy="-20" r="2.4" />
          </g>
        ))}

        {/* 刷りの粒。金は必ずわずかに荒れる */}
        <g fill={GOLD} opacity="0.14">
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={r(50, 550)} y={r(50, 750)} width={r(1, 2.4)} height={r(1, 2.4)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.22" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
