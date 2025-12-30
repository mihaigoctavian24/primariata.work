"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Provider
 *
 * Provides QueryClient instance for data fetching with:
 * - 5 minute stale time (data stays fresh)
 * - 10 minute cache time (data kept in cache)
 * - No automatic refetch on window focus (avoid unnecessary requests)
 * - Retry failed requests 1 time
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (useState ensures stable instance across re-renders)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
