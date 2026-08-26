import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "light-academia",
  ja: "ライト・アカデミア",
  en: "Light Academia",
  era: "2020–",
  origin: "SNS",
  category: "internet",

  tagline: "同じ書架を、地中海の朝の光の側から見なおす",

  description:
    "ダーク・アカデミアの陰鬱さに疲れた層が、2020年に反対側へ振り切ってできた。" +
    "舞台は同じ古い学舎でも、参照先は北欧州の冬ではなく、地中海と古典期のギリシャ・ローマになる。" +
    "学ぶことは秘密の耽溺ではなく、友人と分けあう昼間の喜びとして描かれる。" +
    "だから光は高い窓から午前の白さで入り、影は薄く残るだけで、" +
    "色はクリームと生成りとオリーブで組まれる。" +
    "石膏像、乾いた石灰岩、洗いざらしのリネンが定番の材料になる。",

  traits: [
    "午前の白い光。影は薄く残す程度に",
    "クリーム・生成り・オリーブで組む",
    "石膏像と乾いた石灰岩を必ず置く",
    "本は閉じず、開いたまま重ねる",
    "白いリネンのシャツと素肌の腕",
  ],

  avoid: [
    "蝋燭一灯の暗い書斎にすること",
    "ツイードと焦茶の重い質感",
    "彩度の高い色を差すこと",
  ],

  palette: ["#f4efe4", "#d8cbb4", "#a8917a", "#6b5c48", "#302a22"],

  prompt: {
    core: "light academia photography, sunlit classical study",
    texture:
      "diffused morning daylight, plaster casts, dry limestone, washed linen, matte laid paper, gentle film grain, soft highlight bloom",
    palette:
      "cream white, raw linen beige, warm sand, muted olive, pale terracotta, soft walnut as the darkest note; no black, no saturated hues",
    composition:
      "high window light from frame right filling roughly 60 percent of the frame, subject placed left of centre, open books stacked flat and overlapping in the foreground, a plaster bust as the secondary mass in the middle ground, airy negative space across the top third, eye-level camera at f/4",
    negative:
      "no candlelight, no dark wood panelling, no heavy shadows, no tweed, no black clothing, no saturated colours, no night scenes, no gothic ornament",
  },

  related: ["dark-academia", "cottagecore", "neoclassicism", "ethereal"],
};
