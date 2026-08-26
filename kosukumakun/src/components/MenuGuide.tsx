import { Kosukuma } from "@/components/Kosukuma";

/**
 * メニューバーのメニューの図。
 *
 * ここだけは **項目の名前をそのまま出す**。
 * 他の模式図（Diagrams.tsx）は形だけの絵にしてあるが、
 * メニューは「どれを押せばいいか」が本題なので、字が無いと伝わらない。
 * 出しているのは全部アプリ自身の文言なので、OSの版が変わってもズレない
 * （スクリーンショットを貼らないのは、そこがズレるから）。
 */

/** メニューの中身。page.tsx の説明文とここで名前を共有する。 */
export const MENU_ITEMS: { t: string; k?: string; b: string }[] = [
  {
    t: "かくれてもらう",
    b: "姿が消えて、動きも止まります。もう一度押すと「出てきてもらう」に変わり、そのまま戻ってきます。",
  },
  {
    t: "定位置にもどす",
    k: "⌘R",
    b: "画面のいちばん下・右のほうへ帰ってきます。どこへ行ったか分からないときは、まずこれ。",
  },
  {
    t: "画面のはしからのぞく",
    b: "画面のふちへどいて、顔だけ出します。じゃまなときはこれ。もう一度押すと降りてきます。",
  },
  {
    t: "おやすみ",
    b: "その場で丸まって寝ます。さわると起きます。",
  },
  {
    t: "ポモドーロをはじめる",
    b: "25分やって5分休むを4回。音は鳴らしません。こすくまくんの様子だけで知らせます。",
  },
  {
    t: "設定…",
    k: "⌘,",
    b: "大きさ、寝るまでの時間、のびをする合図、心の声の出し方などを変えられます。",
  },
  {
    t: "終了",
    k: "⌘Q",
    b: "完全に止まります。次はアプリケーションから開きます。",
  },
];

/** 区切り線が入る位置（この項目の**前**に線を引く） */
const RULE_BEFORE = new Set(["ポモドーロをはじめる", "設定…", "終了"]);

export function MenuMock() {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ border: "1px solid var(--line)", background: "var(--soft)" }}
    >
      {/* メニューバー。小さいこすくまくんが押されている状態 */}
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <span className="h-1.5 w-5 rounded-full" style={{ background: "var(--muted)", opacity: 0.3 }} />
        <span className="h-1.5 w-8 rounded-full" style={{ background: "var(--muted)", opacity: 0.3 }} />
        <span className="flex-1" />
        <span
          className="grid h-6 w-7 place-items-center rounded"
          style={{ background: "var(--line)" }}
        >
          <Kosukuma pose="front" silhouette className="h-4 w-auto" />
        </span>
        <span className="h-1.5 w-6 rounded-full" style={{ background: "var(--muted)", opacity: 0.3 }} />
      </div>

      {/* 開いたメニュー */}
      <div
        className="mt-2 ml-auto w-[248px] rounded-lg py-1.5"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="px-3 py-1 text-[12px]" style={{ color: "var(--muted)" }}>
          こすくまくん
        </div>
        <div className="my-1 h-px" style={{ background: "var(--line)" }} />
        {MENU_ITEMS.map(({ t, k }) => (
          <div key={t}>
            {RULE_BEFORE.has(t) && (
              <div className="my-1 h-px" style={{ background: "var(--line)" }} />
            )}
            <div className="flex items-baseline justify-between px-3 py-[3px] text-[12.5px]">
              <span>{t}</span>
              {k && (
                <span className="tabular-nums" style={{ color: "var(--muted)" }}>
                  {k}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
