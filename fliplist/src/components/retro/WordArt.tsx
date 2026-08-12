/* 会社HP（kosukuma.com）の見出し画像を、画像を使わずに組む部品。
 *
 * 手本は 4 枚。実測値はすべてこのファイルの中に書いてある。
 *   public/hp/ttl.gif            773x117  「株式会社こす.くま」 金グラデ＋白縁＋やわらかい灰の落ち影
 *   public/hp/heading-company.png 2167x256 「株式会社こす.くま」 #00FF00 ＋ 黒の細い縁（落ち影なし）
 *   public/hp/heading-flip.png    2273x256 「FLIP事業について」  #00FFFF ＋ #FF0000 の縁（落ち影なし）
 *   public/hp/ttl_news.gif        150x40   「最新情報」          緑グラデ＋白縁（落ち影なし）
 *
 * 縁は -webkit-text-stroke ではなく text-shadow を 16 方向へ重ねてつくる。
 * text-stroke は字の内側へ半分食い込むので、手本のように「外側だけ」太らせられない。
 * 16 方向なら円の内接多角形の誤差が cos(11.25°)=98.1% で、縁の太さのむらは 2% 未満。
 *
 * 落ち影は filter: drop-shadow() を縁の層にかける。text-shadow で足すと「字の影」に
 * なるが、手本は「縁まで含めた形の影」なので、縁を描いたあとの絵に対してぼかす。
 *
 * 自己完結。globals.css には触らない。React 19 の <style href precedence> で
 * head に一度だけ上がる（同じ href は重複排除される）。 */

import type { CSSProperties, ElementType, ReactNode } from "react";

export type WordArtVariant = "gold" | "lime" | "cyan" | "green";

/* ── 実測値 ──────────────────────────────────────────────────────────

   縁の太さは font-size に対する比（em）。手本の実測から出した:
     gold  ttl.gif            白縁 3.5px / 字の高さ 68px  → 0.045em
     lime  heading-company    黒縁 3.3px / 字の高さ 248px → 0.012em
     cyan  heading-flip       赤縁 7.0px / 字の高さ 252px → 0.024em
     green ttl_news.gif       白縁 1.8px / 字の高さ 38px  → 0.042em
   （字の高さ ≒ 0.88em として換算。em に持たせたので級数を落としても比は崩れない）

   grad の位置は「字面の上端=0 / 下端=1」。line box ではなく字の高さを基準に
   測ったので、実際の背景ボックスへは buildFill() で写しなおす。 */

type Stop = readonly [pos: number, color: string];

type Spec = {
  /** 塗り。1 色なら color、2 色以上なら background-clip:text の縦グラデ */
  readonly fill: string | readonly Stop[];
  /** 縁の色 */
  readonly line: string;
  /** 縁の太さ（em） */
  readonly lineEm: number;
  /** 落ち影。手本に無いものは null */
  readonly shadow: { readonly x: number; readonly y: number; readonly blur: number; readonly color: string } | null;
  /** 字の太さ。手本 4 枚はそれぞれ別の WordArt なので太さがそろっていない */
  readonly weight: number;
  /** 横への伸び。手本の字面の縦横比から出した */
  readonly wide: number;
};

const SPECS: Record<WordArtVariant, Spec> = {
  // ttl.gif。上が濃い山吹、真ん中がいちばん明るい黄、下がまた山吹に落ちる
  gold: {
    fill: [
      [0.0, "#fd9e03"],
      [0.12, "#fd9e03"],
      [0.2, "#fdba02"],
      [0.3, "#fed602"],
      [0.4, "#fdef01"],
      [0.5, "#fff701"],
      [0.62, "#fff701"],
      [0.72, "#fee401"],
      [0.82, "#feda01"],
      [0.9, "#fdca02"],
      [1.0, "#febf02"],
    ],
    line: "#ffffff",
    lineEm: 0.045,
    // 実測: いちばん濃いところで黒 40% 程度、字の高さの 12% ぶん右下へ広がる
    shadow: { x: 0.03, y: 0.045, blur: 0.035, color: "rgba(86,84,76,0.55)" },
    weight: 700,
    wide: 1.0,
  },

  // heading-company.png。純緑に黒の細い縁だけ。影は本当に無い
  lime: {
    fill: "#00ff00",
    line: "#000000",
    lineEm: 0.012,
    shadow: null,
    weight: 500,
    wide: 1.01,
  },

  // heading-flip.png。純シアンに純赤の縁。影は本当に無い
  cyan: {
    fill: "#00ffff",
    line: "#ff0000",
    lineEm: 0.024,
    shadow: null,
    weight: 400,
    wide: 1.09,
  },

  // ttl_news.gif。上が明るい緑、下へ深緑。白縁。影は無い
  green: {
    fill: [
      [0.0, "#2aaf20"],
      [0.3, "#1c9e13"],
      [0.5, "#129409"],
      [0.7, "#118d08"],
      [0.85, "#0d7006"],
      [1.0, "#0a6404"],
    ],
    line: "#ffffff",
    lineEm: 0.042,
    shadow: null,
    weight: 700,
    wide: 1.0,
  },
};

/* ── 字面の位置 ──────────────────────────────────────────────────────
   グラデを「字面の帯」にぴったり載せるための座標。Hiragino Sans を
   canvas.measureText で実測した値から出している（100px, italic）:
     fontBoundingBoxAscent 88 / Descent 12（em ボックス 100）
     和文の字面 actualBoundingBoxAscent 84.5 / Descent 9.0
   ベースラインは line box の上端から (LH - 1)/2 + 0.88 em の位置。 */
const LH = 1.06; // line-height
const BASELINE = (LH - 1) / 2 + 0.88; // 0.91em
const INK_TOP = BASELINE - 0.845; // 字面の上端 0.065em
const INK_BOT = BASELINE + 0.09; // 字面の下端 1.000em
/* 背景ボックスは 2em ぶん確保して -0.5em からはじめる。こうすると欧文の
   下に出る部分（p, g, y）まで塗りが届き、no-repeat でも欠けない。 */
const BOX_TOP = -0.5;
const BOX_H = 2;

function buildFill(stops: readonly Stop[]): string {
  const a = (INK_TOP - BOX_TOP) / BOX_H;
  const b = (INK_BOT - BOX_TOP) / BOX_H;
  const body = stops
    .map(([p, c]) => `${c} ${((a + p * (b - a)) * 100).toFixed(2)}%`)
    .join(",");
  return `linear-gradient(180deg,${body})`;
}

/* ── 縁のリング ──────────────────────────────────────────────────────
   16 方向。横方向だけ 1/scaleX しておくので、あとで横に引き伸ばしても
   縁の太さは一周ぶん均一になる。 */
const RING = Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI * 2) / 16;
  const cx = Number(Math.cos(a).toFixed(4));
  const cy = Number(Math.sin(a).toFixed(4));
  return `calc(var(--wa-rx) * ${cx}) calc(var(--wa-ry) * ${cy}) 0 var(--wa-line)`;
}).join(",");

/* shadow を明示的に付けたいと言われたときの影。ttl.gif から借りる */
const FALLBACK_SHADOW = SPECS.gold.shadow!;

const FONT =
  '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","YuGothic","MS PGothic","MS Gothic",sans-serif';

const CSS = `
.wa{
  display:inline-block;
  position:relative;
  font-family:${FONT};
  font-weight:var(--wa-weight);
  font-style:italic;
  font-size:var(--wa-size);
  line-height:${LH};
  letter-spacing:var(--wa-ls);
  white-space:pre-wrap;
  transform:scaleX(var(--wa-sx));
  transform-origin:0 50%;
  /* globals.css が body に font-smoothing:none を敷いているので打ち消す。
     手本はアンチエイリアスが効いていて、切ると縁がガタガタになる */
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  font-smooth:always;
  --wa-rx:calc(var(--wa-line-w) / var(--wa-sx));
  --wa-ry:var(--wa-line-w);
}
/* 縁と落ち影の層。字は下の .wa__face が本物なので、こちらは読み上げも選択もさせない */
.wa__ink{
  position:absolute;
  left:0; top:0; width:100%;
  color:var(--wa-line);
  text-shadow:${RING};
  filter:var(--wa-filter);
  pointer-events:none;
  -webkit-user-select:none;
  user-select:none;
}
/* 本物の文字。選択もできるし検索にも当たる */
.wa__face{
  position:relative;
  color:var(--wa-fill-color);
}
.wa__face.wa--grad{
  color:transparent;
  -webkit-text-fill-color:transparent;
  background-image:var(--wa-fill-image);
  background-repeat:no-repeat;
  background-size:100% ${BOX_H}em;
  background-position:0 ${BOX_TOP}em;
  -webkit-background-clip:text;
  background-clip:text;
}
`;

export type WordArtProps = {
  children: ReactNode;
  /** gold / lime / cyan / green。手本の 4 種 */
  variant?: WordArtVariant;
  /** font-size（px）。縁の太さと影のずれはこれに比例する */
  size?: number;
  /** 落ち影を出すか。省略すると手本どおり（gold だけ出る） */
  shadow?: boolean;
  /** 縁の太さの倍率。手本より太く／細くしたいときだけ */
  strokeScale?: number;
  /** 字の太さ。省略すると variant ごとの手本の太さ */
  weight?: number;
  /** 字送り（em）。詰めたいときは負の値 */
  tracking?: number;
  /** 横への引き伸ばし。省略すると variant ごとの手本の縦横比 */
  wide?: number;
  /** 出力するタグ。見出しなら "h1" / "h2" を渡す */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

export default function WordArt({
  children,
  variant = "gold",
  size = 48,
  shadow,
  strokeScale = 1,
  tracking = 0,
  wide,
  weight,
  as: Tag = "span",
  className,
  style,
}: WordArtProps) {
  const spec = SPECS[variant];
  const grad = typeof spec.fill !== "string";
  const sh = (shadow ?? spec.shadow !== null) ? (spec.shadow ?? FALLBACK_SHADOW) : null;
  const sx = wide ?? spec.wide;

  const vars = {
    "--wa-size": `${size}px`,
    "--wa-weight": weight ?? spec.weight,
    "--wa-line": spec.line,
    "--wa-line-w": `${(spec.lineEm * strokeScale).toFixed(4)}em`,
    "--wa-ls": `${tracking}em`,
    "--wa-sx": sx,
    "--wa-fill-color": grad ? "transparent" : (spec.fill as string),
    "--wa-fill-image": grad ? buildFill(spec.fill as readonly Stop[]) : "none",
    "--wa-filter": sh
      ? `drop-shadow(${(sh.x / sx).toFixed(4)}em ${sh.y}em ${sh.blur}em ${sh.color})`
      : "none",
    ...style,
  } as CSSProperties;

  return (
    <Tag
      className={className ? `wa ${className}` : "wa"}
      style={vars}
      data-wa={variant}
    >
      <style href="retro-wordart" precedence="default">
        {CSS}
      </style>
      <span className="wa__ink" aria-hidden="true">
        {children}
      </span>
      <span className={grad ? "wa__face wa--grad" : "wa__face"}>{children}</span>
    </Tag>
  );
}
