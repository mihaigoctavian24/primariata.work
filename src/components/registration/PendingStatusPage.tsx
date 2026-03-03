"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { RegistrationStatusCard } from "@/components/registration/RegistrationStatusCard";
import { reapplyAtPrimarie } from "@/actions/registration";

interface PendingStatusPageProps {
  status: "pending" | "rejected" | null; // null = no association
  primarieName: string;
  primarieEmail?: string;
  rejectionReason?: string | null;
  primarieId: string;
  userId: string;
  judet: string;
  localitate: string;
}

/**
 * Full-screen status page that replaces the entire dashboard content
 * for users with pending, rejected, or no association at the current primarie.
 *
 * Designed as a calm "waiting room" experience per CONTEXT.md decisions.
 * Uses Supabase Realtime subscription for instant status updates.
 */
export function PendingStatusPage({
  status,
  primarieName,
  primarieEmail,
  rejectionReason: initialRejectionReason,
  primarieId,
  userId,
  judet,
  localitate,
}: PendingStatusPageProps) {
  const router = useRouter();
  const [isReapplying, setIsReapplying] = useState(false);

  // Real-time status subscription (only active when status is 'pending')
  const { status: realtimeStatus, rejectionReason: realtimeRejectionReason } =
    useRegistrationStatus({
      userId,
      primarieId,
      currentStatus: status,
      enabled: status === "pending",
    });

  // Use realtime values if they differ from initial
  const currentStatus = realtimeStatus ?? status;
  const currentRejectionReason = realtimeRejectionReason ?? initialRejectionReason;

  const handleReapply = useCallback(async () => {
    setIsReapplying(true);
    try {
      const result = await reapplyAtPrimarie(primarieId);
      if (result.success) {
        toast.success("Cererea de re-inregistrare a fost trimisa!", {
          description: "Vei fi notificat cand va fi procesata.",
        });
        router.refresh();
      } else {
        toast.error("Eroare la trimiterea cererii", {
          description: result.error ?? "Incearca din nou mai tarziu.",
        });
      }
    } catch {
      toast.error("Eroare neasteptata", {
        description: "Incearca din nou mai tarziu.",
      });
    } finally {
      setIsReapplying(false);
    }
  }, [primarieId, router]);

  const handleGoToLocationPicker = useCallback(() => {
    router.push("/");
  }, [router]);

  // If realtime shows approved, the hook already triggers refresh + toast
  // Show a brief success state before redirect
  if (currentStatus === "approved") {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold">Inregistrare aprobata!</h2>
          <p className="text-muted-foreground">Redirectionare catre dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="text-muted-foreground flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm capitalize">
              {judet.replace(/-/g, " ")} / {localitate.replace(/-/g, " ")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{primarieName}</h1>
        </div>

        {/* Status Card */}
        {currentStatus === "pending" && (
          <RegistrationStatusCard
            status="pending"
            primarieName={primarieName}
            primarieEmail={primarieEmail}
          />
        )}

        {currentStatus === "rejected" && (
          <RegistrationStatusCard
            status="rejected"
            primarieName={primarieName}
            rejectionReason={currentRejectionReason}
            primarieEmail={primarieEmail}
            onReapply={handleReapply}
            isReapplying={isReapplying}
          />
        )}

        {/* No association state */}
        {!currentStatus && (
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-xl">Nu esti inregistrat</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nu ai un cont activ la{" "}
                <span className="text-foreground font-semibold">{primarieName}</span>.
                Inregistreaza-te pentru a accesa serviciile digitale ale primariei.
              </p>
              {/* RegisterAtPrimarieButton is rendered separately in Task 2 */}
              <Button
                onClick={() => {
                  // Dynamic import to avoid circular dependency at build
                  import("@/actions/registration").then(({ registerAtPrimarie }) => {
                    registerAtPrimarie(primarieId).then((result) => {
                      if (result.success) {
                        toast.success("Cererea de inregistrare a fost trimisa!", {
                          description: "Vei fi notificat cand va fi procesata.",
                        });
                        router.refresh();
                      } else {
                        toast.error("Eroare la inregistrare", {
                          description: result.error ?? "Incearca din nou mai tarziu.",
                        });
                      }
                    });
                  });
                }}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Inregistreaza-te la {primarieName}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation link */}
        <div className="text-center">
          <button
            onClick={handleGoToLocationPicker}
            className="text-muted-foreground hover:text-foreground text-sm underline transition-colors"
          >
            Ai conturi aprobate la alte primarii?
          </button>
        </div>
      </motion.div>
    </div>
  );
}
