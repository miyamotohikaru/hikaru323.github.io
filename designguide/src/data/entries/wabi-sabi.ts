import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "wabi-sabi",
  ja: "わびさび",
  en: "Wabi-Sabi",
  era: "15世紀–",
  origin: "日本",
  category: "japan",

  tagline: "欠けと歪みと時間の痕を、直さずに見どころにする",

  description:
    "室町から桃山にかけての茶の湯が育てた、日本の美意識である。" +
    "様式というより価値の判断で、足りないこと、整っていないこと、古びていくことの側に美を見る。" +
    "唐物の完璧な器を退けて、名もない朝鮮の雑器や歪んだ楽茶碗を選んだのはそのためだ。" +
    "背景にあるのは無常観で、ものは必ず壊れ、汚れ、いつか失われるという前提を隠さない。" +
    "割れた器は継ぎ目を金で見せて直す。" +
    "だから作り手にできるのは、形を決めきらずに、時間が加えるぶんを残しておくことになる。",

  traits: [
    "左右を揃えない。中心を外して置く",
    "土・灰・木・和紙の素の肌を出す",
    "釉のちぢれ、指跡、窯変を消さない",
    "色は土から出る範囲に限る",
    "継ぎ跡・欠け・褪色を残して見せる",
  ],

  avoid: [
    "新品の清潔さと均一な仕上げ",
    "北欧風の白いミニマル（ジャパンディ）",
    "装飾としての「和柄」を貼ること",
  ],

  palette: ["#e4ddd0", "#b8ac97", "#7a6f5e", "#3a3529", "#d0c6b2"],

  prompt: {
    core: "wabi-sabi, Japanese tea-ceremony aesthetic of imperfection",
    texture:
      "unglazed and crawling ash-glazed stoneware, raw kneaded clay with visible finger marks, kiln flashing and crackle, rough earthen plaster wall, undyed washi paper, weathered unfinished cedar, kintsugi gold-lacquer repair seams",
    palette:
      "earth-derived only — ash grey, raw clay ochre, smoke brown, faded straw, charcoal; near neutral, with one dull gold repair line as the sole accent",
    composition:
      "asymmetric placement with a single object about 35 percent in from the left and 60 percent down, large uneven empty ground filling the rest, soft north-facing daylight from one side, low camera at object height, edges left deliberately unresolved, nothing centred and nothing paired",
    negative:
      "no symmetry, no glossy uniform glaze, no new or factory-perfect finish, no bright colours, no Scandinavian white minimalism, no decorative Japanese pattern motifs, no cherry blossom, no red torii, no styled lifestyle props",
  },

  related: ["japandi", "japonisme", "minimalism", "scandinavian"],
};
