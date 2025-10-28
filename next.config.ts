import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // instrumentation.ts is enabled by default in Next.js 15+
  // No experimental flag needed

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Redirect survey.primariata.work to /survey
        {
          source: "/",
          destination: "/survey",
          has: [
            {
              type: "host",
              value: "survey.primariata.work",
            },
          ],
        },
        // Preserve /start path on subdomain
        {
          source: "/start",
          destination: "/survey/start",
          has: [
            {
              type: "host",
              value: "survey.primariata.work",
            },
          ],
        },
      ],
    };
  },
};

// Wrap the config with Sentry for automatic error tracking
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry DSN provided in your environment variables is valid before deploying.
  tunnelRoute: "/monitoring",
});
