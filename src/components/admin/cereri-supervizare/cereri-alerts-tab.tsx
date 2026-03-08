"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Clock, CheckCircle2, Lock } from "lucide-react";
import { stagger, defaultTransition, slideIn } from "@/lib/motion";
import type { CerereRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Cerere is "blocked" if status is info_suplimentara and was created more than 7 days ago */
function isBlocked(cerere: CerereRow): boolean {
  if (cerere.status !== "info_suplimentara") return false;
  if (!cerere.created_at) return false;
  const ageDays = (Date.now() - new Date(cerere.created_at).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > 7;
}

// ============================================================================
// Empty state helper
// ============================================================================

function EmptyState({ label }: { label: string }): React.ReactElement {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-8 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      </div>
      <p className="text-sm font-medium text-emerald-400">Nicio alertă activă</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}

// ============================================================================
// Section header
// ============================================================================

function SectionHeader({
  icon: Icon,
  label,
  count,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  colorClass: string;
}): React.ReactElement {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <h3 className="text-foreground text-sm font-semibold">{label}</h3>
      {count > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass} bg-current/15`}
          style={{
            background: colorClass.includes("red")
              ? "rgba(239,68,68,0.12)"
              : colorClass.includes("amber")
                ? "rgba(245,158,11,0.12)"
                : "rgba(251,146,60,0.12)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

interface CereriAlertsTabProps {
  cereri: CerereRow[];
}

function CereriAlertsTab({ cereri }: CereriAlertsTabProps): React.ReactElement {
  const { slaRisc, escalate, blocked } = useMemo(() => {
    const now = Date.now();

    const slaRisc = cereri
      .map((c) => ({ ...c, remaining: computeSlaRemaining(c.data_termen) }))
      .filter((c) => c.remaining !== null && c.remaining <= 3)
      .sort((a, b) => (a.remaining ?? 0) - (b.remaining ?? 0));

    const escalate = cereri.filter((c) => c.escaladata === true);

    const blocked = cereri.filter(isBlocked).map((c) => ({
      ...c,
      ageDays: Math.floor((now - new Date(c.created_at!).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return { slaRisc, escalate, blocked };
  }, [cereri]);

  return (
    <div className="space-y-8">
      {/* ── Section 1: SLA Breach Risk ── */}
      <div>
        <SectionHeader
          icon={Clock}
          label="Risc SLA (≤3 zile)"
          count={slaRisc.length}
          colorClass="text-red-400"
        />

        {slaRisc.length === 0 ? (
          <EmptyState label="Toate cererile au SLA confortabil" />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {slaRisc.map((cerere) => {
              const isOverdue = (cerere.remaining ?? 0) < 0;
              return (
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
                      <p className="text-muted-foreground text-xs">Status: {cerere.status}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-400">
                    {isOverdue
                      ? `+${Math.abs(cerere.remaining ?? 0)}z depășit`
                      : `${cerere.remaining}z rămase`}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Section 2: Escalated ── */}
      <div>
        <SectionHeader
          icon={AlertTriangle}
          label="Cereri escaldate"
          count={escalate.length}
          colorClass="text-amber-400"
        />

        {escalate.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-6 text-center">
            <p className="text-muted-foreground text-sm">Nicio cerere escaladată</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {escalate.map((cerere) => {
              const lastNote = Array.isArray(cerere.note_admin)
                ? ((
                    (cerere.note_admin as Array<{ text?: string }>)[
                      (cerere.note_admin as unknown[]).length - 1
                    ] as { text?: string } | undefined
                  )?.text ?? "")
                : "";

              return (
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
                      <p className="text-muted-foreground text-xs">Status: {cerere.status}</p>
                      {lastNote && (
                        <p className="text-muted-foreground mt-1 text-[0.7rem]">
                          Notă: {lastNote.slice(0, 80)}
                          {lastNote.length > 80 ? "…" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    Escaldat
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Section 3: Blocked (info_suplimentara > 7 days) ── */}
      <div>
        <SectionHeader
          icon={Lock}
          label="Cereri blocate (&gt;7 zile în info supl.)"
          count={blocked.length}
          colorClass="text-orange-400"
        />

        {blocked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-6 text-center">
            <p className="text-muted-foreground text-sm">Nicio cerere blocată</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {blocked.map((cerere) => (
              <motion.div
                key={cerere.id}
                variants={slideIn}
                transition={defaultTransition}
                className="flex items-center justify-between rounded-xl border border-orange-400/20 bg-orange-400/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-400/15">
                    <Lock className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      {cerere.numar_inregistrare}
                    </p>
                    <p className="text-muted-foreground text-xs">Blocat de {cerere.ageDays} zile</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-orange-400">Info suplimenare</span>
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
