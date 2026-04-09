import { useState } from "react";

const initialRegister = { name: "", email: "", password: "" };
const initialLogin = { email: "", password: "" };

export default function AuthForm({ mode, loading, onSubmit, onToggleMode }) {
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const handleChange = (key, value) => {
    if (isRegister) {
      setRegisterForm((prev) => ({ ...prev, [key]: value }));
      return;
    }
    setLoginForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = isRegister ? registerForm : loginForm;

    if (isRegister && !payload.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!payload.email.trim() || !payload.password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      await onSubmit({
        ...(isRegister ? { name: payload.name.trim() } : {}),
        email: payload.email.trim(),
        password: payload.password,
      });
      setRegisterForm(initialRegister);
      setLoginForm(initialLogin);
    } catch (submitError) {
      setError(submitError.message || "Authentication failed");
    }
  };

  return (
    <section className="auth-card">
      <h2>{isRegister ? "Create Account" : "Login"}</h2>
      <p className="subtitle">
        {isRegister
          ? "Register to create and manage your short links."
          : "Login with your credentials to continue."}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister ? (
          <input
            type="text"
            placeholder="Name"
            value={registerForm.name}
            onChange={(event) => handleChange("name", event.target.value)}
            autoComplete="name"
            disabled={loading}
          />
        ) : null}

        <input
          type="email"
          placeholder="Email"
          value={isRegister ? registerForm.email : loginForm.email}
          onChange={(event) => handleChange("email", event.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={isRegister ? registerForm.password : loginForm.password}
          onChange={(event) => handleChange("password", event.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        {error ? <p className="error-message request-error">{error}</p> : null}
      </form>

      <button type="button" className="mode-toggle" onClick={onToggleMode}>
        {isRegister
          ? "Already have an account? Login"
          : "New here? Create an account"}
      </button>
    </section>
  );
}
