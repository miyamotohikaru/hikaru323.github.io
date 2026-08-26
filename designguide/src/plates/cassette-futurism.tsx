/**
 * カセット・フューチャリズム。
 *
 * 1970〜80年代のSF美術が思い描いた未来。ベージュの成形樹脂の筐体に、
 * ブラウン管と、押せば戻ってくる物理スイッチ。**画面の中ではなく、
 * 触れる機械そのものを描く**。だから一枚まるごと「操作卓の正面図」にした。
 *
 * ■ この絵の骨
 *   1. 立体は**面取り（bevel）で作る**。落ち込むもの（画面・通気口・溝）は
 *      上と左に暗い線、下と右に明るい線。出っ張るもの（スイッチ・銘板）は逆。
 *      これを全部の部品に一貫させると、ただの矩形の集まりが機械に見える。
 *   2. 蛍光体は**琥珀色**にした。この時代の端末といえば緑という言い分もあるが、
 *      5色に緑は無い。琥珀（#e0a33e）の端末は VT シリーズなどで実在するので、
 *      様式としても嘘にならない。ここは色の約束を優先した。
 *   3. 画面には**点線の図**を必ず入れる。当時の計算機が引けた線は点と直線だけ。
 *      軌道の楕円も、点を打って描く。
 *   4. 目盛り・小さな刻印・ねじ。近くで見て持つのは全部この種の細部。
 *
 * ■ 失敗して直したところ
 *   初稿は画面を大きく取りすぎて「モニタの絵」になった。
 *   画面を上半分で止め、下半分をスイッチ・ダイヤル・通気口で埋めたら、
 *   ようやく「筐体」になった。カセット・フューチャリズムは画面ではなく筐体の様式。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "cf";
const CASE = "#d8d2c2";
const CASE_HI = "#e8e3d4";
const CASE_LO = "#b3ac9b";
const SLATE = "#3a3f45";
const RUST = "#c8552b";
const AMBER = "#e0a33e";
const NIGHT = "#1f2327";

/** 落ち込んだ縁。上と左が暗く、下と右が明るい */
function Sunk({ x, y, w, h, r = 3 }: { x: number; y: number; w: number; h: number; r?: number }) {
  return (
    <g fill="none">
      <path d={`M ${x - 2} ${y + h + 2} L ${x - 2} ${y - 2} L ${x + w + 2} ${y - 2}`}
            stroke={CASE_LO} strokeWidth="2.6" />
      <path d={`M ${x - 2} ${y + h + 2} L ${x + w + 2} ${y + h + 2} L ${x + w + 2} ${y - 2}`}
            stroke={CASE_HI} strokeWidth="2.6" />
      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx={r} stroke="#00000022" strokeWidth="1" />
    </g>
  );
}

/** 出っ張った縁。落ち込みの逆 */
function Raised({ x, y, w, h, r = 2 }: { x: number; y: number; w: number; h: number; r?: number }) {
  return (
    <g fill="none">
      <path d={`M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y}`} stroke={CASE_HI} strokeWidth="2" />
      <path d={`M ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y}`} stroke="#8f8879" strokeWidth="2" />
      <rect x={x} y={y} width={w} height={h} rx={r} stroke="#00000018" strokeWidth="0.8" />
    </g>
  );
}

/** 十字のねじ */
const Screw = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r="7" fill="#bdb6a4" />
    <circle cx={x} cy={y} r="7" fill="none" stroke="#8f8879" strokeWidth="1" />
    <circle cx={x} cy={y} r="5" fill="#cdc6b4" />
    <path d={`M ${x - 3.4} ${y} h 6.8 M ${x} ${y - 3.4} v 6.8`} stroke="#6f6a5e" strokeWidth="1.5" />
  </g>
);

const SCR = { x: 62, y: 78, w: 476, h: 300 }; // 画面

export default function Plate() {
  const r = rand(4747);

  const LINES = [
    "SYS-7  CORE MONITOR        REV 2.4",
    "> MOUNT TAPE 03 ........... OK",
    "> SPIN UP   4800 RPM",
    "> CHECKSUM  0X8F2A  VERIFIED",
    "> ATMOS 0.98 BAR   TEMP 21.4C",
    "> ORBIT ELLIPTIC   E = 0.213",
    "> NEXT WINDOW  T-00:14:22",
  ];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="カセット・フューチャリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-screen`}>
          <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx="20" />
        </clipPath>

        {/* 成形樹脂。上が明るく、下へ落ちる */}
        <linearGradient id={`${P}-case`} x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#e2ddce" />
          <stop offset="0.55" stopColor={CASE} />
          <stop offset="1" stopColor="#c6bfae" />
        </linearGradient>
        {/* 管面。中央が明るく、隅が落ちる */}
        <radialGradient id={`${P}-tube`} cx="0.5" cy="0.44" r="0.72">
          <stop offset="0" stopColor="#2b3138" />
          <stop offset="0.6" stopColor="#191e23" />
          <stop offset="1" stopColor="#0d1013" />
        </radialGradient>
        {/* 蛍光体の残光 */}
        <radialGradient id={`${P}-glow`} cx="0.34" cy="0.42" r="0.6">
          <stop offset="0" stopColor={AMBER} stopOpacity="0.18" />
          <stop offset="1" stopColor={AMBER} stopOpacity="0" />
        </radialGradient>
        {/* ガラスの映り込み */}
        <linearGradient id={`${P}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 筐体 ─────────────────────────────────────────── */}
        <rect width="600" height="800" fill={`url(#${P}-case)`} />
        <rect x="14" y="14" width="572" height="772" rx="12" fill="none" stroke={CASE_HI} strokeWidth="2.4" />
        <rect x="17" y="17" width="566" height="766" rx="11" fill="none" stroke="#a8a190" strokeWidth="1.2" />
        <Screw x={34} y={34} /><Screw x={566} y={34} />
        <Screw x={34} y={766} /><Screw x={566} y={766} />

        {/* ── ブラウン管 ─────────────────────────────────────── */}
        <rect x={SCR.x - 14} y={SCR.y - 14} width={SCR.w + 28} height={SCR.h + 28} rx="26" fill="#c9c2b1" />
        <Sunk x={SCR.x} y={SCR.y} w={SCR.w} h={SCR.h} r={20} />
        <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx="20" fill={`url(#${P}-tube)`} />
        <g clipPath={`url(#${P}-screen)`}>
          <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill={`url(#${P}-glow)`} />

          {/* 文字。等幅・琥珀。行末のカーソルだけ塗りつぶす */}
          <g fontFamily="'Courier New', ui-monospace, monospace" fontSize="12.5" fill={AMBER}>
            {LINES.map((t, i) => (
              <text key={i} x={SCR.x + 24} y={SCR.y + 42 + i * 22} opacity={i === 0 ? 1 : 0.88}
                    letterSpacing="0.4">{t}</text>
            ))}
            <text x={SCR.x + 24} y={SCR.y + 42 + 7 * 22} opacity="0.9">&gt;</text>
          </g>
          <rect x={SCR.x + 38} y={SCR.y + 42 + 7 * 22 - 10} width="9" height="13" fill={AMBER} opacity="0.9" />
          {/* 1行目の下に罫。当時の端末はここで見出しを切る */}
          <rect x={SCR.x + 24} y={SCR.y + 50} width="300" height="1.2" fill={AMBER} opacity="0.5" />

          {/* 点線の図。軌道。当時の計算機が引けたのは点と直線だけ */}
          <g transform={`translate(${SCR.x + 372} ${SCR.y + 148})`}>
            <ellipse rx="86" ry="52" fill="none" stroke={AMBER} strokeWidth="1.2"
                     strokeDasharray="2 4" opacity="0.75" />
            <ellipse rx="58" ry="34" fill="none" stroke={AMBER} strokeWidth="1.1"
                     strokeDasharray="2 4" opacity="0.55" transform="rotate(-14)" />
            <ellipse rx="30" ry="17" fill="none" stroke={AMBER} strokeWidth="1"
                     strokeDasharray="2 4" opacity="0.4" transform="rotate(-28)" />
            <circle r="4" fill={AMBER} />
            {/* 現在位置。十字と括弧で挟む */}
            <g transform="translate(72 -22)">
              <circle r="3.4" fill={RUST} />
              <path d="M-12 0 h7 M5 0 h7 M0 -12 v7 M0 5 v7" stroke={AMBER} strokeWidth="1.2" />
              <path d="M-13 -9 v-4 h4 M13 -9 v-4 h-4 M-13 9 v4 h4 M13 9 v4 h-4"
                    fill="none" stroke={AMBER} strokeWidth="1" opacity="0.8" />
            </g>
            {/* 目盛り */}
            <g stroke={AMBER} strokeWidth="1" opacity="0.45">
              {Array.from({ length: 13 }, (_, i) => (
                <line key={i} x1={-96 + i * 16} y1="74" x2={-96 + i * 16} y2={i % 4 === 0 ? 66 : 70} />
              ))}
              <line x1="-96" y1="74" x2="96" y2="74" />
            </g>
            <text x="-96" y="-64" fill={AMBER} opacity="0.7"
                  fontFamily="'Courier New', ui-monospace, monospace" fontSize="10"
                  letterSpacing="1.4">TRAJ-4</text>
          </g>

          {/* 走査線とガラスの映り込み */}
          <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill={`url(#${ATLAS.scanlines})`} opacity="0.3" />
          <path d={`M ${SCR.x} ${SCR.y} L ${SCR.x + 240} ${SCR.y} L ${SCR.x} ${SCR.y + 220} Z`}
                fill={`url(#${P}-sheen)`} />
        </g>

        {/* 銘板。出っ張らせる */}
        <rect x="62" y="398" width="196" height="26" rx="3" fill="#cdc6b4" />
        <Raised x={62} y={398} w={196} h={26} />
        <text x="74" y="416" fill={SLATE} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="12" fontWeight="700" letterSpacing="2.4">SYS-7 / MOD 2</text>
        <text x="272" y="416" fill="#8f8879" fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="10" letterSpacing="1.6">SER. 0041-B</text>

        {/* 溝。上半分と下半分をここで切る */}
        <rect x="40" y="438" width="520" height="2" fill="#a8a190" />
        <rect x="40" y="440" width="520" height="2" fill={CASE_HI} />

        {/* ── 物理スイッチ。4個。1つだけ倒す ───────────────── */}
        {["PWR", "TAPE", "AUX", "LOCK"].map((t, i) => {
          const x = 52 + i * 62;
          const on = i === 1;
          return (
            <g key={t}>
              <rect x={x} y={458} width="50" height="48" rx="4" fill="#b6af9e" />
              <Sunk x={x} y={458} w={50} h={48} r={4} />
              {/* 倒したほうが沈み、反対側が持ち上がる */}
              <rect x={x + 4} y={on ? 462 : 484} width="42" height="20" rx="3" fill="#cfc8b6" />
              <rect x={x + 4} y={on ? 484 : 462} width="42" height="20" rx="3" fill={on ? SLATE : "#9a9384"} />
              <rect x={x + 4} y={on ? 462 : 484} width="42" height="3" rx="1.5" fill={CASE_HI} />
              {on && <rect x={x + 18} y={489} width="14" height="10" rx="2" fill={RUST} />}
              <text x={x + 25} y={520} textAnchor="middle" fill={SLATE}
                    fontFamily="'Courier New', ui-monospace, monospace" fontSize="9"
                    letterSpacing="1.2" opacity="0.85">{t}</text>
            </g>
          );
        })}

        {/* ── 表示灯。6個。点くのは2つだけ ─────────────────── */}
        <rect x="52" y="534" width="248" height="34" rx="4" fill="#cbc4b2" />
        <Sunk x={52} y={534} w={248} h={34} r={4} />
        {Array.from({ length: 6 }, (_, i) => {
          const cx = 74 + i * 42;
          const lit = i === 0 ? AMBER : i === 3 ? RUST : null;
          return (
            <g key={i}>
              <circle cx={cx} cy={551} r="10" fill="#8f8879" />
              <circle cx={cx} cy={551} r="8" fill={lit ?? "#5c5a54"} />
              {lit && <circle cx={cx} cy={551} r="15" fill={lit} opacity="0.22" />}
              <circle cx={cx - 2.6} cy={548} r="2.4" fill="#ffffff" opacity={lit ? 0.65 : 0.2} />
            </g>
          );
        })}

        {/* ── 滑り子。溝と刻み目のつまみ ───────────────────── */}
        <rect x="52" y="588" width="248" height="14" rx="7" fill="#a8a190" />
        <rect x="54" y="590" width="244" height="9" rx="4.5" fill="#8f8879" />
        <g stroke="#9a9384" strokeWidth="1" opacity="0.9">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={58 + i * 23.6} y1="608" x2={58 + i * 23.6} y2={i % 5 === 0 ? 616 : 612} />
          ))}
        </g>
        <g transform="translate(186 595)">
          <rect x="-15" y="-19" width="30" height="38" rx="4" fill="#cfc8b6" />
          <Raised x={-15} y={-19} w={30} h={38} r={4} />
          <g stroke="#8f8879" strokeWidth="1.4">
            {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-9 + i * 4.5} y1="-13" x2={-9 + i * 4.5} y2="13" />)}
          </g>
          <rect x="-15" y="-1.5" width="30" height="3" fill={RUST} />
        </g>

        {/* ── 回転ダイヤル。目盛りは0〜9 ───────────────────── */}
        <g transform="translate(388 528)">
          <circle r="72" fill="#cbc4b2" />
          <circle r="72" fill="none" stroke="#a8a190" strokeWidth="2" />
          <g stroke={SLATE} strokeWidth="1.4" opacity="0.75">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (-130 + i * 28.8) * Math.PI / 180;
              return (
                <line key={i} x1={Math.cos(a) * 62} y1={Math.sin(a) * 62}
                      x2={Math.cos(a) * 70} y2={Math.sin(a) * 70} />
              );
            })}
          </g>
          <g fill={SLATE} fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" opacity="0.8">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (-130 + i * 28.8) * Math.PI / 180;
              return (
                <text key={i} x={Math.cos(a) * 53} y={Math.sin(a) * 53 + 3.2} textAnchor="middle">{i}</text>
              );
            })}
          </g>
          <circle r="42" fill="#b6af9e" />
          <circle r="40" fill="#d4cdbb" />
          <circle r="40" fill="none" stroke="#8f8879" strokeWidth="1.2" />
          {/* 刻み目 */}
          <g stroke="#a8a190" strokeWidth="2">
            {Array.from({ length: 28 }, (_, i) => {
              const a = (i / 28) * Math.PI * 2;
              return (
                <line key={i} x1={Math.cos(a) * 33} y1={Math.sin(a) * 33}
                      x2={Math.cos(a) * 40} y2={Math.sin(a) * 40} />
              );
            })}
          </g>
          <path d="M -3.5 0 L 3.5 0 L 1.6 -34 L -1.6 -34 Z" fill={RUST}
                transform="rotate(43)" />
          <circle r="7" fill={SLATE} />
        </g>
        <text x="388" y="616" textAnchor="middle" fill={SLATE}
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="9.5"
              letterSpacing="2" opacity="0.85">GAIN</text>

        {/* ── 数字窓 ─────────────────────────────────────────── */}
        <rect x="472" y="458" width="76" height="46" rx="3" fill={NIGHT} />
        <Sunk x={472} y={458} w={76} h={46} r={3} />
        <text x="510" y="492" textAnchor="middle" fill={AMBER}
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="30"
              fontWeight="700" letterSpacing="2">07</text>
        <text x="510" y="518" textAnchor="middle" fill={SLATE}
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="9"
              letterSpacing="1.6" opacity="0.8">CH</text>

        {/* ── 通気口 ─────────────────────────────────────────── */}
        <rect x="452" y="560" width="96" height="98" rx="4" fill={CASE} />
        {Array.from({ length: 9 }, (_, i) => {
          const y = 568 + i * 10;
          return (
            <g key={i}>
              <rect x="460" y={y} width="80" height="5" rx="2.5" fill="#6f6a5e" />
              <rect x="460" y={y + 4} width="80" height="1.6" rx="0.8" fill={CASE_HI} opacity="0.8" />
            </g>
          );
        })}
        <Sunk x={452} y={560} w={96} h={98} r={4} />

        {/* ── カセットの差し込み口。様式の名の由来をここに置く ─── */}
        <rect x="52" y="618" width="248" height="46" rx="4" fill="#cbc4b2" />
        <Sunk x={52} y={618} w={248} h={46} r={4} />
        <rect x="62" y="628" width="180" height="26" rx="2" fill={NIGHT} />
        <rect x="62" y="628" width="180" height="4" fill="#000000" opacity="0.5" />
        <rect x="66" y="650" width="172" height="2" fill={AMBER} opacity="0.35" />
        <text x="152" y="646" textAnchor="middle" fill={AMBER}
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="10"
              letterSpacing="2.4" opacity="0.8">TAPE 03</text>
        {/* 取り出しの押しボタン */}
        <rect x="252" y="628" width="38" height="26" rx="3" fill="#cfc8b6" />
        <Raised x={252} y={628} w={38} h={26} r={3} />
        <path d="M262 646 h18 M271 634 l8 8 h-16 Z" fill={SLATE} stroke={SLATE} strokeWidth="1.6"
              strokeLinejoin="round" />

        {/* ── 下の銘板。題字はここ ───────────────────────────── */}
        <rect x="40" y="668" width="520" height="76" rx="5" fill={SLATE} />
        <Sunk x={40} y={668} w={520} h={76} r={5} />
        <rect x="46" y="674" width="508" height="64" rx="3" fill="none" stroke={AMBER}
              strokeWidth="0.8" opacity="0.4" />
        <text x="300" y="706" textAnchor="middle" fill={AMBER}
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="21"
              fontWeight="700" letterSpacing="6.5">CASSETTE FUTURISM</text>
        <text x="300" y="728" textAnchor="middle" fill="#9aa0a6"
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="9"
              letterSpacing="3.6">AMBER PHOSPHOR · 80×24 · TAPE-FED</text>

        {/* 型番の刻印。近くで見たときのおまけ */}
        <text x="54" y="770" fill="#8f8879" fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="8.5" letterSpacing="1.4">MFG 1979  ·  100-120V 50/60Hz  ·  42W</text>
        <text x="546" y="770" textAnchor="end" fill="#8f8879"
              fontFamily="'Courier New', ui-monospace, monospace" fontSize="8.5"
              letterSpacing="1.4">MADE ON EARTH</text>

        {/* 成形樹脂の梨地。細かい粒でないと樹脂に見えない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.17"
              style={{ mixBlendMode: "multiply" }} />
        {/* 擦り傷。初稿は始点と終点を別々に振ったので、版面を端から端まで
            横切る「ひび」になった。長さを 40 以下に抑える */}
        <g stroke="#8f8879" strokeWidth="0.7" opacity="0.24">
          {Array.from({ length: 10 }, (_, i) => {
            const x = r(60, 540);
            const y = r(450, 660);
            const a = r(0, Math.PI);
            const len = r(9, 34);
            return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * len} y2={y + Math.sin(a) * len} />;
          })}
        </g>
      </g>
    </svg>
  );
}
