import { Logger as LogtailLogger } from "@logtail/next";
import type { SecurityEvent } from "@/lib/logger-security";

const betterStackToken = process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN;
const isProduction = process.env.NODE_ENV === "production";

// Create Logtail logger instance (only sends to Better Stack when token present)
const logtailLogger = betterStackToken ? new LogtailLogger() : null;

/**
 * Normalize a context value into a Record<string, unknown> suitable for structured logging.
 * Handles: Error objects, plain objects, primitives, null/undefined.
 */
function normalizeContext(context: unknown): Record<string, unknown> | undefined {
  if (context === undefined || context === null || context === "") {
    return undefined;
  }
  if (context instanceof Error) {
    return { message: context.message, stack: context.stack, name: context.name };
  }
  if (typeof context === "object" && !Array.isArray(context)) {
    return context as Record<string, unknown>;
  }
  return { value: context };
}

export const logger = {
  debug(message: string, context?: unknown): void {
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, context ?? "");
    }
    // debug never sent to Better Stack
  },

  info(message: string, context?: unknown): void {
    if (!isProduction) {
      console.info(`[INFO] ${message}`, context ?? "");
    }
    // info not sent to Better Stack in production (noise reduction)
  },

  warn(message: string, context?: unknown): void {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, context ?? "");
    }
    logtailLogger?.warn(message, normalizeContext(context));
  },

  error(message: string, context?: unknown): void {
    if (!isProduction) {
      console.error(`[ERROR] ${message}`, context ?? "");
    }
    logtailLogger?.error(message, normalizeContext(context));
  },

  security(event: SecurityEvent): void {
    const message = `[Security] ${event.type}:${event.action}`;
    const context: Record<string, unknown> = {
      type: event.type,
      action: event.action,
      userId: event.userId ?? "anonymous",
      success: event.success,
      ...event.metadata,
    };

    if (!isProduction) {
      const logFn = event.success ? console.info : console.warn;
      logFn(message, context);
    }
    // Security events ALWAYS go to Better Stack
    logtailLogger?.warn(message, context);
  },

  async flush(): Promise<void> {
    await logtailLogger?.flush();
  },
};
