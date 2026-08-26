import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "duotone",
  ja: "デュオトーン",
  en: "Duotone",
  era: "2015–",
  origin: "印刷／UI",
  category: "print",

  tagline: "写真から色を全部抜き、二色だけ入れ直す",

  description:
    "もとは印刷の補強の技法だった。モノクロ写真を黒1版で刷ると階調が浅く沈むので、特色をもう1色重ね、暗部と明部を別のインクに担当させて深みを出す。" +
    "2015年にSpotifyが自社の全画像へこれを適用したことで、使い道が変わった。" +
    "出どころも撮り方もばらばらな写真を、暗部にA色・明部にB色を代入するだけで、ひとつのトーンに揃えられる。" +
    "写真の中身は残したまま、色だけをブランドのものに置き換える仕掛けとして広まった。",

  traits: [
    "一度グレースケールにしてから2色を代入する",
    "暗部に濃い色、明部に明るい色を割り当てる",
    "中間色は2色の混色のみ。3色目を足さない",
    "コントラストを上げて中間調を削る",
    "上に白抜きの太いサンセリフを重ねる",
  ],

  avoid: [
    "元の写真の色をわずかでも残すこと",
    "3色目を足すこと（それはトライトーン）",
    "肌色だけ自然に戻すこと",
  ],

  palette: ["#1a1a2e", "#ff4d6d", "#4cc9f0", "#f2f2f2", "#0d0d1a"],

  prompt: {
    core: "duotone photographic treatment, two-ink gradient map",
    texture:
      "high-contrast grayscale conversion with crushed midtones, fine film grain, clean digital finish, no colour fringing, no vignette",
    palette:
      "gradient map running from midnight navy (#0d0d1a) in the shadows to hot coral (#ff4d6d) in the highlights, or navy to electric cyan (#4cc9f0); exactly two inks, every midtone formed by their blend; no third hue, no neutral grey, no natural skin tone",
    composition:
      "a single portrait or object shot against a plain ground, cropped tight so the subject fills 60-70% of the frame, heavy white sans-serif type in the lower-left third, a flat field of the highlight colour left empty opposite the subject",
    negative:
      "no full-colour photography, no third accent colour, no natural skin tones, no sepia, no gradients outside the two-ink ramp, no drop shadows",
  },

  related: ["halftone", "risograph", "flat-design", "minimalism"],
};
