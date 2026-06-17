export function EmptyWordNotice({ isEn = false }: { isEn?: boolean }) {
  if (isEn) {
    return (
      <div className="empty-word-notice">
        <span className="notice-line-1">This word</span>
        <span className="notice-line-2">doesn&apos;t exist.</span>
        <span className="notice-divider">──</span>
        <span className="notice-line-3">You can add it to</span>
        <span className="notice-line-3">the Fictionary.</span>
      </div>
    );
  }
  return (
    <div className="empty-word-notice">
      <span className="notice-line-1">この言葉は</span>
      <span className="notice-line-2">実在しません。</span>
      <span className="notice-divider">──</span>
      <span className="notice-line-3">存在しない言葉辞典に</span>
      <span className="notice-line-3">掲載できます。</span>
    </div>
  );
}
