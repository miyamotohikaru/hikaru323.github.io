import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "pixel-art",
  ja: "ピクセルアート",
  en: "Pixel Art",
  era: "1970s–",
  origin: "コンピュータゲーム",
  category: "screen",

  tagline: "1画素ずつ置く。足りない色は市松に並べて目で混ぜる",

  description:
    "メモリと画素が高価だった時代の制約が、そのまま様式になった。" +
    "使える色は十数色、輪郭は1画素、中間色はパレットに入れられないので、" +
    "二色を市松に並べて目の中で混ぜさせる。これがディザ。" +
    "だから今も、色数を絞らないとこの様式にはならない。" +
    "もう一つの勘所は解像度で、粗すぎると「ドット絵」ではなくただの大きい四角に見える。" +
    "稜線や曲線は手で刻むとギザギザの塊になるので、なめらかな曲線を先に引いてから画素へ落とす。",

  traits: [
    "解像度は48×64画素あたりを下限にする",
    "使う色は12〜16色。中間色を作らない",
    "階調は市松のディザで目に混ぜさせる",
    "輪郭は1画素。太らせない",
    "暖色の差し色を画面に1点だけ置く",
  ],

  avoid: [
    "なめらかな補間とアンチエイリアス",
    "画素の格子から外れた斜線・曲線",
    "グラデーションで階調を作ること",
  ],

  palette: ["#0f1024", "#5b6ee1", "#8bd6f2", "#f2c14e", "#e85c4a"],

  prompt: {
    core: "pixel art, 48x64 sprite, indexed palette, retro game graphics",
    texture:
      "hard nearest-neighbour pixels, zero anti-aliasing, 1px outlines, ordered checkerboard dithering wherever a gradient would go, visible pixel grid, faint CRT scanlines at 12% opacity",
    palette:
      "strict 14-colour indexed palette — night navy #0f1024, cobalt #5b6ee1, ice blue #8bd6f2, with amber #f2c14e and red #e85c4a as the only warm accents; every mid-tone made by dithering two palette colours rather than adding a new one",
    composition:
      "48 columns by 64 rows with everything snapped to the pixel grid, horizon on the two-thirds line, three layered silhouettes with the nearest darkest, one small warm light source as the single focal point, monospaced pixel-font caption set two cells in from the lower left",
    negative:
      "no anti-aliasing, no smooth gradients, no blur, no sub-pixel detail, no off-grid diagonals, no photographic texture, no more than 16 colours, no soft shadows, no vector smoothness",
  },

  related: ["isometric", "glitch-art", "cassette-futurism", "y2k"],
};
