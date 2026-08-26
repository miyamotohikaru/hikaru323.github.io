import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "flat-design",
  ja: "フラットデザイン",
  en: "Flat Design",
  era: "2012–",
  origin: "UI",
  category: "screen",

  tagline: "影も光沢も剥がす。残るのは色と余白と文字だけ",

  description:
    "2010年前後、画面の側の事情が変わった。" +
    "同じ画面を電話からデスクトップまで幅を変えて出すことになり、木目やレザーを敷いた画像は引き伸ばしに耐えられなくなった。" +
    "解像度も上がって、擬似的な立体はかえって古びて見えた。" +
    "そこでMicrosoftのMetroとiOS 7が、影も光沢も質感も一斉に落とした。" +
    "残ったのは面の色、余白、太いサンセリフ、太さの一定した線のアイコンだけ。" +
    "ただし削りすぎて「どこが押せるのか分からない」という別の問題が生まれ、次のマテリアルデザインがそこに答えることになる。",

  traits: [
    "影・光沢・質感をゼロにする",
    "面は単色ベタ。境目は色の差だけで作る",
    "アイコンは同じ太さの線か、単色の影絵",
    "余白を広く取り、矩形を格子に整列させる",
    "彩度の高い色を4〜5色だけ決めて使い回す",
  ],

  avoid: [
    "わずかでも影やグラデーションを足すこと",
    "ボタンを実物のように見せること",
    "立体的・斜め45度のアイコンを使うこと",
  ],

  palette: ["#f5f6f8", "#2d9cdb", "#eb5757", "#f2c94c", "#27ae60"],

  prompt: {
    core: "flat design UI, two-dimensional interface, no depth cues",
    texture:
      "pure flat vector fills, zero gradients, zero shadows, zero bevels, crisp pixel-aligned edges, uniform 2px stroke icons",
    palette:
      "cool near-white background (#f5f6f8) with four saturated accents — sky blue (#2d9cdb), coral red (#eb5757), amber (#f2c94c), leaf green (#27ae60); solid fills only, no tints, no blends, one accent per region",
    composition:
      "rectangular cards aligned to an 8px grid, generous even padding, a single geometric sans-serif at two sizes, simple 24px line icons, full-width blocks of flat colour, wide negative space, everything left-aligned",
    negative:
      "no drop shadows, no gradients, no bevels or embossing, no textures, no realistic materials, no skeuomorphic metaphors, no 3D perspective",
  },

  related: ["swiss-style", "material-design", "skeuomorphism", "minimalism"],
};
