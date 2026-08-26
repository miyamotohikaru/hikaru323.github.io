import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "isometric",
  ja: "アイソメトリック",
  en: "Isometric",
  era: "1950s–",
  origin: "製図／UI",
  category: "screen",

  tagline: "奥へ行っても縮まない、消失点のない三十度の世界",

  description:
    "元は工学製図の投影法。奥行きを水平から30度に倒し、遠くのものも同じ寸法で描く。" +
    "消失点がないので、図面から部品の長さを直接測れる。" +
    "この「縮まない」性質がゲームとインフォグラフィックに移った。" +
    "奥の建物も手前の建物も同じ大きさで描けるから、街や社内システムのような" +
    "「全体の構造」を一枚に収められる。" +
    "難点も同じ理由から来ていて、遠近がないぶん、どの面が上でどの面が横かは色の明暗だけで示すしかない。",

  traits: [
    "奥行きの線は水平から±30度で引く",
    "遠近をつけない。奥も手前も同じ寸法",
    "上面・右面・左面を明・中・暗で塗り分ける",
    "影は真下でなく30度方向へ平行に落とす",
    "縦の線は必ず垂直のまま保つ",
  ],

  avoid: [
    "消失点のある一点透視・二点透視",
    "奥をぼかす、奥を小さくすること",
    "面の明暗を揃えて立体を潰すこと",
  ],

  palette: ["#eef1f6", "#3b5bdb", "#7048e8", "#f76707", "#141726"],

  prompt: {
    core: "isometric illustration, 30-degree axonometric projection",
    texture:
      "flat vector fills with three-tone facet shading, crisp edges, a uniform 2px dark outline or none at all, 6% noise on the largest surfaces only",
    palette:
      "cool light grey ground #eef1f6, structures in cobalt #3b5bdb and violet #7048e8, one orange #f76707 accent object, dark navy #141726 for the shadow faces; top faces +12% lightness, right faces at base value, left faces −18%",
    composition:
      "true isometric grid with depth axes at exactly 30° above horizontal and verticals dead vertical, no vanishing point and no foreshortening, the main structure filling the centre 70% and floating on a plain ground, cast shadows as flat parallelograms offset 30° to the lower right, one cutaway or exploded element",
    negative:
      "no perspective, no vanishing point, no foreshortening, no depth of field, no atmospheric haze, no photographic lighting, no blurred drop shadow, no tilted verticals, no horizon line",
  },

  related: ["pixel-art", "flat-design", "precisionism", "bauhaus"],
};
