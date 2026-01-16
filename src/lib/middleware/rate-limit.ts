/**
 * Rate Limit Middleware Helper
 *
 * Provides Next.js API route integration for rate limiting
 *
 * Usage in API routes:
 * ```typescript
 * import { withRateLimit } from '@/lib/middleware/rate-limit';
 *
 * export const GET = withRateLimit('READ', async (req) => {
 *   // Your API logic here
 *   return NextResponse.json({ data: 'Hello' });
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitIdentifier, type RateLimitTier } from "@/lib/rate-limiter";
import * as Sentry from "@sentry/nextjs";

/**
 * Rate limit middleware wrapper for Next.js API routes
 *
 * Supports two signatures for backwards compatibility:
 * 1. withRateLimit('CRITICAL', handler, getUserId) - tier first (recommended)
 * 2. withRateLimit(handler, 'CRITICAL') - handler first (test compatibility)
 *
 * @param tierOrHandler - Rate limit tier OR handler function
 * @param handlerOrTier - Handler function OR rate limit tier
 * @param getUserId - Optional function to extract user ID from request (for authenticated routes)
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit<T extends NextRequest = NextRequest>(
  tierOrHandler: RateLimitTier | ((req: T) => Promise<NextResponse>),
  handlerOrTier?: ((req: T) => Promise<NextResponse>) | RateLimitTier,
  getUserId?: (req: T) => Promise<string | undefined>
): (req: T) => Promise<NextResponse> {
  // Detect which signature was used
  let tier: RateLimitTier;
  let handler: (req: T) => Promise<NextResponse>;

  if (typeof tierOrHandler === "string") {
    // Signature 1: withRateLimit('CRITICAL', handler, getUserId)
    tier = tierOrHandler as RateLimitTier;
    handler = handlerOrTier as (req: T) => Promise<NextResponse>;
  } else {
    // Signature 2: withRateLimit(handler, 'CRITICAL')
    handler = tierOrHandler as (req: T) => Promise<NextResponse>;
    tier = handlerOrTier as RateLimitTier;
  }
  return async (req: T) => {
    try {
      // Get identifier (user ID or IP)
      const userId = getUserId ? await getUserId(req) : undefined;
      const identifier = await getRateLimitIdentifier(userId, req);

      // Check rate limit
      const result = checkRateLimit(tier, identifier);

      // Add rate limit headers to response
      const headers = {
        "X-RateLimit-Limit": result.allowed
          ? String(result.remaining + 1)
          : String(result.remaining),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": result.resetAt.toISOString(),
      };

      if (!result.allowed) {
        // Rate limit exceeded - log to Sentry
        Sentry.captureMessage("Rate limit exceeded", {
          level: "warning",
          extra: {
            tier,
            identifier,
            url: req.url,
            method: req.method,
            retryAfter: result.retryAfter,
          },
        });

        // Return 429 Too Many Requests with Retry-After header
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded",
            message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              ...headers,
              "Retry-After": String(result.retryAfter),
            },
          }
        );
      }

      // Rate limit passed - execute handler
      const response = await handler(req);

      // Add rate limit headers to successful response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      // Log error but don't block request on rate limiter failure
      console.error("[RateLimit] Middleware error:", error);
      Sentry.captureException(error, {
        extra: {
          tier,
          url: req.url,
          method: req.method,
        },
      });

      // Fail open - allow request through if rate limiter fails
      return handler(req);
    }
  };
}

/**
 * Helper to extract user ID from Supabase auth in API routes
 *
 * Usage:
 * ```typescript
 * export const POST = withRateLimit(
 *   'WRITE',
 *   async (req) => { ... },
 *   getSupabaseUserId
 * );
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSupabaseUserId(_req: NextRequest): Promise<string | undefined> {
  try {
    // Import here to avoid circular dependencies
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id;
  } catch (error) {
    console.error("[RateLimit] Failed to get user ID:", error);
    return undefined;
  }
}

/**
 * Rate limit error class for better error handling
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Check rate limit without wrapping handler (for manual control)
 *
 * Usage:
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const rateLimitCheck = await checkRateLimitForRequest('WRITE', req);
 *   if (!rateLimitCheck.allowed) {
 *     return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
 *   }
 *   // ... rest of handler
 * }
 * ```
 */
export async function checkRateLimitForRequest(
  tier: RateLimitTier,
  req: NextRequest,
  userId?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}> {
  const identifier = await getRateLimitIdentifier(userId, req);
  return checkRateLimit(tier, identifier);
}
