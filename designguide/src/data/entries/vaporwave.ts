import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "vaporwave",
  ja: "ヴェイパーウェイヴ",
  en: "Vaporwave",
  era: "2010s–",
  origin: "インターネット",
  category: "internet",

  tagline: "潰れたモールのBGMを引き伸ばして、石膏像に聴かせる",

  description:
    "2010年代の初め、ネットの上で自然発生した。" +
    "80〜90年代のモールのBGMやCM音源を極端に引き伸ばし、あの頃の豊かさが空っぽだったことを聞かせる音楽が先にあり、そのジャケットが様式になった。" +
    "だから中心にあるのは懐かしさではなく、消費社会への気だるい皮肉だ。" +
    "ギリシャ彫刻の石膏像、Windows 95の窓、誰もいないモール、読めないまま記号として使われたカタカナ。" +
    "意味を剥がした断片を等間隔に並べるから、画面は昼で明るいのに、どこまでも空虚に見える。",

  traits: [
    "石膏胸像・ヤシ・格子床・旧OSの窓を並べる",
    "カタカナを意味と無関係に大きく重ねる",
    "空はマゼンタとシアンの二色だけで塗る",
    "VHS由来の色ズレと走査線を薄く乗せる",
    "要素を等間隔に、無関係なまま置く",
  ],

  avoid: [
    "夜の疾走感と一点透視",
    "意味の通る一貫した情景",
    "高精細でクリーンなCG",
  ],

  palette: ["#1a0b2e", "#ff71ce", "#01cdfe", "#05ffa1", "#fffb96"],

  prompt: {
    core: "vaporwave aesthetic, 1990s mall surrealism, ironic consumer collage",
    texture:
      "VHS chroma bleed, horizontal tracking noise, visible JPEG macroblocks, 1995 desktop window chrome, low-resolution bitmap upscaled with nearest-neighbour, CRT scanline overlay at 10%",
    palette:
      "hot magenta #ff71ce and cyan #01cdfe as the dominant pair, mint #05ffa1 and pale yellow #fffb96 accents, deep purple #1a0b2e sky; oversaturated, high key, flat daylight",
    composition:
      "frontal arrangement with no depth cue, a Greek plaster bust on the left third, a magenta-to-cyan gradient sky behind, a cyan wireframe checkerboard floor along the bottom quarter, palm silhouettes and a 1995 window chrome floating at the upper right, katakana set large and unrelated to the image, elements evenly spaced and unconnected",
    negative:
      "no night scene, no speeding one-point perspective, no coherent narrative, no realistic lighting, no modern clean UI, no high-fidelity 3D render, no rain, no dark moody atmosphere, no chrome sunset",
  },

  related: ["synthwave", "y2k", "glitch-art", "dreamcore"],
};
