"use client";

// 縦書き入力欄。iOS Safari 17.4+ / 各モダンブラウザは input の
// writing-mode: vertical-rl をネイティブ対応するため、透明input＋ミラーの旧方式をやめ、
// 実際に編集できる縦書きinputを直接使う（カーソル・タップ・選択・IMEがネイティブで効く）。
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
  return (
    <div className="result-register-input">
      <input
        type="text"
        className="result-register-input__native"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}
