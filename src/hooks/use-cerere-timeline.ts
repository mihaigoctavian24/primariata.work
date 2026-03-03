"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * A single entry in the cerere timeline (cerere_istoric table).
 */
export interface CerereIstoricEntry {
  id: string;
  cerere_id: string;
  tip: "status_change" | "nota_interna" | "document_request";
  old_status: string | null;
  new_status: string | null;
  motiv: string | null;
  documente_solicitate: Array<{ tip: string; denumire: string; motiv?: string }> | null;
  actor_id: string;
  vizibil_cetatean: boolean;
  created_at: string;
  actor?: { prenume: string; nume: string } | null;
}

/**
 * React Query hook for fetching the cerere timeline (cerere_istoric).
 *
 * Queries cerere_istoric with a join to utilizatori for actor names.
 * If the user is not staff, filters to vizibil_cetatean = true only.
 * Results are ordered chronologically (ascending) for timeline display.
 *
 * @param cerereId - The cerere UUID to fetch the timeline for
 * @param isStaff - Whether the current user is staff (sees all entries including internal notes)
 * @returns React Query result with timeline data
 */
export function useCerereTimeline(cerereId: string, isStaff: boolean) {
  return useQuery<CerereIstoricEntry[]>({
    queryKey: ["cerere-timeline", cerereId, isStaff],
    queryFn: async (): Promise<CerereIstoricEntry[]> => {
      const supabase = createClient();

      // cerere_istoric is a new table not yet in generated database types.
      // Use type assertion to access it via the Supabase client.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;

      let query = client
        .from("cerere_istoric")
        .select(
          `
          id,
          cerere_id,
          tip,
          old_status,
          new_status,
          motiv,
          documente_solicitate,
          actor_id,
          vizibil_cetatean,
          created_at,
          actor:utilizatori!actor_id(prenume, nume)
        `
        )
        .eq("cerere_id", cerereId)
        .order("created_at", { ascending: true });

      // Citizens only see public entries (RLS already filters this,
      // but adding explicit filter for defense-in-depth)
      if (!isStaff) {
        query = query.eq("vizibil_cetatean", true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as CerereIstoricEntry[]) ?? [];
    },
    enabled: !!cerereId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
