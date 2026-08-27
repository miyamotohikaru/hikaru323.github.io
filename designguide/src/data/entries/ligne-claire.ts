import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "ligne-claire",
  ja: "リーニュ・クレール",
  en: "Ligne Claire",
  era: "1930s–",
  origin: "ベルギー",
  category: "world",

  tagline: "太さの変わらない一本の線。影を落とさずに世界を描く",

  description:
    "エルジェの『タンタンの冒険』でつくられ、1977年にオランダの作家ヨースト・スワルトが名前を与えた。" +
    "決まりごとは徹底していて、輪郭線は一定の太さで引かれ、抑揚をつけない。" +
    "色はベタで塗られ、影も落ちない。そして画面のどこもが同じ精度で描かれる。" +
    "つまり手前の人物と奥の建物とで、線の太さが変わらない。" +
    "人物は極端に単純化されるのに、背景の建築や自動車は資料どおりに正確という落差が生まれるのはそのためだ。" +
    "読み手の視線は線の強弱ではなく、色面の配置で誘導される。",

  traits: [
    "輪郭線は一定の太さ。抑揚をつけない",
    "影とハッチングを描かず、ベタ塗りだけ",
    "手前も奥も同じ線幅で描く",
    "人物は簡略、背景の建築は正確に",
    "地は生成りの紙色、空は薄い平塗り",
  ],

  avoid: [
    "線の強弱やカケアミによる陰影",
    "アメコミ的な誇張パースと効果線",
    "グラデーションと写実的な光沢",
  ],

  palette: ["#f2ece0", "#1a1a1a", "#d94f2b", "#2f7fc4", "#f2c14e"],

  prompt: {
    core: "ligne claire comic illustration, Hergé Tintin style",
    texture:
      "uniform-weight black ink outline of constant width, perfectly flat cel-style colour fills, offset comic-album printing on cream uncoated paper, no hatching, no gradients, no texture inside the shapes",
    palette:
      "cream paper ground, pure black line, and a limited flat set of vermilion red, sky blue, mustard yellow, olive green and warm beige; one solid tone per area",
    composition:
      "clear stage-like framing at eye level with a stable horizon across the middle, simplified figures in the foreground drawn at exactly the same line weight as the architecturally accurate buildings behind them, uncluttered middle ground, reading order guided by colour blocks rather than line weight, everything in sharp focus",
    negative:
      "no cast shadows, no hatching or cross-hatching, no variable line weight, no gradients, no speed lines, no exaggerated comic-book perspective, no airbrushing, no gloss highlights, no manga screentone",
  },

  related: ["flat-design", "pop-art", "japonisme", "mid-century-modern"],
};
