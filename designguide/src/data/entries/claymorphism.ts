import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "claymorphism",
  ja: "クレイモーフィズム",
  en: "Claymorphism",
  era: "2020s–",
  origin: "UI",
  category: "screen",

  tagline: "触れば指が沈みそうな、まるい粘土のインターフェース",

  description:
    "ニューモーフィズムの失敗から生まれた。" +
    "地色と同じ色で凹凸を作るあのやり方は、コントラストが足りず、押せるのかどうか分からなかった。" +
    "そこでクレイモーフィズムは逆をやる。面をパステルのベタで塗り、角を辺の三分の一まで丸め、" +
    "内側に白い光、外側に色のついた柔らかい影を二重に置いて、厚みのある粘土の塊に見せる。" +
    "3Dのクレイレンダーが流行った時期と重なり、その質感を影だけで真似たものが画面に残った。",

  traits: [
    "角丸を辺の三分の一まで大きく取る",
    "内側に白、外側に色影の二重シャドウ",
    "パステル。彩度は中、明度は高く保つ",
    "面はベタ塗り。写真も柄も貼らない",
    "要素どうしを重ね、厚みを見せる",
  ],

  avoid: [
    "地色と同色で凹ませること",
    "透過とぼかしで奥を見せること",
    "硬い直角と1pxの細い罫",
  ],

  palette: ["#eef0ff", "#a5b4fc", "#fbcfe8", "#fde68a", "#4c4a68"],

  prompt: {
    core: "claymorphism UI illustration, soft 3D clay render, puffy rounded shapes",
    texture:
      "matte clay shading with faint subsurface scattering, rounded bevel edges, dual shadow — inset white highlight at 10 o'clock plus a coloured outer drop shadow at 24px blur, gentle ambient occlusion in the crevices, no specular hotspot",
    palette:
      "pastel palette — periwinkle #a5b4fc, cotton pink #fbcfe8, butter yellow #fde68a on a cool off-white #eef0ff ground; slate-violet #4c4a68 for type only; medium saturation, high value, nothing darker than 30% luminance",
    composition:
      "one large rounded card centred with a 40% margin, corner radius one third of the shorter side, two or three smaller pills overlapping its edge at 15–20°, elements floating 20–30px apart on a plain ground, geometric sans-serif set in slate-violet, even padding on all sides",
    negative:
      "no glass blur, no transparency, no photographic texture, no sharp corners, no hairline strokes, no dark background, no neon, no gradients falling to black, no specular reflections",
  },

  related: ["neumorphism", "glassmorphism", "flat-design", "corporate-memphis"],
};
