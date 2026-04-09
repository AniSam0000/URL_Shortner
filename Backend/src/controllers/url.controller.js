import { Url } from "../models/url.model.js";
import { generateShortCode } from "../utils/shortCode.generator.js";
import { connectRedis } from "../config/redis.config.js";

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
    // Checking Redis cache for existing short code
    const cachedShortCode = await connectRedis.get(`shortUrl:${normalizedUrl}`);
    if (cachedShortCode) {
      console.log(`Cache working properly in createShortUrl`);

      return res.status(200).json({
        message: "URL already exists in cache",
        shortCode: cachedShortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/api/url/${cachedShortCode}`,
      });
    }

    // Finding existing URL to prevent duplicates
    const existingUrl = await Url.findOne({
      originalUrl: normalizedUrl,
    }).lean();

    if (existingUrl) {
      console.log("Getting from DB in createShortUrl");
      // 🔥 cache both mappings
      await connectRedis.setEx(
        `shortUrl:${normalizedUrl}`,
        60 * 60,
        existingUrl.shortCode,
      );

      await connectRedis.setEx(
        `redirect:${existingUrl.shortCode}`,
        60 * 60,
        existingUrl.originalUrl,
      );
      // Return existing short code if URL already exists
      return res.status(200).json({
        message: "URL already exists in DB",
        shortCode: existingUrl.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/api/url/${existingUrl.shortCode}`,
      });
    }

    // Generate a unique short code and save the new URL
    const shortCode = generateShortCode();
    const newUrl = new Url({ originalUrl: normalizedUrl, shortCode });
    await newUrl.save();

    // Caching the new short code in Redis
    await connectRedis.setEx(`shortUrl:${normalizedUrl}`, 60 * 60, shortCode);

    await connectRedis.setEx(`redirect:${shortCode}`, 60 * 60, normalizedUrl);

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
    // Checking Redis cache for original URL
    const cachedOriginalUrl = await connectRedis.get(`redirect:${shortCode}`);
    if (cachedOriginalUrl) {
      // Increment click count in Redis
      await connectRedis.incr(`clickCount:${shortCode}`);
      console.log(`Cache working properly in redirectToOriginalUrl`);

      return res.redirect(302, cachedOriginalUrl);
    }
    console.log("🐢 Cache MISS");

    // Checking in Database for the original URL
    const url = await Url.findOne({ shortCode }).lean();

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Caching the original URL in Redis for future requests
    await connectRedis.setEx(
      `redirect:${shortCode}`,
      60 * 60, // 1 hour
      url.originalUrl,
    );

    // Increment click count atomically
    await Url.updateOne({ shortCode }, { $inc: { clickCount: 1 } });
    // Use 302 for temporary redirect
    res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("Error redirecting to original URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
