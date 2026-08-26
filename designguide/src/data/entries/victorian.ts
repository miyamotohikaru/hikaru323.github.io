import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "victorian",
  ja: "ヴィクトリアンデザイン",
  en: "Victorian Design",
  era: "1837–1901",
  origin: "イギリス",
  category: "movement",

  tagline: "産業革命の余力で、余白という余白を埋め尽くす",

  description:
    "印刷と量産が急に安くなった時代、装飾は持てる者の証から、誰でも買えるものへ変わった。" +
    "石版の多色刷りが安くなり、金の刷りまで大量に使えるようになったからである。" +
    "だから商品ラベルにも劇場の広告にも、載せられるだけの飾り罫、渦巻き、リボン、活字書体が載せられる。" +
    "一枚の紙面に5種も10種も違う書体が同居し、そのどれもが縁取り、影、立体で飾り立てられている。" +
    "暗い地に深紅と森緑と金。この時代、余白を残すことは金がないことの告白に見えた。",

  traits: [
    "1枚に5種以上の書体を同居させる",
    "文字に縁取り・影・立体を重ねる",
    "四隅と枠を渦巻きの飾り罫で囲む",
    "暗い地に深紅・森緑・金を載せる",
    "中心軸で揃え、段を積み上げて組む",
  ],

  avoid: [
    "余白をとって整理すること",
    "単一書体でのすっきりした組版",
    "平らなベタ塗りだけで済ませること",
  ],

  palette: ["#2a1a14", "#8b1a1a", "#c9a227", "#f0e6d2", "#3f5c4a"],

  prompt: {
    core: "Victorian chromolithograph advertisement, ornate typography",
    texture:
      "chromolithography on cream stock, engraved hairline flourishes, embossed and shaded letterforms, gold foil highlights, fine crosshatched engraving, slight plate misregistration, foxed aged paper",
    palette:
      "dark bottle-green or near-black brown ground, deep crimson, antique gold, forest green and warm ivory; jewel-toned and fully saturated",
    composition:
      "a strict central axis carrying stacked bands of type in five or more different faces, every line a different size and weight, ornate scrollwork filling all four corners, an engraved illustration inside a central cartouche, filigree rules dividing the bands, virtually no empty paper left",
    negative:
      "no white space, no single-typeface minimalism, no flat modern vector shapes, no sans-serif, no pastel palette, no asymmetric layout",
  },

  related: ["baroque", "art-nouveau", "maximalism", "steampunk"],
};
