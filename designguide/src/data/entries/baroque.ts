import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "baroque",
  ja: "バロック",
  en: "Baroque",
  era: "17世紀",
  origin: "ヨーロッパ",
  category: "movement",

  tagline: "暗闇に一条の光。全部を斜めに動かして劇にする",

  description:
    "宗教改革に押されたカトリック教会が、教義を説明ではなく体験として叩き込もうとした時代の様式である。" +
    "だから絵は静かに整わない。人物は画面を貫く対角線に沿って倒れ込み、布は風もないのに渦を巻く。" +
    "光は画面の外から一方向にだけ射し、残りの半分以上は闇のまま残される。" +
    "カラヴァッジョの闇はただの背景ではなく、光を劇的に見せるための装置だった。重く、大きく、見る者を圧倒することが目的である。",

  traits: [
    "画面を貫く一本の対角線に人を並べる",
    "光源は画面外。強い明暗で形を彫る",
    "画面の半分以上を闇のまま残す",
    "布と髪を渦として大きく巻かせる",
    "金と深紅を暗色の中で光らせる",
  ],

  avoid: [
    "淡い色と軽い非対称の甘さ",
    "均等な明るさの平板な照明",
    "正面性の強い静止した構図",
  ],

  palette: ["#140f0a", "#8a1f1a", "#c9a227", "#e6ddc6", "#3f3320"],

  prompt: {
    core: "Baroque oil painting, tenebrist chiaroscuro drama",
    texture:
      "thick oil glazes over a dark bole ground, deep aged varnish, impasto highlights on flesh and metal, fine craquelure, rich translucent shadow",
    palette:
      "near-black brown ground, deep crimson and burgundy drapery, burnished gold, warm ivory flesh and olive umber; extreme value contrast",
    composition:
      "one strong diagonal running corner to corner through the figures, a single hard raking light entering from outside the upper-left frame, more than half the canvas held in darkness, spiralling drapery and twisted contrapposto, figures cropped close and pushed toward the viewer, theatrical gesture caught mid-action",
    negative:
      "no even flat lighting, no pastel palette, no light airy asymmetry, no static frontal symmetry, no flat graphic shapes, no modern dress",
  },

  related: ["rococo", "neoclassicism", "victorian", "gothic"],
};
