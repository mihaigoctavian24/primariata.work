/**
 * CSRF Protection Middleware
 *
 * Cross-Site Request Forgery (CSRF) protection for state-changing operations.
 *
 * Strategy:
 * Since primariaTa uses Supabase JWT-based authentication (not cookie-based sessions),
 * we implement CSRF protection through Origin/Referer header validation.
 *
 * Why Origin/Referer validation?
 * - JWT tokens in Authorization header are not automatically sent by browser on CSRF attacks
 * - However, API routes could be vulnerable if JWT is stored in cookies
 * - Defense-in-depth: Add Origin/Referer checks as additional security layer
 *
 * Protected Methods: POST, PUT, PATCH, DELETE
 * Safe Methods: GET, HEAD, OPTIONS (idempotent, no state changes)
 *
 * References:
 * - OWASP CSRF Prevention Cheat Sheet
 * - RFC 6454 (Origin Header)
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types/api";
import { logSecurityEvent } from "@/lib/auth/authorization";

/**
 * Allowed origins for CSRF protection
 *
 * In production, this should be the actual domain.
 * In development, localhost is allowed.
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [];

  // Always include the canonical production domain
  const productionOrigins = [
    "https://primariata.work",
    "https://www.primariata.work",
    "https://develop.primariata.work",
  ];

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") {
    return [...productionOrigins, ...envOrigins, "http://localhost:3000", "http://127.0.0.1:3000"];
  }

  return [...productionOrigins, ...envOrigins];
}

/**
 * Validate Origin header for CSRF protection
 *
 * @param request - The incoming request
 * @returns true if origin is valid, false otherwise
 */
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const allowedOrigins = getAllowedOrigins();

  // Check Origin header (preferred)
  if (origin) {
    return allowedOrigins.includes(origin);
  }

  // Fallback to Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      return allowedOrigins.includes(refererOrigin);
    } catch {
      // Invalid referer URL
      return false;
    }
  }

  // No Origin or Referer header - potentially suspicious
  // Allow for API clients that don't send these headers (e.g., mobile apps, Postman)
  // But log the event for monitoring
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  logSecurityEvent({
    type: "authz",
    action: "missing_origin_referer",
    ip,
    success: false,
    metadata: {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
    },
  });

  // In production, consider rejecting requests without Origin/Referer
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  // In development, allow (for testing with tools like curl, Postman)
  return true;
}

/**
 * CSRF Protection Middleware
 *
 * Validates Origin/Referer headers for state-changing operations.
 * Should be called at the beginning of API route handlers for POST/PUT/PATCH/DELETE.
 *
 * @param request - The incoming request
 * @returns NextResponse with 403 error if CSRF validation fails, null otherwise
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   // Check CSRF before processing
 *   const csrfError = await csrfProtection(request);
 *   if (csrfError) return csrfError;
 *
 *   // Process request...
 * }
 * ```
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  const method = request.method;

  // Only protect state-changing methods
  const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!protectedMethods.includes(method)) {
    return null; // Safe methods don't need CSRF protection
  }

  // Validate origin
  if (!validateOrigin(request)) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    // Log CSRF violation
    logSecurityEvent({
      type: "authz",
      action: "csrf_violation",
      ip,
      success: false,
      metadata: {
        method,
        url: request.url,
        origin,
        referer,
        userAgent: request.headers.get("user-agent"),
      },
    });

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "CSRF_VIOLATION",
        message: "Request rejected due to CSRF validation failure",
        details: {
          reason: "Invalid or missing Origin/Referer header",
        },
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(errorResponse, { status: 403 });
  }

  return null; // CSRF validation passed
}

/**
 * Convert standard Request to NextRequest for CSRF protection
 *
 * Helper function for API routes that receive Request instead of NextRequest.
 */
export function csrfProtectionFromRequest(request: Request): NextResponse | null {
  // Create a NextRequest from the standard Request
  const nextRequest = new NextRequest(request);
  return csrfProtection(nextRequest);
}

/**
 * Middleware config for CSRF protection
 *
 * This can be integrated into the main middleware.ts file.
 */
export const csrfConfig = {
  /**
   * Paths that should be excluded from CSRF protection
   * (e.g., webhooks from external services)
   */
  excludePaths: [
    "/api/webhooks/ghiseul",
    "/api/webhooks/certsign",
    // Add other webhook endpoints here
  ],

  /**
   * Check if a path should be excluded from CSRF protection
   */
  shouldExclude: (pathname: string): boolean => {
    return csrfConfig.excludePaths.some((excludePath) => pathname.startsWith(excludePath));
  },
};
