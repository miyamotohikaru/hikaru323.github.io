/**
 * STYLE ATLAS のデータ型。
 *
 * 図鑑の1件＝1スタイル。ここに入っているものが、
 *   ・アトラス（一覧）のカード
 *   ・スタイル詳細ページ
 *   ・プロンプトビルダーが組み立てる文面
 * の3つすべての材料になる。だから「見た目の話」と「プロンプトの語」を
 * 別のフィールドに分けてある。日本語は読む人のため、prompt.* は機械のため。
 */

export type StyleCategory =
  | "movement" // 美術・デザインの運動として起きたもの
  | "print" // 印刷・製版の都合から生まれたもの
  | "screen" // 画面（UI）のために作られたもの
  | "internet" // ネット・SNSから自然発生したもの
  | "japan" // 日本発、または日本の美意識に根を持つもの
  | "world"; // 特定の地域・文化圏に強く結びつくもの

export const CATEGORY_LABEL: Record<StyleCategory, { ja: string; en: string }> = {
  movement: { ja: "運動", en: "Movement" },
  print: { ja: "印刷", en: "Print" },
  screen: { ja: "画面", en: "Screen" },
  internet: { ja: "ネット", en: "Internet" },
  japan: { ja: "日本", en: "Japan" },
  world: { ja: "地域", en: "Region" },
};

export type DesignStyle = {
  /** URL とファイル名。英小文字とハイフンのみ */
  slug: string;
  /** 日本語名。図鑑の見出しになる */
  ja: string;
  /** 英語名。プロンプトにそのまま入る語でもある */
  en: string;
  /** 年代。"1919–1933" / "2010s–" のような書き方 */
  era: string;
  /** 出自。国名か、生まれた場所 */
  origin: string;
  category: StyleCategory;

  /** 一行。「これは何か」を20〜32字で言い切る */
  tagline: string;
  /** 3〜4文。どこから来て、なぜそう見えるのか */
  description: string;
  /** 見た目の決め手。3〜5個。各12〜24字 */
  traits: string[];
  /** これをやると崩れる、という注意。2〜3個 */
  avoid: string[];

  /** 図版と共通の5色。左から地→主→副→差→締め */
  palette: string[];

  /** プロンプトに差し込む英語の部品 */
  prompt: {
    /** スタイルの核。"Bauhaus poster design" のような句 */
    core: string;
    /** 技法・質感 */
    texture: string;
    /** 色の言い方 */
    palette: string;
    /** 構図・レイアウトの癖 */
    composition: string;
    /** 禁止句。ネガティブプロンプトに入る */
    negative: string;
  };

  /** 近いスタイル。詳細ページの「隣」に出る */
  related: string[];
};
