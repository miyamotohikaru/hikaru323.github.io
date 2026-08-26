import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "woodcut",
  ja: "木版画",
  en: "Woodcut",
  era: "15世紀–",
  origin: "ヨーロッパ／日本",
  category: "print",

  tagline: "刀で彫り残した所だけが、黒くなって出てくる",

  description:
    "板を彫り、彫り残した凸の面にだけインクが乗る。つまり描く作業ではなく、白くしたい所を削り取る作業になる。" +
    "刃物は細く曲がった線を苦手とするから、線は太く短くなり、影は平行線と交差線の束で作る。" +
    "木は目に沿って裂けるので、彫り跡は木目の向きに引きずられ、端は必ず少し欠ける。" +
    "多色にするときは色ごとに版を分けて刷り重ねるが、輪郭を受け持つ主版が一枚あって、そこが絵の骨格になる。",

  traits: [
    "白くしたい所を彫る、という順番で組む",
    "線は太く短く。平行線と交差線で影を作る",
    "彫り跡の向きを木目にそろえる",
    "輪郭の主版に、色ごとの色版を重ねる",
    "端をわずかに欠けさせ、インクをムラにする",
  ],

  avoid: [
    "細く均一なペン線で描くこと",
    "なめらかな階調で陰影を作ること",
    "輪郭をきれいに閉じきること",
  ],

  palette: ["#efe6d2", "#1a1a1a", "#b03a2e", "#3f5c4a", "#d9c9a8"],

  prompt: {
    core: "woodcut relief print, hand-carved block, key block plus colour blocks",
    texture:
      "gouged wood-grain marks running with the grain, thick blunt-ended carved strokes, parallel and cross-hatched shading, chipped ragged edges, uneven hand-burnished ink coverage, absorbent laid rag or washi paper",
    palette:
      "black key block (#1a1a1a) on warm cream paper (#efe6d2), plus two flat colour blocks — iron-oxide red (#b03a2e) and pine green (#3f5c4a) — with sand (#d9c9a8) for the ground; opaque flat ink only, no blended tones",
    composition:
      "a bold silhouette that still reads at thumbnail size, all tonal value carried by line spacing alone, the black key outline binding every shape, colour blocks printed 1-2mm off that outline, carved decorative border framing the image, flat space with no perspective recession",
    negative:
      "no fine uniform pen lines, no smooth gradients, no airbrush shading, no photographic detail, no anti-aliased vector edges, no glossy coated paper",
  },

  related: ["expressionism", "japonisme", "halftone"],
};
