"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingRegistrations, approveRegistration } from "@/actions/admin-registration";
import { RejectRegistrationDialog } from "@/components/admin/RejectRegistrationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface PendingRegistrationsWidgetProps {
  judet: string;
  localitate: string;
  primarieId: string;
}

export function PendingRegistrationsWidget({
  judet,
  localitate,
  primarieId,
}: PendingRegistrationsWidgetProps) {
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pending-registrations", primarieId],
    queryFn: async () => {
      const result = await getPendingRegistrations(primarieId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!primarieId,
  });

  const pendingCount = data?.length ?? 0;
  const recentEntries = data?.slice(0, 3) ?? [];

  async function handleApprove(registrationId: string): Promise<void> {
    setApprovingId(registrationId);
    try {
      const result = await approveRegistration(registrationId, primarieId);
      if (result.success) {
        toast.success("Inregistrare aprobata cu succes");
        queryClient.invalidateQueries({ queryKey: ["pending-registrations", primarieId] });
      } else {
        toast.error(result.error ?? "Eroare la aprobare");
      }
    } catch {
      toast.error("Eroare la aprobare");
    } finally {
      setApprovingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (pendingCount === 0) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm text-green-700 dark:text-green-300">
          Nici o inregistrare in asteptare
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header with count */}
      <div className="mb-3 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">Inregistrari in asteptare</span>
        <Badge className="bg-amber-500 text-white hover:bg-amber-500">{pendingCount}</Badge>
      </div>

      {/* Recent entries */}
      <div className="space-y-2">
        {recentEntries.map((reg) => {
          const user = reg.utilizatori;
          const initial = (user.prenume?.[0] ?? user.email?.[0] ?? "?").toUpperCase();
          const fullName = `${user.prenume} ${user.nume}`;
          const dateStr = new Date(reg.created_at).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "short",
          });

          return (
            <div
              key={reg.id}
              className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
            >
              {/* Avatar placeholder */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {initial}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fullName}</p>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="truncate">{user.email}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {dateStr}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/30"
                  onClick={() => handleApprove(reg.id)}
                  disabled={approvingId === reg.id}
                  title="Aproba"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                  onClick={() => setRejectTarget({ id: reg.id, name: fullName })}
                  title="Respinge"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View all link */}
      {pendingCount > 3 && (
        <Link
          href={`/app/${judet}/${localitate}/admin/registrations`}
          className="text-primary mt-3 flex items-center justify-center gap-1 text-sm font-medium hover:underline"
        >
          Vedeti toate ({pendingCount})
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}

      {pendingCount <= 3 && (
        <Link
          href={`/app/${judet}/${localitate}/admin/registrations`}
          className="text-primary mt-3 flex items-center justify-center gap-1 text-sm font-medium hover:underline"
        >
          Vedeti toate
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <RejectRegistrationDialog
          open={!!rejectTarget}
          onOpenChange={(open) => {
            if (!open) setRejectTarget(null);
          }}
          registrationId={rejectTarget.id}
          primarieId={primarieId}
          userName={rejectTarget.name}
          onSuccess={() => {
            setRejectTarget(null);
            queryClient.invalidateQueries({ queryKey: ["pending-registrations", primarieId] });
          }}
        />
      )}
    </div>
  );
}
