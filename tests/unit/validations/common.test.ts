/**
 * Unit Tests for Common Validation Schemas
 *
 * Tests: emailSchema, phoneSchema, cnpSchema, passwordSchema,
 *        amountSchema, ibanSchema, uuidSchema, calculatePasswordStrength
 */

import {
  emailSchema,
  phoneSchema,
  cnpSchema,
  passwordSchema,
  amountSchema,
  ibanSchema,
  uuidSchema,
  postalCodeSchema,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
} from "@/lib/validations/common";

describe("Common Validation Schemas", () => {
  describe("emailSchema", () => {
    it("accepts valid email addresses", () => {
      expect(() => emailSchema.parse("user@example.com")).not.toThrow();
      expect(() => emailSchema.parse("test.user@domain.org")).not.toThrow();
    });

    it("normalizes email to lowercase", () => {
      const result = emailSchema.parse("User@Example.COM");
      expect(result).toBe("user@example.com");
    });

    it("trims whitespace", () => {
      const result = emailSchema.parse("  user@example.com  ");
      expect(result).toBe("user@example.com");
    });

    it("rejects email without TLD", () => {
      const result = emailSchema.safeParse("user@localhost");
      expect(result.success).toBe(false);
    });

    it("rejects email with consecutive dots", () => {
      const result = emailSchema.safeParse("user@example..com");
      expect(result.success).toBe(false);
    });

    it("rejects empty string", () => {
      const result = emailSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });

  describe("phoneSchema", () => {
    it("accepts +40 format", () => {
      const result = phoneSchema.parse("+40712345678");
      expect(result).toBe("+40712345678");
    });

    it("accepts 07 format and normalizes to +40", () => {
      const result = phoneSchema.parse("0712345678");
      expect(result).toBe("+4712345678");
    });

    it("rejects too short number", () => {
      const result = phoneSchema.safeParse("071234");
      expect(result.success).toBe(false);
    });

    it("rejects number with letters", () => {
      const result = phoneSchema.safeParse("07abc12345");
      expect(result.success).toBe(false);
    });

    it("rejects non-Romanian prefix", () => {
      const result = phoneSchema.safeParse("+33612345678");
      expect(result.success).toBe(false);
    });
  });

  describe("cnpSchema", () => {
    it("accepts valid 13-digit CNP with correct checksum", () => {
      // Build a valid CNP: S=1, AA=90, LL=01, ZZ=15, JJ=01, NNN=234
      // Compute checksum for 1900115012340
      const partial = "190011501234";
      const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(partial[i]!) * weights[i]!;
      }
      const checksum = sum % 11 === 10 ? 1 : sum % 11;
      const validCnp = partial + checksum.toString();

      expect(() => cnpSchema.parse(validCnp)).not.toThrow();
    });

    it("rejects CNP with wrong length", () => {
      const result = cnpSchema.safeParse("12345");
      expect(result.success).toBe(false);
    });

    it("rejects CNP with wrong checksum digit", () => {
      // Take a valid partial and append wrong checksum
      const partial = "190011501234";
      const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(partial[i]!) * weights[i]!;
      }
      const correctChecksum = sum % 11 === 10 ? 1 : sum % 11;
      const wrongChecksum = (correctChecksum + 1) % 10;
      const invalidCnp = partial + wrongChecksum.toString();

      const result = cnpSchema.safeParse(invalidCnp);
      expect(result.success).toBe(false);
    });

    it("rejects CNP starting with 0", () => {
      const result = cnpSchema.safeParse("0900115012345");
      expect(result.success).toBe(false);
    });
  });

  describe("passwordSchema", () => {
    it("accepts password meeting all requirements", () => {
      expect(() => passwordSchema.parse("MyP@ssw0rd")).not.toThrow();
    });

    it("rejects password too short", () => {
      const result = passwordSchema.safeParse("Ab1!");
      expect(result.success).toBe(false);
    });

    it("rejects password missing uppercase", () => {
      const result = passwordSchema.safeParse("mypassw0rd!");
      expect(result.success).toBe(false);
    });

    it("rejects password missing number", () => {
      const result = passwordSchema.safeParse("MyPassword!");
      expect(result.success).toBe(false);
    });

    it("rejects password missing special character", () => {
      const result = passwordSchema.safeParse("MyPassw0rd");
      expect(result.success).toBe(false);
    });

    it("rejects password missing lowercase", () => {
      const result = passwordSchema.safeParse("MYPASSW0RD!");
      expect(result.success).toBe(false);
    });
  });

  describe("amountSchema", () => {
    it("accepts valid positive amount", () => {
      expect(() => amountSchema.parse(50.0)).not.toThrow();
    });

    it("accepts minimum amount (1 RON)", () => {
      expect(() => amountSchema.parse(1)).not.toThrow();
    });

    it("accepts maximum amount (1,000,000 RON)", () => {
      expect(() => amountSchema.parse(1000000)).not.toThrow();
    });

    it("rejects zero", () => {
      const result = amountSchema.safeParse(0);
      expect(result.success).toBe(false);
    });

    it("rejects negative amount", () => {
      const result = amountSchema.safeParse(-10);
      expect(result.success).toBe(false);
    });

    it("rejects amount below minimum", () => {
      const result = amountSchema.safeParse(0.5);
      expect(result.success).toBe(false);
    });
  });

  describe("ibanSchema", () => {
    it("accepts valid Romanian IBAN format", () => {
      expect(() => ibanSchema.parse("RO49AAAA1231007593840000")).not.toThrow();
    });

    it("rejects IBAN too short", () => {
      const result = ibanSchema.safeParse("RO49AAAA");
      expect(result.success).toBe(false);
    });

    it("rejects IBAN with wrong country prefix", () => {
      const result = ibanSchema.safeParse("DE49AAAA1231007593840000");
      expect(result.success).toBe(false);
    });
  });

  describe("uuidSchema", () => {
    it("accepts valid UUID", () => {
      expect(() => uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000")).not.toThrow();
    });

    it("rejects random string", () => {
      const result = uuidSchema.safeParse("not-a-uuid");
      expect(result.success).toBe(false);
    });

    it("rejects empty string", () => {
      const result = uuidSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });

  describe("postalCodeSchema", () => {
    it("accepts valid 6-digit postal code", () => {
      expect(() => postalCodeSchema.parse("010101")).not.toThrow();
    });

    it("rejects postal code with letters", () => {
      const result = postalCodeSchema.safeParse("01010A");
      expect(result.success).toBe(false);
    });

    it("rejects too short postal code", () => {
      const result = postalCodeSchema.safeParse("0101");
      expect(result.success).toBe(false);
    });
  });

  describe("calculatePasswordStrength", () => {
    it("returns low score for weak password", () => {
      const strength = calculatePasswordStrength("abc");
      expect(strength).toBeLessThanOrEqual(1);
    });

    it("returns high score for strong password", () => {
      const strength = calculatePasswordStrength("MyStr0ng!Pass");
      expect(strength).toBeGreaterThanOrEqual(3);
    });

    it("returns max 4", () => {
      const strength = calculatePasswordStrength("VeryStr0ng!P@ssword2024");
      expect(strength).toBeLessThanOrEqual(4);
    });
  });

  describe("getPasswordStrengthLabel", () => {
    it("returns Slaba for score 0", () => {
      expect(getPasswordStrengthLabel(0)).toBe("Slabă");
    });

    it("returns Medie for score 2", () => {
      expect(getPasswordStrengthLabel(2)).toBe("Medie");
    });

    it("returns Puternica for score 3", () => {
      expect(getPasswordStrengthLabel(3)).toBe("Puternică");
    });

    it("returns Foarte puternica for score 4", () => {
      expect(getPasswordStrengthLabel(4)).toBe("Foarte puternică");
    });
  });
});
