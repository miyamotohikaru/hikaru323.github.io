import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "material-design",
  ja: "マテリアルデザイン",
  en: "Material Design",
  era: "2014–",
  origin: "Google",
  category: "screen",

  tagline: "画面を紙だと決める。厚さ1dp、光は必ず真上から",

  description:
    "2014年、Googleが自社のすべての画面を一つの規則で説明するために作った。" +
    "フラットデザインで消えてしまった「押せる」「重なっている」という手がかりを、実物の模倣ではなく物理の決まりごとで取り戻している。" +
    "画面上の面はすべて厚さ1dpの紙で、伸び縮みはするが折れも透けもしない。" +
    "光源は常に真上にあり、高さの値が大きい面ほど影は広く柔らかくなる。" +
    "つまり影は雰囲気づくりの飾りではなく、どれが手前かを示す数値になっている。",

  traits: [
    "面は厚さ1dpの紙。折れず、透けない",
    "影の広さと柔らかさで高さを示す",
    "面の色はベタ。奥行きは影だけが担う",
    "円形の浮きボタンを右下に1つだけ置く",
    "余白は8dpの倍数。文字は左端でそろえる",
  ],

  avoid: [
    "影を雰囲気づくりに使うこと",
    "面を半透明にして重ねること",
    "光源を横や下に置くこと",
  ],

  palette: ["#fafafa", "#3f51b5", "#ff5252", "#ffc107", "#212121"],

  prompt: {
    core: "Material Design interface, elevated paper surfaces, 1dp sheets",
    texture:
      "flat opaque surfaces carrying a soft ambient shadow plus a key drop shadow, no gradient on the surfaces themselves, crisp edges, circular ripple highlight at the touch point",
    palette:
      "off-white background (#fafafa) with indigo 500 primary (#3f51b5), red A200 accent (#ff5252), amber 500 (#ffc107) and near-black text (#212121); solid palette swatches, exactly one primary and one accent",
    composition:
      "rectangular cards on an 8dp baseline grid, elevation stepped 1dp / 4dp / 8dp with the shadows widening accordingly, a single light source directly overhead, coloured app bar across the top, one circular floating action button at the lower right, left-aligned Roboto at 16sp body and 20sp title, 16dp margins",
    negative:
      "no translucency or frosted glass, no bevels or embossing, no skeuomorphic textures, no decorative shadows, no side or bottom lighting, no gradients on surfaces",
  },

  related: ["flat-design", "skeuomorphism", "neumorphism", "swiss-style"],
};
