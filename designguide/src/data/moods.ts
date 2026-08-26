/**
 * 気分から探すための束ね。
 *
 * 様式名を知らない人は「バウハウス」と打てない。打つのは
 * 「サブカル」「レトロ」「かわいい」「未来っぽい」といった言葉のほうで、
 * 図鑑がそれに答えられないと、名前を知っている人しか使えない道具になる。
 *
 * ここで束ねた語は、
 *   ・一覧の検索の索引（各カードの data-q）に混ぜ込む
 *   ・検索欄の下に、押せる手がかりとして出す
 * の2つに使う。
 */

export type Mood = {
  key: string;
  /** 押したときに入る語 */
  label: string;
  /** 何が出るのか。ひと言 */
  note: string;
  slugs: string[];
};

export const MOODS: Mood[] = [
  {
    key: "subculture",
    label: "サブカル",
    note: "ネットと音楽と反体制から出てきたもの",
    slugs: [
      "vaporwave", "synthwave", "y2k", "glitch-art", "cyberpunk", "acid-graphics",
      "punk", "grunge", "psychedelic", "dreamcore", "liminal-space", "kitsch",
      "pop-surrealism", "maximalism",
    ],
  },
  {
    key: "retro",
    label: "レトロ",
    note: "昔の印刷物・昔の画面の手ざわり",
    slugs: [
      "risograph", "halftone", "woodcut", "victorian", "art-deco", "mid-century-modern",
      "streamline-moderne", "cassette-futurism", "retrofuturism", "pixel-art",
      "frutiger-aero", "skeuomorphism", "collage",
    ],
  },
  {
    key: "future",
    label: "未来っぽい",
    note: "これから／かつて夢見られた、その先",
    slugs: [
      "cyberpunk", "synthwave", "aurora-ui", "liquid-design", "glassmorphism",
      "biomechanical", "afrofuturism", "retrofuturism", "cassette-futurism",
      "steampunk", "dieselpunk", "isometric",
    ],
  },
  {
    key: "handmade",
    label: "手仕事",
    note: "人の手が触った跡が残るもの",
    slugs: [
      "risograph", "woodcut", "collage", "cottagecore", "wabi-sabi", "grunge",
      "punk", "art-nouveau", "expressionism", "fauvism", "chicano",
    ],
  },
  {
    key: "quiet",
    label: "静か",
    note: "余白と中間色。声を張らないもの",
    slugs: [
      "minimalism", "wabi-sabi", "japandi", "scandinavian", "light-academia",
      "ethereal", "swiss-style", "japonisme", "liminal-space", "neumorphism",
    ],
  },
  {
    key: "loud",
    label: "派手",
    note: "色数も密度も全開。目を掴みに行くもの",
    slugs: [
      "memphis", "maximalism", "psychedelic", "pop-art", "acid-graphics", "kitsch",
      "chicano", "afrofuturism", "fauvism", "y2k", "vaporwave",
    ],
  },
  {
    key: "geometry",
    label: "幾何",
    note: "丸・三角・四角と、格子で組むもの",
    slugs: [
      "bauhaus", "de-stijl", "suprematism", "russian-constructivism", "swiss-style",
      "op-art", "isometric", "minimalism", "memphis", "new-wave", "bento-grid",
    ],
  },
  {
    key: "print",
    label: "印刷っぽく",
    note: "版とインクの都合が、そのまま様式になったもの",
    slugs: ["risograph", "halftone", "duotone", "woodcut", "collage", "pop-art", "grunge", "punk"],
  },
  {
    key: "ornate",
    label: "装飾的",
    note: "曲線と金と、埋め尽くす意志",
    slugs: [
      "art-nouveau", "jugendstil", "art-deco", "victorian", "baroque", "rococo",
      "gothic", "gothic-botanical", "neoclassicism", "maximalism",
    ],
  },
  {
    key: "cute",
    label: "かわいい",
    note: "丸くて、やわらかくて、甘いもの",
    slugs: [
      "claymorphism", "corporate-memphis", "cottagecore", "kitsch", "pop-surrealism",
      "memphis", "ligne-claire", "rococo", "dreamcore",
    ],
  },
  {
    key: "ui",
    label: "アプリの画面",
    note: "画面のために作られた作法",
    slugs: [
      "flat-design", "material-design", "skeuomorphism", "neumorphism", "glassmorphism",
      "claymorphism", "aurora-ui", "liquid-design", "bento-grid", "web-brutalism",
      "corporate-memphis",
    ],
  },
  {
    key: "avantgarde",
    label: "前衛",
    note: "常識のほうを壊しにいったもの",
    slugs: [
      "cubism", "dadaism", "surrealism", "suprematism", "anti-design",
      "deconstructivism", "expressionism", "psychedelic", "web-brutalism",
    ],
  },
  {
    key: "hard",
    label: "硬派",
    note: "重い素材、暗い光、装飾を切ったもの",
    slugs: [
      "brutalism", "eco-brutalism", "precisionism", "dark-academia", "biomechanical",
      "dieselpunk", "gothic", "cyberpunk", "expressionism",
    ],
  },
  {
    key: "japan",
    label: "和",
    note: "日本の美意識に根を持つもの",
    slugs: ["wabi-sabi", "japandi", "japonisme", "woodcut", "risograph", "minimalism"],
  },
];

/** slug から「その様式が属する気分の語」を引く。検索の索引に混ぜる */
export const MOOD_WORDS: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const mood of MOODS) {
    for (const s of mood.slugs) (m[s] ??= []).push(mood.label);
  }
  return m;
})();
