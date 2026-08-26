import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "synthwave",
  ja: "シンセウェイヴ",
  en: "Synthwave",
  era: "2010s–",
  origin: "ネット／音楽",
  category: "internet",

  tagline: "地平線に沈む縞の太陽と、夜のグリッドを走り抜ける光",

  description:
    "2010年代の音楽ジャンルとして始まった。" +
    "80年代のSF映画とアーケードゲームのサウンドトラックに憧れた人たちが、後から作り直した80年代だ。" +
    "ヴェイパーウェイヴが同じ年代を皮肉で扱うのに対し、こちらは全面的に憧れている。" +
    "だから画面は夜で、必ず前へ進んでいる。" +
    "横縞に切れたグラデーションの太陽、地平線まで伸びるネオンの格子、クロームで押し出した文字、ヤシの黒い影。" +
    "実物の80年代ではなく、80年代が思い描いた未来の記憶を描いている。",

  traits: [
    "太陽は横縞で切る。下ほど縞を太く",
    "地平線から手前へ一点透視の格子を伸ばす",
    "マゼンタ→紫→シアンの縦グラデを敷く",
    "文字はクローム押し出しで湾曲させる",
    "地表近くに濃い霧とレンズフレアを置く",
  ],

  avoid: [
    "昼の明るさと空虚な羅列",
    "雨と看板で埋まった高密度な街",
    "淡いパステルや白い余白",
  ],

  palette: ["#0b0322", "#ff2e88", "#7a2ff2", "#00e0ff", "#ffb800"],

  prompt: {
    core: "synthwave, 1980s retro-futurist night scene, neon grid horizon",
    texture:
      "chrome-extruded 3D lettering, neon tube glow with bloom, horizontal scanline bands cutting the sun disc, volumetric ground fog, anamorphic lens flare, 8% film grain",
    palette:
      "black-violet sky #0b0322 fading to magenta #ff2e88 at the horizon, purple #7a2ff2 mid-band, cyan #00e0ff grid lines, amber #ffb800 sun core; saturated neon on near-black, no daylight tones",
    composition:
      "one-point perspective with the horizon on the lower third, a striped gradient sun half-sunk dead centre, a cyan wireframe grid receding to the vanishing point, black palm or mountain silhouettes flanking the left and right edges, chrome sans-serif headline arched across the upper third, symmetric about the centre axis",
    negative:
      "no daylight, no pastel colours, no white background, no plaster busts, no rain-soaked street, no clutter, no photographic realism, no matte flat fills, no crowded signage, no katakana collage",
  },

  related: ["vaporwave", "cyberpunk", "retrofuturism", "cassette-futurism"],
};
