import rateLimit from "express-rate-limit";

export const createShortUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour",
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});
