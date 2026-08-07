export type FlipOp =
  | "文脈置換"
  | "尺度変更"
  | "役割反転"
  | "因果の再接続"
  | "用途転換"
  | "参加化"
  | "制度介入"
  | "可視化"
  | "命名"
  | "消去";

export const FLIP_OPS: FlipOp[] = [
  "文脈置換",
  "尺度変更",
  "役割反転",
  "因果の再接続",
  "用途転換",
  "参加化",
  "制度介入",
  "可視化",
  "命名",
  "消去",
];

/** 各操作の英字ラベル。カード面・詳細ページのモノスペース表記に使う。 */
export const OP_LATIN: Record<FlipOp, string> = {
  文脈置換: "RECONTEXT",
  尺度変更: "RESCALE",
  役割反転: "INVERT",
  因果の再接続: "RECONNECT",
  用途転換: "REPURPOSE",
  参加化: "PARTICIPATE",
  制度介入: "INTERVENE",
  可視化: "SURFACE",
  命名: "NAME",
  消去: "ERASE",
};

export type Era =
  | "1900s"
  | "1950s"
  | "1960s"
  | "1970s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

export type Region =
  | "北米"
  | "西欧"
  | "北欧"
  | "東欧"
  | "東アジア"
  | "東南アジア"
  | "南アジア"
  | "中東"
  | "アフリカ"
  | "中南米"
  | "オセアニア";

export type Field =
  | "現代アート"
  | "広告・キャンペーン"
  | "都市・インフラ"
  | "公共制度"
  | "金融・経済"
  | "市民テック"
  | "プロダクト"
  | "民俗・儀礼"
  | "社会実験";

export type Scale = "極小" | "小" | "中" | "大" | "巨大";

export type Legality = "合法" | "許可済み" | "グレー" | "無許可" | "係争";

/** FLIP性の判断ラベル。点数ではなく編集作業上の状態のみを表す。 */
export type FlipStatus = "収録" | "境界事例" | "調査保留" | "非収録";

/** 公開状態。FLIP性とは別フィールドで管理する。 */
export type PublishStatus = "公開可" | "内部記録" | "更新要";

export type Source = {
  label: string;
  publisher: string;
  title: string;
  url: string;
  /** 一次資料まで辿って本文を確認できたか。false は書誌のみ確認。 */
  confirmed: boolean;
};

export type ChronoEntry = {
  date: string;
  event: string;
};

export type Axes = {
  era: Era;
  region: Region;
  field: Field;
  actorType: string;
  scale: Scale;
  legality: Legality;
};

export type Case = {
  id: string;
  slug: string;
  titleJa: string;
  titleOrig: string;
  year: number;
  yearLabel: string;
  place: string;
  actor: string;
  actorRole: string;
  form: string;

  /** 評価語なしの一行概要。 */
  oneline: string;
  /** 確認できた事実のみ。作者の説明とFLIP読解を混ぜない。 */
  facts: string;
  /** 実行主体自身による説明。事実と読解から隔離する。 */
  actorStatement?: string;
  /** 変容前の見え方。 */
  before: string;
  /** 何をどう配置し直したか。 */
  operation: string;
  /** 前景化されたもの。 */
  foregrounded: string;
  /** こす.くまによるFLIP読解であることを明示する。 */
  flipReading: string;
  /** 別の読み方・批判・残る問い。 */
  counter: string;

  chronology: ChronoEntry[];
  sources: Source[];
  /** 編集上の注意・未確認事項。 */
  notes: string;

  axes: Axes;
  flipOps: FlipOp[];
  flipStatus: FlipStatus;
  publishStatus: PublishStatus;
  keywords: string[];
};
