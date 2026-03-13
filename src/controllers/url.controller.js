import { Url } from "../models/url.model.js";
import { generateShortCode } from "../utils/shortCode.generator.js";

const normalizeUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  let input = value.trim();
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;

  try {
    const url = new URL(input);
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return null;
  }
};

export const createShortUrl = async (req, res) => {
  const { originalUrl } = req.body;

  const normalizedUrl = normalizeUrl(originalUrl);
  if (!normalizedUrl) {
    return res.status(400).json({ message: "Invalid original URL" });
  }

  try {
    const existingUrl = await Url.findOne({
      originalUrl: normalizedUrl,
    }).lean();
    if (existingUrl) {
      return res.status(200).json({
        message: "URL already exists",
        shortCode: existingUrl.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/api/url/${existingUrl.shortCode}`,
      });
    }
    // Generate a unique short code and save the new URL
    const shortCode = generateShortCode();
    const newUrl = new Url({ originalUrl: normalizedUrl, shortCode });
    await newUrl.save();
    // Return the short URL to the client
    const shortUrl = `${req.protocol}://${req.get("host")}/api/url/${shortCode}`;
    res.status(201).json({ shortCode, shortUrl });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const redirectToOriginalUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode }).lean();

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Increment click count atomically
    await Url.updateOne({ shortCode }, { $inc: { clickCount: 1 } });
    // Use 302 for temporary redirect
    res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("Error redirecting to original URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
