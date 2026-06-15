import { useState } from "react";

const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const normalizeForValidation = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const result = new URL(candidate).toString();
    if (!urlRegex.test(result)) return null;
    return result;
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

  const handleChange = (value) => {
    setUrlInput(value);
    if (validationError) setValidationError("");
  };

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
      <div className={`field-row${validationError ? " field-row--error" : ""}`}>
        <div className="field-input-wrap">
          <input
            id="urlInput"
            type="text"
            value={urlInput}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="https://your-very-long-link.com/path"
            autoComplete="off"
            disabled={isDisabled}
            className={validationError ? "input--error" : ""}
          />
          {validationError ? (
            <p className="field-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {validationError}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={isDisabled}>
          {buttonText}
        </button>
      </div>
    </form>
  );
}
