import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "neoclassicism",
  ja: "新古典主義",
  en: "Neoclassicism",
  era: "18–19世紀",
  origin: "ヨーロッパ",
  category: "movement",

  tagline: "ロココの甘さを捨て、古代の直線と静止に戻る",

  description:
    "ポンペイの発掘とヴィンケルマンの著作が、古代ギリシア・ローマを高貴な単純と静かな偉大として再発見させた。" +
    "同じ頃、ロココの装飾は退廃した貴族の趣味と見なされるようになる。" +
    "だから画面から曲線と過剰が消え、水平と垂直、円柱、三角形の構図が戻ってきた。" +
    "人物は舞台のように浅い一列に並び、動きの最中ではなく決意した瞬間で止まる。色は石と大理石に寄り、赤は誓いのように一点だけ置かれる。",

  traits: [
    "水平・垂直と円柱で骨格を組む",
    "人物を舞台のように浅い列に並べる",
    "動きの途中ではなく静止で止める",
    "石・大理石・砂色の低彩度でまとめる",
    "赤や青は一人分だけ差し込む",
  ],

  avoid: [
    "非対称の渦巻きと淡い桃色",
    "劇的すぎる斜めの構図",
    "装飾のための装飾を足すこと",
  ],

  palette: ["#efe9dc", "#c8c2b0", "#8a8574", "#2f2a22", "#b0442e"],

  prompt: {
    core: "Neoclassical history painting, antique Greco-Roman order",
    texture:
      "smooth academic oil with invisible brushwork, sculptural modelling of drapery, marble and dressed stone surfaces, cool even studio light, clean varnish",
    palette:
      "stone and marble neutrals — limestone cream, warm grey, taupe and deep umber — with a single saturated vermilion or ultramarine carried by one figure",
    composition:
      "shallow stage-like space parallel to the picture plane, Doric or Ionic columns and a plain wall setting the vertical rhythm, figures arranged in a frieze-like row, triangular grouping with a clear apex, arrested stillness at the moment of resolve, strong horizontal floor line, restrained gesture",
    negative:
      "no rocaille scrollwork, no pastel pinks, no asymmetric curves, no violent diagonal drama, no decorative excess, no loose visible brushstrokes",
  },

  related: ["rococo", "baroque", "precisionism", "art-deco"],
};
