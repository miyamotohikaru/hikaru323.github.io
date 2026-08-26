import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "collage",
  ja: "コラージュ",
  en: "Collage",
  era: "1910s–",
  origin: "ヨーロッパ",
  category: "print",

  tagline: "描かずに、切って貼る。断ち切った縁が絵になる",

  description:
    "1912年、ブラックとピカソが画面に新聞紙と壁紙を貼りつけた時から、絵は「描かれたもの」でなくなった。" +
    "すでにある印刷物を切り、元の文脈から引き剥がし、無関係なものの隣に置く。" +
    "効きめは縁で決まる。手でちぎった縁は紙の繊維が毛羽立ち、鋏で切った縁は硬い直線になる。" +
    "この二種類を混ぜると、同じ画面の中に速度の差が生まれる。" +
    "ダダとロシア構成主義がここに政治の言葉を載せ、のちのパンクがコピー機でそれを引き継いだ。",

  traits: [
    "ちぎった縁と、鋏で切った縁を混ぜる",
    "紙の厚みぶんの影を落として重なりを見せる",
    "尺度を無視する。顔と手を別倍率で貼る",
    "新聞・広告・図版など出所の違う紙を混ぜる",
    "定規線やテープ跡を消さずに残す",
  ],

  avoid: [
    "全部を同じ倍率・同じ紙質で揃えること",
    "縁をぼかして馴染ませること",
    "デジタル合成のように継ぎ目を消すこと",
  ],

  palette: ["#e6e0d4", "#c4442e", "#2f5d62", "#e2b13c", "#1b1a17"],

  prompt: {
    core: "paper collage, cut-and-paste photomontage",
    texture:
      "mixed paper stocks — yellowed newsprint, glossy magazine, kraft, ledger paper — torn deckled edges set beside hard scissor cuts, visible fibre fuzz, a cast shadow from the paper thickness, tape and dried glue marks, flatbed-scanned finish",
    palette:
      "aged paper ground (#e6e0d4) with brick red (#c4442e), teal (#2f5d62) and ochre (#e2b13c) cut-outs and near-black newsprint type (#1b1a17); each fragment keeps its own paper tone instead of a unified colour grade",
    composition:
      "elements at deliberately mismatched scales, one oversized head or hand anchoring the frame, fragments rotated 5-15 degrees off axis, overlapping layers with a readable stacking order, ruled pencil lines and a strip of masking tape left visible, focal mass held off centre",
    negative:
      "no seamless digital blending, no soft feathered edges, no uniform scale, no single colour grade over everything, no photorealistic compositing, no clean vector shapes",
  },

  related: ["dadaism", "punk", "russian-constructivism", "grunge"],
};
