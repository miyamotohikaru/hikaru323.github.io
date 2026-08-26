import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "dreamcore",
  ja: "ドリームコア",
  en: "Dreamcore",
  era: "2019–",
  origin: "インターネット",
  category: "internet",

  tagline: "夢で見た景色の質。懐かしくて、どこか一つだけ間違っている",

  description:
    "リミナルスペースと同じ2019年ごろのネットから、別の枝として伸びた。" +
    "あちらが「誰もいない現実の空間」なら、こちらは「夢の論理で組み立てた空間」だ。" +
    "低画質の写真を加工し、浮かぶ目玉、切り抜きのスマイル、矢印、光る手書き文字、二つある月を、" +
    "遠近も影も無視して貼り付ける。" +
    "効かせどころは、懐かしさと違和感を同じ画面に同居させること。" +
    "子供の頃に見た教育番組やゲームの背景に似ているのに、辻褄がどこか一箇所だけ合わない。" +
    "夢から覚めた直後の、あの説明できない感じを絵にしている。",

  traits: [
    "低画質の写真に切り抜き素材を直に貼る",
    "目玉・スマイル・矢印を影なしで浮かせる",
    "空はパステルの紫〜桃。月を二つ描く",
    "影と遠近を意図的に食い違わせる",
    "光る手書き文字を画面の隅に小さく置く",
  ],

  avoid: [
    "黄ばんだ無人の実空間として撮ること",
    "整った高画質と正しい遠近",
    "明確な物語や説明を与えること",
  ],

  palette: ["#1a1030", "#8a6bd6", "#f2a7d8", "#7be0e8", "#f5efe0"],

  prompt: {
    core: "dreamcore, dream-logic collage, nostalgic surreal photo edit",
    texture:
      "low-resolution digital photo upscaled soft, heavy bloom and glow, chromatic halo around the light sources, hard-edged cut-out clip art pasted on top, 1998 web-graphic sparkle, mismatched grain between layers",
    palette:
      "deep violet night #1a1030, lilac #8a6bd6, cotton-candy pink #f2a7d8, mint cyan #7be0e8, warm cream #f5efe0 glow; pastel, heavily bloomed, no neutral grey",
    composition:
      "a wide empty field or plain interior across the lower half, an impossible sky above holding two moons and layered pastel clouds, cut-out eyes and a smiley scattered at three depths with no shadows, one arrow or hand-drawn glowing caption in the lower-left corner, the pasted elements deliberately in the wrong perspective for the background",
    negative:
      "no yellowed empty corridors, no correct perspective, no consistent shadows, no photorealistic render, no gore, no cinematic colour grade, no coherent narrative, no sharp high-resolution detail",
  },

  related: ["liminal-space", "vaporwave", "surrealism", "pop-surrealism"],
};
