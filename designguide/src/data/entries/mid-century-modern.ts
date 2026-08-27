import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "mid-century-modern",
  ja: "ミッドセンチュリー・モダン",
  en: "Mid-Century Modern",
  era: "1945–1969",
  origin: "アメリカ",
  category: "movement",

  tagline: "戦争で覚えた成形技術を、居間の椅子に使った",

  description:
    "航空機の部品や負傷兵の添え木のために磨かれた成形合板・FRP・アルミの技術が、平和になって行き場を探した。" +
    "同じ頃に郊外の住宅が一斉に建ち、安くて軽くて明るい家具が大量に要る。" +
    "この二つが噛み合って、脚は細く末広がりに、座面は身体に沿う有機的な曲面になり、木の温もりと工業素材が一脚の中に同居した。" +
    "グラフィックの側はその楽観を、カラシとティールとオレンジのざらついた版で刷っている。",

  traits: [
    "先細りの細い脚を斜めに開いて立てる",
    "有機的な曲面と直線を一つの形に同居させる",
    "カラシ・ティール・オレンジ・チーク色で組む",
    "版画のようなざらつきを面に敷く",
    "生き物や葉を単純な図形に約めて描く",
  ],

  avoid: [
    "太く重い脚と分厚い座面",
    "光沢のあるクロームと鏡面",
    "蛍光色と高彩度のビビッドカラー",
  ],

  palette: ["#efe7d6", "#d9822b", "#2f6f6a", "#c4452e", "#2b2820"],

  prompt: {
    core: "mid-century modern design, 1950s American modernism",
    texture:
      "moulded plywood and fibreglass shells, walnut and teak grain, screen-printed flat inks with visible paper tooth, slight offset mis-registration, matte finish, no gloss",
    palette:
      "warm cream ground, mustard ochre and burnt orange, deep teal green, brick red accent, dark walnut brown outline; muted and slightly dusty, never fluorescent",
    composition:
      "a low horizontal furniture silhouette against a plain flat wall, splayed tapered legs leaving the floor visible underneath, one tall vertical element such as a plant or lamp at the right third, asymmetric balance with roughly 55 percent empty field on the left, simplified flat flora and birds, sans-serif type set on a single line",
    negative:
      "no chrome mirror finish, no ornate carving, no fluorescent colour, no glossy plastic, no gradients, no Victorian pattern, no photorealistic rendering, no heavy shadow",
  },

  related: ["scandinavian", "streamline-moderne", "bauhaus", "japandi"],
};
