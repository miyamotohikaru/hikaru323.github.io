"use client";

// あそびかたモーダル。Hud の ❓ ボタンから開閉する。

import "./ui.css";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  "月の あなを えらんで けんを刺す",
  "あたりは 1000このうち 1つだけ",
  "あてたら こすくまくんが 宇宙へ飛んで なまえが 永久にトロフィーへ",
] as const;

export default function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="あそびかた"
      onClick={(e) => {
        // 背景タップでも閉じられる
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card help-card">
        <h2 className="modal-title">あそびかた</h2>
        <ol className="help-steps">
          {STEPS.map((step, i) => (
            <li key={i} className="help-step">
              <span className="help-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="help-cooldown">⏱️ 1分に1回だけ 刺せるよ</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}
