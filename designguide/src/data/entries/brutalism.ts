import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "brutalism",
  ja: "ブルータリズム",
  en: "Brutalism",
  era: "1950s–",
  origin: "イギリス（建築）",
  category: "movement",

  tagline: "隠す金がないなら、構造をそのまま見せればいい",

  description:
    "戦後のイギリスは、焼けた街に住宅と学校と役所を一気に建て直す必要があり、仕上げ材へ回す金がなかった。" +
    "そこで型枠を外したままのコンクリート、ベトン・ブリュットを、削りも塗りもせず外に出した。" +
    "板の木目も、打ち継ぎの段差も、配管も階段も隠さない。" +
    "安く済ませた結果というより、隠さないことを倫理に変えた点がこの様式の中身で、だから塊は重く、大きく、下に落ちる影が深い。",

  traits: [
    "型枠の木目と打ち継ぎ目を残したコンクリート",
    "塊を持ち上げ、下に深い影の穴を作る",
    "同じ窓・同じ箱を機械的に反復する",
    "配管・階段・梁を外側へ出す",
    "色は素材の灰だけ。塗装しない",
  ],

  avoid: [
    "表面を磨く・塗る・パネルで覆う",
    "優雅な曲線とプロポーション",
    "蛍光色と崩れたWebページの意匠",
  ],

  palette: ["#b8b5ad", "#6e6b64", "#2e2c28", "#d8d5cd", "#141312"],

  prompt: {
    core: "brutalist architecture, béton brut, raw exposed concrete",
    texture:
      "board-marked cast concrete with visible timber grain and form-tie holes, aggregate pitting, rain streaking and lichen staining, hard shuttering seams, no render or paint",
    palette:
      "wet-cement greys only — pale ash, mid dove grey, charcoal shadow, near-black recess, one bleached bone highlight; zero applied colour",
    composition:
      "a massive cantilevered volume overhanging a deep black undercroft, identical window bays repeating in a rigid rhythm across two thirds of the frame, low camera angle in flat overcast light, heavy horizontal banding, service ducts and stair towers pushed onto the exterior, sky reduced to a blank pale band",
    negative:
      "no glass curtain wall, no polished or painted surfaces, no curves, no neon, no default-browser web page layouts, no bright colour, no golden-hour sunset lighting",
  },

  related: ["web-brutalism", "eco-brutalism", "minimalism", "deconstructivism"],
};
