import { httpRequest } from "./httpClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/url";

export async function createShortUrl(originalUrl) {
  return httpRequest(`${API_BASE_URL}/shorten`, {
    method: "POST",
    body: JSON.stringify({ originalUrl }),
  });
}
