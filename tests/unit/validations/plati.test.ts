/**
 * Unit Tests for Plati Validation Schemas
 *
 * Tests: createPlataSchema, listPlatiQuerySchema, webhookPlataUpdateSchema,
 *        canRetryPlata, isValidPlataStatusTransition
 */

// Mock the sanitize module
jest.mock("@/lib/security/sanitize", () => ({
  sanitizeJsonObject: jest.fn((data: unknown) => data),
}));

import {
  createPlataSchema,
  listPlatiQuerySchema,
  webhookPlataUpdateSchema,
  canRetryPlata,
  isValidPlataStatusTransition,
  PlataStatus,
} from "@/lib/validations/plati";

describe("Plati Validation Schemas", () => {
  describe("createPlataSchema", () => {
    it("accepts valid payment data", () => {
      const validData = {
        cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        suma: 100.5,
      };
      expect(() => createPlataSchema.parse(validData)).not.toThrow();
    });

    it("rejects missing cerere_id", () => {
      const result = createPlataSchema.safeParse({ suma: 100 });
      expect(result.success).toBe(false);
    });

    it("rejects missing amount", () => {
      const result = createPlataSchema.safeParse({
        cerere_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero amount", () => {
      const result = createPlataSchema.safeParse({
        cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        suma: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative amount", () => {
      const result = createPlataSchema.safeParse({
        cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        suma: -50,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("webhookPlataUpdateSchema", () => {
    it("accepts valid webhook payload", () => {
      const validData = {
        transaction_id: "txn-abc-123",
        status: "success",
      };
      expect(() => webhookPlataUpdateSchema.parse(validData)).not.toThrow();
    });

    it("rejects invalid status", () => {
      const result = webhookPlataUpdateSchema.safeParse({
        transaction_id: "txn-abc-123",
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing transaction_id", () => {
      const result = webhookPlataUpdateSchema.safeParse({
        status: "success",
      });
      expect(result.success).toBe(false);
    });

    it("rejects transaction_id with special characters", () => {
      const result = webhookPlataUpdateSchema.safeParse({
        transaction_id: "txn<script>alert(1)</script>",
        status: "success",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("listPlatiQuerySchema", () => {
    it("accepts valid query with defaults", () => {
      const result = listPlatiQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sort).toBe("created_at");
      expect(result.order).toBe("desc");
    });

    it("accepts explicit valid values", () => {
      const result = listPlatiQuerySchema.parse({
        page: "3",
        limit: "10",
        status: "pending",
        sort: "suma",
        order: "asc",
      });
      expect(result.page).toBe(3);
      expect(result.sort).toBe("suma");
    });

    it("rejects invalid sort field", () => {
      const result = listPlatiQuerySchema.safeParse({
        sort: "invalid_field",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("canRetryPlata", () => {
    it("returns true for failed status", () => {
      expect(canRetryPlata(PlataStatus.FAILED)).toBe(true);
    });

    it("returns false for success status", () => {
      expect(canRetryPlata(PlataStatus.SUCCESS)).toBe(false);
    });

    it("returns false for pending status", () => {
      expect(canRetryPlata(PlataStatus.PENDING)).toBe(false);
    });

    it("returns false for refunded status", () => {
      expect(canRetryPlata(PlataStatus.REFUNDED)).toBe(false);
    });
  });

  describe("isValidPlataStatusTransition", () => {
    it("allows pending -> processing", () => {
      expect(isValidPlataStatusTransition(PlataStatus.PENDING, PlataStatus.PROCESSING)).toBe(true);
    });

    it("allows processing -> success", () => {
      expect(isValidPlataStatusTransition(PlataStatus.PROCESSING, PlataStatus.SUCCESS)).toBe(true);
    });

    it("allows success -> refunded", () => {
      expect(isValidPlataStatusTransition(PlataStatus.SUCCESS, PlataStatus.REFUNDED)).toBe(true);
    });

    it("disallows refunded -> any (terminal)", () => {
      expect(isValidPlataStatusTransition(PlataStatus.REFUNDED, PlataStatus.PENDING)).toBe(false);
    });

    it("allows failed -> pending (retry)", () => {
      expect(isValidPlataStatusTransition(PlataStatus.FAILED, PlataStatus.PENDING)).toBe(true);
    });
  });
});
