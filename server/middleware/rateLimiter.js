const rateLimit = require('express-rate-limit');

// Applied per-route on program generation — 10 programs / BCBA / hour
const programGenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { error: 'Rate limit exceeded. Max 10 programs per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints — 20 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { programGenLimiter, authLimiter };
