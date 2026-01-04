import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Primăriata E2E Testing
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_APP_URL: Base URL for testing (default: http://localhost:3000)
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key
 * - CI: Set to 'true' in CI environments
 */

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  // =============================================================================
  // TEST DIRECTORY & FILES
  // =============================================================================
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",

  // =============================================================================
  // EXECUTION SETTINGS
  // =============================================================================
  // Fail fast on CI, but continue locally for better debugging
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1, // Retry once locally for flaky tests
  workers: isCI ? 2 : undefined, // Use default locally for better performance
  maxFailures: isCI ? 10 : undefined, // Stop after 10 failures in CI

  // =============================================================================
  // REPORTER CONFIGURATION
  // =============================================================================
  reporter: isCI
    ? [
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["json", { outputFile: "playwright-report/results.json" }],
        ["github"], // GitHub Actions annotations
      ]
    : [["html", { outputFolder: "playwright-report", open: "on-failure" }], ["list"]],

  // =============================================================================
  // GLOBAL SETTINGS
  // =============================================================================
  use: {
    // Base URL for all tests
    baseURL,

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: "ro-RO",
    timezoneId: "Europe/Bucharest",

    // Screenshot & video settings
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",

    // Navigation & action timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Test metadata
    contextOptions: {
      permissions: ["geolocation", "notifications"],
    },
  },

  // =============================================================================
  // PROJECTS - Browser Matrix
  // =============================================================================
  projects: [
    // Desktop Browsers
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },

    // Mobile Browsers
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },

    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
      },
    },

    // Tablet
    {
      name: "tablet",
      use: {
        ...devices["iPad Pro"],
      },
    },
  ],

  // =============================================================================
  // WEB SERVER - Start Next.js dev server for testing
  // =============================================================================
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !isCI, // Don't reuse in CI, always start fresh
    timeout: 120000, // 2 minutes for server startup
    stdout: "pipe",
    stderr: "pipe",
  },

  // =============================================================================
  // TIMEOUTS
  // =============================================================================
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000, // 5s for expect assertions
  },

  // =============================================================================
  // OUTPUT & ARTIFACTS
  // =============================================================================
  outputDir: "test-results/",
  preserveOutput: "failures-only",

  // =============================================================================
  // GLOBAL SETUP & TEARDOWN (Optional)
  // =============================================================================
  // globalSetup: require.resolve('./e2e/global-setup.ts'),
  // globalTeardown: require.resolve('./e2e/global-teardown.ts'),
});
