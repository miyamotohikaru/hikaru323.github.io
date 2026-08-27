import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "new-wave",
  ja: "ニュー・ウェーブ・デザイン",
  en: "New Wave Design",
  era: "1970s–1980s",
  origin: "スイス",
  category: "movement",

  tagline: "グリッドを覚えた者が、内側からそれを壊す",

  description:
    "壊したのは外部の反逆者ではなく、スイス・スタイルを教える側に立った人間だった。" +
    "バーゼルのヴァインガルトは、自分が仕込んだ規律に飽きて、グリッドを残したまま中身を暴れさせる。" +
    "字間を極端に開け、行を階段状にずらし、罫線を太らせ、写植フィルムを重ねて版ズレをわざと起こした。" +
    "整理のための道具が、整理して見せるための遊びに反転した瞬間で、これが80年代のアメリカへ渡り、初期Macintoshの粗い画素と蛍光色を吸って加速する。",

  traits: [
    "字間を極端に開け、行を段でずらす",
    "太い罫線と網掛けを層にして重ねる",
    "版ズレを故意に出す、ずらした二重刷り",
    "文字を斜めに倒し、枠から食み出させる",
    "蛍光色を一色だけ黒の上に置く",
  ],

  avoid: [
    "整然と揃ったグリッド（スイス）",
    "手描きの筆致と有機的な曲線",
    "中間色だけで穏やかにまとめる",
  ],

  palette: ["#f2f0ea", "#111111", "#e8462a", "#2f6fd0", "#f2c200"],

  prompt: {
    core: "Swiss New Wave typographic poster, Weingart Basel experiment",
    texture:
      "phototypesetting film overlays, deliberate off-register printing, coarse 20-line dot screens, heavy keyline rules, xerox-sharp edges, flat screened tint bands",
    palette:
      "warm off-white stock, black, hot vermilion orange-red, cobalt blue and chrome yellow laid as separate flat inks, one fluorescent hit on top",
    composition:
      "the grid is visible but violated — stepped baselines, extreme letterspacing on the headline, type set at 15 and 90 degrees, elements bleeding off the trim edge, layered translucent screened bands crossing each other, small dense text clusters floating in deliberate imbalance, the focal mass pushed into one corner",
    negative:
      "no tidy aligned grid, no single-weight neutral typography, no hand-drawn illustration, no photorealism, no soft gradients, no muted harmony, no centred symmetry",
  },

  related: ["swiss-style", "memphis", "punk", "deconstructivism"],
};
