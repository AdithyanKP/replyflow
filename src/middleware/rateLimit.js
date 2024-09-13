import client from "../redisClient.js";

export const rateLimiter = (maxRequests, timeWindow) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    const key = `rate-limit:${userId}`;

    try {
      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, timeWindow);
      }

      if (current > maxRequests) {
        return res.status(429).send("Too Many Requests");
      }

      next();
    } catch (err) {
      console.error("Redis error:", err);
      res.status(500).send("Internal Server Error");
    }
  };
};
