import { rateLimit } from "express-rate-limit";

// Rate limiter: Max 5 comments per minute

export const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per `window` (here, per minute)
  message:
    "Too many comments created from this IP, please try again after a minute",
});
