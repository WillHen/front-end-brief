// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  // Clean up old entries periodically
  if (Math.random() < 0.1) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) {
        rateLimit.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // First attempt or window expired
    rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    // Rate limit exceeded
    return false;
  }

  // Increment attempt count
  record.count++;
  return true;
}

export function getRateLimitInfo(
  identifier: string
): { remaining: number; resetTime: number } | null {
  const record = rateLimit.get(identifier);
  if (!record || Date.now() > record.resetTime) {
    return { remaining: 5, resetTime: Date.now() + 15 * 60 * 1000 };
  }
  return {
    remaining: Math.max(0, 5 - record.count),
    resetTime: record.resetTime
  };
}
