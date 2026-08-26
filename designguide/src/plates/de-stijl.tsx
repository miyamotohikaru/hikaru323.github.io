/**
 * デ・ステイル。
 *
 * バウハウスと同じ三原色を使う流派なので、まず「何が違うか」を決めた。
 * 違いは一点、**斜めを一切使わないこと**。円も三角も45度もない。
 * 版面は縦横の黒帯だけで割られ、割られた区画に赤・青・黄が入る。
 *
 * ■ 初稿の失敗と直し
 *   1. 区画をどれも同じくらいの大きさにしたら、ただの窓枠になった。
 *      モンドリアンの力は「割りが極端に不均等なこと」から出る。
 *      赤を版面の3割まで大きくし、左右に細い柱を立てて割り直した。
 *   2. 黒帯を全部端まで通していた。通すと格子になる。
 *      いまは y=180 の帯は左柱だけ、y=286 の帯は右柱だけにしてある。
 *   3. 格子文字の行と行のあいだに白い筋が出た（矩形の継ぎ目）。
 *      高さを 0.6 だけ余分に取って重ねている。
 *   4. 刷毛あとを濃く入れたら、色面が縞のグラデーションに見えた。
 *      いまは 0.015 前後まで落とし、筋も太くして、近くで見たときだけ気づく強さにしている。
 *
 * ■ 近くで見る細部
 *   右下の灰色の区画に、この版面じたいの割りを 1/10 で描いた小図を入れた。
 *   新造形主義は「比の芸術」なので、絵が自分の設計図を持っているのが似合う。
 */
import type { ReactElement } from "react";
import { ATLAS, rand } from "@/lib/plate";

const P = "ds";
const PAPER = "#f4f2ec";
const INK = "#111111";
const RED = "#d02020";
const BLUE = "#1a4fd0";
const YELLOW = "#f2c200";
/* 白は1色にしない。油彩の白は面ごとに違う */
const W_COOL = "#f7f6f1";
const W_WARM = "#efece2";
const GREY = "#e2dfd4";

type Box = { x: number; y: number; w: number; h: number; fill: string };

/* 色と白の面。赤＝最大、黄＝中、青＝最小。3色が同寸だと信号機になる */
const FIELDS: Box[] = [
  { x: 0, y: 0, w: 150, h: 180, fill: W_COOL },
  { x: 0, y: 188, w: 150, h: 242, fill: GREY },
  { x: 162, y: 0, w: 324, h: 430, fill: RED },
  { x: 494, y: 0, w: 106, h: 286, fill: W_WARM },
  { x: 494, y: 294, w: 106, h: 136, fill: YELLOW },
  { x: 0, y: 443, w: 392, h: 247, fill: W_COOL },
  { x: 0, y: 698, w: 150, h: 102, fill: BLUE },
  { x: 162, y: 698, w: 230, h: 102, fill: W_WARM },
  { x: 404, y: 443, w: 196, h: 175, fill: W_WARM },
  { x: 404, y: 626, w: 92, h: 174, fill: W_COOL },
  { x: 504, y: 626, w: 96, h: 174, fill: GREY },
];

/* 黒帯。太さは一本ずつ違え、端まで通さないものを混ぜる */
const BARS: { x: number; y: number; w: number; h: number }[] = [
  { x: 150, y: 0, w: 12, h: 430 },
  { x: 150, y: 690, w: 12, h: 110 },
  { x: 392, y: 443, w: 12, h: 357 },
  { x: 486, y: 0, w: 8, h: 430 },
  { x: 496, y: 626, w: 8, h: 174 },
  { x: 0, y: 180, w: 150, h: 8 },
  { x: 486, y: 286, w: 114, h: 8 },
  { x: 0, y: 430, w: 600, h: 13 },
  { x: 0, y: 690, w: 392, h: 8 },
  { x: 392, y: 618, w: 208, h: 8 },
];

/**
 * ファン・ドースブルフの1919年アルファベット。5段の格子に太い棒だけで組む。
 * 曲線も斜めも持たない書体なので、版面の原則と文字の原則が一致する。
 * D は柱と腹のあいだを1マス空けている。閉じた輪郭にすると O と読めてしまった。
 * ドースブルフの文字はもともと別々の棒を並べて組むので、この空きは様式に合う。
 */
const GLYPH: Record<string, string[]> = {
  D: ["X.XXX", "X...X", "X...X", "X...X", "X.XXX"],
  E: ["XXXXX", "X....", "XXXX.", "X....", "XXXXX"],
  S: ["XXXXX", "X....", "XXXXX", "....X", "XXXXX"],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X.."],
  I: ["X", "X", "X", "X", "X"],
  J: ["...X", "...X", "...X", "X..X", "XXXX"],
  L: ["X....", "X....", "X....", "X....", "XXXXX"],
};

/** 横に連なるマスは1本の矩形にまとめる。高さは 0.6 余分に取って行の継ぎ目を消す */
function blockText(text: string, x: number, y: number, u: number, tag: string) {
  const out: ReactElement[] = [];
  let cx = x;
  for (const ch of text) {
    if (ch === " ") {
      cx += u * 3;
      continue;
    }
    const g = GLYPH[ch];
    g.forEach((row, ri) => {
      let i = 0;
      while (i < row.length) {
        if (row[i] === "X") {
          let j = i;
          while (j < row.length && row[j] === "X") j++;
          out.push(
            <rect
              key={`${tag}-${cx}-${ri}-${i}`}
              x={cx + i * u}
              y={y + ri * u}
              width={(j - i) * u}
              height={u + 0.6}
            />,
          );
          i = j;
        } else i++;
      }
    });
    cx += g[0].length * u + u;
  }
  return out;
}

/** 刷毛あと。色面は平らに見えて、実は縞になっている。濃くすると縞に見えるので極薄で */
function strokes(b: Box | { x: number; y: number; w: number; h: number }, seed: number, vertical: boolean) {
  const r = rand(seed);
  return Array.from({ length: 11 }, (_, i) => {
    const t = r();
    const thick = r(4, 12);
    return vertical ? (
      <rect key={i} x={b.x + t * (b.w - thick)} y={b.y} width={thick} height={b.h} fill="#000" opacity={r(0.008, 0.022)} />
    ) : (
      <rect key={i} x={b.x} y={b.y + t * (b.h - thick)} width={b.w} height={thick} fill="#000" opacity={r(0.008, 0.022)} />
    );
  });
}

export default function Plate() {
  /* 右下に置く 1/10 の設計図。絵が自分の割りを持っている */
  const S = 0.1;
  const MX = 522;
  const MY = 672;

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="デ・ステイル様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {FIELDS.map((f, i) => (
          <rect key={`f${i}`} x={f.x} y={f.y} width={f.w} height={f.h} fill={f.fill} />
        ))}

        {/* 色面だけ刷毛あとを入れる。白の面は紙の目にまかせる */}
        {strokes(FIELDS[2], 4101, true)}
        {strokes(FIELDS[4], 4103, true)}
        {strokes(FIELDS[6], 4102, false)}

        {BARS.map((b, i) => (
          <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={INK} />
        ))}
        {/* 黒帯にも刷毛あと。黒も平らではない */}
        {strokes(BARS[0], 4110, true)}
        {strokes(BARS[7], 4111, false)}

        {/* ── 題字。ドースブルフの格子文字を2段に積む ─────────── */}
        <g fill={INK}>
          {blockText("DE", 30, 488, 13, "a")}
          {blockText("STIJL", 30, 576, 13, "b")}
        </g>

        {/* 雑誌の副題。青の隣の区画に収める。初稿は黒帯に食われて切れた */}
        <g
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="8.5"
          fontWeight="600"
          letterSpacing="1.9"
          opacity="0.66"
        >
          <text x="182" y="752">NIEUWE BEELDING</text>
          <text x="182" y="772">1917 — 1931 LEIDEN</text>
        </g>

        {/* ── 1/10 の設計図。近くで見たときの細部 ───────────── */}
        <g opacity="0.85">
          {FIELDS.map((f, i) =>
            f.fill === RED || f.fill === BLUE || f.fill === YELLOW ? (
              <rect
                key={`mf${i}`}
                x={MX + f.x * S}
                y={MY + f.y * S}
                width={f.w * S}
                height={f.h * S}
                fill={f.fill}
                opacity="0.5"
              />
            ) : null,
          )}
          {BARS.map((b, i) => (
            <rect
              key={`mb${i}`}
              x={MX + b.x * S}
              y={MY + b.y * S}
              width={Math.max(0.9, b.w * S)}
              height={Math.max(0.9, b.h * S)}
              fill={INK}
              opacity="0.55"
            />
          ))}
          <rect x={MX} y={MY} width={60} height={80} fill="none" stroke={INK} strokeWidth="0.7" opacity="0.5" />
          <text
            x={MX}
            y={MY + 92}
            fill={INK}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="6.5"
            fontWeight="600"
            letterSpacing="1.1"
            opacity="0.55"
          >
            SCHEMA 1:10
          </text>
        </g>

        {/* キャンバスの目。油彩なので紙ではなく布の繊維を薄く敷く */}
        <rect
          width="600"
          height="800"
          filter={`url(#${ATLAS.fibre})`}
          opacity="0.08"
          style={{ mixBlendMode: "multiply" }}
        />
        <rect
          width="600"
          height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.13"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
