import type { ReactNode } from "react";
import { Kosukuma } from "@/components/Kosukuma";

/**
 * インストール手順の模式図。
 *
 * スクリーンショットは配らない。撮った瞬間にOSのバージョンとズレるし、
 * 画像を置くとサイトが重くなるから。全部 CSS と inline SVG で描いた「イメージ図」にして、
 * サイトの線の太さに揃えてある（＝本物のUIと見間違えない）。
 * 図はどれも明るい地のまま。ダークモードでも手順の見え方を変えないため。
 */

function MiniButton({
  children,
  primary = false,
}: {
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-current px-2.5 py-0.5 text-[11px] leading-tight font-bold ${
        primary ? "bg-cream" : ""
      }`}
    >
      {children}
    </span>
  );
}

function Arrow({ dir = "right" }: { dir?: "right" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 shrink-0 ${dir === "down" ? "rotate-90" : ""}`}
      aria-hidden
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/** こすくまくんのアプリアイコン（角丸の四角にシルエットを入れただけ） */
function AppIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <span
      className={`${className} grid place-items-center rounded-[22%] border-2 border-current bg-cream`}
    >
      <Kosukuma pose="front" className="h-[70%] w-auto" />
    </span>
  );
}

/* ① ZIPをダウンロード ---------------------------------------------------- */
export function ZipMock() {
  return (
    <div className="mock flex items-center gap-3 p-3">
      <span className="relative grid h-11 w-9 shrink-0 place-items-center rounded-[5px] border-2 border-current bg-cream">
        <span className="absolute top-[-2px] right-[-2px] h-3.5 w-3.5 rounded-bl-[4px] border-b-2 border-l-2 border-current bg-[var(--stage)]" />
        <span className="mt-1 h-4 w-[3px] bg-current" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-bold">
          こすくまくん.zip
        </span>
        <span className="block text-[11px] opacity-70">約 1MB</span>
      </span>
      <Arrow dir="down" />
    </div>
  );
}

/* ② アプリケーションフォルダへ -------------------------------------------- */
export function AppFolderMock() {
  return (
    <div className="mock flex items-center justify-center gap-3 p-3">
      <span className="text-center">
        <AppIcon />
        <span className="mt-1 block text-[10px] leading-tight font-bold">
          こすくまくん
        </span>
      </span>
      <Arrow />
      <span className="text-center">
        <span className="relative block h-12 w-14 rounded-[6px] rounded-tl-none border-2 border-current bg-cream">
          <span className="absolute top-[-8px] left-[-2px] h-2.5 w-7 rounded-t-[5px] border-2 border-b-0 border-current bg-cream" />
        </span>
        <span className="mt-1 block text-[10px] leading-tight font-bold">
          アプリケーション
        </span>
      </span>
    </div>
  );
}

/* ③ 「開けません」と出る --------------------------------------------------- */
export function BlockedDialogMock() {
  return (
    <div className="mock mx-auto max-w-[300px] p-4 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto h-8 w-8"
        aria-hidden
      >
        <path d="M12 3.5 22 20.5H2Z" />
        <path d="M12 10v4.4M12 17.4v.2" />
      </svg>
      <p className="mt-2 text-[12px] leading-snug font-bold">
        「こすくまくん」は開けません
      </p>
      <p className="mt-1 text-[11px] leading-snug opacity-75">
        開発元を確認できないため
      </p>
      <p className="mt-3 flex flex-wrap justify-center gap-2">
        <MiniButton>ゴミ箱に入れる</MiniButton>
        <MiniButton primary>完了</MiniButton>
      </p>
      <p className="mt-2 text-[10px] leading-tight opacity-70">
        ※ 文言はmacOSのバージョンで少し変わります
      </p>
    </div>
  );
}

/* ④ プライバシーとセキュリティ → このまま開く ------------------------------ */
export function SettingsMock() {
  return (
    <div className="mock overflow-hidden">
      <div className="flex">
        <span className="w-[68px] shrink-0 space-y-1.5 border-r-2 border-current p-2">
          <span className="block h-1.5 w-full rounded-full bg-current opacity-25" />
          <span className="block h-1.5 w-4/5 rounded-full bg-current opacity-25" />
          <span className="block h-1.5 w-full rounded-full bg-current opacity-25" />
          <span className="block h-2.5 w-full rounded-full border-2 border-current bg-cream" />
        </span>
        <span className="min-w-0 flex-1 p-3">
          <span className="block text-[11px] font-bold">セキュリティ</span>
          <span className="mt-1.5 block text-[11px] leading-snug">
            「こすくまくん」は開発元を確認できないため、使用がブロックされました。
          </span>
          <span className="mt-2.5 flex items-center justify-end gap-1.5">
            <span className="text-[11px] font-bold">ここ →</span>
            <MiniButton primary>このまま開く</MiniButton>
          </span>
        </span>
      </div>
    </div>
  );
}

/* ⑤ メニューバーに出たら成功 ----------------------------------------------- */
export function MenuBarMock() {
  return (
    <div className="mock overflow-hidden">
      <span className="flex items-center gap-2 border-b-2 border-current px-2.5 py-1.5">
        <span className="h-1.5 w-5 rounded-full bg-current opacity-25" />
        <span className="h-1.5 w-8 rounded-full bg-current opacity-25" />
        <span className="flex-1" />
        <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-current bg-cream">
          <Kosukuma
            pose="front"
            silhouette
            className="h-3.5 w-auto text-[#111]"
          />
        </span>
        <span className="h-1.5 w-6 rounded-full bg-current opacity-25" />
      </span>
      <span className="block px-3 py-2.5 text-center text-[11px] leading-snug font-bold">
        ↑ ここに小さいこすくまくんが出たら成功
      </span>
    </div>
  );
}
