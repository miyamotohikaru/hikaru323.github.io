import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "liquid-design",
  ja: "リキッド・デザイン",
  en: "Liquid Design",
  era: "2020s–",
  origin: "Web",
  category: "screen",

  tagline: "ボタンとボタンが、水銀のようにくっついて離れる",

  description:
    "矩形と直線でできたUIが行き着いた先の、反動として出てきた。" +
    "SVGのぼかしを高コントラストで再び固める「グーイフィルタ」、WebGLのメタボール、屈折シェーダ。" +
    "どれも要素の輪郭を、線ではなく液体の表面張力として扱う。" +
    "だからこの様式は静止画にしても、動いている途中に見える。" +
    "ガラス表現との違いは、透明さではなく粘性を見せる点にある。" +
    "二つの塊が近づくと橋が架かり、離れると千切れる、あの数コマを絵にする。",

  traits: [
    "輪郭を表面張力の弧で結ぶ",
    "近づいた二つの塊の間に細い橋を架ける",
    "暗い地に紫〜シアンの屈折グラデを流す",
    "縁に1本だけ強い鏡面ハイライトを走らせる",
    "静止画でも変形の途中の形を選ぶ",
  ],

  avoid: [
    "均一なぼかしだけで済ませること",
    "角丸長方形に戻ってしまうこと",
    "透明度だけで表現すること",
  ],

  palette: ["#0d0b1a", "#7a5cff", "#00d4ff", "#ff5cae", "#f0eeff"],

  prompt: {
    core: "liquid design, metaball blobs, fluid morphing interface element",
    texture:
      "gooey SVG filter look — gaussian blur pushed through a high-contrast matrix to re-harden the edge, glossy liquid-chrome surface, refraction with chromatic fringing, one sharp specular rim along the upper-left edge, 2% grain",
    palette:
      "near-black plum #0d0b1a ground, a violet #7a5cff to cyan #00d4ff refraction gradient across the body, hot pink #ff5cae caustic rim, near-white #f0eeff highlight; saturated, emissive, no muddy mid-tones",
    composition:
      "two or three blobs at a 60/30/10 size ratio, the largest off-centre left at 55% of the frame width, a thin tension bridge joining the two nearest, the right third held open as negative space, at most one small wide-tracked label at the lower left",
    negative:
      "no rounded rectangles, no flat matte fills, no uniform soft blur, no drop shadows, no photographic water splash, no bubbles, no hard geometric edges, no flat glass panes, no text overlay on the blob",
  },

  related: ["glassmorphism", "aurora-ui", "claymorphism", "psychedelic"],
};
