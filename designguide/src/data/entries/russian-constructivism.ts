import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "russian-constructivism",
  ja: "ロシア構成主義",
  en: "Russian Constructivism",
  era: "1915–1930s",
  origin: "ロシア",
  category: "movement",

  tagline: "絵を額から外し、赤と黒の斜めで大衆を動かす",

  description:
    "革命後のロシアで、芸術家は作品を生む人ではなく社会を組み立てる構成者(コンストルクトル)であるべきだ、とされた。" +
    "作るものは美術館の絵ではなく、ポスター、本、劇場装置、街頭のキオスク。" +
    "だから画面は建築の図面のように組まれ、赤と黒の太い斜め帯が視線を強制的に引っぱっていく。" +
    "写真を切り抜いて図形と同じ面に貼るフォトモンタージュも、識字率の低い人へ一瞬で届かせるための道具だった。",

  traits: [
    "赤・黒・地色の三色に絞る",
    "30〜45度の斜め帯で画面を貫く",
    "円と弧を製図のように正確に置く",
    "切り抜き写真を図形と同じ面で扱う",
    "文字は極太で、斜めか縦に組む",
  ],

  avoid: [
    "白い虚空に静かに浮かせること",
    "パステルや中間色を混ぜること",
    "手描きの柔らかい筆致",
  ],

  palette: ["#efe9dc", "#c8102e", "#141414", "#8c8c8c", "#f2f2f2"],

  prompt: {
    core: "Russian Constructivist poster, agitprop photomontage",
    texture:
      "flat lithographic ink on coarse newsprint, slight misregistration between the red and black plates, scissor-cut edges on the photographic fragments, coarse halftone dots inside the photo areas",
    palette:
      "two-plate print — pure scarlet red and dense black on unbleached grey-cream paper, with white knockouts; no third colour anywhere",
    composition:
      "aggressive 30–45° bars driving the eye from lower left to upper right, one hard-edged circle or arc as a pivot, a high-contrast cut-out photograph of a shouting face or a megaphone set off-centre, heavy condensed sans lettering stepped along the diagonal, dynamic asymmetry with no centred axis",
    negative:
      "no pastel colours, no gradients, no soft brushwork, no decorative ornament, no symmetry, no drop shadows, no photographic depth of field",
  },

  related: ["suprematism", "bauhaus", "collage", "swiss-style"],
};
