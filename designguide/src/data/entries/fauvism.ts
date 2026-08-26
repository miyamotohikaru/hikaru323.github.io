import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "fauvism",
  ja: "フォービズム",
  en: "Fauvism",
  era: "1905–1908",
  origin: "フランス",
  category: "movement",

  tagline: "見た色ではなく、感じた色を絵具のまま置く",

  description:
    "1905年のサロンで、マティスたちの展示室は野獣(フォーヴ)の檻と呼ばれた。" +
    "彼らは物の固有色を捨て、木の幹を赤に、顔の影を緑に塗ったからである。" +
    "色は対象を説明する道具ではなく、それ自体が歓びの対象だという立場だった。" +
    "印象派のように光を分析するのではなく、色をそのまま感情の強さとして使う。" +
    "だから筆は速く、絵具は混ぜずチューブに近い純度のまま並べられ、下地の白いカンヴァスが筆と筆の間から光として残っている。",

  traits: [
    "物の固有色を無視して純色を置く",
    "絵具を混ぜず、筆跡を残したまま並べる",
    "補色を隣り合わせて色を震わせる",
    "下地の白を筆と筆の間に残す",
    "輪郭は太い一本の色線で取る",
  ],

  avoid: [
    "不安や歪みを強調した暗い画面",
    "陰影で立体を作ること",
    "色を混ぜて中間色にすること",
  ],

  palette: ["#f2e6c8", "#e8402a", "#1f7a8c", "#f2b100", "#7a2f8a"],

  prompt: {
    core: "Fauvist painting, arbitrary non-naturalistic colour",
    texture:
      "thick unblended oil strokes straight from the tube, visible bristle tracks, patches of bare white primed canvas left between strokes, wet-into-wet edges, no glazing",
    palette:
      "high-key saturated hues used arbitrarily — vermilion, cadmium orange, chrome yellow, viridian, turquoise, violet — complementaries laid side by side at full strength",
    composition:
      "a sunlit landscape or seated figure simplified into broad colour zones, contours drawn with a single thick coloured line, flattened space with almost no modelling, open-air joyful subject, unpainted canvas glinting through as light",
    negative:
      "no muted or greyed colour, no chiaroscuro modelling, no anxious distortion, no heavy black outlines, no photorealism, no blended gradients",
  },

  related: ["expressionism", "cubism", "japonisme"],
};
