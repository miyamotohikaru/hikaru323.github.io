import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "kitsch",
  ja: "キッチュ",
  en: "Kitsch",
  era: "20世紀",
  origin: "欧米",
  category: "movement",

  tagline: "悪趣味と分かっていて、それを選ぶ楽しさ",

  description:
    "語源はドイツ語の kitschen、「かき集める」。" +
    "19世紀の都市に中産階級が生まれ、本物の絵画は買えないが飾りたい人のために、模造と複製が大量に作られたところから始まる。" +
    "だから甘さも感動も一段濃く、遠慮がない。石膏の天使、ビロードに描いた仔犬、庭のノーム。" +
    "20世紀後半に「キャンプ」という見方が加わって、このわざとらしさを承知のうえで選ぶ態度そのものが、ひとつの様式になった。",

  traits: [
    "パステルの地に原色を1〜2色だけ差す",
    "模造の質感。石膏・ビロード・プラスチック",
    "感情はひとつだけ極端に。愛・幸福・郷愁",
    "ハート・リボン・貝形の縁飾りで囲う",
    "主役は正面向き、笑顔、画面の中央",
  ],

  avoid: [
    "皮肉を隠して上品に見せること",
    "くすんだ色でトーンを揃えること",
    "本物の素材感を出すこと",
  ],

  palette: ["#ffd9e8", "#ff4f9a", "#ffd23f", "#3ec1d3", "#2b2b2b"],

  prompt: {
    core: "kitsch decorative art, sentimental mass-market ornament",
    texture:
      "velvet painting surface, glazed porcelain figurine, cheap plastic sheen, gold plastic trim, airbrushed soft focus, printed souvenir finish, glitter flecks",
    palette:
      "candy palette — bubblegum pink (#ff4f9a) on pale rose ground (#ffd9e8), buttercup yellow (#ffd23f), turquoise (#3ec1d3), outlined in soft black; fully saturated, no earth tones, no muted greys",
    composition:
      "one subject centred and facing the viewer, strict bilateral symmetry, scalloped border of hearts and ribbons, four-point twinkle highlights on the eyes, airbrushed gradient sky backdrop, every corner filled with small ornaments",
    negative:
      "no ironic distance in the rendering, no muted colours, no gritty realism, no minimalism, no dark moody lighting, no loose fine-art brushwork",
  },

  related: ["pop-art", "maximalism", "rococo", "vaporwave"],
};
