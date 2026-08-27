import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "afrofuturism",
  ja: "アフロフューチャリズム",
  en: "Afrofuturism",
  era: "1990s–",
  origin: "アメリカ",
  category: "world",

  tagline: "奪われた過去の代わりに、自分たちの未来を先に書く",

  description:
    "1993年に批評家マーク・デリーが名づけたが、実践そのものはもっと古く、" +
    "サン・ラーのバンドやジョージ・クリントンのステージにまでさかのぼる。" +
    "奴隷貿易は、アフリカ系ディアスポラから家系も土地も言語も奪った。" +
    "遡れる過去がないなら、代わりに未来のほうを自分たちの手で書く。それがこの表現の動機である。" +
    "だから宇宙船やアンドロイドが出てきても、それは西洋SFの借り物ではない。" +
    "西アフリカの織りや幾何、金と真鍮の細工が同じ画面で技術と等価に置かれ、黒い肌が未来の中心に据えられる。",

  traits: [
    "西アフリカの織りと幾何を構造に使う",
    "金・真鍮の細工を技術部品として扱う",
    "黒い肌を主役に、正面から強く照らす",
    "深い宇宙の紺に金・青緑・朱を差す",
    "左右対称の紋章的な構図で中心に据える",
  ],

  avoid: [
    "「部族風」の装飾として消費すること",
    "西洋SFの銀色メカに置き換えること",
    "土色だけの「アフリカらしさ」に落とすこと",
  ],

  palette: ["#0d0a1f", "#f2b705", "#00c2a8", "#e8452a", "#f4e9d8"],

  prompt: {
    core: "Afrofuturism, Black diasporic science fiction imagery",
    texture:
      "hand-woven kente strip-cloth weave, hammered brass and cast gold, cowrie shell and glass beadwork, polished obsidian, iridescent metallic foil, crisp rendering with clean specular highlights",
    palette:
      "deep cosmic indigo-black ground, radiant gold, turquoise-teal, vermilion, warm bone ivory; high contrast with gold as the dominant light",
    composition:
      "frontal bilaterally symmetric heraldic composition, figure centred and filling the middle 50 percent, a circular halo or orbital ring behind the head, woven geometric bands framing the left and right edges, strong frontal key light on dark skin with warm gold rim light, star field filling the remaining ground",
    negative:
      "no generic tribal-print decoration, no safari or mud-hut clichés, no earth-only desaturated palette, no chrome Western sci-fi robots, no caricature, no exoticised costume used as ornament",
  },

  related: ["cyberpunk", "retrofuturism", "chicano", "maximalism"],
};
