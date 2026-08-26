/**
 * ブルータリズム。
 *
 * béton brut ＝「打ち放しのコンクリート」。様式の核は形ではなく
 * 「素材をそのまま見せる」という態度なので、絵の説得力は
 * コンクリートの物理をどこまで描けるかで決まる。
 *
 * ■ 入れた物理（これが無いと、ただの灰色の箱になる）
 *   1. 型枠の跡。杉板を横に並べて打つので継ぎ目が水平に走り、
 *      板ごとに色が少し違い、木目まで転写される。
 *   2. セパ穴。型枠を締めたボルトの跡。規則正しい格子で並び、
 *      下へ雨だれの筋を引く。ここが一番「本物」に効く。
 *   3. 庇の落とす影。硬い輪郭で、庇の端から斜めに切れる。
 *   4. コーデュロイ仕上げ（縦リブを叩き割る）。ポール・ルドルフの
 *      イエール大の壁。横の板目と縦のリブを上下で対比させる。
 *
 * ■ 板目を建物に「巻きつける」
 *   同じ一段の板が、手前の面 → 右向きの返し → 引っ込んだ面 → 側面、と
 *   4つの面を横断していく。各面で消点に向かって高さがずれる。
 *   面ごとに独立した横縞を引くと、板を貼り合わせた紙細工に見える
 *   （初稿でそうなった）。同じ物理的な板を追いかけると急に建つ。
 *
 * ■ 初稿の失敗
 *   ・塊を版面の中に収めたら「机の上の模型」になった。左と下を裁ち落とし、
 *     空を右上の楔だけに切り詰めて、見上げる圧に変えた。
 *   ・セパ穴の雨だれを濃く均一に引いたら、壁に刺さったピンに見えた。
 *     濃度を半分にし、幅と長さを穴ごとに散らした。
 */
import { ATLAS, rand, shift } from "@/lib/plate";

const P = "bru";

const CONC = "#c1bdb4"; // 手前の面（陽）。一段上げる
const CONC_B = "#a6a39c"; // 引っ込んだ面
const CONC_LIT = "#dedad0"; // 陽の当たる小口。明暗の幅を広げないと灰一色になる
const SIDE = "#6a6760"; // 側面（陰）。一段落とす
const RETURN = "#3e3c37"; // 右向きの返し。逆光で最も暗い
const PLAZA = "#46433e";
const DARK = "#2e2c28";
const INK = "#141312";

/* ── 面の骨格。数値は手で決め、板目だけ消点へ寄せる ───────────── */
const HOR = 640; // 目の高さ
const AX0 = -30; // 手前の面。左は裁ち落とす
const AX1 = 304;
const AY0 = 60;
const AY1 = 706;
const BX0 = 352; // 返しの幅48
const BX1 = 452;
const KB = 0.055; // 返しのぶんだけ消点へ寄る係数
const KS = 0.14; // 側面のぶん
const SX = 564;

const yb = (y: number) => y + KB * (HOR - y); // 引っ込んだ面での同じ板の高さ
const ys = (y: number) => y + KS * (HOR - y); // 側面の奥端での高さ

const BY0 = yb(AY0);
const BY1 = yb(AY1);

const PITCH = 21; // 型枠の板幅。26では下見板張りに見えた
const BOARDS = Array.from({ length: Math.ceil((AY1 - AY0) / PITCH) + 1 }, (_, i) => AY0 + i * PITCH);

/* 開口の帯 */
const LEDGE_Y = 300;
const LEDGE_X1 = 236; // 端で止めて、影に斜めの切れ目を作る
const WIN_Y = 366;
const WIN_H = 92;
const WINS = [-6, 56, 118, 180];

/* セパ穴の格子 */
const TIE_X = [14, 96, 178, 260];
const TIE_Y = Array.from({ length: 8 }, (_, i) => AY0 + 12 + i * (PITCH * 4));

export default function Plate() {
  const r = rand(19670314);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ブルータリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-a`}><rect x={AX0} y={AY0} width={AX1 - AX0} height={AY1 - AY0} /></clipPath>
        <clipPath id={`${P}-b`}><rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} /></clipPath>
        <clipPath id={`${P}-ret`}>
          <polygon points={`${AX1},${AY0} ${BX0},${BY0} ${BX0},${BY1} ${AX1},${AY1}`} />
        </clipPath>
        <clipPath id={`${P}-side`}>
          <polygon points={`${BX1},${BY0} ${SX},${ys(BY0)} ${SX},${ys(BY1)} ${BX1},${BY1}`} />
        </clipPath>

        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#e4e1d9" />
          <stop offset="1" stopColor="#bab7af" />
        </linearGradient>

        {/* 雨だれ。上が濃く、下へ抜ける。濃度は控えめに */}
        <linearGradient id={`${P}-drip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={DARK} stopOpacity="0.26" />
          <stop offset="0.4" stopColor={DARK} stopOpacity="0.12" />
          <stop offset="1" stopColor={DARK} stopOpacity="0" />
        </linearGradient>

        {/* コーデュロイ仕上げ。縦リブ。左が光り、右に影の線 */}
        <pattern id={`${P}-cord`} width="8.5" height="8.5" patternUnits="userSpaceOnUse">
          <rect width="8.5" height="8.5" fill={CONC} />
          <rect width="4.2" height="8.5" fill={shift(CONC, 0.09)} />
          <rect x="5.4" width="1.8" height="8.5" fill={shift(CONC, -0.28)} />
        </pattern>

        {/* 面の光。左上から右下へ落とす。平らな塗りのままだと板に見える */}
        <linearGradient id={`${P}-lightA`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor={INK} stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={`${P}-sidefade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={INK} stopOpacity="0.02" />
          <stop offset="1" stopColor={INK} stopOpacity="0.38" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 空。右上の楔だけ ─────────────────────────────── */}
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />

        {/* ── 広場 ───────────────────────────────────────── */}
        <rect x="0" y="656" width="600" height="144" fill={PLAZA} />
        <g stroke={INK} strokeWidth="1" opacity="0.15">
          {[706, 744, 790].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="600" y2={y - 12} />
          ))}
          {[30, 175, 320, 465].map((x, i) => (
            <line key={`v${i}`} x1={x} y1="800" x2={x + 46} y2="656" />
          ))}
        </g>
        {/* 塊の落とす影。太陽は左上前。影は右奥へ倒れる */}
        <polygon points={`${BX1},${BY1} ${SX},${ys(BY1)} 600,712 600,768 506,776`} fill={INK} opacity="0.34" />

        {/* ── 側面（陰） ─────────────────────────────────── */}
        <g clipPath={`url(#${P}-side)`}>
          <rect x={BX1} y="0" width={SX - BX1} height="800" fill={SIDE} />
          {BOARDS.map((y, i) => {
            const y0 = yb(y);
            return <line key={i} x1={BX1} y1={y0} x2={SX} y2={ys(y0)} stroke={INK} strokeWidth="1.1" opacity="0.3" />;
          })}
          {/* 側面の開口帯。正面と同じ階高が、消点へ向かって細く畳まれていく。
              ここを空けたままにすると側面が「灰色の板」になった（2稿目） */}
          {(() => {
            const t0 = yb(332);
            const t1 = yb(478);
            const nx = BX1;
            const fx = SX;
            const at = (t: number, y: number) => [nx + t * (fx - nx), y + t * (ys(y) - y)] as const;
            return (
              <g>
                <polygon points={`${nx},${t0} ${fx},${ys(t0)} ${fx},${ys(t1)} ${nx},${t1}`} fill="#3b3934" />
                {[0.06, 0.3, 0.53, 0.74, 0.92].map((t, i) => {
                  const [x, ya] = at(t, t0 + 26);
                  const [, yb2] = at(t, t1 - 16);
                  const w = 15 * (1 - 0.45 * t);
                  return (
                    <g key={i}>
                      <rect x={x} y={ya} width={w} height={yb2 - ya} fill="#0d0d0c" />
                      <rect x={x + w - 1.8} y={ya} width="1.8" height={yb2 - ya} fill={CONC_LIT} opacity="0.4" />
                    </g>
                  );
                })}
                {/* 帯の上端の影 */}
                <polygon points={`${nx},${t0} ${fx},${ys(t0)} ${fx},${ys(t0) + 7} ${nx},${t0 + 9}`} fill="#000" opacity="0.45" />
                {/* 側面のセパ穴。奥ほど小さく、間隔も詰まる */}
                {[0.12, 0.4, 0.66, 0.88].map((t, i) =>
                  [AY0 + 52, AY0 + 200, AY0 + 494, AY0 + 578].map((y, j) => {
                    const [x, yy] = at(t, yb(y));
                    return <circle key={`${i}-${j}`} cx={x} cy={yy} r={3.6 * (1 - 0.4 * t)} fill={INK} opacity="0.3" />;
                  }),
                )}
              </g>
            );
          })()}
          {/* 側面の腰壁。縦リブが奥へ潰れる */}
          <polygon points={`${BX1},${yb(556)} ${SX},${ys(yb(556))} ${SX},${ys(yb(706))} ${BX1},${yb(706)}`} fill={INK} opacity="0.14" />
          {Array.from({ length: 26 }, (_, i) => {
            const t = i / 25;
            const x = BX1 + t * (SX - BX1);
            const y0 = yb(556) + t * (ys(yb(556)) - yb(556));
            const y1 = yb(706) + t * (ys(yb(706)) - yb(706));
            return <line key={i} x1={x} y1={y0} x2={x} y2={y1} stroke={INK} strokeWidth={1.2 - t * 0.5} opacity="0.22" />;
          })}
          <rect x={BX1} y="0" width={SX - BX1} height="800" fill={`url(#${P}-sidefade)`} />
        </g>

        {/* ── 右向きの返し。逆光で落ちる。ここが塊を2つに割る ──── */}
        <g clipPath={`url(#${P}-ret)`}>
          <rect x={AX1} y="0" width={BX0 - AX1} height="800" fill={RETURN} />
          {BOARDS.map((y, i) => (
            <line key={i} x1={AX1} y1={y} x2={BX0} y2={yb(y)} stroke="#000" strokeWidth="1" opacity="0.35" />
          ))}
          <rect x={AX1} y="0" width="4" height="800" fill="#000" opacity="0.35" />
        </g>

        {/* ── 引っ込んだ面 B。階段室。細長い縦スリット1本だけ ──── */}
        <g clipPath={`url(#${P}-b)`}>
          <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} fill={CONC_B} />
          {BOARDS.map((y, i) => {
            const y0 = yb(y);
            return (
              <g key={i}>
                <line x1={BX0} y1={y0} x2={BX1} y2={y0} stroke={INK} strokeWidth="1.3" opacity="0.28" />
                <line x1={BX0} y1={y0 + 1.5} x2={BX1} y2={y0 + 1.5} stroke="#e8e5dd" strokeWidth="0.9" opacity="0.24" />
              </g>
            );
          })}
          <rect x={BX0} y={yb(556)} width={BX1 - BX0} height={BY1 - yb(556)} fill={`url(#${P}-cord)`} opacity="0.85" />
          {/* 階段室のスリット */}
          <rect x="390" y="150" width="22" height="384" fill={INK} />
          <rect x="408" y="150" width="4" height="384" fill={CONC_LIT} opacity="0.5" />
          <rect x="390" y="150" width="22" height="7" fill="#000" opacity="0.5" />
          {/* 段の踊り場。スリットの中に横棒 */}
          {[196, 262, 328, 394, 460].map((y, i) => (
            <rect key={i} x="390" y={y} width="22" height="5" fill={SIDE} opacity="0.7" />
          ))}
          {/* Bのセパ穴 */}
          {TIE_Y.map((y, j) => {
            const y0 = yb(y);
            if (y0 > 144 && y0 < 548) return null;
            return (
              <g key={j}>
                <circle cx="370" cy={y0} r="4" fill={shift(CONC_B, 0.07)} />
                <circle cx="370" cy={y0} r="4" fill="none" stroke={INK} strokeWidth="0.9" opacity="0.4" />
                <rect x="367.6" y={y0 + 2.4} width="3" height={r(16, 46)} fill={`url(#${P}-drip)`} />
              </g>
            );
          })}
          <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} fill={INK} opacity="0.07" />
        </g>

        {/* ── 手前の面 A ───────────────────────────────────── */}
        <g clipPath={`url(#${P}-a)`}>
          <rect x={AX0} y={AY0} width={AX1 - AX0} height={AY1 - AY0} fill={CONC} />

          {/* 型枠の板。1枚ずつ色が違い、木目が転写される */}
          {BOARDS.map((y, i) => {
            const tone = shift(CONC, r(-0.055, 0.055));
            return (
              <g key={i}>
                <rect x={AX0} y={y} width={AX1 - AX0} height={PITCH} fill={tone} />
                {[0.32, 0.66].map((f, k) => {
                  const gy = y + PITCH * f;
                  const a = r(-2, 2);
                  const b = r(-2, 2);
                  return (
                    <path
                      key={k}
                      d={`M${AX0} ${gy} C ${AX0 + 110} ${gy + a} ${AX1 - 110} ${gy + b} ${AX1} ${gy + a * 0.4}`}
                      stroke={DARK}
                      strokeWidth={r(0.5, 1.1)}
                      opacity={r(0.05, 0.13)}
                      fill="none"
                    />
                  );
                })}
                {/* 継ぎ目。暗い線のすぐ下に光の線。この2本で板が立ち上がる */}
                <line x1={AX0} y1={y} x2={AX1} y2={y} stroke={INK} strokeWidth="1.5" opacity="0.32" />
                <line x1={AX0} y1={y + 1.6} x2={AX1} y2={y + 1.6} stroke="#e8e5dd" strokeWidth="1" opacity="0.3" />
              </g>
            );
          })}

          {/* 型枠パネルの縦の合わせ目 */}
          {[58, 170, 282].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={AY0} x2={x} y2={AY1} stroke={INK} strokeWidth="1.1" opacity="0.15" />
              <line x1={x + 1.4} y1={AY0} x2={x + 1.4} y2={AY1} stroke="#e8e5dd" strokeWidth="0.8" opacity="0.18" />
            </g>
          ))}

          {/* ── コーデュロイ仕上げの腰壁 ─────────────────── */}
          <rect x={AX0} y="556" width={AX1 - AX0} height={AY1 - 556} fill={`url(#${P}-cord)`} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect
              key={i}
              x={AX0 + r(0, AX1 - AX0)}
              y={558 + r(0, 142)}
              width={r(2, 6)}
              height={r(1.4, 4)}
              fill={DARK}
              opacity={r(0.12, 0.3)}
            />
          ))}
          <rect x={AX0} y="550" width={AX1 - AX0} height="8" fill={CONC_LIT} />
          <rect x={AX0} y="558" width={AX1 - AX0} height="5" fill={INK} opacity="0.44" />

          {/* ── 開口の帯。ひとつ奥へ引っ込む ─────────────── */}
          <rect x={AX0} y="332" width={AX1 - AX0} height="146" fill={shift(CONC, -0.13)} />
          {/* 引っ込みの上端。見込み壁が下を向くので必ず影になる */}
          <rect x={AX0} y="332" width={AX1 - AX0} height="9" fill="#000" opacity="0.4" />
          {/* 庇の落とす影。右端が斜めに切れる。この斜めが庇の出寸法を語る */}
          <polygon points={`${AX0},345 ${LEDGE_X1},345 ${LEDGE_X1 + 34},380 ${AX0},380`} fill={INK} opacity="0.4" />

          {WINS.map((x, i) => (
            <g key={i}>
              <rect x={x} y={WIN_Y} width="44" height={WIN_H} fill="#0d0d0c" />
              {/* 右の見込み壁だけ光が当たる（太陽が左から差す） */}
              <rect x={x + 39} y={WIN_Y} width="5" height={WIN_H} fill={CONC_LIT} opacity="0.55" />
              <rect x={x} y={WIN_Y} width="44" height="8" fill="#000" opacity="0.5" />
              {/* ガラスの弱い照り返し。上ほど空を映す */}
              <rect x={x + 3} y={WIN_Y + 8} width="38" height={WIN_H - 12} fill="#8e9aa0" opacity="0.16" />
              <rect x={x + 3} y={WIN_Y + 8} width="38" height="26" fill="#b6c0c4" opacity="0.14" />
              {/* 窓台と、そこから落ちる雨だれ */}
              <rect x={x - 3} y={WIN_Y + WIN_H} width="50" height="6" fill={CONC_LIT} />
              <rect x={x - 3} y={WIN_Y + WIN_H + 6} width="50" height="3" fill={INK} opacity="0.42" />
              <rect x={x + r(0, 30)} y={WIN_Y + WIN_H + 8} width={r(5, 16)} height={r(24, 74)} fill={`url(#${P}-drip)`} />
            </g>
          ))}

          {/* ── 庇。せり出した梁。面が光り、下端が暗い ────── */}
          <rect x={AX0} y={LEDGE_Y} width={LEDGE_X1 - AX0} height="32" fill={CONC_LIT} />
          <rect x={AX0} y={LEDGE_Y} width={LEDGE_X1 - AX0} height="3" fill="#f2efe7" opacity="0.6" />
          <rect x={AX0} y={LEDGE_Y + 32} width={LEDGE_X1 - AX0} height="13" fill={DARK} />
          {/* 庇の小口。右を向くので逆光で沈む */}
          <rect x={LEDGE_X1} y={LEDGE_Y} width="7" height="45" fill={RETURN} />
          <rect x={LEDGE_X1 + 7} y={LEDGE_Y + 32} width="1.5" height="13" fill="#000" opacity="0.3" />
          {/* 庇の下端から落ちる雨だれ。ここが一番よごれる */}
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={AX0 + 10 + i * 30 + r(-8, 8)}
              y="345"
              width={r(6, 24)}
              height={r(12, 40)}
              fill={`url(#${P}-drip)`}
              opacity={r(0.5, 1)}
            />
          ))}

          {/* ── セパ穴。格子で並び、下へ薄い筋を引く ───────── */}
          {TIE_Y.map((y, j) =>
            TIE_X.map((x, i) => {
              if (y > 324 && y < 566) return null;
              return (
                <g key={`${i}-${j}`}>
                  {/* 穴は黒い鋲ではない。モルタルで埋めた浅い窪み。
                      左上に内側の影、右下に受けた光。3稿目でここを直した */}
                  <circle cx={x} cy={y} r="4.2" fill={shift(CONC, 0.07)} />
                  <path d={`M${x - 4.2} ${y} A 4.2 4.2 0 0 1 ${x} ${y - 4.2} L ${x} ${y} Z`} fill={INK} opacity="0.3" />
                  <path d={`M${x + 4.2} ${y} A 4.2 4.2 0 0 1 ${x} ${y + 4.2} L ${x} ${y} Z`} fill="#f0ede5" opacity="0.3" />
                  <circle cx={x} cy={y} r="4.2" fill="none" stroke={INK} strokeWidth="0.9" opacity="0.42" />
                  <rect x={x - r(1.4, 3.4)} y={y + 3} width={r(3, 7)} height={r(14, 52)} fill={`url(#${P}-drip)`} opacity={r(0.5, 1)} />
                </g>
              );
            }),
          )}

          {/* 樋の吐き口と、そこから伸びる長い汚れ */}
          <rect x="252" y="480" width="30" height="12" fill={DARK} />
          <rect x="254" y="483" width="26" height="6" fill="#0d0d0c" />
          <rect x="256" y="492" width="22" height="62" fill={`url(#${P}-drip)`} />

          {/* 打ち込みの階数表示。凹ませた文字。影を先に、面を後に */}
          <g fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="88" fontWeight="700" letterSpacing="-5">
            <text x="26" y="252" fill={INK} opacity="0.34">07</text>
            <text x="23" y="249" fill={shift(CONC, 0.2)} opacity="0.6">07</text>
          </g>

          {/* 骨材のあばた。近くで見ると出てくる気泡 */}
          {Array.from({ length: 160 }, (_, i) => (
            <circle
              key={i}
              cx={AX0 + r(0, AX1 - AX0)}
              cy={AY0 + r(0, AY1 - AY0)}
              r={r(0.5, 1.9)}
              fill={INK}
              opacity={r(0.08, 0.24)}
            />
          ))}

          <rect x={AX0} y={AY0} width={AX1 - AX0} height={AY1 - AY0} fill={`url(#${P}-lightA)`} />
        </g>

        {/* 角の稜線。ここを1本入れると面が別々の板に見えなくなる */}
        <line x1={AX1} y1={AY0} x2={AX1} y2={AY1} stroke="#efece4" strokeWidth="1.8" opacity="0.55" />
        <line x1={BX0} y1={BY0} x2={BX0} y2={BY1} stroke="#efece4" strokeWidth="1.4" opacity="0.35" />
        <line x1={BX1} y1={BY0} x2={BX1} y2={BY1} stroke="#efece4" strokeWidth="1.5" opacity="0.45" />

        {/* 足元の接地影 */}
        <rect x={AX0} y={AY1 - 8} width={AX1 - AX0} height="8" fill={INK} opacity="0.36" />
        <rect x={AX0} y={AY1} width={AX1 - AX0 + 30} height="11" fill={INK} opacity="0.22" />

        {/* ── 尺度としての人影。22倍の身長差で塊の大きさが決まる ─── */}
        {[[468, 742, 30], [498, 748, 32], [536, 740, 29]].map(([x, y, h], i) => (
          <g key={i}>
            <ellipse cx={x + 11} cy={y} rx="14" ry="3" fill={INK} opacity="0.3" />
            <path
              d={`M${x - 3} ${y} L${x - 2.6} ${y - h * 0.44} L${x - 4} ${y - h * 0.76} L${x + 4} ${y - h * 0.76} L${x + 2.6} ${y - h * 0.44} L${x + 3} ${y} Z`}
              fill={INK}
              opacity="0.88"
            />
            <circle cx={x} cy={y - h * 0.86} r={h * 0.1} fill={INK} opacity="0.88" />
          </g>
        ))}

        {/* ── 文字。広場の帯に置く。塊とは重ねない ────────────── */}
        <text
          x="28" y="784"
          fill="#dedbd3"
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="54" fontWeight="800" letterSpacing="-2"
        >
          BÉTON BRUT
        </text>
        <text
          x="30" y="726"
          fill="#cfccc4"
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="9.5" fontWeight="600" letterSpacing="3.4"
          opacity="0.75"
        >
          IN-SITU · BOARD-MARKED · NO FINISH
        </text>

        {/* 空の隅。図面の引き出し線を1本だけ */}
        <g stroke={INK} strokeWidth="0.9" opacity="0.4" fill="none">
          <path d="M572 250 L594 250 M572 250 L572 256" />
        </g>
        <text
          x="594" y="244" textAnchor="end"
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="7.5" fontWeight="600" letterSpacing="1.4" opacity="0.5"
        >
          Ø18 TIE
        </text>
        <text
          x="572" y="34" textAnchor="end"
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="9.5" fontWeight="600" letterSpacing="3.2" opacity="0.55"
        >
          BRUTALISM — 1950s—
        </text>

        {/* 紙。粗い目で、骨材と紙の粒を重ねる */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
