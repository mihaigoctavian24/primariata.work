"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/shared/admin-modal";

// ============================================================================
// Types
// ============================================================================

export interface PlatiItem {
  id: string;
  suma: number;
  status: string;
  metoda_plata: string | null;
  created_at: string;
  cerere_id: string | null;
}

interface TransactionListProps {
  plati: PlatiItem[];
  txFilter: string;
  onFilterChange: (filter: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_LABELS: Record<string, string> = {
  success: "Finalizat",
  pending: "În așteptare",
  failed: "Eșuat",
  refunded: "Rambursat",
};

const STATUS_CLASSES: Record<string, string> = {
  success: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
  pending: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
  failed: "text-red-400 bg-red-500/10 border border-red-500/20",
  refunded: "text-violet-400 bg-violet-500/10 border border-violet-500/20",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  pending: Clock,
  failed: XCircle,
  refunded: RefreshCcw,
};

const METODA_LABELS: Record<string, string> = {
  card: "Card Online",
  transfer: "Transfer",
  numerar: "Numerar",
};

const PER_PAGE = 6;

// ============================================================================
// Helpers
// ============================================================================

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function truncateId(id: string | null, chars = 8): string {
  if (!id) return "—";
  return id.length > chars ? `${id.substring(0, chars)}…` : id;
}

// ============================================================================
// ExpandedRow
// ============================================================================

function ExpandedRow({ row, onRefund }: { row: PlatiItem; onRefund: (r: PlatiItem) => void }): React.JSX.Element {
  function handleRetry(): void {
    toast.info("Reîncercare în curs...");
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden border-t border-white/[0.04] bg-white/[0.015] px-5 py-4"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[0.78rem] sm:grid-cols-3">
        <div>
          <div className="mb-0.5 text-[0.68rem] tracking-wide text-gray-500 uppercase">
            ID Tranzacție
          </div>
          <div className="font-mono text-gray-200">{row.id}</div>
        </div>
        <div>
          <div className="mb-0.5 text-[0.68rem] tracking-wide text-gray-500 uppercase">
            Cerere asociată
          </div>
          <div className="font-mono text-gray-200">{row.cerere_id ?? "—"}</div>
        </div>
        <div>
          <div className="mb-0.5 text-[0.68rem] tracking-wide text-gray-500 uppercase">
            Metodă de plată
          </div>
          <div className="text-gray-200">
            {row.metoda_plata ? (METODA_LABELS[row.metoda_plata] ?? row.metoda_plata) : "—"}
          </div>
        </div>

        {row.status === "failed" && (
          <div className="col-span-2 sm:col-span-3">
            <div className="mb-0.5 text-[0.68rem] tracking-wide text-gray-500 uppercase">
              Detaliu eroare
            </div>
            <div className="text-red-400">Tranzacție eșuată — contactați furnizorul de plată</div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[0.75rem] font-medium text-red-400 transition-all hover:bg-red-500/20 flex-1 max-w-fit"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reîncearcă tranzacția
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefund(row);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning-subtle)] px-3 py-1.5 text-[0.75rem] font-medium text-[var(--color-warning)] transition-all hover:brightness-110 flex-1 max-w-fit"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Rambursează
              </button>
            </div>
          </div>
        )}

        {row.status === "success" && (
          <div className="col-span-2 sm:col-span-3 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRefund(row);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning-subtle)] px-3 py-1.5 text-[0.75rem] font-medium text-[var(--color-warning)] transition-all hover:brightness-110"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Rambursează
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// TransactionList
// ============================================================================

export function TransactionList({
  plati,
  txFilter,
  onFilterChange,
}: TransactionListProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<PlatiItem | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return plati.filter((p) => {
      if (txFilter !== "all" && p.status !== txFilter) return false;
      if (q) {
        const idMatch = p.id.toLowerCase().includes(q);
        const cerereMatch = p.cerere_id?.toLowerCase().includes(q) ?? false;
        if (!idMatch && !cerereMatch) return false;
      }
      return true;
    });
  }, [plati, txFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleSearch(value: string): void {
    setSearch(value);
    setPage(1);
    setExpandedId(null);
  }

  function handleFilterChange(value: string): void {
    onFilterChange(value);
    setPage(1);
    setExpandedId(null);
  }

  function toggleExpand(id: string): void {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // Page navigation helper for showing up to 5 page buttons
  function getPageNumbers(): number[] {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (safePage <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (safePage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = safePage - 2; i <= safePage + 2; i++) pages.push(i);
    }
    return pages;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]">
      {/* Header + search + filter */}
      <div className="flex flex-col gap-3 border-b border-white/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-blue-400" />
          <h3 className="text-[0.95rem] font-semibold text-white">Tranzacții Recente</h3>
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[0.72rem] text-gray-400">
            {filtered.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Caută după ID..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.04] py-1.5 pr-3 pl-8 text-[0.78rem] text-gray-200 outline-none placeholder:text-gray-500 focus:border-white/[0.1]"
            />
          </div>

          {/* Status filter */}
          <select
            value={txFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[0.78rem] text-gray-200 outline-none"
          >
            <option value="all">Toate statusurile</option>
            <option value="success">Finalizate</option>
            <option value="pending">În așteptare</option>
            <option value="failed">Eșuate</option>
            <option value="refunded">Rambursate</option>
          </select>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid px-5 py-2.5 text-[0.67rem] font-semibold tracking-wider text-gray-500 uppercase"
        style={{ gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1.2fr auto" }}
      >
        <div>Data</div>
        <div>ID Tranzacție</div>
        <div>Sumă</div>
        <div>Metodă</div>
        <div>Status</div>
        <div />
      </div>

      {/* Rows */}
      <AnimatePresence mode="popLayout">
        {paginated.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-2 py-12"
          >
            <Receipt className="h-8 w-8 text-gray-700" />
            <span className="text-[0.85rem] text-gray-500">Nicio tranzacție</span>
          </motion.div>
        ) : (
          paginated.map((p, i) => {
            const StatusIcon = STATUS_ICONS[p.status] ?? Receipt;
            const statusClass = STATUS_CLASSES[p.status] ?? STATUS_CLASSES.pending!;
            const isExpanded = expandedId === p.id;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="border-b border-white/[0.03] last:border-0"
              >
                {/* Main row */}
                <div
                  className="grid cursor-pointer items-center px-5 py-3 transition-colors hover:bg-white/[0.02]"
                  style={{ gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1.2fr auto" }}
                  onClick={() => toggleExpand(p.id)}
                >
                  {/* Data */}
                  <div className="text-[0.8rem] text-gray-400">{formatDate(p.created_at)}</div>

                  {/* ID (truncated) */}
                  <div className="truncate font-mono text-[0.78rem] text-gray-200" title={p.id}>
                    {truncateId(p.id)}
                  </div>

                  {/* Suma */}
                  <div className="text-[0.85rem] font-semibold text-white">
                    {p.suma.toLocaleString("ro-RO")} RON
                  </div>

                  {/* Metoda */}
                  <div>
                    <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[0.72rem] text-gray-300">
                      {p.metoda_plata ? (METODA_LABELS[p.metoda_plata] ?? p.metoda_plata) : "—"}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.72rem] ${statusClass}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </div>

                  {/* Expand toggle */}
                  <div className="flex justify-end">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expandable detail */}
                <AnimatePresence>
                  {isExpanded && <ExpandedRow key={`${p.id}-expanded`} row={p} onRefund={setRefundTarget} />}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
          <span className="text-[0.78rem] text-gray-500">
            {filtered.length > 0
              ? `${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filtered.length)} din ${filtered.length}`
              : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-1.5 text-gray-400 transition-all hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`h-7 w-7 flex items-center justify-center rounded-lg text-[0.78rem] transition-all cursor-pointer ${
                  num === safePage
                    ? "bg-blue-500/20 font-semibold text-white"
                    : "text-gray-500 hover:text-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-gray-400 transition-all hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      <AdminModal
        open={!!refundTarget}
        onClose={() => {
          setRefundTarget(null);
          setRefundReason("");
        }}
        title="Confirmare Rambursare"
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => {
                setRefundTarget(null);
                setRefundReason("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Anulează
            </button>
            <button
              onClick={() => {
                toast.success("Rambursare inițiată!");
                setRefundTarget(null);
                setRefundReason("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-warning)] text-white hover:brightness-110 transition-colors cursor-pointer"
            >
              Confirmă Rambursare
            </button>
          </div>
        }
      >
        {refundTarget && (
          <div className="py-2 space-y-4">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-sm flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-foreground font-medium">{refundTarget.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sumă:</span>
                <span className="text-foreground font-semibold">{refundTarget.suma.toLocaleString("ro-RO")} RON</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Motiv rambursare</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explică motivul rambursării..."
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm outline-none focus:ring-1 focus:ring-[var(--color-warning)] min-h-[80px] resize-y"
              />
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

export type { TransactionListProps };
