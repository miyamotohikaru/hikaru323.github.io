import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "jugendstil",
  ja: "ユーゲント・シュティール",
  en: "Jugendstil",
  era: "1895–1910",
  origin: "ドイツ／オーストリア",
  category: "movement",

  tagline: "同じ植物の線を、定規で正して幾何の装飾に直す",

  description:
    "ミュンヘンの雑誌『ユーゲント』から名前が来た、ドイツ語圏のアール・ヌーヴォー。" +
    "扱う植物のモチーフは同じでも、フランスのように蔓を伸ばしきらず、途中で四角い枠に収めてしまう。" +
    "その極がウィーン分離派とウィーン工房で、市松、正方形の連続、細い直線の格子が装飾の主役になった。" +
    "だから同じ時代の同じ動機から出発しながら、画面はずっと平らで、静かで、建築の図面に近く見える。",

  traits: [
    "曲線を矩形の枠の中に閉じ込める",
    "市松と正方形の連続を装飾に使う",
    "細い直線の格子を面に敷く",
    "図と地を同じ強さで平面化する",
    "書体は幾何的な大文字を自作する",
  ],

  avoid: [
    "枠を突き破って伸びる蔓",
    "深い陰影と写実的な質感",
    "曲線だけで全面を埋めること",
  ],

  palette: ["#ece4d0", "#4a6b3f", "#a8442a", "#d8b45a", "#2a2620"],

  prompt: {
    core: "Jugendstil Vienna Secession poster, geometric ornament",
    texture:
      "flat lithographic ink on warm laid paper, crisp even line weight, gold and black block printing, matte finish, no gradients",
    palette:
      "olive and forest green, oxblood red, ochre gold, ivory ground and near-black; earthy and muted, no more than four inks",
    composition:
      "a strict rectangular frame divided into square modules, a stylised plant or standing figure locked inside the panels, checkerboard and square-repeat borders, thin ruled grid lines behind the motif, custom geometric capitals sitting on a firm baseline, near-symmetrical balance, flat figure and ground carrying equal weight",
    negative:
      "no whiplash curves escaping the frame, no deep shading, no photographic realism, no asymmetric organic sprawl, no pastel gradients, no script lettering",
  },

  related: ["art-nouveau", "bauhaus", "art-deco", "victorian"],
};
