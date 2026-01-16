/**
 * Rate Limiting Library
 *
 * Provides protection against:
 * - DDoS attacks
 * - Brute-force authentication attempts
 * - API abuse and excessive resource consumption
 *
 * Implementation: Sliding window algorithm with in-memory storage
 *
 * Production upgrade path: Replace in-memory Map with Upstash Redis for:
 * - Distributed rate limiting across multiple instances
 * - Persistence across server restarts
 * - Lower memory usage
 * - Horizontal scalability
 */

import { headers } from "next/headers";

// Rate limit tiers with requests and window duration
export const RATE_LIMITS = {
  CRITICAL: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes (auth endpoints)
  SENSITIVE: { requests: 10, window: 15 * 60 * 1000 }, // 10 requests per 15 minutes (password reset, account actions)
  WRITE: { requests: 20, window: 15 * 60 * 1000 }, // 20 requests per 15 minutes (POST/PUT/DELETE)
  READ: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes (GET)
  PUBLIC: { requests: 200, window: 15 * 60 * 1000 }, // 200 requests per 15 minutes (no auth needed)
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

// In-memory storage for request timestamps
// Key format: `${tier}:${identifier}` (e.g., "CRITICAL:192.168.1.1" or "WRITE:user-123")
const requestStore = new Map<string, number[]>();

// Cleanup interval: remove expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Start periodic cleanup of expired entries
 * Prevents memory growth from abandoned rate limit keys
 */
function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, timestamps] of requestStore.entries()) {
      // Remove timestamps older than 1 hour (max window is 15 min, give 4x buffer)
      const filtered = timestamps.filter((ts) => now - ts < 60 * 60 * 1000);

      if (filtered.length === 0) {
        // No recent requests - remove key entirely
        requestStore.delete(key);
        cleanedCount++;
      } else if (filtered.length < timestamps.length) {
        // Some timestamps expired - update array
        requestStore.set(key, filtered);
      }
    }

    if (cleanedCount > 0) {
      console.log(`[RateLimiter] Cleaned ${cleanedCount} expired entries`);
    }
  }, CLEANUP_INTERVAL);
}

// Start cleanup timer on module load
startCleanup();

/**
 * Get rate limiter identifier for the current request
 *
 * Priority:
 * 1. User ID (if authenticated)
 * 2. IP address (from headers)
 * 3. "unknown" (fallback)
 */
export async function getRateLimitIdentifier(userId?: string): Promise<string> {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers (supports Vercel/Cloudflare proxies)
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";

  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 *
 * Uses sliding window algorithm:
 * - Maintains array of request timestamps
 * - Filters out timestamps outside current window
 * - Compares count against limit
 *
 * @param tier - Rate limit tier (CRITICAL, SENSITIVE, WRITE, READ, PUBLIC)
 * @param identifier - Unique identifier for rate limiting (user ID or IP)
 * @returns Object with { allowed: boolean, remaining: number, resetAt: Date, retryAfter?: number }
 */
export function checkRateLimit(
  tier: RateLimitTier,
  identifier: string
): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
} {
  const config = RATE_LIMITS[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  // Get existing timestamps for this key
  const timestamps = requestStore.get(key) || [];

  // Filter to only timestamps within current window (sliding window)
  const windowStart = now - config.window;
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  const allowed = recentTimestamps.length < config.requests;

  if (allowed) {
    // Allow request - add current timestamp
    recentTimestamps.push(now);
    requestStore.set(key, recentTimestamps);

    return {
      allowed: true,
      remaining: config.requests - recentTimestamps.length,
      resetAt: new Date(now + config.window),
    };
  } else {
    // Deny request - calculate retry-after
    const oldestTimestamp = recentTimestamps[0] || now; // Fallback to now if array is somehow empty
    const retryAfter = Math.ceil((oldestTimestamp + config.window - now) / 1000); // seconds

    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(oldestTimestamp + config.window),
      retryAfter,
    };
  }
}

/**
 * Reset rate limit for specific identifier (useful for testing or admin override)
 */
export function resetRateLimit(tier: RateLimitTier, identifier: string): void {
  const key = `${tier}:${identifier}`;
  requestStore.delete(key);
}

/**
 * Get current rate limit status without incrementing counter
 */
export function getRateLimitStatus(
  tier: RateLimitTier,
  identifier: string
): {
  current: number;
  limit: number;
  remaining: number;
  resetAt: Date;
} {
  const config = RATE_LIMITS[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  const timestamps = requestStore.get(key) || [];
  const windowStart = now - config.window;
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  return {
    current: recentTimestamps.length,
    limit: config.requests,
    remaining: Math.max(0, config.requests - recentTimestamps.length),
    resetAt: new Date(now + config.window),
  };
}

/**
 * Get debug information about rate limiter state
 * WARNING: Only use in development - exposes sensitive information
 */
export function getRateLimiterDebugInfo(): {
  totalKeys: number;
  storeSize: number;
  keys: string[];
} {
  if (process.env.NODE_ENV === "production") {
    return {
      totalKeys: 0,
      storeSize: 0,
      keys: [],
    };
  }

  return {
    totalKeys: requestStore.size,
    storeSize: Array.from(requestStore.values()).reduce((acc, arr) => acc + arr.length, 0),
    keys: Array.from(requestStore.keys()),
  };
}
