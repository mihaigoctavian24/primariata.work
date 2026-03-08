"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DB_TO_UI_STATUS, UI_TO_DB_STATUS } from "@/lib/cereri-status";
import { changePriorityCerere } from "./actions";
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
    colorClass: "border-sky-500/30 bg-[var(--color-info)]/5",
    headerClass: "text-[var(--color-info)]",
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
    colorClass: "border-orange-400/30 bg-[var(--color-warning)]/5",
    headerClass: "text-[var(--color-warning)]",
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
    colorClass: "border-emerald-500/30 bg-[var(--color-success)]/5",
    headerClass: "text-[var(--color-success)]",
  },
  {
    ui: "respinsa",
    label: "Respinsă",
    colorClass: "border-red-500/30 bg-[var(--color-error)]/5",
    headerClass: "text-[var(--color-error)]",
  },
];

const PRIORITATE_CLASSES: Record<string, string> = {
  urgenta: "bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error)]/20",
  ridicata: "bg-orange-400/15 text-orange-400 border-orange-400/20",
  medie: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  scazuta: "bg-[var(--color-neutral-subtle)] text-[var(--color-neutral)] border-[var(--color-neutral)]/20",
};

const PRIORITATE_LABELS: Record<string, string> = {
  urgenta: "Urgentă",
  ridicata: "Ridicată",
  medie: "Medie",
  scazuta: "Scăzută",
};

const DB_PRIORITES = ["urgenta", "ridicata", "medie", "scazuta"] as const;

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
  if (days < 0) return "text-[var(--color-error)]";
  if (days <= 3) return "text-[var(--color-warning)]";
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
  const [openPriorityDropdown, setOpenPriorityDropdown] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function handlePriorityChange(cerereId: string, p: string): void {
    if (isPending) return;
    startTransition(async () => {
      const result = await changePriorityCerere(cerereId, p as any);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Prioritate actualizată: ${PRIORITATE_LABELS[p]}`);
        setOpenPriorityDropdown(null);
        // Optimistic refresh triggers externally from onStatusChange if we wanted to trick it, 
        // but server action revalidatePath covers it.
        onStatusChange(cerereId, "refresh_prioritate"); // Trigger re-render
      }
    });
  }

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-3">
          {KANBAN_COLUMNS.map((col) => {
            const colCereri = cereri.filter((c) => getUiStatus(c.status) === col.ui);

            return (
              <div
                key={col.ui}
                className={cn(
                  "flex w-64 flex-shrink-0 flex-col rounded-2xl border p-3",
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

                {/* Cards list */}
                <div className="max-h-[600px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {colCereri.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                        <span className="text-muted-foreground text-xs">Gol</span>
                      </div>
                    ) : (
                      colCereri.map((cerere) => {
                        const sla = computeSlaRemaining(cerere.data_termen);
                        const isDropdownOpen = openPriorityDropdown === cerere.id;

                        return (
                          <motion.div
                            key={cerere.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "mb-2 cursor-pointer rounded-xl border bg-card p-3 shadow-sm transition-all relative",
                              "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.06]"
                            )}
                            onClick={(e) => {
                              // If dropdown is open, clicking body closes it
                              if (isDropdownOpen) {
                                setOpenPriorityDropdown(null);
                                return;
                              }
                              openMoveDialog(cerere.id, cerere.status);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-foreground font-mono text-xs leading-tight font-semibold">
                                {cerere.numar_inregistrare}
                              </p>
                              
                              {/* Dropdown Priority Badge */}
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setOpenPriorityDropdown(isDropdownOpen ? null : cerere.id)}
                                  className={cn(
                                    "flex items-center gap-1 inline-flex rounded-md border px-1.5 py-0.5 text-[0.6rem] font-semibold transition-colors",
                                    cerere.prioritate 
                                      ? PRIORITATE_CLASSES[cerere.prioritate]
                                      : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                                  )}
                                >
                                  {cerere.prioritate ? PRIORITATE_LABELS[cerere.prioritate] : "Prioritate"}
                                  <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                                </button>
                                
                                <AnimatePresence>
                                  {isDropdownOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                      transition={{ duration: 0.1 }}
                                      className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-popover p-1 shadow-md z-10"
                                    >
                                      {DB_PRIORITES.map((p) => (
                                        <button
                                          key={p}
                                          disabled={isPending}
                                          onClick={() => handlePriorityChange(cerere.id, p)}
                                          className={cn(
                                            "w-full text-left rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent",
                                            cerere.prioritate === p && "bg-accent/50 text-foreground"
                                          )}
                                        >
                                          {PRIORITATE_LABELS[p]}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <p className="text-muted-foreground mt-2 truncate text-[0.65rem]">
                              {getFunctionarName(cerere.preluat_de_id)}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              {sla !== null ? (
                                <p className={cn("text-[0.65rem] font-medium bg-background px-1.5 py-0.5 rounded-md border border-white/[0.04]", slaClass(sla))}>
                                  {sla < 0 ? `+${Math.abs(sla)}z depășit` : `${sla}z SLA`}
                                </p>
                              ) : <span />}

                              {Array.isArray(cerere.note_admin) && (cerere.note_admin as unknown[]).length > 0 && (
                                <span className="bg-accent-500/20 text-accent-400 rounded-md px-1.5 py-0.5 text-[0.6rem] font-semibold">
                                  {(cerere.note_admin as unknown[]).length} note
                                </span>
                              )}
                            </div>
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
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setMoveDialog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                <p className="text-foreground text-sm font-semibold">Mută cererea în:</p>
                <button
                  onClick={() => setMoveDialog(null)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors hover:bg-white/10"
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
                          "flex items-center justify-center rounded-xl border px-3 py-3 text-xs font-medium transition-all shadow-sm",
                          isCurrent
                            ? "cursor-default opacity-40 bg-muted/50 border-transparent shadow-none"
                            : "cursor-pointer hover:border-border hover:bg-accent bg-background border-white/[0.04]",
                          !isCurrent && dest.headerClass
                        )}
                      >
                        {dest.label}
                        {isCurrent && (
                          <span className="ml-1.5 text-[0.6rem] font-normal opacity-70">curent</span>
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
