import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "art-nouveau",
  ja: "アール・ヌーヴォー",
  en: "Art Nouveau",
  era: "1890–1910",
  origin: "フランス／ベルギー",
  category: "movement",

  tagline: "植物の蔓が伸びるままに、線が構造を乗っ取る",

  description:
    "機械が量産した粗悪な飾りへの反発と、浮世絵から学んだ有機的な線が重なって生まれた。" +
    "芸術と工芸を分けず、階段の手すりも本の見返しもドアの取っ手も同じ一本の線で作る、という総合の思想がある。" +
    "だから直線を避け、鞭がしなるようなホイップラッシュの曲線が、装飾ではなく構造そのものを形づくる。" +
    "モチーフは蔓、百合、孔雀、女の長い髪。すべてが伸び、絡み、枠の途中で止まらない。",

  traits: [
    "鞭のようにしなる非対称の曲線で組む",
    "枠を蔓で作り、絵の中まで侵食させる",
    "髪・水・煙をひとつの流れとして描く",
    "輪郭は太い線、内側は平らな塗り",
    "くすんだ緑・赤茶・金で低彩度に",
  ],

  avoid: [
    "直線と幾何形で整理すること",
    "ジグザグ・階段状の装飾",
    "写実的な陰影で立体化すること",
  ],

  palette: ["#efe6d2", "#6b7f4e", "#b4653a", "#2f3b2c", "#c9a86b"],

  prompt: {
    core: "Art Nouveau lithograph poster, whiplash organic line",
    texture:
      "flat colour lithography on cream stock, heavy sinuous ink contour of varying width, subtle limestone grain, gold leaf accents, no halftone dots",
    palette:
      "muted botanical range — moss and olive green, terracotta, dusty mauve, cream and antique gold; low saturation throughout",
    composition:
      "one elongated female figure or flowering vine filling a tall narrow format, asymmetric whiplash curves growing out of the lower corner and arcing around the head, a decorative border that the hair or drapery breaks out of, flat unshaded colour inside strong outlines, hand-drawn organic display lettering built into the frame",
    negative:
      "no straight lines, no geometric grid, no zigzag or stepped motifs, no photographic shading, no bright primary colours, no chrome or high-gloss finish",
  },

  related: ["jugendstil", "japonisme", "victorian", "art-deco"],
};
