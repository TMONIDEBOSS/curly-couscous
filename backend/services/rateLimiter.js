const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30-day rolling window
const FREE_MONTHLY_LIMIT = Number(process.env.FREE_MONTHLY_SCAN_LIMIT) || 3;

// In-memory only: resets when the server restarts, and is per-IP rather
// than per-account since there's no auth system yet. Good enough for an
// MVP; swap for a real store (Redis, or a DB column on a user account)
// once accounts exist — a 30-day in-memory window also just means a
// restart quietly resets everyone's quota, which a real store would fix.
//
// This is a rolling 30-day window per key (counted from that key's first
// scan), not a calendar-month reset on the 1st. If you'd rather everyone
// reset on the 1st of the month, this is the file to change.
const hits = new Map();

/**
 * Checks and records a request against the free-tier monthly scan limit
 * for the given key (typically the requester's IP). Returns whether the
 * request is allowed, and when the limit resets.
 */
export function checkRateLimit(key) {
  const now = Date.now();
  const record = hits.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + WINDOW_MS;
    hits.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: FREE_MONTHLY_LIMIT - 1, resetAt };
  }

  if (record.count >= FREE_MONTHLY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: FREE_MONTHLY_LIMIT - record.count, resetAt: record.resetAt };
}

export { FREE_MONTHLY_LIMIT };
