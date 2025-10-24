import { GET } from "@/app/api/localitati/judete/route";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Judet } from "@/types/api";

// Mock the Supabase client
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

describe("GET /api/localitati/judete", () => {
  const mockJudete: Judet[] = [
    { id: 1, cod: "AB", nume: "Alba", nume_complet: "Județul Alba" },
    { id: 3, cod: "AR", nume: "Arad", nume_complet: "Județul Arad" },
    { id: 2, cod: "AG", nume: "Argeș", nume_complet: "Județul Argeș" },
    { id: 5, cod: "BC", nume: "Bacău", nume_complet: "Județul Bacău" },
    { id: 6, cod: "BH", nume: "Bihor", nume_complet: "Județul Bihor" },
    { id: 7, cod: "BN", nume: "Bistrița-Năsăud", nume_complet: "Județul Bistrița-Năsăud" },
    { id: 9, cod: "BT", nume: "Botoșani", nume_complet: "Județul Botoșani" },
    { id: 8, cod: "BR", nume: "Brăila", nume_complet: "Județul Brăila" },
    { id: 10, cod: "BV", nume: "Brașov", nume_complet: "Județul Brașov" },
    { id: 4, cod: "B", nume: "București", nume_complet: "Municipiul București" },
    { id: 11, cod: "BZ", nume: "Buzău", nume_complet: "Județul Buzău" },
    { id: 13, cod: "CL", nume: "Călărași", nume_complet: "Județul Călărași" },
    { id: 14, cod: "CS", nume: "Caraș-Severin", nume_complet: "Județul Caraș-Severin" },
    { id: 12, cod: "CJ", nume: "Cluj", nume_complet: "Județul Cluj" },
    { id: 15, cod: "CT", nume: "Constanța", nume_complet: "Județul Constanța" },
    { id: 16, cod: "CV", nume: "Covasna", nume_complet: "Județul Covasna" },
    { id: 17, cod: "DB", nume: "Dâmbovița", nume_complet: "Județul Dâmbovița" },
    { id: 18, cod: "DJ", nume: "Dolj", nume_complet: "Județul Dolj" },
    { id: 20, cod: "GL", nume: "Galați", nume_complet: "Județul Galați" },
    { id: 21, cod: "GR", nume: "Giurgiu", nume_complet: "Județul Giurgiu" },
    { id: 19, cod: "GJ", nume: "Gorj", nume_complet: "Județul Gorj" },
    { id: 23, cod: "HR", nume: "Harghita", nume_complet: "Județul Harghita" },
    { id: 22, cod: "HD", nume: "Hunedoara", nume_complet: "Județul Hunedoara" },
    { id: 25, cod: "IL", nume: "Ialomița", nume_complet: "Județul Ialomița" },
    { id: 26, cod: "IS", nume: "Iași", nume_complet: "Județul Iași" },
    { id: 24, cod: "IF", nume: "Ilfov", nume_complet: "Județul Ilfov" },
    { id: 28, cod: "MM", nume: "Maramureș", nume_complet: "Județul Maramureș" },
    { id: 27, cod: "MH", nume: "Mehedinți", nume_complet: "Județul Mehedinți" },
    { id: 29, cod: "MS", nume: "Mureș", nume_complet: "Județul Mureș" },
    { id: 30, cod: "NT", nume: "Neamț", nume_complet: "Județul Neamț" },
    { id: 31, cod: "OT", nume: "Olt", nume_complet: "Județul Olt" },
    { id: 32, cod: "PH", nume: "Prahova", nume_complet: "Județul Prahova" },
    { id: 34, cod: "SJ", nume: "Sălaj", nume_complet: "Județul Sălaj" },
    { id: 35, cod: "SM", nume: "Satu Mare", nume_complet: "Județul Satu Mare" },
    { id: 33, cod: "SB", nume: "Sibiu", nume_complet: "Județul Sibiu" },
    { id: 36, cod: "SV", nume: "Suceava", nume_complet: "Județul Suceava" },
    { id: 39, cod: "TR", nume: "Teleorman", nume_complet: "Județul Teleorman" },
    { id: 38, cod: "TM", nume: "Timiș", nume_complet: "Județul Timiș" },
    { id: 37, cod: "TL", nume: "Tulcea", nume_complet: "Județul Tulcea" },
    { id: 40, cod: "VL", nume: "Vâlcea", nume_complet: "Județul Vâlcea" },
    { id: 42, cod: "VS", nume: "Vaslui", nume_complet: "Județul Vaslui" },
    { id: 41, cod: "VN", nume: "Vrancea", nume_complet: "Județul Vrancea" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the Supabase client response
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockJudete,
        error: null,
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Success cases", () => {
    it("should return 42 județe", async () => {
      const response = await GET();
      const json = await response.json();
      const data = json as ApiResponse<Judet[]>;

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(42);
    });

    it("should return județe sorted alphabetically by nume", async () => {
      const response = await GET();
      const json = await response.json();
      const data = json as ApiResponse<Judet[]>;

      const names = data.data.map((j) => j.nume);

      // Verify specific ordering for key examples
      // These should match the exact order from the database
      const albaIndex = names.indexOf("Alba");
      const aradIndex = names.indexOf("Arad");
      const argesIndex = names.indexOf("Argeș");
      const bucurestiIndex = names.indexOf("București");

      // Alba should come before Arad
      expect(albaIndex).toBeLessThan(aradIndex);
      // Arad should come before Argeș
      expect(aradIndex).toBeLessThan(argesIndex);
      // Argeș should come before București
      expect(argesIndex).toBeLessThan(bucurestiIndex);

      // Verify the data matches the mock order exactly
      expect(names).toEqual(mockJudete.map((j) => j.nume));
    });

    it("should include all required fields for each județ", async () => {
      const response = await GET();
      const json = await response.json();
      const data = json as ApiResponse<Judet[]>;

      data.data.forEach((judet) => {
        expect(judet).toHaveProperty("id");
        expect(judet).toHaveProperty("cod");
        expect(judet).toHaveProperty("nume");
        expect(judet).toHaveProperty("nume_complet");
        expect(typeof judet.id).toBe("number");
        expect(typeof judet.cod).toBe("string");
        expect(typeof judet.nume).toBe("string");
      });
    });

    it("should return success response with proper structure", async () => {
      const response = await GET();
      const json = await response.json();
      const data = json as ApiResponse<Judet[]>;

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");
      expect(data.meta).toHaveProperty("timestamp");
      expect(data.meta).toHaveProperty("version", "1.0");
    });

    it("should return HTTP 200 status", async () => {
      const response = await GET();
      expect(response.status).toBe(200);
    });

    it("should set cache-control headers", async () => {
      const response = await GET();
      const cacheControl = response.headers.get("Cache-Control");

      expect(cacheControl).toContain("public");
      expect(cacheControl).toContain("s-maxage=3600");
      expect(cacheControl).toContain("stale-while-revalidate=86400");
    });
  });

  describe("Error cases", () => {
    it("should handle database errors gracefully", async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error.code).toBe("DATABASE_ERROR");
      expect(response.status).toBe(500);
    });

    it("should handle unexpected errors", async () => {
      (createClient as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_ERROR");
      expect(response.status).toBe(500);
    });
  });
});
