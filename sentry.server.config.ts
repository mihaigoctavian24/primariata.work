// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

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

  // Ignore specific errors on server
  ignoreErrors: [
    // Next.js specific
    "ENOENT",
    "ENOTFOUND",
    // Database connection errors (handled separately)
    "Connection terminated unexpectedly",
    "Connection refused",
  ],

  beforeSend(event, hint) {
    // Don't send events for development
    if (process.env.NODE_ENV === "development") {
      const exception = hint.originalException || hint.syntheticException;

      // Log different types of exceptions with useful formatting
      console.group("🔴 Sentry Error [Server] (Development Mode - Not Sent)");

      if (exception instanceof Error) {
        // Standard Error object - log with stack trace
        console.error(exception);
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
