import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "gothic-botanical",
  ja: "ゴシック・ボタニカル",
  en: "Gothic Botanical",
  era: "2010s–",
  origin: "折衷",
  category: "movement",

  tagline: "植物図譜を夜へ沈め、標本に死の匂いを足す",

  description:
    "19世紀の植物図譜と、ヴィクトリア朝の喪の文化が、SNSの上で再び結びついたもの。" +
    "銅版画の細いハッチングという描き方はそのまま借りたうえで、地だけを白から黒へ沈めている。" +
    "選ばれる植物も咲いた花ではなく、シダ・ケシ・毒草・押し花・乾いた標本で、そこに骨や蛾が並ぶ。" +
    "だから描線は精密なのにどこか湿っていて、修道院の薬草園と、死者を悼むための標本箱が、同じ一枚の紙に同居する。",

  traits: [
    "地を黒か深い森緑に落として描く",
    "銅版画の細線で葉脈と胞子まで引く",
    "毒草・シダ・ケシ・蛾・骨を選ぶ",
    "左右対称に組み、祭壇のように据える",
    "学名のラベルを小さく足す",
  ],

  avoid: [
    "白地に咲いた明るい生花",
    "水彩のにじみとパステル",
    "蛍光色やネオンの混入",
  ],

  palette: ["#101512", "#2f4a35", "#7a2f3a", "#c8b88a", "#e6e2d6"],

  prompt: {
    core: "gothic botanical illustration, dark herbarium plate",
    texture:
      "copperplate engraving hatching and stipple, pressed dried specimens on foxed antique paper, thin gold foil accents, matte velvet blacks, no visible brush marks",
    palette:
      "near-black ground with deep forest green foliage, oxblood burgundy blooms, antique tan gold, bone white line work; heavily desaturated, single low-key chroma",
    composition:
      "bilaterally symmetrical altar-like arrangement, one specimen centred with mirrored fronds spreading left and right, hand-lettered latin binomial on a small label at the base, moths and small bones filling the lower corners, deep vignette darkening all four corners, roughly 25 percent of the field left black and empty",
    negative:
      "no bright daylight, no fresh cut flowers, no pastel watercolour bleed, no neon, no white background, no cartoon outlines, no glossy 3D rendering",
  },

  related: ["gothic", "dark-academia", "victorian", "art-nouveau"],
};
