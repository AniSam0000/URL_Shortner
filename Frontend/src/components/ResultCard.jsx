import { useState } from "react";

export default function ResultCard({
  title,
  originalUrl,
  shortUrl,
  createdAt,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <article className="result-card">
      <p className="result-title">{title}</p>
      <a
        href={originalUrl}
        target="_blank"
        rel="noreferrer"
        className="original-link"
      >
        {originalUrl}
      </a>
      <div className="short-url-row">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="short-link"
        >
          {shortUrl}
        </a>
        <button type="button" className="copy-button" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="meta-time">{new Date(createdAt).toLocaleString()}</p>
    </article>
  );
}
