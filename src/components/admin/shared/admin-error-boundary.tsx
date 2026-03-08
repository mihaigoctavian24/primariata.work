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

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
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
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-2xl border border-[var(--color-error)]/20 bg-[var(--color-error-subtle)] p-8 text-center">
          <AlertTriangle className="w-8 h-8 mb-3" style={{ color: "var(--color-error)" }} />
          <p className="text-foreground font-semibold text-sm mb-1">
            {this.props.label ?? "Eroare la încărcarea paginii"}
          </p>
          <p className="text-muted-foreground text-xs mb-4 max-w-xs">{this.state.errorMessage}</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-foreground border border-border hover:bg-white/5 transition-all cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Încearcă din nou
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
