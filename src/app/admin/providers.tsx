"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ShellLayout } from "@/components/shell/ShellLayout";
import type { SidebarConfig } from "@/components/shell/sidebar/sidebar-config";

/**
 * Admin Providers (Client Component)
 *
 * Wraps admin pages in QueryClientProvider + ShellLayout.
 * Receives server-read config and collapsed state as props.
 */

interface AdminProvidersProps {
  children: React.ReactNode;
  sidebarConfig: SidebarConfig;
  initialCollapsed: boolean;
}

export function AdminProviders({ children, sidebarConfig, initialCollapsed }: AdminProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ShellLayout sidebarConfig={sidebarConfig} initialCollapsed={initialCollapsed}>
        {children}
      </ShellLayout>
    </QueryClientProvider>
  );
}
