// Jest setup file for global test configuration
import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";
