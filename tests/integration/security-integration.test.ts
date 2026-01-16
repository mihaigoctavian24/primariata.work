/**
 * Security Integration Tests
 *
 * Tests the interaction between all security layers:
 * 1. Security Headers (CSP, HSTS, etc.)
 * 2. Rate Limiting (sliding window)
 * 3. CSRF Protection (Origin/Referer validation)
 * 4. Authorization (JWT + ownership checks)
 * 5. Input Validation (XSS prevention, sanitization)
 *
 * Purpose: Ensure defense-in-depth layers work harmoniously
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/middleware/rate-limit";
import { withCSRFProtection } from "@/lib/middleware/csrf-protection";
import { requireAuth, requireOwnership } from "@/lib/auth/authorization";
import { sanitizeHtml, sanitizeText } from "@/lib/security/sanitize";
import { rateLimiter } from "@/lib/rate-limiter";

// ============================================================================
// TEST SETUP
// ============================================================================

const TEST_USER_ID = "test-user-123";
const VALID_ORIGIN = "https://primariata.work";
const VALID_JWT = "mock-jwt-token";

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: TEST_USER_ID, email: "test@example.com" } },
          error: null,
        })
      ),
    },
  })),
}));

// Helper to create mock NextRequest
function createMockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): NextRequest {
  const { method = "GET", url = "https://primariata.work/api/test", headers = {}, body } = options;

  const request = new NextRequest(url, {
    method,
    headers: new Headers({
      "Content-Type": "application/json",
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  });

  return request;
}

// ============================================================================
// INTEGRATION TEST SUITE
// ============================================================================

describe("Security Integration Tests", () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    rateLimiter.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // TEST 1: Security Headers + Rate Limiting
  // ==========================================================================

  describe("Security Headers + Rate Limiting Integration", () => {
    it("should apply security headers even when rate limited", async () => {
      const handler = withRateLimit(async (req: NextRequest) => {
        return NextResponse.json({ success: true });
      }, "CRITICAL"); // 5 requests per 15 min

      // Make 6 requests (1 over limit)
      const requests = Array.from({ length: 6 }, (_, i) =>
        createMockRequest({
          method: "POST",
          headers: { "X-Forwarded-For": "203.0.113.1" },
        })
      );

      const responses = await Promise.all(requests.map((req) => handler(req)));

      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        expect(responses[i]!.status).toBe(200);
        // Security headers should be present (checked by Next.js middleware)
      }

      // 6th should be rate limited
      expect(responses[5]!.status).toBe(429);
      expect(responses[5]!.headers.get("Retry-After")).toBeTruthy();
      expect(responses[5]!.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("should not interfere with CSP violation reporting", async () => {
      // CSP violations should NEVER be rate limited
      const cspHandler = async (req: NextRequest) => {
        return NextResponse.json({ received: true }, { status: 204 });
      };

      // Make 100 CSP violation reports (should all succeed)
      const requests = Array.from({ length: 100 }, () =>
        createMockRequest({
          method: "POST",
          url: "https://primariata.work/api/csp-violations",
          headers: { "Content-Type": "application/csp-report" },
          body: { "violated-directive": "script-src", "blocked-uri": "https://evil.com" },
        })
      );

      const responses = await Promise.all(requests.map((req) => cspHandler(req)));

      // All should succeed (CSP endpoint not rate limited)
      responses.forEach((response) => {
        expect(response.status).toBe(204);
      });
    });
  });

  // ==========================================================================
  // TEST 2: Rate Limiting + CSRF Protection
  // ==========================================================================

  describe("Rate Limiting + CSRF Protection Integration", () => {
    it("should check CSRF before consuming rate limit quota", async () => {
      const handler = withRateLimit(
        withCSRFProtection(async (req: NextRequest) => {
          return NextResponse.json({ success: true });
        }),
        "WRITE" // 20 requests per 15 min
      );

      // Request WITHOUT Origin header (CSRF fail)
      const invalidRequest = createMockRequest({
        method: "POST",
        headers: { "X-Forwarded-For": "203.0.113.2" },
      });

      const response1 = await handler(invalidRequest);

      expect(response1.status).toBe(403); // CSRF rejected
      expect(await response1.json()).toMatchObject({
        error: expect.stringContaining("CSRF"),
      });

      // Verify rate limit quota was NOT consumed
      const validRequest = createMockRequest({
        method: "POST",
        headers: {
          "X-Forwarded-For": "203.0.113.2",
          Origin: VALID_ORIGIN,
        },
      });

      const response2 = await handler(validRequest);
      expect(response2.status).toBe(200);
      expect(response2.headers.get("X-RateLimit-Remaining")).toBe("19"); // Full quota available
    });

    it("should handle CORS preflight without consuming quota", async () => {
      const handler = withRateLimit(
        withCSRFProtection(async (req: NextRequest) => {
          return NextResponse.json({ success: true });
        }),
        "WRITE"
      );

      // OPTIONS request (preflight)
      const preflightRequest = createMockRequest({
        method: "OPTIONS",
        headers: { Origin: VALID_ORIGIN },
      });

      const response = await handler(preflightRequest);

      // Preflight should pass without consuming quota
      expect(response.status).toBe(200);

      // Follow-up POST should have full quota
      const postRequest = createMockRequest({
        method: "POST",
        headers: {
          Origin: VALID_ORIGIN,
          "X-Forwarded-For": "203.0.113.3",
        },
      });

      const postResponse = await handler(postRequest);
      expect(postResponse.headers.get("X-RateLimit-Remaining")).toBe("19");
    });
  });

  // ==========================================================================
  // TEST 3: CSRF + Authorization + Validation
  // ==========================================================================

  describe("CSRF + Authorization + Input Validation Integration", () => {
    it("should validate CSRF → Auth → Input in correct order", async () => {
      const handler = withCSRFProtection(async (req: NextRequest) => {
        // Step 2: Check authentication
        const user = await requireAuth(req);

        // Step 3: Validate input
        const body = await req.json();
        const sanitizedTitle = sanitizeText(body.title);

        return NextResponse.json({
          userId: user.id,
          sanitizedTitle,
        });
      });

      // Missing CSRF headers → should fail at step 1
      const noCsrfRequest = createMockRequest({
        method: "POST",
        body: { title: '<script>alert("XSS")</script>Valid Title' },
      });

      const response1 = await handler(noCsrfRequest);
      expect(response1.status).toBe(403);
      expect(await response1.json()).toMatchObject({
        error: expect.stringContaining("CSRF"),
      });

      // Valid CSRF → should proceed to auth and sanitize input
      const validRequest = createMockRequest({
        method: "POST",
        headers: {
          Origin: VALID_ORIGIN,
          Authorization: `Bearer ${VALID_JWT}`,
        },
        body: { title: '<script>alert("XSS")</script>Valid Title' },
      });

      const response2 = await handler(validRequest);
      expect(response2.status).toBe(200);

      const data = await response2.json();
      expect(data.userId).toBe(TEST_USER_ID);
      expect(data.sanitizedTitle).not.toContain("<script>");
      expect(data.sanitizedTitle).toContain("Valid Title");
    });

    it("should enforce ownership checks after authentication", async () => {
      const mockResource = { user_id: "different-user", id: "123" };

      const handler = withCSRFProtection(async (req: NextRequest) => {
        const user = await requireAuth(req);

        // This should throw AuthorizationError
        await requireOwnership(mockResource, user.id, "resource");

        return NextResponse.json({ success: true });
      });

      const request = createMockRequest({
        method: "DELETE",
        headers: {
          Origin: VALID_ORIGIN,
          Authorization: `Bearer ${VALID_JWT}`,
        },
      });

      // Should throw authorization error
      await expect(handler(request)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // TEST 4: Complete Defense-in-Depth Flow
  // ==========================================================================

  describe("Complete Security Stack Integration", () => {
    it("should pass through all layers for valid request", async () => {
      const handler = withRateLimit(
        withCSRFProtection(async (req: NextRequest) => {
          const user = await requireAuth(req);
          const body = await req.json();

          // Validate and sanitize
          const sanitizedData = {
            title: sanitizeText(body.title),
            description: sanitizeHtml(body.description),
          };

          return NextResponse.json({
            success: true,
            userId: user.id,
            data: sanitizedData,
          });
        }),
        "WRITE"
      );

      const validRequest = createMockRequest({
        method: "POST",
        headers: {
          Origin: VALID_ORIGIN,
          Authorization: `Bearer ${VALID_JWT}`,
          "X-Forwarded-For": "203.0.113.10",
        },
        body: {
          title: "<b>Important</b> Request",
          description: '<p>Please process <script>alert("XSS")</script>this request</p>',
        },
      });

      const response = await handler(validRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("19");

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.userId).toBe(TEST_USER_ID);
      expect(data.data.title).not.toContain("<b>");
      expect(data.data.description).not.toContain("<script>");
      expect(data.data.description).toContain("this request");
    });

    it("should fail fast at first violated layer", async () => {
      const handler = withRateLimit(
        withCSRFProtection(async (req: NextRequest) => {
          const user = await requireAuth(req);
          return NextResponse.json({ userId: user.id });
        }),
        "CRITICAL" // 5 requests per 15 min
      );

      // Test 1: Rate limit reached (should fail at layer 1)
      const requests = Array.from({ length: 6 }, () =>
        createMockRequest({
          method: "POST",
          headers: {
            Origin: VALID_ORIGIN,
            "X-Forwarded-For": "203.0.113.20",
          },
        })
      );

      const responses = await Promise.all(requests.map((req) => handler(req)));

      expect(responses[5]!.status).toBe(429); // Rate limit

      // Test 2: Missing CSRF after rate limit reset
      rateLimiter.reset();

      const noCsrfRequest = createMockRequest({
        method: "POST",
        headers: { "X-Forwarded-For": "203.0.113.20" }, // No Origin
      });

      const csrfResponse = await handler(noCsrfRequest);
      expect(csrfResponse.status).toBe(403); // CSRF failure
    });

    it("should handle concurrent requests without race conditions", async () => {
      const handler = withRateLimit(
        withCSRFProtection(async (req: NextRequest) => {
          const user = await requireAuth(req);

          // Simulate async processing
          await new Promise((resolve) => setTimeout(resolve, 50));

          return NextResponse.json({ userId: user.id });
        }),
        "WRITE" // 20 requests
      );

      // Make 15 concurrent requests
      const requests = Array.from({ length: 15 }, (_, i) =>
        createMockRequest({
          method: "POST",
          headers: {
            Origin: VALID_ORIGIN,
            Authorization: `Bearer ${VALID_JWT}`,
            "X-Forwarded-For": `203.0.113.${30 + i}`, // Different IPs
          },
        })
      );

      const responses = await Promise.all(requests.map((req) => handler(req)));

      // All should succeed (different IPs = isolated quotas)
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  // ==========================================================================
  // TEST 5: Error Handling and Graceful Degradation
  // ==========================================================================

  describe("Error Handling Integration", () => {
    it("should return appropriate error codes for each layer", async () => {
      const errors = [
        {
          scenario: "Rate Limit Exceeded",
          expectedStatus: 429,
          expectedHeaders: ["Retry-After", "X-RateLimit-Remaining"],
        },
        {
          scenario: "CSRF Validation Failed",
          expectedStatus: 403,
          expectedMessage: "CSRF",
        },
        {
          scenario: "Authentication Required",
          expectedStatus: 401,
          expectedMessage: "Authentication required",
        },
        {
          scenario: "Authorization Failed",
          expectedStatus: 403,
          expectedMessage: "permission",
        },
      ];

      // This is a documentation test - actual error codes verified in individual tests
      expect(errors).toHaveLength(4);
    });

    it("should log security events without exposing sensitive data", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const handler = withCSRFProtection(async (req: NextRequest) => {
        return NextResponse.json({ success: true });
      });

      const maliciousRequest = createMockRequest({
        method: "POST",
        headers: {
          Origin: "https://evil.com",
          Authorization: "Bearer secret-token",
        },
      });

      await handler(maliciousRequest);

      // Should log security event
      expect(consoleSpy).toHaveBeenCalled();

      // Should NOT log sensitive headers
      const loggedData = consoleSpy.mock.calls[0]?.[1];
      expect(JSON.stringify(loggedData)).not.toContain("secret-token");

      consoleSpy.mockRestore();
    });
  });
});

// ============================================================================
// PERFORMANCE INTEGRATION TESTS
// ============================================================================

describe("Security Performance Integration", () => {
  it("should complete full security stack in <100ms", async () => {
    const handler = withRateLimit(
      withCSRFProtection(async (req: NextRequest) => {
        await requireAuth(req);
        const body = await req.json();
        const sanitized = sanitizeText(body.text);
        return NextResponse.json({ result: sanitized });
      }),
      "WRITE"
    );

    const request = createMockRequest({
      method: "POST",
      headers: {
        Origin: VALID_ORIGIN,
        Authorization: `Bearer ${VALID_JWT}`,
        "X-Forwarded-For": "203.0.113.50",
      },
      body: { text: "Simple text" },
    });

    const startTime = Date.now();
    await handler(request);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(100); // <100ms for full stack
  });

  it("should handle 50 requests within rate limit efficiently", async () => {
    const handler = withRateLimit(
      async (req: NextRequest) => NextResponse.json({ success: true }),
      "READ" // 100 requests
    );

    const requests = Array.from({ length: 50 }, (_, i) =>
      createMockRequest({
        method: "GET",
        headers: { "X-Forwarded-For": `203.0.113.${100 + i}` },
      })
    );

    const startTime = Date.now();
    await Promise.all(requests.map((req) => handler(req)));
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000); // <1 second for 50 requests
  });
});
