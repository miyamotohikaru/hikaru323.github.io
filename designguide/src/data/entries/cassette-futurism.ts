import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "cassette-futurism",
  ja: "カセット・フューチャリズム",
  en: "Cassette Futurism",
  era: "1970s–1980s",
  origin: "SF映画",
  category: "movement",

  tagline: "未来がまだ、ベージュの筐体とブラウン管でできていた頃",

  description:
    "1979年の『エイリアン』の船内や、当時の管制室の機材が原型にある。" +
    "描かれているのは過去そのものではなく、その時代の人が想像していた未来のほうだ。" +
    "だから宇宙船の計器は液晶ではなくブラウン管で、単色の緑の文字が走査線ごとに滲む。" +
    "筐体は日焼けしたベージュのABS樹脂で、操作は必ず押し込む物理スイッチかトグルになる。" +
    "ラベルは手打ちのテープライターで貼られ、" +
    "紙はドットマトリクスプリンタから折り目つきで出てくる。",

  traits: [
    "CRTの単色発光。走査線と滲みを残す",
    "日焼けしたベージュ樹脂の筐体",
    "物理トグル・押しボタン・回転ノブ",
    "ラベルテープと連続用紙の折り目",
    "文字は等幅のドットマトリクス書体",
  ],

  avoid: [
    "薄型の液晶とガラスのタッチ面",
    "ネオンの紫とピンク（シンセウェイヴ）",
    "1950年代の丸みと原子力の楽観",
  ],

  palette: ["#d8d2c2", "#3a3f45", "#c8552b", "#e0a33e", "#1f2327"],

  prompt: {
    core: "cassette futurism, 1979 analogue spacecraft interior",
    texture:
      "sun-yellowed beige ABS plastic, textured injection-moulded panels, monochrome green phosphor CRT with visible scanlines and bloom, backlit toggle switches, embossed Dymo label tape, fanfold dot-matrix printout, worn rubber keycaps",
    palette:
      "yellowed beige and warm grey shell, phosphor green or amber screen glow, safety orange and signal yellow accents, dark charcoal recesses; muted and faded overall",
    composition:
      "eye-level frontal view of a dense control panel filling the frame, instruments packed into a strict rectangular grid with visible panel seams, one glowing CRT at the upper-left third as the only light source, cable looms and conduit running along the bottom edge, monospaced dot-matrix labelling, mild wide-angle lens distortion",
    negative:
      "no flat glass touchscreens, no thin bezels, no LED strips, no neon pink or purple, no holograms, no chrome, no 1950s atomic curves, no clean minimalism",
  },

  related: ["retrofuturism", "cyberpunk", "pixel-art", "dieselpunk"],
};
