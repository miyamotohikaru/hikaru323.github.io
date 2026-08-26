import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "retrofuturism",
  ja: "レトロフューチャリズム",
  en: "Retrofuturism",
  era: "1950s–",
  origin: "アメリカ",
  category: "movement",

  tagline: "来なかった明日。1950年代が信じた空飛ぶ車",

  description:
    "万国博覧会の展示館と、1950年代アメリカの雑誌広告が原型にある。" +
    "原子力とロケットが暮らしを楽にすると本気で信じられていた時期の、「明日の世界」の描き方だ。" +
    "この様式の特徴は、形が機能から出ていないことにある。" +
    "尾翼、涙滴形、輪の付いた球体といった速そうな形が、必要のない冷蔵庫やトースターにまで付く。" +
    "版はオフセットの平塗りで、空はいつも晴れ、人物は正面を向いて笑っている。" +
    "その未来が来なかったと知っている今、この楽観そのものが懐古の対象になった。",

  traits: [
    "尾翼・涙滴形・輪の付いた球体で組む",
    "オフセット広告の平塗りと粗い網点",
    "空色・朱・クリーム・からし色の四色",
    "人物は正面向きで笑い、指で示す",
    "地平線は低く、空を広く取る",
  ],

  avoid: [
    "ブラウン管とベージュ樹脂の質感",
    "薄暗い廃墟・ディストピア",
    "写実的な3Dレンダリング",
  ],

  palette: ["#e8e2d0", "#3a6ea5", "#d9542b", "#f2c14e", "#1f2933"],

  prompt: {
    core: "retrofuturism, 1950s world of tomorrow illustration",
    texture:
      "mid-century offset advertising print, flat gouache-like fills, visible coarse halftone dots, slight plate misregistration, aged cream paper stock, airbrushed chrome highlights",
    palette:
      "sky blue, cream ivory, atomic tangerine orange, mustard yellow, deep teal shadows; warm and optimistic, no muddy neutrals",
    composition:
      "horizon low in the bottom 25 percent with a wide open sky above, a streamlined teardrop vehicle sweeping in from frame left, Googie cantilevered architecture with starburst motifs in the middle ground, smiling family figures in the lower right third gesturing upward, thin white keyline around the main subject",
    negative:
      "no photorealism, no 3D rendering, no neon, no dystopian ruins, no beige computer terminals, no CRT scanlines, no grunge texture, no desaturated palette",
  },

  related: ["cassette-futurism", "mid-century-modern", "streamline-moderne", "pop-art"],
};
