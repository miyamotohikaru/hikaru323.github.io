"use client";

// 縦書き入力欄（登録フォームの読み/ニックネーム と TOP検索で共用）。
// iOS Safari 17.4+/モダンブラウザは input/textarea の writing-mode: vertical-rl を
// ネイティブ対応する。実際に“見える”ネイティブ入力にすることで、変換中の青背景表示・
// スペースキー長押しでのカーソル移動・削除・タップ位置決めがすべてOS標準で効く。
// - PC(マウス): 単一行 <input>（完璧）。
// - タッチ端末: <textarea>（縦書きのタップ位置決め・トラックパッド移動が効く）。
//   非制御(defaultValue)にして、Reactの再描画でカーソルが末尾に飛ぶのを防ぎ、
//   削除が一文字ずつ効くようにする（外部からの値変更時のみ手動で同期）。
import { useState, useEffect, useRef } from "react";

interface VerticalTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
  variant?: "register" | "search";
  onEnter?: () => void;
}

export default function VerticalTextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  ariaLabel,
  variant = "register",
  onEnter,
}: VerticalTextInputProps) {
  const [isTouch, setIsTouch] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 外部からvalueが変わった時だけtextareaへ反映（通常のキー入力ではカーソルを動かさない）。
  useEffect(() => {
    const el = taRef.current;
    if (el && el.value !== value) el.value = value;
  }, [value]);

  const ariaLbl = ariaLabel ?? placeholder;
  const isSearch = variant === "search";
  const cls = isSearch ? "tategaki-search-input" : "result-register-input__native";
  const wrap = (children: React.ReactNode) =>
    isSearch ? <>{children}</> : <div className="result-register-input">{children}</div>;

  // ===== PC: ネイティブ縦書きinput =====
  if (!isTouch) {
    return wrap(
      <input
        type="text"
        className={cls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLbl}
        maxLength={maxLength}
      />
    );
  }

  // ===== 携帯: ネイティブ縦書きtextarea（非制御） =====
  return wrap(
    <textarea
      ref={taRef}
      className={cls}
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
      placeholder={placeholder}
      aria-label={ariaLbl}
      maxLength={maxLength}
      rows={1}
      enterKeyHint={isSearch ? "search" : "done"}
    />
  );
}
