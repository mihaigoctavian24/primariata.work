import { Logger as LogtailLogger } from "@logtail/next";
import type { SecurityEvent } from "@/lib/logger-security";

const betterStackToken = process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN;
const isProduction = process.env.NODE_ENV === "production";

// Create Logtail logger instance (only sends to Better Stack when token present)
const logtailLogger = betterStackToken ? new LogtailLogger() : null;

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, context ?? "");
    }
    // debug never sent to Better Stack
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.info(`[INFO] ${message}`, context ?? "");
    }
    // info not sent to Better Stack in production (noise reduction)
  },

  warn(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, context ?? "");
    }
    logtailLogger?.warn(message, context);
  },

  error(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.error(`[ERROR] ${message}`, context ?? "");
    }
    logtailLogger?.error(message, context);
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
