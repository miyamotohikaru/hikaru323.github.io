import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "glassmorphism",
  ja: "グラスモーフィズム",
  en: "Glassmorphism",
  era: "2020–",
  origin: "UI",
  category: "screen",

  tagline: "背景をぼかして透かす。板が浮いていることだけ伝える",

  description:
    "背景の情報量が増えたことへの答えとして出てきた。" +
    "壁紙もグラデーションも写真も動画も画面の奥で動くようになると、不透明のパネルを置けば奥が全部隠れ、そのまま透かせば文字が読めない。" +
    "ならば奥をぼかしたまま残す。" +
    "リアルタイムのガウスぼかしが全端末で安く回るようになった2017年以降、MicrosoftのAcrylicとmacOS Big Surがこれを標準にした。" +
    "板があることは、縁の1pxの明るい線と、わずかな白の重ねだけで示す。" +
    "だから奥に彩度の高い色が無いと、この様式は成立しない。",

  traits: [
    "奥を半径20〜40pxのガウスでぼかす",
    "板は白を8〜20%重ねただけの半透明",
    "縁に1pxの白い線を入れて厚みを出す",
    "奥に彩度の高い色斑を必ず置く",
    "角丸を大きく取り、板を複数枚ずらして重ねる",
  ],

  avoid: [
    "背景を単色で塗ること",
    "板に硬い影を落とすこと",
    "ぼかさずに透明度だけ下げること",
  ],

  palette: ["#16214a", "#7aa2ff", "#b98cff", "#ffffff", "#0a0f24"],

  prompt: {
    core: "glassmorphism UI panel, frosted acrylic, backdrop blur",
    texture:
      "translucent frosted glass with a 30px gaussian backdrop blur, 12% white fill, a 1px semi-transparent white inner border along the top and left edges, fine noise dithering across the glass, faint specular sheen",
    palette:
      "deep navy ground (#0a0f24 to #16214a) with saturated blurred orbs of periwinkle (#7aa2ff) and violet (#b98cff) sitting behind the panel, pure white (#ffffff) type and hairlines; all colour comes from the blurred backdrop, none from the panel",
    composition:
      "two or three rounded rectangles at 24px radii, floating and offset so they overlap and blur one another, a vivid multi-colour gradient mesh behind them, the panel group occupying the centre 60% of the frame, medium-weight white sans-serif type, a soft ambient shadow rather than a hard drop shadow, depth read purely through layered translucency",
    negative:
      "no flat opaque panels, no solid single-colour background, no hard drop shadows, no skeuomorphic texture, no low-saturation backdrop, no transparency without blur",
  },

  related: ["aurora-ui", "frutiger-aero", "neumorphism", "liquid-design"],
};
