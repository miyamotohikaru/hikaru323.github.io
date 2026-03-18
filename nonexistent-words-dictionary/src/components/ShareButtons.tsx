"use client";

interface ShareButtonsProps {
  word: string;
  url: string;
}

export default function ShareButtons({ word, url }: ShareButtonsProps) {
  const tweetText = encodeURIComponent(`「${word}」── 存在しない言葉辞典より`);
  const encodedUrl = encodeURIComponent(url);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;

  return (
    <div className="share-buttons">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button share-twitter"
      >
        X / Twitter
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button share-line"
      >
        LINE
      </a>
    </div>
  );
}
