import { POST as createPlata, GET as listPlati } from "@/app/api/plati/route";
import { POST as webhookPlata } from "@/app/api/plati/webhook/route";
import { GET as getPlata } from "@/app/api/plati/[id]/route";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { PlataStatus } from "@/lib/validations/plati";
import type { ApiResponse, ApiErrorResponse, PaginatedResponse } from "@/types/api";
import { NextRequest } from "next/server";
import {
  measureTestOperation,
  printTestMetricsSummary,
  clearTestMetrics,
} from "../../helpers/integration-monitoring";
import { IntegrationType, GhiseulOperation } from "@/lib/monitoring/integrations";

// Mock Supabase clients
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn(),
}));

// Mock Next.js headers/cookies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    setAll: jest.fn(),
  })),
}));

describe("Payment Integration Tests", () => {
  // ✅ Fixed: Using valid UUID format for all IDs
  const mockUser = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "test@example.com",
  };

  const mockPrimarie = {
    id: "550e8400-e29b-41d4-a716-446655440002",
  };

  const mockCerere = {
    id: "550e8400-e29b-41d4-a716-446655440003",
    numar_inregistrare: "CER-2025-001",
    solicitant_id: "550e8400-e29b-41d4-a716-446655440001",
    necesita_plata: true,
    valoare_plata: 150.0,
    plata_efectuata: false,
  };

  const mockPlata = {
    id: "550e8400-e29b-41d4-a716-446655440004",
    primarie_id: "550e8400-e29b-41d4-a716-446655440002",
    cerere_id: "550e8400-e29b-41d4-a716-446655440003",
    utilizator_id: "550e8400-e29b-41d4-a716-446655440001",
    suma: 150.0,
    status: PlataStatus.PENDING,
    transaction_id: "txn-123",
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    printTestMetricsSummary();
    clearTestMetrics();
  });

  describe("POST /api/plati - Create Payment", () => {
    it("should create payment successfully", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockCerere,
                  error: null,
                }),
              }),
            }),
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockPlata,
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock utilizatori query for primarie_id
      mockSupabase.from = jest.fn((table: string) => {
        if (table === "cereri") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCerere,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { primarie_id: mockPrimarie.id },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "plati") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockPlata,
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      // Mock service role client for transaction_id update
      const mockServiceSupabase = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      };
      (createServiceRoleClient as jest.Mock).mockReturnValue(mockServiceSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati", {
        method: "POST",
        body: JSON.stringify({
          cerere_id: mockCerere.id,
          suma: 150.0,
          return_url: `http://localhost:3000/app/cereri/${mockCerere.id}`,
        }),
      });

      // Track response time
      const response = await measureTestOperation(
        IntegrationType.GHISEUL,
        GhiseulOperation.CREATE_PAYMENT,
        () => createPlata(request)
      );
      const json = await response.json();
      const data = json as ApiResponse<{ plata_id: string; redirect_url: string }>;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.plata_id).toBe(mockPlata.id);
      // Redirect URL should point to payment gateway checkout
      expect(data.data.redirect_url).toContain("/api/payments/ghiseul-mock/checkout");
      expect(data.data.redirect_url).toContain("transaction_id=");
    });

    it("should reject unauthorized requests", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Not authenticated" },
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati", {
        method: "POST",
        body: JSON.stringify({
          cerere_id: mockCerere.id,
          suma: 150.0,
        }),
      });

      const response = await createPlata(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject payment for already paid cerere", async () => {
      const paidCerere = { ...mockCerere, plata_efectuata: true };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: paidCerere,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati", {
        method: "POST",
        body: JSON.stringify({
          cerere_id: mockCerere.id,
          suma: 150.0,
        }),
      });

      const response = await createPlata(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ALREADY_PAID");
    });

    it("should reject invalid payment amount", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockCerere,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati", {
        method: "POST",
        body: JSON.stringify({
          cerere_id: mockCerere.id,
          suma: 100.0, // Wrong amount
        }),
      });

      const response = await createPlata(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_AMOUNT");
    });
  });

  describe("POST /api/plati/webhook - Payment Webhook", () => {
    it("should process successful payment webhook", async () => {
      const mockSupabase = {
        from: jest.fn((table: string) => {
          if (table === "plati") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockPlata,
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            };
          }
          if (table === "cereri") {
            return {
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            };
          }
          if (table === "chitante") {
            return {
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: "chitanta-123",
                      plata_id: mockPlata.id,
                      numar_chitanta: "CHT-2025-001",
                      pdf_url: `/storage/chitante/${mockPlata.id}.pdf`,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return mockSupabase;
        }),
      };

      (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati/webhook", {
        method: "POST",
        body: JSON.stringify({
          transaction_id: "txn-123",
          status: PlataStatus.SUCCESS,
          gateway_response: { message: "Payment successful" },
          metoda_plata: "card",
        }),
      });

      const response = await webhookPlata(request);
      const json = await response.json();
      const data = json as ApiResponse<{ message: string; plata_id: string }>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.plata_id).toBe(mockPlata.id);
    });

    it("should reject webhook for finalized payment", async () => {
      const finalizedPlata = { ...mockPlata, status: PlataStatus.SUCCESS };

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: finalizedPlata,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati/webhook", {
        method: "POST",
        body: JSON.stringify({
          transaction_id: "txn-123",
          status: PlataStatus.FAILED,
          gateway_response: {},
        }),
      });

      const response = await webhookPlata(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("PAYMENT_FINALIZED");
    });

    it("should handle payment not found", async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      };

      (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/plati/webhook", {
        method: "POST",
        body: JSON.stringify({
          transaction_id: "invalid-txn",
          status: PlataStatus.SUCCESS,
          gateway_response: {},
        }),
      });

      const response = await webhookPlata(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("PAYMENT_NOT_FOUND");
    });
  });

  describe("GET /api/plati - List Payments", () => {
    it("should list user payments with pagination", async () => {
      const mockPlatiList = [mockPlata, { ...mockPlata, id: "plata-456", suma: 200.0 }];

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({
              data: mockPlatiList,
              error: null,
              count: 2,
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest(
        "http://localhost:3000/api/plati?page=1&limit=20&status=pending"
      );

      const response = await listPlati(request);
      const json = await response.json();
      const data = json as PaginatedResponse<unknown>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(20);
      expect(data.data.pagination.total).toBe(2);
    });
  });

  describe("Full Payment Workflow Integration", () => {
    it("should complete full payment lifecycle", async () => {
      // Step 1: Create payment
      const createMockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "cereri") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockCerere,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "utilizatori") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { primarie_id: mockPrimarie.id },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "plati") {
            return {
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockPlata,
                    error: null,
                  }),
                }),
              }),
            };
          }
          return createMockSupabase;
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(createMockSupabase);

      // Mock service role client for transaction_id update
      const mockServiceSupabase = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      };
      (createServiceRoleClient as jest.Mock).mockReturnValue(mockServiceSupabase);

      const createRequest = new NextRequest("http://localhost:3000/api/plati", {
        method: "POST",
        body: JSON.stringify({
          cerere_id: mockCerere.id,
          suma: 150.0,
        }),
      });

      const createResponse = await createPlata(createRequest);
      const createJson = await createResponse.json();
      const createData = createJson as ApiResponse<{ plata_id: string; redirect_url: string }>;

      expect(createResponse.status).toBe(201);
      expect(createData.success).toBe(true);

      // Step 2: Process webhook (payment success)
      const webhookMockSupabase = {
        from: jest.fn((table: string) => {
          if (table === "plati") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockPlata,
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          if (table === "cereri") {
            return {
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          if (table === "chitante") {
            return {
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: "chitanta-123",
                      plata_id: mockPlata.id,
                      numar_chitanta: "CHT-2025-001",
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return webhookMockSupabase;
        }),
      };

      (createServiceRoleClient as jest.Mock).mockReturnValue(webhookMockSupabase);

      const webhookRequest = new NextRequest("http://localhost:3000/api/plati/webhook", {
        method: "POST",
        body: JSON.stringify({
          transaction_id: mockPlata.transaction_id,
          status: PlataStatus.SUCCESS,
          gateway_response: { message: "Success" },
          metoda_plata: "card",
        }),
      });

      const webhookResponse = await webhookPlata(webhookRequest);
      const webhookJson = await webhookResponse.json();
      const webhookData = webhookJson as ApiResponse<{ message: string; plata_id: string }>;

      expect(webhookResponse.status).toBe(200);
      expect(webhookData.success).toBe(true);

      // Verify complete workflow
      expect(createData.data.plata_id).toBe(mockPlata.id);
      expect(webhookData.data.plata_id).toBe(mockPlata.id);
    });
  });
});
