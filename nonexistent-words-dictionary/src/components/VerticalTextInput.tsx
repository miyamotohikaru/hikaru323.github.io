"use client";

// 縦書き(vertical-rl)入力欄。
// - PC(マウス): 実カーソルが見える縦書きinputを直接編集（枠付きUI）。クリック/矢印はネイティブ。
// - タッチ端末(iOS): 縦書きinputへ直接入力するとIME崩れや削除未反映が起きるため、透明input
//   ＋縦書きミラー方式を維持。実カーソルが見えない問題は点滅バーで補い、さらにiOSは
//   「縦書きタップで途中にカーソルを置けない」ため、ミラーの各文字位置を実測して
//   タップ座標→文字インデックスに変換し input.setSelectionRange でカーソルを移す。
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
// 結合マークが孤立して表示崩れするため、描画上の分割位置を直前の境界へ寄せる。
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
  const [composing, setComposing] = useState(false);
  const [caret, setCaret] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const composingRef = useRef(false);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const syncCaret = (el: HTMLInputElement | null) => {
    if (!el || composingRef.current) return;
    const end = el.selectionEnd ?? el.value.length;
    const pos = el.selectionDirection === "backward" ? el.selectionStart ?? end : end;
    setCaret(Math.max(0, Math.min(pos, el.value.length)));
  };

  // タップ縦位置から挿入インデックスを実測（縦書きは文字が上→下に積まれる）。
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

  // タッチ端末のみ: タップ位置に応じて実カーソルを移す（iOSの縦書きタップ制限を回避）
  const handlePointer = (el: HTMLInputElement, clientY: number) => {
    if (isDesktop || composingRef.current || value.length === 0) return;
    const idx = indexFromPoint(clientY);
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(idx, idx);
      } catch {
        /* 非対応時は無視 */
      }
      setCaret(idx);
    });
  };

  // 点滅バーはミラー方式(タッチ)のときだけ。PCは実inputの実カーソルが見える。
  const showCaret = focused && !composing && !isDesktop;
  const safeCaret = snapBoundary(value, Math.max(0, Math.min(caret, value.length)));

  const mirrorNodes: React.ReactNode[] = [];
  if (value.length === 0) {
    if (showCaret) mirrorNodes.push(<span key="caret" className="result-register-caret" aria-hidden="true" />);
    mirrorNodes.push(placeholder || "");
  } else {
    for (let i = 0; i < value.length; i++) {
      if (showCaret && i === safeCaret) {
        mirrorNodes.push(<span key="caret" className="result-register-caret" aria-hidden="true" />);
      }
      mirrorNodes.push(
        <span
          key={`c${i}`}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          className="result-register-char"
        >
          {value[i]}
        </span>
      );
    }
    if (showCaret && safeCaret >= value.length) {
      mirrorNodes.push(<span key="caret" className="result-register-caret" aria-hidden="true" />);
    }
  }

  return (
    <div className={`result-register-input${isDesktop ? " is-desktop" : ""}`}>
      <div
        className={`result-register-input__display ${value ? "" : "is-placeholder"}`}
        aria-hidden="true"
      >
        {mirrorNodes}
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
        onPointerDown={(e) => handlePointer(e.currentTarget, e.clientY)}
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
