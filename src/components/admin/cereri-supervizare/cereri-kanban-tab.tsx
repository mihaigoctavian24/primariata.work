"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DB_TO_UI_STATUS, UI_TO_DB_STATUS } from "@/lib/cereri-status";
import { updateCerereStatus } from "@/actions/admin-cereri";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Constants
// ============================================================================

/** UI status columns — ordering matches process flow */
const KANBAN_COLUMNS: Array<{
  ui: string;
  label: string;
  colorClass: string;
  headerClass: string;
}> = [
  {
    ui: "depusa",
    label: "Depusă",
    colorClass: "border-sky-500/30 bg-sky-500/5",
    headerClass: "text-sky-400",
  },
  {
    ui: "verificare",
    label: "Verificare",
    colorClass: "border-violet-500/30 bg-violet-500/5",
    headerClass: "text-violet-400",
  },
  {
    ui: "info_supl",
    label: "Info suplimenare",
    colorClass: "border-orange-400/30 bg-orange-400/5",
    headerClass: "text-orange-400",
  },
  {
    ui: "procesare",
    label: "Procesare",
    colorClass: "border-cyan-500/30 bg-cyan-500/5",
    headerClass: "text-cyan-400",
  },
  {
    ui: "aprobata",
    label: "Aprobată",
    colorClass: "border-emerald-500/30 bg-emerald-500/5",
    headerClass: "text-emerald-400",
  },
  {
    ui: "respinsa",
    label: "Respinsă",
    colorClass: "border-red-500/30 bg-red-500/5",
    headerClass: "text-red-400",
  },
];

const PRIORITATE_CLASSES: Record<string, string> = {
  urgenta: "bg-red-500/15 text-red-400",
  ridicata: "bg-orange-400/15 text-orange-400",
  medie: "bg-amber-400/15 text-amber-400",
  scazuta: "bg-muted/50 text-muted-foreground",
};

const PRIORITATE_LABELS: Record<string, string> = {
  urgenta: "Urgentă",
  ridicata: "Ridicată",
  medie: "Medie",
  scazuta: "Scăzută",
};

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function slaClass(days: number | null): string {
  if (days === null) return "text-muted-foreground";
  if (days < 0) return "text-red-400";
  if (days <= 2) return "text-amber-400";
  if (days <= 7) return "text-yellow-400";
  return "text-muted-foreground";
}

// ============================================================================
// Component
// ============================================================================

interface CereriKanbanTabProps {
  cereri: CerereRow[];
  functionari: FunctionarRow[];
  onStatusChange: (id: string, newDbStatus: string) => void;
}

function CereriKanbanTab({
  cereri,
  functionari,
  onStatusChange,
}: CereriKanbanTabProps): React.ReactElement {
  const [cereriState, setCereriState] = useState<CerereRow[]>(cereri);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const getFunctionarName = (id: string | null | undefined): string => {
    if (!id) return "—";
    const f = functionari.find((fn) => fn.id === id);
    return f ? `${f.prenume} ${f.nume}` : "—";
  };

  function getUiStatus(dbStatus: string): string {
    return DB_TO_UI_STATUS[dbStatus] ?? dbStatus;
  }

  function handleMove(cerereId: string, targetUiStatus: string): void {
    const newDbStatus = UI_TO_DB_STATUS[targetUiStatus];
    if (!newDbStatus) return;

    // Optimistic update
    setCereriState((prev) =>
      prev.map((c) => (c.id === cerereId ? { ...c, status: newDbStatus } : c))
    );
    setSelectedCard(null);

    // Call server action
    startTransition(async () => {
      const result = await updateCerereStatus(cerereId, newDbStatus);
      if (!result.success) {
        // Revert optimistic update
        setCereriState(cereri);
        toast.error(result.error ?? "Eroare la actualizare status");
      } else {
        onStatusChange(cerereId, newDbStatus);
      }
    });
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-3">
        {KANBAN_COLUMNS.map((col) => {
          const colCereri = cereriState.filter((c) => getUiStatus(c.status) === col.ui);

          return (
            <div
              key={col.ui}
              className={cn(
                "flex w-56 flex-shrink-0 flex-col rounded-2xl border p-3",
                col.colorClass
              )}
            >
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn("text-xs font-semibold tracking-wide uppercase", col.headerClass)}
                >
                  {col.label}
                </span>
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold",
                    col.headerClass,
                    col.colorClass
                  )}
                >
                  {colCereri.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {colCereri.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                    <span className="text-muted-foreground text-xs">Gol</span>
                  </div>
                )}
                {colCereri.map((cerere) => {
                  const sla = computeSlaRemaining(cerere.data_termen);
                  const isSelected = selectedCard === cerere.id;

                  return (
                    <motion.div
                      key={cerere.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "relative cursor-pointer rounded-xl border bg-white/[0.04] p-3 transition-all",
                        "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06]",
                        isSelected && "border-white/20 bg-white/[0.08] ring-1 ring-white/10"
                      )}
                      onClick={() => setSelectedCard(isSelected ? null : cerere.id)}
                    >
                      {/* Card header */}
                      <div className="mb-2 flex items-start justify-between gap-1">
                        <span className="text-foreground font-mono text-xs leading-tight font-semibold">
                          {cerere.numar_inregistrare}
                        </span>
                        {isSelected && (
                          <X
                            className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCard(null);
                            }}
                          />
                        )}
                      </div>

                      {/* Priority badge */}
                      {cerere.prioritate && (
                        <span
                          className={cn(
                            "mb-2 inline-flex rounded-md px-1.5 py-0.5 text-[0.6rem] font-semibold",
                            PRIORITATE_CLASSES[cerere.prioritate] ??
                              "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {PRIORITATE_LABELS[cerere.prioritate] ?? cerere.prioritate}
                        </span>
                      )}

                      {/* Functionar */}
                      <p className="text-muted-foreground mb-1 truncate text-[0.65rem]">
                        {getFunctionarName(cerere.preluat_de_id)}
                      </p>

                      {/* SLA remaining */}
                      {sla !== null && (
                        <p className={cn("text-[0.65rem] font-medium", slaClass(sla))}>
                          {sla < 0 ? `+${Math.abs(sla)}z depășit` : `${sla}z SLA`}
                        </p>
                      )}

                      {/* Note indicator */}
                      {Array.isArray(cerere.note_admin) &&
                        (cerere.note_admin as unknown[]).length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="bg-accent-500/20 text-accent-400 rounded-md px-1.5 py-0.5 text-[0.6rem]">
                              {(cerere.note_admin as unknown[]).length} note
                            </span>
                          </div>
                        )}

                      {/* Move overlay */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <p className="text-muted-foreground mb-1.5 text-[0.62rem] font-medium tracking-wide uppercase">
                              Mută în:
                            </p>
                            <div className="flex flex-col gap-1">
                              {KANBAN_COLUMNS.filter((c) => c.ui !== col.ui).map((dest) => (
                                <button
                                  key={dest.ui}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMove(cerere.id, dest.ui);
                                  }}
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-lg px-2 py-1 text-left text-[0.65rem] font-medium transition-colors",
                                    "hover:bg-white/10",
                                    dest.headerClass
                                  )}
                                >
                                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                                  {dest.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CereriKanbanTab };
export type { CereriKanbanTabProps };
