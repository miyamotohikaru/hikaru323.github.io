import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "psychedelic",
  ja: "サイケデリック・アート",
  en: "Psychedelic Art",
  era: "1960s",
  origin: "アメリカ",
  category: "movement",

  tagline: "読めなくていい。文字が溶けて絵の一部になる",

  description:
    "1960年代半ば、サンフランシスコのダンスホールに貼るコンサートポスターとして生まれた。" +
    "幻覚体験の見え方——視界がうねる、輪郭が溶ける、補色が目の中で振動する——を、紙の上で起こそうとしている。" +
    "だから文字は読ませる道具ではなく、絵の輪郭に沿って流し込む素材として扱う。" +
    "手本にしたのはアール・ヌーヴォーの曲線とウィーン分離派の書体だった。" +
    "読み解くのに数秒かかることは欠点ではなく、分かる人にだけ届くという合図でもあった。",

  traits: [
    "文字を輪郭に沿わせて伸ばし、隙間を埋める",
    "補色を境界線なしで直接隣り合わせる",
    "同心円と波紋で画面全体をうねらせる",
    "地も柄にする。余白を残さない",
    "中央に左右対称の図像を据える",
  ],

  avoid: [
    "文字を読みやすく整えること",
    "黒い輪郭線で色を仕切ること",
    "パステルで柔らかくまとめること",
  ],

  palette: ["#2b0a4a", "#ff5f1f", "#ffd400", "#00b3a4", "#ff2e88"],

  prompt: {
    core: "1960s psychedelic concert poster, hand-lettered liquid type",
    texture:
      "screen-printed flat inks on poster stock, hand-inked contour lines of varying weight, slight ink misregistration, no gradients except hard radiating colour bands",
    palette:
      "vibrating complementary pairs — orange (#ff5f1f) against teal (#00b3a4), magenta (#ff2e88) against chrome yellow (#ffd400), all on a deep violet ground (#2b0a4a); fully saturated, colours meeting edge to edge with no black keyline between them",
    composition:
      "bilateral symmetry around a single central figure, lettering melted and stretched to follow the artwork's contours and fill every remaining gap, concentric ripples and paisley eddies covering the ground, Art Nouveau whiplash border, zero empty space, no straight baselines",
    negative:
      "no legible grid-based typography, no black keyline separating colours, no pastel palette, no photographic realism, no drop shadows, no white margins",
  },

  related: ["art-nouveau", "op-art", "pop-art", "acid-graphics"],
};
