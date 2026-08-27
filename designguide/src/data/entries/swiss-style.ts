import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "swiss-style",
  ja: "スイス・スタイル",
  en: "Swiss Style",
  era: "1950s–",
  origin: "スイス",
  category: "movement",

  tagline: "作り手の趣味を消して、情報だけに喋らせる",

  description:
    "四つの言語を抱えた中立国が、誰が読んでも同じに届く印刷物を刷り続けねばならなかった。" +
    "そこで選ばれたのが、作り手の筆致を消すという方法だった。" +
    "書体は癖のないサンセリフ一種類に絞り、版面を等分のモジュラーグリッドで割り、写真も文字もその升目へ機械的に流し込む。" +
    "これは要素を削る思想ではなく、判断の余地を減らして再現できるようにした手続きで、だから誰が組んでも同じ精度で立ち上がる。",

  traits: [
    "版面を等分するモジュラーグリッドで割る",
    "サンセリフ一書体、太さは2段階まで",
    "左揃え・右ラグ。中央揃えを使わない",
    "写真は切り抜かず矩形で升目に嵌める",
    "白と黒に、赤を一色だけ差す",
  ],

  avoid: [
    "装飾書体・手描き文字・飾り罫",
    "中央揃えの左右対称レイアウト",
    "余白そのものを主役にする（それは削る思想）",
  ],

  palette: ["#ffffff", "#000000", "#e2231a", "#8c8c8c", "#f2f2f2"],

  prompt: {
    core: "Swiss International Typographic Style poster, grid system",
    texture:
      "flat offset lithography, smooth uncoated white stock, perfectly even ink lay, hairline rules, zero grain or distress",
    palette:
      "pure white ground, dense black type, one signal red accent covering under 10 percent of the field, cool neutral grey tints; three inks only",
    composition:
      "rigid modular grid of equal columns sharing one baseline, flush-left ragged-right sans-serif type, objective photography cropped square to the grid cells, headline locked to the upper-left cell, a wide margin held as structure rather than decoration, every element aligned to the same vertical axis, one large empty column left deliberately unfilled",
    negative:
      "no centred type, no script or display fonts, no decorative rules, no drop shadows, no illustration flourishes, no tilted or rotated elements, no gradients, no texture overlays",
  },

  related: ["bauhaus", "new-wave", "minimalism", "flat-design"],
};
