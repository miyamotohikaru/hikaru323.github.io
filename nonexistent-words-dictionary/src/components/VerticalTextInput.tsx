"use client";

// 縦書き入力欄（登録フォームの読み/ニックネーム と TOP検索で共用）。
// - PC(マウス): ネイティブの縦書きinputが完璧に動くのでそのまま使う。
// - タッチ端末(iOS): 縦書きtextareaは削除が表示に反映されない等のバグがあるため、
//   実際の編集は「透明な“横書き”input」で受け（削除・IME・挿入がネイティブで確実）、
//   見た目は縦書きミラーに映す。カーソルは自前のバー(.rri-caret)で表示し、
//   タップ位置→文字インデックスを実測して input.setSelectionRange でカーソルを移す。
import { useState, useEffect, useRef } from "react";

interface VerticalTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
  // "register"=登録欄(枠付きボックス) / "search"=TOP検索(親の縦長枠に直接入れる)
  variant?: "register" | "search";
}

export default function VerticalTextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  ariaLabel,
  variant = "register",
}: VerticalTextInputProps) {
  const [isTouch, setIsTouch] = useState(false);
  const [focused, setFocused] = useState(false);
  const [composing, setComposing] = useState(false);
  const [caret, setCaret] = useState(0);
  const composingRef = useRef(false);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const ariaLbl = ariaLabel ?? placeholder;
  const isSearch = variant === "search";
  // 検索は親(.tategaki-search-field)が枠なので自前のboxを付けない。登録は枠付きbox。
  const wrap = (children: React.ReactNode) =>
    isSearch ? <>{children}</> : <div className="result-register-input">{children}</div>;

  // ===== PC: ネイティブ縦書きinput（完璧なのでそのまま） =====
  if (!isTouch) {
    return wrap(
      <input
        type="text"
        className={isSearch ? "tategaki-search-input" : "result-register-input__native"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLbl}
        maxLength={maxLength}
      />
    );
  }

  // ===== 携帯: 透明横書きinput + 縦書きミラー + カスタムカーソルバー =====
  const syncCaret = (el: HTMLInputElement | null) => {
    if (!el || composingRef.current) return;
    const end = el.selectionEnd ?? el.value.length;
    const pos = el.selectionDirection === "backward" ? el.selectionStart ?? end : end;
    setCaret(Math.max(0, Math.min(pos, el.value.length)));
  };

  const indexFromPoint = (clientY: number): number => {
    const spans = charRefs.current.slice(0, value.length);
    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      if (!s) continue;
      const r = s.getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return i;
    }
    return value.length;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (composingRef.current) return;
    const idx = indexFromPoint(e.clientY);
    const el = inputRef.current;
    // ネイティブのフォーカス/キャレット設定後に上書きするため次フレームで実行
    requestAnimationFrame(() => {
      if (el) {
        try {
          el.setSelectionRange(idx, idx);
        } catch {
          /* 無視 */
        }
      }
      setCaret(idx);
    });
  };

  const showCaret = focused && !composing;
  const safeCaret = Math.max(0, Math.min(caret, value.length));
  const caretBar = (key: string) => <span key={key} className="rri-caret" aria-hidden="true" />;

  const mirror: React.ReactNode[] = [];
  if (value.length === 0) {
    if (showCaret) mirror.push(caretBar("caret"));
    mirror.push(
      <span key="ph" className="rri-ph">
        {placeholder || ""}
      </span>
    );
  } else {
    for (let i = 0; i < value.length; i++) {
      if (showCaret && i === safeCaret) mirror.push(caretBar("caret"));
      mirror.push(
        <span
          key={`ch${i}`}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          className="rri-char"
        >
          {value[i]}
        </span>
      );
    }
    if (showCaret && safeCaret >= value.length) mirror.push(caretBar("caret"));
  }

  return wrap(
    <>
      <div className={`rri-mirror${isSearch ? " rri-mirror--search" : ""}`} aria-hidden="true">
        {mirror}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="rri-hidden"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          syncCaret(e.target);
        }}
        onSelect={(e) => syncCaret(e.currentTarget)}
        onKeyUp={(e) => syncCaret(e.currentTarget)}
        onPointerDown={handlePointerDown}
        onFocus={(e) => {
          setFocused(true);
          syncCaret(e.currentTarget);
        }}
        onBlur={() => setFocused(false)}
        onCompositionStart={() => {
          composingRef.current = true;
          setComposing(true);
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          setComposing(false);
          syncCaret(e.currentTarget);
        }}
        aria-label={ariaLbl}
        maxLength={maxLength}
      />
    </>
  );
}
