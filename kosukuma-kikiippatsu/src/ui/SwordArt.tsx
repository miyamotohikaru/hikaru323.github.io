"use client";

// 黒ひげ危機一発の「1色成型のプラスチック剣」をインラインSVGで描く共通部品。
// 画像アセットを増やせない制約があるので、剣もチャームのビーズも全部ベクタで作る。
//
// ── 形は実物のパーツ写真を計測して決めている ──────────────
// 公式写真(tomy_2.png)の剣1本を軸に射影して測った、全長Lに対する比率:
//   刃(鍔〜先端)      59% L        刃の最大幅        24% L
//   刃(彫刻より上)    41% L        幅/刃長(彫刻上)  0.60
//   鍔の位置          柄尻から41%   鍔の幅            44% L(= 刃幅の1.8倍)
//   握り(はしご)      29% L 高 × 25% L 幅、リブ5本
//   剣先              丸い鼻(尖らせない)
//   柄頭              平たく開いた三つ葉板(球ではない)
// 細長い剣は横に並べると「墓標の列」に見えてしまうので、この太さは必須。
// 刃を縦断する樋(血抜き溝)は実剣のディテールなので描かない。実物にあるのは
// 鍔の上のU字の浮き彫りだけ。
//
// 陰影は「白と黒の半透明を重ねる」だけで作ってあるので、どの hex が来ても
// 破綻しない(SWORD_COLORS の彩度を上げても、色計算を持たないぶん勝手に馴染む)。

import { useId } from "react";
import {
  CHARMS,
  CHARM_VISIBLE_MAX,
  SWORD_COLORS,
  SWORD_SKINS,
} from "@/lib/config";

/** 剣の座標系。全長 ≒ 97(y=4.2〜101)、鍔の幅 42 が箱いっぱいに入る */
const VB_W = 44;
const VB_H = 104;

/**
 * 刃: 幅広の「へら(木の葉)」。実物を計測すると、下の6割はほぼ最大幅のままで、
 * 上の4割だけが丸い鼻へすぼまる。ここを細長くすると墓標の列に見えてしまう。
 * 最大幅 23.2 / 刃長 64.8 = 0.36(彫刻より上の見えている葉だけなら 0.60)。
 */
const D_BLADE =
  "M22 4.2 C26.2 4.4 30.2 8.6 31.8 15.5 C33.2 21.5 33.6 30 33.6 40 C33.6 50 33.4 60 33 69 L11 69 C10.6 60 10.4 50 10.4 40 C10.4 30 10.8 21.5 12.2 15.5 C13.8 8.6 17.8 4.4 22 4.2 Z";
/** 鍔の上のU字の浮き彫り(実物にあるのはこれ。刃を縦断する溝=樋ではない) */
const D_EMBOSS = "M15.6 58.6 L15.6 46.6 A6.4 6.4 0 0 1 28.4 46.6 L28.4 58.6";
/** 刃の左肩に入るツヤ */
const D_GLOSS =
  "M16.2 11.6 C14.4 15.6 13.4 21 13.2 27.5 C13 34 13.1 42 13.5 50 L16.8 50 C16.4 42 16.3 34 16.5 27.5 C16.7 21.6 17.4 16 18.8 11.6 Z";

/** はしご状の握り。横に張り出す耳(5本)と、そのあいだに彫る溝(4本) */
const RUNG_Y = [65, 70.8, 76.6, 82.4, 88.2];
const RUNG_H = 3.4;
const GROOVE_Y = [68.4, 74.2, 80, 85.8];

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
  // 実物は「マット寄りの成型樹脂」。ツヤは広くやわらかく、ハイライトは飛ばさない
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

/** にじいろの下地。UIでも3D同様に「見る場所で色が動く」感じを出す */
const IRI_STOPS: [number, string][] = [
  [0, "#ffd0ee"],
  [0.18, "#c4b6ff"],
  [0.36, "#9adcff"],
  [0.54, "#b6f6d6"],
  [0.72, "#ffeaa6"],
  [0.88, "#ffb3c9"],
  [1, "#d3c2ff"],
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
  const part = (el: (fill: string, key: string) => React.ReactNode) => (
    <>
      {el(body, "b")}
      {el(shade, "s")}
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

      {/* ── チャーム: 鍔の右のコブから、握りの横へ垂らす ── */}
      {beads.length > 0 && (
        <g>
          <path
            d={`M39.2 64.4 C40.2 66 40 67.4 39.8 ${68 + beads.length * 0.3}`}
            fill="none"
            stroke="rgba(0,0,0,.32)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {beads.map((c, i) => {
            const cy = 70.6 + i * 7.5;
            return (
              <g key={c.name}>
                <circle
                  cx="39.8"
                  cy={cy}
                  r="3"
                  fill={c.hex}
                  stroke="rgba(0,0,0,.34)"
                  strokeWidth="0.9"
                />
                <circle
                  cx="38.9"
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
        {/* ── 刃(木の葉) ── */}
        <path d={D_BLADE} fill={body} stroke={edge} strokeWidth="1" />
        <path d={D_BLADE} fill={shade} />
        <path d={D_GLOSS} fill="rgba(255,255,255,.34)" />
        {/* U字の浮き彫り: 明るい線を上にずらして「盛り上がり」に見せる */}
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

        {/* ── はしご状の握り(細い胴 + 横に張り出す5本のリブ) ── */}
        {part((f, k) => (
          <rect
            key={k}
            x="10.5"
            y="64.5"
            width="23"
            height="27.5"
            rx="2.4"
            fill={f}
            stroke={k === "b" ? edge : "none"}
            strokeWidth="1"
          />
        ))}
        {RUNG_Y.map((y) => (
          <g key={y}>
            <rect
              x="8.4"
              y={y}
              width="27.2"
              height={RUNG_H}
              rx="1.2"
              fill={body}
              stroke={edge}
              strokeWidth="0.9"
            />
            <rect
              x="8.4"
              y={y}
              width="27.2"
              height={RUNG_H}
              rx="1.2"
              fill={shade}
            />
          </g>
        ))}
        {/* 溝は「彫った跡」。ここを暗くしないとリブがバネのように見える */}
        {GROOVE_Y.map((y) => (
          <g key={y}>
            <rect
              x="10.9"
              y={y}
              width="22.2"
              height="2.4"
              rx="1"
              fill="rgba(0,0,0,.24)"
            />
            <rect
              x="10.9"
              y={y + 1.9}
              width="22.2"
              height="0.7"
              rx="0.35"
              fill="rgba(255,255,255,.26)"
            />
          </g>
        ))}

        {/* ── 鍔(横棒 + 両はしの丸いコブ) ── */}
        {part((f, k) => (
          <rect
            key={k}
            x="5.4"
            y="57.2"
            width="33.2"
            height="7.6"
            rx="2.6"
            fill={f}
            stroke={k === "b" ? edge : "none"}
            strokeWidth="1"
          />
        ))}
        {[5.4, 38.6].map((cx) => (
          <g key={cx}>
            <circle
              cx={cx}
              cy="61"
              r="4.5"
              fill={body}
              stroke={edge}
              strokeWidth="1"
            />
            <circle cx={cx} cy="61" r="4.5" fill={shade} />
            {/* コブの真ん中のくぼみ(実物のドーナツ状のディテール) */}
            <circle
              cx={cx}
              cy="61"
              r="1.7"
              fill="rgba(0,0,0,.22)"
              stroke="rgba(255,255,255,.25)"
              strokeWidth="0.7"
            />
          </g>
        ))}
        <rect
          x="8.6"
          y="58.4"
          width="26.8"
          height="1.9"
          rx="0.95"
          fill="rgba(255,255,255,.34)"
        />

        {/* ── 柄頭(平たく開いた三つ葉板) ── */}
        {part((f, k) => (
          <rect
            key={k}
            x="8.5"
            y="91.6"
            width="27"
            height="4.8"
            rx="2.1"
            fill={f}
            stroke={k === "b" ? edge : "none"}
            strokeWidth="1"
          />
        ))}
        {/* 三つ葉は「平たい板が開いた」形なので、球ではなく横長の楕円にする */}
        {[
          [9.6, 96.4, 3.4, 2.6],
          [34.4, 96.4, 3.4, 2.6],
          [22, 97, 3.8, 2.9],
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
      </g>

      {/* ── 仕上げのきらめき ── */}
      {(fin === "metal" || fin === "crystal") && (
        <>
          <path d={sparkle(27.5, 26, 4.6)} fill="rgba(255,255,255,.92)" />
          <path d={sparkle(17.5, 40, 2.8)} fill="rgba(255,255,255,.7)" />
        </>
      )}
      {fin === "iri" && (
        <path d={sparkle(27, 30, 4)} fill="rgba(255,255,255,.85)" />
      )}
    </svg>
  );
}
