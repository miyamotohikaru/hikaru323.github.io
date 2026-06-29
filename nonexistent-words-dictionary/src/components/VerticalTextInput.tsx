"use client";

// 縦書き(vertical-rl)入力欄。iOS Safariでは縦書きinputに直接入力すると
// IME変換中や1文字削除が表示に反映されないバグがあるため、
// 実際の入力は透明な横書きinputで受け、その値を縦書きのdivに映して見せる。
//
// 加えて、透明inputは実カーソルが見えず「今どこを編集しているか」「戻って直す」が
// しづらいので、selectionStart を追跡してミラー上の実際の位置に点滅バー(横バー)を出す。
import { useState, useRef, useEffect } from "react";

interface VerticalTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
}

// 結合文字（結合ダイアクリティカル U+0300-036F・分解濁点 U+3099/309A・
// 異体字セレクタ U+FE00-FE0F・ZWJ U+200D）の手前でキャレットを割り込ませると
// 結合マークが孤立して表示崩れするため、描画上の分割位置を直前の境界へ寄せる
// （実際の入力選択には影響しない、表示のみの補正）。
function isCombining(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return (
    (c >= 0x0300 && c <= 0x036f) ||
    c === 0x3099 ||
    c === 0x309a ||
    (c >= 0xfe00 && c <= 0xfe0f) ||
    c === 0x200d
  );
}
function snapBoundary(value: string, pos: number): number {
  let p = pos;
  while (p > 0 && p < value.length && isCombining(value[p])) p--;
  return p;
}

export default function VerticalTextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  ariaLabel,
}: VerticalTextInputProps) {
  const [focused, setFocused] = useState(false);
  // IME変換中はミラーに未確定文字列が伸びる一方カーソル位置が暴れるので、
  // 変換中はバーを隠す（render用state）＋位置追跡を止める（同期判定用ref）。
  const [composing, setComposing] = useState(false);
  const [caret, setCaret] = useState(0);
  // PC(マウス)では実カーソルが見える縦書きinputを直接使う。タッチ端末はミラー方式を維持。
  const [isDesktop, setIsDesktop] = useState(false);
  const composingRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const syncCaret = (el: HTMLInputElement | null) => {
    if (!el || composingRef.current) return;
    // 範囲選択中は可動端(focus端)にバーを出す
    const end = el.selectionEnd ?? el.value.length;
    const pos = el.selectionDirection === "backward" ? el.selectionStart ?? end : end;
    setCaret(Math.max(0, Math.min(pos, el.value.length)));
  };

  // 点滅バーはミラー方式(タッチ)のときだけ。PCは実inputの実カーソルが見えるので不要。
  const showCaret = focused && !composing && !isDesktop;
  const safeCaret = snapBoundary(value, Math.max(0, Math.min(caret, value.length)));
  const head = value.slice(0, safeCaret);
  const tail = value.slice(safeCaret);

  return (
    <div className={`result-register-input${isDesktop ? " is-desktop" : ""}`}>
      <div
        className={`result-register-input__display ${value ? "" : "is-placeholder"}`}
        aria-hidden="true"
      >
        {value ? (
          showCaret ? (
            <>
              {head}
              <span className="result-register-caret" aria-hidden="true" />
              {tail}
            </>
          ) : (
            value
          )
        ) : showCaret ? (
          <>
            <span className="result-register-caret" aria-hidden="true" />
            {placeholder || ""}
          </>
        ) : (
          placeholder || ""
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          syncCaret(e.target);
        }}
        onSelect={(e) => syncCaret(e.currentTarget)}
        onKeyUp={(e) => syncCaret(e.currentTarget)}
        onClick={(e) => syncCaret(e.currentTarget)}
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
        aria-label={ariaLabel ?? placeholder}
        placeholder={isDesktop ? placeholder : undefined}
        maxLength={maxLength}
        className="result-register-input__field"
      />
    </div>
  );
}
