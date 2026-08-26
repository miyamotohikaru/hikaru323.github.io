import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "dark-academia",
  ja: "ダーク・アカデミア",
  en: "Dark Academia",
  era: "2019–",
  origin: "SNS",
  category: "internet",

  tagline: "古い大学、冬の図書館。学ぶことに溺れてみせる",

  description:
    "ドナ・タートの小説『シークレット・ヒストリー』が下敷きにあり、" +
    "北半球の古い大学を舞台にしたイメージ群として2019年から2020年にかけて広がった。" +
    "校舎に通えなくなった学生たちが、学舎そのものを恋しがったのが加速の理由だ。" +
    "憧れの対象は学問というより、石造りの回廊と暗い書架がつくる「閉じた場所」のほうにある。" +
    "だから光源はいつも一つだけで、窓は高く細く、机の外は闇に落ちている。" +
    "ツイードとラテン語と、少しの後ろ暗さが必ずひと組で出てくる。",

  traits: [
    "光源は一つ。机の外は闇に落とす",
    "ツイード・革・真鍮・古紙の四素材",
    "積んだ古書と、開いた頁の手書き文字",
    "色は焦茶からベージュまでで止める",
    "窓は高く細く、外は曇りか夜にする",
  ],

  avoid: [
    "ゴシックホラーの怪奇趣味",
    "蛍光灯の明るい現代の教室",
    "黒一色の耽美（色は茶で作る）",
  ],

  palette: ["#1c1712", "#5c4a32", "#8a7350", "#c9b892", "#2f2a22"],

  prompt: {
    core: "dark academia photography, old European university interior",
    texture:
      "candlelight and single-window lighting, tweed wool, cracked leather bookbinding, tarnished brass, foxed and yellowed paper, fine 35mm grain, heavy vignette",
    palette:
      "deep bistre brown, tobacco, aged parchment beige, oxblood accent, warm brass highlight; no pure black, no cool blues, low saturation",
    composition:
      "one directional light source from a tall narrow window at frame left, subject about 40 percent in from the left, deep falloff into shadow filling the right 50 percent, stacked books and handwritten pages in the near foreground, low camera looking along a stone corridor, large areas of unreadable darkness",
    negative:
      "no fluorescent or overhead lighting, no bright daylight, no modern furniture, no saturated colours, no gothic horror props, no skulls or cobwebs, no digital screens",
  },

  related: ["light-academia", "victorian", "gothic", "cottagecore"],
};
