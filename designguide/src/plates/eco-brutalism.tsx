/**
 * エコ・ブルータリズム。
 *
 * 打ち放しの塊に緑を垂らす、2010年代以降の折衷。灰と緑の対比が全て。
 * 隣の brutalism は3／4の見上げで「塊」を描いたので、こちらは
 * 正対の積層で描き分ける。同じ様式の色違いに見せないため。
 *
 * ■ 初稿の失敗 ── 緑が勝ちすぎた
 *   スラブを30pxの棚にしたら、コンクリートが白い細帯に痩せ、
 *   「吊り鉢の壁」になった。様式名の半分が消えたことになる。
 *   直したのは3点。
 *     ・プランターの立ち上がりを58pxに厚くし、軒裏を20pxにした。
 *       打ち放しは厚みでしか物量を語れない。
 *     ・左右に無開口の壁柱を立て、版面の1/3を素のコンクリートに戻した。
 *     ・蔓の長さを揃えるのをやめた。等間隔で同じ長さに垂らすと
 *       ビーズ暖簾に見える。数本だけ極端に長く伸ばして房にした。
 *
 * ■ 灰と緑を繋ぐのは「汚れ」
 *   植栽の真下のコンクリートは必ず藻で緑黒くなる。この中間色が無いと、
 *   別々に描いた2枚を貼り合わせた合成写真に見える。
 *
 * ■ 葉は1枚ずつ描く
 *   緑を面で塗ると苔むした岩になる。丸葉と細葉の2種を混ぜ、
 *   向き・大きさ・明度をばらして数百枚重ねる。
 */
import { ATLAS, rand, shift } from "@/lib/plate";

const P = "ecb";

const CONC = "#a8a399";
const CONC_LIT = "#cac5b8";
const SOFFIT = "#3d3a34";
const INK = "#2a2a26";

/* 緑は spine の #6e7f5c を軸に明暗7段。別の色相は足さない */
const G = ["#31462a", "#405a33", "#4f693f", "#61794b", "#748b5b", "#8a9f70", "#a1b489"];

/* ── 骨格。左右に無開口の壁柱、中央に段々のプランター ────────── */
const LX = 132; // 左の壁柱の右端
const RX = 508; // 右の壁柱の左端
const TOP = 168; // 屋上スラブの上端
const BOT = 700;
const FLOORS = [312, 452, 592]; // スラブ上端
const PF = 58; // プランターの立ち上がり
const SF = 20; // 軒裏の厚み

const LEAF = "M0 0 C 5 -7 13 -9 18 0 C 13 9 5 7 0 0 Z"; // 丸葉
const FROND = "M0 0 C 8 -3 24 -3 34 0 C 24 3 8 3 0 0 Z"; // 細葉

type R = (min?: number, max?: number) => number;

/** 葉の塊。楕円の中に向きも大きさもばらばらの葉を撒く */
function Bush({ cx, cy, rx, ry, n, r, s = 1, frond = 0.22 }: { cx: number; cy: number; rx: number; ry: number; n: number; r: R; s?: number; frond?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = r(0, Math.PI * 2);
        const q = Math.sqrt(r());
        const x = cx + Math.cos(a) * rx * q;
        const y = cy + Math.sin(a) * ry * q;
        const rot = r(-180, 180);
        const sc = s * r(0.45, 1.05);
        const c = G[Math.min(6, Math.floor(r(0, 7)))];
        const isF = r() < frond;
        return (
          <path
            key={i}
            d={isF ? FROND : LEAF}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${(isF ? sc * 0.7 : sc).toFixed(2)})`}
            fill={c}
          />
        );
      })}
    </g>
  );
}

/** 垂れる蔓。コンクリートの水平線を縦に切るのが役目 */
function Vine({ x, y, len, amp, freq, phase, w, r }: { x: number; y: number; len: number; amp: number; freq: number; phase: number; w: number; r: R }) {
  const N = 12;
  const pt = (t: number) => [x + Math.sin(phase + t * freq) * amp * t, y + len * t] as const;
  const d = Array.from({ length: N + 1 }, (_, i) => pt(i / N))
    .map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`)
    .join(" ");
  /* 葉の付きかたを1本ずつ変える。密なもの、まばらなもの、ほぼ裸のもの。
     密度を揃えるとビーズ暖簾に見える（2稿目でそうなった） */
  const dens = r(0.85, 1.9);
  const leaves = Math.max(2, Math.round((len / 13) * dens));
  return (
    <g>
      <path d={d} stroke={G[1]} strokeWidth={w} fill="none" strokeLinecap="round" opacity="0.9" />
      {Array.from({ length: leaves }, (_, i) => {
        const t = (i + 0.6) / leaves;
        const [px, py] = pt(t);
        const side = i % 2 ? 1 : -1;
        const sc = r(0.3, 0.92) * (1 - t * 0.28);
        const c = G[Math.min(6, 1 + Math.floor(r(0, 6)))];
        if (r() < 0.09) return null; // わずかに抜けを作る
        return (
          <path key={i} d={r() < 0.2 ? FROND : LEAF} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(side * r(20, 90) + 30).toFixed(0)}) scale(${sc.toFixed(2)})`} fill={c} />
        );
      })}
    </g>
  );
}

/** 打ち放しの面。板目・継ぎ目・光の線 */
function Board({ x, y, w, h, pitch = 22 }: { x: number; y: number; w: number; h: number; pitch?: number }) {
  return (
    <g>
      {Array.from({ length: Math.ceil(h / pitch) }, (_, i) => {
        const yy = y + i * pitch;
        return (
          <g key={i}>
            <line x1={x} y1={yy} x2={x + w} y2={yy} stroke={INK} strokeWidth="1.3" opacity="0.26" />
            <line x1={x} y1={yy + 1.5} x2={x + w} y2={yy + 1.5} stroke="#efeade" strokeWidth="0.9" opacity="0.3" />
          </g>
        );
      })}
    </g>
  );
}

export default function Plate() {
  const r = rand(20240611);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="エコ・ブルータリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-lp`}><rect x="0" y={TOP - 46} width={LX} height={BOT - TOP + 46} /></clipPath>
        <clipPath id={`${P}-rp`}><rect x={RX} y={TOP} width={600 - RX} height={BOT - TOP} /></clipPath>

        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#dcd7ca" />
          <stop offset="1" stopColor="#c2beb2" />
        </linearGradient>

        {/* 藻。植栽の真下は必ずこうなる。灰と緑を繋ぐ唯一の中間色 */}
        <linearGradient id={`${P}-algae`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f3b25" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#3f4d33" stopOpacity="0.5" />
          <stop offset="1" stopColor="#4a5c39" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${P}-drip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK} stopOpacity="0.3" />
          <stop offset="1" stopColor={INK} stopOpacity="0" />
        </linearGradient>
        {/* 奥のガラス。上に空を映し、下は暗がり */}
        <linearGradient id={`${P}-glass`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#4a5147" />
          <stop offset="0.55" stopColor="#282c23" />
          <stop offset="1" stopColor="#1a1d17" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2ddd0" stopOpacity="0.32" />
          <stop offset="0.4" stopColor="#e2ddd0" stopOpacity="0" />
        </linearGradient>
        {/* 壁柱の光。左上が明るく右下へ落ちる */}
        <linearGradient id={`${P}-pier`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="0.6" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor={INK} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />

        {/* ── 奥。ガラスと影 ─────────────────────────────── */}
        <rect x={LX} y={TOP} width={RX - LX} height={BOT - TOP} fill={`url(#${P}-glass)`} />
        <g stroke="#868c7d" strokeWidth="1.1" opacity="0.26">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={LX + 22 + i * 46} y1={TOP} x2={LX + 22 + i * 46} y2={BOT} />
          ))}
        </g>
        <polygon points={`${LX},${TOP} 330,${TOP} ${LX + 40},${BOT} ${LX},${BOT}`} fill="#c3c9b8" opacity="0.08" />

        {/* ── 屋上の森。塊の頭を緑で割る ────────────────────── */}
        <g>
          {[[196, 82], [318, 62], [452, 88]].map(([x, ty], i) => (
            <path key={i} d={`M${x} ${TOP - 40} C ${x + 4} ${ty + 56} ${x - 6} ${ty + 34} ${x + 1} ${ty}`} stroke="#4b463c" strokeWidth={r(3.5, 6)} fill="none" strokeLinecap="round" />
          ))}
          <Bush cx={196} cy={92} rx={70} ry={44} n={150} r={r} s={1.05} />
          <Bush cx={330} cy={54} rx={54} ry={34} n={120} r={r} s={0.9} />
          <Bush cx={468} cy={104} rx={92} ry={34} n={150} r={r} s={1.15} />
          <Bush cx={64} cy={126} rx={62} ry={22} n={72} r={r} s={0.75} />
          <Bush cx={568} cy={118} rx={44} ry={26} n={62} r={r} s={0.8} />
        </g>

        {/* ── 屋上スラブ。厚い。ここで塊の頭を作る ────────────── */}
        <rect x="0" y={TOP - 46} width="600" height="46" fill={CONC} />
        <rect x="0" y={TOP - 46} width="600" height="4" fill={CONC_LIT} />
        <Board x={0} y={TOP - 46} w={600} h={46} />
        <rect x={LX} y={TOP} width={RX - LX} height={SF} fill={SOFFIT} />
        <rect x={LX} y={TOP + SF} width={RX - LX} height="5" fill="#000" opacity="0.3" />

        {/* ── 左の壁柱。無開口。版面の素のコンクリートはここが担う ── */}
        <g clipPath={`url(#${P}-lp)`}>
          <rect x="0" y={TOP - 46} width={LX} height={BOT - TOP + 46} fill={CONC} />
          <Board x={0} y={TOP - 46} w={LX} h={BOT - TOP + 46} />
          {/* パネルの縦の合わせ目 */}
          <line x1="72" y1={TOP} x2="72" y2={BOT} stroke={INK} strokeWidth="1.1" opacity="0.14" />
          <line x1="73.4" y1={TOP} x2="73.4" y2={BOT} stroke="#efeade" strokeWidth="0.8" opacity="0.2" />
          {/* セパ穴と雨だれ */}
          {Array.from({ length: 7 }, (_, i) =>
            [34, 100].map((x, k) => {
              const y = TOP + 24 + i * 76;
              return (
                <g key={`${i}-${k}`}>
                  <circle cx={x} cy={y} r="4" fill={shift(CONC, 0.08)} />
                  <circle cx={x} cy={y} r="4" fill="none" stroke={INK} strokeWidth="0.9" opacity="0.4" />
                  <rect x={x - r(1.4, 3)} y={y + 3} width={r(3, 6)} height={r(16, 50)} fill={`url(#${P}-drip)`} />
                </g>
              );
            }),
          )}
          {/* 小さな四角い抜き。無開口の壁に1つだけ穴を開けると尺度が出る */}
          <rect x="24" y="372" width="52" height="52" fill="#191c16" />
          <rect x="70" y="372" width="6" height="52" fill={CONC_LIT} opacity="0.5" />
          <rect x="24" y="372" width="52" height="7" fill="#000" opacity="0.5" />
          <rect x="21" y="424" width="58" height="6" fill={CONC_LIT} />
          <rect x="30" y="430" width="16" height="66" fill={`url(#${P}-drip)`} />
          {/* 屋上から降りてくる藻 */}
          {[10, 46, 84, 116].map((x, i) => (
            <rect key={i} x={x} y={TOP + 2} width={r(16, 48)} height={r(90, 280)} fill={`url(#${P}-algae)`} opacity={r(0.6, 1)} />
          ))}
          <rect x="0" y={TOP - 46} width={LX} height={BOT - TOP + 46} fill={`url(#${P}-pier)`} />
        </g>
        <rect x={LX - 6} y={TOP} width="6" height={BOT - TOP} fill={INK} opacity="0.24" />

        {/* ── 右の壁柱。裁ち落とし ────────────────────────── */}
        <g clipPath={`url(#${P}-rp)`}>
          <rect x={RX} y={TOP} width={600 - RX} height={BOT - TOP} fill={CONC} />
          <Board x={RX} y={TOP} w={600 - RX} h={BOT - TOP} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = TOP + 40 + i * 88;
            return (
              <g key={i}>
                <circle cx={548} cy={y} r="4" fill={shift(CONC, 0.08)} />
                <circle cx={548} cy={y} r="4" fill="none" stroke={INK} strokeWidth="0.9" opacity="0.4" />
                <rect x="546" y={y + 3} width="4" height={r(16, 44)} fill={`url(#${P}-drip)`} />
              </g>
            );
          })}
          {[516, 560, 588].map((x, i) => (
            <rect key={i} x={x} y={TOP} width={r(18, 44)} height={r(110, 300)} fill={`url(#${P}-algae)`} opacity={r(0.6, 1)} />
          ))}
          <rect x={RX} y={TOP} width={600 - RX} height={BOT - TOP} fill={`url(#${P}-pier)`} />
        </g>
        <rect x={RX} y={TOP} width="6" height={BOT - TOP} fill="#efeade" opacity="0.3" />

        {/* ── 各階のプランター。厚い立ち上がりと厚い軒裏 ────────── */}
        {FLOORS.map((y, i) => (
          <g key={i}>
            <rect x={LX - 8} y={y - PF - 5} width={RX - LX + 16} height="6" fill="#4a4034" />
            <rect x={LX - 8} y={y - PF} width={RX - LX + 16} height={PF} fill={CONC} />
            <rect x={LX - 8} y={y - PF} width={RX - LX + 16} height="4" fill={CONC_LIT} />
            <Board x={LX - 8} y={y - PF} w={RX - LX + 16} h={PF} />
            {/* 軒裏。厚みはここで語る */}
            <rect x={LX - 8} y={y} width={RX - LX + 16} height={SF} fill={SOFFIT} />
            <rect x={LX - 8} y={y + SF} width={RX - LX + 16} height="5" fill="#000" opacity="0.32" />
            {/* 立ち上がりの天端は常に湿っている。苔の線 */}
            <rect x={LX - 8} y={y - PF} width={RX - LX + 16} height="7" fill="#3f4d33" opacity="0.5" />
            {/* 立ち上がりの明るい面を流れ落ちる藻。灰と緑はここで繋がる */}
            {Array.from({ length: 12 }, (_, k) => (
              <rect
                key={`a${k}`}
                x={LX + r(-10, RX - LX)}
                y={y - PF + 5}
                width={r(6, 26)}
                height={r(18, PF - 6)}
                fill={`url(#${P}-algae)`}
                opacity={r(0.5, 1)}
              />
            ))}
            {/* 水抜き穴と、そこから流れる藻 */}
            {[168, 246, 322, 400, 466].map((x, k) => (
              <g key={k}>
                <rect x={x} y={y - 12} width="14" height="6" fill="#000" opacity="0.5" />
                <rect x={x - r(4, 16)} y={y + SF + 3} width={r(22, 56)} height={r(50, 130)} fill={`url(#${P}-algae)`} opacity={r(0.6, 1)} />
              </g>
            ))}
          </g>
        ))}

        {/* ── 植栽。長い蔓 → 短い蔓 → 手前の茂み、の順に重ねる ──── */}
        {FLOORS.map((y, i) => (
          <g key={i}>
            {/* 房。3本だけ極端に長く垂らして、階の水平を縦に断ち切る */}
            {[0, 1, 2].map((k) => {
              const x = LX + 40 + k * 128 + r(-24, 24);
              return <Vine key={`l${k}`} x={x} y={y - PF + 10} len={r(150, 240)} amp={r(-30, 30)} freq={r(2.2, 4.2)} phase={r(0, 6.28)} w={r(1.8, 2.8)} r={r} />;
            })}
            {Array.from({ length: 12 }, (_, k) => {
              const x = LX + 12 + k * 32 + r(-12, 12);
              return <Vine key={k} x={x} y={y - PF + 8} len={r(22, 84)} amp={r(-16, 16)} freq={r(1.6, 3.4)} phase={r(0, 6.28)} w={r(1.1, 2)} r={r} />;
            })}
          </g>
        ))}
        {FLOORS.map((y, i) => (
          <g key={i}>
            {Array.from({ length: 5 }, (_, k) => (
              <Bush
                key={k}
                cx={LX + 24 + k * 92 + r(-18, 18)}
                cy={y - PF - 16 + r(-10, 8)}
                rx={r(40, 66)}
                ry={r(16, 28)}
                n={Math.round(r(48, 84))}
                r={r}
                s={r(0.7, 1)}
              />
            ))}
          </g>
        ))}

        {/* 左の壁柱を伝う1本。無開口の面に緑の傷を1本だけ入れる */}
        <Vine x={92} y={TOP + 4} len={330} amp={26} freq={5.6} phase={1.1} w={2.6} r={r} />
        <Bush cx={96} cy={TOP + 2} rx={30} ry={16} n={44} r={r} s={0.8} />

        {/* ── 地面。ピロティの暗がりと広場 ─────────────────── */}
        <rect x="0" y={BOT} width="600" height="22" fill={SOFFIT} />
        <rect x="0" y={BOT + 22} width="600" height="120" fill="#6d6a61" />
        <rect x="0" y={BOT + 22} width="600" height="12" fill="#000" opacity="0.3" />
        {Array.from({ length: 7 }, (_, i) => (
          <Bush key={i} cx={i < 4 ? r(0, 230) : r(390, 600)} cy={BOT + r(12, 22)} rx={r(26, 58)} ry={r(8, 14)} n={Math.round(r(22, 44))} r={r} s={0.6} />
        ))}
        <g stroke={INK} strokeWidth="1" opacity="0.18">
          {[748, 790].map((y, i) => <line key={i} x1="0" y1={y} x2="600" y2={y - 8} />)}
        </g>

        {/* ── 文字。地の帯に置く ───────────────────────────── */}
        <text x="30" y="784" fill="#e2ddd0" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="42" fontWeight="800" letterSpacing="-1.2">
          ECO BRUTALISM
        </text>
        <text x="32" y="746" fill="#c3c9b8" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="9" fontWeight="600" letterSpacing="3.2" opacity="0.85">
          CONCRETE + CANOPY · 2010s—
        </text>
        <g stroke="#e2ddd0" strokeWidth="0.9" opacity="0.4" fill="none">
          <path d="M452 748 L574 748 M452 748 L452 742" />
        </g>
        <text x="574" y="742" textAnchor="end" fill="#e2ddd0" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="7.5" fontWeight="600" letterSpacing="1.5" opacity="0.6">
          DRIP IRRIGATION Ø12
        </text>

        <rect width="600" height="420" fill={`url(#${P}-mist)`} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.18" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
