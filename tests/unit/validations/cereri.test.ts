/**
 * Unit Tests for Cereri Validation Schemas
 *
 * Tests: createCerereSchema, updateCerereSchema, listCereriQuerySchema,
 *        isValidStatusTransition, canModifyCerere, canCancelCerere, canSubmitCerere
 */

// Mock the sanitize module since it may have DOM dependencies
jest.mock("@/lib/security/sanitize", () => ({
  sanitizeJsonObject: jest.fn((data: unknown) => data),
}));

import {
  createCerereSchema,
  updateCerereSchema,
  listCereriQuerySchema,
  isValidStatusTransition,
  canModifyCerere,
  canCancelCerere,
  canSubmitCerere,
  CerereStatus,
} from "@/lib/validations/cereri";

describe("Cereri Validation Schemas", () => {
  describe("createCerereSchema", () => {
    it("accepts valid cerere data", () => {
      const validData = {
        tip_cerere_id: "550e8400-e29b-41d4-a716-446655440000",
        date_formular: { field1: "value1", field2: "value2" },
        observatii_solicitant: "Some notes",
      };
      expect(() => createCerereSchema.parse(validData)).not.toThrow();
    });

    it("rejects missing tip_cerere_id", () => {
      const result = createCerereSchema.safeParse({
        date_formular: { field1: "value1" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing date_formular", () => {
      const result = createCerereSchema.safeParse({
        tip_cerere_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID for tip_cerere_id", () => {
      const result = createCerereSchema.safeParse({
        tip_cerere_id: "not-a-uuid",
        date_formular: { field1: "value1" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateCerereSchema", () => {
    it("accepts valid partial update", () => {
      const validData = {
        date_formular: { updated_field: "new_value" },
      };
      expect(() => updateCerereSchema.parse(validData)).not.toThrow();
    });

    it("accepts update without date_formular (optional)", () => {
      const validData = {
        observatii_solicitant: "Updated notes",
      };
      expect(() => updateCerereSchema.parse(validData)).not.toThrow();
    });
  });

  describe("listCereriQuerySchema", () => {
    it("accepts valid query params with defaults", () => {
      const result = listCereriQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sort).toBe("created_at");
      expect(result.order).toBe("desc");
    });

    it("accepts explicit valid values", () => {
      const result = listCereriQuerySchema.parse({
        page: "2",
        limit: "50",
        status: "depusa",
        sort: "updated_at",
        order: "asc",
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.status).toBe("depusa");
    });

    it("rejects invalid status value", () => {
      const result = listCereriQuerySchema.safeParse({
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("isValidStatusTransition", () => {
    it("allows depusa -> in_verificare", () => {
      expect(isValidStatusTransition(CerereStatus.DEPUSA, CerereStatus.IN_VERIFICARE)).toBe(true);
    });

    it("disallows depusa -> finalizata (skip states)", () => {
      expect(isValidStatusTransition(CerereStatus.DEPUSA, CerereStatus.FINALIZATA)).toBe(false);
    });

    it("allows in_procesare -> in_aprobare", () => {
      expect(isValidStatusTransition(CerereStatus.IN_PROCESARE, CerereStatus.IN_APROBARE)).toBe(
        true
      );
    });

    it("disallows finalizata -> any (terminal state)", () => {
      expect(isValidStatusTransition(CerereStatus.FINALIZATA, CerereStatus.DEPUSA)).toBe(false);
      expect(isValidStatusTransition(CerereStatus.FINALIZATA, CerereStatus.IN_VERIFICARE)).toBe(
        false
      );
    });

    it("allows depusa -> anulata", () => {
      expect(isValidStatusTransition(CerereStatus.DEPUSA, CerereStatus.ANULATA)).toBe(true);
    });

    it("disallows respinsa -> any (terminal state)", () => {
      expect(isValidStatusTransition(CerereStatus.RESPINSA, CerereStatus.DEPUSA)).toBe(false);
    });
  });

  describe("canModifyCerere", () => {
    it("returns true for depusa", () => {
      expect(canModifyCerere(CerereStatus.DEPUSA)).toBe(true);
    });

    it("returns true for info_suplimentare", () => {
      expect(canModifyCerere(CerereStatus.INFO_SUPLIMENTARE)).toBe(true);
    });

    it("returns false for finalizata", () => {
      expect(canModifyCerere(CerereStatus.FINALIZATA)).toBe(false);
    });

    it("returns false for in_procesare", () => {
      expect(canModifyCerere(CerereStatus.IN_PROCESARE)).toBe(false);
    });
  });

  describe("canCancelCerere", () => {
    it("returns true for depusa", () => {
      expect(canCancelCerere(CerereStatus.DEPUSA)).toBe(true);
    });

    it("returns false for finalizata", () => {
      expect(canCancelCerere(CerereStatus.FINALIZATA)).toBe(false);
    });

    it("returns false for anulata", () => {
      expect(canCancelCerere(CerereStatus.ANULATA)).toBe(false);
    });

    it("returns false for respinsa", () => {
      expect(canCancelCerere(CerereStatus.RESPINSA)).toBe(false);
    });
  });

  describe("canSubmitCerere", () => {
    it("returns true for depusa", () => {
      expect(canSubmitCerere(CerereStatus.DEPUSA)).toBe(true);
    });

    it("returns false for in_verificare", () => {
      expect(canSubmitCerere(CerereStatus.IN_VERIFICARE)).toBe(false);
    });
  });
});
