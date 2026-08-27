import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "biomechanical",
  ja: "バイオメカニカル・アート",
  en: "Biomechanical Art",
  era: "1970s–",
  origin: "スイス（H.R.ギーガー）",
  category: "movement",

  tagline: "骨と配管の境目がなくなった、ギーガー一人の身体観",

  description:
    "スイスの美術家H.R.ギーガーが1970年代に確立した、ほぼ個人の作風である。" +
    "画集『ネクロノミコン』と、1979年の映画『エイリアン』の造形設計によって世界に広まった。" +
    "核にあるのは、生き物と機械を組み合わせるのではなく、両者の境目を消すという発想だ。" +
    "肋骨がそのまま配管になり、腱がケーブルに、椎骨がピストンへ連続していく。" +
    "ギーガーはこれをエアブラシで描いたので面に継ぎ目がなく、" +
    "金属とも軟骨ともつかない灰色の膜が画面全体を覆っている。",

  traits: [
    "骨と配管を継ぎ目なく連続させる",
    "エアブラシの無段階グラデーション",
    "色は骨灰色と黒。彩度をほぼ捨てる",
    "肋・椎骨・腱の反復でリズムを作る",
    "画面いっぱいに詰め、余白を残さない",
  ],

  avoid: [
    "ロボットと人間を「組み合わせた」表現",
    "金属光沢の鮮やかなハイライト",
    "明るい色や原色を差すこと",
  ],

  palette: ["#14161a", "#4a5058", "#8a8f96", "#2a2f36", "#c9c4b8"],

  prompt: {
    core: "biomechanical art in the style of H.R. Giger, fused organism and machine",
    texture:
      "fine airbrush rendering with seamless tonal gradients, matte bone and cartilage surfaces, wet chitin sheen, ribbed vertebral tubing, sinew merging into cable, no visible brush marks",
    palette:
      "near monochrome — bone grey, cold gunmetal, charcoal black, faint bone ivory; chroma almost entirely removed",
    composition:
      "dense wall-to-wall detail with no empty space, strict bilateral symmetry about a vertical central spine, repeating rib and vertebra rhythm receding into darkness, low-key lighting with one cold source raking from the upper left, frame filled edge to edge",
    negative:
      "no bright colours, no clean robot parts bolted onto flesh, no glossy chrome highlights, no cartoon style, no visible brushstrokes, no empty background, no warm skin tones",
  },

  related: ["surrealism", "cyberpunk", "gothic", "expressionism"],
};
