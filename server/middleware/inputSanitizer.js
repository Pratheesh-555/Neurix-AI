// Blocks prompt-injection attempts, XSS fragments, and path-traversal patterns
// applied globally in app.js before every route handler

const PATTERNS = [
  /ignore previous instructions/i,
  /jailbreak/i,
  /pretend you are/i,
  /you are now/i,
  /forget everything/i,
  /act as(?! a therapist)/i,
  /<script>/i,
  /\.\.\//,
];

module.exports = (req, res, next) => {
  const body = JSON.stringify(req.body || {});
  for (const pattern of PATTERNS) {
    if (pattern.test(body)) {
      return res.status(400).json({ error: 'Invalid input', code: 'INJECTION_BLOCKED' });
    }
  }
  next();
};
