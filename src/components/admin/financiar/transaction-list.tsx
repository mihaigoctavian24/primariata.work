"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Search,
  Eye,
  AlertTriangle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

import type { TxStatus } from "./financiar-data";
import { allTransactions, statusConfig } from "./financiar-data";

// ─── Props ────────────────────────────────────────────

interface TransactionListProps {
  txFilter: TxStatus | "all";
  onFilterChange: (filter: TxStatus | "all") => void;
}

// ─── Component ────────────────────────────────────────

export function TransactionList({ txFilter, onFilterChange }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const failedTx = allTransactions.filter((t) => t.status === "failed").length;

  const filtered = useMemo(() => {
    let result = [...allTransactions];
    if (txFilter !== "all") result = result.filter((t) => t.status === txFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.payer.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q)
      );
    }
    return result;
  }, [txFilter, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const retryTransaction = (_id: string) => {
    toast.success("🔄 Retry inițiat — notificare trimisă către gateway");
  };

  return (
    <>
      {/* Failed Transactions Alert */}
      {failedTx > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span className="flex-1 text-red-300/80" style={{ fontSize: "0.83rem" }}>
            <span style={{ fontWeight: 600 }}>{failedTx} tranzacții eșuate</span> în ultima perioadă
            — verifică gateway-urile de plată.
          </span>
          <button
            onClick={() => {
              onFilterChange("failed");
              setPage(1);
            }}
            className="cursor-pointer rounded-lg px-3 py-1 text-red-400 transition-all hover:bg-red-400/10"
            style={{ fontSize: "0.78rem", fontWeight: 600 }}
          >
            Vezi detalii
          </button>
        </motion.div>
      )}

      {/* Transactions Monitor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="overflow-hidden rounded-2xl"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Monitorizare Tranzacții
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Search className="h-3.5 w-3.5 text-gray-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Caută tranzacție..."
                className="w-48 bg-transparent text-white outline-none placeholder:text-gray-600"
                style={{ fontSize: "0.8rem" }}
              />
            </div>
            <div
              className="flex gap-0.5 rounded-lg p-0.5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {(["all", "success", "pending", "failed", "refunded"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    onFilterChange(f);
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-md px-2.5 py-1 transition-all ${txFilter === f ? "text-white" : "text-gray-500"}`}
                  style={
                    txFilter === f
                      ? {
                          background: `${f === "all" ? "rgba(236,72,153,0.15)" : statusConfig[f as TxStatus]?.color + "20"}`,
                          fontSize: "0.72rem",
                        }
                      : { fontSize: "0.72rem" }
                  }
                >
                  {f === "all" ? "Toate" : statusConfig[f as TxStatus]?.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
          style={{
            fontSize: "0.67rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-1">Ref.</div>
          <div className="col-span-3">Descriere / Plătitor</div>
          <div className="col-span-2">Metodă / Gateway</div>
          <div className="col-span-1">Categorie</div>
          <div className="col-span-1">Data</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Sumă</div>
          <div className="col-span-1 text-right">Acțiuni</div>
        </div>

        <AnimatePresence mode="popLayout">
          {paginated.map((tx) => {
            const sc = statusConfig[tx.status];
            const StatusIcon = sc.icon;
            const isExpanded = expandedTx === tx.id;
            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className={`grid cursor-pointer grid-cols-12 items-center gap-2 px-5 py-3 transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.015]"}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                >
                  <div className="col-span-1">
                    <span className="font-mono text-gray-600" style={{ fontSize: "0.68rem" }}>
                      {tx.reference.split("-").pop()}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <div className="truncate text-white" style={{ fontSize: "0.82rem" }}>
                      {tx.description}
                    </div>
                    <div className="truncate text-gray-600" style={{ fontSize: "0.68rem" }}>
                      {tx.payer}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-300" style={{ fontSize: "0.78rem" }}>
                      {tx.method}
                    </div>
                    <div className="text-gray-600" style={{ fontSize: "0.65rem" }}>
                      {tx.gateway}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>
                      {tx.category}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <div className="text-gray-400" style={{ fontSize: "0.75rem" }}>
                      {tx.date.replace(" 2026", "")}
                    </div>
                    <div className="text-gray-600" style={{ fontSize: "0.65rem" }}>
                      {tx.time}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
                      style={{
                        fontSize: "0.68rem",
                        color: sc.color,
                        background: `${sc.color}12`,
                        border: `1px solid ${sc.color}18`,
                      }}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {sc.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        color:
                          tx.status === "refunded"
                            ? "#8b5cf6"
                            : tx.amount < 0
                              ? "#ef4444"
                              : "#10b981",
                      }}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString("ro-RO")} RON
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    {tx.status === "failed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          retryTransaction(tx.id);
                        }}
                        className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-amber-500/10 hover:text-amber-400"
                        title="Retry"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTx(tx.id);
                      }}
                      className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                      title="Detalii"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-5 mb-3 rounded-xl px-5 py-4"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div className="grid grid-cols-5 gap-4">
                          <div>
                            <div className="mb-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
                              Referință Completă
                            </div>
                            <div className="font-mono text-white" style={{ fontSize: "0.82rem" }}>
                              {tx.reference}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
                              Gateway
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {tx.gateway}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
                              Metodă
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {tx.method}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
                              Plătitor
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {tx.payer}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
                              Data & Ora
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {tx.date} · {tx.time}
                            </div>
                          </div>
                        </div>
                        {tx.errorCode && (
                          <div
                            className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{
                              background: "rgba(239,68,68,0.06)",
                              border: "1px solid rgba(239,68,68,0.1)",
                            }}
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                            <span className="text-red-300" style={{ fontSize: "0.78rem" }}>
                              Cod eroare:{" "}
                              <span className="font-mono" style={{ fontWeight: 600 }}>
                                {tx.errorCode}
                              </span>
                            </span>
                            <button
                              onClick={() => retryTransaction(tx.id)}
                              className="ml-auto flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-amber-400 transition-all hover:bg-amber-400/10"
                              style={{ fontSize: "0.72rem", fontWeight: 600 }}
                            >
                              <RefreshCcw className="h-3 w-3" /> Retry
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
          <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            {filtered.length > 0
              ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} din ${filtered.length}`
              : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 cursor-pointer rounded-lg transition-all ${p === page ? "text-white" : "text-gray-600 hover:bg-white/5 hover:text-white"}`}
                style={
                  p === page
                    ? { background: "rgba(236,72,153,0.2)", fontSize: "0.78rem" }
                    : { fontSize: "0.78rem" }
                }
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
