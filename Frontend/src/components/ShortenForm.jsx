import { useState } from "react";

const normalizeForValidation = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(candidate).toString();
  } catch {
    return null;
  }
};

export default function ShortenForm({
  loading,
  isRateLimited,
  retryAfterSeconds,
  onSubmit,
}) {
  const [urlInput, setUrlInput] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = normalizeForValidation(urlInput);

    if (!normalized) {
      setValidationError(
        "Enter a valid URL like example.com or https://example.com",
      );
      return;
    }

    setValidationError("");
    onSubmit(normalized);
  };

  const isDisabled = loading || isRateLimited;
  const buttonText = isRateLimited
    ? `Retry in ${retryAfterSeconds}s`
    : loading
      ? "Shortening..."
      : "Shorten";

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <label htmlFor="urlInput">Paste your long URL</label>
      <div className="field-row">
        <input
          id="urlInput"
          type="text"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          placeholder="https://your-very-long-link.com/path"
          autoComplete="off"
          disabled={isDisabled}
        />
        <button type="submit" disabled={isDisabled}>
          {buttonText}
        </button>
      </div>
      {validationError ? (
        <p className="error-message">{validationError}</p>
      ) : null}
    </form>
  );
}
