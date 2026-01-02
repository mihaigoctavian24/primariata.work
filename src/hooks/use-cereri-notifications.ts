"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface CerereStatusUpdate {
  id: string;
  numar_inregistrare: string;
  status: string;
  updated_at: string;
}

/**
 * Hook for real-time cereri status notifications
 * Subscribes to cereri table changes and displays toast notifications
 *
 * @param userId - Current user's ID
 * @param enabled - Whether to enable the subscription (default: true)
 */
export function useCereriNotifications(userId: string | null, enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (!userId || !enabled) {
      return;
    }

    const supabase = createClient();

    // Subscribe to cereri changes for current user
    const channel = supabase
      .channel("cereri-status-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cereri",
          filter: `solicitant_id=eq.${userId}`,
        },
        async (payload: RealtimePostgresChangesPayload<CerereStatusUpdate>) => {
          const oldRecord = payload.old as CerereStatusUpdate;
          const newRecord = payload.new as CerereStatusUpdate;

          // Only notify if status actually changed
          if (oldRecord.status !== newRecord.status) {
            const statusLabels: Record<string, string> = {
              depusa: "Depusă",
              in_verificare: "În verificare",
              info_suplimentare: "Informații suplimentare necesare",
              in_procesare: "În procesare",
              aprobata: "Aprobată",
              respinsa: "Respinsă",
              anulata: "Anulată",
              finalizata: "Finalizată",
            };

            const statusLabel = statusLabels[newRecord.status] || newRecord.status;

            // Show toast notification
            toast.success(`Cererea ${newRecord.numar_inregistrare} a fost actualizată`, {
              description: `Status nou: ${statusLabel}`,
              action: {
                label: "Vezi detalii",
                onClick: () => {
                  router.push(`cereri/${newRecord.id}`);
                },
              },
              duration: 8000,
            });

            // Create notification record in database
            try {
              await supabase.from("notificari").insert({
                utilizator_id: userId,
                titlu: `Cerere ${newRecord.numar_inregistrare} actualizată`,
                mesaj: `Statusul cererii a fost schimbat în: ${statusLabel}`,
                tip: "cerere",
                link_entitate_tip: "cerere",
                link_entitate_id: newRecord.id,
                citita: false,
              });
            } catch (error) {
              console.error("Failed to create notification record:", error);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, router]);
}
