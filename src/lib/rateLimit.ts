// src/lib/rateLimit.ts
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

/**
 * Fixed-window rate limit sederhana (in-memory).
 * @returns { allowed, remaining, retryAfterSec }
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = store.get(key);

  if (!b || now > b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { allowed: true, remaining: limit - b.count, retryAfterSec: 0 };
}
