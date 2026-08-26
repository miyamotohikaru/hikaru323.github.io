import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "art-deco",
  ja: "アール・デコ",
  en: "Art Deco",
  era: "1920s–1930s",
  origin: "フランス",
  category: "movement",

  tagline: "機械の速さを、左右対称の階段と扇で贅沢に見せる",

  description:
    "1925年のパリ装飾芸術博覧会が名前の由来になった。" +
    "アール・ヌーヴォーの手仕事の曲線を捨て、機械、速度、摩天楼という新しい憧れを、直線と対称で表そうとした様式である。" +
    "ただし目指したのは機能ではなく豪奢で、使う材は黒檀、象牙、ラッカー、クロム、そして金。" +
    "同じ幾何を使っても、機能から形を決めたバウハウスとは目的が正反対にある。" +
    "だから形は幾何的でも仕上げはどこまでも光り、扇形、日の出、階段状のセットバック、ジグザグが繰り返し現れる。",

  traits: [
    "左右対称。中心軸を必ず一本立てる",
    "扇形・日の出・階段状の形を反復する",
    "細い金線で面と面を分ける",
    "濃紺や黒に金を一色だけ載せる",
    "文字は幾何サンセリフの大文字を字間広く",
  ],

  avoid: [
    "有機的に伸びる非対称の曲線",
    "手描きのざらつき・にじみ",
    "パステルの甘い配色でまとめること",
  ],

  palette: ["#0e1a1f", "#c9a227", "#1e5f74", "#e8dcc4", "#8c1c13"],

  prompt: {
    core: "Art Deco poster, machine-age geometric luxury",
    texture:
      "flat airbrushed gouache, polished lacquer surfaces, thin metallic gold rules, chrome and ebony materials, smooth screen-printed fields, no visible brush marks",
    palette:
      "deep midnight navy and black ground, antique gold and brass as the only metallic, peacock teal, ivory cream, one oxblood red accent",
    composition:
      "strict bilateral symmetry around a central vertical axis, stepped ziggurat setbacks, sunburst and fan motifs radiating from the base, a streamlined stylised figure or skyscraper silhouette at the centre, thin gold rules separating the fields, wide-tracked geometric sans capitals banded across top and bottom",
    negative:
      "no organic whiplash curves, no asymmetry, no hand-drawn texture, no pastel palette, no rustic materials, no photographic clutter",
  },

  related: ["streamline-moderne", "jugendstil", "art-nouveau", "dieselpunk"],
};
