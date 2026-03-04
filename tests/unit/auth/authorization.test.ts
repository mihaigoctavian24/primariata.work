/**
 * Unit Tests for Authorization Functions
 *
 * Tests: requireAuth, requireRole, requireOwnership, validateUUID
 * Mocks: Supabase server client, logger
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock logger first (no dependencies)
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Store mock functions in a module-scoped object that jest.mock factory can reference
const supabaseMock = {
  getUser: jest.fn(),
  from: jest.fn(),
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockImplementation(() =>
    Promise.resolve({
      auth: {
        getUser: (...args: any[]) => supabaseMock.getUser(...args),
      },
      from: (...args: any[]) => supabaseMock.from(...args),
    })
  ),
}));

import {
  requireAuth,
  requireOwnership,
  requireRole,
  validateUUID,
  UserRole,
} from "@/lib/auth/authorization";

describe("Authorization Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create a minimal Request object
  function createRequest(url: string = "http://localhost:3000/api/test"): Request {
    return new Request(url, {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
  }

  // Helper to setup role query chain
  function mockRoleQuery(data: any, error: any = null): void {
    const mockSingle = jest.fn().mockResolvedValue({ data, error });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    supabaseMock.from.mockReturnValue({ select: mockSelect });
  }

  describe("requireAuth", () => {
    it("returns NextResponse with status 401 when no user session", async () => {
      supabaseMock.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await requireAuth(createRequest());
      expect(result).not.toBeNull();
      expect(result!.status).toBe(401);

      const body = await result!.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns null when user is authenticated", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: "user-uuid-1234" } },
        error: null,
      });

      const result = await requireAuth(createRequest());
      expect(result).toBeNull();
    });

    it("returns 401 when getUser returns an error", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Session expired" },
      });

      const result = await requireAuth(createRequest());
      expect(result).not.toBeNull();
      expect(result!.status).toBe(401);
    });
  });

  describe("requireRole", () => {
    it("returns null when user has the required role", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: "user-uuid-1234" } },
        error: null,
      });
      mockRoleQuery({ rol: "admin" });

      const result = await requireRole([UserRole.ADMIN], createRequest());
      expect(result).toBeNull();
    });

    it("returns 403 when user lacks the required role", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: "user-uuid-1234" } },
        error: null,
      });
      mockRoleQuery({ rol: "cetatean" });

      const result = await requireRole([UserRole.ADMIN], createRequest());
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);

      const body = await result!.json();
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("returns 401 when user is not authenticated", async () => {
      supabaseMock.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await requireRole([UserRole.ADMIN], createRequest());
      expect(result).not.toBeNull();
      expect(result!.status).toBe(401);
    });

    it("returns 500 when role query fails", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: "user-uuid-1234" } },
        error: null,
      });
      mockRoleQuery(null, { message: "DB error" });

      const result = await requireRole([UserRole.ADMIN], createRequest());
      expect(result).not.toBeNull();
      expect(result!.status).toBe(500);
    });

    it("accepts when user has one of multiple allowed roles", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: "user-uuid-1234" } },
        error: null,
      });
      mockRoleQuery({ rol: "functionar" });

      const result = await requireRole([UserRole.ADMIN, UserRole.FUNCTIONAR], createRequest());
      expect(result).toBeNull();
    });
  });

  describe("requireOwnership", () => {
    it("returns null when user owns the resource", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });

      const result = await requireOwnership(userId, createRequest(), "cerere");
      expect(result).toBeNull();
    });

    it("returns 403 when user does not own the resource", async () => {
      supabaseMock.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const result = await requireOwnership("different-user-id", createRequest(), "cerere");
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);

      const body = await result!.json();
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("returns 401 when user is not authenticated", async () => {
      supabaseMock.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await requireOwnership("some-user-id", createRequest(), "cerere");
      expect(result).not.toBeNull();
      expect(result!.status).toBe(401);
    });
  });

  describe("validateUUID", () => {
    it("returns null for a valid UUID", () => {
      const result = validateUUID("550e8400-e29b-41d4-a716-446655440000");
      expect(result).toBeNull();
    });

    it("returns NextResponse with 400 for invalid UUID string", () => {
      const result = validateUUID("not-a-uuid");
      expect(result).not.toBeNull();
      expect(result!.status).toBe(400);
    });

    it("returns 400 for empty string", () => {
      const result = validateUUID("");
      expect(result).not.toBeNull();
      expect(result!.status).toBe(400);
    });

    it("includes param name in error message", async () => {
      const result = validateUUID("invalid", "cerere_id");
      expect(result).not.toBeNull();
      const body = await result!.json();
      expect(body.error.message).toContain("cerere_id");
    });
  });
});
