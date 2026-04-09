import { useState } from "react";
import ShortenForm from "./components/ShortenForm";
import ResultCard from "./components/ResultCard";
import AuthForm from "./components/AuthForm";
import { isLoggedIn, loginUser, logoutUser, registerUser } from "./api/authApi";
import { useShortener } from "./hooks/useShortener";
import "./App.css";

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [showAuthPanel, setShowAuthPanel] = useState(false);

  const {
    loading,
    error,
    isRateLimited,
    retryAfterSeconds,
    latestResult,
    history,
    hasHistory,
    shorten,
    clearHistory,
  } = useShortener();

  const handleAuthSubmit = async (payload) => {
    setAuthLoading(true);
    try {
      if (authMode === "register") {
        await registerUser(payload);
      } else {
        await loginUser(payload);
      }
      setAuthenticated(true);
      setShowAuthPanel(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
    } finally {
      setAuthLoading(false);
      setAuthenticated(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="ambient" />
      <main className="app-container">
        <header>
          <p className="eyebrow">Link Toolkit</p>
          <h1>Shorten Long URLs Instantly</h1>
          <p className="subtitle">
            Fast, simple and reliable URL shortening with direct backend
            integration.
          </p>
        </header>

        <div className="auth-toolbar">
          <p className="auth-status">
            {authenticated
              ? "Logged in session active (optional)"
              : "Login/Register is optional"}
          </p>
          <div className="auth-toolbar-actions">
            {!authenticated ? (
              <button
                type="button"
                className="mode-toggle"
                onClick={() => setShowAuthPanel((prev) => !prev)}
              >
                {showAuthPanel ? "Hide Login/Register" : "Login/Register"}
              </button>
            ) : (
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
                disabled={authLoading}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {!authenticated && showAuthPanel ? (
          <AuthForm
            mode={authMode}
            loading={authLoading}
            onSubmit={handleAuthSubmit}
            onToggleMode={() =>
              setAuthMode((prev) => (prev === "login" ? "register" : "login"))
            }
          />
        ) : null}

        <ShortenForm
          loading={loading}
          isRateLimited={isRateLimited}
          retryAfterSeconds={retryAfterSeconds}
          onSubmit={shorten}
        />

        {error ? (
          <p
            className={`error-message request-error ${isRateLimited ? "rate-limit" : ""}`}
          >
            {error}
          </p>
        ) : null}

        {latestResult ? (
          <section>
            <ResultCard
              title="Latest Short URL"
              originalUrl={latestResult.originalUrl}
              shortUrl={latestResult.shortUrl}
              createdAt={latestResult.createdAt}
            />
          </section>
        ) : null}

        <section className="history-section">
          <div className="history-header">
            <h2>Recent Links</h2>
            {hasHistory ? (
              <button
                type="button"
                className="clear-button"
                onClick={clearHistory}
              >
                Clear
              </button>
            ) : null}
          </div>

          {hasHistory ? (
            <div className="history-grid">
              {history.map((item) => (
                <ResultCard
                  key={item.id}
                  title="Saved Link"
                  originalUrl={item.originalUrl}
                  shortUrl={item.shortUrl}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state">No shortened links yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
