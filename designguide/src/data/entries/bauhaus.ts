import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "bauhaus",
  ja: "バウハウス",
  en: "Bauhaus",
  era: "1919–1933",
  origin: "ドイツ",
  category: "movement",

  tagline: "丸・三角・四角と、赤青黄だけで世界を組み直す",

  description:
    "ヴァイマルに開かれた美術学校が、たった14年で現代デザインの文法をつくった。" +
    "職人の手仕事と工業生産を同じ机に載せ、装飾ではなく機能から形を決める、という考え方を持ち込んだ。" +
    "だから残った絵は驚くほど少ない要素でできている。円・三角・正方形の三原型、赤・青・黄の三原色、そして黒。" +
    "ナチスに閉鎖されたあと教師たちが各国へ散り、その文法だけが世界中に残った。",

  traits: [
    "円・三角・正方形の三原型で組む",
    "赤・青・黄＋黒。中間色を使わない",
    "版面に見えないグリッドが必ずある",
    "文字は小文字だけ、縦に倒すことがある",
    "重心を中央から外し、斜めの力で持たせる",
  ],

  avoid: [
    "陰影やグラデーションで立体を出すこと",
    "手描きの筆致・ざらついた質感",
    "装飾のための装飾（縁飾り・飾り罫）",
  ],

  palette: ["#f0ede3", "#111111", "#d8262a", "#1a49c4", "#f2c200"],

  prompt: {
    core: "Bauhaus poster design, geometric abstraction, primary shapes",
    texture: "flat vector fills, no gradients, crisp hard edges, matte paper stock",
    palette:
      "strict primary palette — red, blue, yellow, black on warm off-white; no intermediate tones",
    composition:
      "asymmetric layout on a strict modular grid, off-centre focal mass, one diagonal cutting the field, generous negative space, lowercase sans-serif type set vertically",
    negative:
      "no gradients, no drop shadows, no 3D rendering, no photorealism, no ornamental flourishes, no hand-drawn texture, no pastel colours",
  },

  related: ["de-stijl", "suprematism", "swiss-style", "russian-constructivism"],
};
