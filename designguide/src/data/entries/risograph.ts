import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "risograph",
  ja: "リゾグラフ",
  en: "Risograph",
  era: "1986–",
  origin: "日本（理想科学）",
  category: "print",

  tagline: "1版1色。必ずズレる。そのズレを味だと言い切った",

  description:
    "理想科学工業の孔版印刷機。デジタルで製版するが、ドラム1本にインクは1色しか入らない。" +
    "色の数だけ紙を通し直すので、給紙の誤差ぶんだけ版は必ずズレる。" +
    "インクは大豆油で乾きが遅く、擦れて紙の上に伸びる。ベタは均一に出ないから、濃淡は網点の粗さを刷り分けて作る。" +
    "重なった部分は沈んで別の色になり、蛍光ピンクと青は紫になる。" +
    "ここに挙げたものは全部、印刷所なら刷り直しになる不良だった。1990年代以降のZINE文化が、それをそのまま様式として選び取った。",

  traits: [
    "版ごとに2〜4pxずらして刷る",
    "1版1色。使う色は2〜3色まで",
    "ベタを使わず、網の粗密で濃淡を作る",
    "重なりを乗算で沈ませ、第3の色を生む",
    "蛍光ピンクと青を、ざら紙に刷る",
  ],

  avoid: [
    "版をぴったり合わせること",
    "白い上質紙にCMYK写真を刷ること",
    "なめらかなグラデーションを敷くこと",
  ],

  palette: ["#f4f1e4", "#ff48b0", "#0a5fd8", "#f5d400", "#1a1a1a"],

  prompt: {
    core: "risograph print, soy-ink duplicator, two-colour spot separation",
    texture:
      "coarse halftone dot screen rotated 15 degrees, visible paper tooth, uneven ink laydown with roller streaks, soy-ink smudge, 3px plate misregistration, no solid flat fill anywhere",
    palette:
      "two spot inks on uncoated cream stock (#f4f1e4) — fluorescent pink (#ff48b0) and federal blue (#0a5fd8), multiplying to deep violet where they overlap, with an optional yellow (#f5d400) third pass; no CMYK process colour, no black plate",
    composition:
      "each colour plate carries a different drawing rather than the same shape offset, the two plates shifted 3px in opposite diagonals, large simple shapes, all tonal work done by dot density (dense / mid / light tint), a bold condensed sans-serif headline printed twice in both inks, 8-10% paper margin left bare",
    negative:
      "no perfect registration, no smooth gradients, no glossy coated paper, no CMYK photography, no drop shadows, no more than three inks, no vector-clean edges",
  },

  related: ["halftone", "duotone", "punk", "collage"],
};
