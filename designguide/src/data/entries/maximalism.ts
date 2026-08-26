import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "maximalism",
  ja: "マキシマリズム",
  en: "Maximalism",
  era: "2010s–",
  origin: "折衷",
  category: "movement",

  tagline: "柄の上に柄を重ね、それでも足りないと言う",

  description:
    "「少ないほど豊か」への返事として出てきた「多いほど豊か」。" +
    "ミニマリズムが三十年ほど正解の顔をして続いたあと、その空白を退屈だと言い切ったところから始まっている。" +
    "柄の上に別の柄を重ね、金と蛍光を平気で隣に置く。" +
    "ただし無秩序ではない。濃い地色を一枚敷き、同じモチーフを違う大きさで繰り返してリズムを作るから、詰め込んでも画面が崩れない。" +
    "スクロールを止める必要が出た2010年代に、インテリアとファッションから一気に広がった。",

  traits: [
    "濃い地色を一枚敷いてから盛る",
    "柄の上に別の柄。動物・植物・幾何を混ぜる",
    "同じモチーフを違う倍率で繰り返す",
    "余白は5%まで。絵を紙の端まで伸ばす",
    "金・蛍光・ベルベットを同じ面に置く",
  ],

  avoid: [
    "白い余白で息を抜くこと",
    "色数を絞って整えること",
    "柄をひとつに統一すること",
  ],

  palette: ["#1f1030", "#e8402a", "#f2b100", "#1f8a7a", "#e86ab0"],

  prompt: {
    core: "maximalist composition, more-is-more layering, pattern on pattern",
    texture:
      "layered printed textiles, velvet and gold-leaf surfaces, glossy lacquer, brocade and embroidery detail, dense ornamental fill, no bare surfaces",
    palette:
      "saturated jewel tones on a deep aubergine ground (#1f1030) — vermilion red, marigold yellow, emerald teal, orchid pink, with metallic gold accents; no muted, pastel or desaturated tones",
    composition:
      "edge-to-edge fill with under 5% negative space, one symmetrical central focal object framed by repeating motifs, three or more competing patterns tiled at clearly different scales, stacked foreground / midground / background layers, ornate framing border on all four sides",
    negative:
      "no white space, no minimal layout, no monochrome, no flat single-colour background, no restraint, no pastel wash, no single unified pattern",
  },

  related: ["memphis", "kitsch", "baroque", "rococo"],
};
