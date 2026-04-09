import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { connectRedis } from "../config/redis.config.js";

console.log("Redis status:", connectRedis.isOpen);

const createShortUrlStore = new RedisStore({
  sendCommand: (command, ...args) =>
    connectRedis.sendCommand([command, ...args]),
  prefix: "shortUrl:",
});

const redirectUrlStore = new RedisStore({
  sendCommand: (command, ...args) =>
    connectRedis.sendCommand([command, ...args]),
  prefix: "redirectUrl:",
});

export const createShortUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  keyGenerator: (req) => {
    const userId = req.user?._id;
    return userId
      ? `createShortUrl:user:${userId}`
      : `createShortUrl:ip:${ipKeyGenerator(req)}`;
  }, // Use a custom key generator to differentiate between different endpoints

  store: createShortUrlStore,
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour",
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  keyGenerator: (req) => {
    const userId = req.user?._id;
    return userId
      ? `redirect:user:${userId}`
      : `redirect:ip:${ipKeyGenerator(req)}`;
  }, // Use a custom key generator to differentiate between different endpoints

  store: redirectUrlStore,
});
