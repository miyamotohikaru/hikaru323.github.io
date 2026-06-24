"use client";

import { useI18n } from "@/lib/i18n";

// 「この言葉を見る」などで /word/[id] へ遷移した直後に表示されるローディング画面。
// サーバーでのデータ取得に時差があるため、読み込み中だと分かるUXを出す。
export default function Loading() {
  const { t } = useI18n();
  return (
    <main className="main-content">
      <div className="word-loading">
        <span className="word-loading-spinner" />
        <span className="word-loading-text">{t("loading.text")}</span>
      </div>
    </main>
  );
}
