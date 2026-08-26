import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "rococo",
  ja: "ロココ",
  en: "Rococo",
  era: "18世紀",
  origin: "フランス",
  category: "movement",

  tagline: "重い教会を出て、貝殻と桃色で軽く崩れていく",

  description:
    "ルイ14世が死に、宮廷がヴェルサイユからパリの邸宅へ移ったとき、装飾の目的も変わった。" +
    "神を讃えて人を圧倒するためではなく、私的な小さい部屋で親しく楽しむためのものになったのである。" +
    "だから重い金と黒は退き、桃色、水色、淡い黄が入り、左右対称はわざと崩される。" +
    "名前の由来は岩と貝殻を意味するロカイユで、装飾はC字とS字の曲線が非対称に絡み合う形をとる。バロックが見上げる劇なら、こちらは手元で眺める甘さだ。",

  traits: [
    "左右非対称。C字とS字の曲線で飾る",
    "貝殻・岩・花綱・リボンを縁に置く",
    "桃・水色・薄黄など高明度の淡色で",
    "金は細い線としてだけ控えめに使う",
    "光は柔らかく回り、強い影を作らない",
  ],

  avoid: [
    "闇を半分使う劇的な明暗",
    "厳格な左右対称と直線の枠",
    "彩度の高い原色を使うこと",
  ],

  palette: ["#f5ece2", "#e8c4d0", "#c9d6c4", "#d9b45a", "#5a4a3a"],

  prompt: {
    core: "Rococo decorative painting, rocaille ornament",
    texture:
      "soft oil on canvas with feathered blending, powdery pastel surface, gilded carved wood mouldings, silk and porcelain finishes, delicate glazes, no hard edges",
    palette:
      "high-key pastels — rose pink, sky blue, pistachio green, cream and pale gold; low contrast, no black, gold reserved for thin lines only",
    composition:
      "asymmetric C-scroll and S-scroll cartouche framing, shell and rocaille motifs at the corners, garlands and ribbons trailing off one side only, a small intimate pastoral or amorous scene set slightly off-centre, diffuse even light with almost no cast shadow, airy open sky filling the upper third",
    negative:
      "no heavy chiaroscuro, no black or deep shadow, no strict bilateral symmetry, no saturated primary colours, no monumental scale, no straight rectangular frames",
  },

  related: ["baroque", "neoclassicism", "victorian", "kitsch"],
};
