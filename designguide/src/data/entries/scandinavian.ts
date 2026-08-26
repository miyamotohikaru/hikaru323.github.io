import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "scandinavian",
  ja: "スカンジナビアン・モダン",
  en: "Scandinavian Modern",
  era: "1950s–",
  origin: "北欧",
  category: "movement",

  tagline: "冬が長い土地で、少ない光を最後まで使い切る",

  description:
    "北欧の冬は長く、日が出ている時間が短い。" +
    "だから壁も床も家具も、限られた光を跳ね返して部屋の奥へ送り返すために白く明るくなり、窓辺には物を置かない。" +
    "そこへ、良いものは金持ちのものではなく全員のものだ、という戦後の考え方が重なって、量産できる簡素な形が選ばれた。" +
    "装飾を手放した代わりに、白木の木目・ウール・素焼きといった手触りは残してある。冷たく見えないのはそのためだ。",

  traits: [
    "白木のバーチかオークを白い壁に合わせる",
    "影は柔らかく、輪郭が消えない程度に薄く",
    "霞んだセージとくすんだテラコッタを1〜2色",
    "ウール・リネン・素焼きの手触りを必ず一つ",
    "窓辺を空け、光の来る方向を画面に残す",
  ],

  avoid: [
    "黒い床と深い影で締めること",
    "光沢・クローム・ガラスの強い反射",
    "濃い原色や高彩度のアクセント",
  ],

  palette: ["#f4f1ea", "#c9d6cd", "#d9a48f", "#7f8a7a", "#2e2b26"],

  prompt: {
    core: "Scandinavian modern interior, Nordic diffuse daylight",
    texture:
      "pale birch and white oak grain, unbleached linen, chunky undyed wool, unglazed stoneware, chalky lime-washed matte walls, soft daylight with no hard shadow edge",
    palette:
      "warm chalk-white ground, muted sage grey-green, dusty terracotta blush, soft moss grey, one charcoal-brown anchor; low saturation and high value throughout",
    composition:
      "a large window at the left edge as the single light source with light falling across the floor, uncluttered surfaces holding one ceramic vessel and one dried branch, low horizon with generous headroom, furniture on thin tapered legs so the floor reads continuously beneath it, roughly 60 percent of the frame left empty",
    negative:
      "no dark walls, no deep shadows, no chrome or glossy reflection, no saturated primary colours, no ornate carving, no clutter, no warm tungsten orange lighting, no black floor",
  },

  related: ["japandi", "mid-century-modern", "minimalism", "wabi-sabi"],
};
