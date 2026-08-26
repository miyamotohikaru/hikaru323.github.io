import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "dieselpunk",
  ja: "ディーゼルパンク",
  en: "Dieselpunk",
  era: "1920s–40s設定",
  origin: "欧米",
  category: "movement",

  tagline: "真鍮の楽観が終わったあと、鉄と油と戦争が来る",

  description:
    "スチームパンクが19世紀の楽観を引き延ばしたのに対して、こちらは戦間期から第二次大戦までを引き延ばす。" +
    "動力は蒸気ではなくディーゼルになり、素材は真鍮ではなく鋳鉄と鋼板になる。" +
    "機械は装飾されるのではなく装甲され、煤で汚れている。" +
    "アール・デコの流線と工場の量産が同じ画面に同居するのはそのためだ。" +
    "色は油と煤に引かれて灰・黒・軍用オリーブに落ち、" +
    "そこへプロパガンダポスターの赤が一色だけ差し込まれる。",

  traits: [
    "鋳鉄と鋼板。溶接痕とリベットを残す",
    "灰・黒・軍用オリーブに赤を一色だけ",
    "アール・デコの流線を機械に被せる",
    "煤・油染み・剥げた塗装を必ず入れる",
    "光は探照灯か裸電球の硬い一灯",
  ],

  avoid: [
    "真鍮と革の温かい光沢（スチームパンク）",
    "ネオンと電子表示のパネル",
    "清潔で新品のままの機械",
  ],

  palette: ["#22262a", "#8a6a3f", "#b03a2e", "#c8c2b0", "#12151a"],

  prompt: {
    core: "dieselpunk illustration, interwar industrial machine age",
    texture:
      "riveted steel plate, cast iron, chipped enamel paint, soot and oil staining, canvas webbing, bakelite, heavy screen-printed propaganda-poster ink, hard searchlight beams through smoky haze",
    palette:
      "gunmetal grey, soot black, military olive drab, oxidised brass ochre, and one saturated propaganda red as the only accent; overall low chroma",
    composition:
      "low heroic camera angle tilted up about 20 degrees, massive machine mass occupying the left 60 percent, one hard key light from the upper right throwing a long diagonal shadow, streamlined Art Deco chevrons banding the machine body, stencilled block lettering in the lower corner",
    negative:
      "no brass-and-leather warmth, no decorative exposed gears, no neon, no LEDs, no clean new surfaces, no pastel colours, no fantasy ornament",
  },

  related: ["steampunk", "art-deco", "russian-constructivism", "streamline-moderne"],
};
