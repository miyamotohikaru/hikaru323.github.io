import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "liminal-space",
  ja: "リミナルスペース",
  en: "Liminal Space",
  era: "2019–",
  origin: "インターネット",
  category: "internet",

  tagline: "見覚えがあるのに、誰もいない。通り過ぎるための場所だけが残る",

  description:
    "2019年、匿名掲示板に貼られた一枚の黄ばんだ部屋の写真と、その場で生まれた作り話から広がった。" +
    "写るのはモール、ホテルの廊下、深夜のプール、学校の階段。" +
    "どれも本来は人がいる場所で、しかも人がいるためではなく、通り過ぎるために作られている。" +
    "だから無人になった瞬間、目的を失って不気味になる。" +
    "この様式の不安はお化けではなく、「見覚えがあるのに誰もいない」という記憶の側のズレから来ている。" +
    "写真は必ず素人が撮ったように、フラッシュ気味で、構図が下手で、少し古い。",

  traits: [
    "人を一人も写さない。痕跡だけ残す",
    "蛍光灯かフラッシュで黄ばんだ白を出す",
    "通路・階段・待合など通過用の空間を選ぶ",
    "胸の高さから正面。あえて構図を外す",
    "絨毯や天井の同じ模様を奥まで反復させる",
  ],

  avoid: [
    "上手い構図と映画的な照明",
    "幽霊や怪物など、はっきりした恐怖の対象",
    "彩度の高い色と鮮明な高画質",
  ],

  palette: ["#e8e2c8", "#c9c08a", "#8a8560", "#f2eede", "#4a4632"],

  prompt: {
    core: "liminal space photograph, empty transitional interior",
    texture:
      "amateur point-and-shoot snapshot, direct on-camera flash, buzzing fluorescent tubes, yellowed wallpaper, worn patterned carpet, slight motion blur, 2005 compact-camera noise, low dynamic range",
    palette:
      "yellowed off-white walls #f2eede, mustard beige #e8e2c8, dulled ochre carpet #c9c08a, olive-grey shadow #8a8560, dark brown #4a4632 in the deepest corners; desaturated, jaundiced, no cool tones at all",
    composition:
      "chest-height eye level, dead-on frontal framing or slightly crooked, a corridor or stairwell receding to a corner you cannot see past, ceiling tiles and carpet pattern repeating to the vanishing point, no people and no clear subject, an awkwardly empty centre, an exit sign or doorway as the only incident",
    negative:
      "no people, no monsters, no ghosts, no cinematic lighting, no saturated colours, no dramatic composition, no shallow depth of field, no HDR, no daylight through large windows, no clutter, no props",
  },

  related: ["dreamcore", "vaporwave", "surrealism"],
};
