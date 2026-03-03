"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useQueryClient } from "@tanstack/react-query";

interface UseRegistrationStatusOptions {
  userId: string | null;
  primarieId: string | null;
  currentStatus: "pending" | "rejected" | null;
  enabled?: boolean;
}

interface RegistrationStatusResult {
  status: "pending" | "approved" | "rejected" | "suspended" | null;
  rejectionReason: string | null;
}

/**
 * Hook for real-time registration status updates.
 * Subscribes to Supabase Realtime changes on user_primarii for the current user
 * and fires callbacks on status change (approval or rejection).
 *
 * Follows the pattern from use-cereri-notifications.ts.
 *
 * @param options - userId, primarieId, currentStatus, enabled
 * @returns Current status and rejection reason (updated in real-time)
 */
export function useRegistrationStatus({
  userId,
  primarieId,
  currentStatus,
  enabled = true,
}: UseRegistrationStatusOptions): RegistrationStatusResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RegistrationStatusResult["status"]>(currentStatus);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !primarieId || !enabled || !currentStatus) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`registration-${userId}-${primarieId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_primarii",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newRecord = payload.new as Record<string, unknown>;
          if (newRecord.primarie_id !== primarieId) return;

          const newStatus = newRecord.status as string;

          if (newStatus === "approved") {
            setStatus("approved");
            toast.success("Inregistrarea ta a fost aprobata!", {
              description: "Redirectionare catre dashboard...",
              duration: 3000,
            });
            // Invalidate user profile cache and refresh
            queryClient.invalidateQueries({ queryKey: ["user"] });
            setTimeout(() => router.refresh(), 1500);
          } else if (newStatus === "rejected") {
            setStatus("rejected");
            setRejectionReason(newRecord.rejection_reason as string | null);
            toast.error("Inregistrarea ta a fost respinsa", {
              description: "Vezi motivul respingerii pe pagina de status.",
              duration: 5000,
            });
          }
        }
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          logger.debug("[registration-status] Realtime subscription active");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, primarieId, currentStatus, enabled, router, queryClient]);

  return { status, rejectionReason };
}
