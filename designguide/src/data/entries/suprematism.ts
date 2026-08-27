import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "suprematism",
  ja: "シュプレマティズム",
  en: "Suprematism",
  era: "1915–1920s",
  origin: "ロシア",
  category: "movement",

  tagline: "地平も重力もない白の中で、矩形だけが浮いている",

  description:
    "1915年のペトログラードで、マレーヴィチは黒い正方形を展示室の隅の高い位置に掛けた。" +
    "ロシアの家でイコンを置く場所である。" +
    "描くべき対象を持たない絵、つまり無対象こそが純粋な感情を運べる、という主張だった。" +
    "だから白は背景ではなく無限であり、矩形はそこに重力を持たないまま浮いている。" +
    "デ・ステイルのように格子で画面を割ることはせず、大小の矩形が斜めに傾いたまま群れて飛ぶ。",

  traits: [
    "白い地は背景ではなく無限として扱う",
    "矩形を15〜45度傾け、群として飛ばす",
    "端で切らず、中央寄りに集めて浮かせる",
    "黒と赤を主役に、青と黄は少量だけ",
    "大小の差を極端につけて奥行を出す",
  ],

  avoid: [
    "格子を組んで画面を分割すること",
    "図形に影や輪郭線をつけること",
    "地平線や床など空間の手がかり",
  ],

  palette: ["#f2efe6", "#141414", "#d6321e", "#1f4fa8", "#e8b21e"],

  prompt: {
    core: "Suprematist composition, non-objective geometric abstraction",
    texture:
      "flat matte oil paint on raw-toned canvas, slightly chalky edges, no outlines, faint canvas weave showing through the white ground",
    palette:
      "black and vermilion red as leads, ultramarine blue and ochre yellow as small accents, all set on a warm chalk-white void",
    composition:
      "a loose diagonal cluster of rectangles and thin bars tilted 15–45°, floating free with no baseline and no grid, largest element about 30% of the frame, wide empty white margins on at least two sides, abrupt scale jumps implying depth",
    negative:
      "no orthogonal grid, no black dividing rules, no horizon line, no shadows, no outlines, no representational objects, no gradients, no lettering",
  },

  related: ["russian-constructivism", "de-stijl", "bauhaus", "minimalism"],
};
