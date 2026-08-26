import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "acid-graphics",
  ja: "アシッド・グラフィックス",
  en: "Acid Graphics",
  era: "1990s–",
  origin: "イギリス（レイヴ）",
  category: "movement",

  tagline: "黒地に蛍光とクロームだけで、光る紙を作る",

  description:
    "88年前後のイギリスで、倉庫のレイヴを知らせるフライヤーは、暗いクラブの床でも拾われねばならなかった。" +
    "だから黒地に蛍光インクで刷り、ブラックライトの下で発光させる、という力技が選ばれる。" +
    "2010年代にそれが3Dソフトと結びつき、液体金属のクローム文字、溶けたブロブ、歪んだスマイリーとして戻ってきた。" +
    "どちらの時代も、印刷や画面の常識を無視した眩しさを取り、可読性より網膜に残る強さを優先している。",

  traits: [
    "黒地に蛍光ライム／ピンク／シアンを乗せる",
    "文字を液体金属のクロームで立体化する",
    "溶けたブロブと歪んだ円で余白を埋める",
    "輪郭をブルームで滲ませて光らせる",
    "文字を引き伸ばし歪め、可読性を落とす",
  ],

  avoid: [
    "白地とパステルの配色",
    "マットで落ち着いた質感",
    "汚しやざらつきの重ね（グランジ）",
  ],

  palette: ["#0b0b0b", "#c6ff00", "#ff2d95", "#00e5ff", "#f5f5f5"],

  prompt: {
    core: "acid graphics, rave flyer, liquid chrome type",
    texture:
      "day-glo fluorescent screen-print ink on black stock, mirror-polished liquid chrome 3D render, iridescent oil-slick film, blacklight bloom, airbrushed specular highlights",
    palette:
      "pure black ground, fluorescent acid lime green, hot magenta pink, electric cyan, mirror-chrome silver white; maximum saturation with no mid-tones",
    composition:
      "warped chrome lettering as the centre mass filling about 60 percent of the frame, melting blob and lens-distorted circle forms crowding the edges, a radial glow burning out behind the type, small illegible technical text in the corners, kaleidoscopic mirrored symmetry, extreme contrast with no soft transition",
    negative:
      "no white background, no pastel, no matte paper texture, no dirt or grunge overlay, no muted earth tones, no serif book typography, no soft natural lighting",
  },

  related: ["y2k", "psychedelic", "liquid-design", "glitch-art"],
};
