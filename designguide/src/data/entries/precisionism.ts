import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "precisionism",
  ja: "プレシジョニズム",
  en: "Precisionism",
  era: "1920s–1930s",
  origin: "アメリカ",
  category: "movement",

  tagline: "工場と穀物庫を、無人の聖堂のように静かに描く",

  description:
    "1920年代のアメリカは、ヨーロッパの様式を借りずに自国を描くための題材を探していた。" +
    "シーラーやデムスがそれを見つけたのは、工場、サイロ、煙突、橋のトラスだった。" +
    "キュビズムの面の分割は借りるが、対象そのものは壊さない。" +
    "ヨーロッパの前衛が機械を速度として讃えたのに対し、こちらは機械を静止として讃えた。" +
    "輪郭を定規のように整え、光を面ごとの明度差に置き換え、人影を一切消す。だから産業の風景が、宗教画のような静けさを持ってしまう。",

  traits: [
    "建築を平らな面の集合に整理する",
    "輪郭は定規で引いたように硬く取る",
    "人物を画面から完全に消す",
    "光は斜めの明度帯として置く",
    "青灰・鉄錆・骨白の低彩度でまとめる",
  ],

  avoid: [
    "対象を分解して読めなくすること",
    "煙・汚れ・生活感の描写",
    "筆跡やにじみを残すこと",
  ],

  palette: ["#e2e6e8", "#6f8a9c", "#c07a4a", "#2b3540", "#d9c9a8"],

  prompt: {
    core: "Precisionist painting, industrial architecture, machine-age realism",
    texture:
      "smooth even oil or tempera with no visible brushwork, ruled hard edges, flat unmodulated planes, faint tooth of prepared board, airbrush-clean transitions",
    palette:
      "cool desaturated industrial range — slate blue-grey, pale concrete, bone white and deep charcoal navy, with a single rust-terracotta accent",
    composition:
      "grain elevators, factory sheds, smokestacks and bridge trusses seen from a low three-quarter angle, forms reduced to interlocking flat planes, wide diagonal bands of light and shadow crossing the facades, high horizon, completely empty of people, silent monumentality",
    negative:
      "no figures, no smoke or grime, no fractured unreadable forms, no visible brush texture, no bright saturated colour, no atmospheric haze",
  },

  related: ["cubism", "art-deco", "streamline-moderne", "minimalism"],
};
