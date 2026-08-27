import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "chicano",
  ja: "チカーノ・アート",
  en: "Chicano Art",
  era: "1960s–",
  origin: "アメリカ（メキシコ系）",
  category: "world",

  tagline: "壁とインクで、メキシコ系アメリカ人が自分の存在を刻む",

  description:
    "1960年代、農業労働者の権利運動と、ロサンゼルスの学校で起きたストライキの中から立ち上がった表現である。" +
    "メキシコ人としてもアメリカ人としても数えられなかった人々が、" +
    "自分たちの歴史と現在を目に見える形にするために、壁とシルクスクリーンのポスターを選んだ。" +
    "だから図像は借り物ではなく、グアダルーペの聖母、アステカの神話、農地と街区、家族と労働者の顔でできている。" +
    "線には二系統ある。壁画とポスターの太い輪郭と原色、" +
    "そして単針で刻む黒と灰だけの細密なファインライン。後者は獄中で磨かれた技術だ。",

  traits: [
    "太い黒輪郭に赤・金・緑の平塗り",
    "グアダルーペの光背と薔薇を構造に使う",
    "黒と灰だけのファインライン細密描写",
    "筆記体とブラックレターの合成レタリング",
    "人物は下から仰ぎ、拳や道具を上に置く",
  ],

  avoid: [
    "祝祭の飾りとして「メキシコ風」を借りること",
    "観光土産のような明るいパステル",
    "意味のない骸骨・ソンブレロの記号使い",
  ],

  palette: ["#1a1a1a", "#c8102e", "#f4a300", "#0f7b6c", "#f2e9d8"],

  prompt: {
    core: "Chicano art, Mexican-American mural and screen-print tradition",
    texture:
      "two modes — flat screen-printed poster ink on newsprint with hand-cut stencil edges and slight registration offset, or single-needle black-and-grey fine-line stipple with smooth graphite-like shading on paper; matte lime-washed stucco for the mural mode",
    palette:
      "United Farm Workers red and black, marigold gold, agave green, bone off-white; or, in fine-line mode, a strict black-to-grey greyscale with no colour at all",
    composition:
      "low upward-looking heroic angle, subject centred and filling the middle 60 percent, radiating Guadalupe mandorla rays behind the head, Aztec stepped-fret border banding the top and bottom edges, a banner scroll of script lettering across the lower third, frontal and symmetrical",
    negative:
      "no pastel tourist-souvenir colours, no novelty sombrero or skull props used as decoration, no airbrushed gloss, no anime style, no generic tattoo flash, no exoticising ornament",
  },

  related: ["afrofuturism", "woodcut", "pop-art", "punk"],
};
