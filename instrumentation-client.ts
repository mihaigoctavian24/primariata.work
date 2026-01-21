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
      const exception = hint.originalException || hint.syntheticException;

      // Log different types of exceptions with useful formatting
      console.group("🔴 Sentry Error (Development Mode - Not Sent)");

      if (exception instanceof Error) {
        // Standard Error object - log with stack trace
        console.error(exception);
      } else if (exception instanceof Event) {
        // Browser Event object - extract useful properties
        console.error("Event Type:", exception.type);
        console.error("Event Target:", exception.target);
        console.error("Event Details:", {
          type: exception.type,
          target: exception.target,
          currentTarget: exception.currentTarget,
          timestamp: exception.timeStamp,
        });
      } else if (typeof exception === "object" && exception !== null) {
        // Plain object - stringify to see contents
        console.error("Exception Object:", JSON.stringify(exception, null, 2));
      } else {
        // Primitive or other type
        console.error("Exception:", exception);
      }

      // Also log the event context for additional debugging info
      if (event.message) {
        console.error("Message:", event.message);
      }
      if (event.level) {
        console.error("Level:", event.level);
      }

      console.groupEnd();
      return null;
    }
    return event;
  },
});
