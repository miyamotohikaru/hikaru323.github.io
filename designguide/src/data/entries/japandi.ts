import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "japandi",
  ja: "ジャパンディ",
  en: "Japandi",
  era: "2010s–",
  origin: "日本×北欧",
  category: "japan",

  tagline: "ヒュッゲと簡素を折衷した、買える「整った静けさ」",

  description:
    "2010年代のインテリア業界が、北欧のヒュッゲと日本の簡素を掛け合わせてつくった様式である。" +
    "わびさびが古びと不完全を残すのに対して、こちらは新品のまま整えられていることが前提になる。" +
    "つまりこれは美意識ではなく、家具と内装と通販カタログのための実務的な語彙だ。" +
    "だから決め手になるのは物の量と高さで、家具は低く、面はマットに揃い、置かれる物は極端に減らされる。" +
    "色は生成りと薄いオーク材を土台にして、炭色を一点だけ締めに置く。",

  traits: [
    "家具を低く。視線より上に物を置かない",
    "白オーク・生成りに炭色を一点だけ",
    "艶を消す。塗り壁も布もマットに",
    "物量を減らし、面そのものを見せる",
    "光は間接照明と拡散した自然光",
  ],

  avoid: [
    "歪みや欠けを見せること（わびさび）",
    "北欧の原色アクセント（黄・青）",
    "金・鏡面・光沢のある仕上げ",
  ],

  palette: ["#eae5db", "#b9ab97", "#6f6656", "#2f2c26", "#c8bfae"],

  prompt: {
    core: "Japandi interior, Japanese-Scandinavian hybrid",
    texture:
      "matte lime-plaster walls, pale white-oak and ash veneer with straight open grain, undyed linen and boucle, unglazed matte ceramic, brushed black steel, shoji-paper diffusion; every surface dead matte",
    palette:
      "warm off-white and raw linen base, pale oak tan, muted greige, one charcoal black anchor, a single dry-sage note; no bright accents, no primary colours",
    composition:
      "eye-level one-point interior view, furniture kept low so the top 40 percent of the wall stays empty, the sideboard's horizontal line crossing the lower third, exactly two or three objects spaced widely apart, soft diffused daylight from frame left plus a warm indirect glow, no clutter and no visible cables",
    negative:
      "no gloss or mirror finishes, no gold or brass, no chipped or cracked objects, no bright Scandinavian primary accents, no visual clutter, no ornate pattern, no cool blue lighting",
  },

  related: ["wabi-sabi", "scandinavian", "minimalism", "mid-century-modern"],
};
