import { useMemo, useState, useEffect } from "react";
import { createShortUrl } from "../api/urlApi";

const STORAGE_KEY = "shortened_urls_history";

const readHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function useShortener() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [latestResult, setLatestResult] = useState(null);
  const [history, setHistory] = useState(readHistory);

  const hasHistory = useMemo(() => history.length > 0, [history]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (!isRateLimited || retryAfterSeconds <= 0) return;

    const timer = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev <= 1) {
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRateLimited, retryAfterSeconds]);

  const persistHistory = (nextHistory) => {
    setHistory(nextHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  };

  const shorten = async (inputUrl) => {
    setLoading(true);
    setError("");

    try {
      const result = await createShortUrl(inputUrl);
      const entry = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        originalUrl: inputUrl,
        shortCode: result.shortCode,
        shortUrl: result.shortUrl,
      };

      setLatestResult(entry);
      persistHistory([entry, ...history].slice(0, 10));
    } catch (requestError) {
      // Check if it's a rate limit error
      if (requestError.name === "RateLimitError") {
        const seconds = parseInt(requestError.retryAfter || 60, 10);
        setIsRateLimited(true);
        setRetryAfterSeconds(seconds);
        setError(requestError.message);
      } else {
        setError(requestError.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setLatestResult(null);
    persistHistory([]);
  };

  return {
    loading,
    error,
    isRateLimited,
    retryAfterSeconds,
    latestResult,
    history,
    hasHistory,
    shorten,
    clearHistory,
  };
}
