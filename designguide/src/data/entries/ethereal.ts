import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "ethereal",
  ja: "エセリアル",
  en: "Ethereal Aesthetic",
  era: "2010s–",
  origin: "SNS",
  category: "internet",

  tagline: "霧と光でものの輪郭を溶かし、身体を半分だけ残す",

  description:
    "2010年代のPinterestとTumblrで育った、実体を持たないことへの憧れである。" +
    "天使、妖精、水中、朝霧と、引かれてくる参照はばらばらだが、" +
    "共通しているのは輪郭をはっきりさせないという一点だけだ。" +
    "コテージコアが場所に、アカデミアが知に憧れたのに対して、ここで憧れられているのは身体からの離脱そのものになる。" +
    "だから被写体は必ず光に食われ、色は白の側へ寄り、" +
    "薄いラベンダーと水色と桜色がフィルター一枚ぶんだけ残る。",

  traits: [
    "輪郭を光で食わせ、境界を作らない",
    "白の上に薄紫・水色・桜色を一枚だけ",
    "霧・薄布・水面のどれかを必ず通す",
    "逆光でハレーションを起こす",
    "重力を感じさせない浮いた姿勢",
  ],

  avoid: [
    "はっきりした黒い輪郭線",
    "彩度の高いパステル（ゆめかわとの混同）",
    "地面や床をしっかり描くこと",
  ],

  palette: ["#f7f4f8", "#e3d5ee", "#cfe3ea", "#f6e0e6", "#8a7f96"],

  prompt: {
    core: "ethereal aesthetic, diaphanous dreamlike figure",
    texture:
      "heavy backlit halation, soft-focus diffusion filter, layered silk organza and gauze, water-surface caustics, fine mist, 85mm lens at f/1.4, milky lifted blacks",
    palette:
      "near-white base with a single translucent wash of pale lavender, ice blue and blush pink; low saturation, high key, no true black point",
    composition:
      "strong backlight blowing out the top third of the frame, subject centred but dissolving at its edges, no visible ground plane or horizon, floating drapery filling the lower half, wide soft vignette, every value above middle grey",
    negative:
      "no hard outlines, no black shadows, no high contrast, no saturated colours, no visible floor or horizon, no sharp detail, no neon, no heavy makeup",
  },

  related: ["dreamcore", "cottagecore", "light-academia", "rococo"],
};
