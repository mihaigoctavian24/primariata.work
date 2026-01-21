// Jest setup file for integration tests
// Load environment variables from .env.local
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });

// Don't import @testing-library/jest-dom for integration tests

// Mock environment variables for tests (use defaults only if not set in .env.local)
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key";

// DON'T mock fetch for integration tests - we need real HTTP requests to Supabase

// Mock TextEncoder/TextDecoder for Node.js environment
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
