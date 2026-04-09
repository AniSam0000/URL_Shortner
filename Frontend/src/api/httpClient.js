const DEFAULT_TIMEOUT_MS = 10000;
const TOKEN_STORAGE_KEY = "auth_token";

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const setAuthToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};
export const clearAuthToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class RateLimitError extends Error {
  constructor(message, retryAfter, remaining) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.remaining = remaining;
  }
}

const getErrorMessage = async (response) => {
  // Handle rate limit (429) with special error
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const remaining = response.headers.get("RateLimit-Remaining");
    const resetTime = response.headers.get("RateLimit-Reset");

    let message = "Rate limit exceeded. ";
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      const minutes = Math.ceil(seconds / 60);
      message += `Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`;
    } else {
      message += "Please try again later.";
    }

    throw new RateLimitError(message, retryAfter, remaining);
  }

  try {
    const payload = await response.json();
    return (
      payload.message ||
      payload.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export async function httpRequest(path, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    headers = {},
    auth = false,
    ...rest
  } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const token = getAuthToken();

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth && token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(path, {
      ...rest,
      credentials: "include",
      headers: finalHeaders,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new ApiError(message, response.status);
    }

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
