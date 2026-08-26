/**
 * 和文を、読みやすいところで折る。
 *
 * ブラウザの自動折り返しに任せると、行末が「…しまし／た。」のように
 * 語の途中で割れて読みにくい。句点で区切って1行ずつ出す。
 * 長い文は読点でも折る（1行が長すぎると視線が戻れなくなるため）。
 */
export default function Jp({
  text,
  className,
  max = 34,
}: {
  text: string;
  className?: string;
  /** 1行の目安。これを超える文は読点でも折る */
  max?: number;
}) {
  const lines: string[] = [];

  for (const sentence of text.split(/(?<=。)/).filter(Boolean)) {
    if (sentence.length <= max) {
      lines.push(sentence);
      continue;
    }
    // 長い文は読点で刻む。刻んだ断片が短すぎるときは前にくっつける
    let buf = "";
    for (const chunk of sentence.split(/(?<=、)/)) {
      if (buf && (buf + chunk).length > max) {
        lines.push(buf);
        buf = chunk;
      } else {
        buf += chunk;
      }
    }
    if (buf) lines.push(buf);
  }

  return (
    <p className={className}>
      {lines.map((l, i) => (
        <span key={i} className="jp-l">
          {l}
        </span>
      ))}
    </p>
  );
}
