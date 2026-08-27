import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "expressionism",
  ja: "表現主義",
  en: "Expressionism",
  era: "1905–1920s",
  origin: "ドイツ",
  category: "movement",

  tagline: "内側の不安に合わせて、世界の形のほうを歪ませる",

  description:
    "ドレスデンとミュンヘンの若い画家たちが、見えたままを描くことをやめた。" +
    "急速に工業化した都市と、近づいてくる戦争のなかでは、外の世界は不安というフィルター越しにしか見えなかったからである。" +
    "だから建物は傾き、顔は面で削られ、空は毒のような色になる。" +
    "同じ頃パリでは色そのものの歓びが謳われていたが、こちらの色はむしろ悲鳴に近い。" +
    "彼らが木版画を好んだのも、彫刀が刻む荒い線と白抜きが、神経のざらつきにそのまま合ったからだった。",

  traits: [
    "垂直を傾け、遠近を無理に歪める",
    "輪郭を黒く太く、削るように引く",
    "顔を面で削り、目を落ち窪ませる",
    "補色を濁らせて不協和な色を作る",
    "木版の彫り跡のような硬い白抜き",
  ],

  avoid: [
    "明るく軽やかな色の歓び",
    "整った遠近法と安定した水平",
    "なめらかな階調とつや",
  ],

  palette: ["#e2ddd0", "#1a1a1a", "#c4342a", "#2f5a7a", "#e8a13a"],

  prompt: {
    core: "German Expressionist painting, distorted emotional figuration",
    texture:
      "harsh woodcut-carved lines and gouged white slivers, dry impasto oil dragged across coarse canvas, hard black contours, uneven hand-inked printing",
    palette:
      "clashing acidic hues — blood red, poison green, bruised blue, sulphur yellow — knocked back toward earth tones and always cut with heavy black",
    composition:
      "tilted verticals and buckled perspective, a crowded night street or a hollow-eyed portrait pushed hard against the picture plane, figures elongated and angular, claustrophobic crop with little sky, light arriving from an unexplained direction",
    negative:
      "no serene balanced perspective, no cheerful high-key palette, no smooth blending, no polished finish, no decorative pattern, no photorealism",
  },

  related: ["fauvism", "woodcut", "cubism", "dadaism"],
};
