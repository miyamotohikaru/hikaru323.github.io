import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "memphis",
  ja: "メンフィスデザイン",
  en: "Memphis Design",
  era: "1981–1987",
  origin: "イタリア",
  category: "movement",

  tagline: "機能の話をやめて、積み木と柄だけで家具を組む",

  description:
    "1981年のミラノで、エットレ・ソットサスと仲間が始めたグループ。" +
    "前の10年の急進的な批判と根は繋がっているが、こちらは怒りではなく祝祭で、売ることも展示することも最初から楽しんでいる。" +
    "円柱・球・三角の積み木を不安定に積み、表面には安いプラスチック・ラミネートの柄をそのまま貼った。" +
    "テラゾーの粒、ジグザグ、太い黒の斜線、ピンクとターコイズ。上品さを拒んだというより、上品さを退屈と呼び替えた。",

  traits: [
    "円柱・球・三角の積み木を不安定に積む",
    "ジグザグ・水玉・テラゾー柄を面に貼る",
    "ピンク／ターコイズ／黄を黒の上で当てる",
    "脚の高さと太さをわざと揃えない",
    "太い黒の斜線を背景に走らせる",
  ],

  avoid: [
    "落ち着いた中間色でまとめる",
    "対称で安定した積み方",
    "政治的・批判的な重さ（アンチデザイン）",
  ],

  palette: ["#f6f2e8", "#f2385a", "#36c9c6", "#f5c400", "#1b1b1b"],

  prompt: {
    core: "Memphis Milano design, 1980s postmodern pattern",
    texture:
      "printed plastic laminate, terrazzo speckle, matte lacquered wood, flat screen-printed colour with hard black keylines, no gradients, no surface grain",
    palette:
      "cream white ground, hot bubblegum pink-red, turquoise cyan, chrome yellow, pure black graphics; four saturated flats with no shading and no intermediate tones",
    composition:
      "an unstable stack of cylinder, sphere and triangular wedge, legs of deliberately unequal length and thickness, squiggle and confetti motifs scattered around the edges, bold black diagonal stripes crossing the background, asymmetric and top-heavy, flat high-key lighting with no cast shadow",
    negative:
      "no muted or earth tones, no symmetry, no gradients, no realistic shadow, no historical ornament, no minimalism, no political solemnity, no photorealistic render",
  },

  related: ["anti-design", "kitsch", "new-wave", "corporate-memphis"],
};
