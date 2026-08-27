import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "japonisme",
  ja: "ジャポニスム",
  en: "Japonisme",
  era: "1860s–1900s",
  origin: "ヨーロッパ",
  category: "japan",

  tagline: "浮世絵に驚いた西洋が、遠近法と陰影を捨てた瞬間",

  description:
    "1860年代以降、開国した日本から大量に流れ込んだ浮世絵に、パリとロンドンの画家たちが衝撃を受けた。" +
    "つまりこれは日本の様式ではなく、それを見た西洋の側で起きた現象を指す言葉である。" +
    "彼らが持ち帰ったのは題材ではなく文法だった。" +
    "陰影で立体を作らない平らな色面、輪郭線、画面の端で被写体を断ち切る大胆なトリミング、" +
    "中心を外した非対称、そして手前に大きな枝や柱を置いて奥を覗かせる構図。" +
    "ドガやロートレックやゴッホの画面設計は、ここから来ている。",

  traits: [
    "陰影を捨て、平らな色面と輪郭線で描く",
    "画面の端で被写体を断ち切る",
    "手前に枝や柱を置き、奥を覗かせる",
    "余白を大きく取り、重心を対角に置く",
    "落款のような朱印と縦の題字を入れる",
  ],

  avoid: [
    "西洋式の陰影とグラデーション",
    "一点透視の整いすぎた遠近法",
    "浮世絵そのものの複製にすること",
  ],

  palette: ["#efe7d6", "#1f4e5f", "#c0432c", "#d8a13a", "#2a2420"],

  prompt: {
    core: "Japonisme, Western art under ukiyo-e woodblock influence",
    texture:
      "flat matte colour fields with no modelling, brush-drawn keyline outline, woodblock grain and slight plate misregistration, aged laid paper in warm ivory, dry-brush edges",
    palette:
      "warm ivory paper ground, deep indigo-teal, vermilion red, gold ochre, sumi black outline; five flat inks only, no blended shadows",
    composition:
      "extreme asymmetric crop with the subject cut by the frame edge, a large foreground branch or pillar entering from the top right and occupying about 30 percent as a repoussoir, high viewpoint with a tilted ground plane and no vanishing point, a wide empty ivory field in the lower left, a small red seal stamp and vertical title cartouche in one corner",
    negative:
      "no chiaroscuro shading, no cast shadows, no linear one-point perspective, no photorealism, no oil impasto, no modern zen-spa styling, no literal copy of a Hokusai print",
  },

  related: ["art-nouveau", "woodcut", "jugendstil", "wabi-sabi"],
};
