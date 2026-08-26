/**
 * ディーゼルパンク。
 *
 * ■ スチームパンクと、はっきり別の絵にする
 *   あちらは19世紀の設計図。細い線・真鍮の暖色・紙。
 *   こちらは1930〜40年代の宣伝ポスター。太い面・鋼の寒色・鉄板。
 *   同じ「架空の時代」でも、線の太さと色温度を逆にすれば混ざらない。
 *
 * ■ プロパガンダの構図とは何か
 *   1. 放射。背後から光条を出して、主題を「決定的」に見せる。
 *   2. 仰角。下から見上げる形にして、機械を人より大きくする。
 *   3. 斜めの帯。文字は水平に置かず、版面を斜めに横切らせる。
 *   4. 文字は詰めて太らせる。読ませるのではなく、叩きつける。
 *
 * ■ 星型発動機を主題にした理由
 *   歯車はスチームパンクに渡した。こちらは「燃焼する機械」が要る。
 *   気筒が9つ環状に並ぶ形は、近くで見たときの細部にもなる。
 */
import { ATLAS, rand, rad } from "@/lib/plate";

const P = "dp";

const SLATE = "#22262a";
const OCHRE = "#8a6a3f";
const RED = "#b03a2e";
const BONE = "#c8c2b0";
const NIGHT = "#12151a";
const STEEL_HI = "#9aa2a8";
const STEEL_D = "#2b3238";

const CX = 374;
const CY = 322;
const TILT = -13;

/** リベット。鋼板の上では、真鍮より硬く小さく打つ */
const Rivet = ({ x, y, r = 3.4 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#454d54" />
    <circle cx={x - r * 0.26} cy={y - r * 0.26} r={r * 0.6} fill="#8f979d" />
    <circle cx={x + r * 0.22} cy={y + r * 0.26} r={r * 0.42} fill={NIGHT} opacity="0.55" />
  </g>
);

export default function Plate() {
  const r = rand(19390901);

  /* 気筒。9本。星型発動機は必ず奇数 */
  const cyl = Array.from({ length: 9 }, (_, i) => rad(-90 + i * 40));

  /* 煤の粒。左上から流す */
  const soot = Array.from({ length: 120 }, () => ({
    x: r(-20, 620), y: r(-20, 820), s: r(0.8, 3.4), o: r(0.05, 0.3),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ディーゼルパンク様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        <linearGradient id={`${P}-bg`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#2c3238" />
          <stop offset="0.55" stopColor={SLATE} />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
        {/* 鋼。真鍮と違い、明部を狭く・暗部を広く取る */}
        <linearGradient id={`${P}-steel`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={STEEL_HI} />
          <stop offset="0.16" stopColor="#6d757c" />
          <stop offset="0.5" stopColor="#454d54" />
          <stop offset="0.82" stopColor={STEEL_D} />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
        <linearGradient id={`${P}-steel2`} x1="0.9" y1="0" x2="0.1" y2="1">
          <stop offset="0" stopColor="#828a90" />
          <stop offset="0.5" stopColor="#3c434a" />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
        <linearGradient id={`${P}-blade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c848a" />
          <stop offset="0.42" stopColor="#4a5158" />
          <stop offset="1" stopColor="#1d2227" />
        </linearGradient>
        <radialGradient id={`${P}-flare`}>
          <stop offset="0" stopColor="#e0c088" stopOpacity="0.75" />
          <stop offset="0.55" stopColor={OCHRE} stopOpacity="0.3" />
          <stop offset="1" stopColor={OCHRE} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}-vig`} cx="0.5" cy="0.44">
          <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.46" />
        </radialGradient>
        <filter id={`${P}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-bg)`} />

        {/* ── 放射。プロパガンダはここから始まる ─────────────────── */}
        <g transform={`translate(${CX} ${CY})`}>
          {Array.from({ length: 36 }, (_, i) => {
            const a0 = rad(i * 10 + 3);
            const a1 = rad(i * 10 + 10);
            const L = 980;
            return (
              <path key={i} fill={OCHRE} opacity={i % 2 ? 0.34 : 0.16}
                    d={`M0 0 L${Math.cos(a0) * L} ${Math.sin(a0) * L} L${Math.cos(a1) * L} ${Math.sin(a1) * L} Z`} />
            );
          })}
        </g>
        <circle cx={CX} cy={CY} r="330" fill={`url(#${P}-flare)`} />
        {/* 網点。当時の印刷はこれで刷られている */}
        <rect width="600" height="800" fill={`url(#${ATLAS.halftone})`} opacity="0.3" />

        {/* ── 遠景の煙突。仰角なので低く、小さく ─────────────────── */}
        <g opacity="0.85">
          {[[52, 92, 250], [92, 74, 268], [132, 108, 240]].map(([x, w, top], i) => (
            <g key={i}>
              <rect x={x} y={top} width={w * 0.28} height={620 - top} fill={NIGHT} />
              <rect x={x} y={top} width={w * 0.28} height="9" fill="#3a4147" />
            </g>
          ))}
          <g filter={`url(#${P}-soft)`} fill="#525a61" opacity="0.7">
            <ellipse cx="74" cy="212" rx="56" ry="30" />
            <ellipse cx="132" cy="160" rx="70" ry="34" />
            <ellipse cx="206" cy="118" rx="86" ry="40" />
            <ellipse cx="300" cy="72" rx="104" ry="44" />
          </g>
        </g>

        {/* ── 機体。左下から突き上げる楔 ───────────────────────── */}
        <g transform={`rotate(${TILT} ${CX} ${CY})`}>
          <path d="M318 286 L340 442 L-40 792 L-40 596 Z" fill={`url(#${P}-steel2)`} />
          {/* 上の稜線を明るく、下を暗く。これだけで平板が丸くなる */}
          <path d="M318 286 L330 336 L-40 646 L-40 596 Z" fill="#7e868c" opacity="0.75" />
          <path d="M328 404 L340 442 L-40 792 L-40 746 Z" fill={NIGHT} opacity="0.6" />
          <path d="M318 286 L340 442 L-40 792 L-40 596 Z" fill="none" stroke={NIGHT} strokeWidth="2" />
          {/* 継ぎ目とリベット列 */}
          <g stroke={NIGHT} strokeWidth="1.6" opacity="0.65">
            <line x1="330" y1="342" x2="-40" y2="652" />
            <line x1="336" y1="398" x2="-40" y2="742" />
          </g>
          {Array.from({ length: 12 }, (_, i) => (
            <Rivet key={i} x={306 - i * 29} y={352 + i * 24} r={3} />
          ))}
          {/* 風防。骨の色を1点だけ置く。機体の稜線に乗せる */}
          <g transform="translate(0 0)">
            <path d="M150 466 L196 428 L246 402 L270 420 L206 484 Z" fill="#6f787e" stroke={NIGHT} strokeWidth="2.2" />
            <path d="M162 466 L200 436 L244 414 L256 424 L204 472 Z" fill={BONE} opacity="0.6" />
            <g stroke={NIGHT} strokeWidth="1.8">
              <line x1="199" y1="433" x2="214" y2="478" />
              <line x1="243" y1="409" x2="256" y2="424" />
            </g>
          </g>
          {/* 排気管。機体の下の縁から吹き出す */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${300 - i * 34} ${468 + i * 30}) rotate(140)`}>
              <rect width="52" height="14" rx="7" fill="#3c434a" stroke={NIGHT} strokeWidth="1.4" />
              <rect x="3" y="2.5" width="46" height="3" rx="1.5" fill="#8f979d" opacity="0.5" />
              <ellipse cx="52" cy="7" rx="4" ry="6" fill={NIGHT} />
            </g>
          ))}
        </g>

        {/* ── 星型発動機。版面の主 ────────────────────────────── */}
        <g transform={`rotate(${TILT} ${CX} ${CY})`}>
          {/* 気筒。9本の環。近くで見たときの細部はここ */}
          {cyl.map((a, i) => (
            <g key={i} transform={`translate(${CX + Math.cos(a) * 118} ${CY + Math.sin(a) * 118}) rotate(${(a * 180) / Math.PI + 90})`}>
              <rect x="-19" y="-44" width="38" height="76" rx="6" fill={`url(#${P}-steel)`} stroke={NIGHT} strokeWidth="1.6" />
              {/* 冷却フィン。ここが近くで見たときの細部 */}
              {Array.from({ length: 9 }, (_, k) => (
                <rect key={k} x="-23" y={-40 + k * 8.4} width="46" height="3.8" rx="1.8" fill="#727a80" stroke={NIGHT} strokeWidth="0.7" />
              ))}
              <rect x="-9" y="-54" width="18" height="14" rx="3" fill="#3c434a" stroke={NIGHT} strokeWidth="1.2" />
              <rect x="-19" y="26" width="38" height="7" rx="3" fill="#2b3238" stroke={NIGHT} strokeWidth="1" />
            </g>
          ))}

          {/* カウリング（覆い）。輪を三重にして厚みを出す */}
          <circle cx={CX} cy={CY} r="150" fill="none" stroke={`url(#${P}-steel)`} strokeWidth="30" />
          <circle cx={CX} cy={CY} r="150" fill="none" stroke={NIGHT} strokeWidth="2" opacity="0.9" />
          <circle cx={CX} cy={CY} r="135" fill="none" stroke={NIGHT} strokeWidth="1.6" opacity="0.8" />
          <circle cx={CX} cy={CY} r="165" fill="none" stroke={NIGHT} strokeWidth="1.6" opacity="0.8" />
          {/* 覆いの上縁だけを光らせる */}
          <path d={`M${CX - 150} ${CY} A150 150 0 0 1 ${CX + 106} ${CY - 106}`} fill="none" stroke={STEEL_HI} strokeWidth="6" opacity="0.6" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = rad(i * 15 + 7);
            return <Rivet key={i} x={CX + Math.cos(a) * 162} y={CY + Math.sin(a) * 162} r={3.6} />;
          })}

          {/* 羽根。3枚。付け根を太く、先を薄く */}
          {[-84, 36, 156].map((deg, i) => (
            <g key={i} transform={`rotate(${deg} ${CX} ${CY})`}>
              <path d={`M${CX - 22} ${CY} C${CX - 40} ${CY - 120} ${CX - 26} ${CY - 200} ${CX - 8} ${CY - 244}
                        C${CX + 16} ${CY - 200} ${CX + 34} ${CY - 120} ${CX + 22} ${CY} Z`}
                    fill={`url(#${P}-blade)`} stroke={NIGHT} strokeWidth="2" />
              <path d={`M${CX - 10} ${CY - 24} C${CX - 22} ${CY - 120} ${CX - 12} ${CY - 190} ${CX - 6} ${CY - 232}`}
                    fill="none" stroke={STEEL_HI} strokeWidth="3" opacity="0.42" />
            </g>
          ))}

          {/* 中心の紡錘 */}
          <circle cx={CX} cy={CY} r="52" fill={`url(#${P}-steel2)`} stroke={NIGHT} strokeWidth="2.4" />
          <circle cx={CX} cy={CY} r="34" fill={`url(#${P}-steel)`} stroke={NIGHT} strokeWidth="1.8" />
          <circle cx={CX - 12} cy={CY - 14} r="11" fill={STEEL_HI} opacity="0.55" />
          {Array.from({ length: 6 }, (_, i) => {
            const a = rad(i * 60 + 15);
            return <Rivet key={i} x={CX + Math.cos(a) * 43} y={CY + Math.sin(a) * 43} r={3.2} />;
          })}
        </g>

        {/* ── 斜めの帯。文字は水平に置かない ─────────────────────── */}
        <g transform="rotate(-7 300 640)">
          <rect x="-60" y="596" width="720" height="16" fill={OCHRE} />
          <rect x="-60" y="616" width="720" height="82" fill={RED} />
          <rect x="-60" y="616" width="720" height="4" fill="#d8674f" opacity="0.7" />
          <rect x="-60" y="694" width="720" height="4" fill={NIGHT} opacity="0.5" />
          {/* 帯の上のリベット */}
          {Array.from({ length: 22 }, (_, i) => <Rivet key={i} x={-40 + i * 30} y={604} r={3} />)}
          {/* 題字。詰めて太らせ、横に潰す */}
          <g transform="translate(46 682) scale(0.9 1)">
            <text fill={NIGHT} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                  fontSize="62" fontWeight="800" letterSpacing="-1" transform="translate(4 4)" opacity="0.5">
              DIESELPUNK
            </text>
            <text fill={BONE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                  fontSize="62" fontWeight="800" letterSpacing="-1">
              DIESELPUNK
            </text>
          </g>
        </g>

        {/* ── 上下の鋼板。版面ごと鉄で挟む ───────────────────── */}
        <g>
          <rect width="600" height="40" fill={`url(#${P}-steel2)`} />
          <rect y="38" width="600" height="3" fill={NIGHT} />
          <rect y="758" width="600" height="42" fill={`url(#${P}-steel2)`} />
          <rect y="756" width="600" height="3" fill={NIGHT} />
          {Array.from({ length: 20 }, (_, i) => (
            <g key={i}>
              <Rivet x={18 + i * 31} y={20} />
              <Rivet x={18 + i * 31} y={780} />
            </g>
          ))}
        </g>

        {/* ── 文字 ───────────────────────────────────────────── */}
        <text x="26" y="26" fill={BONE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="11" fontWeight="700" letterSpacing="6.5" opacity="1">
          THE ENGINE AGE
        </text>
        <text x="574" y="26" textAnchor="end" fill={OCHRE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="11" fontWeight="700" letterSpacing="4" opacity="0.95">
          MCMXXXIX
        </text>
        <text x="26" y="784" fill={BONE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="10" fontWeight="600" letterSpacing="4.6" opacity="0.95">
          MOTOR · STEEL · SOOT
        </text>
        <text x="574" y="784" textAnchor="end" fill={BONE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="10" fontWeight="600" letterSpacing="3" opacity="0.8">
          9 CYL. RADIAL
        </text>

        {/* 副題。帯の下に小さく置いて、版面の重心を留める */}
        <g transform="rotate(-7 300 640)">
          <text x="50" y="722" fill={BONE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="11" fontWeight="600" letterSpacing="5.4" opacity="0.95">
            OIL · IRON · THUNDER
          </text>
        </g>

        {/* 煤と汚れ。清潔にしない */}
        <g fill={NIGHT}>
          {soot.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={s.o} />)}
        </g>
        <rect width="600" height="800" fill={`url(#${P}-vig)`} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.24" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
