"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DB_TO_UI_STATUS, UI_TO_DB_STATUS } from "@/lib/cereri-status";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Constants
// ============================================================================

interface KanbanColumn {
  ui: string;
  label: string;
  colorClass: string;
  headerClass: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
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
    label: "Info supl.",
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
  if (days <= 3) return "text-amber-400";
  if (days <= 7) return "text-yellow-400";
  return "text-muted-foreground";
}

// ============================================================================
// Move dialog state
// ============================================================================

interface MoveDialogState {
  cerereId: string;
  currentUiStatus: string;
}

// ============================================================================
// Types
// ============================================================================

interface CereriKanbanTabProps {
  cereri: CerereRow[];
  functionari?: FunctionarRow[];
  onStatusChange: (cerereId: string, newDbStatus: string) => void;
}

// ============================================================================
// Component
// ============================================================================

function CereriKanbanTab({
  cereri,
  functionari = [],
  onStatusChange,
}: CereriKanbanTabProps): React.ReactElement {
  const [moveDialog, setMoveDialog] = useState<MoveDialogState | null>(null);

  function getUiStatus(dbStatus: string): string {
    return DB_TO_UI_STATUS[dbStatus] ?? dbStatus;
  }

  function getFunctionarName(id: string | null | undefined): string {
    if (!id) return "—";
    const f = functionari.find((fn) => fn.id === id);
    return f ? `${f.prenume} ${f.nume}` : "—";
  }

  function openMoveDialog(cerereId: string, currentDbStatus: string): void {
    setMoveDialog({ cerereId, currentUiStatus: getUiStatus(currentDbStatus) });
  }

  function handleMove(targetUiStatus: string): void {
    if (!moveDialog) return;
    const newDbStatus = UI_TO_DB_STATUS[targetUiStatus];
    if (!newDbStatus) return;

    setMoveDialog(null);
    onStatusChange(moveDialog.cerereId, newDbStatus);
  }

  return (
    <>
      {/* ── Kanban board ── */}
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-3">
          {KANBAN_COLUMNS.map((col) => {
            const colCereri = cereri.filter((c) => getUiStatus(c.status) === col.ui);

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
                      col.headerClass
                    )}
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    {colCereri.length}
                  </span>
                </div>

                {/* Cards list with AnimatePresence */}
                <div className="max-h-[600px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {colCereri.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                        <span className="text-muted-foreground text-xs">Gol</span>
                      </div>
                    ) : (
                      colCereri.map((cerere) => {
                        const sla = computeSlaRemaining(cerere.data_termen);

                        return (
                          <motion.div
                            key={cerere.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "mb-2 cursor-pointer rounded-xl border bg-white/[0.04] p-3 transition-all",
                              "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.06]"
                            )}
                            onClick={() => openMoveDialog(cerere.id, cerere.status)}
                          >
                            {/* Registration number */}
                            <p className="text-foreground font-mono text-xs leading-tight font-semibold">
                              {cerere.numar_inregistrare}
                            </p>

                            {/* Priority badge */}
                            {cerere.prioritate && (
                              <span
                                className={cn(
                                  "mt-1.5 inline-flex rounded-md px-1.5 py-0.5 text-[0.6rem] font-semibold",
                                  PRIORITATE_CLASSES[cerere.prioritate] ??
                                    "bg-muted/50 text-muted-foreground"
                                )}
                              >
                                {PRIORITATE_LABELS[cerere.prioritate] ?? cerere.prioritate}
                              </span>
                            )}

                            {/* Functionar */}
                            <p className="text-muted-foreground mt-1.5 truncate text-[0.65rem]">
                              {getFunctionarName(cerere.preluat_de_id)}
                            </p>

                            {/* SLA */}
                            {sla !== null && (
                              <p className={cn("mt-1 text-[0.65rem] font-medium", slaClass(sla))}>
                                {sla < 0 ? `+${Math.abs(sla)}z depășit` : `${sla}z SLA`}
                              </p>
                            )}

                            {/* Note indicator */}
                            {Array.isArray(cerere.note_admin) &&
                              (cerere.note_admin as unknown[]).length > 0 && (
                                <div className="mt-1.5">
                                  <span className="bg-accent-500/20 text-accent-400 rounded-md px-1.5 py-0.5 text-[0.6rem]">
                                    {(cerere.note_admin as unknown[]).length} note
                                  </span>
                                </div>
                              )}
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status-change dialog (click-to-move, no dnd-kit) ── */}
      <AnimatePresence>
        {moveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setMoveDialog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--popover)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <p className="text-foreground text-sm font-semibold">Mută cererea în:</p>
                <button
                  onClick={() => setMoveDialog(null)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status buttons */}
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {KANBAN_COLUMNS.map((dest) => {
                    const isCurrent = dest.ui === moveDialog.currentUiStatus;
                    return (
                      <button
                        key={dest.ui}
                        disabled={isCurrent}
                        onClick={() => handleMove(dest.ui)}
                        className={cn(
                          "flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                          isCurrent
                            ? "cursor-default opacity-40"
                            : "cursor-pointer hover:bg-white/10",
                          dest.headerClass
                        )}
                        style={{
                          background: isCurrent ? "rgba(255,255,255,0.06)" : undefined,
                          border: `1px solid ${isCurrent ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        {dest.label}
                        {isCurrent && (
                          <span className="ml-1.5 text-[0.6rem] opacity-70">curent</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { CereriKanbanTab };
export type { CereriKanbanTabProps };
