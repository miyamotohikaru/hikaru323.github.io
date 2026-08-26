/**
 * Ｙ２Ｋ。
 *
 * ■ ヴェイパー／シンセ／サイバーパンクと分けるための約束
 *   この3枚は全部「暗い」。だから Y2K は明るくする。
 *   地は銀と白。夜景も遠近グリッドも一切置かない。
 *   ここが「未来を信じていた頃」の絵であるための、いちばん大きな判断。
 *
 * ■ Y2K を Y2K にしている3つの物
 *   1. クローム。金属のグラデは「白→水色→暗い帯→桃→白」。
 *      真ん中に暗い帯（地平線）を挟まないと、ただの水色の面になる。
 *      初稿でこの帯を抜いたら、全部プラスチックに見えた。
 *   2. 半透明の樹脂。iMac やケータイの外装。
 *      面を透かし、上半分だけに艶を乗せると樹脂になる。
 *   3. 四つ角の星のきらめき。角を凹ませるのが要点。
 *      ただの十字にすると医療の記号に見える。
 *
 * ■ 書体は膨らませる
 *   丸い書体は読めないので、太い線を丸継ぎで裏に敷いて字を太らせる
 *   （paint-order: stroke）。これでバブル文字の形になる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "y2k";

const INK = "#0a0a1a";
const SILVER = "#c0c8d8";
const PINK = "#ff5ad4";
const CYAN = "#5ce1ff";
const WHITE = "#f2f2f8";

/** 四つ角の星。角を凹ませる */
const spark = (R: number) =>
  `M0 ${-R} Q ${R * 0.12} ${-R * 0.12} ${R} 0 Q ${R * 0.12} ${R * 0.12} 0 ${R} Q ${-R * 0.12} ${R * 0.12} ${-R} 0 Q ${-R * 0.12} ${-R * 0.12} 0 ${-R} Z`;

/** 液体金属の滴。左右非対称にしないと、ただの丸になる */
const BLOB =
  "M334 292 C404 288 458 336 456 396 C455 442 424 462 430 500 C437 546 396 578 344 574 " +
  "C288 570 254 540 240 496 C226 452 226 414 250 372 C272 334 296 294 334 292 Z";

export default function Plate() {
  const r = rand(20000101);

  const sparks = [
    { x: 326, y: 96, R: 32, o: 0.95 },
    { x: 470, y: 246, R: 22, o: 0.85 },
    { x: 96, y: 592, R: 17, o: 0.7 },
    { x: 536, y: 470, R: 13, o: 0.8 },
    { x: 396, y: 116, R: 11, o: 0.6 },
    { x: 268, y: 646, R: 9, o: 0.55 },
  ];

  /* 泡。半透明の球。上ほど小さく、右に寄せる */
  const bubbles = Array.from({ length: 10 }, () => ({
    x: r(60, 570),
    y: r(300, 790),
    R: r(7, 24),
  })).filter((b) => !(b.x > 280 && b.y > 620));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Y2K様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 地。銀。上を白く飛ばして、下に金属を沈める */}
        <linearGradient id={`${P}-bg`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.34" stopColor={WHITE} />
          <stop offset="0.72" stopColor="#d5dcea" />
          <stop offset="1" stopColor={SILVER} />
        </linearGradient>

        {/* クローム。暗い帯が要。ここが金属と樹脂の分かれ目 */}
        <linearGradient id={`${P}-chrome`} x1="0" y1="0" x2="0.14" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.16" stopColor="#e4ecf8" />
          <stop offset="0.33" stopColor={CYAN} />
          <stop offset="0.46" stopColor="#16205a" />
          <stop offset="0.53" stopColor={INK} />
          <stop offset="0.62" stopColor="#8f9fc0" />
          <stop offset="0.76" stopColor={PINK} />
          <stop offset="0.88" stopColor="#ffd7f2" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${P}-chrome-t`} x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.2" stopColor="#dfe9fa" />
          <stop offset="0.38" stopColor={CYAN} />
          <stop offset="0.5" stopColor="#1b2560" />
          <stop offset="0.57" stopColor="#3a4a86" />
          <stop offset="0.72" stopColor={PINK} />
          <stop offset="0.9" stopColor="#ffe2f6" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>

        {/* 桃と水色の靄。銀だけだと寒いので、後ろで両側から差す */}
        <radialGradient id={`${P}-bloomP`}>
          <stop offset="0" stopColor={PINK} stopOpacity="0.5" />
          <stop offset="1" stopColor={PINK} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}-bloomC`}>
          <stop offset="0" stopColor={CYAN} stopOpacity="0.55" />
          <stop offset="1" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${P}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>

        <radialGradient id={`${P}-bub`} cx="0.34" cy="0.28">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor={CYAN} stopOpacity="0.28" />
          <stop offset="0.85" stopColor={PINK} stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.6" />
        </radialGradient>

        <filter id={`${P}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`${P}-soft2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${P}-drop`} x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#33406b" floodOpacity="0.28" />
        </filter>

        <clipPath id={`${P}-blob`}><path d={BLOB} /></clipPath>
        <linearGradient id={`${P}-iris`} x1="1" y1="0.2" x2="0" y2="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.32" stopColor={CYAN} stopOpacity="0.85" />
          <stop offset="0.58" stopColor="#b9e0ff" stopOpacity="0.7" />
          <stop offset="0.78" stopColor={PINK} stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${P}-iris2`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PINK} stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#e6d5ff" stopOpacity="0.5" />
          <stop offset="1" stopColor={CYAN} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={`${P}-discsheen`} cx="0.3" cy="0.25">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#aebbd0" stopOpacity="0.5" />
        </radialGradient>
        <clipPath id={`${P}-disc`}>
          <ellipse cx="150" cy="592" rx="112" ry="64" transform="rotate(-16 150 592)" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-bg)`} />

        {/* 靄 */}
        <ellipse cx="470" cy="120" rx="240" ry="200" fill={`url(#${P}-bloomP)`} />
        <ellipse cx="120" cy="430" rx="250" ry="230" fill={`url(#${P}-bloomC)`} />

        {/* 後光。細い光条を放射する。楽観の絵なので、光は上へ広がる */}
        <g transform="translate(392 380)" opacity="0.08">
          {Array.from({ length: 30 }, (_, i) => {
            const a = (i / 30) * 360;
            const t = (a * Math.PI) / 180;
            const L = 170 + r(0, 170);
            const w = r(0.5, 3.2);
            return (
              <path key={i} fill={i % 2 ? CYAN : PINK}
                    d={`M0 0 L${L * Math.cos(t) - w * Math.sin(t)} ${L * Math.sin(t) + w * Math.cos(t)} L${L * Math.cos(t) + w * Math.sin(t)} ${L * Math.sin(t) - w * Math.cos(t)} Z`} />
            );
          })}
        </g>

        {/* 銀の刷毛目。平らな銀は嘘くさいので、横に伸ばした細線を敷く */}
        <g stroke="#ffffff" strokeWidth="1">
          {Array.from({ length: 60 }, (_, i) => {
            const y = r(0, 800);
            return (
              <line key={i} x1={r(-40, 240)} y1={y} x2={r(340, 640)} y2={y + r(-4, 4)} opacity={r(0.06, 0.2)} />
            );
          })}
        </g>

        {/* ── CD。虹の輪。左下に沈めて版面の重心を下げる ─────────── */}
        <g filter={`url(#${P}-drop)`}>
          <g transform="rotate(-16 150 592)">
            <ellipse cx="150" cy="592" rx="112" ry="64" fill="#e4ebf6" />
            <ellipse cx="150" cy="592" rx="112" ry="64" fill={`url(#${P}-discsheen)`} />
            <g clipPath={`url(#${P}-disc)`}>
              {/* 虹は一方向から差す。全周を虹にすると的（まと）に見える */}
              <path d="M150 592 L26 548 L40 640 Z" fill={`url(#${P}-iris)`} opacity="0.85" />
              <path d="M150 592 L262 636 L250 546 Z" fill={`url(#${P}-iris)`} opacity="0.55" />
              <path d="M150 592 L60 656 L214 654 Z" fill={`url(#${P}-iris2)`} opacity="0.5" />
              {/* 溝。細い輪を詰めて刻むと、記録面の手触りが出る */}
              {Array.from({ length: 44 }, (_, i) => (
                <ellipse key={i} cx="150" cy="592" rx={112 - i * 2.1} ry={64 - i * 1.2}
                         fill="none" stroke="#7f8ea8" strokeWidth="0.6" opacity="0.16" />
              ))}
              <path d="M34 536 L246 512 L258 588 L46 632 Z" fill="#ffffff" opacity="0.34" filter={`url(#${P}-soft2)`} />
            </g>
            <ellipse cx="150" cy="592" rx="112" ry="64" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
            <ellipse cx="150" cy="592" rx="30" ry="17" fill={`url(#${P}-bg)`} stroke="#b9c4d8" strokeWidth="1.2" />
            <ellipse cx="150" cy="592" rx="10" ry="5.6" fill={SILVER} />
          </g>
        </g>

        {/* ── 液体金属の滴。右上へ。左下のCDと対角に置いて動きを出す ── */}
        <g filter={`url(#${P}-drop)`} transform="translate(392 380) scale(0.9) translate(-345 -432)">
          <path d={BLOB} fill={`url(#${P}-chrome)`} />
          <g clipPath={`url(#${P}-blob`.concat(")")}>
            {/* 映り込み。上に空、下に地面。金属はまわりを映すから金属に見える */}
            <ellipse cx="316" cy="336" rx="112" ry="52" fill="#ffffff" opacity="0.55" filter={`url(#${P}-soft)`} />
            <ellipse cx="380" cy="560" rx="120" ry="44" fill={PINK} opacity="0.35" filter={`url(#${P}-soft)`} />
            <path d="M226 424 L470 400 L470 414 L226 440 Z" fill="#ffffff" opacity="0.5" />
          </g>
          {/* 際の白。金属の縁は必ず光る */}
          <path d={BLOB} fill="none" stroke="#ffffff" strokeWidth="2.6" opacity="0.85" />
          <path d={BLOB} fill="none" stroke="#5b6a92" strokeWidth="1" opacity="0.5" />
          {/* 芯の艶 */}
          <ellipse cx="300" cy="344" rx="34" ry="17" fill="#ffffff" opacity="0.95" transform="rotate(-24 300 344)" />
          <circle cx="272" cy="372" r="6" fill="#ffffff" opacity="0.9" />
        </g>
        {/* 飛沫。3粒。大きさを揃えないこと */}
        {[[522, 258, 23], [552, 308, 11], [500, 200, 7]].map(([x, y, R], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={R} fill={`url(#${P}-chrome-t)`} stroke="#ffffff" strokeWidth="1.6" />
            <ellipse cx={x - R * 0.3} cy={y - R * 0.42} rx={R * 0.42} ry={R * 0.24} fill="#ffffff" opacity="0.9" transform={`rotate(-25 ${x - R * 0.3} ${y - R * 0.42})`} />
          </g>
        ))}

        {/* ── 半透明の樹脂。板を2枚だけ。多いと玩具箱になる ────────── */}
        <g filter={`url(#${P}-drop)`}>
          <g transform="rotate(-7 150 274)">
            <rect x="46" y="218" width="184" height="112" rx="26" fill={CYAN} opacity="0.32" />
            <rect x="46" y="218" width="184" height="112" rx="26" fill="none" stroke="#ffffff" strokeWidth="2.2" opacity="0.9" />
            <path d="M56 232 h164 a16 16 0 0 1 0 0 v34 c-58 16 -110 16 -164 2 v-20 a16 16 0 0 1 0 -16 Z" fill={`url(#${P}-gloss)`} />
            {/* 中の目盛り。近くで見たときの細部 */}
            <g stroke="#1c2c5e" strokeWidth="1.4" opacity="0.45">
              {Array.from({ length: 12 }, (_, i) => (
                <line key={i} x1={68 + i * 13} y1="294" x2={68 + i * 13} y2={i % 3 === 0 ? 280 : 287} />
              ))}
              <line x1="68" y1="304" x2="212" y2="304" />
            </g>
            <text x="68" y="320" fill="#1c2c5e" fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" letterSpacing="2.2" opacity="0.62">
              TRANSLUCENT
            </text>
          </g>
        </g>

        <g filter={`url(#${P}-drop)`}>
          <g transform="rotate(5 420 690)">
            <rect x="300" y="640" width="256" height="106" rx="30" fill={PINK} opacity="0.3" />
            <rect x="300" y="640" width="256" height="106" rx="30" fill="none" stroke="#ffffff" strokeWidth="2.2" opacity="0.9" />
            <path d="M312 654 h232 v30 c-80 18 -152 18 -232 2 Z" fill={`url(#${P}-gloss)`} />
            <text x="428" y="700" textAnchor="middle" fill="#33104a" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                  fontSize="15" fontWeight="700" letterSpacing="4.5">
              THE FUTURE IS
            </text>
            <text x="428" y="726" textAnchor="middle" fill="#33104a" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                  fontSize="15" fontWeight="700" letterSpacing="4.5">
              GOING TO BE FINE
            </text>
          </g>
        </g>

        {/* 泡 */}
        {bubbles.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.R} fill={`url(#${P}-bub)`} opacity="0.75" />
            <circle cx={b.x} cy={b.y} r={b.R} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            <ellipse cx={b.x - b.R * 0.32} cy={b.y - b.R * 0.4} rx={b.R * 0.3} ry={b.R * 0.18} fill="#ffffff" opacity="0.9" />
          </g>
        ))}

        {/* ── 題字。太い丸継ぎの線を裏に敷いて膨らませる ───────────── */}
        <g>
          <text x="44" y="152" fill="none" stroke="#25306a" strokeWidth="30" strokeLinejoin="round" opacity="0.22"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="122" fontWeight="800" letterSpacing="-3"
                transform="translate(4 7)">
            Y2K
          </text>
          <text x="44" y="152" fill={`url(#${P}-chrome-t)`} stroke="#ffffff" strokeWidth="14" strokeLinejoin="round"
                style={{ paintOrder: "stroke" } as React.CSSProperties}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="122" fontWeight="800" letterSpacing="-3">
            Y2K
          </text>
          {/* 字の上に走る艶。バブル文字はここで一気に樹脂になる */}
          <g clipPath={`url(#${P}-page)`} opacity="0.75">
            <path d="M62 72 C112 58 198 58 250 72 C202 82 110 84 62 72 Z" fill="#ffffff" opacity="0.55" />
          </g>
        </g>
        <text x="50" y="196" fill="#243468" fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="10.5" letterSpacing="5.4" opacity="0.72">
          01.01.2000 — OK
        </text>

        {/* きらめき。角を凹ませた四つ角の星 */}
        {sparks.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={s.o}>
            <path d={spark(s.R * 2.1)} fill="#ffffff" opacity="0.3" filter={`url(#${P}-soft2)`} />
            <path d={spark(s.R)} fill="#ffffff" />
            <path d={spark(s.R * 0.42)} fill={i % 2 ? CYAN : PINK} transform="rotate(45)" opacity="0.9" />
          </g>
        ))}

        {/* クロームの丸。地の右上を締める小物 */}
        <g>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={492 + i * 26} cy={568} r="9" fill={`url(#${P}-chrome-t)`} stroke="#ffffff" strokeWidth="1.4" opacity={0.5 + i * 0.16} />
          ))}
        </g>

        <text x="46" y="778" fill="#3a4570" fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="9.5" letterSpacing="3" opacity="0.6">
          CHROME / TRANSLUCENT RESIN / SPARKLE
        </text>

        {/* 紙目はごく薄く。銀を汚さない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.09" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
