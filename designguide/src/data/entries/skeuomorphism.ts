import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "skeuomorphism",
  ja: "スキューモーフィズム",
  en: "Skeuomorphism",
  era: "2007–2013",
  origin: "UI",
  category: "screen",

  tagline: "初めて触る人に、実物の姿を借りて使い方を教える",

  description:
    "語源はギリシャ語の skeuos（道具）と morphe（形）。" +
    "もとは、陶器が金属器の鋲の形まで真似るように、機能を失った形だけが残ることを指す言葉だった。" +
    "UIでの役目はそれとは違い、教えるための擬態である。" +
    "2007年のiPhoneは、物理ボタンのないガラス板を、初めて触る人へ差し出した。" +
    "だからページはめくれ、メモは方眼紙で、録音アプリには金属のつまみが付いた。" +
    "触り方を覚えた人が増えた時点で説明は不要になり、2013年のiOS 7で一斉に剥がされた。",

  traits: [
    "実在の素材を模す。革・木目・金属・フェルト",
    "光は真上から。上辺に薄い白の面取りを入れる",
    "縫い目・ネジ・ステッチを縁に入れる",
    "押した時は影を内側へ反転させ、沈ませる",
    "写真から起こした質感を全面に敷き詰める",
  ],

  avoid: [
    "実物に存在しない質感を貼ること",
    "画面ごとに光源の向きを変えること",
    "単色ベタの面を混ぜること",
  ],

  palette: ["#d7d2c8", "#8a7d68", "#3f4a5a", "#f0ece2", "#22201c"],

  prompt: {
    core: "skeuomorphic interface, real-world material metaphor, iOS 6 era UI",
    texture:
      "photorealistic materials — stitched leather, brushed aluminium, linen weave, green casino felt, yellow legal-pad paper with ruled blue lines — glossy bevels, inner shadow, a 1px top highlight, fine noise grain over every surface",
    palette:
      "warm leather and paper neutrals — putty (#d7d2c8), tan (#8a7d68), slate blue (#3f4a5a), cream (#f0ece2), dark walnut (#22201c); rich material colours picked from photographs, never flat brand swatches",
    composition:
      "toolbar rendered as a brushed metal strip, buttons as rounded glossy capsules with a top-lit bevel and a drop shadow beneath, torn-paper edges and visible stitching at every panel border, light source consistently directly overhead, controls sized and placed like their physical originals, embossed serif labels",
    negative:
      "no flat colour fills, no single-weight line icons, no minimal layout, no unlit surfaces, no vector-only look, no inconsistent light direction",
  },

  related: ["material-design", "flat-design", "neumorphism", "frutiger-aero"],
};
