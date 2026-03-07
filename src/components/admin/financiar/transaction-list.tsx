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
  Activity,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface PlatiRow {
  id: string;
  suma: number;
  status: string;
  metoda_plata: string | null;
  created_at: string;
  cerere_id: string | null;
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
  refunded: "text-sky-400 bg-sky-500/10 border border-sky-500/20",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  pending: Clock,
  failed: XCircle,
  refunded: RefreshCcw,
};

const METODA_LABELS: Record<string, string> = {
  card: "Card",
  transfer: "Transfer",
  numerar: "Numerar",
};

const PER_PAGE = 20;

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

function truncateId(id: string | null): string {
  if (!id) return "N/A";
  return id.length > 12 ? `${id.substring(0, 8)}...` : id;
}

// ============================================================================
// TransactionList
// ============================================================================

interface TransactionListProps {
  plati: PlatiRow[];
}

function TransactionList({ plati }: TransactionListProps): React.JSX.Element {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [metodaFilter, setMetodaFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return plati.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (metodaFilter !== "all" && p.metoda_plata !== metodaFilter) return false;
      return true;
    });
  }, [plati, statusFilter, metodaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleStatusChange(status: string): void {
    setStatusFilter(status);
    setPage(1);
  }

  function handleMetodaChange(metoda: string): void {
    setMetodaFilter(metoda);
    setPage(1);
  }

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Header + filters */}
      <div
        className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Tranzacții
          </h3>
          <span
            className="rounded-md px-2 py-0.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#9ca3af",
              fontSize: "0.72rem",
            }}
          >
            {filtered.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl px-3 py-1.5 outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#e5e7eb",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            <option value="all">Toate statusurile</option>
            <option value="success">Finalizate</option>
            <option value="pending">În așteptare</option>
            <option value="failed">Eșuate</option>
            <option value="refunded">Rambursate</option>
          </select>

          {/* Metoda filter */}
          <select
            value={metodaFilter}
            onChange={(e) => handleMetodaChange(e.target.value)}
            className="rounded-xl px-3 py-1.5 outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#e5e7eb",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            <option value="all">Toate metodele</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
            <option value="numerar">Numerar</option>
          </select>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid px-5 py-2.5"
        style={{
          gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          fontSize: "0.67rem",
          color: "#6b7280",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <div>Data</div>
        <div>Cerere ID</div>
        <div>Sumă</div>
        <div>Metodă</div>
        <div>Status</div>
      </div>

      {/* Rows */}
      <AnimatePresence mode="sync">
        {paginated.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-2 py-12"
          >
            <Activity className="h-8 w-8" style={{ color: "#374151" }} />
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              Nicio tranzacție pentru filtrele selectate
            </span>
          </motion.div>
        ) : (
          paginated.map((p, i) => {
            const StatusIcon = STATUS_ICONS[p.status] ?? Activity;
            const statusClass = STATUS_CLASSES[p.status] ?? STATUS_CLASSES.pending;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="grid items-center px-5 py-3"
                style={{
                  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                {/* Data */}
                <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                  {formatDate(p.created_at)}
                </div>

                {/* Cerere ID */}
                <div
                  className="truncate font-mono"
                  style={{ color: "#e5e7eb", fontSize: "0.78rem" }}
                  title={p.cerere_id ?? undefined}
                >
                  {truncateId(p.cerere_id)}
                </div>

                {/* Suma */}
                <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: "0.85rem" }}>
                  {p.suma.toLocaleString("ro-RO")} RON
                </div>

                {/* Metoda */}
                <div>
                  <span
                    className="rounded-md px-2 py-0.5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "#d1d5db",
                      fontSize: "0.72rem",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {p.metoda_plata ? (METODA_LABELS[p.metoda_plata] ?? p.metoda_plata) : "N/A"}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 ${statusClass}`}
                    style={{ fontSize: "0.72rem" }}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span style={{ color: "#6b7280", fontSize: "0.78rem" }}>
            {filtered.length > 0
              ? `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} din ${filtered.length}`
              : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-1.5 transition-all disabled:opacity-30"
              style={{ color: "#9ca3af" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="h-7 w-7 rounded-lg transition-all"
                  style={
                    pageNum === page
                      ? {
                          background: "rgba(59,130,246,0.2)",
                          color: "#f9fafb",
                          fontSize: "0.78rem",
                        }
                      : { color: "#6b7280", fontSize: "0.78rem" }
                  }
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 transition-all disabled:opacity-30"
              style={{ color: "#9ca3af" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { TransactionList };
export type { TransactionListProps, PlatiRow };
