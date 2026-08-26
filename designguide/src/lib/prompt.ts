/**
 * プロンプトの組み立て。
 *
 * 参考にしているのは、Xの中国語圏のプロンプト職人が書いている
 * 「写真→デザインポスター変換」の指示文。あれが効いているのは、
 * 詩的だからではなく **比率・色名・技法・禁止事項を数で指定している** から。
 *   例:「全体を4:3の横長構成とし、左側は画面の約58%を占め…」
 *     「ライトパステルブルー、ミストブルー、アイボリーホワイトで主な要素を…」
 *     「カートゥーン、サイバーパンク、Logo、水印、タイトルを禁止します」
 *
 * だからここでも、書き手の気分ではなく **仕様書** として組み立てる。
 * 章立てを固定し、各章に必ず具体が入るようにしてある。
 */

import type { DesignStyle } from "@/data/types";

/** 判型。比率は必ず本文に書き出す。モデルは比率を言われないと勝手に正方形にする */
export const FORMATS = {
  poster: { ja: "ポスター（縦）", ratio: "3:4", en: "vertical poster", note: "縦位置。天地に余白を残す" },
  square: { ja: "SNS（正方形）", ratio: "1:1", en: "square social post", note: "正方形。四隅まで意図して埋める" },
  story: { ja: "ストーリー（縦長）", ratio: "9:16", en: "vertical story", note: "縦長。中央に重心を置く" },
  wide: { ja: "ヘッダー・壁紙（横長）", ratio: "16:9", en: "wide banner", note: "横長。左右に視線を流す" },
  card: { ja: "ポストカード（横）", ratio: "4:3", en: "horizontal postcard", note: "横位置。地平を1本通す" },
  cover: { ja: "書影・ジャケット", ratio: "2:3", en: "book or album cover", note: "縦。題字の場所を先に決める" },
} as const;

export type FormatKey = keyof typeof FORMATS;
export const FORMAT_KEYS = Object.keys(FORMATS) as FormatKey[];

/** 追加で効かせる調子。参考実例でいう「癒し」「素雅」にあたる */
export const MOODS = {
  none: { ja: "指定なし", en: "" },
  calm: { ja: "静か・余白多め", en: "quiet and restrained, generous negative space, low visual density" },
  bold: { ja: "力強い・密度高め", en: "bold and high-contrast, dense composition, strong focal mass" },
  warm: { ja: "あたたかい・手仕事感", en: "warm and handmade, visible craft, slightly imperfect edges" },
  cool: { ja: "涼しい・精密", en: "cool and precise, engineered accuracy, clean edges" },
  nostalgic: { ja: "懐かしい・退色", en: "nostalgic and faded, aged paper, slightly washed-out inks" },
  luxe: { ja: "上質・高級", en: "refined and premium, restrained palette, exquisite finish" },
} as const;

export type MoodKey = keyof typeof MOODS;
export const MOOD_KEYS = Object.keys(MOODS) as MoodKey[];

export type BuildInput = {
  style: DesignStyle;
  /** 何を描くか。空なら様式そのものを主題にする */
  subject: string;
  format: FormatKey;
  mood: MoodKey;
  /** 画面に入れる文字。空なら文字なし */
  text: string;
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

/* ────────────────────────────────────────────────────────────────
   日本語の仕様書。ChatGPT / Gemini / Claude に貼る用
   ──────────────────────────────────────────────────────────────── */
export function composeJa(i: BuildInput): string {
  const { style: s } = i;
  const f = FORMATS[i.format];
  const mood = MOODS[i.mood];
  const subject = clean(i.subject) || `${s.ja}の様式そのもの`;
  const text = clean(i.text);

  const L: string[] = [];
  L.push("以下の仕様どおりに、画像を1枚だけ生成してください。");
  L.push("");
  L.push("■ 主題");
  L.push(subject);
  L.push("");
  L.push("■ 様式");
  L.push(`${s.ja}（${s.en}／${s.era}・${s.origin}）`);
  if (s.tagline) L.push(s.tagline + "。");
  if (s.prompt.core) L.push(s.prompt.core);
  L.push("");

  if (s.traits.length) {
    L.push("■ 見た目の決め手（すべて満たすこと）");
    s.traits.forEach((t, n) => L.push(`${n + 1}. ${t}`));
    L.push("");
  }

  L.push("■ 技法・質感");
  L.push(s.prompt.texture || `${s.en}本来の画材と刷り味を再現する。`);
  if (mood.ja && i.mood !== "none") L.push(`全体の調子は「${mood.ja}」に寄せる。`);
  L.push("");

  L.push("■ 色");
  L.push(`次の5色を軸にする（この5色から作った濃淡は可。別の色相は足さない）：`);
  L.push(s.palette.join(" / "));
  if (s.prompt.palette) L.push(s.prompt.palette);
  L.push("");

  L.push("■ 構図");
  L.push(`${f.ratio}の${f.ja}。${f.note}。`);
  if (s.prompt.composition) L.push(s.prompt.composition);
  L.push("");

  L.push("■ 文字");
  if (text) {
    L.push(`画面に「${text}」を入れる。`);
    L.push("書体はこの様式の時代・地域に合ったものを選ぶこと。");
    L.push("文字は絵の一部として置き、絵の主役を隠さない位置に収める。");
    L.push("指定した文字以外の文章・説明・ロゴ・透かしを足さないこと。");
  } else {
    L.push("文字・ロゴ・透かし・署名を一切入れない。");
  }
  L.push("");

  L.push("■ 禁止");
  const ng: string[] = [];
  if (s.avoid.length) ng.push(...s.avoid);
  ng.push("複数の案を1枚に並べたコラージュ（1枚だけ出力する）");
  ng.push("枠線・額縁・余白のマット（画面いっぱいに描く）");
  ng.push("UIの部品・スマホの枠・モックアップの見せ方");
  ng.push("実在する企業・作品のロゴや商標");
  ng.forEach((n) => L.push(`・${n}`));
  if (s.prompt.negative) L.push(s.prompt.negative);

  return L.join("\n");
}

/* ────────────────────────────────────────────────────────────────
   英語の1文。Midjourney / Stable Diffusion / Flux に貼る用
   ──────────────────────────────────────────────────────────────── */
export function composeEn(i: BuildInput): string {
  const { style: s } = i;
  const f = FORMATS[i.format];
  const mood = MOODS[i.mood];
  const subject = clean(i.subject) || `an emblematic composition of the ${s.en} style`;
  const text = clean(i.text);

  const parts = [
    subject,
    `in the style of ${s.en}`,
    s.prompt.core,
    s.prompt.texture,
    s.prompt.palette,
    `palette anchored on ${s.palette.join(", ")}`,
    s.prompt.composition,
    `${f.en}, ${f.ratio} aspect ratio`,
    mood.en,
    text ? `the words "${text}" set in period-appropriate type, integrated into the artwork` : "no text, no lettering, no watermark",
  ].filter(Boolean).map(clean);

  const negative = [
    s.prompt.negative,
    "no collage of multiple variations, single image only",
    "no borders, no frames, no matte",
    "no UI chrome, no device mockup",
    "no brand logos, no trademarks",
    text ? "" : "no typography",
  ].filter(Boolean).map(clean).join(", ");

  return `${parts.join(", ")}\n\n— Negative: ${negative}`;
}

/** 短い1行。語だけ欲しいとき */
export function composeShort(s: DesignStyle): string {
  return clean([s.prompt.core, s.prompt.texture, s.prompt.palette].filter(Boolean).join(", "));
}
