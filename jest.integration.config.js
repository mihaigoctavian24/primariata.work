/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

// Integration test configuration
const customJestConfig = {
  displayName: "integration",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Use node environment for API route testing
  testEnvironment: "node",

  // Module paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Only run integration tests
  testMatch: ["<rootDir>/tests/integration/**/*.test.[jt]s?(x)"],

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/e2e/"],

  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    "node_modules/(?!(isomorphic-dompurify|dompurify|@exodus/bytes|html-encoding-sniffer|jsdom)/)",
  ],

  // Coverage
  collectCoverageFrom: ["src/app/api/**/*.{js,ts}", "!src/**/*.d.ts"],
};

module.exports = createJestConfig(customJestConfig);
