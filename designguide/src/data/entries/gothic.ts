import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "gothic",
  ja: "ゴシック・デザイン",
  en: "Gothic Design",
  era: "12世紀–",
  origin: "ヨーロッパ",
  category: "movement",

  tagline: "石を細くして、壁を光の色ガラスに置き換えた",

  description:
    "ロマネスクの分厚い壁は、屋根の重さを面で受けていた。" +
    "尖頭アーチとリブヴォールト、外へ張り出す飛梁がその重さを線に集めるようになると、壁は支える役目から解放される。" +
    "空いた場所へ入れたのがステンドグラスで、以後この様式は「石を細く、面を光に」だけを繰り返した。" +
    "写本の頁もこれと同じ骨格を持っている。縦画の太いブラックレターを詰めて二段に組み、余った縁は蔓草と怪物で埋める。",

  traits: [
    "尖頭アーチで、すべてを上へ引き伸ばす",
    "柱を束ね、骨だけ残して面を抜く",
    "抜いた面を色ガラスの小片で割る",
    "文字はブラックレター。縦画を太く詰める",
    "縁は蔓草と怪物で最後まで埋める",
  ],

  avoid: [
    "半円アーチと水平の安定（ロマネスク）",
    "左右対称で重心を低くすること",
    "黒一色のホラー寄りの意匠",
  ],

  palette: ["#1a1420", "#6b1f3a", "#2a4a7a", "#c9a227", "#e8e2d6"],

  prompt: {
    core: "Gothic design, pointed arch tracery, illuminated manuscript",
    texture:
      "leaded stained glass with visible cames, gold leaf illumination on vellum, carved limestone relief, blackletter woodblock impression, fine pen hatching",
    palette:
      "deep aubergine-violet ground, wine oxblood red, lapis cobalt blue, burnished gold leaf, bone parchment white; jewel saturation, no pastels",
    composition:
      "strong vertical emphasis with the frame taller than wide, a pointed lancet arch enclosing the whole field, radial rose-window symmetry in the top third, compressed two-column text block below, marginal border of interlaced vines and grotesques on all four sides, backlit glow through the glass",
    negative:
      "no round romanesque arches, no horizontal symmetry, no pastel colours, no modern sans-serif type, no bats or halloween kitsch, no smooth gradients, no photorealistic rendering",
  },

  related: ["gothic-botanical", "victorian", "art-nouveau", "baroque"],
};
