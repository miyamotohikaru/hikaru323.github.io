import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "y2k",
  ja: "Y2K",
  en: "Y2K Aesthetic",
  era: "1997–2004",
  origin: "ネット／ポップ",
  category: "internet",

  tagline: "銀と半透明の樹脂。未来を無邪気に信じていた頃の手ざわり",

  description:
    "2000年前後、実物の工業製品に出ていた様式。" +
    "半透明の色つき樹脂、鏡面のクローム、ホログラム箔、丸く膨らんだ形。" +
    "iMac、折りたたみ携帯、MDプレーヤー、CDのジャケット。" +
    "根にあるのは「新しい世紀とインターネットで、暮らしはこのまま良くなる」という無邪気な楽観で、" +
    "だから未来は銀色で、軽くて、つるつるしている。" +
    "ヴェイパーウェイヴやシンセウェイヴが後年に作った憧憬なのに対し、こちらは当時ほんとうに店に並んでいた。だから写真に撮れる。",

  traits: [
    "半透明の色つき樹脂と鏡面クロームを併置",
    "形はすべて膨らませる。角を残さない",
    "見る角度で色が変わるホログラム箔を貼る",
    "極細で斜体のサンセリフを大きく置く",
    "白飛びするほど強い正面フラッシュを当てる",
  ],

  avoid: [
    "マット・木・布などの温かい素材",
    "夜のネオン格子と沈む太陽",
    "くすんだ退色やVHSノイズ",
  ],

  palette: ["#0a0a1a", "#c0c8d8", "#ff5ad4", "#5ce1ff", "#f2f2f8"],

  prompt: {
    core: "Y2K aesthetic, late-1990s translucent plastic and chrome product styling",
    texture:
      "frosted translucent injection-moulded plastic, polished liquid chrome with sharp environment reflections, iridescent holographic foil, hard on-camera flash with blown highlights, studio product photography, four-point star lens glint",
    palette:
      "brushed silver #c0c8d8 and near-white #f2f2f8 as the base, bubblegum magenta #ff5ad4 and ice cyan #5ce1ff translucent accents, deep blue-black #0a0a1a backdrop; cool, metallic, high key",
    composition:
      "a single hero object centred and shot straight on, inflated blob geometry with no sharp corners, chrome lettering in extra-condensed italic sans set very large across the top, star glints at three highlight points, seamless gradient studio backdrop, tight crop with a 15% margin",
    negative:
      "no matte materials, no wood, no fabric, no warm earth tones, no neon grid horizon, no VHS noise, no faded film look, no flat vector illustration, no 1980s sunset, no rust or wear",
  },

  related: ["frutiger-aero", "vaporwave", "synthwave", "kitsch"],
};
