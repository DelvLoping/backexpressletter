// Middleware to limit API calls per IP address
const apiCallCount = new Map();
const MAX_API_CALL_LIMIT = 10;

export const limitAPICalls = (req, res, next) => {
  if (process.env.NODE_ENV !== "dev") {
    const ip = req.ip;
    if (!apiCallCount.has(ip)) {
      apiCallCount.set(ip, 0);
    }
    if (apiCallCount.get(ip) >= MAX_API_CALL_LIMIT) {
      return res
        .status(429)
        .json({ error: "API call limit exceeded for this IP address" });
    }
    apiCallCount.set(ip, apiCallCount.get(ip) + 1);
  }

  // Continue to the next middleware or route handler
  next();
};
