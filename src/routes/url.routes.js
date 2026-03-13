import express from "express";
import {
  createShortUrl,
  redirectToOriginalUrl,
} from "../controllers/url.controller.js";
import { createShortUrlLimiter, redirectLimiter } from "../utils/rateLimit.js";

const router = express.Router();

// Create a new short URL
router.post("/shorten", createShortUrlLimiter, createShortUrl);
// Redirect to the original URL
router.get("/:shortCode", redirectLimiter, redirectToOriginalUrl);

export default router;
