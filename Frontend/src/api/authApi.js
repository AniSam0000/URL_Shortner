import {
  clearAuthToken,
  getAuthToken,
  httpRequest,
  setAuthToken,
} from "./httpClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function registerUser(payload) {
  const response = await httpRequest(`${API_BASE_URL}/user/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response?.token) {
    setAuthToken(response.token);
  }

  return response;
}

export async function loginUser(payload) {
  const response = await httpRequest(`${API_BASE_URL}/user/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response?.token) {
    setAuthToken(response.token);
  }

  return response;
}

export async function logoutUser() {
  await httpRequest(`${API_BASE_URL}/user/logout`, {
    method: "POST",
    auth: true,
  });
  clearAuthToken();
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}
