import { GET } from "@/app/api/localitati/route";
import { NextRequest } from "next/server";
import type { ApiResponse, ApiErrorResponse, Localitate } from "@/types/api";

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock data in alphabetical order (matching database ORDER BY nume)
const mockLocalitati: Localitate[] = [
  {
    id: 3,
    judet_id: 1,
    nume: "Abrud",
    slug: "abrud",
    tip: "Comună",
    populatie: 5000,
    cod_siruta: "1003",
  },
  {
    id: 1,
    judet_id: 1,
    nume: "Alba Iulia",
    slug: "alba-iulia",
    tip: "Municipiu",
    populatie: 65000,
    cod_siruta: "1001",
  },
  {
    id: 2,
    judet_id: 1,
    nume: "Sebeș",
    slug: "sebes",
    tip: "Oraș",
    populatie: 27000,
    cod_siruta: "1002",
  },
];

describe("GET /api/localitati", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockLocalitati,
        error: null,
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockSupabase);
  });

  it("should return 400 error when judet_id is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiErrorResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toContain("judet_id");
    expect(data.error.details?.field).toBe("judet_id");
  });

  it("should return 400 error when judet_id is not a valid number", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=invalid");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiErrorResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toContain("număr pozitiv");
  });

  it("should return 400 error when judet_id is negative", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=-1");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiErrorResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return localități for a valid județ", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiResponse<Localitate[]>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.meta?.timestamp).toBeDefined();
    expect(data.meta?.version).toBe("1.0");

    // Verify Supabase query was called correctly
    expect(mockSupabase.from).toHaveBeenCalledWith("localitati");
    expect(mockSupabase.select).toHaveBeenCalledWith(
      "id, judet_id, nume, slug, tip, populatie, cod_siruta"
    );
    expect(mockSupabase.eq).toHaveBeenCalledWith("judet_id", 1);
    expect(mockSupabase.order).toHaveBeenCalledWith("nume", {
      ascending: true,
    });
  });

  it("should filter localități by search query", async () => {
    const filteredData = [mockLocalitati[1]]; // Only "Alba Iulia"
    mockSupabase.order.mockResolvedValue({
      data: filteredData,
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1&search=alba");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiResponse<Localitate[]>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].nume).toBe("Alba Iulia");

    // Verify ILIKE was called with search pattern
    expect(mockSupabase.ilike).toHaveBeenCalledWith("nume", "%alba%");
  });

  it("should filter localități by tip", async () => {
    const filteredData = [mockLocalitati[1]]; // Only "Municipiu"
    mockSupabase.order.mockResolvedValue({
      data: filteredData,
      error: null,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/localitati?judet_id=1&tip=Municipiu"
    );

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiResponse<Localitate[]>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].tip).toBe("Municipiu");

    // Verify eq was called twice (judet_id and tip)
    expect(mockSupabase.eq).toHaveBeenCalledWith("judet_id", 1);
    expect(mockSupabase.eq).toHaveBeenCalledWith("tip", "Municipiu");
  });

  it("should return localități sorted alphabetically by nume", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiResponse<Localitate[]>;

    const names = data.data.map((l) => l.nume);

    // Verify specific ordering for key examples
    const abrudIndex = names.indexOf("Abrud");
    const albaIndex = names.indexOf("Alba Iulia");
    const sebesIndex = names.indexOf("Sebeș");

    expect(abrudIndex).toBeLessThan(albaIndex);
    expect(albaIndex).toBeLessThan(sebesIndex);

    // Verify the data matches the mock order exactly
    expect(names).toEqual(mockLocalitati.map((l) => l.nume));
  });

  it("should return all required fields for each localitate", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiResponse<Localitate[]>;

    data.data.forEach((localitate) => {
      expect(localitate).toHaveProperty("id");
      expect(localitate).toHaveProperty("judet_id");
      expect(localitate).toHaveProperty("nume");
      expect(localitate).toHaveProperty("slug");
      expect(localitate).toHaveProperty("tip");
      expect(localitate).toHaveProperty("populatie");
      expect(localitate).toHaveProperty("cod_siruta");
    });
  });

  it("should include Cache-Control headers", async () => {
    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1");

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  });

  it("should handle database errors", async () => {
    mockSupabase.order.mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
    });

    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiErrorResponse;

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("DATABASE_ERROR");
    expect(data.error.message).toContain("localităților");
  });

  it("should handle unexpected errors", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@/lib/supabase/server");
    createClient.mockRejectedValue(new Error("Unexpected error"));

    const request = new NextRequest("http://localhost:3000/api/localitati?judet_id=1");

    const response = await GET(request);
    const json = await response.json();
    const data = json as ApiErrorResponse;

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INTERNAL_ERROR");
  });
});
