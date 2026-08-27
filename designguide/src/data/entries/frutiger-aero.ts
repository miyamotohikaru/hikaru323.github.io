import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "frutiger-aero",
  ja: "フルーティガー・エアロ",
  en: "Frutiger Aero",
  era: "2004–2013",
  origin: "UI",
  category: "screen",

  tagline: "青空と水滴と芝生。技術が自然と手を組むと信じた画面",

  description:
    "Windows VistaのAero、初期のiPodの広告、Wiiのメニュー、2000年代後半の家電の箱。" +
    "あの一群を後からまとめて呼ぶ名前で、書体のFrutigerが看板やUIに溢れていたことに由来する。" +
    "共通しているのは「技術は自然と共存できて、しかも清潔だ」という当時の楽観で、" +
    "だから画面には必ず、水滴、気泡、透けたガラス、青空、そして瑞々しい緑が出てくる。" +
    "2008年以降にその楽観は消え、UIはフラットへ向かった。" +
    "いまこの様式が掘り返されるのは、失われた明るさの記号だからだ。",

  traits: [
    "水滴・気泡・レンズフレアを必ず入れる",
    "面はガラス。上辺に白いハイライトを引く",
    "空色から白へのグラデを地にする",
    "新緑の緑を一箇所だけ生の自然として置く",
    "反射する床に被写体を映り込ませる",
  ],

  avoid: [
    "彩度の低い暗い地に置くこと",
    "フラットな単色ベタ塗り",
    "粗いノイズ・グリッチ・退色",
  ],

  palette: ["#dff2fb", "#3aa7e0", "#7ed957", "#ffffff", "#1d5f8a"],

  prompt: {
    core: "Frutiger Aero, glossy skeuomorphic mid-2000s tech aesthetic",
    texture:
      "high-gloss glass surfaces with a white specular highlight along the top edge, refracting water droplets, air bubbles, anamorphic lens flare, bloom, wet mirror-reflective floor, 3D studio product render",
    palette:
      "sky-to-white gradient ground #dff2fb, aqua blue #3aa7e0, fresh grass green #7ed957, pure white #ffffff highlights, deep teal #1d5f8a for depth; high saturation, high key, nothing muddy or grey",
    composition:
      "one hero object centred and floating above a mirror-reflective surface, blue sky with soft clouds behind, water droplets sitting on a glass plane in the foreground, a strand of green foliage entering from one corner, wide clean margins, humanist sans-serif type with a soft outer glow",
    negative:
      "no flat design, no matte finish, no dark background, no desaturated colours, no grain, no glitch, no brutalist type, no hard shadows, no CRT artefacts, no neon on black",
  },

  related: ["skeuomorphism", "glassmorphism", "y2k", "flat-design"],
};
