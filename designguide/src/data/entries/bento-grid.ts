import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "bento-grid",
  ja: "ベントーグリッド",
  en: "Bento Grid",
  era: "2023–",
  origin: "Apple／UI",
  category: "screen",

  tagline: "大きさの違う角丸の升に、機能を隙間なく詰め合わせる",

  description:
    "Appleの製品ページとキーノートのスライドが起点。" +
    "伝えたい機能が10個あるとき、縦に10回スクロールさせる代わりに、大小の升を1枚のグリッドに敷き詰め、一目で全部見せる。" +
    "幕の内弁当がそのまま名前になった。" +
    "効くのは、升の大きさが優先順位そのものになるからで、同じ大きさで並べた瞬間、弁当ではなくただの表になる。" +
    "だから1升に主題は1つだけ、余白は升の外より内側を広く取る。",

  traits: [
    "升は2:1、1:1、1:2の3種で組む",
    "角丸は16〜24px、升の間の隙は12〜16px",
    "1升に1メッセージ。文字か図の片方だけ",
    "升ごとに地色を変え、濃い升は1〜2枚まで",
    "中身を升の縁で切り、はみ出させる",
  ],

  avoid: [
    "全部の升を同じ大きさで並べること",
    "升に影を落として浮かせること",
    "1升に複数の主題を詰めること",
  ],

  palette: ["#f2f2f4", "#1c1c1e", "#5b8def", "#f2a03d", "#e0e0e4"],

  prompt: {
    core: "bento grid layout, modular product page, rounded tiles",
    texture:
      "flat matte fills, no shadows, 20px corner radius, crisp vector rendering, a single 1px hairline only where two tiles of the same tone meet",
    palette:
      "light grey ground #f2f2f4, tiles in near-black #1c1c1e and pale grey #e0e0e4, exactly one blue accent tile #5b8def and one amber #f2a03d, no more than two saturated tiles in the whole grid",
    composition:
      "12-column grid with 14px gutters, tiles at 2:1, 1:1 and 1:2 ratios, a hero tile filling the top-left 2x2, one full-width tile across the bottom, one subject per tile, contents cropped by the tile edge, medium-weight geometric sans labels at each tile's lower left",
    negative:
      "no drop shadows, no equal-sized uniform tiles, no gradients, no border on every tile, no photographic backgrounds, no elements overlapping across tiles, no more than two accent colours",
  },

  related: ["swiss-style", "flat-design", "material-design", "minimalism"],
};
