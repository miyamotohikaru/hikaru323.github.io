import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "cyberpunk",
  ja: "サイバーパンク",
  en: "Cyberpunk",
  era: "1980s–",
  origin: "SF",
  category: "internet",

  tagline: "高度な技術と、底辺の暮らし。雨の夜、看板だけが明るい",

  description:
    "1980年代のSF小説と、同じ頃の映画が骨格を作った。" +
    "中心にあるのは「高度な技術、底辺の暮らし」という一行で、" +
    "技術が進んでも暮らしは良くならず、企業だけが巨大になる、という悲観だ。" +
    "だから画面は必ず雨の夜になる。見上げれば企業の塔、見下ろせば水たまり、その間を多国語の看板が埋め尽くす。" +
    "シンセウェイヴが同じ80年代を憧れとして整理するのに対し、こちらは情報量で殴る。" +
    "余白があると、この様式は成立しない。",

  traits: [
    "常に雨の夜。濡れた路面に看板を映す",
    "多国語の看板を三層に重ね、余白を潰す",
    "シアンとマゼンタの二灯で人物を挟む",
    "見上げるか見下ろすか。水平に構えない",
    "霧に光を通し、光線そのものを見せる",
  ],

  avoid: [
    "昼・晴天・開けた余白",
    "沈む太陽と左右対称の格子",
    "清潔で明るい未来の描写",
  ],

  palette: ["#05060f", "#00f0ff", "#ff2e88", "#ffd400", "#1a1f3a"],

  prompt: {
    core: "cyberpunk cityscape, high tech low life, rain-soaked neon street",
    texture:
      "wet asphalt with mirror reflections, volumetric fog with visible light shafts, anamorphic lens flare, hard specular rain streaks, cinematic 35mm grain, crushed blacks in the shadows",
    palette:
      "near-black blue #05060f base, electric cyan #00f0ff as key light, magenta #ff2e88 as fill from the opposite side, sodium yellow #ffd400 on a single warm sign, cold navy #1a1f3a for unlit architecture; every light source is signage, never the sky",
    composition:
      "low camera angle looking up a narrow street, corporate towers converging overhead, layered multilingual neon signage filling every gap at three depths, one silhouetted figure on the lower third for scale, puddle reflection occupying the bottom 25%, telephoto compression, no empty space anywhere",
    negative:
      "no daylight, no clear sky, no empty negative space, no pastel colours, no symmetric sunset grid, no clean minimal architecture, no flat vector illustration, no dry ground, no chrome lettering",
  },

  related: ["synthwave", "glitch-art", "biomechanical", "dieselpunk"],
};
