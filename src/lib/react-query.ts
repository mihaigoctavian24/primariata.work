/**
 * React Query Configuration
 * Centralized configuration for TanStack Query (React Query)
 */

import { QueryClient, DefaultOptions, MutationCache, QueryCache } from "@tanstack/react-query";

// Default query options
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: 1 minute for real-time data (optimized for live updates)
    staleTime: 1000 * 60 * 1,

    // Cache time: 10 minutes
    gcTime: 1000 * 60 * 10,

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && "status" in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

    // Refetch configuration - optimized for real-time
    refetchOnWindowFocus: true, // Enable refetch on window focus for real-time feel
    refetchOnReconnect: true, // Refetch when connection is restored
    refetchOnMount: true, // Refetch when component mounts

    // Error handling
    throwOnError: false, // Don't throw errors by default
  },

  mutations: {
    // Retry configuration for mutations
    retry: false, // Don't retry mutations by default

    // Error handling
    throwOnError: false,
  },
};

// Query cache for global error handling
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Query Error:", {
        error,
        queryKey: query.queryKey,
      });
    }

    // TODO: Add error tracking service integration (e.g., Sentry)
    // For now, errors are handled at the component level
  },
  onSuccess: (data, query) => {
    // Optional: Log successful queries in development
    if (process.env.NODE_ENV === "development") {
      console.log("Query Success:", {
        queryKey: query.queryKey,
        data,
      });
    }
  },
});

// Mutation cache for global error handling
const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    // Log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Mutation Error:", {
        error,
        variables,
        mutationKey: mutation.options.mutationKey,
      });
    }

    // TODO: Add error tracking service integration
  },
  onSuccess: (data, variables, context, mutation) => {
    // Optional: Log successful mutations in development
    if (process.env.NODE_ENV === "development") {
      console.log("Mutation Success:", {
        mutationKey: mutation.options.mutationKey,
        data,
      });
    }
  },
});

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache,
  mutationCache,
});

// Query keys factory for type-safe query keys
export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    charts: () => [...queryKeys.dashboard.all, "charts"] as const,
    recentActivity: () => [...queryKeys.dashboard.all, "recent-activity"] as const,
  },

  // Survey queries
  surveys: {
    all: ["surveys"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.surveys.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.surveys.all, "detail", id] as const,
    responses: (id: string) => [...queryKeys.surveys.all, id, "responses"] as const,
    analytics: (id: string) => [...queryKeys.surveys.all, id, "analytics"] as const,
  },

  // User queries
  users: {
    all: ["users"] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
    profile: (id: string) => [...queryKeys.users.all, "profile", id] as const,
  },

  // Location queries
  locations: {
    all: ["locations"] as const,
    judete: () => [...queryKeys.locations.all, "judete"] as const,
    localitati: (judetId?: string) => [...queryKeys.locations.all, "localitati", judetId] as const,
  },
} as const;

// Helper function to invalidate related queries
export const invalidateQueries = {
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  surveys: () => queryClient.invalidateQueries({ queryKey: queryKeys.surveys.all }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  locations: () => queryClient.invalidateQueries({ queryKey: queryKeys.locations.all }),
  all: () => queryClient.invalidateQueries(),
};

// Helper function to prefetch queries
export const prefetchQueries = {
  dashboardStats: () =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(),
      // queryFn will be provided when implementing actual queries
    }),

  surveyList: (filters?: Record<string, unknown>) =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.surveys.list(filters),
      // queryFn will be provided when implementing actual queries
    }),
};

// Utility types for query results
export type QueryKey = (typeof queryKeys)[keyof typeof queryKeys];

// Helper function to reset all queries
export const resetQueries = () => {
  queryClient.clear();
};

// Export default QueryClient for provider
export default queryClient;
