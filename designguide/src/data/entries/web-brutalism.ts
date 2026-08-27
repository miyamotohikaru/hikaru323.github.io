import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "web-brutalism",
  ja: "Webブルータリズム",
  en: "Web Brutalism",
  era: "2014–",
  origin: "Web",
  category: "screen",

  tagline: "未訪問リンクの青と、ブラウザの初期値だけで殴る",

  description:
    "2014年ごろ、どのサイトも同じテンプレートに見えることへの反発として出た。" +
    "建築のブルータリズムがコンクリートの打ち放しを隠さなかったように、Webの素材＝HTMLの初期スタイルをそのまま晒す。" +
    "だから未訪問リンクは #0000EE の青に下線、見出しはTimes New Roman、ボタンはOSの素のまま。" +
    "快適さをわざと捨てているので、読みにくさや当たりの強さは失敗ではなく主張になる。",

  traits: [
    "リンクは #0000EE の青＋下線のまま",
    "書体はTimes New Romanと等幅のまま",
    "枠は1pxの黒実線。角丸にしない",
    "見出し120px超と本文12pxを隣に置く",
    "余白を詰め、要素をわざとぶつける",
  ],

  avoid: [
    "角丸・影・動きで整えること",
    "グリッドに乗せて綺麗に揃えること",
    "淡いパステルや上品な中間色",
  ],

  palette: ["#ffffff", "#0000ee", "#000000", "#ff0000", "#eeeeee"],

  prompt: {
    core: "web brutalism, raw HTML default styling, unstyled browser page",
    texture:
      "flat screenshot rendering, 1px solid black borders, default OS form widgets, Times New Roman and monospaced type, pure 100% white background, no anti-aliased softness",
    palette:
      "pure white #ffffff and pure black #000000, unvisited-link blue #0000ee underlined, alarm red #ff0000 on one element only, form-grey #eeeeee; no tints, no intermediate tones",
    composition:
      "single left-aligned column at the browser's default 8px body margin, one headline at 120px+ crashing into a 12px paragraph, an underlined blue link list stacked flush left, an unstyled table and a default button dropped in without alignment, deliberate collisions and uneven spacing",
    negative:
      "no rounded corners, no drop shadows, no gradients, no pastel colours, no hero image, no centred symmetric layout, no icon set, no grid alignment, no soft UI, no custom webfont",
  },

  related: ["brutalism", "punk", "anti-design", "dadaism"],
};
