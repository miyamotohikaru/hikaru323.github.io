import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "punk",
  ja: "パンクデザイン",
  en: "Punk Design",
  era: "1976–",
  origin: "イギリス",
  category: "movement",

  tagline: "新聞から切った文字で、脅迫状のように叫ぶ",

  description:
    "1976年のロンドンで、印刷所も写植も雇えない若者たちが、手元にある道具だけで、レコードのジャケットとファンジンを作った。" +
    "新聞と雑誌から一文字ずつ切り抜いて並べ、コピー機に何度も通して黒を潰し、ホチキスで留める。" +
    "技術がなかったのではなく、技術に金を払う気がないという態度が、そのまま形になったものだ。" +
    "だから汚いのではなく、汚いまま出すこと自体が主張になっている。",

  traits: [
    "新聞から一字ずつ切り、身代金状に並べる",
    "白黒コピーを重ねて黒を潰し、粒を荒らす",
    "切り口をハサミのギザギザのまま残す",
    "蛍光ピンクか赤を一色だけベタで乗せる",
    "安全ピン・ホチキス・ガムテープを写し込む",
  ],

  avoid: [
    "整った書体と揃った字面",
    "中間調のあるきれいな写真",
    "重ね刷りの汚しと泥色（グランジ）",
  ],

  palette: ["#e8e4d8", "#111111", "#e8194b", "#f2f2f2", "#5a5a5a"],

  prompt: {
    core: "punk fanzine collage, ransom-note lettering, DIY xerox",
    texture:
      "third-generation photocopy with blown-out blacks and blocked shadows, torn newsprint edges, scissor-cut paper, spray-stencil overspray, visible staples and tape, 1-bit threshold halftone",
    palette:
      "grey newsprint stock, dense photocopier black, one screaming hot pink-red flat, blown-out paper white, dirty mid-grey; two inks maximum",
    composition:
      "letters cut individually from newspapers and magazines at mixed sizes and angles, the headline running off the edge, a high-contrast bitmap photograph torn and pasted off-centre, hand-scrawled marker annotations in the margin, deliberately crooked alignment, thick black rectangles censoring parts of the image",
    negative:
      "no clean typography, no smooth greyscale photography, no gradients, no muddy brown grunge overlays, no polished layout, no drop shadows, no chrome, no pastel colour",
  },

  related: ["grunge", "collage", "anti-design", "dadaism"],
};
