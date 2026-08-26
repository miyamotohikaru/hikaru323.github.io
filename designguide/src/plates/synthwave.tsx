/**
 * シンセウェイヴ。
 *
 * ■ ヴェイパーウェイヴと分けるための約束
 *   あちらは昼・パステル・静止。こちらは夜・発光・疾走。
 *   同じ「レトロなネット美学」でも、持ち物を交換しない。
 *   格子（地平線へ消える遠近グリッド）と横縞の巨大な太陽は、
 *   この一枚だけの道具にした。
 *
 * ■ 疾走感をどう出すか
 *   1. 消失点をきっちり画面中央に置き、左右対称にする。
 *      対称だと「まっすぐ突っ込んでいく」形になる。
 *   2. グリッドの横線を等間隔にしない。手前ほど広く（等比）にすると、
 *      目が勝手に「近づいてくる」と読む。初稿で等間隔にしたら
 *      ただの方眼紙になった。
 *   3. 道路の破線を、手前ほど長く・太くする。
 *   4. 書体を斜体にする。立てると途端に止まって見える。
 *
 * ■ 太陽は縞で抜く。ただし等幅にしない
 *   下ほど縞を太くすると、沈んでいく途中に見える。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "sw";

const NIGHT = "#0b0322";
const PINK = "#ff2e88";
const PURPLE = "#7a2ff2";
const CYAN = "#00e0ff";
const AMBER = "#ffb800";

const HZ = 470; // 地平線
const VX = 300; // 消失点

/** 山の稜線。左右で高さと刻みを変える。左右対称だと作り物に見える */
const ridge = (x0: number, x1: number, pts: [number, number][]) =>
  `M${x0} ${HZ} ` + pts.map(([x, y]) => `L${x} ${y}`).join(" ") + ` L${x1} ${HZ} Z`;

const RANGE_L = ridge(-30, 236, [
  [-30, 402], [24, 430], [64, 372], [104, 408], [138, 344], [178, 398], [206, 376], [236, 420],
]);
const RANGE_R = ridge(372, 630, [
  [372, 424], [404, 386], [436, 412], [472, 352], [516, 402], [552, 368], [592, 408], [630, 384],
]);

export default function Plate() {
  const r = rand(19840226);

  /* グリッドの横線。等比で開くから「近づいてくる」 */
  const rows: number[] = [];
  for (let j = 0; ; j++) {
    const d = 3.4 * Math.pow(1.315, j);
    if (HZ + d > 812) break;
    rows.push(HZ + d);
  }

  /* 太陽の縞。下ほど太く抜く */
  const SUN_CY = 452;
  const SUN_R = 194;
  const bands: { y: number; h: number }[] = [];
  for (let y = SUN_CY - 136, h = 1.6; y < HZ; h *= 1.185) {
    bands.push({ y, h });
    y += h + 6.2;
  }

  const stars = Array.from({ length: 90 }, () => ({
    x: r(0, 600),
    y: r(0, HZ - 6),
    s: r(0.6, 1.9),
    o: r(0.25, 0.95),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="シンセウェイヴ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-sky`}><rect width="600" height={HZ} /></clipPath>
        <clipPath id={`${P}-ground`}><rect y={HZ} width="600" height={800 - HZ} /></clipPath>
        <clipPath id={`${P}-sun`}><circle cx={VX + 6} cy={SUN_CY} r={SUN_R} /></clipPath>
        <clipPath id={`${P}-mts`}><path d={RANGE_L} /><path d={RANGE_R} /></clipPath>

        <linearGradient id={`${P}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050113" />
          <stop offset="0.5" stopColor="#170741" />
          <stop offset="0.86" stopColor="#4a1180" />
          <stop offset="1" stopColor="#8b1c86" />
        </linearGradient>

        {/* 太陽。上が琥珀、下が桃。沈む向きに温度を落とす */}
        <linearGradient id={`${P}-sundisc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c0" />
          <stop offset="0.24" stopColor={AMBER} />
          <stop offset="0.62" stopColor="#ff5a5a" />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>

        {/* 地面。奥は紫、手前は闇に落とす */}
        <linearGradient id={`${P}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d0c6b" />
          <stop offset="0.42" stopColor="#1a0440" />
          <stop offset="1" stopColor="#070118" />
        </linearGradient>

        {/* クローム。白→水色→暗部→桃→琥珀。暗部を挟まないと金属に見えない */}
        <linearGradient id={`${P}-chrome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.26" stopColor="#8df0ff" />
          <stop offset="0.44" stopColor="#1b0a52" />
          <stop offset="0.56" stopColor="#2a0a6e" />
          <stop offset="0.78" stopColor={PINK} />
          <stop offset="1" stopColor={AMBER} />
        </linearGradient>

        <radialGradient id={`${P}-halo`}>
          <stop offset="0.35" stopColor={PINK} stopOpacity="0.55" />
          <stop offset="0.7" stopColor={PURPLE} stopOpacity="0.22" />
          <stop offset="1" stopColor={PURPLE} stopOpacity="0" />
        </radialGradient>

        <filter id={`${P}-glow`} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${P}-glow-s`} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={NIGHT} />
        <rect width="600" height={HZ} fill={`url(#${P}-night)`} />

        {/* 星。地平線に近いほど減らす */}
        <g clipPath={`url(#${P}-sky)`} fill="#ffffff">
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={s.o * (1 - s.y / HZ) * 1.35} />
          ))}
        </g>

        {/* 太陽の後光 */}
        <circle cx={VX + 6} cy={SUN_CY} r="330" fill={`url(#${P}-halo)`} />

        {/* ── 太陽。縞は下ほど太く抜く ─────────────────────────── */}
        <g clipPath={`url(#${P}-sky)`}>
          <g filter={`url(#${P}-glow)`}>
            <circle cx={VX + 6} cy={SUN_CY} r={SUN_R} fill={`url(#${P}-sundisc)`} />
          </g>
          <g clipPath={`url(#${P}-sun)`}>
            {bands.map((b, i) => (
              <rect key={i} x="90" y={b.y} width="420" height={b.h} fill={NIGHT} opacity="0.92" />
            ))}
          </g>
        </g>

        {/* ── 山。ワイヤーフレームで刻む ───────────────────────── */}
        <g>
          <path d={RANGE_L} fill="#180536" />
          <path d={RANGE_R} fill="#1d0742" />
          <g clipPath={`url(#${P}-mts`.concat(")")} stroke={CYAN} strokeWidth="0.9" opacity="0.4">
            {Array.from({ length: 14 }, (_, i) => {
              const y = HZ - 9 * Math.pow(1.235, i);
              return <line key={`h${i}`} x1="-30" y1={y} x2="630" y2={y} opacity={0.9 - i * 0.045} />;
            })}
            {Array.from({ length: 45 }, (_, i) => (
              <line key={`v${i}`} x1={-30 + i * 15} y1="330" x2={-30 + i * 15} y2={HZ} opacity="0.55" />
            ))}
          </g>
          {/* 稜線だけ光らせる。輪郭が光ると立体が起きる */}
          <g filter={`url(#${P}-glow-s)`} fill="none" stroke={PINK} strokeWidth="1.8" opacity="0.9">
            <path d={RANGE_L} /><path d={RANGE_R} />
          </g>
        </g>

        {/* ── 地平線 ────────────────────────────────────────── */}
        <g filter={`url(#${P}-glow)`}>
          <rect x="0" y={HZ - 1.6} width="600" height="3.2" fill={CYAN} opacity="0.95" />
        </g>

        {/* ── 地面のグリッド ────────────────────────────────── */}
        <rect y={HZ} width="600" height={800 - HZ} fill={`url(#${P}-floor)`} />
        <g clipPath={`url(#${P}-ground)`}>
          <g stroke={PINK} strokeWidth="1.1" opacity="0.75">
            {Array.from({ length: 41 }, (_, i) => {
              const bx = VX + (i - 20) * 96;
              return <line key={`g${i}`} x1={VX} y1={HZ} x2={bx} y2="812" />;
            })}
          </g>
          <g stroke={CYAN} opacity="0.8">
            {rows.map((y, i) => (
              <line key={`r${i}`} x1="-40" y1={y} x2="640" y2={y}
                    strokeWidth={0.7 + i * 0.11} opacity={0.35 + i * 0.035} />
            ))}
          </g>

          {/* 道路。グリッドの上に敷いて、真ん中に一本の速さを通す */}
          <path d={`M${VX} ${HZ} L104 812 L${VX * 2 - 104} 812 Z`} fill="#0a0220" opacity="0.86" />
          <g filter={`url(#${P}-glow-s)`} stroke={CYAN} strokeWidth="2" opacity="0.9">
            <line x1={VX} y1={HZ} x2="104" y2="812" />
            <line x1={VX} y1={HZ} x2={VX * 2 - 104} y2="812" />
          </g>
          {/* 破線。手前ほど長く太く＝近づいてくる */}
          <g fill={AMBER} filter={`url(#${P}-glow-s)`}>
            {Array.from({ length: 16 }, (_, j) => {
              const d0 = 4.2 * Math.pow(1.5, j);
              const y0 = HZ + d0;
              if (y0 > 812) return null;
              const y1 = Math.min(812, y0 + d0 * 0.34);
              const w0 = d0 * 0.026 + 0.5;
              const w1 = (y1 - HZ) * 0.026 + 0.5;
              return <path key={j} d={`M${VX - w0} ${y0} L${VX + w0} ${y0} L${VX + w1} ${y1} L${VX - w1} ${y1} Z`} opacity="0.95" />;
            })}
          </g>
          {/* 尾灯の光跡。消失点から手前へ広がる帯。ここで速さが決まる */}
          <g filter={`url(#${P}-glow-s)`} opacity="0.45">
            {[-0.42, 0.42].map((k, i) => (
              <path key={i} fill={PINK}
                    d={`M${VX + k * 3} ${HZ + 6} L${VX + k * 200 - 5} 812 L${VX + k * 200 + 9} 812 Z`} />
            ))}
          </g>

          {/* 路肩を流れる光。速度線 */}
          <g stroke={PINK} strokeLinecap="round" opacity="0.55">
            {Array.from({ length: 16 }, (_, i) => {
              const y = HZ + 20 + r(0, 300);
              const side = i % 2 ? 1 : -1;
              const half = ((y - HZ) / (812 - HZ)) * 196 + 4;
              const x = VX + side * (half + r(14, 90));
              const len = r(20, 84) * ((y - HZ) / 300 + 0.3);
              return <line key={i} x1={x} y1={y} x2={x + side * len} y2={y} strokeWidth={r(1, 2.6)} />;
            })}
          </g>
        </g>

        {/* ── 文字。斜体。立てると止まって見える ─────────────────── */}
        <g transform="translate(0 0)">
          <g filter={`url(#${P}-glow)`} opacity="0.85">
            <text x="300" y="170" textAnchor="middle" fill={PINK}
                  fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                  fontSize="64" fontWeight="800" fontStyle="italic" letterSpacing="1">
              SYNTHWAVE
            </text>
          </g>
          <text x="300" y="170" textAnchor="middle" fill={`url(#${P}-chrome)`}
                stroke="#ffe0f2" strokeWidth="1.1"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="64" fontWeight="800" fontStyle="italic" letterSpacing="1">
            SYNTHWAVE
          </text>
        </g>
        <g textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
          <text x="300" y="200" fill={CYAN} fontSize="12" fontWeight="600" fontStyle="italic" letterSpacing="9.5" opacity="0.9">
            OUTRUN · NIGHT DRIVE
          </text>
        </g>
        {/* 題字の左右に細い罫を伸ばして、版面の幅を使い切る */}
        <g stroke={CYAN} strokeWidth="1" opacity="0.5">
          <line x1="46" y1="195" x2="176" y2="195" />
          <line x1="424" y1="195" x2="554" y2="195" />
        </g>

        {/* 地平線の目盛り。近くで見たときの細部 */}
        <g stroke={CYAN} strokeWidth="1" opacity="0.5">
          {Array.from({ length: 25 }, (_, i) => (
            <line key={i} x1={i * 25} y1={HZ - 4} x2={i * 25} y2={HZ - (i % 5 === 0 ? 11 : 6)} />
          ))}
        </g>

        <text x="46" y="66" fill={CYAN} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="10" letterSpacing="3.2" opacity="0.7">
          FM SYNTH — GATED REVERB — 1984
        </text>
        <text x="554" y="66" textAnchor="end" fill={PINK} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="10" letterSpacing="3.2" opacity="0.7">
          BPM 118
        </text>
        <text x="46" y="778" fill={AMBER} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="10" letterSpacing="3" opacity="0.8">
          VANISHING POINT 300, 470
        </text>

        {/* 走査線と粒。ブラウン管越しに見ている、という約束 */}
        <rect width="600" height="800" fill={`url(#${ATLAS.scanlines})`} opacity="0.16" />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.1" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}
