"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingRegistrations, approveRegistration } from "@/actions/admin-registration";
import { RejectRegistrationDialog } from "@/components/admin/RejectRegistrationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, CheckCircle, XCircle, Clock, ArrowLeft, Inbox } from "lucide-react";
import { toast } from "sonner";

interface RegistrationQueueProps {
  judet: string;
  localitate: string;
  primarieId: string;
}

export function RegistrationQueue({ judet, localitate, primarieId }: RegistrationQueueProps) {
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
  const registrations = data ?? [];

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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/app/${judet}/${localitate}`}
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Inapoi la dashboard
        </Link>

        <div className="flex items-center gap-3">
          <UserPlus className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">Inregistrari in Asteptare</h1>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500">{pendingCount}</Badge>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pendingCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <Inbox className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Toate inregistrarile au fost procesate</h2>
          <p className="text-muted-foreground text-sm">
            Nu exista inregistrari in asteptare in acest moment.
          </p>
        </div>
      )}

      {/* Registration list */}
      {!isLoading && pendingCount > 0 && (
        <div className="space-y-3">
          {registrations.map((reg) => {
            const user = reg.utilizatori;
            const initial = (user.prenume?.[0] ?? user.email?.[0] ?? "?").toUpperCase();
            const fullName = `${user.prenume} ${user.nume}`;
            const dateStr = new Date(reg.created_at).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const timeStr = new Date(reg.created_at).toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={reg.id}
                className="bg-card flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                {/* Avatar + Info */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{fullName}</p>
                    <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    {dateStr}, {timeStr}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleApprove(reg.id)}
                    disabled={approvingId === reg.id}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    {approvingId === reg.id ? "Se aproba..." : "Aproba"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setRejectTarget({ id: reg.id, name: fullName })}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Respinge
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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
