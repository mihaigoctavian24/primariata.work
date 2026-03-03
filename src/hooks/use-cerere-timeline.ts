"use client";

import { useQuery } from "@tanstack/react-query";
import { getCerereTimeline } from "@/actions/cereri-detail";

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
 * Calls the getCerereTimeline Server Action which runs server-side
 * with the correct x-primarie-id header context from middleware,
 * ensuring RLS policies work correctly.
 *
 * If the user is not staff, the Server Action filters to
 * vizibil_cetatean = true only.
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
      const result = await getCerereTimeline(cerereId, isStaff);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!cerereId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
