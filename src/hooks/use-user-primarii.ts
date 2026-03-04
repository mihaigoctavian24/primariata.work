"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface UserPrimarieInfo {
  primarieId: string;
  numeOficial: string;
  judetSlug: string;
  localitateSlug: string;
  judetId: string;
  localitateId: string;
  rol: string;
}

/**
 * Hook to fetch the current user's registered primarii with names and slugs.
 * Used to identify cross-primarie notifications and enable context switching.
 *
 * Queries user_primarii joined with primarii -> localitati -> judete.
 * Cached for 5 minutes (primarie associations change infrequently).
 */
export function useUserPrimarii(): {
  primarii: UserPrimarieInfo[];
  isLoading: boolean;
  isError: boolean;
} {
  const supabase = createClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-primarii"],
    queryFn: async (): Promise<UserPrimarieInfo[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: rows, error } = await supabase
        .from("user_primarii")
        .select(
          `
          rol,
          primarii!inner(
            id,
            nume_oficial,
            localitati!inner(
              id,
              slug,
              judete!inner(
                id,
                slug
              )
            )
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (error) {
        throw new Error(`Failed to fetch user primarii: ${error.message}`);
      }

      if (!rows) return [];

      return rows.map((row) => {
        // Supabase returns joined data as nested objects
        const primarie = row.primarii as unknown as {
          id: string;
          nume_oficial: string;
          localitati: {
            id: number;
            slug: string;
            judete: {
              id: number;
              slug: string;
            };
          };
        };

        return {
          primarieId: primarie.id,
          numeOficial: primarie.nume_oficial,
          judetSlug: primarie.localitati.judete.slug,
          localitateSlug: primarie.localitati.slug,
          judetId: String(primarie.localitati.judete.id),
          localitateId: String(primarie.localitati.id),
          rol: row.rol,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    primarii: data ?? [],
    isLoading,
    isError,
  };
}

/**
 * Lookup helper: find a specific primarie by its ID from the cached list.
 */
export function getPrimarieInfo(
  primarii: UserPrimarieInfo[],
  primarieId: string
): UserPrimarieInfo | undefined {
  return primarii.find((p) => p.primarieId === primarieId);
}
