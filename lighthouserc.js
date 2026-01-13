module.exports = {
  ci: {
    collect: {
      // Number of runs per URL for consistent results
      numberOfRuns: 3,

      // URLs to audit - using localhost for development
      // For CI, this will be replaced with Vercel preview URL
      url: [
        "http://localhost:3000/", // Landing page
        // Note: Additional routes can be added here
        // Dashboard routes require authentication - will add E2E test for authenticated flows
      ],

      // Chrome flags for consistent results
      settings: {
        // Emulate mobile device (Moto G4)
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 2.625,
        },
        // Mobile throttling (4G)
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 150 * 3.75,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
        // Skip certain audits that aren't relevant
        skipAudits: ["uses-http2"],
      },
    },

    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Core Web Vitals - Critical for UX
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }], // LCP < 2.5s
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }], // CLS < 0.1
        "total-blocking-time": ["error", { maxNumericValue: 300 }], // TBT < 300ms (proxy for FID)

        // Performance Score
        "categories:performance": ["warn", { minScore: 0.9 }], // 90+ performance score

        // Accessibility
        "categories:accessibility": ["warn", { minScore: 0.95 }], // 95+ accessibility score

        // Best Practices
        "categories:best-practices": ["warn", { minScore: 0.9 }], // 90+ best practices

        // SEO
        "categories:seo": ["warn", { minScore: 0.9 }], // 90+ SEO score

        // Additional Performance Metrics
        "first-contentful-paint": ["warn", { maxNumericValue: 1200 }], // FCP < 1.2s
        "speed-index": ["warn", { maxNumericValue: 3400 }], // SI < 3.4s
        interactive: ["warn", { maxNumericValue: 3500 }], // TTI < 3.5s

        // Resource optimization
        "uses-optimized-images": "warn",
        "modern-image-formats": "warn",
        "uses-text-compression": "warn",
        "uses-responsive-images": "warn",

        // Next.js specific
        "unused-javascript": "off", // Next.js bundles can have unused code split across pages
        "uses-rel-preconnect": "warn",
      },
    },

    upload: {
      // Store results in temporary public storage
      // For production, use GitHub Actions artifacts or Lighthouse CI server
      target: "temporary-public-storage",

      // Optional: Upload to Lighthouse CI server
      // Uncomment and configure if using self-hosted LHCI server
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
