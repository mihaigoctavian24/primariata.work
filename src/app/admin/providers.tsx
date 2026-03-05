"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ShellLayout } from "@/components/shell/ShellLayout";
import { getAdminSidebarConfig } from "@/components/shell/sidebar/sidebar-config";

/**
 * Admin Providers (Client Component)
 *
 * Wraps admin pages in QueryClientProvider + ShellLayout.
 * Builds sidebarConfig client-side to avoid serializing React components
 * (Lucide icons) across the Server-to-Client boundary.
 */

interface AdminProvidersProps {
  children: React.ReactNode;
  initialCollapsed: boolean;
}

export function AdminProviders({ children, initialCollapsed }: AdminProvidersProps) {
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

  const sidebarConfig = useMemo(() => getAdminSidebarConfig("/admin"), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ShellLayout sidebarConfig={sidebarConfig} initialCollapsed={initialCollapsed}>
        {children}
      </ShellLayout>
    </QueryClientProvider>
  );
}
