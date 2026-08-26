import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "minimalism",
  ja: "ミニマリズム",
  en: "Minimalism",
  era: "1960s–",
  origin: "アメリカ",
  category: "movement",

  tagline: "これ以上引いたら成立しない、の一歩手前で止める",

  description:
    "1960年代のニューヨークで、作家たちは作品の奥に物語や感情を隠すことをやめた。" +
    "見えているものがすべてで、その先に読み解くべき意味はない、という立場である。" +
    "だから同じ形を等間隔で並べ、素材の地肌をそのまま出し、筆致も署名も消した。" +
    "デザインに移っても考え方は同じで、飾りを取るのが目的ではなく、取ったあとに残る比率と余白そのものを置き物として扱う。余白は空きではなく、面積である。",

  traits: [
    "要素は3つまで。面積の差で序列をつける",
    "無彩色で組み、色は一点だけ差す",
    "画面の7割を空け、中身を隅へ寄せる",
    "同じ形を等間隔で反復する",
    "罫線も枠も影も使わず、間だけで区切る",
  ],

  avoid: [
    "情報整理のためのグリッド（スイス）",
    "質感やグラデーションで空気を作る",
    "中央に置いて安定させる",
  ],

  palette: ["#f4f3f0", "#111111", "#8c8c8c", "#d8d5cd", "#e2231a"],

  prompt: {
    core: "minimalist composition, reductive geometry, negative space",
    texture:
      "perfectly flat matte surfaces, uninflected industrial finish, fine-tooth cotton rag paper, no visible brushwork, no grain, no bevel",
    palette:
      "warm near-white ground, one charcoal-black element, two greys for hierarchy, a single pure red accent occupying under 3 percent of the frame",
    composition:
      "at most three elements, 70 percent of the field left empty, the subject pushed hard to one edge leaving a large void opposite, repeated forms at exactly equal intervals, no frames or rules — separation carried by spacing alone, small type in one weight set at the lower left, flat frontal view with no perspective",
    negative:
      "no ornament, no texture overlays, no gradients, no shadows, no decorative typography, no dense information grids, no centred symmetry, no second accent colour",
  },

  related: ["swiss-style", "japandi", "wabi-sabi", "flat-design"],
};
