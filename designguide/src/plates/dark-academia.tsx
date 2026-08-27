/**
 * ダーク・アカデミア。
 *
 * この群で唯一「重い」一枚。他の8枚が明るい紙の上の絵なので、
 * ここだけは**紙を暗くして、光を一点から出す**。
 * 蝋燭の炎を光源に決め、そこから遠いほど沈ませる。明暗そのものが様式。
 *
 * ■ この絵の骨
 *   1. 上半分を**背表紙の壁**で埋める。革装丁の背に金の横帯（bands）と
 *      小さな題簽を入れると、それだけで「古い図書館」になる。
 *      幅・高さ・色をひとつずつ変え、傾いた本と隙間を混ぜる。
 *      等間隔に並べると本棚ではなくバーコードに見える。
 *   2. 下半分は机。天板の線（y=640）で版面を割り、その上に
 *      積んだ本・立てかけた本・蝋燭・インク壺と羽根ペンを並べる。
 *   3. 光は蝋燭から。放射のグラデーションを1枚かぶせ、四隅を落とす。
 *      光の中にだけ埃を舞わせる。埃は明暗のある絵でしか描けない。
 *   4. 文字はセリフ体・小さめ・字間広め。金（#c9b892）で机の前板に置く。
 *      ラテン語の箴言を1行。学寮の様式なので言語も装置のうち。
 *
 * ■ 失敗して直したところ
 *   初稿は蝋燭を中央に置いて左右対称になり、祭壇画に見えた。
 *   光源を右3分の1へ寄せ、重い本の山を左下に置いて釣り合わせた。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "da";
const NIGHT = "#1c1712";
const LEATHER = "#5c4a32";
const TAN = "#8a7350";
const GOLD = "#c9b892";
const SHADOW = "#2f2a22";

const DESK_Y = 640;   // 天板の線。版面をここで割る
const FLAME_X = 408;  // 光源。中央から右へ外す

/* 背表紙に使う革の色。すべて茶の系列の濃淡 */
const HIDES = ["#5c4a32", "#3d3020", "#6b563a", "#4a3a26", "#2f2a22", "#7a5f3c", "#38301f"];

export default function Plate() {
  /** 1段ぶんの背表紙。左から詰めていく */
  const shelf = (seed: number, x0: number, x1: number, base: number, maxH: number) => {
    const r = rand(seed);
    const out: React.ReactElement[] = [];
    let x = x0;
    let i = 0;
    while (x < x1 - 12) {
      const w = r(13, 34);
      if (x + w > x1) break;
      const h = r(maxH * 0.62, maxH);
      const hide = HIDES[Math.floor(r(0, HIDES.length))];
      const tilt = r() > 0.9 ? r(-7, 7) : 0;   // たまに1冊だけ傾ける
      const gap = r() > 0.86 ? r(5, 13) : r(0.6, 2.2); // たまに抜けを作る
      const y = base - h;
      const bands = Math.floor(r(1, 4));
      out.push(
        <g key={`${seed}-${i}`} transform={`rotate(${tilt} ${x + w / 2} ${base})`}>
          <rect x={x} y={y} width={w} height={h} fill={hide} />
          {/* 背の丸み。左に細い明部、右に陰 */}
          <rect x={x} y={y} width={w * 0.3} height={h} fill="#ffffff" opacity="0.06" />
          <rect x={x + w * 0.74} y={y} width={w * 0.26} height={h} fill="#000000" opacity="0.28" />
          {/* 金の横帯 */}
          {Array.from({ length: bands }, (_, k) => (
            <rect key={k} x={x + 1.5} y={y + 14 + k * r(16, 30)} width={w - 3} height="1.6"
                  fill={GOLD} opacity={r(0.35, 0.8)} />
          ))}
          {/* 題簽。小さな色革を貼り、その上に金の細線を2本 */}
          {h > maxH * 0.72 && (
            <g>
              <rect x={x + 2.5} y={y + h * 0.3} width={w - 5} height={r(16, 24)} fill="#4a2b22" opacity="0.85" />
              <rect x={x + 4.5} y={y + h * 0.34} width={w - 9} height="1.2" fill={GOLD} opacity="0.6" />
              <rect x={x + 4.5} y={y + h * 0.38} width={(w - 9) * r(0.4, 0.9)} height="1.2" fill={GOLD} opacity="0.45" />
            </g>
          )}
          <rect x={x} y={y} width={w} height={h} fill="none" stroke="#120e09" strokeWidth="0.7" opacity="0.6" />
        </g>,
      );
      x += w + gap;
      i++;
    }
    return out;
  };

  /* 埃。光の中だけに舞わせる */
  const dust = Array.from({ length: 90 }, (_, i) => {
    const r = rand(3300 + i);
    const a = r(0, Math.PI * 2);
    const d = Math.pow(r(), 0.6) * 250;
    return {
      x: FLAME_X + Math.cos(a) * d * 1.25,
      y: 520 + Math.sin(a) * d * 0.85,
      r: r(0.5, 1.9),
      o: (1 - d / 250) * r(0.25, 0.9),
    };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ダーク・アカデミア様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 蝋燭の灯り。四隅を落とすための一枚 */}
        <radialGradient id={`${P}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d9a765" stopOpacity="0.5" />
          <stop offset="0.34" stopColor="#8a6a3c" stopOpacity="0.2" />
          <stop offset="0.72" stopColor="#140f0a" stopOpacity="0.46" />
          <stop offset="1" stopColor="#0b0805" stopOpacity="0.84" />
        </radialGradient>
        {/* 灯りの届く範囲。初稿は一定の不透明度の楕円を screen で重ねたので、
            棚と机を横切る楕円の縁がはっきり見えた。縁で 0 に落とす */}
        <radialGradient id={`${P}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e8b877" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#d9a765" stopOpacity="0.12" />
          <stop offset="1" stopColor="#d9a765" stopOpacity="0" />
        </radialGradient>
        {/* 炎まわりの滲み */}
        <radialGradient id={`${P}-flame`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe6b0" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#e0a33e" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e0a33e" stopOpacity="0" />
        </radialGradient>
        {/* 机の前板。下ほど暗い */}
        <linearGradient id={`${P}-desk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2d1e" />
          <stop offset="1" stopColor="#14100b" />
        </linearGradient>
        {/* 天板。手前が明るい */}
        <linearGradient id={`${P}-top`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#6b563a" />
          <stop offset="1" stopColor="#3a2e1e" />
        </linearGradient>
        <filter id={`${P}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={NIGHT} />

        {/* ── 背表紙の壁。2段 ─────────────────────────────── */}
        <g>{shelf(11, 18, 584, 214, 158)}</g>
        {/* 棚板。木口に細い明部を1本 */}
        <rect x="6" y="214" width="588" height="15" fill="#4a3a26" />
        <rect x="6" y="214" width="588" height="2.4" fill={TAN} opacity="0.5" />
        <rect x="6" y="229" width="588" height="5" fill="#0e0b07" opacity="0.7" />

        <g>{shelf(29, 18, 584, 404, 152)}</g>
        <rect x="6" y="404" width="588" height="15" fill="#4a3a26" />
        <rect x="6" y="404" width="588" height="2.4" fill={TAN} opacity="0.5" />
        <rect x="6" y="419" width="588" height="6" fill="#0e0b07" opacity="0.75" />

        {/* ── 机 ────────────────────────────────────────────── */}
        <rect y={DESK_Y - 16} width="600" height="16" fill={`url(#${P}-top)`} />
        <rect y={DESK_Y} width="600" height={800 - DESK_Y} fill={`url(#${P}-desk)`} />
        {/* 天板の木口。ここが版面を割る線になる */}
        <rect y={DESK_Y - 1.5} width="600" height="2.5" fill={GOLD} opacity="0.22" />
        {/* 前板の木目 */}
        <g stroke="#0d0a06" strokeWidth="0.8" opacity="0.4">
          {Array.from({ length: 11 }, (_, i) => {
            const r = rand(700 + i);
            const y = DESK_Y + 10 + i * 14;
            return <path key={i} d={`M 0 ${y} Q 300 ${y + r(-4, 4)} 600 ${y + r(-3, 3)}`} fill="none" />;
          })}
        </g>

        {/* ── 積んだ本。左下。重心をここに置く ───────────────── */}
        {/* 天板に落ちる影。これが無いと本が浮く */}
        <ellipse cx="188" cy="640" rx="130" ry="9" fill="#0d0a06" opacity="0.5" />
        {[[74, 596, 214, 15], [82, 581, 200, 15], [70, 566, 218, 15], [90, 552, 186, 14]]
          .map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={HIDES[(i * 2 + 1) % HIDES.length]} />
            {/* 小口。紙の側面 */}
            <rect x={x + 7} y={y + 4} width={w - 13} height={h - 8} fill="#8f7c5c" opacity="0.6" />
            {Array.from({ length: 4 }, (_, k) => (
              <rect key={k} x={x + 7} y={y + 4.6 + k * 1.9} width={w - 13} height="0.6"
                    fill="#6b563a" opacity="0.6" />
            ))}
            {/* 背の側。金の帯 */}
            <rect x={x} y={y} width="9" height={h} fill={HIDES[(i * 3) % HIDES.length]} />
            <rect x={x} y={y + 3} width="9" height="1.4" fill={GOLD} opacity="0.7" />
            <rect x={x} y={y + h - 4.4} width="9" height="1.4" fill={GOLD} opacity="0.55" />
            <rect x={x} y={y} width={w} height={h} fill="none" stroke="#100c08" strokeWidth="0.8" opacity="0.7" />
          </g>
        ))}

        {/* 立てかけた1冊。表紙の金枠と紋章。近くで見て持つ細部 */}
        <g transform="rotate(-9 316 640)">
          <rect x="292" y="512" width="52" height="128" fill="#4a2b22" />
          <rect x="292" y="512" width="52" height="128" fill="none" stroke="#100c08" strokeWidth="1" />
          <rect x="298" y="518" width="40" height="116" fill="none" stroke={GOLD} strokeWidth="1.1" opacity="0.75" />
          <rect x="301" y="521" width="34" height="110" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.45" />
          {/* 紋章。菱に十字 */}
          <path d="M318 556 l14 18 l-14 18 l-14 -18 Z" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.8" />
          <path d="M318 562 v24 M308 574 h20" stroke={GOLD} strokeWidth="1" opacity="0.7" />
          <rect x="303" y="600" width="30" height="1.4" fill={GOLD} opacity="0.6" />
          <rect x="303" y="605" width="20" height="1.4" fill={GOLD} opacity="0.45" />
        </g>

        {/* ── 蝋燭。光源 ─────────────────────────────────────── */}
        {/* 燭台の脚と受皿 */}
        <ellipse cx={FLAME_X} cy={DESK_Y - 4} rx="34" ry="8" fill="#7a5f3c" />
        <ellipse cx={FLAME_X} cy={DESK_Y - 7} rx="34" ry="8" fill="#a08356" />
        <path d={`M ${FLAME_X - 9} ${DESK_Y - 9} L ${FLAME_X - 6} 606 L ${FLAME_X + 6} 606 L ${FLAME_X + 9} ${DESK_Y - 9} Z`}
              fill="#8a6c45" />
        <ellipse cx={FLAME_X} cy="604" rx="21" ry="6" fill="#a08356" />
        <ellipse cx={FLAME_X} cy="602" rx="21" ry="6" fill="#c0a06d" />
        {/* 蝋。垂れを左右で違えて非対称にする */}
        <path d={`M ${FLAME_X - 12} 600 L ${FLAME_X - 12} 494 Q ${FLAME_X} 486 ${FLAME_X + 12} 494 L ${FLAME_X + 12} 600 Z`}
              fill="#e6d9ba" />
        <path d={`M ${FLAME_X - 12} 600 L ${FLAME_X - 12} 494 Q ${FLAME_X - 6} 490 ${FLAME_X - 2} 492 L ${FLAME_X - 2} 600 Z`}
              fill="#f2e8cf" opacity="0.7" />
        <path d={`M ${FLAME_X + 12} 508 q 6 14 2 28 q -2 8 -6 4 q -2 -14 0 -32 Z`} fill="#e6d9ba" />
        <path d={`M ${FLAME_X - 12} 522 q -6 18 -1 30 q 3 6 5 0 q -1 -16 0 -30 Z`} fill="#e6d9ba" />
        <ellipse cx={FLAME_X} cy="493" rx="12" ry="4" fill="#d6c7a4" />
        {/* 芯と炎 */}
        <rect x={FLAME_X - 1} y="480" width="2" height="14" fill="#2b2318" />
        <circle cx={FLAME_X} cy="466" r="46" fill={`url(#${P}-flame)`} />
        <path d={`M ${FLAME_X} 442 q 11 16 0 34 q -11 -18 0 -34 Z`} fill="#f4d894" />
        <path d={`M ${FLAME_X} 452 q 6 10 0 22 q -6 -12 0 -22 Z`} fill="#fff6e0" />

        {/* ── インク壺と羽根ペン ─────────────────────────────── */}
        <path d="M470 640 L470 606 Q470 600 476 600 L516 600 Q522 600 522 606 L522 640 Z" fill="#221a12" />
        <rect x="482" y="592" width="28" height="10" rx="2" fill="#3a2d1e" />
        <ellipse cx="496" cy="592" rx="14" ry="4" fill="#4a3a26" />
        <ellipse cx="496" cy="592" rx="8" ry="2.4" fill="#0d0a06" />
        <rect x="470" y="614" width="52" height="26" fill="#2f2a22" opacity="0.7" />
        <path d="M470 606 Q470 600 476 600 L516 600 Q522 600 522 606"
              fill="none" stroke={TAN} strokeWidth="1" opacity="0.45" />
        {/* 羽根。軸を1本、羽枝を細い線で */}
        <g transform="rotate(20 496 592)">
          <path d="M494 592 L494 486" stroke="#d6c7a4" strokeWidth="2.4" fill="none" />
          <path d="M494 486 q 20 26 12 62 q -8 24 -12 26 Z" fill="#c2b291" opacity="0.85" />
          <path d="M494 486 q -18 28 -10 62 q 6 22 10 26 Z" fill="#e0d4b6" opacity="0.75" />
          <g stroke="#8a7350" strokeWidth="0.55" opacity="0.6">
            {Array.from({ length: 16 }, (_, i) => (
              <line key={i} x1="494" y1={496 + i * 4.4} x2={494 + (i % 2 ? 9 : -9)} y2={492 + i * 4.4} />
            ))}
          </g>
        </g>

        {/* 蛾。炎に寄る一匹。物語をここに一つだけ置く */}
        <g transform={`translate(${FLAME_X + 62} 434) rotate(-16)`} fill="#4a4034" opacity="0.9">
          <path d="M0 0 q -16 -12 -22 -2 q -4 8 8 10 Z" />
          <path d="M0 0 q 16 -12 22 -2 q 4 8 -8 10 Z" />
          <ellipse cx="0" cy="3" rx="2.6" ry="7" />
          <path d="M0 -4 l-4 -6 M0 -4 l4 -6" stroke="#4a4034" strokeWidth="0.9" />
        </g>

        {/* ── 灯りと闇。ここで一枚に締める ───────────────────── */}
        <rect width="600" height="800" fill={`url(#${P}-lamp)`}
              style={{ mixBlendMode: "multiply" }} opacity="0.92" />
        <ellipse cx={FLAME_X} cy="486" rx="360" ry="300" fill={`url(#${P}-glow)`}
                 style={{ mixBlendMode: "screen" }} />

        {/* 埃。光の中だけ */}
        {dust.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#f0dcae" opacity={d.o * 0.5} />
        ))}

        {/* ── 文字。机の前板に金で ───────────────────────────── */}
        <rect x="120" y="686" width="360" height="1" fill={GOLD} opacity="0.35" />
        <text x="300" y="722" textAnchor="middle" fill={GOLD}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="23" letterSpacing="8.5">
          DARK ACADEMIA
        </text>
        <text x="300" y="748" textAnchor="middle" fill={TAN}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="9.5"
              fontStyle="italic" letterSpacing="4.4" opacity="0.85">
          ARS LONGA · VITA BREVIS
        </text>
        <rect x="120" y="762" width="360" height="1" fill={GOLD} opacity="0.2" />
        <text x="42" y="778" fill={TAN} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="8.5" letterSpacing="2.6" opacity="0.5">MMXIX</text>
        <text x="558" y="778" textAnchor="end" fill={TAN} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="8.5" letterSpacing="2.6" opacity="0.5">SHELF XLVII</text>

        {/* 紙の目。暗い版なので薄く。強いと砂嵐になる */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.1"
              style={{ mixBlendMode: "overlay" }} />
      </g>
    </svg>
  );
}
