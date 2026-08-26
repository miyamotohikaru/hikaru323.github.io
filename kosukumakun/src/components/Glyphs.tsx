import type { ReactNode } from "react";

/**
 * 機能カードの小さい絵。
 *
 * 太さ2の線＋丸い端で描く。こすくまくんの輪郭が太いので、
 * アイコンだけ細いと画面の中で浮いてしまう。塗りは使わず線だけにして、
 * ダークモードでも currentColor で勝手についてくるようにしてある。
 */

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** カーソルを目で追う */
export const EyeGlyph = () => (
  <Frame>
    <path d="M2 12C6 5.5 18 5.5 22 12C18 18.5 6 18.5 2 12Z" />
    <circle cx="14.4" cy="12" r="2.9" fill="currentColor" stroke="none" />
  </Frame>
);

/** つままれるともちもち伸びる */
export const StretchGlyph = () => (
  <Frame>
    <path d="M8.6 5.4L12 2.4L15.4 5.4" />
    <path d="M12 6.6C16.4 6.6 17.6 10.4 16.9 13.6C16.1 17.3 15.6 21.4 12 21.4C8.4 21.4 7.9 17.3 7.1 13.6C6.4 10.4 7.6 6.6 12 6.6Z" />
  </Frame>
);

/** なでるとよろこぶ（うれしい目 ∩∩。口は無い） */
export const HappyGlyph = () => (
  <Frame>
    <path d="M3 15.5Q7 8 11 15.5" />
    <path d="M13 15.5Q17 8 21 15.5" />
  </Frame>
);

/** 打ちすぎるとほわっと湯気 */
export const SteamGlyph = () => (
  <Frame>
    <path d="M6 21C3 17 9 15 6 11C4 8 7 6 6 4" />
    <path d="M12 22C9 18 15 15 12 10C10 6.5 13 4.5 12 2.4" />
    <path d="M18 21C15 17 21 15 18 11C16 8 19 6 18 4" />
  </Frame>
);

/** たまに梅干し。
 *  ゆるく波打つ丸＋まんなかの三日月のしわ。アプリの ume0..5 と同じ見立て。 */
export const UmeboshiGlyph = () => (
  <Frame>
    <path d="M12 2.6C16.4 2.6 21.4 6.4 21.4 12C21.4 17.2 17 21.4 12 21.4C7.2 21.4 2.6 17.4 2.6 12C2.6 6.6 7.4 2.6 12 2.6Z" />
    <path d="M9.4 8.6C9.4 12 10.6 13.6 12.4 14.2" />
    <path d="M9.4 8.6C11.6 10.4 13.8 11.4 16 11.6" />
  </Frame>
);

/** たまに心の声 */
export const ThoughtGlyph = () => (
  <Frame>
    <rect x="4.5" y="2.6" width="17" height="12" rx="5.5" />
    <circle cx="8.2" cy="18.4" r="2" />
    <circle cx="4.2" cy="21.4" r="1.1" />
  </Frame>
);

/** ポモドーロ */
export const TimerGlyph = () => (
  <Frame>
    <circle cx="12" cy="13.8" r="8.4" />
    <path d="M9.4 3.4H14.6" />
    <path d="M12 13.8V9.2" />
    <path d="M12 13.8L15.6 15.9" />
  </Frame>
);

/** ストレッチと水分のお知らせ */
export const DropGlyph = () => (
  <Frame>
    <path d="M12 2.4C15.5 8 19 11.5 19 15C19 18.9 15.9 22 12 22C8.1 22 5 18.9 5 15C5 11.5 8.5 8 12 2.4Z" />
  </Frame>
);

/** うとうとして寝る */
export const SleepGlyph = () => (
  <Frame>
    <path d="M13 3.2H20L13 11.2H20" />
    <path d="M4 14.2H9.5L4 20.8H9.5" />
  </Frame>
);
