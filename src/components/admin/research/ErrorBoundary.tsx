"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching and handling React errors
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
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
    console.error("Error Boundary caught an error:", error, errorInfo);

    // You can log to an error reporting service here
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optionally reload the page
    if (typeof window !== "undefined") {
      window.location.reload();
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
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950">
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
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-12">
      <AlertTriangle className="text-muted-foreground mb-4 h-12 w-12" />

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>

      <p className="text-muted-foreground mb-4 text-center text-sm">
        {description || error.message}
      </p>

      {resetErrorBoundary && (
        <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Încearcă din nou
        </Button>
      )}
    </div>
  );
}
