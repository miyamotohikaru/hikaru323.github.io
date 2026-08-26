import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "steampunk",
  ja: "スチームパンク",
  en: "Steampunk",
  era: "1980s–",
  origin: "イギリスSF",
  category: "movement",

  tagline: "蒸気のまま進化した19世紀。機械の中身を外に出す",

  description:
    "1987年にK.W.ジーターが名づけた、SFの一分派から始まった。" +
    "石油と電子回路の代わりに、蒸気と歯車のまま20世紀が来ていたら、という反実仮想が芯にある。" +
    "だから見た目の決め手は素材ではなく、中身が外に出ていることのほうだ。" +
    "歯車、配管、ボイラー、リベット、圧力計といった動く仕組みが筐体の外側に露出し、" +
    "それを真鍮と革と磨いた無垢材で仕立てる。" +
    "ヴィクトリア朝の唐草装飾は、そのうえに後から被せられる。",

  traits: [
    "機構を筐体の外に出す（歯車・配管）",
    "真鍮・銅・革・無垢材の四素材で組む",
    "留め具はリベットと蝶ネジを見せる",
    "圧力計と真鍮の目盛りを必ず一つ",
    "照明は白熱球かガス灯の橙にする",
  ],

  avoid: [
    "プラスチックとクロムの光沢",
    "電子基板・LED・液晶（それはサイバーパンク）",
    "錆びた廃墟の荒廃感（ディーゼルパンク）",
  ],

  palette: ["#241a12", "#b08046", "#7a4a20", "#d9c9a3", "#3f2f22"],

  prompt: {
    core: "steampunk illustration, Victorian retro-engineering",
    texture:
      "polished brass and patinated copper, riveted iron plate, oiled leather straps, quartersawn walnut, exposed brass gearing, engraved acanthus scrollwork, warm tungsten and gaslight glow, aged sepia varnish",
    palette:
      "warm brass gold, burnt copper, saddle-brown leather, aged ivory parchment, deep bitumen brown; entirely warm, no cool blues",
    composition:
      "three-quarter product-shot angle, working mechanism deliberately exposed on the outer shell, one large pressure gauge as the focal point at the upper-left third, dense clustered detail filling the lower 60 percent, dark vignetted background, warm rim light from frame right",
    negative:
      "no plastic, no chrome, no LEDs or screens, no neon, no circuit boards, no cool blue lighting, no post-apocalyptic rust and decay, no minimalism",
  },

  related: ["dieselpunk", "victorian", "art-nouveau", "retrofuturism"],
};
