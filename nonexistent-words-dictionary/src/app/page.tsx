"use client";

import { useState } from "react";
import SubmitForm from "@/components/SubmitForm";
import KojienPreview from "@/components/KojienPreview";
import RecentWords from "@/components/RecentWords";

interface KojienEntryData {
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  formatted: string;
}

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
  const [nickname, setNickname] = useState("");

  const handleResult = (data: SubmitResult) => {
    setNickname(data.nickname || "");
    setResult(data);
  };

  const handleRetry = () => {
    setResult(null);
  };

  return (
    <main className="main-content">
      {/* 最近生まれた言葉 */}
      {!result && !isLoading && <RecentWords />}

      {/* ローディング中 */}
      {isLoading && (
        <div className="page-flip-loading fade-in">
          <div className="page-flip-book">
            <div className="page-flip-cover-back" />
            <div className="page-flip-page page-flip-page-1" />
            <div className="page-flip-page page-flip-page-2" />
            <div className="page-flip-page page-flip-page-3" />
            <div className="page-flip-page page-flip-page-4" />
            <div className="page-flip-page page-flip-page-5" />
            <div className="page-flip-page page-flip-page-6" />
            <div className="page-flip-page page-flip-page-7" />
            <div className="page-flip-page page-flip-page-8" />
            <div className="page-flip-page page-flip-page-9" />
            <div className="page-flip-page page-flip-page-10" />
            <div className="page-flip-page page-flip-page-11" />
            <div className="page-flip-page page-flip-page-12" />
            <div className="page-flip-cover-front" />
          </div>
          <p className="page-flip-text">編纂者が審査しています…</p>
        </div>
      )}

      {/* 結果表示 */}
      {!isLoading && result && (
        <>
          {result.exists ? (
            <div className="rejection-container fade-in">
              <div className="rejection-card">
                <p className="rejection-text">
                  「{result.word}」は実在する言葉のため、<br />
                  本辞典には掲載しておりません。
                </p>
                {result.reason && (
                  <p className="rejection-reason">{result.reason}</p>
                )}
                <button onClick={handleRetry} className="rejection-retry">
                  別の言葉を申請する
                </button>
              </div>
            </div>
          ) : result.kojienEntry ? (
            <KojienPreview
              entry={result.kojienEntry}
              nickname={nickname}
              onRetry={handleRetry}
            />
          ) : null}
        </>
      )}

      {/* 投稿フォーム */}
      {!result && !isLoading && (
        <div className="submit-section">
          <div className="submit-divider" />
          <SubmitForm onResult={handleResult} onLoading={setIsLoading} />
        </div>
      )}
    </main>
  );
}
