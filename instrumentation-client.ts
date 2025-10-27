// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Export hook for router transition tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore specific errors on client
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Random plugins/extensions
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    // Network errors
    "NetworkError",
    "Non-Error promise rejection captured",
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
