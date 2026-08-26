import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "cubism",
  ja: "キュビズム",
  en: "Cubism",
  era: "1907–1920s",
  origin: "フランス",
  category: "movement",

  tagline: "ひとつの視点を捨て、対象を面に割って同時に見せる",

  description:
    "ルネサンス以来、絵は一点から覗いた窓だった。" +
    "自然を円筒と球と円錐で捉えよというセザンヌの言葉を、ピカソとブラックは窓のほうを壊す指示として受け取る。" +
    "正面と横顔、瓶の口と底が、ひとつの画面に並べて置かれた。" +
    "対象は小さな面に分解され、前後の距離は数センチまで浅く潰される。" +
    "色を茶と灰に落としたのは、鮮やかな色が形の分析を邪魔するからで、のちに新聞紙や木目紙を貼り込んで、現実の断片のほうを絵の中へ戻していった。",

  traits: [
    "対象を多面に割り、複数の視点を並置する",
    "奥行きを浅くし、前後を数センチに潰す",
    "面の境を直線と鋭角でつなぐ",
    "茶・灰・黒緑まで彩度を落とす",
    "新聞紙や木目紙の断片を貼り込む",
  ],

  avoid: [
    "遠近法による深い空間",
    "夢のような不条理な情景",
    "彩度の高い自由な色使い",
  ],

  palette: ["#d8cdb8", "#8a7f6b", "#3f4a52", "#a8582f", "#1c1a17"],

  prompt: {
    core: "Analytic Cubist painting, faceted multiple viewpoints",
    texture:
      "oil on canvas built from palette-knife facets, dry scumbled passages over a thin sanded ground, pasted newsprint and faux-bois wallpaper fragments, stencilled letterforms",
    palette:
      "restrained tonal range — raw umber, ochre, warm grey, slate blue-grey and black; near-monochrome with one burnt sienna accent",
    composition:
      "a guitar, bottle or seated figure shattered into interlocking planes, front and profile shown at once, shallow compressed depth of a few centimetres, facets fanning outward from a dense central mass and dissolving toward the edges, stencilled letters and torn newspaper cut into the picture plane",
    negative:
      "no linear perspective, no deep space, no smooth modelling, no bright saturated colour, no dreamlike surreal imagery, no photographic realism",
  },

  related: ["collage", "de-stijl", "precisionism", "expressionism"],
};
