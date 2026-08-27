/**
 * ミニマリズム。
 *
 * 初稿はアグネス・マーティンの手引き格子だった。理屈は通っていたが、
 * 縮小一覧では「薄い灰色の四角が1つ置いてある」だけになり、
 * 図版として成立しなかった。余白が主役なのは正しいが、
 * **余白は、それを支える骨格があってはじめて「残した」ように見える。**
 * 骨格が無いと、ただ「余った」に見える。作り直した。
 *
 * ■ 何を描いているか
 *   フランク・ステラの黒絵画（1959–）。ミニマリズムの発火点そのもの。
 *   幅19の黒い帯と幅5の生地（＝描かない部分）を交互に、外から内へ入れ子にする。
 *   帯幅は木枠の厚みから決まっていて、絵の内側に理由がない。
 *   「見えているものが、見えているものだ」——構成でも象徴でもなく、
 *   帯の反復そのものが絵になる。これがミニマリズムの技法。
 *
 * ■ 骨格の作りかた
 *   1. **単位を1つだけ決める。** u = 24。帯19＋生地5＝24。
 *      版面の余白も、罫も、赤も、全部この24の倍数の上にある。
 *      比率を紙の上で明示してあるので、余白が測られたものに見える。
 *   2. **正方形にしない。** 面は 432×528（18u×22u）。正方形で入れ子にすると
 *      中心が一点に潰れて的（ターゲット）に見え、オプ・アートに寄る。
 *      長方形だと最後が潰れきらず、**中央に縦のスリットが残る**。
 *      ステラの入れ子はこれ。的ではなく、旗になる。
 *   3. **留め（マイター）の継ぎ目。** 帯は角で45度に突き合わせて塗る。
 *      その継ぎ目が四隅から中心へ走る。185pxまで縮めても、
 *      黒い面を横切るこのXだけは残る。縮小耐性はここが持っている。
 *   4. **手で塗る。** 帯幅と位置を1本ずつ揺らしてある。定規で引いた鉛筆線の
 *      あいだを刷毛で埋めた絵なので、生地の筋は等幅にならない。
 *   5. **赤は 24角が1つだけ。** 面の 1/18。位置は右の欄の中央、面の天と同じ高さ。
 *      余白のなかで唯一の暖色で、右上の空きが「決めて空けた」ことになる。
 *
 * ■ スイス・スタイルと混ざらないように
 *   あちらは文字組で紙を押さえる。こちらは文字を9.5pxより上げず、
 *   紙を押さえるのは黒い面ひとつだけにしてある。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "min";
const PAPER = "#f4f3f0";
const INK = "#111111";
const GREY = "#8c8c8c";
const RED = "#e2231a";
/* 生地。素の麻。白すぎると縮小時に面が炭色に浮くので、
   一段落とした暖かい中間色にしてある */
const RAW = "#b4afa4";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 単位。帯19＋生地5。版面の寸法は全部これの倍数 */
const U = 24;
const BAND = 19;

/* 面。18u × 22u。左72・右96・天96・地176 と四辺すべて違える */
const FX = 72;
const FY = 96;
const FW = 432;
const FH = 528;
const FR = FX + FW; // 504
const FB = FY + FH; // 624
const RINGS = 9; // 24×9 = 216 = FW/2。ここで横が閉じ、縦にスリットが残る

/* マイターの継ぎ目が中心線に届く高さ。四隅から45度 */
const MX = FX + FW / 2; // 288
const MT = FY + FW / 2; // 312
const MB = FB - FW / 2; // 408

export default function Plate() {
  const r = rand(1959); // Die Fahne hoch! の年

  /* 帯。1本ずつ幅と位置を揺らす。刷毛で塗った黒絵画は等幅にならない */
  const rings = Array.from({ length: RINGS }, (_, i) => {
    const d = i * U + BAND / 2 + r(-0.6, 0.6);
    return {
      x: FX + d,
      y: FY + d,
      w: Math.max(2, FW - 2 * d),
      h: Math.max(2, FH - 2 * d),
      sw: BAND + r(-0.7, 0.7),
      /* 黒も1本ずつ違う。エナメルは重ね方で艶が変わる */
      fill: ["#111111", "#15141a", "#0f0f10", "#171614"][i % 4],
      /* 刷毛の引き跡。帯のなかを走る、わずかに明るい筋 */
      drag: [r(-6, -2), r(2, 6)],
    };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ミニマリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-field`}>
          <rect x={FX} y={FY} width={FW} height={FH} />
        </clipPath>
        {/* エナメルの艶。左上からのごく弱い反射。これが無いと塗膜に見えない */}
        <linearGradient id={`${P}-sheen`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.075" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.012" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 面 ────────────────────────────────────────────────
               まず生地を全面に置き、その上に黒い帯を入れ子で乗せる。
               塗り残しがそのまま生地の筋になる。実際の描き順と同じ */}
        <g clipPath={`url(#${P}-field)`}>
          <rect x={FX} y={FY} width={FW} height={FH} fill={RAW} />

          {rings.map((c, i) => (
            <rect
              key={`r${i}`}
              x={c.x} y={c.y} width={c.w} height={c.h}
              fill="none" stroke={c.fill} strokeWidth={c.sw.toFixed(2)}
            />
          ))}

          {/* 刷毛の引き跡。帯の内側を走る明るい筋。近寄ったときだけ見える */}
          <g fill="none" stroke="#3a3730" strokeWidth="0.7" opacity="0.5">
            {rings.map((c, i) =>
              c.drag.map((o, k) => (
                <rect
                  key={`d${i}-${k}`}
                  x={c.x + o} y={c.y + o}
                  width={Math.max(1, c.w - 2 * o)} height={Math.max(1, c.h - 2 * o)}
                />
              )),
            )}
          </g>

          {/* 角の留め。四隅から45度、中心線まで。帯を突き合わせた継ぎ目 */}
          {/* 強く出すと入れ子が奥行きに見え、「見えているものが見えているもの」
              という平面性から離れる。読める最小の濃さで止めてある */}
          <g stroke={RAW} strokeWidth="0.95" opacity="0.4">
            <line x1={FX} y1={FY} x2={MX} y2={MT} />
            <line x1={FR} y1={FY} x2={MX} y2={MT} />
            <line x1={FX} y1={FB} x2={MX} y2={MB} />
            <line x1={FR} y1={FB} x2={MX} y2={MB} />
          </g>

          <rect x={FX} y={FY} width={FW} height={FH} fill={`url(#${P}-sheen)`} />
        </g>

        {/* ── 版面の骨格。面の右辺と下辺を紙の端まで通す ───────── */}
        <line x1={FR} y1="0" x2={FR} y2="800" stroke={INK} strokeWidth="0.7" opacity="0.42" />
        <line x1="0" y1={FB} x2="600" y2={FB} stroke={INK} strokeWidth="0.7" opacity="0.42" />

        {/* 単位の刻み。24ごと、4つめだけ長い。空いた下段に律動を渡す */}
        <g stroke={INK} strokeWidth="0.7">
          {Array.from({ length: FW / U + 1 }, (_, i) => {
            const x = FX + i * U;
            const long = i % 4 === 0;
            return (
              <line key={`t${i}`} x1={x} y1={FB} x2={x} y2={FB + (long ? 13 : 5)}
                    opacity={long ? 0.5 : 0.28} />
            );
          })}
        </g>

        {/* 面の幅の寸法。図版が自分の寸法を持っている */}
        <g stroke={INK} opacity="0.4" strokeWidth="0.5">
          <line x1={FX} y1="664" x2={FR} y2="664" />
          <line x1={FX} y1="659" x2={FX} y2="669" />
          <line x1={FR} y1="659" x2={FR} y2="669" />
        </g>
        {/* 寸法線の左端、ちょうど1u ぶんだけ赤。単位そのものを指している */}
        <rect x={FX} y="662.6" width={U} height="2.8" fill={RED} />
        <text x={(FX + FR) / 2} y="657" fill={INK} fontFamily={SANS} fontSize="6.5" fontWeight="600"
              letterSpacing="1.4" textAnchor="middle" opacity="0.55">
          432 = 18 U
        </text>

        {/* 赤の正方形。1u角＝面の1/18。右の欄の中央、面の天と同じ高さ */}
        <rect x="540" y={FY} width={U} height={U} fill={RED} />

        {/* ── 文字 ───────────────────────────────────────────── */}
        <text x={FX} y="712" fill={INK} fontFamily={SANS} fontSize="9.5" fontWeight="500" letterSpacing="7.5">
          MINIMALISM
        </text>
        <g fill={GREY} fontFamily={SANS} fontSize="7" fontWeight="500" letterSpacing="2.4">
          <text x={FX} y="736">NINE BANDS · 19 BLACK, 5 RAW · MITRED AT THE CORNER</text>
          <text x={FX} y="749">432 × 528 ON 600 × 800 — U = 24</text>
        </g>
        <text x={FR} y="770" fill={GREY} fontFamily={SANS} fontSize="6.5" fontWeight="500"
              letterSpacing="2.2" textAnchor="end" opacity="0.8">
          WHAT YOU SEE IS WHAT YOU SEE
        </text>

        {/* 紙の目 */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.1"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
