import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "halftone",
  ja: "ハーフトーン（網点）",
  en: "Halftone",
  era: "19世紀–",
  origin: "印刷技術",
  category: "print",

  tagline: "灰色を刷れない機械が、点の大小で灰色を作った",

  description:
    "印刷機はインクを「置く／置かない」でしか刷れない。中間の灰色を出す手立てが、そもそも機械の側にない。" +
    "そこで19世紀後半、撮影と製版のあいだにガラスの網を挟み、明るい所は小さい点、暗い所は大きい点へと像を分解する方法が実用化した。" +
    "離れて見れば点は溶けて階調に見える。" +
    "カラーも同じことを4版重ねるが、網の角度を揃えるとモアレが出るので、版ごとに15度ずつ回してある。" +
    "この「近づけば点でしかない」性質を拡大して正面から見せたものが、様式としてのハーフトーンになった。",

  traits: [
    "点の大小だけで階調を作る。灰色は塗らない",
    "網の角度を版ごとに15度ずつずらす",
    "点を粗くするほど、古い印刷の顔になる",
    "拡大した点を主役にし、輪郭を階段状に見せる",
    "CMYK4版のズレを1〜2px残す",
  ],

  avoid: [
    "なめらかな階調でぼかすこと",
    "点を不規則に散らすこと（それは砂目）",
    "全版の網角度を揃えること",
  ],

  palette: ["#f4f1e8", "#111111", "#e0322a", "#2a5fd0", "#f2b400"],

  prompt: {
    core: "halftone print reproduction, dot-screen tonal separation",
    texture:
      "amplitude-modulated dot screen at a coarse 20-40 lpi so individual dots read at arm's length, black screen at 45 degrees with cyan at 15 and magenta at 75, visible rosette pattern, dot gain on absorbent newsprint",
    palette:
      "black ink (#111111) on warm newsprint white (#f4f1e8), plus process red (#e0322a), process blue (#2a5fd0) and yellow (#f2b400) as separate plates; every tone built from dot size alone, never from mixed ink",
    composition:
      "one high-contrast subject cropped tight, tonal range reduced to about five dot densities, one zone blown up until the dots become the picture itself, hard stepped edges where the screen meets bare paper, colour plates 1-2px off register, wide untrimmed margin",
    negative:
      "no smooth gradients, no continuous-tone photography, no airbrush, no anti-aliased edges, no random film grain, no identical screen angles across plates",
  },

  related: ["pop-art", "risograph", "duotone", "collage"],
};
