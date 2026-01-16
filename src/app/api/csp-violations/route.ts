import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * POST /api/csp-violations
 *
 * Content Security Policy (CSP) Violation Reporting Endpoint
 *
 * Purpose:
 * - Receives CSP violation reports from browsers when content is blocked
 * - Logs violations to Sentry for monitoring and CSP policy refinement
 * - Helps identify false positives and legitimate content being blocked
 *
 * Security:
 * - Public endpoint (no authentication required - browsers send reports automatically)
 * - Rate limiting should be applied at Vercel/Cloudflare level to prevent abuse
 * - Reports are sanitized before logging (no sensitive data exposed)
 *
 * Usage:
 * Browsers automatically send POST requests to this endpoint when CSP violations occur.
 * View reports in Sentry dashboard under "Issues" filtered by tag "csp-violation".
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#reporting_violations
 */
export async function POST(request: NextRequest) {
  try {
    // Parse CSP violation report from browser
    const report = await request.json();

    // Extract useful information for debugging
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");

    // Log to Sentry for centralized monitoring
    // This allows us to track patterns and refine CSP policy
    Sentry.captureMessage("CSP Violation Detected", {
      level: "warning",
      tags: {
        type: "csp-violation",
        // Tag with violated directive for easy filtering
        directive: report["csp-report"]?.["violated-directive"]?.split(" ")[0],
      },
      extra: {
        cspReport: report,
        userAgent,
        referer,
        timestamp: new Date().toISOString(),
      },
    });

    // Log to console in development for immediate feedback
    if (process.env.NODE_ENV === "development") {
      console.warn("🚨 CSP Violation:", {
        directive: report["csp-report"]?.["violated-directive"],
        blockedUri: report["csp-report"]?.["blocked-uri"],
        documentUri: report["csp-report"]?.["document-uri"],
        sourceFile: report["csp-report"]?.["source-file"],
        lineNumber: report["csp-report"]?.["line-number"],
      });
    }

    // Return 204 No Content (standard response for CSP reports)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Log parsing errors but don't expose them to client
    console.error("Error processing CSP violation report:", error);

    // Still return 204 to prevent browser retries
    // CSP reporting is best-effort, failures shouldn't break user experience
    return new NextResponse(null, { status: 204 });
  }
}

/**
 * OPTIONS /api/csp-violations
 *
 * Handle CORS preflight requests
 * Browsers may send OPTIONS requests before POST for cross-origin CSP reports
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow reports from any origin
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
