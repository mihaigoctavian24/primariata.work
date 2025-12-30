// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Extend Window interface for Sentry initialization flag
interface WindowWithSentry extends Window {
  __SENTRY_INITIALIZED__?: boolean;
}

// Prevent duplicate initialization in development (HMR)
if (typeof window !== "undefined" && !(window as WindowWithSentry).__SENTRY_INITIALIZED__) {
  (window as WindowWithSentry).__SENTRY_INITIALIZED__ = true;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps

    environment: process.env.NODE_ENV,

    // Automatically replay sessions on errors (disabled in development to prevent HMR conflicts)
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,

    // Integrations for better client-side tracking (Replay disabled in development)
    integrations:
      process.env.NODE_ENV === "production"
        ? [
            Sentry.replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ]
        : [],

    // Ignore specific browser errors
    ignoreErrors: [
      // Random plugins/extensions
      "top.GLOBALS",
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      "http://tt.epicplay.com",
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",
      "http://loading.retry.widdit.com/",
      "atomicFindClose",
      // Facebook borked
      "fb_xd_fragment",
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
      "bmi_SafeAddOnload",
      "EBCallBackMessageReceived",
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      "conduitPage",
      // Generic error code from errors outside the security sandbox
      // You can delete this if using raven.js > 1.0, which ignores these automatically.
      "Script error.",
      // Network errors
      "NetworkError",
      "Network request failed",
      // ResizeObserver errors (non-critical)
      "ResizeObserver loop limit exceeded",
    ],

    beforeSend(event, hint) {
      // Don't send events for development
      if (process.env.NODE_ENV === "development") {
        console.error(hint.originalException || hint.syntheticException);
        return null;
      }
      return event;
    },
  });
}
