"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Shield, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

import type { AuditType } from "./monitorizare-data";
import { auditLog, auditTypeLabels } from "./monitorizare-data";

// ─── Component ────────────────────────────────────────

export function MonitorizareAudit() {
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState<"all" | AuditType>("all");
  const [auditPage, setAuditPage] = useState(1);
  const auditPerPage = 8;

  const filteredAudit = useMemo(() => {
    let list = auditLog;
    if (auditFilter !== "all") list = list.filter((e) => e.type === auditFilter);
    if (auditSearch)
      list = list.filter(
        (e) =>
          e.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
          e.user.toLowerCase().includes(auditSearch.toLowerCase())
      );
    return list;
  }, [auditFilter, auditSearch]);

  const auditTotalPages = Math.max(1, Math.ceil(filteredAudit.length / auditPerPage));
  const paginatedAudit = filteredAudit.slice(
    (auditPage - 1) * auditPerPage,
    auditPage * auditPerPage
  );

  return (
    <motion.div
      key="audit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Audit Log — Acțiuni Recente
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
                value={auditSearch}
                onChange={(e) => {
                  setAuditSearch(e.target.value);
                  setAuditPage(1);
                }}
                placeholder="Caută acțiune..."
                className="w-44 bg-transparent text-white outline-none placeholder:text-gray-600"
                style={{ fontSize: "0.8rem" }}
              />
            </div>
            <div
              className="flex flex-wrap gap-0.5 rounded-lg p-0.5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <button
                onClick={() => {
                  setAuditFilter("all");
                  setAuditPage(1);
                }}
                className={`cursor-pointer rounded-md px-2 py-1 transition-all ${auditFilter === "all" ? "text-white" : "text-gray-600"}`}
                style={
                  auditFilter === "all"
                    ? { background: "rgba(139,92,246,0.15)", fontSize: "0.68rem" }
                    : { fontSize: "0.68rem" }
                }
              >
                Toate
              </button>
              {(Object.keys(auditTypeLabels) as AuditType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setAuditFilter(t);
                    setAuditPage(1);
                  }}
                  className={`cursor-pointer rounded-md px-2 py-1 transition-all ${auditFilter === t ? "text-white" : "text-gray-600"}`}
                  style={
                    auditFilter === t
                      ? { background: "rgba(139,92,246,0.15)", fontSize: "0.68rem" }
                      : { fontSize: "0.68rem" }
                  }
                >
                  {auditTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
          style={{
            fontSize: "0.65rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-1">Ora</div>
          <div className="col-span-2">Utilizator</div>
          <div className="col-span-5">Acțiune</div>
          <div className="col-span-1">Tip</div>
          <div className="col-span-2">IP</div>
          <div className="col-span-1">Detalii</div>
        </div>
        <AnimatePresence mode="popLayout">
          {paginatedAudit.map((entry, i) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.02 * i }}
              className="grid grid-cols-12 items-center gap-2 px-5 py-2.5 transition-all hover:bg-white/[0.02]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              <div className="col-span-1">
                <span className="font-mono text-gray-600" style={{ fontSize: "0.75rem" }}>
                  {entry.time}
                </span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
                  <span className="text-gray-300" style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                    {entry.user}
                  </span>
                </div>
              </div>
              <div className="col-span-5 truncate text-gray-500" style={{ fontSize: "0.82rem" }}>
                {entry.action}
              </div>
              <div className="col-span-1">
                <span
                  className="rounded px-1.5 py-0.5"
                  style={{
                    fontSize: "0.62rem",
                    background: "rgba(255,255,255,0.04)",
                    color: "#9ca3af",
                  }}
                >
                  {entry.type}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-gray-600" style={{ fontSize: "0.68rem" }}>
                  {entry.ip}
                </span>
              </div>
              <div className="col-span-1">
                {entry.details ? (
                  <button
                    onClick={() =>
                      toast(entry.details!, { description: `${entry.user} · ${entry.time}` })
                    }
                    className="cursor-pointer rounded-lg p-1 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-gray-800" style={{ fontSize: "0.68rem" }}>
                    —
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredAudit.length === 0 && (
          <div
            className="flex items-center justify-center py-10 text-gray-600"
            style={{ fontSize: "0.85rem" }}
          >
            Nicio înregistrare găsită
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
          <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            {filteredAudit.length > 0
              ? `${(auditPage - 1) * auditPerPage + 1}–${Math.min(auditPage * auditPerPage, filteredAudit.length)} din ${filteredAudit.length}`
              : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={auditPage <= 1}
              onClick={() => setAuditPage(auditPage - 1)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: auditTotalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setAuditPage(p)}
                className={`h-7 w-7 cursor-pointer rounded-lg transition-all ${p === auditPage ? "text-white" : "text-gray-600 hover:bg-white/5 hover:text-white"}`}
                style={
                  p === auditPage
                    ? { background: "rgba(139,92,246,0.2)", fontSize: "0.78rem" }
                    : { fontSize: "0.78rem" }
                }
              >
                {p}
              </button>
            ))}
            <button
              disabled={auditPage >= auditTotalPages}
              onClick={() => setAuditPage(auditPage + 1)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
