/**
 * リミナルスペース。
 *
 * ■ サイバーパンクも一点透視だが、あちらと分ける約束
 *   あちらは屋外・光源は看板・消失点は右へずらす。
 *   こちらは屋内・光源は天井の蛍光灯だけ・消失点は画面のど真ん中。
 *   左右対称であることが、この様式の不安の正体だと考えた。
 *   人の視点は普通どちらかに寄る。寄っていない絵は「誰も居ない」。
 *
 * ■ 不安をどう出すか
 *   1. 何も起きていない。人も物もほとんど無い。
 *      椅子ひとつ置くと物語が始まってしまうので、置かない。
 *   2. 廊下が終わらない。奥の壁に扉を1枚だけ置き、少しだけ開ける。
 *      向こうは真っ暗。開いていることに理由が無い。
 *   3. 蛍光灯を1本だけ消す。全部点いていると、ただの綺麗な廊下になる。
 *   4. 壁を黄ばませる。白い壁は清潔（フルーティガー・エアロ）になってしまう。
 *
 * ■ 遠近は t=k/(k+1.6) で刻む
 *   等間隔にすると床が坂に見える。1/z で詰めると、奥に吸い込まれる。
 */
import { ATLAS, rand, lerp } from "@/lib/plate";

const P = "lm";

const CREAM = "#e8e2c8";
const TAN = "#c9c08a";
const OLIVE = "#8a8560";
const PALE = "#f2eede";
const DARK = "#4a4632";

/* 手前の枠は版面より一回り大きく。壁で画面を埋めきる */
const NL = -60, NR = 660, NT = -80, NB = 880;
/* 奥の口 */
const FL = 236, FR = 364, FT = 366, FB = 494;

const XL = (t: number) => lerp(NL, FL, t);
const XR = (t: number) => lerp(NR, FR, t);
const YT = (t: number) => lerp(NT, FT, t);
const YB = (t: number) => lerp(NB, FB, t);
/* 壁の高さ方向。u=0 が天井、u=1 が床 */
const YL = (t: number, u: number) => lerp(YT(t), YB(t), u);

/** 奥行きの停留点。1/z で詰まる */
const ST = Array.from({ length: 19 }, (_, k) => k / (k + 1.6));

export default function Plate() {
  const r = rand(20190401);

  /* 扉。左右の壁に振り分ける。等間隔に置くと廊下が短く見えるので、間を抜く */
  const doors: { side: "L" | "R"; k: number; ajar?: boolean }[] = [
    { side: "L", k: 1 }, { side: "R", k: 2 }, { side: "L", k: 4 },
    { side: "R", k: 5, ajar: true }, { side: "L", k: 7 }, { side: "R", k: 9 },
    { side: "L", k: 11 },
  ];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="リミナルスペース様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 壁。手前が明るく、奥へ行くほど沈む。蛍光灯の下だけ白く飛ぶ */}
        <linearGradient id={`${P}-wallL`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8cfa8" />
          <stop offset="0.55" stopColor={CREAM} />
          <stop offset="1" stopColor="#cfc59a" />
        </linearGradient>
        <linearGradient id={`${P}-wallR`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#dbd2ac" />
          <stop offset="0.55" stopColor="#eae4cc" />
          <stop offset="1" stopColor="#cfc59a" />
        </linearGradient>
        <linearGradient id={`${P}-floor`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6b6746" />
          <stop offset="0.55" stopColor="#9a9269" />
          <stop offset="1" stopColor={TAN} />
        </linearGradient>
        <linearGradient id={`${P}-ceil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe9d4" />
          <stop offset="1" stopColor="#ddd6bc" />
        </linearGradient>
        {/* 蛍光灯の光。緑に転ばせる。これが「安っぽい屋内」の色 */}
        <radialGradient id={`${P}-lamp`}>
          <stop offset="0" stopColor="#ffffee" stopOpacity="0.85" />
          <stop offset="1" stopColor="#e8f0c8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}-vig`} cx="0.5" cy="0.52">
          <stop offset="0.4" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#2a2718" stopOpacity="0.52" />
        </radialGradient>
        <filter id={`${P}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 面 ─────────────────────────────────────────────── */}
        <polygon points={`${NL},${NT} ${FL},${FT} ${FR},${FT} ${NR},${NT}`} fill={`url(#${P}-ceil)`} />
        <polygon points={`${NL},${NB} ${FL},${FB} ${FR},${FB} ${NR},${NB}`} fill={`url(#${P}-floor)`} />
        <polygon points={`${NL},${NT} ${FL},${FT} ${FL},${FB} ${NL},${NB}`} fill={`url(#${P}-wallL)`} />
        <polygon points={`${NR},${NT} ${FR},${FT} ${FR},${FB} ${NR},${NB}`} fill={`url(#${P}-wallR)`} />
        <rect x={FL} y={FT} width={FR - FL} height={FB - FT} fill="#cdc49a" />

        {/* ── 床。カーペットの目地 ────────────────────────────── */}
        <g stroke={OLIVE} strokeWidth="1" opacity="0.4">
          {Array.from({ length: 13 }, (_, i) => {
            const x = NL + (i * (NR - NL)) / 12;
            return <line key={i} x1={x} y1={NB} x2={lerp(FL, FR, i / 12)} y2={FB} />;
          })}
          {ST.map((t, i) => (
            <line key={`c${i}`} x1={XL(t)} y1={YB(t)} x2={XR(t)} y2={YB(t)} strokeWidth={1.4 - i * 0.06} />
          ))}
        </g>
        {/* カーペットの柄。菱形をまばらに置く。全部に置くと模様が煩い */}
        <g fill={DARK} opacity="0.3">
          {ST.slice(0, 9).map((t, i) => {
            const t2 = ST[i + 1];
            const cy = (YB(t) + YB(t2)) / 2;
            const h = (YB(t) - YB(t2)) * 0.34;
            return Array.from({ length: 12 }, (_, k) => {
              if ((i + k) % 2) return null;
              const cx = lerp(XL(t), XR(t), (k + 0.5) / 12);
              const w = ((XR(t) - XL(t)) / 12) * 0.3;
              return <polygon key={`${i}-${k}`} points={`${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`} />;
            });
          })}
        </g>

        {/* ── 天井。タイルの目地 ─────────────────────────────── */}
        <g stroke="#bab293" strokeWidth="1" opacity="0.7">
          {Array.from({ length: 13 }, (_, i) => {
            const x = NL + (i * (NR - NL)) / 12;
            return <line key={i} x1={x} y1={NT} x2={lerp(FL, FR, i / 12)} y2={FT} />;
          })}
          {ST.map((t, i) => (
            <line key={`c${i}`} x1={XL(t)} y1={YT(t)} x2={XR(t)} y2={YT(t)} strokeWidth={1.3 - i * 0.055} />
          ))}
        </g>

        {/* ── 蛍光灯。3つ目だけ消す ─────────────────────────── */}
        {[0, 2, 4, 6, 8, 10].map((k, i) => {
          const t1 = ST[k], t2 = ST[k + 1];
          const on = i !== 2;
          const pts = `${lerp(XL(t1), XR(t1), 0.37)},${YT(t1)} ${lerp(XL(t2), XR(t2), 0.37)},${YT(t2)} ${lerp(XL(t2), XR(t2), 0.63)},${YT(t2)} ${lerp(XL(t1), XR(t1), 0.63)},${YT(t1)}`;
          return (
            <g key={k}>
              {on && (
                <ellipse cx="300" cy={(YT(t1) + YT(t2)) / 2} rx={(XR(t1) - XL(t1)) * 0.34}
                         ry={(YT(t2) - YT(t1)) * 1.5} fill={`url(#${P}-lamp)`} />
              )}
              <polygon points={pts} fill={on ? "#fffdf0" : "#b9b295"} />
              <polygon points={pts} fill="none" stroke="#a9a284" strokeWidth="0.8" />
            </g>
          );
        })}

        {/* 灯りの落ちる床。楕円を薄く敷くと、廊下に「明かりの溜まり」ができる */}
        <g filter={`url(#${P}-soft)`} opacity="0.34">
          {[2, 4, 6, 8].map((k, i) =>
            i === 1 ? null : (
              <ellipse key={k} cx="300" cy={(YB(ST[k]) + YB(ST[k + 1])) / 2}
                       rx={(XR(ST[k]) - XL(ST[k])) * 0.19}
                       ry={Math.min(58, (YB(ST[k]) - YB(ST[k + 1])) * 0.55)}
                       fill="#fffce8" />
            ),
          )}
        </g>

        {/* ── 壁。幅木と腰の見切り ─────────────────────────── */}
        <g>
          {[0.845, 0.87, 0.975].map((u, i) => (
            <g key={i}>
              <line x1={XL(0)} y1={YL(0, u)} x2={FL} y2={YL(1, u)} stroke={i === 2 ? DARK : OLIVE}
                    strokeWidth={i === 2 ? 2 : 1.2} opacity={i === 2 ? 0.55 : 0.4} />
              <line x1={XR(0)} y1={YL(0, u)} x2={FR} y2={YL(1, u)} stroke={i === 2 ? DARK : OLIVE}
                    strokeWidth={i === 2 ? 2 : 1.2} opacity={i === 2 ? 0.55 : 0.4} />
            </g>
          ))}
          {/* 幅木。床と壁の境をはっきり切る */}
          <polygon points={`${XL(0)},${YL(0, 0.93)} ${FL},${YL(1, 0.93)} ${FL},${FB} ${XL(0)},${NB}`} fill={TAN} opacity="0.75" />
          <polygon points={`${XR(0)},${YL(0, 0.93)} ${FR},${YL(1, 0.93)} ${FR},${FB} ${XR(0)},${NB}`} fill={TAN} opacity="0.75" />
        </g>

        {/* ── 扉 ─────────────────────────────────────────── */}
        {doors.map((d, i) => {
          const t1 = ST[d.k], t2 = ST[d.k + 1];
          const X = d.side === "L" ? XL : XR;
          const u0 = 0.3, u1 = 0.9;
          const q = `${X(t1)},${YL(t1, u0)} ${X(t2)},${YL(t2, u0)} ${X(t2)},${YL(t2, u1)} ${X(t1)},${YL(t1, u1)}`;
          const qf = `${X(t1)},${YL(t1, u0 - 0.035)} ${X(t2)},${YL(t2, u0 - 0.035)} ${X(t2)},${YL(t2, u1)} ${X(t1)},${YL(t1, u1)}`;
          const hx = lerp(X(t1), X(t2), d.side === "L" ? 0.82 : 0.82);
          const hy = lerp(YL(t1, 0.62), YL(t2, 0.62), 0.82);
          return (
            <g key={i}>
              <polygon points={qf} fill="#bcb28c" />
              <polygon points={q} fill="#d6cca4" />
              <polygon points={q} fill="none" stroke={OLIVE} strokeWidth="1" opacity="0.7" />
              {/* 半開き。手前の縁だけが開いている。理由は無い */}
              {d.ajar && (() => {
                const tm = lerp(t1, t2, 0.26);
                return (
                  <g>
                    <polygon points={`${X(t1)},${YL(t1, u0)} ${X(tm)},${YL(tm, u0)} ${X(tm)},${YL(tm, u1)} ${X(t1)},${YL(t1, u1)}`}
                             fill="#141208" />
                    <line x1={X(tm)} y1={YL(tm, u0)} x2={X(tm)} y2={YL(tm, u1)} stroke="#f4efd8" strokeWidth="1.4" opacity="0.8" />
                  </g>
                );
              })()}
              {!d.ajar && <circle cx={hx} cy={hy} r={Math.max(0.9, (YL(t1, 1) - YL(t1, 0)) * 0.012)} fill={DARK} opacity="0.8" />}
            </g>
          );
        })}

        {/* 左の壁の時計。物はこれ1つだけ。時刻は半端にする */}
        {(() => {
          const t = ST[3];
          const cx = lerp(XL(t), XL(ST[4]), 0.5);
          const cy = lerp(YL(t, 0.24), YL(ST[4], 0.24), 0.5);
          const R = (YL(t, 1) - YL(t, 0)) * 0.035;
          return (
            <g>
              <ellipse cx={cx} cy={cy} rx={R * 0.42} ry={R} fill="#f4f0dc" stroke={OLIVE} strokeWidth="0.8" />
              <line x1={cx} y1={cy} x2={cx + R * 0.2} y2={cy - R * 0.5} stroke={DARK} strokeWidth="1" />
              <line x1={cx} y1={cy} x2={cx - R * 0.18} y2={cy + R * 0.34} stroke={DARK} strokeWidth="0.8" />
            </g>
          );
        })()}

        {/* ── 奥の壁。扉が一枚。少しだけ開いている ───────────────── */}
        <g>
          <rect x="276" y="392" width="48" height="102" fill="#cfc59c" />
          <rect x="278" y="394" width="44" height="98" fill="#dcd2aa" stroke={OLIVE} strokeWidth="0.8" />
          {/* 隙間。向こうは真っ暗。ここが版面でいちばん暗い点 */}
          <rect x="316" y="396" width="7" height="94" fill="#0e0d08" />
          <rect x="323" y="396" width="1.6" height="94" fill="#f6f2de" opacity="0.5" />
          <circle cx="313" cy="446" r="1.6" fill={DARK} />
          {/* 非常口の札。読めるが役に立たない */}
          <rect x="284" y="374" width="32" height="12" fill={DARK} opacity="0.85" />
          <text x="300" y="383" textAnchor="middle" fill="#e6e2cc" fontFamily="sans-serif" fontSize="7.4" letterSpacing="0.5">
            非常口
          </text>
        </g>

        {/* 奥の靄。廊下が終わらないことにする */}
        <ellipse cx="300" cy="440" rx="120" ry="86" fill="#f2eed8" opacity="0.3" filter={`url(#${P}-soft)`} />

        {/* ── 文字。写真の隅に焼き込まれた日付のように置く ─────────── */}
        <text x="44" y="760" fill={PALE} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="11.5" letterSpacing="4.6" opacity="0.8">
          LIMINAL SPACE
        </text>
        <text x="44" y="777" fill={PALE} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="9" letterSpacing="2.6" opacity="0.62">
          NO ONE HAS BEEN HERE FOR A WHILE
        </text>
        <text x="556" y="777" textAnchor="end" fill={PALE} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="9" letterSpacing="2.2" opacity="0.6">
          03:14
        </text>

        {/* 質感。粒を強めに。撮られた写真であってほしい */}
        <rect width="600" height="800" fill={`url(#${P}-vig)`} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.12" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}
