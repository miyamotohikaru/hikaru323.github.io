import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "streamline-moderne",
  ja: "ストリームライン・モダン",
  en: "Streamline Moderne",
  era: "1930s",
  origin: "アメリカ",
  category: "movement",

  tagline: "止まっている物にまで、風を切る形を着せた",

  description:
    "大恐慌で物が売れなくなったアメリカに、産業デザイナーという職業が生まれ、売れる形を発明した。" +
    "それが風洞から借りてきた流線形で、飛行機や機関車はもちろん、冷蔵庫にも鉛筆削りにもビルにも、同じ丸みを着せてしまう。" +
    "角を落とし、水平の三本線を側面に走らせ、クロームの帯で縁を締めると、その物は未来から来たように見えた。" +
    "アール・デコが装飾で新しさを示したのに対し、こちらは速く見えることだけで新しさを証明している。",

  traits: [
    "角を大きな丸みに落として一体にする",
    "水平の三本線を側面に走らせる",
    "クロームの帯で縁を締める",
    "丸窓とガラスブロックを混ぜる",
    "金属をつや消し寄りに、柔らかく光らせる",
  ],

  avoid: [
    "鋭い角と直線的なエッジ",
    "ジグザグや日輪の装飾（アール・デコ）",
    "蛍光色とネオンの発光",
  ],

  palette: ["#e4e6e3", "#7a8f99", "#c0392b", "#d9b26a", "#2b3138"],

  prompt: {
    core: "Streamline Moderne, 1930s aerodynamic industrial design",
    texture:
      "brushed aluminium and chrome banding, curved bakelite, glass block, satin-lacquered steel, airbrushed gouache with soft graded highlights, no grime",
    palette:
      "pale silver-grey ground, steel blue-grey body, one deep signal red, warm brass-gold trim, dark navy-charcoal shadow",
    composition:
      "long horizontal format with rounded corners on every mass, three parallel speed lines running off the right edge, low three-quarter view suggesting forward motion, porthole windows in a row, a chrome band separating body from base, condensed geometric sans lettering placed on that horizontal band",
    negative:
      "no sharp corners, no zigzag or sunburst ornament, no fluorescent colour, no gothic detail, no visible rivets or weathering, no photorealistic dirt, no vertical emphasis",
  },

  related: ["art-deco", "retrofuturism", "dieselpunk", "mid-century-modern"],
};
