import express from "express";
import { createShortUrlLimiter, redirectLimiter } from "../utils/rateLimit.js";
import {
  createShortUrl,
  redirectToOriginalUrl,
} from "../controllers/url.controller.js";

const router = express.Router();

// Create a new short URL
router.post("/shorten", createShortUrlLimiter, createShortUrl);
// Redirect to the original URL
router.get("/:shortCode", redirectLimiter, redirectToOriginalUrl);

export default router;
