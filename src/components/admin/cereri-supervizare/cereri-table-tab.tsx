"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  StickyNote,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { addCerereNote, reassignCerere } from "./actions";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, string> = {
  depusa: "Depusă",
  in_verificare: "În verificare",
  info_suplimentara: "Info suplimentare",
  in_procesare: "În procesare",
  aprobata: "Aprobată",
  respinsa: "Respinsă",
};

const STATUS_CLASSES: Record<string, string> = {
  depusa: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  in_verificare: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  info_suplimentara: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  in_procesare: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  aprobata: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  respinsa: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PRIORITATE_CLASSES: Record<string, string> = {
  urgenta: "bg-red-500/10 text-red-400 border-red-500/20",
  ridicata: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  medie: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  scazuta: "bg-muted/50 text-muted-foreground border-border",
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

function SlaCountdown({ dataTermen }: { dataTermen?: string | null }): React.ReactElement {
  const days = computeSlaRemaining(dataTermen);
  if (days === null) return <span className="text-muted-foreground text-xs">—</span>;

  const colorClass =
    days < 0
      ? "text-red-400"
      : days <= 3
        ? "text-amber-400"
        : days <= 7
          ? "text-yellow-400"
          : "text-muted-foreground";

  return (
    <span className={cn("text-xs font-medium", colorClass)}>
      {days < 0 ? `+${Math.abs(days)}z depășit` : `${days}z rămase`}
    </span>
  );
}

// ============================================================================
// Types
// ============================================================================

interface CereriTableTabProps {
  cereri: CerereRow[];
  functionari: FunctionarRow[];
  onCerereAction?: (cerereId: string, action: "approve" | "reject" | "note" | "reassign") => void;
}

// ============================================================================
// Component
// ============================================================================

function CereriTableTab({
  cereri,
  functionari,
  onCerereAction,
}: CereriTableTabProps): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState("all");
  const [prioritateFilter, setPrioritateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [reassignId, setReassignId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // === Filtering ===
  const filtered = useMemo(() => {
    return cereri.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPrioritate = prioritateFilter === "all" || c.prioritate === prioritateFilter;
      const matchesSearch =
        search === "" || c.numar_inregistrare.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesPrioritate && matchesSearch;
    });
  }, [cereri, statusFilter, prioritateFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  function getFunctionarName(id: string | null | undefined): string {
    if (!id) return "Neasignat";
    const f = functionari.find((fn) => fn.id === id);
    return f ? `${f.prenume} ${f.nume}` : "—";
  }

  function handleExpand(cerereId: string): void {
    if (expandedRow === cerereId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(cerereId);
      setNoteText("");
      setReassignId(functionari[0]?.id ?? "");
    }
  }

  function handleAddNote(cerereId: string): void {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const result = await addCerereNote(cerereId, noteText);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Notă adăugată cu succes");
        setNoteText("");
        onCerereAction?.(cerereId, "note");
      }
    });
  }

  function handleReassign(cerereId: string): void {
    if (!reassignId) return;
    startTransition(async () => {
      const result = await reassignCerere(cerereId, reassignId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cerere reasignată");
        onCerereAction?.(cerereId, "reassign");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            placeholder="Caută după număr..."
            className="border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-accent-500/50 h-9 rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-1 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(0);
          }}
          className="border-border bg-background/50 text-foreground h-9 rounded-lg border px-3 text-sm focus:outline-none"
        >
          <option value="all">Toate statusurile</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={prioritateFilter}
          onChange={(e) => {
            setPrioritateFilter(e.target.value);
            setCurrentPage(0);
          }}
          className="border-border bg-background/50 text-foreground h-9 rounded-lg border px-3 text-sm focus:outline-none"
        >
          <option value="all">Toate prioritățile</option>
          {Object.entries(PRIORITATE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <span className="text-muted-foreground ml-auto text-xs">{filtered.length} cereri</span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.024]">
        {/* Header row */}
        <div
          className="grid items-center gap-4 border-b border-white/[0.05] px-4 py-2.5"
          style={{ gridTemplateColumns: "1fr 1.4fr 1.2fr 1fr 0.8fr 0.9fr 36px" }}
        >
          {["Număr", "Funcționar", "Status", "Prioritate", "SLA", "Data", ""].map((h) => (
            <span
              key={h}
              className="text-muted-foreground text-[0.68rem] font-medium tracking-wide uppercase"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-muted-foreground text-sm">Nicio cerere găsită</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {paginated.map((cerere) => {
              const isExpanded = expandedRow === cerere.id;
              const createdDate = cerere.created_at
                ? new Date(cerere.created_at).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })
                : "—";

              return (
                <div key={cerere.id}>
                  {/* Main row */}
                  <div
                    className="grid cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                    style={{ gridTemplateColumns: "1fr 1.4fr 1.2fr 1fr 0.8fr 0.9fr 36px" }}
                    onClick={() => handleExpand(cerere.id)}
                  >
                    <span className="text-foreground font-mono text-xs font-semibold">
                      {cerere.numar_inregistrare}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {getFunctionarName(cerere.preluat_de_id)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
                        STATUS_CLASSES[cerere.status] ??
                          "bg-muted/50 text-muted-foreground border-border"
                      )}
                    >
                      {STATUS_LABELS[cerere.status] ?? cerere.status}
                    </span>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
                        cerere.prioritate
                          ? (PRIORITATE_CLASSES[cerere.prioritate] ??
                              "bg-muted/50 text-muted-foreground border-border")
                          : "bg-muted/30 text-muted-foreground border-border"
                      )}
                    >
                      {cerere.prioritate
                        ? (PRIORITATE_LABELS[cerere.prioritate] ?? cerere.prioritate)
                        : "—"}
                    </span>
                    <SlaCountdown dataTermen={cerere.data_termen} />
                    <span className="text-muted-foreground text-xs">{createdDate}</span>
                    {isExpanded ? (
                      <ChevronUp className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    )}
                  </div>

                  {/* Expandable detail panel */}
                  {isExpanded && (
                    <div
                      className="space-y-4 border-t border-white/[0.04] bg-white/[0.015] px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Add note section */}
                        <div className="space-y-2">
                          <label className="text-foreground flex items-center gap-2 text-xs font-semibold">
                            <StickyNote className="h-3.5 w-3.5" />
                            Adaugă notă admin
                          </label>
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Nota administratorului..."
                            rows={3}
                            className="border-border bg-background/70 text-foreground placeholder:text-muted-foreground focus:ring-accent-500/50 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                          />
                          <Button
                            size="sm"
                            disabled={isPending || !noteText.trim()}
                            onClick={() => handleAddNote(cerere.id)}
                            className="h-8 text-xs"
                          >
                            Adaugă notă
                          </Button>
                        </div>

                        {/* Reassign section */}
                        <div className="space-y-2">
                          <label className="text-foreground flex items-center gap-2 text-xs font-semibold">
                            <UserCheck className="h-3.5 w-3.5" />
                            Reasignează funcționar
                          </label>
                          {functionari.length === 0 ? (
                            <p className="text-muted-foreground text-xs">
                              Niciun funcționar disponibil
                            </p>
                          ) : (
                            <>
                              <select
                                value={reassignId}
                                onChange={(e) => setReassignId(e.target.value)}
                                className="border-border bg-background/70 text-foreground h-9 w-full rounded-lg border px-3 text-sm focus:outline-none"
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
                                disabled={isPending || !reassignId}
                                onClick={() => handleReassign(cerere.id)}
                                className="h-8 text-xs"
                              >
                                Confirmă reasignare
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Existing notes display */}
                      {Array.isArray(cerere.note_admin) &&
                        (cerere.note_admin as unknown[]).length > 0 && (
                          <div>
                            <p className="text-muted-foreground mb-2 text-xs font-medium">
                              Note anterioare ({(cerere.note_admin as unknown[]).length})
                            </p>
                            <div className="space-y-1.5">
                              {(
                                cerere.note_admin as Array<{
                                  text?: string;
                                  timestamp?: string;
                                  actor?: string;
                                }>
                              ).map((n, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs"
                                >
                                  <p className="text-foreground">{n.text}</p>
                                  {n.timestamp && (
                                    <p className="text-muted-foreground mt-1 text-[0.65rem]">
                                      {n.actor ?? "Admin"} ·{" "}
                                      {new Date(n.timestamp).toLocaleString("ro-RO")}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Pagina {currentPage + 1} din {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { CereriTableTab };
export type { CereriTableTabProps };
