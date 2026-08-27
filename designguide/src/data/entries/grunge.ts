import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "grunge",
  ja: "グランジデザイン",
  en: "Grunge",
  era: "1990s",
  origin: "アメリカ",
  category: "movement",

  tagline: "読めなくなる寸前まで、版を重ねて汚しを足す",

  description:
    "90年代のアメリカで、写植からDTPへ移り変わった直後の粗さが、そのまま一つの様式として固まった。" +
    "スキャンした紙の染み、テープの跡、擦れた活字、埃を何枚もレイヤーとして重ね、文字を写真の中へ沈めていく。" +
    "パンクが切って貼る引き算だとすれば、こちらは重ねる足し算で、色は洗われた土色とセピアに寄っていく。" +
    "読みにくさは事故ではなく、読ませる前に気分を渡すための設計だった。",

  traits: [
    "層を5枚以上重ね、下の版を透かす",
    "紙の染み・テープ跡・埃をスキャンして敷く",
    "活字を擦れさせ、輪郭を欠けさせる",
    "色を洗い、土色・セピア・鈍い錆へ寄せる",
    "文字を写真に沈め、一部を読めなくする",
  ],

  avoid: [
    "均一なベタ塗りと切れのいい輪郭",
    "高彩度の色と蛍光インク",
    "切り貼りだけで済ませる（パンク）",
  ],

  palette: ["#c9c2b4", "#3a352c", "#7a2f21", "#585240", "#141310"],

  prompt: {
    core: "1990s grunge graphic design, distressed layered print",
    texture:
      "multi-pass overprinting, photocopy grain, coffee rings and water stains, scanned dust and tape residue, cracked and eroded letterforms, torn masking tape, halftone moiré",
    palette:
      "washed oatmeal-grey ground, dark olive brown, rusted oxblood red, muddy khaki mid-tone, near-black; everything desaturated and dirty, no pure hue anywhere",
    composition:
      "five or more overlapping translucent layers, type sunk into the photograph at about 40 percent opacity and partly illegible, baselines drifting off any grid, headline cropped by the trim edge, dense texture packed into the corners with one small clear area for the eye to rest",
    negative:
      "no clean flat colour, no crisp vector edges, no fluorescent or saturated hues, no white space, no cut-and-paste ransom lettering, no chrome, no polished gradients",
  },

  related: ["punk", "collage", "halftone", "glitch-art"],
};
