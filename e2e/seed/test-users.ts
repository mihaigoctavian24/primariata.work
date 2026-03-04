/**
 * E2E Test User Constants
 *
 * Centralized test user definitions for all E2E specs.
 * All users share a default password with env var overrides.
 */

export interface TestUser {
  email: string;
  password: string;
  role: "cetatean" | "functionar" | "admin" | "primar";
  fullName: string;
  prenume: string;
  nume: string;
  departament?: string;
}

/**
 * Test users for E2E tests.
 * Password can be overridden per-user via environment variables.
 */
export const TEST_USERS: Record<string, TestUser> = {
  cetatean: {
    email: "cetatean@test.primariata.work",
    password: process.env.E2E_CETATEAN_PASSWORD || "TestPass123!",
    role: "cetatean",
    fullName: "Ion Popescu",
    prenume: "Ion",
    nume: "Popescu",
  },
  functionar: {
    email: "functionar@test.primariata.work",
    password: process.env.E2E_FUNCTIONAR_PASSWORD || "TestPass123!",
    role: "functionar",
    fullName: "Maria Ionescu",
    prenume: "Maria",
    nume: "Ionescu",
    departament: "Urbanism",
  },
  admin: {
    email: "admin@test.primariata.work",
    password: process.env.E2E_ADMIN_PASSWORD || "TestPass123!",
    role: "admin",
    fullName: "Admin Test",
    prenume: "Admin",
    nume: "Test",
  },
  primar: {
    email: "primar@test.primariata.work",
    password: process.env.E2E_PRIMAR_PASSWORD || "TestPass123!",
    role: "primar",
    fullName: "Primar Test",
    prenume: "Primar",
    nume: "Test",
  },
} as const;

/**
 * Pending user for admin approval workflow test.
 */
export const PENDING_USER = {
  email: "pending@test.primariata.work",
  password: process.env.E2E_PENDING_PASSWORD || "TestPass123!",
  fullName: "Pending User",
  prenume: "Pending",
  nume: "User",
};

/**
 * Test configuration matching actual database slugs.
 * judet slug: "bucuresti", localitate slug: "sector-1-b"
 * App URLs: /app/bucuresti/sector-1-b
 */
export const TEST_CONFIG = {
  judet: "bucuresti",
  localitate: "sector-1-b",
} as const;
