"use client";

import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback label shown in the UI */
  label?: string;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AdminErrorBoundary extends React.Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("[AdminErrorBoundary] Caught render error:", error, info);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-[var(--color-error)]/20 bg-[var(--color-error-subtle)] p-8 text-center">
          <AlertTriangle className="mb-3 h-8 w-8" style={{ color: "var(--color-error)" }} />
          <p className="text-foreground mb-1 text-sm font-semibold">
            {this.props.label ?? "Eroare la încărcarea paginii"}
          </p>
          <p className="text-muted-foreground mb-4 max-w-xs text-xs">{this.state.errorMessage}</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="text-foreground border-border flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all hover:bg-white/5"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Încearcă din nou
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
