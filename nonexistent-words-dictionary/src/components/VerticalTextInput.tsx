"use client";

// 縦書き(vertical-rl)入力欄。iOS Safariでは縦書きinputに直接入力すると
// IME変換中や1文字削除が表示に反映されないバグがあるため、
// 実際の入力は透明な横書きinputで受け、その値を縦書きのdivに映して見せる。
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
      <div
        className={`result-register-input__display ${value ? "" : "is-placeholder"}`}
        aria-hidden="true"
      >
        {value || placeholder || ""}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        maxLength={maxLength}
        className="result-register-input__field"
      />
    </div>
  );
}
