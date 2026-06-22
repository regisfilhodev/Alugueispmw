// ✅ Simple rate limiting using in-memory store
// For production, use Upstash Redis: npm install @upstash/ratelimit @upstash/redis

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number  // in milliseconds
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; retryAfter?: number }> {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Reset window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
    }
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      retryAfter,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
  }
}

// Rate limit configurations
export const loginLimiter = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,  // 15 minutes
}

export const uploadLimiter = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,  // 1 hour
}

export const signupLimiter = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,  // 1 hour
}
