"use client";

import { useState } from "react";

interface ReportButtonProps {
  wordId: string;
}

export default function ReportButton({ wordId }: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitError, setSubmitError] = useState(false);

  const handleReport = async () => {
    setSubmitError(false);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, reason: reason.trim() }),
      });
      if (res.ok) {
        setReported(true);
        setShowForm(false);
        setReason("");
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    }
  };

  if (reported) {
    return <p className="report-done">通報を受け付けました。ご協力ありがとうございます。</p>;
  }

  return (
    <div className="report-container">
      {!showForm ? (
        <button className="report-link" onClick={() => setShowForm(true)}>
          不適切な投稿を報告
        </button>
      ) : (
        <div className="report-form fade-in">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="理由（任意）"
            className="report-textarea"
            rows={2}
            maxLength={200}
          />
          <div className="report-actions">
            <button className="report-submit" onClick={handleReport}>
              送信
            </button>
            <button className="report-cancel" onClick={() => { setShowForm(false); setReason(""); setSubmitError(false); }}>
              キャンセル
            </button>
          </div>
          {submitError && <p style={{ fontSize: "11px", color: "var(--accent)", marginTop: "4px" }}>送信に失敗しました。</p>}
        </div>
      )}
    </div>
  );
}
