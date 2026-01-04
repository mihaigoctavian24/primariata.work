import { POST as signDocument } from "@/app/api/mock-certsign/sign/route";
import { POST as batchSignDocuments } from "@/app/api/mock-certsign/sign/batch/route";
import { GET as getCertificates } from "@/app/api/mock-certsign/certificates/[cnp]/route";
import { POST as validateCertificate } from "@/app/api/mock-certsign/certificates/validate/route";
import { GET as verifySignature } from "@/app/api/mock-certsign/verify/[transactionId]/route";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";
import { NextRequest } from "next/server";
import { PDFDocument } from "pdf-lib";

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    setAll: jest.fn(),
  })),
}));

// Mock pdf-lib
jest.mock("pdf-lib");

// Mock PDF utility functions
jest.mock("@/lib/pdf/signature-watermark", () => ({
  addSignatureWatermark: jest.fn().mockResolvedValue(undefined),
  validateSignatureOptions: jest.fn().mockReturnValue({ valid: true }),
}));

describe("Signature Integration Tests", () => {
  // ✅ Fixed: Using valid UUID format for all IDs
  const mockUser = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "test@example.com",
  };

  const mockCertificate = {
    id: "550e8400-e29b-41d4-a716-446655440005",
    user_name: "Ion Popescu",
    cnp: "1234567890123",
    certificate_serial: "CERT-2025-001",
    status: "active",
    valid_from: "2024-01-01T00:00:00Z",
    valid_until: "2026-12-31T23:59:59Z",
    is_mock: true,
  };

  const mockCerere = {
    id: "550e8400-e29b-41d4-a716-446655440003",
    primarie_id: "550e8400-e29b-41d4-a716-446655440002",
    numar_inregistrare: "CER-2025-001",
  };

  const mockDocumentUrl = `https://example.com/storage/v1/object/public/documents/${mockCerere.primarie_id}/cereri/${mockCerere.id}/document.pdf`;

  const mockSignatureAudit = {
    transaction_id: "MOCK-SIG-12345",
    cerere_id: mockCerere.id,
    primarie_id: mockCerere.primarie_id,
    signer_name: mockCertificate.user_name,
    signer_cnp: mockCertificate.cnp,
    certificate_serial: mockCertificate.certificate_serial,
    document_url: mockDocumentUrl,
    signed_document_url: mockDocumentUrl.replace(".pdf", "_signed.pdf"),
    timestamp: "2025-01-01T10:00:00Z",
    algorithm: "SHA256withRSA",
    status: "success",
    is_mock: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock PDFDocument.load
    (PDFDocument.load as jest.Mock).mockResolvedValue({
      save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/mock-certsign/sign - Single Document Signature", () => {
    it("should sign document successfully", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "mock_certificates") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCertificate,
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "cereri") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCerere,
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "signature_audit_log") {
            return {
              insert: jest.fn().mockResolvedValue({
                error: null,
              }),
            };
          }
          return mockSupabase;
        }),
        storage: {
          from: jest.fn().mockReturnValue({
            download: jest.fn().mockResolvedValue({
              data: new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" }),
              error: null,
            }),
            upload: jest.fn().mockResolvedValue({
              data: { path: "signed/document.pdf" },
              error: null,
            }),
            getPublicUrl: jest.fn().mockReturnValue({
              data: { publicUrl: mockSignatureAudit.signed_document_url },
            }),
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/mock-certsign/sign", {
        method: "POST",
        body: JSON.stringify({
          document_url: mockDocumentUrl,
          cerere_id: mockCerere.id,
          cnp: mockCertificate.cnp,
          signature_reason: "Aprobare cerere",
        }),
      });

      const response = await signDocument(request);
      const json = await response.json();
      const data = json as ApiResponse<{
        signed_document_url: string;
        transaction_id: string;
        timestamp: string;
        certificate_serial: string;
        signer_name: string;
      }>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.signed_document_url).toBeTruthy();
      expect(data.data.transaction_id).toContain("MOCK-SIG");
      expect(data.data.certificate_serial).toBe(mockCertificate.certificate_serial);
      expect(data.data.signer_name).toBe(mockCertificate.user_name);
    });

    it("should reject signature with invalid CNP", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/mock-certsign/sign", {
        method: "POST",
        body: JSON.stringify({
          document_url: mockDocumentUrl,
          cerere_id: mockCerere.id,
          cnp: "12345", // Invalid CNP (not 13 digits)
        }),
      });

      const response = await signDocument(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_CNP");
    });

    it("should reject signature with certificate not found", async () => {
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
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/mock-certsign/sign", {
        method: "POST",
        body: JSON.stringify({
          document_url: mockDocumentUrl,
          cerere_id: mockCerere.id,
          cnp: "1234567890123",
        }),
      });

      const response = await signDocument(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CERTIFICATE_NOT_FOUND");
    });

    it("should reject signature with expired certificate", async () => {
      const expiredCertificate = {
        ...mockCertificate,
        valid_until: "2020-12-31T23:59:59Z", // Expired
      };

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
              single: jest.fn().mockResolvedValue({
                data: expiredCertificate,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/mock-certsign/sign", {
        method: "POST",
        body: JSON.stringify({
          document_url: mockDocumentUrl,
          cerere_id: mockCerere.id,
          cnp: mockCertificate.cnp,
        }),
      });

      const response = await signDocument(request);
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CERTIFICATE_INVALID");
    });
  });

  describe("GET /api/mock-certsign/certificates/[cnp] - Get Certificates", () => {
    it("should retrieve user certificates", async () => {
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
              single: jest.fn().mockResolvedValue({
                data: mockCertificate,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest(
        "http://localhost:3000/api/mock-certsign/certificates/1234567890123"
      );

      const response = await getCertificates(request, { params: { cnp: "1234567890123" } });
      const json = await response.json();
      const data = json as ApiResponse<{ certificate: unknown }>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.certificate).toBeDefined();
      expect((data.data.certificate as typeof mockCertificate).cnp).toBe("1234567890123");
    });

    it("should reject invalid CNP format", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/mock-certsign/certificates/12345");

      const response = await getCertificates(request, { params: { cnp: "12345" } });
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_CNP");
    });
  });

  describe("POST /api/mock-certsign/certificates/validate - Validate Certificate", () => {
    it("should validate active certificate", async () => {
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
              single: jest.fn().mockResolvedValue({
                data: mockCertificate,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest(
        "http://localhost:3000/api/mock-certsign/certificates/validate",
        {
          method: "POST",
          body: JSON.stringify({
            cnp: mockCertificate.cnp,
          }),
        }
      );

      const response = await validateCertificate(request);
      const json = await response.json();
      const data = json as ApiResponse<{
        valid: boolean;
        certificate_serial: string;
        holder_name: string;
      }>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.certificate_serial).toBe(mockCertificate.certificate_serial);
    });

    it("should reject expired certificate", async () => {
      const expiredCertificate = {
        ...mockCertificate,
        status: "expired",
        valid_until: "2020-12-31T23:59:59Z",
      };

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
              single: jest.fn().mockResolvedValue({
                data: expiredCertificate,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest(
        "http://localhost:3000/api/mock-certsign/certificates/validate",
        {
          method: "POST",
          body: JSON.stringify({
            cnp: expiredCertificate.cnp,
          }),
        }
      );

      const response = await validateCertificate(request);
      const json = await response.json();
      const data = json as ApiResponse<{ valid: boolean; reason: string }>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(false);
      expect(data.data.reason).toContain("expirat");
    });
  });

  describe("GET /api/mock-certsign/verify/[transactionId] - Verify Signature", () => {
    it("should verify signature successfully", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((tableName: string) => {
          if (tableName === "signature_audit_log") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockSignatureAudit,
                    error: null,
                  }),
                }),
              }),
            };
          } else if (tableName === "mock_certificates") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCertificate,
                    error: null,
                  }),
                }),
              }),
            };
          }
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest(
        `http://localhost:3000/api/mock-certsign/verify/${mockSignatureAudit.transaction_id}`
      );

      const response = await verifySignature(request, {
        params: { transactionId: mockSignatureAudit.transaction_id },
      });
      const json = await response.json();
      const data = json as ApiResponse<{ is_valid: boolean; signature: unknown }>;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.is_valid).toBe(true);
      expect(data.data.signature).toBeTruthy();
    });

    it("should return not found for invalid transaction ID", async () => {
      const invalidTxnId = "MOCK-SIG-99999"; // Valid format but doesn't exist

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
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new NextRequest(
        `http://localhost:3000/api/mock-certsign/verify/${invalidTxnId}`
      );

      const response = await verifySignature(request, { params: { transactionId: invalidTxnId } });
      const json = await response.json();
      const data = json as ApiErrorResponse;

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("SIGNATURE_NOT_FOUND");
    });
  });

  describe("Full Signature Workflow Integration", () => {
    it("should complete full signature lifecycle", async () => {
      // Step 1: Get certificates
      let mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockCertificate,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const getCertRequest = new NextRequest(
        `http://localhost:3000/api/mock-certsign/certificates/${mockCertificate.cnp}`
      );

      const getCertResponse = await getCertificates(getCertRequest, {
        params: { cnp: mockCertificate.cnp },
      });
      const getCertJson = await getCertResponse.json();

      expect(getCertResponse.status).toBe(200);
      expect(getCertJson.success).toBe(true);

      // Step 2: Validate certificate
      mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockCertificate,
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const validateRequest = new NextRequest(
        "http://localhost:3000/api/mock-certsign/certificates/validate",
        {
          method: "POST",
          body: JSON.stringify({
            cnp: mockCertificate.cnp,
          }),
        }
      );

      const validateResponse = await validateCertificate(validateRequest);
      const validateJson = await validateResponse.json();

      expect(validateResponse.status).toBe(200);
      expect(validateJson.success).toBe(true);
      expect(validateJson.data.valid).toBe(true);

      // Step 3: Sign document
      mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "mock_certificates") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCertificate,
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "cereri") {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCerere,
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "signature_audit_log") {
            return {
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase;
        }),
        storage: {
          from: jest.fn().mockReturnValue({
            download: jest.fn().mockResolvedValue({
              data: new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" }),
              error: null,
            }),
            upload: jest.fn().mockResolvedValue({
              data: { path: "signed/document.pdf" },
              error: null,
            }),
            getPublicUrl: jest.fn().mockReturnValue({
              data: { publicUrl: mockSignatureAudit.signed_document_url },
            }),
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const signRequest = new NextRequest("http://localhost:3000/api/mock-certsign/sign", {
        method: "POST",
        body: JSON.stringify({
          document_url: mockDocumentUrl,
          cerere_id: mockCerere.id,
          cnp: mockCertificate.cnp,
        }),
      });

      const signResponse = await signDocument(signRequest);
      const signJson = await signResponse.json();

      expect(signResponse.status).toBe(200);
      expect(signJson.success).toBe(true);
      expect(signJson.data.transaction_id).toBeTruthy();

      // Verify complete workflow
      expect(signJson.data.signer_name).toBe(mockCertificate.user_name);
      expect(signJson.data.certificate_serial).toBe(mockCertificate.certificate_serial);
    });
  });
});
