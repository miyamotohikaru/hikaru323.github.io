import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "cottagecore",
  ja: "コテージコア",
  en: "Cottagecore",
  era: "2018–",
  origin: "SNS",
  category: "internet",

  tagline: "摘んだ花とパン焼き窯。誰も暮らしたことのない田舎",

  description:
    "2018年ごろのTumblrとTikTokで、都市の若い世代が「前の時代の田舎暮らし」を憧れの対象として共有しはじめた。" +
    "参照されているのは実在の農村ではなく、家賃と通勤とタイムラインが存在しない生活の記号としての田園である。" +
    "だから画面に並ぶのは、パン生地、摘みたての野の花、干した麻布、庭に迷い込んだ鶏といった、" +
    "自分の手で作れるものばかりになる。" +
    "光はいつも午後の斜光で、影はやわらかく、季節は初夏の終わりに固定されている。",

  traits: [
    "午後の斜光。硬い影を作らない",
    "野の花は摘みたてを無造作に束ねる",
    "麻・木綿・素焼き。合成素材を出さない",
    "くすんだ緑と生成りに干し草色を混ぜる",
    "人物は手元だけ映し、顔を入れない",
  ],

  avoid: [
    "花屋の整った花束にすること",
    "北欧インテリアの白い清潔さ",
    "真昼の強い直射日光と硬い影",
  ],

  palette: ["#f3ecdd", "#a8bd8a", "#d9a566", "#c26b6b", "#4a4636"],

  prompt: {
    core: "cottagecore aesthetic, rural domestic idyll",
    texture:
      "soft-focus 35mm film photography, Kodak Portra 400 grain, hand-woven linen and unglazed terracotta, flour dust in the air, gentle halation on highlights",
    palette:
      "desaturated sage green, oat cream, dried-wheat ochre, faded rose, weathered oak brown; everything pulled toward linen white, no saturated hues",
    composition:
      "low warm afternoon backlight about 15 degrees above the horizon, shallow depth of field at f/2, subject filling the lower two thirds, hands and objects only with no faces, a loose scatter of wildflowers breaking the bottom frame edge, wide soft background bokeh",
    negative:
      "no neon colours, no plastic or chrome, no midday sun, no hard shadows, no urban architecture, no modern electronics, no clinical white minimalism, no florist-tidy bouquets",
  },

  related: ["light-academia", "ethereal", "scandinavian", "art-nouveau"],
};
