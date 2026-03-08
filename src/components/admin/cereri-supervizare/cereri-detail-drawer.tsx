"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  X,
  ShieldAlert,
  UserCheck,
  StickyNote,
  ArrowUpCircle,
  Lock,
  Unlock,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  updateCerereStatus,
  addCerereNote,
  reassignCerere,
  escalateCerere,
  changePriorityCerere,
} from "./actions";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Constants
// ============================================================================

const STATUS_LABELS: Record<string, string> = {
  depusa: "Depusă",
  in_verificare: "În verificare",
  info_suplimentara: "Info suplimentare",
  in_procesare: "În procesare",
  aprobata: "Aprobată",
  respinsa: "Respinsă",
};

const STATUS_CLASSES: Record<string, string> = {
  depusa: "text-[var(--color-info)]",
  in_verificare: "text-[var(--color-info)]",
  info_suplimentara: "text-[var(--color-warning)]",
  in_procesare: "text-cyan-400",
  aprobata: "text-[var(--color-success)]",
  respinsa: "text-[var(--color-error)]",
};

const DB_STATUSES = [
  "depusa",
  "in_verificare",
  "info_suplimentara",
  "in_procesare",
  "aprobata",
  "respinsa",
] as const;

const PRIORITATE_LABELS: Record<string, string> = {
  urgenta: "Urgentă",
  ridicata: "Ridicată",
  medie: "Medie",
  scazuta: "Scăzută",
};

const PRIORITATE_CLASSES: Record<string, string> = {
  urgenta: "bg-[var(--color-error-subtle)] text-[var(--color-error)]",
  ridicata: "bg-orange-400/15 text-orange-400",
  medie: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
  scazuta: "bg-[var(--color-neutral-subtle,rgba(148,163,184,0.1))] text-muted-foreground",
};

const DB_PRIORITATES = ["urgenta", "ridicata", "medie", "scazuta"] as const;

// ============================================================================
// Types
// ============================================================================

interface CereriDetailDrawerProps {
  cerere: CerereRow | null;
  functionari: FunctionarRow[];
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

interface AuditEntry {
  timestamp?: string;
  action?: string;
  actor?: string;
  details?: string;
}

interface NoteEntry {
  text?: string;
  timestamp?: string;
  actor?: string;
}

// ============================================================================
// Section components
// ============================================================================

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
      <Icon className="text-muted-foreground h-3.5 w-3.5" />
      <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

function CereriDetailDrawer({
  cerere,
  functionari,
  open,
  onClose,
  onStatusChange,
}: CereriDetailDrawerProps): React.ReactElement {
  const [forceStatus, setForceStatus] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [reassignFunctionarId, setReassignFunctionarId] = useState(functionari[0]?.id ?? "");
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleForceStatus(): void {
    if (!cerere || !forceStatus) return;
    startTransition(async () => {
      const result = await updateCerereStatus(cerere.id, forceStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status schimbat → ${STATUS_LABELS[forceStatus] ?? forceStatus}`);
        onStatusChange(cerere.id, forceStatus);
        setForceStatus("");
      }
    });
  }

  function handleUnblock(): void {
    if (!cerere) return;
    startTransition(async () => {
      const result = await updateCerereStatus(cerere.id, "in_verificare");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cerere deblocată → În verificare");
        onStatusChange(cerere.id, "in_verificare");
      }
    });
  }

  function handleChangePriority(p: "urgenta" | "ridicata" | "medie" | "scazuta"): void {
    if (!cerere) return;
    startTransition(async () => {
      const result = await changePriorityCerere(cerere.id, p);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Prioritate → ${PRIORITATE_LABELS[p]}`);
      }
    });
  }

  function handleEscalate(): void {
    if (!cerere) return;
    startTransition(async () => {
      const result = await escalateCerere(cerere.id, escalateNote);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cerere escaladată la Primar");
        setEscalateNote("");
        onStatusChange(cerere.id, cerere.status);
      }
    });
  }

  function handleReassign(): void {
    if (!cerere || !reassignFunctionarId) return;
    startTransition(async () => {
      const result = await reassignCerere(cerere.id, reassignFunctionarId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cerere reasignată");
      }
    });
  }

  function handleAddNote(): void {
    if (!cerere || !newNote.trim()) return;
    startTransition(async () => {
      const result = await addCerereNote(cerere.id, newNote);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Notă adăugată");
        setNewNote("");
      }
    });
  }

  const notes: NoteEntry[] = Array.isArray(cerere?.note_admin)
    ? (cerere.note_admin as NoteEntry[])
    : [];

  const auditTrail: AuditEntry[] = Array.isArray((cerere as unknown as Record<string, unknown>)?.["audit_trail"])
    ? ((cerere as unknown as Record<string, unknown>)["audit_trail"] as AuditEntry[])
    : [];

  return (
    <AnimatePresence>
      {open && cerere && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/40"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed top-0 right-0 z-[91] flex h-full w-[560px] max-w-full flex-col overflow-hidden border-l border-white/[0.07] bg-[var(--popover)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="min-w-0">
                <p className="text-foreground font-mono text-sm font-bold">
                  {cerere.numar_inregistrare}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Detalii cerere
                  {cerere.escaladata && (
                    <span className="text-[var(--color-error)] ml-2 font-semibold">
                      · Escaladată
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground ml-3 shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

              {/* ── Status section ── */}
              <div className="space-y-3">
                <SectionHeader icon={ShieldAlert} label="Status & Blocare" />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-muted-foreground text-xs">Status curent:</span>
                  <span
                    className={cn(
                      "rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-semibold",
                      STATUS_CLASSES[cerere.status] ?? "text-muted-foreground"
                    )}
                  >
                    {STATUS_LABELS[cerere.status] ?? cerere.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={forceStatus}
                    onChange={(e) => setForceStatus(e.target.value)}
                    className="border-border bg-background/60 text-foreground h-8 flex-1 min-w-[160px] rounded-lg border px-2 text-xs focus:outline-none"
                  >
                    <option value="">Forțează status...</option>
                    {DB_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || !forceStatus}
                    onClick={handleForceStatus}
                    className="h-8 text-xs"
                  >
                    Aplică
                  </Button>
                </div>

                {/* Unblock button */}
                {(cerere as any).blocata === true && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleUnblock}
                    className="h-8 gap-2 text-xs text-[var(--color-warning)] border-[var(--color-warning)]/30 hover:bg-[var(--color-warning)]/10"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    Deblochează cererea
                  </Button>
                )}
              </div>

              {/* ── Priority section ── */}
              <div className="space-y-3">
                <SectionHeader icon={ArrowUpCircle} label="Prioritate" />
                <div className="flex flex-wrap gap-2">
                  {DB_PRIORITATES.map((p) => (
                    <button
                      key={p}
                      disabled={isPending || cerere.prioritate === p}
                      onClick={() => handleChangePriority(p)}
                      className={cn(
                        "rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition-all",
                        cerere.prioritate === p
                          ? cn(PRIORITATE_CLASSES[p], "opacity-100 ring-1 ring-white/20")
                          : cn(
                              PRIORITATE_CLASSES[p],
                              "opacity-50 hover:opacity-100 disabled:cursor-not-allowed"
                            )
                      )}
                    >
                      {PRIORITATE_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Escalate section ── */}
              <div className="space-y-3">
                <SectionHeader icon={Lock} label="Escaladare la Primar" />
                {cerere.escaladata ? (
                  <p className="text-[var(--color-error)] text-xs font-medium">
                    Această cerere a fost deja escaladată.
                  </p>
                ) : (
                  <>
                    <textarea
                      value={escalateNote}
                      onChange={(e) => setEscalateNote(e.target.value)}
                      placeholder="Notă de escaladare (opțional)..."
                      rows={2}
                      className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border px-3 py-2 text-xs focus:outline-none"
                    />
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={handleEscalate}
                      className="h-8 gap-2 text-xs bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/20"
                      variant="outline"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Escaladează la Primar
                    </Button>
                  </>
                )}
              </div>

              {/* ── Reassign section ── */}
              <div className="space-y-3">
                <SectionHeader icon={UserCheck} label="Reasignare Funcționar" />
                {functionari.length === 0 ? (
                  <p className="text-muted-foreground text-xs">Niciun funcționar disponibil</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={reassignFunctionarId}
                      onChange={(e) => setReassignFunctionarId(e.target.value)}
                      className="border-border bg-background/60 text-foreground h-8 flex-1 min-w-[160px] rounded-lg border px-2 text-xs focus:outline-none"
                    >
                      {functionari.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.prenume} {f.nume}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending || !reassignFunctionarId}
                      onClick={handleReassign}
                      className="h-8 text-xs"
                    >
                      Reasignează
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Admin Notes section ── */}
              <div className="space-y-3">
                <SectionHeader icon={StickyNote} label="Note Admin" />

                {notes.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {notes.map((n, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                      >
                        <p className="text-foreground text-xs">{n.text}</p>
                        {n.timestamp && (
                          <p className="text-muted-foreground mt-1 text-[0.65rem]">
                            {n.actor ?? "Admin"} ·{" "}
                            {new Date(n.timestamp).toLocaleString("ro-RO")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Adaugă o notă de admin..."
                  rows={3}
                  className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border px-3 py-2 text-xs focus:outline-none"
                />
                <Button
                  size="sm"
                  disabled={isPending || !newNote.trim()}
                  onClick={handleAddNote}
                  className="h-8 text-xs"
                >
                  Adaugă notă
                </Button>
              </div>

              {/* ── Audit Trail section ── */}
              <div className="space-y-3">
                <SectionHeader icon={Clock} label="Audit Trail" />
                {auditTrail.length === 0 ? (
                  <p className="text-muted-foreground text-xs">Audit trail indisponibil</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {auditTrail.map((entry, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-foreground text-xs font-medium">
                              {entry.action ?? "Acțiune"}
                            </p>
                            {entry.details && (
                              <p className="text-muted-foreground mt-0.5 text-[0.65rem]">
                                {entry.details}
                              </p>
                            )}
                          </div>
                          {entry.timestamp && (
                            <span className="text-muted-foreground shrink-0 text-[0.65rem]">
                              {new Date(entry.timestamp).toLocaleString("ro-RO")}
                            </span>
                          )}
                        </div>
                        {entry.actor && (
                          <p className="text-muted-foreground mt-1 text-[0.65rem]">
                            {entry.actor}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-white/[0.07] px-5 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 w-full text-xs"
              >
                Închide
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { CereriDetailDrawer };
export type { CereriDetailDrawerProps };
