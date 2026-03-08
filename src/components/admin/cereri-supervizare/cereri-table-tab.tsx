"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateCerereStatus, reassignCerere } from "./actions";
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

const DB_STATUSES = [
  "depusa",
  "in_verificare",
  "info_suplimentara",
  "in_procesare",
  "aprobata",
  "respinsa",
] as const;

// Token-based CSS classes
const STATUS_CLASSES: Record<string, string> = {
  depusa: "bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[var(--color-info)]/20",
  in_verificare: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  info_suplimentara: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  in_procesare: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  aprobata: "bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/20",
  respinsa: "bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error)]/20",
};

const PRIORITATE_CLASSES: Record<string, string> = {
  urgenta: "bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error)]/20",
  ridicata: "bg-orange-400/15 text-orange-400 border-orange-400/20",
  medie: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  scazuta: "bg-[var(--color-neutral-subtle)] text-[var(--color-neutral)] border-border",
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
        ? "text-[var(--color-warning)]"
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
  onDetailOpen: (cerereId: string) => void;
}

// ============================================================================
// Component
// ============================================================================

function CereriTableTab({
  cereri,
  functionari,
  onDetailOpen,
}: CereriTableTabProps): React.ReactElement {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [prioritateFilter, setPrioritateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Bulk selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const [batchStatus, setBatchStatus] = useState("");
  const [batchFunctionar, setBatchFunctionar] = useState("");

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

  // === Checkbox logic ===
  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.target.checked) {
      setSelectedRows(new Set(paginated.map((c) => c.id)));
    } else {
      setSelectedRows(new Set());
    }
  }

  function handleSelectRow(e: React.ChangeEvent<HTMLInputElement>, id: string): void {
    e.stopPropagation();
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  }

  const allVisibleSelected =
    paginated.length > 0 && paginated.every((c) => selectedRows.has(c.id));
  const someVisibleSelected =
    !allVisibleSelected && paginated.some((c) => selectedRows.has(c.id));

  // === Batch Actions ===
  function handleBatchStatus(): void {
    if (!batchStatus || selectedRows.size === 0) return;
    const items = Array.from(selectedRows);
    startTransition(async () => {
      await Promise.all(items.map((id) => updateCerereStatus(id, batchStatus)));
      toast.success(`${items.length} cereri actualizate la statusul: ${STATUS_LABELS[batchStatus]}`);
      setBatchStatus("");
      setSelectedRows(new Set());
      router.refresh();
    });
  }

  function handleBatchReassign(): void {
    if (!batchFunctionar || selectedRows.size === 0) return;
    const items = Array.from(selectedRows);
    startTransition(async () => {
      await Promise.all(items.map((id) => reassignCerere(id, batchFunctionar)));
      toast.success(`${items.length} cereri reasignate`);
      setBatchFunctionar("");
      setSelectedRows(new Set());
      router.refresh();
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

      {/* ── Batch Action Bar ── */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
              <span className="text-foreground text-sm font-semibold">
                {selectedRows.size} selectate
              </span>
              <div className="h-4 w-px bg-white/10" />

              {/* Batch Status */}
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-muted-foreground h-4 w-4" />
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value)}
                  className="border-border bg-background/60 text-foreground h-8 min-w-[140px] rounded-lg border px-2 text-xs focus:outline-none"
                >
                  <option value="">Schimbă Status...</option>
                  {DB_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending || !batchStatus}
                  onClick={handleBatchStatus}
                  className="h-8 text-xs"
                >
                  Aplică
                </Button>
              </div>

              <div className="h-4 w-px bg-white/10" />

              {/* Batch Reassign */}
              <div className="flex items-center gap-2">
                <UserCheck className="text-muted-foreground h-4 w-4" />
                <select
                  value={batchFunctionar}
                  onChange={(e) => setBatchFunctionar(e.target.value)}
                  className="border-border bg-background/60 text-foreground h-8 min-w-[140px] rounded-lg border px-2 text-xs focus:outline-none"
                >
                  <option value="">Reasignează...</option>
                  {functionari.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.prenume} {f.nume}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending || !batchFunctionar}
                  onClick={handleBatchReassign}
                  className="h-8 text-xs"
                >
                  Aplică
                </Button>
              </div>

              <div className="ml-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedRows(new Set())}
                  className="text-muted-foreground hover:text-foreground h-8 gap-1.5 px-2 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Resetează
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.024]">
        {/* Header row */}
        <div
          className="grid items-center gap-4 border-b border-white/[0.05] px-4 py-2.5"
          style={{ gridTemplateColumns: "32px 1fr 1.4fr 1.2fr 1fr 0.8fr 0.9fr" }}
        >
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
             <input
                type="checkbox"
                checked={allVisibleSelected}
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={(input: any) => {
                  if (input) input.indeterminate = someVisibleSelected;
                }}
                onChange={handleSelectAll}
                className="accent-[var(--color-info)] cursor-pointer h-4 w-4 rounded border-white/20"
              />
          </div>
          {["Număr", "Funcționar", "Status", "Prioritate", "SLA", "Data"].map((h) => (
            <span
              key={h}
              className="text-muted-foreground text-[0.68rem] font-medium tracking-wide border-l border-transparent uppercase"
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
              const isSelected = selectedRows.has(cerere.id);
              const createdDate = cerere.created_at
                ? new Date(cerere.created_at).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })
                : "—";

              return (
                <div
                  key={cerere.id}
                  className={cn(
                    "grid cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.04]",
                    isSelected && "bg-[var(--color-info)]/5"
                  )}
                  style={{ gridTemplateColumns: "32px 1fr 1.4fr 1.2fr 1fr 0.8fr 0.9fr" }}
                  onClick={() => onDetailOpen(cerere.id)}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(e, cerere.id)}
                      className="accent-[var(--color-info)] cursor-pointer h-4 w-4 rounded border-white/20"
                    />
                  </div>

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
