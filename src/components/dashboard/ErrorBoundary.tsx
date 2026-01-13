"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching and handling React errors in dashboard
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard Error Boundary caught an error:", error, errorInfo);

    // TODO M4: Integrate with Sentry or other error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />

          <h3 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-100">
            Oops! Ceva nu a mers bine
          </h3>

          <p className="mb-6 max-w-md text-center text-sm text-red-700 dark:text-red-300">
            {this.state.error?.message ||
              "A apărut o eroare neașteptată. Vă rugăm să încercați din nou."}
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mb-4 max-w-2xl rounded bg-red-100 p-4 dark:bg-red-900">
              <summary className="cursor-pointer text-sm font-medium text-red-900 dark:text-red-100">
                Detalii tehnice (development mode)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-800 dark:text-red-200">
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-4">
            <Button onClick={this.handleReset} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reîncearcă
            </Button>

            <Button onClick={() => window.history.back()} variant="outline">
              Înapoi
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback component for specific error scenarios
 * Use this for displaying errors from React Query or other async operations
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = "Eroare de încărcare",
  description,
}: {
  error: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
      <AlertTriangle className="text-muted-foreground mb-4 h-10 w-10" />

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>

      <p className="text-muted-foreground mb-4 max-w-md text-center text-sm">
        {description || error.message}
      </p>

      {resetErrorBoundary && (
        <Button onClick={resetErrorBoundary} variant="outline" className="gap-2" size="sm">
          <RefreshCw className="h-4 w-4" />
          Încearcă din nou
        </Button>
      )}
    </div>
  );
}

/**
 * Inline Error Display - For showing errors without full fallback UI
 * Use this for showing errors inline within a component
 */
export function InlineError({
  error,
  onRetry,
  className,
}: {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}) {
  const message = typeof error === "string" ? error : error.message;

  return (
    <div
      className={`flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950 ${className || ""}`}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />

      <div className="flex-1">
        <p className="text-sm font-medium text-red-900 dark:text-red-100">Eroare de încărcare</p>
        <p className="mt-1 text-xs text-red-700 dark:text-red-300">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="ghost" size="sm" className="flex-shrink-0">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
