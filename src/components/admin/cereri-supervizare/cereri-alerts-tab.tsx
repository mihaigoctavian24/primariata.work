"use client";

import { useMemo, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { AlertTriangle, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reassignCerere } from "@/actions/admin-cereri";
import { stagger, slideIn, defaultTransition } from "@/lib/motion";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Component
// ============================================================================

interface CereriAlertsTabProps {
  cereri: CerereRow[];
  functionari?: FunctionarRow[];
}

function CereriAlertsTab({ cereri, functionari = [] }: CereriAlertsTabProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  const { overdue, escalated } = useMemo(() => {
    const overdue = cereri
      .map((c) => ({ ...c, sla: computeSlaRemaining(c.data_termen) }))
      .filter((c) => c.sla !== null && c.sla < 0)
      .sort((a, b) => (a.sla ?? 0) - (b.sla ?? 0)); // most overdue first

    const escalated = cereri.filter((c) => c.escaladata === true);

    return { overdue, escalated };
  }, [cereri]);

  const getFunctionarName = (id: string | null | undefined): string => {
    if (!id) return "Neasignat";
    const f = functionari.find((fn) => fn.id === id);
    return f ? `${f.prenume} ${f.nume}` : "—";
  };

  function handleQuickReassign(cerereId: string, functionarId: string): void {
    startTransition(async () => {
      const result = await reassignCerere(cerereId, functionarId);
      if (result.success) {
        toast.success("Cerere reasignată");
      } else {
        toast.error(result.error ?? "Eroare la reasignare");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* SLA Overdue Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h3 className="text-foreground text-sm font-semibold">Depășiri SLA</h3>
          {overdue.length > 0 && (
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
              {overdue.length}
            </span>
          )}
        </div>

        {overdue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-400">Nicio depășire SLA</p>
            <p className="text-muted-foreground mt-1 text-xs">Toate cererile sunt la timp</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {overdue.map((cerere) => (
              <motion.div
                key={cerere.id}
                variants={slideIn}
                transition={defaultTransition}
                className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      {cerere.numar_inregistrare}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Funcționar: {getFunctionarName(cerere.preluat_de_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-400">
                    +{Math.abs(cerere.sla ?? 0)}z depășit
                  </span>
                  {functionari.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        const firstFunctionar = functionari[0];
                        if (firstFunctionar) {
                          handleQuickReassign(cerere.id, firstFunctionar.id);
                        }
                      }}
                      className="h-7 gap-1.5 border-red-500/20 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Reasignează
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Escalated Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-foreground text-sm font-semibold">Cereri Escaldate</h3>
          {escalated.length > 0 && (
            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
              {escalated.length}
            </span>
          )}
        </div>

        {escalated.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center">
            <p className="text-muted-foreground text-sm">Nicio cerere escaladată</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {escalated.map((cerere) => (
              <motion.div
                key={cerere.id}
                variants={slideIn}
                transition={defaultTransition}
                className="flex items-start justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400/15">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      {cerere.numar_inregistrare}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Status: {cerere.status} · Funcționar:{" "}
                      {getFunctionarName(cerere.preluat_de_id)}
                    </p>
                    {/* Show escalation note if present */}
                    {Array.isArray(cerere.note_admin) &&
                      (cerere.note_admin as unknown[]).length > 0 && (
                        <p className="text-muted-foreground mt-1 text-[0.7rem]">
                          Ultima notă:{" "}
                          {String(
                            (
                              (cerere.note_admin as Array<{ text?: string }>)[
                                (cerere.note_admin as unknown[]).length - 1
                              ] as { text?: string } | undefined
                            )?.text ?? ""
                          ).slice(0, 80)}
                          ...
                        </p>
                      )}
                  </div>
                </div>
                <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  Escaldat
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export { CereriAlertsTab };
export type { CereriAlertsTabProps };
