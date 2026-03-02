"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/app/api/user/profile/route";
import type { ApiResponse } from "@/types/api";

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching authenticated user's profile with role information
 * Uses React Query for caching, loading states, and automatic refetching
 *
 * Features:
 * - Fetches user rol, departament, permisiuni from utilizatori table
 * - Caches for 5 minutes (profile data changes infrequently)
 * - Refetches on window focus
 * - Handles authentication errors gracefully
 *
 * @returns Query result with user profile
 *
 * @example
 * const { profile, isLoading } = useUserProfile();
 * if (profile?.rol === 'functionar') {
 *   // Show funcționar dashboard
 * }
 */
export function useUserProfile(): UseUserProfileResult {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? undefined);
    });
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery<ApiResponse<UserProfile>>({
    queryKey: ["user", "profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch user profile");
      }

      return response.json();
    },
    // Profile data doesn't change often - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch on window focus to get fresh role/permissions
    refetchOnWindowFocus: true,
    // Retry on failure (network issues)
    retry: 2,
  });

  return {
    profile: data?.data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
