import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "pop-surrealism",
  ja: "ポップ・シュールレアリズム",
  en: "Pop Surrealism",
  era: "1990s–",
  origin: "アメリカ",
  category: "movement",

  tagline: "かわいい絵の目が、こちらを落ち着かなくさせる",

  description:
    "源流は1970年代の南カリフォルニアにあった「ローブロウ」。" +
    "カスタムカーの塗装やアンダーグラウンド漫画といった、美術館が相手にしなかった絵の系譜で、1990年代に雑誌『Juxtapoz』がそれを束ねて名前を与えた。" +
    "手つきは古典絵画そのもので、薄い油彩を何層も重ね、毛の一本まで描き込む。" +
    "ところが描く対象は玩具、菓子、小動物、そして解剖図である。" +
    "かわいい形と不穏な細部を同じ精度で同居させ、見る人が「好きなのか怖いのか」を決められない状態を作る。",

  traits: [
    "顔は幼く、目は不自然なほど大きく描く",
    "薄い油彩を重ねて陶器のような肌にする",
    "淡いピンクと水色の地に、血の赤を一点",
    "玩具や菓子に解剖図や虫を混ぜて置く",
    "額縁や舞台幕で囲い、見世物の形にする",
  ],

  avoid: [
    "荒い筆致やラフな線で描くこと",
    "本当に怖い方へ振り切ること",
    "平面的なベタ塗りで済ませること",
  ],

  palette: ["#f2e2e8", "#d94f8a", "#5b7fd6", "#f2c14e", "#2a1f2e"],

  prompt: {
    core: "pop surrealism lowbrow painting, oil on wood panel",
    texture:
      "thin glazed oil layers, porcelain-smooth skin rendering, fine sable-brush hair detail, faint craquelure, warm aged varnish, ornate carved gilt frame",
    palette:
      "pale rose and cream ground (#f2e2e8) with rose pink (#d94f8a), powder blue (#5b7fd6) and butter yellow (#f2c14e), one saturated blood-red accent, deep plum shadows (#2a1f2e); soft desaturated pastels overall",
    composition:
      "a single doll-like figure centred and staring straight at the viewer, oversized eyes, shallow theatrical stage space with a draped curtain behind, small unsettling props — anatomical diagram, bees, ribbons, cuts of meat — arranged symmetrically along the base, painted oval vignette",
    negative:
      "no rough expressive brushwork, no flat vector fills, no cartoon keyline outlines, no horror-film lighting, no photographic realism, no harsh neon colours",
  },

  related: ["surrealism", "kitsch", "pop-art", "dreamcore"],
};
