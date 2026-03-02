import { createCsrfProtect } from "@edge-csrf/nextjs";

/**
 * CSRF Protection Configuration
 *
 * Uses @edge-csrf/nextjs middleware to enforce CSRF tokens on all
 * state-changing requests (POST, PUT, DELETE, PATCH).
 *
 * Webhook routes are excluded at the middleware level (they use HMAC instead).
 * Safe methods (GET, HEAD, OPTIONS) are excluded by default.
 */
export const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});
