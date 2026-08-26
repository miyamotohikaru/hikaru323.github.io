import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "deconstructivism",
  ja: "デコンストラクティビズム",
  en: "Deconstructivism",
  era: "1980s–",
  origin: "建築",
  category: "movement",

  tagline: "完成した形を一度壊し、ずれたまま立たせる",

  description:
    "建築が長いあいだ守ってきた調和・安定・全体の統一という前提を、わざと疑ってみせた運動である。" +
    "哲学の脱構築を借りて、床は水平で壁は垂直、といった前提を一度外し、面と面を斜めに衝突させたまま固定した。" +
    "見た目は破綻しているのに実際には破綻しておらず、よく見ると崩れる寸前で止めてあることが分かる。" +
    "だから画面には視線が落ち着く場所がなく、どこを見ても次の面が斜めに入ってくる。",

  traits: [
    "直交をやめ、面を斜めに衝突させる",
    "断片をずらして重ね、継ぎ目を見せる",
    "水平線を傾け、重心を宙へ持ち上げる",
    "金属・ガラス・コンクリートを混在させる",
    "赤を一色だけ差し、破断面を指し示す",
  ],

  avoid: [
    "左右対称と安定した三角構図",
    "滑らかに繋がった一体の形",
    "装飾で継ぎ目を隠すこと",
  ],

  palette: ["#eceae4", "#141414", "#d64545", "#5b6b7a", "#9aa3ab"],

  prompt: {
    core: "deconstructivist architecture, fragmented colliding planes",
    texture:
      "brushed titanium and zinc cladding, raw concrete, frameless glass shards, exposed steel bracing, hard specular highlights, matte and mirror surfaces side by side",
    palette:
      "cool off-white and pale grey masses, near-black shadow gaps, slate blue-grey glass, one signal red plane marking a fracture; otherwise achromatic",
    composition:
      "no right angles anywhere — planes intersecting at 15 to 40 degree skews, the horizon deliberately tilted, volumes cantilevered with no visible support, fragments sliding past one another with open seams, the compositional weight in the upper third and off-centre, resolutely unresolved",
    negative:
      "no symmetry, no stable triangular composition, no smooth continuous surfaces, no ornament, no classical proportion, no calm level horizon, no warm decorative colour",
  },

  related: ["brutalism", "russian-constructivism", "new-wave", "cubism"],
};
