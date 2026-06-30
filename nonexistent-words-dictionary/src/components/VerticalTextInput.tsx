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
  const composingRef = useRef(false);

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
    if (el && !composingRef.current && el.value !== value) el.value = value;
  }, [value]);

  // iOSの縦書きtextareaは中間削除で再レイアウトされないWebKitバグがある(値は正しいが画面が
  // 更新されない)。縦書きを一瞬だけ内部的に解除→復帰させて text-run を作り直させ強制再描画する。
  // 同一処理内（ペイント前）に元へ戻すので横書きは画面に出ない。カーソル位置は維持する。
  const forceReflow = (el: HTMLTextAreaElement) => {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.style.setProperty("writing-mode", "horizontal-tb");
    el.style.setProperty("-webkit-writing-mode", "horizontal-tb");
    void el.offsetHeight;
    el.style.removeProperty("writing-mode");
    el.style.removeProperty("-webkit-writing-mode");
    void el.offsetHeight;
    try {
      el.setSelectionRange(start, end);
    } catch {
      /* 無視 */
    }
  };

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
      onChange={(e) => {
        onChange(e.target.value);
        // 変換中は触らない（IMEを乱さない）。確定後の入力・削除でのみ強制再描画。
        if (!composingRef.current) forceReflow(e.currentTarget);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        onChange(e.currentTarget.value);
        forceReflow(e.currentTarget);
      }}
      placeholder={placeholder}
      aria-label={ariaLbl}
      maxLength={maxLength}
      rows={1}
      enterKeyHint={isSearch ? "search" : "done"}
    />
  );
}
