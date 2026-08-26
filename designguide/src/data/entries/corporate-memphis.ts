import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "corporate-memphis",
  ja: "コーポレート・メンフィス",
  en: "Corporate Memphis",
  era: "2010s–",
  origin: "シリコンバレー",
  category: "screen",

  tagline: "顔のない紫の人間が、手足を伸ばして仲良く働く絵",

  description:
    "2017年前後のスタートアップのランディングページを、まとめて一色に染めた様式。" +
    "名前はメンフィスの幾何形から来ているが、実際に効いていたのは別の事情で、" +
    "顔を描かないから人種も年齢も特定されず、どの国のどの市場にも同じ絵を出せる、というのが本当の理由だった。" +
    "手足は関節のない太い曲線、肌は紫や橙、遠近も影もない。だから安く速く量産できた。" +
    "同時に「どこの会社も同じ顔をしている」「巨大企業の人畜無害な化粧だ」と強く批判され、" +
    "いまではむしろ避けるべき記号として扱われている。",

  traits: [
    "顔は描かない。描いても点二つまで",
    "手足は関節なしの太い曲線、胴より長い",
    "肌は紫・橙・緑。肌色を使わない",
    "影と遠近をなくし、全部同じ面に置く",
    "背景に円と波線の小さな幾何を散らす",
  ],

  avoid: [
    "陰影や立体で奥行きを出すこと",
    "写実的な顔や指を描き込むこと",
    "強弱のある手描きの線",
  ],

  palette: ["#f6f3ef", "#6c63ff", "#ff8a5b", "#3ec1a0", "#2b2a3d"],

  prompt: {
    core: "corporate memphis flat vector illustration, faceless figures",
    texture:
      "flat vector fills with no shading, either zero stroke or one constant 4px round-capped stroke throughout, hard crisp edges, no gradient, no grain",
    palette:
      "warm off-white ground #f6f3ef, figures in indigo #6c63ff and coral #ff8a5b, mint #3ec1a0 accents, dark slate #2b2a3d for the few line details; non-naturalistic skin tones only",
    composition:
      "two or three figures with oversized elongated limbs and small heads, no facial features, all standing on one flat plane with no horizon, one prop rendered far out of scale with the people, scattered circles and squiggles filling the background, generous margin, everything at the same depth",
    negative:
      "no faces, no realistic skin tones, no shadows, no perspective, no gradients, no texture, no detailed hands or fingers, no varying line weight, no photographic elements, no outlines around the background shapes",
  },

  related: ["memphis", "flat-design", "isometric", "minimalism"],
};
