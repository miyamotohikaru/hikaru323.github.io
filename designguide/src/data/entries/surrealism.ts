import type { DesignStyle } from "../types";

export const style: DesignStyle = {
  slug: "surrealism",
  ja: "シュールレアリズム",
  en: "Surrealism",
  era: "1924–",
  origin: "フランス",
  category: "movement",

  tagline: "あり得ない情景を、写真のような精度で描き切る",

  description:
    "ダダが破壊を終えたあとに残ったのは、では何を信じるのかという問いだった。" +
    "ブルトンはフロイトを読み、理性が押さえ込んでいる無意識のほうが本当の現実だと宣言する。" +
    "だから描き方は乱暴にならず、むしろ古典絵画のように精密になった。" +
    "題材は、長い影の落ちる無人の広場、遠すぎる地平線、縮尺の狂った日用品。" +
    "あり得ない組み合わせを、疑いようのない筆致で描くほど、見る者は絵ではなく自分の理性のほうを疑いはじめるからである。",

  traits: [
    "遠近法は正しく、中身だけを狂わせる",
    "無人の広場に長い影を一本落とす",
    "日用品の縮尺だけを極端に変える",
    "境目のない広い空とぼかした地平",
    "質感は写実。石・金属・布を描き分ける",
  ],

  avoid: [
    "破れや偶然に任せた雑なコラージュ",
    "図形の抽象化・平面化",
    "説明的なキャプションや記号",
  ],

  palette: ["#dfe6ea", "#2f5f8a", "#c2703d", "#f0d9a8", "#1a2028"],

  prompt: {
    core: "Surrealist oil painting, dreamlike juxtaposition",
    texture:
      "smooth academic oil glazing with invisible brushwork, porcelain-fine rendering of stone, metal and cloth, soft sfumato in the sky, aged varnish finish",
    palette:
      "cool overcast blue-grey sky graded to pale sand, terracotta and ochre stone, near-black shadow, one warm cream highlight",
    composition:
      "a deserted plaza or empty plain under a vast sky, horizon set low at about one third, a single long raking shadow crossing the ground, an everyday object at impossible scale rendered with photographic accuracy, deep one-point perspective, uncanny stillness with no motion blur",
    negative:
      "no torn collage edges, no visible brush texture, no flat geometric abstraction, no cartoon styling, no text or captions, no chaotic clutter",
  },

  related: ["dadaism", "pop-surrealism", "dreamcore", "liminal-space"],
};
