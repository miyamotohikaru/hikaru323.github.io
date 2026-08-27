import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "de-stijl",
  ja: "デ・ステイル",
  en: "De Stijl",
  era: "1917–1931",
  origin: "オランダ",
  category: "movement",

  tagline: "直交する黒い線が画面を割り、余った面に原色を置く",

  description:
    "第一次大戦の外側にいた中立国オランダで、世界を作り直すならまず要素を減らすところからだ、と考えた人たちがいた。" +
    "残したのは垂直と水平の線、赤・青・黄の三原色、そして白と灰と黒だけ。" +
    "だから画面は何かを写した絵ではなく、線が区切った面どうしの釣り合いそのものになる。" +
    "同じ法則を家具にも建築にも通したが、斜めの線を認めるかどうかで内部が割れ、モンドリアンが去って運動は終わった。",

  traits: [
    "垂直と水平だけ。斜線を一本も引かない",
    "黒い罫は画面の端まで抜けて止まらない",
    "赤・青・黄の面は必ず大きさを変える",
    "面のほとんどは白か灰。色は少数派",
    "正方形を避け、長方形の比を全部変える",
  ],

  avoid: [
    "白い虚空に矩形を浮かせること",
    "斜めの傾きや回転を加えること",
    "色面に濃淡やにじみを出すこと",
  ],

  palette: ["#f4f2ec", "#111111", "#d02020", "#1a4fd0", "#f2c200"],

  prompt: {
    core: "De Stijl neoplastic composition, orthogonal grid painting",
    texture:
      "flat opaque oil on canvas, faint brush drag inside each colour field, hard-ruled black lines of uneven weight, matte linen surface, no varnish sheen",
    palette:
      "pure red, cobalt blue and cadmium yellow covering under 20% of the field; the rest off-white and warm grey, divided by black rules",
    composition:
      "rectangles of unequal proportion locked into a right-angle lattice, black rules running edge to edge without stopping, one large colour block anchoring a corner, no two rectangles the same size, picture plane completely filled to the border",
    negative:
      "no diagonals, no curves, no shapes floating on empty ground, no gradients, no perspective, no figurative imagery, no pastel or mixed hues",
  },

  related: ["bauhaus", "suprematism", "minimalism", "swiss-style"],
};
