"use client";

// 黒ひげ危機一発の「1色成型のプラスチック剣」をインラインSVGで描く共通部品。
// 画像アセットを増やせない制約があるので、剣もチャームのビーズも全部ベクタで作る。
//
// ── 形は実物のパーツ写真(tomy_2.png)をピクセル計測して決めている ──────
// 剣1本のマスクを主成分軸へ射影して、先端からの位置ごとの幅を測った結果:
//
//   先端から   0%    8%   16%   24%   32%   40%   48%  |52-60%| 64%  72%  88%  96%
//   実物の幅  7.9  13.8  16.9  18.6  19.6  19.9  20.0 | 44.0 | 29.0 22.2 21.1 26.1
//   このSVG   8.6  15.4  17.8  19.5  20.1  20.4  20.7 | 44.7 | 22.8 22.8 23.1 31.7
//                                                     ↑鍔    ↑はしご握り  ↑柄頭
//   (数値はすべて全長Lに対する%)
//
// 要点:
//   ・刃は「先端から8%で一気に開き、あとはほぼ一定幅」の長いオジーブ。細長くすると
//     8色が横に並んだとき墓標の列に見えてしまうので、この太さ(最大 20% L)は必須。
//   ・剣先は尖らせない(丸い鼻)。
//   ・鍔は刃の 2.2倍(44% L)まで張り出す。両はしは中央がくぼんだ丸いコブ。
//   ・握りは横に張り出すリブ5本のはしご。柄頭は平たく開いた三つ葉板(球ではない)。
//   ・刃を縦断する樋(血抜き溝)は実剣のディテールなので描かない。実物にあるのは
//     鍔の上のU字の浮き彫りだけ。
//
// 向きは「ラックに挿さっている姿」= 柄頭が上・剣先が下。
// 陰影は「白と黒の半透明を重ねる」だけなので、どの hex が来ても破綻しない
// (SWORD_COLORS の彩度を上げても、色計算を持たないぶん勝手に馴染む)。

import { useId } from "react";
import {
  CHARMS,
  CHARM_VISIBLE_MAX,
  SWORD_COLORS,
  SWORD_SKINS,
} from "@/lib/config";

/** 剣の座標系。全長 96(y=4〜100)、鍔の幅 42.4 が箱いっぱいに入る */
const VB_W = 44;
const VB_H = 104;

/** 刃(下向き)。先端 y=100、上は握りのうしろへ隠れる */
const D_BLADE =
  "M22 100 C25.6 99.9 27.1 97.6 28.6 92.3 C29.6 89 30.1 84.6 30.6 80 C31.1 75 31.4 69.3 31.5 62 C31.55 56 31.55 46 31.55 38 L12.45 38 C12.45 46 12.45 56 12.5 62 C12.6 69.3 12.9 75 13.4 80 C13.9 84.6 14.4 89 15.4 92.3 C16.9 97.6 18.4 99.9 22 100 Z";
/** 鍔のすぐ下のU字の浮き彫り(実物にあるのはこれ。樋ではない) */
const D_EMBOSS = "M17.3 49.6 L17.3 55.3 A4.7 4.7 0 0 1 26.7 55.3 L26.7 49.6";
/** 刃の左肩に入るツヤ */
const D_GLOSS =
  "M17.2 92.6 C15.6 88.6 14.9 83.4 14.7 77.5 C14.5 71 14.6 63 14.9 54 L17.9 54 C17.6 63 17.5 71 17.7 77.5 C17.9 83.2 18.5 88.2 19.7 92.6 Z";

/** はしご状の握り: 横へ張り出すリブ5本と、そのあいだに彫る溝4本 */
const RUNG_Y = [14.3, 19.5, 24.7, 29.9, 35.1];
const RUNG_H = 3.3;
const GROOVE_Y = [17.6, 22.8, 28, 33.2];

/** 仕上げの見た目は4種類に集約する(3Dのマテリアル値からUI表現へ翻訳) */
type Finish = "plastic" | "metal" | "crystal" | "iri";

function finishOf(skin: number): Finish {
  const s = SWORD_SKINS[skin] ?? SWORD_SKINS[0];
  if (s.iridescent) return "iri";
  if (s.opacity < 1) return "crystal";
  if (s.metalness > 0.6) return "metal";
  return "plastic";
}

/** 横方向の陰影(0=左端 1=右端)。白黒の半透明なので下地の色を選ばない */
const SHADE: Record<Finish, [number, string][]> = {
  // 実物は「マット寄りの成型樹脂」。ツヤは広くやわらかく、彩度の高い色でも飛ばさない
  plastic: [
    [0, "rgba(255,255,255,.4)"],
    [0.2, "rgba(255,255,255,.13)"],
    [0.5, "rgba(255,255,255,0)"],
    [0.78, "rgba(0,0,0,.14)"],
    [1, "rgba(0,0,0,.35)"],
  ],
  // 金属は「細く強いハイライト帯」が2本走るのが要点
  metal: [
    [0, "rgba(0,0,0,.34)"],
    [0.08, "rgba(255,255,255,.12)"],
    [0.26, "rgba(255,255,255,.95)"],
    [0.38, "rgba(255,255,255,.18)"],
    [0.58, "rgba(0,0,0,.22)"],
    [0.74, "rgba(255,255,255,.66)"],
    [0.87, "rgba(0,0,0,.05)"],
    [1, "rgba(0,0,0,.44)"],
  ],
  // 透明樹脂は「ふちが明るく中が抜ける」
  crystal: [
    [0, "rgba(255,255,255,.85)"],
    [0.22, "rgba(255,255,255,.08)"],
    [0.5, "rgba(255,255,255,.6)"],
    [0.76, "rgba(255,255,255,.04)"],
    [1, "rgba(255,255,255,.78)"],
  ],
  iri: [
    [0, "rgba(255,255,255,.4)"],
    [0.3, "rgba(255,255,255,.06)"],
    [0.56, "rgba(255,255,255,.6)"],
    [0.8, "rgba(0,0,0,.08)"],
    [1, "rgba(0,0,0,.3)"],
  ],
};

/**
 * にじいろの下地。UIでも3D同様に「見る場所で色が動く」感じを出す。
 * しあげの棚では幅24pxまで縮むので、パステルすぎると銀と見分けがつかない。
 * にじだと一目で分かる彩度にしてある。
 */
const IRI_STOPS: [number, string][] = [
  [0, "#ff9fd8"],
  [0.18, "#a58cff"],
  [0.36, "#5cc8ff"],
  [0.54, "#7ff0b8"],
  [0.72, "#ffdb6b"],
  [0.88, "#ff8fb0"],
  [1, "#b79bff"],
];

/**
 * バッジなど「1色だけ欲しい」場所むけ。tinted なスキンは選んだ色、
 * そうでなければスキン固有色を返す(にじいろは中間色でごまかす)。
 */
export function effectiveHex(color: number, skin: number): string {
  const sk = SWORD_SKINS[skin] ?? SWORD_SKINS[0];
  if (sk.iridescent) return "#c4b6ff";
  const c = SWORD_COLORS[color] ?? SWORD_COLORS[0];
  return sk.tinted ? c.hex : sk.hex;
}

/** 剣にぶら下げて見せるチャーム(新しく手に入れたものから最大3個) */
export function visibleCharms(charms: number) {
  const n = Math.min(Math.max(charms, 0), CHARMS.length);
  return CHARMS.slice(Math.max(0, n - CHARM_VISIBLE_MAX), n);
}

/** きらめきの4方向スター(金属・クリスタルの見せ場) */
function sparkle(x: number, y: number, s: number): string {
  const q = s * 0.26;
  return [
    `M${x} ${y - s}`,
    `Q${x + q} ${y - q} ${x + s} ${y}`,
    `Q${x + q} ${y + q} ${x} ${y + s}`,
    `Q${x - q} ${y + q} ${x - s} ${y}`,
    `Q${x - q} ${y - q} ${x} ${y - s}`,
    "Z",
  ].join(" ");
}

export interface SwordArtProps {
  /** SWORD_COLORS の index */
  color: number;
  /** SWORD_SKINS の index */
  skin: number;
  /** ぶら下げるチャームの数(0でなし) */
  charms?: number;
  className?: string;
}

export default function SwordArt({
  color,
  skin,
  charms = 0,
  className,
}: SwordArtProps) {
  // 同じページに何本も並ぶので、グラデーションのidは実体ごとに固有にする。
  // useId の ":" は url(#..) 参照で嫌われることがあるので英数字だけに落とす。
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fin = finishOf(skin);
  const base = effectiveHex(color, skin);
  const beads = visibleCharms(charms);

  const body = fin === "iri" ? `url(#ki${uid})` : base;
  const shade = `url(#ks${uid})`;
  const bodyOpacity = fin === "crystal" ? 0.86 : 1;
  const edge = fin === "crystal" ? "rgba(20,40,70,.3)" : "rgba(0,0,0,.28)";

  /** 成型パーツ1つぶん = 下地 + 同じ形の陰影。パーツごとに丸く見える */
  const part = (el: (fill: string, outline: boolean) => React.ReactNode) => (
    <>
      {el(body, true)}
      {el(shade, false)}
    </>
  );

  return (
    <svg
      className={className ? `kk-svg ${className}` : "kk-svg"}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`ks${uid}`} x1="0" y1="0" x2="1" y2="0">
          {SHADE[fin].map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
        {fin === "iri" && (
          <linearGradient id={`ki${uid}`} x1="0" y1="0" x2="1" y2="0.25">
            {IRI_STOPS.map(([o, c]) => (
              <stop key={o} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        )}
      </defs>

      {/* ── チャーム: 鍔の右のコブから、刃の横へ垂らす ── */}
      {beads.length > 0 && (
        <g>
          <path
            d={`M38.9 49.8 C39.7 51 39.6 52 39.5 ${52.4 + beads.length * 0.2}`}
            fill="none"
            stroke="rgba(0,0,0,.32)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {beads.map((c, i) => {
            const cy = 54.6 + i * 7;
            return (
              <g key={c.name}>
                <circle
                  cx="39.5"
                  cy={cy}
                  r="2.9"
                  fill={c.hex}
                  stroke="rgba(0,0,0,.34)"
                  strokeWidth="0.9"
                />
                <circle
                  cx="38.6"
                  cy={cy - 1}
                  r="1.05"
                  fill="rgba(255,255,255,.85)"
                />
              </g>
            );
          })}
        </g>
      )}

      <g opacity={bodyOpacity}>
        {/* ── 柄頭(平たく開いた三つ葉板) ── */}
        {[
          [11.6, 8.6, 3.1, 2.5],
          [32.4, 8.6, 3.1, 2.5],
          [22, 8, 3.5, 2.8],
        ].map(([cx, cy, rx, ry]) => (
          <g key={cx}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={body}
              stroke={edge}
              strokeWidth="1"
            />
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={shade} />
          </g>
        ))}
        {part((f, o) => (
          <rect
            key={o ? "b" : "s"}
            x="9.2"
            y="8.6"
            width="25.6"
            height="4.8"
            rx="2.1"
            fill={f}
            stroke={o ? edge : "none"}
            strokeWidth="1"
          />
        ))}

        {/* ── はしご状の握り(細い胴 + 横へ張り出すリブ) ── */}
        {part((f, o) => (
          <rect
            key={o ? "b" : "s"}
            x="13"
            y="13"
            width="18"
            height="25"
            rx="2.2"
            fill={f}
            stroke={o ? edge : "none"}
            strokeWidth="1"
          />
        ))}
        {RUNG_Y.map((y) => (
          <g key={y}>
            <rect
              x="11.4"
              y={y}
              width="21.2"
              height={RUNG_H}
              rx="1.1"
              fill={body}
              stroke={edge}
              strokeWidth="0.9"
            />
            <rect
              x="11.4"
              y={y}
              width="21.2"
              height={RUNG_H}
              rx="1.1"
              fill={shade}
            />
          </g>
        ))}
        {/* 溝は「彫った跡」。ここを暗くしないとリブがバネのように見える */}
        {GROOVE_Y.map((y) => (
          <g key={y}>
            <rect
              x="13.4"
              y={y}
              width="17.2"
              height="1.9"
              rx="0.9"
              fill="rgba(0,0,0,.24)"
            />
            <rect
              x="13.4"
              y={y + 1.4}
              width="17.2"
              height="0.6"
              rx="0.3"
              fill="rgba(255,255,255,.26)"
            />
          </g>
        ))}

        {/* ── 刃(下向き。上端は握りのうしろに隠れる) ── */}
        <path d={D_BLADE} fill={body} stroke={edge} strokeWidth="1" />
        <path d={D_BLADE} fill={shade} />
        <path d={D_GLOSS} fill="rgba(255,255,255,.34)" />
        {/* U字の浮き彫り: 明るい線をずらして「盛り上がり」に見せる */}
        <path
          d={D_EMBOSS}
          fill="none"
          stroke="rgba(0,0,0,.2)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d={D_EMBOSS}
          fill="none"
          stroke="rgba(255,255,255,.34)"
          strokeWidth="1.1"
          strokeLinecap="round"
          transform="translate(-0.7 -0.7)"
        />

        {/* ── 鍔(横棒 + 両はしの丸いコブ)。刃幅の2.2倍まで張り出させる ── */}
        {part((f, o) => (
          <rect
            key={o ? "b" : "s"}
            x="5.4"
            y="42.4"
            width="33.2"
            height="7.7"
            rx="2.7"
            fill={f}
            stroke={o ? edge : "none"}
            strokeWidth="1"
          />
        ))}
        {[5.4, 38.6].map((cx) => (
          <g key={cx}>
            <circle
              cx={cx}
              cy="46.2"
              r="4.6"
              fill={body}
              stroke={edge}
              strokeWidth="1"
            />
            <circle cx={cx} cy="46.2" r="4.6" fill={shade} />
            {/* コブの真ん中のくぼみ(実物のドーナツ状のディテール) */}
            <circle
              cx={cx}
              cy="46.2"
              r="1.7"
              fill="rgba(0,0,0,.22)"
              stroke="rgba(255,255,255,.25)"
              strokeWidth="0.7"
            />
          </g>
        ))}
        <rect
          x="8.6"
          y="43.6"
          width="26.8"
          height="1.9"
          rx="0.95"
          fill="rgba(255,255,255,.34)"
        />
      </g>

      {/* ── 仕上げのきらめき ── */}
      {(fin === "metal" || fin === "crystal") && (
        <>
          <path d={sparkle(26.6, 80, 4.2)} fill="rgba(255,255,255,.92)" />
          <path d={sparkle(18.4, 66, 2.6)} fill="rgba(255,255,255,.7)" />
        </>
      )}
      {fin === "iri" && (
        <path d={sparkle(26.2, 76, 3.7)} fill="rgba(255,255,255,.85)" />
      )}
    </svg>
  );
}
