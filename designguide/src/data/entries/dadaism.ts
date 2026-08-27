import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "dadaism",
  ja: "ダダイズム",
  en: "Dadaism",
  era: "1916–1924",
  origin: "スイス",
  category: "movement",

  tagline: "意味を壊すために、切って、貼って、偶然に任せる",

  description:
    "1916年、戦争を逃れた者たちがチューリヒのキャバレー・ヴォルテールに集まった。" +
    "理性が人を大量に殺したのなら、理性が組み立てた芸術のほうも信用できない。" +
    "だから紙を破って落ちたところに貼り、活字を級数も向きもばらばらに並べ、既製品に署名して作品だと言い張った。" +
    "整えることそのものが敵で、下手に見えることや未完成であることが、そのまま態度だった。" +
    "偶然に任せるという方法だけが規則で、作った本人にも結果は選べない。",

  traits: [
    "活字を1行の中で級数も書体も変える",
    "文字を90度・180度に倒して混ぜる",
    "新聞や切符を破れ目のまま貼る",
    "水平の基準線を意図的に外す",
    "余白を残さず紙面を埋め尽くす",
  ],

  avoid: [
    "無意識を精緻に描いた写実表現",
    "グリッドで整えた読みやすい組版",
    "配色を調和させてまとめること",
  ],

  palette: ["#e8e4d8", "#161616", "#c62828", "#7a7a7a", "#f5f5f5"],

  prompt: {
    core: "Dada typographic collage, anti-art assemblage",
    texture:
      "torn newsprint and ticket stubs pasted with visible paste wrinkles, letterpress wood-type impression biting into the sheet, foxed yellowed paper, coffee rings, photocopy grain, frayed deckle edges",
    palette:
      "aged newsprint grey-beige and dirty off-white, dense printer's black, one alarm red; everything else neutral grey",
    composition:
      "type at clashing sizes and weights inside a single line, words rotated 90° and 180°, no shared baseline, fragments overlapping and running off the trim edge, dense all-over field with almost no clean margin, placement decided by chance rather than a grid",
    negative:
      "no clean grid, no consistent typeface, no smooth gradients, no dreamlike realistic rendering, no polished vector shapes, no harmonious colour scheme, no centred symmetry",
  },

  related: ["collage", "punk", "surrealism", "russian-constructivism"],
};
