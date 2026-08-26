/**
 * ベントーグリッド。
 *
 * 2023年前後、Apple の製品ページから広がった版組。大小の角丸の箱で
 * 版面を隙間なく割り、1マスに1つだけ別のことを入れる。
 * 箱の大きさの差が、そのまま情報の重みの差になる。
 *
 * ■ ここで作っている「らしさ」
 *   1. 隙間が全部同じであること（12px）。角丸も全部同じ（22px）。
 *      揃っているのは「間」と「角」だけで、箱の寸法は全部違う。
 *      逆にすると（大きさを揃えて間をばらす）ただの表になる。
 *   2. 残りマスが1つも無いこと。4列×6行の24マスを11個の箱で
 *      完全に埋めてある。埋め残しがあると弁当ではなく棚になる。
 *   3. 1マスに1つだけ入れること。中身は数字・図・目盛り・色票など、
 *      全部ちがう種類にした。
 *
 * ■ 初稿の失敗
 *   各マスにボタンや見出しや折れ線グラフを入れたら、ダッシュボードの
 *   スクリーンショットになった。画面の部品を全部やめて、
 *   図版・数字・目盛りだけにした。右下の小さい黒マスには、
 *   この版面そのものの縮図を入れてある（弁当の中の弁当）。
 */
import { ATLAS } from "@/lib/plate";

const P = "bt";
const PAGE = "#f2f2f4";
const INK = "#1c1c1e";
const BLUE = "#5b8def";
const ORANGE = "#f2a03d";
const LINE = "#e0e0e4";
const WHITE = "#ffffff";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 版面の割り。4列×6行、間 12、外周 34 */
const M = 34;
const G = 12;
const CW = (600 - M * 2 - G * 3) / 4; // 124
const CH = (800 - M * 2 - G * 5) / 6; // 112
const box = (c: number, r: number, cs = 1, rs = 1) => ({
  x: M + c * (CW + G),
  y: M + r * (CH + G),
  w: cs * CW + (cs - 1) * G,
  h: rs * CH + (rs - 1) * G,
});

/* 11個で24マスを埋める。縮図もこの表から描く */
const LAYOUT: [number, number, number, number][] = [
  [0, 0, 2, 2], [2, 0, 2, 1], [2, 1, 1, 1], [3, 1, 1, 1],
  [0, 2, 1, 2], [1, 2, 3, 1], [1, 3, 2, 2], [3, 3, 1, 1],
  [3, 4, 1, 2], [0, 4, 1, 1], [0, 5, 3, 1],
];

const A = box(0, 0, 2, 2);
const B = box(2, 0, 2, 1);
const C = box(2, 1);
const D = box(3, 1);
const E = box(0, 2, 1, 2);
const F = box(1, 2, 3, 1);
const Gc = box(1, 3, 2, 2);
const H = box(3, 3);
const I = box(3, 4, 1, 2);
const J = box(0, 4);
const K = box(0, 5, 3, 1);

const Cell = ({
  b, fill = WHITE, stroke = true,
}: { b: { x: number; y: number; w: number; h: number }; fill?: string; stroke?: boolean }) => (
  <rect
    x={b.x} y={b.y} width={b.w} height={b.h} rx="22"
    fill={fill} stroke={stroke ? LINE : "none"} strokeWidth="1"
  />
);

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ベントーグリッド様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {/* 箱は紙から1段だけ浮く。強い影を付けるとマテリアルになる */}
        <filter id={`${P}-sh`} x="-30%" y="-30%" width="160%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feOffset in="b" dy="3" result="o" />
          <feFlood floodColor={INK} floodOpacity="0.09" result="c" />
          <feComposite in="c" in2="o" operator="in" result="s" />
          <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id={`${P}-cA`}><rect x={A.x} y={A.y} width={A.w} height={A.h} rx="22" /></clipPath>
        <clipPath id={`${P}-cG`}><rect x={Gc.x} y={Gc.y} width={Gc.w} height={Gc.h} rx="22" /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAGE} />

        <g filter={`url(#${P}-sh)`}>
          {/* ── A：題字。版面で一番大きい箱に一番大事なものを入れる ── */}
          <Cell b={A} fill={INK} stroke={false} />
          <g clipPath={`url(#${P}-cA)`}>
            {/* 隅に点の目。黒ベタ1枚だと箱が沈む */}
            <g fill={WHITE} opacity="0.14">
              {Array.from({ length: 8 * 5 }, (_, i) => (
                <circle key={i} cx={A.x + 168 + (i % 8) * 12} cy={A.y + 168 + Math.floor(i / 8) * 12} r="1.6" />
              ))}
            </g>
            <rect x={A.x + A.w - 70} y={A.y + 28} width="44" height="9" rx="4.5" fill={ORANGE} />
          </g>
          <text x={A.x + 24} y={A.y + 86} fill={WHITE} fontFamily={SANS} fontSize="50" fontWeight="800" letterSpacing="-2">
            BENTO
          </text>
          <text x={A.x + 24} y={A.y + 132} fill={BLUE} fontFamily={SANS} fontSize="50" fontWeight="800" letterSpacing="-2">
            GRID
          </text>
          <text x={A.x + 26} y={A.y + 164} fill={WHITE} opacity="0.5" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="3.2">
            APPLE — 2023
          </text>
          <text x={A.x + 26} y={A.y + 214} fill={WHITE} opacity="0.78" fontFamily={SANS} fontSize="10" fontWeight="500" letterSpacing="0.4">
            One page. No scroll.
          </text>

          {/* ── B：青の帯。1マス1文だけ ─────────────────────── */}
          <Cell b={B} fill={BLUE} stroke={false} />
          <text x={B.x + 22} y={B.y + 48} fill={WHITE} fontFamily={SANS} fontSize="15" fontWeight="700" letterSpacing="0.2">
            Every box a
          </text>
          <text x={B.x + 22} y={B.y + 70} fill={WHITE} fontFamily={SANS} fontSize="15" fontWeight="700" letterSpacing="0.2">
            different size.
          </text>
          <g stroke={WHITE} strokeWidth="1.6" opacity="0.8">
            <line x1={B.x + B.w - 46} y1={B.y + 62} x2={B.x + B.w - 24} y2={B.y + 62} />
            <path d={`M${B.x + B.w - 30} ${B.y + 56} L${B.x + B.w - 24} ${B.y + 62} L${B.x + B.w - 30} ${B.y + 68}`} fill="none" />
          </g>

          {/* ── C：点の網。手ざわりのマス ───────────────────── */}
          <Cell b={C} />
          <g fill={INK}>
            {Array.from({ length: 7 * 7 }, (_, i) => {
              const cx = C.x + 26 + (i % 7) * 12;
              const cy = C.y + 26 + Math.floor(i / 7) * 12;
              const d = Math.hypot((i % 7) - 3, Math.floor(i / 7) - 3);
              return <circle key={i} cx={cx} cy={cy} r={3.4 - d * 0.42} opacity={0.9 - d * 0.09} />;
            })}
          </g>

          {/* ── D：橙。数字1つ ─────────────────────────────── */}
          <Cell b={D} fill={ORANGE} stroke={false} />
          <text x={D.x + D.w / 2} y={D.y + 66} textAnchor="middle" fill={INK} fontFamily={SANS} fontSize="46" fontWeight="800" letterSpacing="-2">
            11
          </text>
          <text x={D.x + D.w / 2} y={D.y + 86} textAnchor="middle" fill={INK} opacity="0.62" fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="2.4">
            BOXES
          </text>

          {/* ── E：縦の柱。大きさの差そのものを図にする ──────── */}
          <Cell b={E} />
          <text x={E.x + 18} y={E.y + 28} fill={INK} opacity="0.45" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2">
            SPANS
          </text>
          {[
            [1, BLUE], [2, INK], [1, LINE], [3, ORANGE], [2, BLUE], [1, INK],
          ].map(([n, c], i) => (
            <rect
              key={i} x={E.x + 18} y={E.y + 44 + i * 30} width={(n as number) * 26} height="18" rx="6" fill={c as string}
            />
          ))}
          <text x={E.x + 18} y={E.y + E.h - 16} fill={INK} opacity="0.4" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4">
            1—3 COLUMNS
          </text>

          {/* ── F：目盛り。揃っているのは間と角だけ、という註 ─── */}
          <Cell b={F} />
          <line x1={F.x + 22} y1={F.y + 62} x2={F.x + F.w - 22} y2={F.y + 62} stroke={INK} strokeWidth="1" opacity="0.4" />
          <g stroke={INK} opacity="0.5">
            {Array.from({ length: 29 }, (_, i) => (
              <line
                key={i} x1={F.x + 22 + i * 12} y1={F.y + 62}
                x2={F.x + 22 + i * 12} y2={F.y + 62 - (i % 6 === 0 ? 13 : 6)}
                strokeWidth={i % 6 === 0 ? 1.4 : 0.8}
              />
            ))}
          </g>
          <g stroke={ORANGE} strokeWidth="1.6">
            <line x1={F.x + 22} y1={F.y + 74} x2={F.x + 34} y2={F.y + 74} />
            <line x1={F.x + 22} y1={F.y + 70} x2={F.x + 22} y2={F.y + 78} />
            <line x1={F.x + 34} y1={F.y + 70} x2={F.x + 34} y2={F.y + 78} />
          </g>
          <text x={F.x + 42} y={F.y + 78} fill={INK} opacity="0.6" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="1.4">
            GAP 12 — RADIUS 22 — ALWAYS
          </text>
          <text x={F.x + 22} y={F.y + 30} fill={INK} opacity="0.45" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2">
            THE ONLY TWO CONSTANTS
          </text>

          {/* ── G：同心の弧。1マス1図 ───────────────────────── */}
          <Cell b={Gc} />
          <g clipPath={`url(#${P}-cG)`}>
            {([
              [84, BLUE, -120, 150, 16],
              [70, ORANGE, 30, 250, 13],
              [50, INK, -80, 190, 10],
              [32, BLUE, 120, 300, 8],
            ] as const).map(([rr, c, from, sweep], i) => {
              const cx = Gc.x + Gc.w / 2;
              const cy = Gc.y + Gc.h / 2 + 6;
              const a0 = (from * Math.PI) / 180;
              const a1 = ((from + sweep) * Math.PI) / 180;
              const p0 = [cx + rr * Math.sin(a0), cy - rr * Math.cos(a0)];
              const p1 = [cx + rr * Math.sin(a1), cy - rr * Math.cos(a1)];
              return (
                <path
                  key={i}
                  d={`M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${rr} ${rr} 0 ${sweep > 180 ? 1 : 0} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`}
                  fill="none" stroke={c} strokeWidth={[16, 13, 10, 8][i]} strokeLinecap="round"
                />
              );
            })}
            <circle cx={Gc.x + Gc.w / 2} cy={Gc.y + Gc.h / 2 + 6} r="9" fill={INK} />
          </g>
          <text x={Gc.x + 22} y={Gc.y + 30} fill={INK} opacity="0.45" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2">
            ONE THING PER BOX
          </text>
          <text x={Gc.x + Gc.w - 22} y={Gc.y + Gc.h - 20} textAnchor="end" fill={INK} opacity="0.4" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4">
            NEVER TWO
          </text>

          {/* ── H：弁当の中の弁当。この版面の縮図 ─────────────── */}
          <Cell b={H} fill={INK} stroke={false} />
          <g transform={`translate(${H.x + 38} ${H.y + 16}) scale(0.09)`}>
            {LAYOUT.map(([c, r, cs, rs], i) => {
              const bb = box(c, r, cs, rs);
              return (
                <rect
                  key={i} x={bb.x - M} y={bb.y - M} width={bb.w} height={bb.h} rx="22"
                  fill={i === 7 ? ORANGE : "none"} stroke={WHITE} strokeWidth="11" opacity={i === 7 ? 1 : 0.62}
                />
              );
            })}
          </g>
          <text x={H.x + H.w / 2} y={H.y + H.h - 14} textAnchor="middle" fill={WHITE} opacity="0.5" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.4">
            YOU ARE HERE
          </text>

          {/* ── I：刷り色。縦に積む ────────────────────────── */}
          <Cell b={I} />
          <text x={I.x + 18} y={I.y + 28} fill={INK} opacity="0.45" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2">
            INK
          </text>
          {([[INK, "1C1C1E"], [BLUE, "5B8DEF"], [ORANGE, "F2A03D"], [LINE, "E0E0E4"], [PAGE, "F2F2F4"]] as const).map(([c, hex], i) => (
            <g key={hex}>
              <rect x={I.x + 18} y={I.y + 40 + i * 38} width={I.w - 36} height="22" rx="7" fill={c} stroke={LINE} strokeWidth="1" />
              <text x={I.x + 18} y={I.y + 74 + i * 38} fill={INK} opacity="0.42" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1">
                {hex}
              </text>
            </g>
          ))}

          {/* ── J：四分円。抽象の1マス ─────────────────────── */}
          <Cell b={J} />
          <path
            d={`M${J.x + 22} ${J.y + J.h - 24} L${J.x + 22} ${J.y + 30} A 62 62 0 0 1 ${J.x + 84} ${J.y + J.h - 24} Z`}
            fill={BLUE}
          />
          <circle cx={J.x + J.w - 30} cy={J.y + 30} r="8" fill={ORANGE} />

          {/* ── K：締めの1行 ───────────────────────────────── */}
          <Cell b={K} />
          <text x={K.x + 24} y={K.y + 48} fill={INK} fontFamily={SANS} fontSize="17" fontWeight="600" letterSpacing="-0.2">
            Nothing scrolls. Everything fits.
          </text>
          <text x={K.x + 24} y={K.y + 78} fill={INK} opacity="0.45" fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="2.2">
            4 COLUMNS × 6 ROWS = 24 CELLS, ALL SPOKEN FOR
          </text>
          <g fill={INK} opacity="0.28">
            {Array.from({ length: 24 }, (_, i) => (
              <rect key={i} x={K.x + 24 + (i % 12) * 9} y={K.y + 88 + Math.floor(i / 12) * 9} width="6" height="6" rx="1.5" />
            ))}
          </g>
        </g>

        {/* 紙の目 */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.09"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
