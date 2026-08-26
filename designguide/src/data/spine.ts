/**
 * 80スタイルの背骨。
 *
 * 名前・年代・出自・分類・5色パレットだけを持つ。解説文とプロンプト部品は
 * src/data/entries/<slug>.ts にある。ここを唯一の正とし、順番もここで決める。
 *
 * パレットは [地, 主, 副, 差, 締] の5色。図版（src/plates/<slug>.tsx）も
 * この5色を軸に描く。80枚を一画面に並べたときの調和はここで作っている。
 */

import type { StyleCategory } from "./types";

export type Spine = {
  slug: string;
  ja: string;
  en: string;
  era: string;
  origin: string;
  category: StyleCategory;
  palette: [string, string, string, string, string];
};

export const SPINE: Spine[] = [
  // ── 20世紀前半の運動。図鑑の背骨になる古典 ────────────────────────────
  { slug: "bauhaus", ja: "バウハウス", en: "Bauhaus", era: "1919–1933", origin: "ドイツ", category: "movement", palette: ["#f0ede3", "#111111", "#d8262a", "#1a49c4", "#f2c200"] },
  { slug: "de-stijl", ja: "デ・ステイル", en: "De Stijl", era: "1917–1931", origin: "オランダ", category: "movement", palette: ["#f4f2ec", "#111111", "#d02020", "#1a4fd0", "#f2c200"] },
  { slug: "suprematism", ja: "シュプレマティズム", en: "Suprematism", era: "1915–1920s", origin: "ロシア", category: "movement", palette: ["#f2efe6", "#141414", "#d6321e", "#1f4fa8", "#e8b21e"] },
  { slug: "russian-constructivism", ja: "ロシア構成主義", en: "Russian Constructivism", era: "1915–1930s", origin: "ロシア", category: "movement", palette: ["#efe9dc", "#c8102e", "#141414", "#8c8c8c", "#f2f2f2"] },
  { slug: "dadaism", ja: "ダダイズム", en: "Dadaism", era: "1916–1924", origin: "スイス", category: "movement", palette: ["#e8e4d8", "#161616", "#c62828", "#7a7a7a", "#f5f5f5"] },
  { slug: "cubism", ja: "キュビズム", en: "Cubism", era: "1907–1920s", origin: "フランス", category: "movement", palette: ["#d8cdb8", "#8a7f6b", "#3f4a52", "#a8582f", "#1c1a17"] },
  { slug: "fauvism", ja: "フォービズム", en: "Fauvism", era: "1905–1908", origin: "フランス", category: "movement", palette: ["#f2e6c8", "#e8402a", "#1f7a8c", "#f2b100", "#7a2f8a"] },
  { slug: "expressionism", ja: "表現主義", en: "Expressionism", era: "1905–1920s", origin: "ドイツ", category: "movement", palette: ["#e2ddd0", "#1a1a1a", "#c4342a", "#2f5a7a", "#e8a13a"] },
  { slug: "surrealism", ja: "シュールレアリズム", en: "Surrealism", era: "1924–", origin: "フランス", category: "movement", palette: ["#dfe6ea", "#2f5f8a", "#c2703d", "#f0d9a8", "#1a2028"] },
  { slug: "precisionism", ja: "プレシジョニズム", en: "Precisionism", era: "1920s–1930s", origin: "アメリカ", category: "movement", palette: ["#e2e6e8", "#6f8a9c", "#c07a4a", "#2b3540", "#d9c9a8"] },

  // ── 装飾の系譜 ────────────────────────────────────────────────────
  { slug: "art-nouveau", ja: "アール・ヌーヴォー", en: "Art Nouveau", era: "1890–1910", origin: "フランス／ベルギー", category: "movement", palette: ["#efe6d2", "#6b7f4e", "#b4653a", "#2f3b2c", "#c9a86b"] },
  { slug: "jugendstil", ja: "ユーゲント・シュティール", en: "Jugendstil", era: "1895–1910", origin: "ドイツ／オーストリア", category: "movement", palette: ["#ece4d0", "#4a6b3f", "#a8442a", "#d8b45a", "#2a2620"] },
  { slug: "art-deco", ja: "アール・デコ", en: "Art Deco", era: "1920s–1930s", origin: "フランス", category: "movement", palette: ["#0e1a1f", "#c9a227", "#1e5f74", "#e8dcc4", "#8c1c13"] },
  { slug: "victorian", ja: "ヴィクトリアンデザイン", en: "Victorian Design", era: "1837–1901", origin: "イギリス", category: "movement", palette: ["#2a1a14", "#8b1a1a", "#c9a227", "#f0e6d2", "#3f5c4a"] },
  { slug: "baroque", ja: "バロック", en: "Baroque", era: "17世紀", origin: "ヨーロッパ", category: "movement", palette: ["#140f0a", "#8a1f1a", "#c9a227", "#e6ddc6", "#3f3320"] },
  { slug: "rococo", ja: "ロココ", en: "Rococo", era: "18世紀", origin: "フランス", category: "movement", palette: ["#f5ece2", "#e8c4d0", "#c9d6c4", "#d9b45a", "#5a4a3a"] },
  { slug: "neoclassicism", ja: "新古典主義", en: "Neoclassicism", era: "18–19世紀", origin: "ヨーロッパ", category: "movement", palette: ["#efe9dc", "#c8c2b0", "#8a8574", "#2f2a22", "#b0442e"] },
  { slug: "gothic", ja: "ゴシック・デザイン", en: "Gothic Design", era: "12世紀–", origin: "ヨーロッパ", category: "movement", palette: ["#1a1420", "#6b1f3a", "#2a4a7a", "#c9a227", "#e8e2d6"] },
  { slug: "gothic-botanical", ja: "ゴシック・ボタニカル", en: "Gothic Botanical", era: "2010s–", origin: "折衷", category: "movement", palette: ["#101512", "#2f4a35", "#7a2f3a", "#c8b88a", "#e6e2d6"] },

  // ── 機能とグリッド ────────────────────────────────────────────────
  { slug: "swiss-style", ja: "スイス・スタイル", en: "Swiss Style", era: "1950s–", origin: "スイス", category: "movement", palette: ["#ffffff", "#000000", "#e2231a", "#8c8c8c", "#f2f2f2"] },
  { slug: "new-wave", ja: "ニュー・ウェーブ・デザイン", en: "New Wave Design", era: "1970s–1980s", origin: "スイス", category: "movement", palette: ["#f2f0ea", "#111111", "#e8462a", "#2f6fd0", "#f2c200"] },
  { slug: "minimalism", ja: "ミニマリズム", en: "Minimalism", era: "1960s–", origin: "アメリカ", category: "movement", palette: ["#f4f3f0", "#111111", "#8c8c8c", "#d8d5cd", "#e2231a"] },
  { slug: "brutalism", ja: "ブルータリズム", en: "Brutalism", era: "1950s–", origin: "イギリス（建築）", category: "movement", palette: ["#b8b5ad", "#6e6b64", "#2e2c28", "#d8d5cd", "#141312"] },
  { slug: "eco-brutalism", ja: "エコ・ブルータリズム", en: "Eco Brutalism", era: "2010s–", origin: "建築", category: "movement", palette: ["#b9b4a8", "#6e7f5c", "#3d3a34", "#d6d1c4", "#2a2a26"] },
  { slug: "deconstructivism", ja: "デコンストラクティビズム", en: "Deconstructivism", era: "1980s–", origin: "建築", category: "movement", palette: ["#eceae4", "#141414", "#d64545", "#5b6b7a", "#9aa3ab"] },
  { slug: "mid-century-modern", ja: "ミッドセンチュリー・モダン", en: "Mid-Century Modern", era: "1945–1969", origin: "アメリカ", category: "movement", palette: ["#efe7d6", "#d9822b", "#2f6f6a", "#c4452e", "#2b2820"] },
  { slug: "scandinavian", ja: "スカンジナビアン・モダン", en: "Scandinavian Modern", era: "1950s–", origin: "北欧", category: "movement", palette: ["#f4f1ea", "#c9d6cd", "#d9a48f", "#7f8a7a", "#2e2b26"] },
  { slug: "streamline-moderne", ja: "ストリームライン・モダン", en: "Streamline Moderne", era: "1930s", origin: "アメリカ", category: "movement", palette: ["#e4e6e3", "#7a8f99", "#c0392b", "#d9b26a", "#2b3138"] },

  // ── 反抗と過剰 ────────────────────────────────────────────────────
  { slug: "anti-design", ja: "アンチデザイン", en: "Anti-Design", era: "1960s–1970s", origin: "イタリア", category: "movement", palette: ["#e8e2d6", "#d94f2b", "#1f6f5c", "#f2c14e", "#1a1a1a"] },
  { slug: "memphis", ja: "メンフィスデザイン", en: "Memphis Design", era: "1981–1987", origin: "イタリア", category: "movement", palette: ["#f6f2e8", "#f2385a", "#36c9c6", "#f5c400", "#1b1b1b"] },
  { slug: "punk", ja: "パンクデザイン", en: "Punk Design", era: "1976–", origin: "イギリス", category: "movement", palette: ["#e8e4d8", "#111111", "#e8194b", "#f2f2f2", "#5a5a5a"] },
  { slug: "grunge", ja: "グランジデザイン", en: "Grunge", era: "1990s", origin: "アメリカ", category: "movement", palette: ["#c9c2b4", "#3a352c", "#7a2f21", "#585240", "#141310"] },
  { slug: "acid-graphics", ja: "アシッド・グラフィックス", en: "Acid Graphics", era: "1990s–", origin: "イギリス（レイヴ）", category: "movement", palette: ["#0b0b0b", "#c6ff00", "#ff2d95", "#00e5ff", "#f5f5f5"] },
  { slug: "maximalism", ja: "マキシマリズム", en: "Maximalism", era: "2010s–", origin: "折衷", category: "movement", palette: ["#1f1030", "#e8402a", "#f2b100", "#1f8a7a", "#e86ab0"] },
  { slug: "kitsch", ja: "キッチュ", en: "Kitsch", era: "20世紀", origin: "欧米", category: "movement", palette: ["#ffd9e8", "#ff4f9a", "#ffd23f", "#3ec1d3", "#2b2b2b"] },
  { slug: "psychedelic", ja: "サイケデリック・アート", en: "Psychedelic Art", era: "1960s", origin: "アメリカ", category: "movement", palette: ["#2b0a4a", "#ff5f1f", "#ffd400", "#00b3a4", "#ff2e88"] },
  { slug: "op-art", ja: "オプ・アート", en: "Op Art", era: "1960s", origin: "ヨーロッパ", category: "movement", palette: ["#ffffff", "#000000", "#e63946", "#1d3557", "#f1faee"] },
  { slug: "pop-art", ja: "ポップアート", en: "Pop Art", era: "1950s–1960s", origin: "イギリス／アメリカ", category: "movement", palette: ["#f2e600", "#e8194b", "#1a4fd0", "#ffffff", "#111111"] },
  { slug: "pop-surrealism", ja: "ポップ・シュールレアリズム", en: "Pop Surrealism", era: "1990s–", origin: "アメリカ", category: "movement", palette: ["#f2e2e8", "#d94f8a", "#5b7fd6", "#f2c14e", "#2a1f2e"] },

  // ── 印刷・製版から生まれたもの ─────────────────────────────────────
  { slug: "risograph", ja: "リゾグラフ", en: "Risograph", era: "1986–", origin: "日本（理想科学）", category: "print", palette: ["#f4f1e4", "#ff48b0", "#0a5fd8", "#f5d400", "#1a1a1a"] },
  { slug: "halftone", ja: "ハーフトーン（網点）", en: "Halftone", era: "19世紀–", origin: "印刷技術", category: "print", palette: ["#f4f1e8", "#111111", "#e0322a", "#2a5fd0", "#f2b400"] },
  { slug: "duotone", ja: "デュオトーン", en: "Duotone", era: "2015–", origin: "印刷／UI", category: "print", palette: ["#1a1a2e", "#ff4d6d", "#4cc9f0", "#f2f2f2", "#0d0d1a"] },
  { slug: "woodcut", ja: "木版画", en: "Woodcut", era: "15世紀–", origin: "ヨーロッパ／日本", category: "print", palette: ["#efe6d2", "#1a1a1a", "#b03a2e", "#3f5c4a", "#d9c9a8"] },
  { slug: "collage", ja: "コラージュ", en: "Collage", era: "1910s–", origin: "ヨーロッパ", category: "print", palette: ["#e6e0d4", "#c4442e", "#2f5d62", "#e2b13c", "#1b1a17"] },

  // ── 画面のために作られたもの ───────────────────────────────────────
  { slug: "flat-design", ja: "フラットデザイン", en: "Flat Design", era: "2012–", origin: "UI", category: "screen", palette: ["#f5f6f8", "#2d9cdb", "#eb5757", "#f2c94c", "#27ae60"] },
  { slug: "material-design", ja: "マテリアルデザイン", en: "Material Design", era: "2014–", origin: "Google", category: "screen", palette: ["#fafafa", "#3f51b5", "#ff5252", "#ffc107", "#212121"] },
  { slug: "skeuomorphism", ja: "スキューモーフィズム", en: "Skeuomorphism", era: "2007–2013", origin: "UI", category: "screen", palette: ["#d7d2c8", "#8a7d68", "#3f4a5a", "#f0ece2", "#22201c"] },
  { slug: "neumorphism", ja: "ニューモーフィズム", en: "Neumorphism", era: "2019–2021", origin: "UI", category: "screen", palette: ["#e6e7ee", "#ffffff", "#c8cad4", "#5a6b8c", "#3a3f52"] },
  { slug: "glassmorphism", ja: "グラスモーフィズム", en: "Glassmorphism", era: "2020–", origin: "UI", category: "screen", palette: ["#16214a", "#7aa2ff", "#b98cff", "#ffffff", "#0a0f24"] },
  { slug: "claymorphism", ja: "クレイモーフィズム", en: "Claymorphism", era: "2020s–", origin: "UI", category: "screen", palette: ["#eef0ff", "#a5b4fc", "#fbcfe8", "#fde68a", "#4c4a68"] },
  { slug: "aurora-ui", ja: "オーロラUI", en: "Aurora UI", era: "2020s–", origin: "UI", category: "screen", palette: ["#0a0f1e", "#6f6bff", "#22d3ee", "#f472b6", "#e9e6ff"] },
  { slug: "liquid-design", ja: "リキッド・デザイン", en: "Liquid Design", era: "2020s–", origin: "Web", category: "screen", palette: ["#0d0b1a", "#7a5cff", "#00d4ff", "#ff5cae", "#f0eeff"] },
  { slug: "bento-grid", ja: "ベントーグリッド", en: "Bento Grid", era: "2023–", origin: "Apple／UI", category: "screen", palette: ["#f2f2f4", "#1c1c1e", "#5b8def", "#f2a03d", "#e0e0e4"] },
  { slug: "web-brutalism", ja: "Webブルータリズム", en: "Web Brutalism", era: "2014–", origin: "Web", category: "screen", palette: ["#ffffff", "#0000ee", "#000000", "#ff0000", "#eeeeee"] },
  { slug: "corporate-memphis", ja: "コーポレート・メンフィス", en: "Corporate Memphis", era: "2010s–", origin: "シリコンバレー", category: "screen", palette: ["#f6f3ef", "#6c63ff", "#ff8a5b", "#3ec1a0", "#2b2a3d"] },
  { slug: "isometric", ja: "アイソメトリック", en: "Isometric", era: "1950s–", origin: "製図／UI", category: "screen", palette: ["#eef1f6", "#3b5bdb", "#7048e8", "#f76707", "#141726"] },
  { slug: "pixel-art", ja: "ピクセルアート", en: "Pixel Art", era: "1970s–", origin: "コンピュータゲーム", category: "screen", palette: ["#0f1024", "#5b6ee1", "#8bd6f2", "#f2c14e", "#e85c4a"] },
  { slug: "frutiger-aero", ja: "フルーティガー・エアロ", en: "Frutiger Aero", era: "2004–2013", origin: "UI", category: "screen", palette: ["#dff2fb", "#3aa7e0", "#7ed957", "#ffffff", "#1d5f8a"] },

  // ── ネットが育てたもの ────────────────────────────────────────────
  { slug: "vaporwave", ja: "ヴェイパーウェイヴ", en: "Vaporwave", era: "2010s–", origin: "インターネット", category: "internet", palette: ["#1a0b2e", "#ff71ce", "#01cdfe", "#05ffa1", "#fffb96"] },
  { slug: "synthwave", ja: "シンセウェイヴ", en: "Synthwave", era: "2010s–", origin: "ネット／音楽", category: "internet", palette: ["#0b0322", "#ff2e88", "#7a2ff2", "#00e0ff", "#ffb800"] },
  { slug: "y2k", ja: "Y2K", en: "Y2K Aesthetic", era: "1997–2004", origin: "ネット／ポップ", category: "internet", palette: ["#0a0a1a", "#c0c8d8", "#ff5ad4", "#5ce1ff", "#f2f2f8"] },
  { slug: "glitch-art", ja: "グリッチアート", en: "Glitch Art", era: "1990s–", origin: "デジタル", category: "internet", palette: ["#08080c", "#ff0040", "#00fff0", "#f2f2f2", "#7a00ff"] },
  { slug: "cyberpunk", ja: "サイバーパンク", en: "Cyberpunk", era: "1980s–", origin: "SF", category: "internet", palette: ["#05060f", "#00f0ff", "#ff2e88", "#ffd400", "#1a1f3a"] },
  { slug: "liminal-space", ja: "リミナルスペース", en: "Liminal Space", era: "2019–", origin: "インターネット", category: "internet", palette: ["#e8e2c8", "#c9c08a", "#8a8560", "#f2eede", "#4a4632"] },
  { slug: "dreamcore", ja: "ドリームコア", en: "Dreamcore", era: "2019–", origin: "インターネット", category: "internet", palette: ["#1a1030", "#8a6bd6", "#f2a7d8", "#7be0e8", "#f5efe0"] },
  { slug: "cottagecore", ja: "コテージコア", en: "Cottagecore", era: "2018–", origin: "SNS", category: "internet", palette: ["#f3ecdd", "#a8bd8a", "#d9a566", "#c26b6b", "#4a4636"] },
  { slug: "dark-academia", ja: "ダーク・アカデミア", en: "Dark Academia", era: "2019–", origin: "SNS", category: "internet", palette: ["#1c1712", "#5c4a32", "#8a7350", "#c9b892", "#2f2a22"] },
  { slug: "light-academia", ja: "ライト・アカデミア", en: "Light Academia", era: "2020–", origin: "SNS", category: "internet", palette: ["#f4efe4", "#d8cbb4", "#a8917a", "#6b5c48", "#302a22"] },
  { slug: "ethereal", ja: "エセリアル", en: "Ethereal Aesthetic", era: "2010s–", origin: "SNS", category: "internet", palette: ["#f7f4f8", "#e3d5ee", "#cfe3ea", "#f6e0e6", "#8a7f96"] },

  // ── 架空の時代 ────────────────────────────────────────────────────
  { slug: "steampunk", ja: "スチームパンク", en: "Steampunk", era: "1980s–", origin: "イギリスSF", category: "movement", palette: ["#241a12", "#b08046", "#7a4a20", "#d9c9a3", "#3f2f22"] },
  { slug: "dieselpunk", ja: "ディーゼルパンク", en: "Dieselpunk", era: "1920s–40s設定", origin: "欧米", category: "movement", palette: ["#22262a", "#8a6a3f", "#b03a2e", "#c8c2b0", "#12151a"] },
  { slug: "cassette-futurism", ja: "カセット・フューチャリズム", en: "Cassette Futurism", era: "1970s–1980s", origin: "SF映画", category: "movement", palette: ["#d8d2c2", "#3a3f45", "#c8552b", "#e0a33e", "#1f2327"] },
  { slug: "retrofuturism", ja: "レトロフューチャリズム", en: "Retrofuturism", era: "1950s–", origin: "アメリカ", category: "movement", palette: ["#e8e2d0", "#3a6ea5", "#d9542b", "#f2c14e", "#1f2933"] },
  { slug: "biomechanical", ja: "バイオメカニカル・アート", en: "Biomechanical Art", era: "1970s–", origin: "スイス（H.R.ギーガー）", category: "movement", palette: ["#14161a", "#4a5058", "#8a8f96", "#2a2f36", "#c9c4b8"] },

  // ── 日本と、地域 ──────────────────────────────────────────────────
  { slug: "wabi-sabi", ja: "わびさび", en: "Wabi-Sabi", era: "15世紀–", origin: "日本", category: "japan", palette: ["#e4ddd0", "#b8ac97", "#7a6f5e", "#3a3529", "#d0c6b2"] },
  { slug: "japandi", ja: "ジャパンディ", en: "Japandi", era: "2010s–", origin: "日本×北欧", category: "japan", palette: ["#eae5db", "#b9ab97", "#6f6656", "#2f2c26", "#c8bfae"] },
  { slug: "japonisme", ja: "ジャポニスム", en: "Japonisme", era: "1860s–1900s", origin: "ヨーロッパ", category: "japan", palette: ["#efe7d6", "#1f4e5f", "#c0432c", "#d8a13a", "#2a2420"] },
  { slug: "afrofuturism", ja: "アフロフューチャリズム", en: "Afrofuturism", era: "1990s–", origin: "アメリカ", category: "world", palette: ["#0d0a1f", "#f2b705", "#00c2a8", "#e8452a", "#f4e9d8"] },
  { slug: "chicano", ja: "チカーノ・アート", en: "Chicano Art", era: "1960s–", origin: "アメリカ（メキシコ系）", category: "world", palette: ["#1a1a1a", "#c8102e", "#f4a300", "#0f7b6c", "#f2e9d8"] },
  { slug: "ligne-claire", ja: "リーニュ・クレール", en: "Ligne Claire", era: "1930s–", origin: "ベルギー", category: "world", palette: ["#f2ece0", "#1a1a1a", "#d94f2b", "#2f7fc4", "#f2c14e"] },
];

export const SPINE_BY_SLUG: Record<string, Spine> = Object.fromEntries(
  SPINE.map((s) => [s.slug, s]),
);
