import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "aurora-ui",
  ja: "オーロラUI",
  en: "Aurora UI",
  era: "2020s–",
  origin: "UI",
  category: "screen",

  tagline: "黒い画面の奥に、極光のような色の霧を滲ませる",

  description:
    "開発者向けSaaSのサイトやダッシュボードから広がった。" +
    "暗い地はコンテンツをよく浮かせるが、真っ黒だと冷たい。" +
    "そこに紫・シアン・ピンクの巨大なぼかし円を重ね、スクリーンで混ぜて敷くと、" +
    "平らなUIのまま奥行きと体温が出る。" +
    "ぼかしの半径が要素の幅ほどもあるので、色の境目を目で追えない。" +
    "それが極光に見える理由で、逆に境目が見えた瞬間、この様式は安っぽいグラデーションに落ちる。",

  traits: [
    "ぼかし半径は要素の幅と同じだけ取る",
    "紫・シアン・ピンクの3色だけを混ぜる",
    "地は黒でなく紺。彩度を少し残す",
    "光の層の上に1px枠のカードを置く",
    "文字は白でなく、白に近い薄紫",
  ],

  avoid: [
    "境目の見えるグラデーション",
    "明るい地に色を乗せること",
    "4色以上混ぜて灰色に濁ること",
  ],

  palette: ["#0a0f1e", "#6f6bff", "#22d3ee", "#f472b6", "#e9e6ff"],

  prompt: {
    core: "aurora UI background, blurred colour field, dark product interface",
    texture:
      "very large gaussian blur with a radius equal to the element width, screen blend mode, soft bloom, 3% monochrome film grain to kill banding, no visible colour stops",
    palette:
      "deep navy-black #0a0f1e ground with three blurred blooms — indigo #6f6bff, cyan #22d3ee, magenta-pink #f472b6; type in near-white lavender #e9e6ff; never pure black, never pure white, no fourth hue",
    composition:
      "three overlapping blurred ellipses filling the upper 60% of the frame, the brightest bloom off-centre on the upper-left third, one card floating at centre with an 8% white fill and a 1px translucent border, wide letter-spaced geometric sans headline, the lower third left empty",
    negative:
      "no hard gradient stops, no banding, no full-spectrum rainbow, no light background, no drop shadows, no skeuomorphic texture, no more than three hues, no neon outlines, no lens flare",
  },

  related: ["glassmorphism", "liquid-design", "ethereal", "synthwave"],
};
