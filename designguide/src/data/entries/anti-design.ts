import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "anti-design",
  ja: "アンチデザイン",
  en: "Anti-Design",
  era: "1960s–1970s",
  origin: "イタリア",
  category: "movement",

  tagline: "良い趣味こそ売るための道具だ、と机を疑う",

  description:
    "1960年代末のイタリアで、若い建築家たちが敵に回したのは悪いデザインではなく、良いデザインのほうだった。" +
    "機能的で美しい家具は結局、消費を回し続けるための装置にすぎない——そう考えた彼らは、座り心地の悪い椅子、部屋より大きな家具、安っぽいラミネートの柄をわざと作って展示場に置いた。" +
    "売るためではなく、議論を起こすための物である。" +
    "だから形は挑発的で、素材は工業的で、色は下品すれすれで止めてある。",

  traits: [
    "機能を裏切る。座れない椅子、使えない机",
    "家具を部屋より大きくして比率を壊す",
    "安いラミネート・発泡・プラスチックを使う",
    "下品すれすれの原色をベタで塗る",
    "皮肉として古典やキッチュの柄を貼る",
  ],

  avoid: [
    "使い勝手や快適さへの配慮",
    "上品にまとめた配色（それが敵）",
    "80年代の陽気なポップさ（メンフィス）",
  ],

  palette: ["#e8e2d6", "#d94f2b", "#1f6f5c", "#f2c14e", "#1a1a1a"],

  prompt: {
    core: "Italian Radical Design, anti-design object, 1968 provocation",
    texture:
      "cheap plastic laminate, moulded polyurethane foam, glossy fibreglass, screen-printed flat industrial colour, deliberately synthetic surfaces, no craft detailing",
    palette:
      "raw paper-beige ground, blunt orange-vermilion, flat bottle green, cheap chrome yellow, hard black outline; unblended and poster-flat, deliberately unrefined",
    composition:
      "one absurd oversized object dominating an otherwise bare white gallery room, scale deliberately wrong so the furniture reads larger than the architecture, frontal deadpan documentary framing at eye level, awkward unbalanced negative space, an ironic classical or kitsch pattern applied flat onto a modern form",
    negative:
      "no ergonomic refinement, no tasteful muted palette, no fine craftsmanship, no cheerful 1980s pastels, no squiggles and confetti, no luxury materials, no soft lighting",
  },

  related: ["memphis", "punk", "kitsch", "pop-art"],
};
