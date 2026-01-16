/**
 * Core Security Integration Tests
 *
 * Tests security functionality without Next.js runtime dependencies
 * Validates: Rate limiter, sanitization, validators
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { RateLimiter, RATE_LIMIT_TIERS } from "@/lib/rate-limiter";
import { sanitizeHtml, sanitizeText } from "@/lib/security/sanitize";
import {
  cnpValidator,
  romanianPhoneValidator,
  romanianIBANValidator,
  jsonbSizeValidator,
  preventPathTraversal,
  preventSSRF,
} from "@/lib/validations/common";

// ============================================================================
// RATE LIMITER INTEGRATION TESTS
// ============================================================================

describe("Rate Limiter Core Integration", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  it("should enforce different tiers independently", async () => {
    const userId = "user-1";

    // Use 3 CRITICAL requests
    for (let i = 0; i < 3; i++) {
      const result = await rateLimiter.consume(`CRITICAL:${userId}`, "CRITICAL");
      expect(result.success).toBe(true);
    }

    // WRITE tier should still have full quota (20 requests)
    const writeResult = await rateLimiter.consume(`WRITE:${userId}`, "WRITE");
    expect(writeResult.success).toBe(true);
    expect(writeResult.remaining).toBe(19);

    // READ tier should have full quota (100 requests)
    const readResult = await rateLimiter.consume(`READ:${userId}`, "READ");
    expect(readResult.success).toBe(true);
    expect(readResult.remaining).toBe(99);
  });

  it("should isolate users across tiers", async () => {
    // User 1 exhausts CRITICAL tier
    for (let i = 0; i < 5; i++) {
      await rateLimiter.consume("CRITICAL:user-1", "CRITICAL");
    }

    const user1Result = await rateLimiter.consume("CRITICAL:user-1", "CRITICAL");
    expect(user1Result.success).toBe(false);

    // User 2 should have full quota
    const user2Result = await rateLimiter.consume("CRITICAL:user-2", "CRITICAL");
    expect(user2Result.success).toBe(true);
    expect(user2Result.remaining).toBe(4);
  });

  it("should provide accurate retry timing", async () => {
    const identifier = "CRITICAL:timing-test";

    // Exhaust quota
    for (let i = 0; i < 5; i++) {
      await rateLimiter.consume(identifier, "CRITICAL");
    }

    const result = await rateLimiter.consume(identifier, "CRITICAL");
    expect(result.success).toBe(false);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter!).toBeGreaterThan(0);
    expect(result.retryAfter!).toBeLessThanOrEqual(900); // 15 min window
  });
});

// ============================================================================
// INPUT SANITIZATION INTEGRATION
// ============================================================================

describe("Input Sanitization Integration", () => {
  describe("XSS Prevention Across Validators", () => {
    it("should sanitize HTML in text fields", () => {
      const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<script>");
      expect(result).toContain("Safe content");
    });

    it("should sanitize event handlers in text", () => {
      const malicious = '<img src=x onerror="alert(1)"><a href="#" onclick="alert(2)">Click</a>';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("onerror");
      expect(result).not.toContain("onclick");
    });

    it("should strip all HTML from plain text fields", () => {
      const input = "<b>Bold</b> and <i>italic</i> text";
      const result = sanitizeText(input);

      expect(result).not.toContain("<b>");
      expect(result).not.toContain("<i>");
      expect(result).toContain("Bold");
      expect(result).toContain("italic");
    });
  });

  describe("Romanian Validators with Sanitization", () => {
    it("should validate CNP with checksum after sanitization", () => {
      const validCNP = "1800101223457"; // Valid Romanian CNP
      expect(() => cnpValidator.parse(validCNP)).not.toThrow();

      const invalidCNP = "<script>1800101223458</script>"; // Invalid checksum wrapped in script
      expect(() => cnpValidator.parse(invalidCNP)).toThrow();
    });

    it("should validate Romanian phone numbers with various formats", () => {
      const validPhones = [
        "+40712345678",
        "0040712345678",
        "0712345678",
        "+40 712 345 678",
        "0712 345 678",
      ];

      validPhones.forEach((phone) => {
        expect(() => romanianPhoneValidator.parse(phone)).not.toThrow();
      });
    });

    it("should validate Romanian IB ANs", () => {
      const validIBAN = "RO49AAAA1B31007593840000";
      expect(() => romanianIBANValidator.parse(validIBAN)).not.toThrow();

      const invalidIBAN = "US12345678901234567890";
      expect(() => romanianIBANValidator.parse(invalidIBAN)).toThrow();
    });
  });
});

// ============================================================================
// SECURITY VALIDATORS INTEGRATION
// ============================================================================

describe("Security Validators Integration", () => {
  describe("JSONB Size Limits", () => {
    it("should reject objects exceeding 100KB", () => {
      const largeObject = {
        data: "x".repeat(101 * 1024), // 101KB
      };

      expect(() => jsonbSizeValidator.parse(largeObject)).toThrow();
    });

    it("should reject objects with >100 keys", () => {
      const manyKeys: Record<string, string> = {};
      for (let i = 0; i < 101; i++) {
        manyKeys[`key${i}`] = "value";
      }

      expect(() => jsonbSizeValidator.parse(manyKeys)).toThrow();
    });

    it("should accept valid objects", () => {
      const validObject = {
        name: "Test",
        description: "Valid description",
        metadata: { key1: "value1", key2: "value2" },
      };

      expect(() => jsonbSizeValidator.parse(validObject)).not.toThrow();
    });
  });

  describe("Path Traversal Prevention", () => {
    it("should block path traversal attempts", () => {
      const attacks = ["../../../etc/passwd", "..\\..\\windows\\system32", "./../../secret.env"];

      attacks.forEach((path) => {
        expect(() => preventPathTraversal.parse(path)).toThrow();
      });
    });

    it("should allow safe paths", () => {
      const safePaths = ["documents/file.pdf", "uploads/image.png", "user-123/profile.jpg"];

      safePaths.forEach((path) => {
        expect(() => preventPathTraversal.parse(path)).not.toThrow();
      });
    });
  });

  describe("SSRF Prevention", () => {
    it("should block private IP addresses", () => {
      const privateIPs = [
        "http://192.168.1.1",
        "http://10.0.0.1",
        "http://172.16.0.1",
        "http://127.0.0.1",
        "http://localhost",
      ];

      privateIPs.forEach((url) => {
        expect(() => preventSSRF.parse(url)).toThrow();
      });
    });

    it("should allow public URLs", () => {
      const publicURLs = ["https://example.com", "https://api.primariata.work", "https://8.8.8.8"];

      publicURLs.forEach((url) => {
        expect(() => preventSSRF.parse(url)).not.toThrow();
      });
    });
  });
});

// ============================================================================
// PERFORMANCE INTEGRATION TESTS
// ============================================================================

describe("Security Performance Integration", () => {
  it("should complete rate limit check in <5ms", async () => {
    const rateLimiter = new RateLimiter();
    const start = Date.now();

    await rateLimiter.consume("perf-test", "WRITE");

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5);
  });

  it("should sanitize 1000 strings in <100ms", () => {
    const testStrings = Array.from({ length: 1000 }, (_, i) => `<p>Text ${i}</p>`);

    const start = Date.now();

    testStrings.forEach((str) => sanitizeHtml(str));

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it("should validate 100 CNPs in <50ms", () => {
    const validCNP = "1800101223457";
    const start = Date.now();

    for (let i = 0; i < 100; i++) {
      cnpValidator.parse(validCNP);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50);
  });
});

// ============================================================================
// CONCURRENT OPERATIONS INTEGRATION
// ============================================================================

describe("Concurrent Security Operations", () => {
  it("should handle 50 simultaneous rate limit requests", async () => {
    const rateLimiter = new RateLimiter();

    const requests = Array.from({ length: 50 }, (_, i) =>
      rateLimiter.consume(`READ:user-${i}`, "READ")
    );

    const results = await Promise.all(requests);

    // All should succeed (different users = isolated quotas)
    results.forEach((result) => {
      expect(result.success).toBe(true);
    });
  });

  it("should sanitize concurrent requests safely", () => {
    const inputs = Array.from({ length: 100 }, (_, i) => `<script>alert(${i})</script>Text ${i}`);

    const results = inputs.map((input) => sanitizeHtml(input));

    results.forEach((result, i) => {
      expect(result).not.toContain("<script>");
      expect(result).toContain(`Text ${i}`);
    });
  });
});
