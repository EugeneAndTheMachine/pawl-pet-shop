/**
 * Fixed-window rate limiter kept in memory, to protect the Gemini quota from one client.
 * Per backend process only: with several instances, move it to Redis.
 */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  /** Records one hit for the key; returns how many seconds to wait when the limit is exceeded */
  hit(key: string, now = Date.now()): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    if (this.hits.size > 10_000) this.sweep(now)

    const entry = this.hits.get(key)
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs })
      return { allowed: true }
    }
    if (entry.count >= this.limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
    }
    entry.count += 1
    return { allowed: true }
  }

  private sweep(now: number) {
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key)
    }
  }
}
