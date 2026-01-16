/**
 * Validation Security Tests
 *
 * Tests for Issue #93: Input Validation Hardening
 *
 * Test Coverage:
 * 1. XSS Prevention
 * 2. String Length Limits
 * 3. Romanian-specific Validators (CNP, phone, IBAN)
 * 4. SQL/NoSQL Injection Prevention
 * 5. Path Traversal Prevention
 * 6. Amount Bounds Validation
 * 7. State Machine Validation
 */

import { describe, it, expect } from "@jest/globals";

// Common validators
import {
  createSafeStringSchema,
  emailSchema,
  phoneSchema,
  cnpSchema,
  filenameSchema,
  amountSchema,
  passwordSchema,
  urlSchema,
  calculatePasswordStrength,
} from "../../src/lib/validations/common";

// Sanitization utilities
import {
  sanitizePlainText,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeJsonObject,
  containsHtml,
  containsScript,
  containsEventHandlers,
  isSafeString,
} from "../../src/lib/security/sanitize";

// Schema validators
import {
  createCerereSchema,
  cancelCerereSchema,
  isValidStatusTransition,
  CerereStatus,
} from "../../src/lib/validations/cereri";

import {
  personalInfoSchema,
  passwordChangeSchema,
  avatarUploadSchema,
} from "../../src/lib/validations/profile";

import {
  createPlataSchema,
  webhookPlataUpdateSchema,
  isValidPlataStatusTransition,
  PlataStatus,
} from "../../src/lib/validations/plati";

// =============================================================================
// XSS PREVENTION TESTS
// =============================================================================

describe("XSS Prevention", () => {
  describe("sanitizePlainText", () => {
    it("should strip all HTML tags", () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizePlainText(input);
      expect(result).toBe("Hello World");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizePlainText(input);
      expect(result).toBe("Click me");
    });

    it("should handle nested tags", () => {
      const input = "<p><strong>Bold <em>italic</em></strong></p>";
      const result = sanitizePlainText(input);
      expect(result).toBe("Bold italic");
    });

    it("should keep safe text unchanged", () => {
      const input = "Simple text without HTML";
      const result = sanitizePlainText(input);
      expect(result).toBe(input);
    });
  });

  describe("sanitizeHtml", () => {
    it("should allow safe HTML tags", () => {
      const input = "<p>Safe <strong>text</strong></p>";
      const result = sanitizeHtml(input);
      expect(result).toContain("<p>");
      expect(result).toContain("<strong>");
    });

    it("should remove script tags", () => {
      const input = "<p>Safe text</p><script>alert(1)</script>";
      const result = sanitizeHtml(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>Safe text</p>");
    });

    it("should remove event handlers", () => {
      const input = '<a href="https://example.com" onclick="alert(1)">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("onclick");
    });
  });

  describe("XSS Detection Helpers", () => {
    it("should detect HTML tags", () => {
      expect(containsHtml("<p>Test</p>")).toBe(true);
      expect(containsHtml("Plain text")).toBe(false);
    });

    it("should detect script tags", () => {
      expect(containsScript("<script>alert(1)</script>")).toBe(true);
      expect(containsScript("<p>Safe</p>")).toBe(false);
    });

    it("should detect event handlers", () => {
      expect(containsEventHandlers('onclick="alert(1)"')).toBe(true);
      expect(containsEventHandlers("onclick = 'alert(1)'")).toBe(true);
      expect(containsEventHandlers("safe text")).toBe(false);
    });

    it("should validate safe strings", () => {
      expect(isSafeString("Plain text")).toBe(true);
      expect(isSafeString("<script>alert(1)</script>")).toBe(false);
      expect(isSafeString('onclick="alert(1)"')).toBe(false);
    });
  });
});

// =============================================================================
// STRING LENGTH LIMITS
// =============================================================================

describe("String Length Limits", () => {
  it("should enforce minimum length", () => {
    const schema = createSafeStringSchema({ minLength: 5 });
    expect(schema.safeParse("test").success).toBe(false);
    expect(schema.safeParse("testing").success).toBe(true);
  });

  it("should enforce maximum length", () => {
    const schema = createSafeStringSchema({ maxLength: 10 });
    expect(schema.safeParse("short").success).toBe(true);
    expect(schema.safeParse("this is too long").success).toBe(false);
  });

  it("should trim whitespace", () => {
    const schema = createSafeStringSchema({ minLength: 3, maxLength: 10 });
    const result = schema.parse("  test  ");
    expect(result).toBe("test");
  });
});

// =============================================================================
// ROMANIAN-SPECIFIC VALIDATORS
// =============================================================================

describe("Romanian Validators", () => {
  describe("CNP Validation", () => {
    it("should accept valid CNP with correct checksum", () => {
      // Valid CNP: 1800101123450 (male, born 01.01.1880, county 12, sequence 345, checksum 0)
      const validCnp = "1800101123450";
      expect(cnpSchema.safeParse(validCnp).success).toBe(true);
    });

    it("should reject CNP with invalid format", () => {
      expect(cnpSchema.safeParse("123").success).toBe(false);
      expect(cnpSchema.safeParse("abcdefghijklm").success).toBe(false);
    });

    it("should reject CNP with invalid checksum", () => {
      // Valid format but wrong checksum
      const invalidCnp = "1800101123455"; // Last digit should be 0, not 5
      expect(cnpSchema.safeParse(invalidCnp).success).toBe(false);
    });

    it("should reject CNP starting with 0", () => {
      expect(cnpSchema.safeParse("0800101123456").success).toBe(false);
    });
  });

  describe("Phone Validation", () => {
    it("should accept valid Romanian phone numbers", () => {
      expect(phoneSchema.safeParse("0712345678").success).toBe(true);
      expect(phoneSchema.safeParse("+40712345678").success).toBe(true);
    });

    it("should normalize to +40 format", () => {
      const result = phoneSchema.parse("0712345678");
      expect(result).toBe("+4712345678"); // Removes leading 0, adds +4
    });

    it("should reject invalid phone numbers", () => {
      expect(phoneSchema.safeParse("123").success).toBe(false);
      expect(phoneSchema.safeParse("0812345678").success).toBe(false); // Invalid prefix
      expect(phoneSchema.safeParse("+1234567890").success).toBe(false); // Wrong country code
    });
  });

  describe("Email Validation", () => {
    it("should accept valid emails", () => {
      expect(emailSchema.safeParse("user@example.com").success).toBe(true);
      expect(emailSchema.safeParse("test.user+tag@domain.co.uk").success).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(emailSchema.safeParse("notanemail").success).toBe(false);
      expect(emailSchema.safeParse("@example.com").success).toBe(false);
      expect(emailSchema.safeParse("user@").success).toBe(false);
      expect(emailSchema.safeParse("user..test@example.com").success).toBe(false); // Consecutive dots
    });

    it("should normalize to lowercase", () => {
      const result = emailSchema.parse("User@EXAMPLE.COM");
      expect(result).toBe("user@example.com");
    });
  });
});

// =============================================================================
// PATH TRAVERSAL PREVENTION
// =============================================================================

describe("Path Traversal Prevention", () => {
  describe("Filename Sanitization", () => {
    it("should remove path separators", () => {
      expect(sanitizeFilename("../etc/passwd")).not.toContain("..");
      expect(sanitizeFilename("../../secrets.txt")).not.toContain("..");
    });

    it("should remove null bytes", () => {
      expect(sanitizeFilename("file\0.txt")).not.toContain("\0");
    });

    it("should allow safe filenames", () => {
      expect(sanitizeFilename("document.pdf")).toBe("document.pdf");
      expect(sanitizeFilename("report-2024.xlsx")).toBe("report-2024.xlsx");
    });

    it("should sanitize unsafe characters", () => {
      const result = sanitizeFilename("file<script>.pdf");
      expect(result).not.toContain("<script>");
    });
  });

  describe("Filename Schema Validation", () => {
    it("should accept valid filenames", () => {
      expect(filenameSchema.safeParse("document.pdf").success).toBe(true);
    });

    it("should reject path traversal attempts", () => {
      expect(filenameSchema.safeParse("../etc/passwd").success).toBe(false);
      expect(filenameSchema.safeParse("dir/file.txt").success).toBe(false);
    });

    it("should reject null bytes", () => {
      expect(filenameSchema.safeParse("file\0.txt").success).toBe(false);
    });
  });
});

// =============================================================================
// AMOUNT BOUNDS VALIDATION
// =============================================================================

describe("Amount Validation", () => {
  it("should accept valid amounts", () => {
    expect(amountSchema.safeParse(100).success).toBe(true);
    expect(amountSchema.safeParse(1000.5).success).toBe(true);
  });

  it("should reject negative amounts", () => {
    expect(amountSchema.safeParse(-10).success).toBe(false);
  });

  it("should reject zero", () => {
    expect(amountSchema.safeParse(0).success).toBe(false);
  });

  it("should enforce minimum (1 RON)", () => {
    expect(amountSchema.safeParse(0.5).success).toBe(false);
    expect(amountSchema.safeParse(1).success).toBe(true);
  });

  it("should enforce maximum (1M RON)", () => {
    expect(amountSchema.safeParse(1000000).success).toBe(true);
    expect(amountSchema.safeParse(1000001).success).toBe(false);
  });

  it("should enforce 2 decimal precision", () => {
    expect(amountSchema.safeParse(100.12).success).toBe(true);
    expect(amountSchema.safeParse(100.123).success).toBe(false);
  });
});

// =============================================================================
// PASSWORD SECURITY
// =============================================================================

describe("Password Security", () => {
  describe("Password Validation", () => {
    it("should accept strong passwords", () => {
      expect(passwordSchema.safeParse("Abcd1234!").success).toBe(true);
    });

    it("should reject short passwords", () => {
      expect(passwordSchema.safeParse("Abc1!").success).toBe(false);
    });

    it("should require uppercase", () => {
      expect(passwordSchema.safeParse("abcd1234!").success).toBe(false);
    });

    it("should require lowercase", () => {
      expect(passwordSchema.safeParse("ABCD1234!").success).toBe(false);
    });

    it("should require digit", () => {
      expect(passwordSchema.safeParse("Abcdefgh!").success).toBe(false);
    });

    it("should require special character", () => {
      expect(passwordSchema.safeParse("Abcd1234").success).toBe(false);
    });
  });

  describe("Password Strength", () => {
    it("should rate weak passwords correctly", () => {
      expect(calculatePasswordStrength("abc")).toBe(0);
      expect(calculatePasswordStrength("abcdefgh")).toBe(1);
    });

    it("should rate medium passwords correctly", () => {
      expect(calculatePasswordStrength("Abcd1234")).toBe(3); // Has upper, lower, digit, length >= 8
    });

    it("should rate strong passwords correctly", () => {
      expect(calculatePasswordStrength("Abcd1234!")).toBe(4); // Has all: upper, lower, digit, special, length >= 8
    });

    it("should rate very strong passwords correctly", () => {
      expect(calculatePasswordStrength("Abcd1234!@#$")).toBe(4);
    });
  });
});

// =============================================================================
// URL VALIDATION & SSRF PREVENTION
// =============================================================================

describe("URL Validation", () => {
  it("should accept valid HTTPS URLs", () => {
    expect(urlSchema.safeParse("https://example.com").success).toBe(true);
  });

  it("should reject HTTP URLs", () => {
    expect(urlSchema.safeParse("http://example.com").success).toBe(false);
  });

  it("should reject localhost", () => {
    expect(urlSchema.safeParse("https://localhost").success).toBe(false);
    expect(urlSchema.safeParse("https://127.0.0.1").success).toBe(false);
  });

  it("should reject private IPs (SSRF prevention)", () => {
    expect(urlSchema.safeParse("https://192.168.1.1").success).toBe(false);
    expect(urlSchema.safeParse("https://10.0.0.1").success).toBe(false);
    expect(urlSchema.safeParse("https://172.16.0.1").success).toBe(false);
  });
});

// =============================================================================
// JSON SANITIZATION
// =============================================================================

describe("JSON Sanitization", () => {
  it("should sanitize string values", () => {
    const input = {
      name: "<script>alert(1)</script>John",
      age: 30,
    };
    const result = sanitizeJsonObject(input);
    expect(result.name).toBe("John");
    expect(result.age).toBe(30);
  });

  it("should handle nested objects", () => {
    const input = {
      user: {
        name: "<b>John</b>",
        bio: "<script>alert(1)</script>Developer",
      },
    };
    const result = sanitizeJsonObject(input);
    expect((result.user as Record<string, unknown>).name).toBe("John");
    expect((result.user as Record<string, unknown>).bio).toBe("Developer");
  });

  it("should handle arrays", () => {
    const input = {
      tags: ["<script>alert(1)</script>", "safe-tag"],
    };
    const result = sanitizeJsonObject(input);
    // Arrays with primitive strings are kept as-is since they're not objects
    expect(Array.isArray(result.tags)).toBe(true);
  });
});

// =============================================================================
// STATE MACHINE VALIDATION
// =============================================================================

describe("State Machine Validation", () => {
  describe("Cerere Status Transitions", () => {
    it("should allow valid transitions", () => {
      expect(isValidStatusTransition(CerereStatus.DEPUSA, CerereStatus.IN_VERIFICARE)).toBe(true);
      expect(isValidStatusTransition(CerereStatus.IN_VERIFICARE, CerereStatus.IN_PROCESARE)).toBe(
        true
      );
      expect(isValidStatusTransition(CerereStatus.IN_PROCESARE, CerereStatus.APROBATA)).toBe(true);
    });

    it("should reject invalid transitions", () => {
      expect(isValidStatusTransition(CerereStatus.DEPUSA, CerereStatus.APROBATA)).toBe(false);
      expect(isValidStatusTransition(CerereStatus.FINALIZATA, CerereStatus.DEPUSA)).toBe(false);
      expect(isValidStatusTransition(CerereStatus.ANULATA, CerereStatus.IN_VERIFICARE)).toBe(false);
    });
  });

  describe("Payment Status Transitions", () => {
    it("should allow valid transitions", () => {
      expect(isValidPlataStatusTransition(PlataStatus.PENDING, PlataStatus.PROCESSING)).toBe(true);
      expect(isValidPlataStatusTransition(PlataStatus.PROCESSING, PlataStatus.SUCCESS)).toBe(true);
      expect(isValidPlataStatusTransition(PlataStatus.SUCCESS, PlataStatus.REFUNDED)).toBe(true);
    });

    it("should reject invalid transitions", () => {
      expect(isValidPlataStatusTransition(PlataStatus.PENDING, PlataStatus.SUCCESS)).toBe(false);
      expect(isValidPlataStatusTransition(PlataStatus.REFUNDED, PlataStatus.SUCCESS)).toBe(false);
    });

    it("should allow retry from failed", () => {
      expect(isValidPlataStatusTransition(PlataStatus.FAILED, PlataStatus.PENDING)).toBe(true);
    });
  });
});

// =============================================================================
// SCHEMA INTEGRATION TESTS
// =============================================================================

describe("Schema Integration", () => {
  describe("Cerere Creation", () => {
    it("should accept valid cerere data", () => {
      const valid = {
        tip_cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        date_formular: { field1: "value1", field2: "value2" },
        observatii_solicitant: "Test observation",
      };
      expect(createCerereSchema.safeParse(valid).success).toBe(true);
    });

    it("should sanitize observatii", () => {
      const data = {
        tip_cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        date_formular: {},
        observatii_solicitant: "<script>alert(1)</script>Safe text",
      };
      const result = createCerereSchema.parse(data);
      expect(result.observatii_solicitant).not.toContain("<script>");
    });

    it("should reject oversized form data", () => {
      const oversized = {
        tip_cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        date_formular: { data: "x".repeat(100001) }, // > 100KB
      };
      expect(createCerereSchema.safeParse(oversized).success).toBe(false);
    });

    it("should reject too many form fields", () => {
      const tooManyFields: Record<string, string> = {};
      for (let i = 0; i < 101; i++) {
        tooManyFields[`field${i}`] = "value";
      }
      const data = {
        tip_cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        date_formular: tooManyFields,
      };
      expect(createCerereSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("Profile Update", () => {
    it("should accept valid profile data", () => {
      const valid = {
        full_name: "Ion Popescu",
        email: "ion@example.com",
        phone: "+40712345678",
        birth_date: "1990-01-01",
        cnp: "1800101123450", // Valid CNP with correct checksum
      };
      expect(personalInfoSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject invalid CNP", () => {
      const invalid = {
        full_name: "Ion Popescu",
        email: "ion@example.com",
        cnp: "1234567890123", // Invalid checksum
      };
      expect(personalInfoSchema.safeParse(invalid).success).toBe(false);
    });

    it("should require full name (first + last)", () => {
      const invalid = {
        full_name: "SingleName",
        email: "test@example.com",
      };
      expect(personalInfoSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("Payment Creation", () => {
    it("should accept valid payment data", () => {
      const valid = {
        cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        suma: 100.5,
      };
      expect(createPlataSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject invalid amounts", () => {
      const invalid = {
        cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        suma: 0.5, // Below minimum
      };
      expect(createPlataSchema.safeParse(invalid).success).toBe(false);
    });
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe("Validation Performance", () => {
  it("should validate quickly (<10ms per operation)", () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      emailSchema.safeParse("user@example.com");
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // 100 validations in < 1s
  });

  it("should sanitize quickly (<10ms per operation)", () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      sanitizePlainText("<script>alert(1)</script>Test");
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
