import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "pop-art",
  ja: "ポップアート",
  en: "Pop Art",
  era: "1950s–1960s",
  origin: "イギリス／アメリカ",
  category: "movement",

  tagline: "スープ缶と漫画のコマを、美術館の壁に掛ける",

  description:
    "1950年代のロンドンで、広告とアメリカ製パッケージの切り貼りから始まり、60年代のニューヨークで大きくなった。" +
    "前の世代の抽象表現主義が画家の内面を掘り下げていたのに対し、こちらは誰もが知っている絵——スープ缶、漫画のコマ、スターの顔写真——をそのまま持ってきた。" +
    "だから手の跡は消す。シルクスクリーンで刷り、印刷の網点をわざと拡大し、原色のベタで塗る。" +
    "上手さではなく、複製されたものの顔つきを見せることが主題になっている。",

  traits: [
    "原色のベタ塗りに太い黒の輪郭線",
    "網点を拡大して、印刷の顔を残す",
    "主役は既製品。缶・広告・漫画のコマ",
    "同じ図像を色違いで並べて反復する",
    "吹き出しと擬音を画面の中に入れる",
  ],

  avoid: [
    "筆致や絵の具の厚みを残すこと",
    "中間色・くすみ色でまとめること",
    "写実的な陰影で立体を作ること",
  ],

  palette: ["#f2e600", "#e8194b", "#1a4fd0", "#ffffff", "#111111"],

  prompt: {
    core: "Pop Art screenprint, comic-panel imagery, mass-media subject",
    texture:
      "silkscreen flat inks, oversized Ben-Day dot halftone with roughly 8pt dot spacing, heavy black keyline outline of even weight, colour plates 1-2px off register, slightly absorbent poster stock",
    palette:
      "four flat inks — chrome yellow (#f2e600), pillar-box red (#e8194b), cobalt blue (#1a4fd0) and pure white, all bound by a black keyline (#111111); no mixed tones, no gradients, no shading colours",
    composition:
      "a single everyday object or tightly cropped face filling the frame, subject centred and frontal, optionally repeated in a 2x2 or 4x4 grid with the colourway swapped in every cell, one speech balloon set in bold sans-serif caps, thick rectangular panel border",
    negative:
      "no visible brushstrokes, no impasto, no muted colours, no photorealistic shading, no soft gradients, no fine-art canvas texture",
  },

  related: ["halftone", "kitsch", "pop-surrealism", "psychedelic"],
};
