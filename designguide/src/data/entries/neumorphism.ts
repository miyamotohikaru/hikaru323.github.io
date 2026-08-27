import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "neumorphism",
  ja: "ニューモーフィズム",
  en: "Neumorphism",
  era: "2019–2021",
  origin: "UI",
  category: "screen",

  tagline: "背景と同じ色のまま、下から押し出したように盛る",

  description:
    "2018年末、一枚のDribbble投稿から一気に広がった。" +
    "フラットデザインが行き着いて画面が完全な一枚の平面になったところへ、立体感は戻したい、けれど革や金属の時代には戻りたくない、という折衷案だった。" +
    "仕掛けは単純で、部品と背景をまったく同じ色にしたうえで、左上に白い影、右下に暗い影を置く。" +
    "それだけで、面が布の下から押し上げられたように見える。" +
    "ただし部品と地の明度差が原理的にほぼ無いので、輪郭が読めない人が出る。実務では2年ほどで退いた。",

  traits: [
    "部品と背景をまったく同じ色にする",
    "左上に白、右下に暗い影の二重ドロップ",
    "凹ませる時は同じ2つの影を内側へ反転する",
    "地は明度90%前後の淡いグレー1色で通す",
    "角丸を大きく取り、境界線は引かない",
  ],

  avoid: [
    "部品の色を背景と変えること",
    "濃い色・高彩度の面を作ること",
    "部品ごとに影の向きを変えること",
  ],

  palette: ["#e6e7ee", "#ffffff", "#c8cad4", "#5a6b8c", "#3a3f52"],

  prompt: {
    core: "neumorphic UI, soft extruded surface, dual-shadow embossing",
    texture:
      "matte plastic-under-fabric surface, perfectly smooth, no noise, no gradient other than the falloff of the two shadows",
    palette:
      "one single tint throughout — pale blue-grey (#e6e7ee) for both background and controls, a pure white (#ffffff) highlight shadow at the upper left and cool grey (#c8cad4) shadow at the lower right, slate blue (#5a6b8c) as the only accent, charcoal (#3a3f52) type",
    composition:
      "controls exactly the same colour as the background, every shape carrying a 10px white shadow offset -6px/-6px and a 10px grey shadow offset +6px/+6px, light fixed at the upper left for all elements, 24px corner radii, pressed states using those same two shadows inset, no strokes or dividers, wide even spacing",
    negative:
      "no borders or outlines, no coloured fills, no dark background, no gradient across the surface, no texture, no varying light direction, no high-contrast elements",
  },

  related: ["skeuomorphism", "flat-design", "claymorphism", "glassmorphism"],
};
