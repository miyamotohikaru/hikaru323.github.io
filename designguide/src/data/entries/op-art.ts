import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "op-art",
  ja: "オプ・アート",
  en: "Op Art",
  era: "1960s",
  origin: "ヨーロッパ",
  category: "movement",

  tagline: "止まっている絵が、目の中でだけ動きだす",

  description:
    "1960年代のヨーロッパで、網膜そのものを材料にした絵が現れた。" +
    "等間隔に引いた白黒の縞や格子を、少しずつ幅と間隔を変えながら歪めていく。" +
    "すると脳が「これは平面ではなく波打った面だ」と補ってしまい、動かない紙の上で像がうねりはじめる。" +
    "だから手描きの揺れや筆致は入れられない。周期が乱れた瞬間に錯視は消えるので、線は定規と製版の精度で引く。" +
    "色を足す場合も、目がちらつく補色の一組だけに絞る。",

  traits: [
    "等間隔の線・格子を絵の基本単位にする",
    "周期を少しずつ変えて面をうねらせる",
    "白と黒の二値。中間の灰色を作らない",
    "色を使うなら補色を1組だけに絞る",
    "線の太さを中心から外へ連続的に変える",
  ],

  avoid: [
    "手描きの揺れ・かすれを入れること",
    "陰影で立体を作ること",
    "具象の図像を置くこと",
  ],

  palette: ["#ffffff", "#000000", "#e63946", "#1d3557", "#f1faee"],

  prompt: {
    core: "Op Art, optical illusion geometry, moiré field",
    texture:
      "razor-sharp vector edges, flat matte ink, perfectly even line weight within each band, no brush texture, no grain, no anti-aliasing softness",
    palette:
      "pure black (#000000) on pure white (#ffffff), maximum contrast binary; at most one complementary accent pair of crimson (#e63946) and navy (#1d3557); no midtones, no grey, no gradients",
    composition:
      "full-bleed field of evenly spaced parallel lines or a square grid, the period and stroke weight modulated progressively so the flat plane appears to bulge and ripple, one implied convex centre, mathematically regular repetition, no illustrated subject, no margin",
    negative:
      "no hand-drawn wobble, no gradients, no drop shadows, no 3D rendering, no surface texture, no figurative imagery, no more than three colours",
  },

  related: ["bauhaus", "minimalism", "psychedelic", "swiss-style"],
};
