/**
 * Unit Tests for Profile Validation Schemas
 *
 * Tests: personalInfoSchema, passwordChangeSchema,
 *        notificationPreferencesSchema, addressSchema
 */

import {
  personalInfoSchema,
  passwordChangeSchema,
  notificationPreferencesSchema,
  addressSchema,
} from "@/lib/validations/profile";

describe("Profile Validation Schemas", () => {
  describe("personalInfoSchema", () => {
    it("accepts valid profile data", () => {
      const validData = {
        full_name: "Ion Popescu",
        email: "ion@example.com",
      };
      expect(() => personalInfoSchema.parse(validData)).not.toThrow();
    });

    it("rejects missing full_name", () => {
      const result = personalInfoSchema.safeParse({
        email: "ion@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("rejects single-word name (requires first + last)", () => {
      const result = personalInfoSchema.safeParse({
        full_name: "Ion",
        email: "ion@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing email", () => {
      const result = personalInfoSchema.safeParse({
        full_name: "Ion Popescu",
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional phone and cnp", () => {
      const validData = {
        full_name: "Ion Popescu",
        email: "ion@example.com",
        phone: "",
        cnp: "",
      };
      expect(() => personalInfoSchema.parse(validData)).not.toThrow();
    });
  });

  describe("passwordChangeSchema", () => {
    it("accepts valid password change", () => {
      const validData = {
        current_password: "OldP@ssw0rd",
        new_password: "NewP@ssw0rd",
        confirm_password: "NewP@ssw0rd",
      };
      expect(() => passwordChangeSchema.parse(validData)).not.toThrow();
    });

    it("rejects non-matching passwords", () => {
      const result = passwordChangeSchema.safeParse({
        current_password: "OldP@ssw0rd",
        new_password: "NewP@ssw0rd",
        confirm_password: "Different1!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects weak new password", () => {
      const result = passwordChangeSchema.safeParse({
        current_password: "OldP@ssw0rd",
        new_password: "weak",
        confirm_password: "weak",
      });
      expect(result.success).toBe(false);
    });

    it("rejects when new password equals current", () => {
      const result = passwordChangeSchema.safeParse({
        current_password: "SameP@ss1!",
        new_password: "SameP@ss1!",
        confirm_password: "SameP@ss1!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("notificationPreferencesSchema", () => {
    it("accepts valid boolean flags without SMS", () => {
      const validData = {
        sms_notifications_enabled: false,
      };
      expect(() => notificationPreferencesSchema.parse(validData)).not.toThrow();
    });

    it("accepts SMS enabled with phone", () => {
      const validData = {
        sms_notifications_enabled: true,
        telefon: "0712345678",
      };
      expect(() => notificationPreferencesSchema.parse(validData)).not.toThrow();
    });

    it("rejects SMS enabled without phone", () => {
      const result = notificationPreferencesSchema.safeParse({
        sms_notifications_enabled: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("addressSchema", () => {
    it("accepts valid Romanian address", () => {
      const validData = {
        strada: "Strada Principala",
        numar: "42",
        localitate: "Cluj-Napoca",
        judet: "Cluj",
      };
      expect(() => addressSchema.parse(validData)).not.toThrow();
    });

    it("accepts address with optional fields", () => {
      const validData = {
        strada: "Strada Principala",
        numar: "42",
        bloc: "A1",
        scara: "B",
        etaj: "3",
        apartament: "12",
        cod_postal: "400001",
        localitate: "Cluj-Napoca",
        judet: "Cluj",
      };
      expect(() => addressSchema.parse(validData)).not.toThrow();
    });

    it("rejects missing required street", () => {
      const result = addressSchema.safeParse({
        numar: "42",
        localitate: "Cluj-Napoca",
        judet: "Cluj",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid postal code", () => {
      const result = addressSchema.safeParse({
        strada: "Strada Principala",
        numar: "42",
        cod_postal: "1234",
        localitate: "Cluj-Napoca",
        judet: "Cluj",
      });
      expect(result.success).toBe(false);
    });
  });
});
