import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "eco-brutalism",
  ja: "エコ・ブルータリズム",
  en: "Eco Brutalism",
  era: "2010s–",
  origin: "建築",
  category: "movement",

  tagline: "打ち放しの塊を、垂れ下がる緑に飲み込ませる",

  description:
    "実在の建物より先に、SNSを流れるCGパースとして広まった様式である。" +
    "ブルータリズムの重い灰色に植物を後から絡ませ、人間が作った硬いものを自然が回収していく、という願望を一枚の絵にした。" +
    "だから緑は刈り込まれた庭ではなく、縁から垂れて溢れる。" +
    "コンクリートは常に濡れていて、苔と雨だれの筋が入る。廃墟の湿気を、まだ人が住んでいる建物の上でやってみせる矛盾が、この様式の見どころになっている。",

  traits: [
    "打ち放しコンクリートに苔と雨だれの筋",
    "緑は刈らず、縁から垂らして溢れさせる",
    "開口部をシダとモンステラで半分ふさぐ",
    "霧か雨上がりの、湿った拡散光にする",
    "葉を透かした木漏れ日の斑を壁に落とす",
  ],

  avoid: [
    "手入れの行き届いた芝生と植栽",
    "乾いた快晴の強い直射日光",
    "彩度の高い花を混ぜること",
  ],

  palette: ["#b9b4a8", "#6e7f5c", "#3d3a34", "#d6d1c4", "#2a2a26"],

  prompt: {
    core: "eco-brutalist architecture, concrete overgrown with vegetation",
    texture:
      "board-formed concrete with moss colonies in the seams, damp water-staining, cascading vines, monstera and fern fronds, wet stone sheen, volumetric humid haze",
    palette:
      "cool cement grey base, deep olive and moss green as the only chroma, damp charcoal shadow, pale bone concrete highlight; low saturation throughout",
    composition:
      "a heavy concrete slab framing the top of the shot with planting spilling over every edge, vegetation covering roughly 40 percent of the facade, openings half-blocked by foliage, dappled leaf-shadow falling across the concrete, misty overcast or post-rain light, low wide-angle view with the horizon in the lower third",
    negative:
      "no manicured lawn, no clipped hedges, no bright flowers, no hard blue-sky sunlight, no glass towers, no saturated colour, no dry desert setting, no tidy landscaping",
  },

  related: ["brutalism", "wabi-sabi", "liminal-space", "minimalism"],
};
