"use client";

import { useState, useEffect } from "react";
import SubmitForm from "@/components/SubmitForm";
import KojienPreview from "@/components/KojienPreview";
import RecentWords from "@/components/RecentWords";
import type { WordEntry, KojienEntryData } from "@/lib/types";

interface SubmitResult {
  exists: boolean;
  word: string;
  reason?: string;
  kojienEntry?: KojienEntryData;
  nickname?: string;
}

export default function Home() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentWords, setRecentWords] = useState<WordEntry[]>([]);
  const [dailyWord, setDailyWord] = useState<WordEntry | null>(null);

  useEffect(() => {
    fetch("/api/words?sort=newest&limit=5")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setRecentWords(data.words || []))
      .catch(() => {});

    fetch("/api/daily")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => { if (data.word) setDailyWord(data.word); })
      .catch(() => {});
  }, []);

  const handleResult = (data: SubmitResult) => {
    setResult(data);
  };

  const handleRetry = () => {
    setResult(null);
  };

  return (
    <main className="main-content">
      {/* Daily Word */}
      {dailyWord && (
        <div className="daily-section">
          <h2 className="daily-label">本日の見出し語</h2>
          <div className="daily-card">
            <p className="daily-formatted">
              {dailyWord.kojienFormatted ||
                `${dailyWord.word}【${dailyWord.reading}】（${dailyWord.partOfSpeech}）${dailyWord.definition}`}
            </p>
            <span className="daily-likes">♡ {dailyWord.likes}</span>
          </div>
        </div>
      )}

      {/* Recent Words */}
      <RecentWords words={recentWords} />

      <div className="divider" />

      {/* Submit / Result */}
      {!result && !isLoading && (
        <SubmitForm onResult={handleResult} onLoading={setIsLoading} />
      )}

      {isLoading && (
        <div className="loading-section fade-in">
          <div className="loading-spinner" />
          <p className="loading-text">辞典を編纂中…</p>
        </div>
      )}

      {result && result.exists && (
        <div className="rejection-section fade-in">
          <p className="rejection-text">
            「{result.word}」は実在する言葉のため、<br />
            本辞典には掲載しておりません。
          </p>
          {result.reason && (
            <p className="rejection-reason">{result.reason}</p>
          )}
          <button onClick={handleRetry} className="retry-button">
            別の言葉を申請する
          </button>
        </div>
      )}

      {result && !result.exists && result.kojienEntry && (
        <KojienPreview
          entry={result.kojienEntry}
          nickname={result.nickname || ""}
          onRetry={handleRetry}
        />
      )}
    </main>
  );
}
