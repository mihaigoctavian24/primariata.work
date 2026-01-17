import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * Build Content-Security-Policy header
 * Protects against XSS attacks by whitelisting allowed content sources
 *
 * @param isDev - Whether running in development mode (affects 'unsafe-eval', localhost)
 * @returns CSP header string
 */
function buildCSPHeader(isDev: boolean): string {
  const directives = {
    // Default fallback - restrict everything by default
    "default-src": ["'self'"],

    // Scripts - allow Next.js, Vercel Analytics, Sentry
    "script-src": [
      "'self'",
      isDev ? "'unsafe-eval'" : "", // Required for Next.js dev mode HMR
      "'unsafe-inline'", // Required for Next.js styled-jsx and inline scripts
      "https://vercel.live", // Vercel Toolbar
      "https://va.vercel-scripts.com", // Vercel Analytics
      "https://*.sentry.io", // Sentry error tracking
      "https://browser.sentry-cdn.com", // Sentry SDK
    ].filter(Boolean),

    // Styles - allow inline styles for Tailwind CSS, shadcn/ui
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS and styled components
      "https://fonts.googleapis.com", // Google Fonts
    ],

    // Images - allow Google OAuth avatars, Supabase storage, data URLs
    "img-src": [
      "'self'",
      "data:", // Base64 encoded images
      "blob:", // Blob URLs for dynamic images
      "https://lh3.googleusercontent.com", // Google OAuth profile pictures
      "https://*.supabase.co", // Supabase Storage CDN
    ],

    // Fonts - Google Fonts, data URLs
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],

    // Connect - API calls to Supabase, Sentry, Vercel, WeatherAPI
    "connect-src": [
      "'self'",
      "https://*.supabase.co", // Supabase API and Realtime
      "wss://*.supabase.co", // Supabase Realtime WebSocket
      "https://*.sentry.io", // Sentry error reporting
      "https://vercel.live", // Vercel Toolbar
      "https://va.vercel-scripts.com", // Vercel Analytics
      "https://vitals.vercel-insights.com", // Vercel Speed Insights
      "https://api.weatherapi.com", // WeatherAPI for WeatherWidget
      isDev ? "ws://localhost:*" : "", // Next.js dev server WebSocket (HMR)
      isDev ? "http://localhost:*" : "", // Local API calls in dev
    ].filter(Boolean),

    // Frames - allow Spline 3D embeds, disable frame-ancestors for clickjacking protection
    "frame-src": ["'self'", "https://*.spline.design"],
    "frame-ancestors": ["'none'"],

    // Objects - disable plugins (Flash, Java, etc.)
    "object-src": ["'none'"],

    // Base URI - restrict base tag to same origin
    "base-uri": ["'self'"],

    // Forms - only submit to same origin
    "form-action": ["'self'"],

    // Upgrade insecure requests (HTTP → HTTPS) - production only
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  };

  return Object.entries(directives)
    .map(([key, values]) => {
      if (Array.isArray(values) && values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}

const nextConfig: NextConfig = {
  // instrumentation.ts is enabled by default in Next.js 15+
  // No experimental flag needed

  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header (security through obscurity)
  compress: true,

  // Security Headers
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy (CSP) - XSS Protection
          // Whitelists allowed sources for scripts, styles, images, etc.
          {
            key: "Content-Security-Policy",
            value: buildCSPHeader(isDev),
          },

          // HTTP Strict-Transport-Security (HSTS) - Force HTTPS
          // Only enable in production (2 years max-age for HSTS preload list)
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),

          // X-Frame-Options - Clickjacking Protection
          // DENY prevents page from being displayed in any iframe
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // X-Content-Type-Options - MIME Sniffing Protection
          // Prevents browsers from interpreting files as a different MIME type
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Referrer-Policy - Control referrer information leakage
          // Send full URL for same-origin, only origin for cross-origin HTTPS
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Permissions-Policy - Disable unused browser features
          // Principle of least privilege - disable camera, mic, geolocation, payment API
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },

          // X-XSS-Protection - Legacy XSS Protection (for older browsers)
          // Modern browsers rely on CSP, but this helps older browsers
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          // X-DNS-Prefetch-Control - Enable DNS prefetching for performance
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
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
