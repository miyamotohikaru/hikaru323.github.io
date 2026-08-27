import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "glitch-art",
  ja: "グリッチアート",
  en: "Glitch Art",
  era: "1990s–",
  origin: "デジタル",
  category: "internet",

  tagline: "壊れた画像を直さない。エラーそのものを絵として飾る",

  description:
    "機械が壊れたときにしか出ない模様を、作品として拾う手つき。" +
    "JPEGのバイト列をテキストエディタで書き換える、動画のキーフレームだけ抜いて残像を暴走させる、映像信号の同期をわざと外す。" +
    "どれも「直すべき失敗」を材料に変えていて、そこには、完璧に見えるデジタルの表面にも固有の壊れ方がある、という指摘が入っている。" +
    "見た目の要はRGBのズレで、赤とシアンが数画素横にずれるだけで、脳は即座に「壊れている」と読む。",

  traits: [
    "RGBを3〜12px横にずらして分離させる",
    "水平の帯を行単位で切り、横へ流す",
    "圧縮の破綻したブロックノイズを残す",
    "同期ズレの帯を画面の四分の一に走らせる",
    "壊れていない部分を必ず半分残す",
  ],

  avoid: [
    "均一にノイズを乗せただけの粗さ",
    "整った左右対称・安定した構図",
    "柔らかいぼかしで誤魔化すこと",
  ],

  palette: ["#08080c", "#ff0040", "#00fff0", "#f2f2f2", "#7a00ff"],

  prompt: {
    core: "glitch art, datamoshed image, digital signal corruption",
    texture:
      "RGB channel separation offset 3–12px, horizontal datamosh slices displaced sideways, JPEG macroblock artefacts, pixel-sorting streaks, CRT roll bar, chromatic aberration, no smooth blur anywhere",
    palette:
      "near-black #08080c base, pure red #ff0040 and cyan #00fff0 as the separated channels, violet #7a00ff where they overlap, plain white #f2f2f2 in the intact areas; harsh, unblended, screen-emitted colour",
    composition:
      "one recognisable subject filling the centre 60%, the lower third torn into horizontal bands displaced 20–80px left and right, one clean untouched region kept intact so the damage reads as damage, a compression-collapsed block at the upper right, off-balance framing, no symmetry",
    negative:
      "no uniform film grain, no soft blur, no symmetric composition, no clean vector edges, no pastel colours, no paper texture, no tidy retro frame, no fully destroyed unreadable image, no drop shadows",
  },

  related: ["vaporwave", "cyberpunk", "pixel-art", "acid-graphics"],
};
