"use client";

// 縦書き入力欄。iOS Safari 17.4+ は input/textarea の writing-mode: vertical-rl を
// ネイティブ対応する。
// - PC(マウス): 単一行 <input> が完璧に動く（カーソル/タップ/矢印/IME）。
// - タッチ端末(iOS): 単一行 <input> は縦書きだとタップで途中にカーソルを置けないため、
//   タップ位置決めが確実な複数行編集コントロール <textarea> を使う（改行は抑止して実質単一行）。
import { useState, useEffect } from "react";

interface VerticalTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
}

export default function VerticalTextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  ariaLabel,
}: VerticalTextInputProps) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const ariaLbl = ariaLabel ?? placeholder;

  return (
    <div className="result-register-input">
      {isTouch ? (
        <textarea
          className="result-register-input__native"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\n/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder={placeholder}
          aria-label={ariaLbl}
          maxLength={maxLength}
          rows={1}
        />
      ) : (
        <input
          type="text"
          className="result-register-input__native"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLbl}
          maxLength={maxLength}
        />
      )}
    </div>
  );
}
