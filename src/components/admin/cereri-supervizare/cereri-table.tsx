"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  UserCheck,
  CheckCircle2,
  XCircle,
  Timer,
  Lock,
  ArrowUp,
  StickyNote,
  ArrowRightLeft,
  Unlock,
  History,
  ExternalLink,
} from "lucide-react";

import type { Cerere, CerereStatus, Priority } from "./cereri-data";
import { statusConfig, priorityConfig, departamente } from "./cereri-data";

// ─── Props ────────────────────────────────────────────

interface CereriTableProps {
  cereri: Cerere[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUnblock: (id: string) => void;
  onEscalate: (id: string) => void;
  onReassign: (id: string) => void;
  onDetailDrawer: (id: string) => void;
}

// ─── Component ────────────────────────────────────────

export function CereriTable({
  cereri,
  onApprove,
  onReject,
  onUnblock,
  onEscalate,
  onReassign,
  onDetailDrawer,
}: CereriTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CerereStatus | "all">("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"numar" | "sla" | "prioritate" | "zile">("sla");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...cereri];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.titlu.toLowerCase().includes(q) ||
          c.cetatean.toLowerCase().includes(q) ||
          c.numar.includes(q) ||
          c.functionar.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    if (deptFilter !== "all") result = result.filter((c) => c.departament === deptFilter);
    if (priorityFilter !== "all") result = result.filter((c) => c.prioritate === priorityFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "numar") cmp = b.numar.localeCompare(a.numar);
      else if (sortBy === "sla") cmp = a.slaZileRamase - b.slaZileRamase;
      else if (sortBy === "prioritate")
        cmp = priorityConfig[b.prioritate].level - priorityConfig[a.prioritate].level;
      else if (sortBy === "zile") cmp = b.zileInStatus - a.zileInStatus;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [cereri, searchQuery, statusFilter, deptFilter, priorityFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div
          className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cauta cereri, cetateni, functionari..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-600"
            style={{ fontSize: "0.85rem" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as CerereStatus | "all");
            setPage(1);
          }}
          className="cursor-pointer appearance-none rounded-xl px-3 py-2 text-gray-300 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
          }}
        >
          <option value="all">Toate statusurile</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="cursor-pointer appearance-none rounded-xl px-3 py-2 text-gray-300 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
          }}
        >
          <option value="all">Toate departamentele</option>
          {departamente.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as Priority | "all");
            setPage(1);
          }}
          className="cursor-pointer appearance-none rounded-xl px-3 py-2 text-gray-300 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
          }}
        >
          <option value="all">Toate prioritatile</option>
          {Object.entries(priorityConfig).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="grid grid-cols-12 gap-2 px-4 py-2.5"
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="col-span-1 flex cursor-pointer items-center gap-1"
            onClick={() => toggleSort("numar")}
          >
            Nr. <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-3">Cerere / Functionar</div>
          <div className="col-span-1">Dept.</div>
          <div
            className="col-span-1 flex cursor-pointer items-center gap-1"
            onClick={() => toggleSort("prioritate")}
          >
            Prior. <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-1">Status</div>
          <div
            className="col-span-1 flex cursor-pointer items-center gap-1"
            onClick={() => toggleSort("sla")}
          >
            SLA <ArrowUpDown className="h-3 w-3" />
          </div>
          <div
            className="col-span-1 flex cursor-pointer items-center gap-1"
            onClick={() => toggleSort("zile")}
          >
            Zile <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-1">Flag</div>
          <div className="col-span-2 text-right">Actiuni</div>
        </div>

        <AnimatePresence mode="popLayout">
          {paginated.map((c) => {
            const sc = statusConfig[c.status];
            const pc = priorityConfig[c.prioritate];
            const isExpanded = expandedRow === c.id;
            const isFinal = c.status === "aprobata" || c.status === "respinsa";
            const slaColor =
              c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className={`grid cursor-pointer grid-cols-12 items-center gap-2 px-4 py-2.5 transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                >
                  <div
                    className="col-span-1 text-gray-400"
                    style={{ fontSize: "0.82rem", fontWeight: 500 }}
                  >
                    {c.numar}
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="truncate text-white" style={{ fontSize: "0.82rem" }}>
                      {c.titlu}
                    </div>
                    <div
                      className="flex items-center gap-1 truncate text-gray-600"
                      style={{ fontSize: "0.68rem" }}
                    >
                      <User className="h-2.5 w-2.5" /> {c.cetatean}
                      <span className="mx-0.5 text-gray-700">·</span>
                      {c.functionar !== "-" ? (
                        <>
                          <UserCheck className="h-2.5 w-2.5" /> {c.functionar}
                        </>
                      ) : (
                        <span className="text-amber-500">Nealocat</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="truncate text-gray-500" style={{ fontSize: "0.72rem" }}>
                      {c.departament}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: "0.7rem", color: pc.color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: pc.color }} />{" "}
                      {pc.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
                      style={{ fontSize: "0.68rem", color: sc.color, background: sc.bg }}
                    >
                      <span className="h-1 w-1 rounded-full" style={{ background: sc.color }} />{" "}
                      {sc.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: "0.75rem", color: slaColor, fontWeight: 600 }}
                    >
                      <Timer className="h-3 w-3" />
                      {isFinal
                        ? "—"
                        : c.slaZileRamase <= 0
                          ? `${Math.abs(c.slaZileRamase)}z dep.`
                          : `${c.slaZileRamase}z`}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>
                      {isFinal ? "—" : `${c.zileInStatus}z`}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    {c.blocata && (
                      <span
                        title="Blocata"
                        className="flex h-5 w-5 items-center justify-center rounded"
                        style={{ background: "rgba(239,68,68,0.15)" }}
                      >
                        <Lock className="h-3 w-3 text-red-400" />
                      </span>
                    )}
                    {c.escaladata && (
                      <span
                        title="Escaladata"
                        className="flex h-5 w-5 items-center justify-center rounded"
                        style={{ background: "rgba(245,158,11,0.15)" }}
                      >
                        <ArrowUp className="h-3 w-3 text-amber-400" />
                      </span>
                    )}
                    {c.noteAdmin.length > 0 && (
                      <span
                        title="Note admin"
                        className="flex h-5 w-5 items-center justify-center rounded"
                        style={{ background: "rgba(139,92,246,0.15)" }}
                      >
                        <StickyNote className="h-3 w-3 text-violet-400" />
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {!isFinal && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(c.id);
                          }}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                          title="Aproba"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(c.id);
                          }}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                          title="Respinge"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetailDrawer(c.id);
                      }}
                      className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                      title="Detalii"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-3 mb-2 rounded-xl px-4 py-3"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div className="mb-3 grid grid-cols-4 gap-3">
                          <div>
                            <div className="mb-0.5 text-gray-600" style={{ fontSize: "0.65rem" }}>
                              Descriere
                            </div>
                            <p className="text-gray-300" style={{ fontSize: "0.78rem" }}>
                              {c.descriere}
                            </p>
                          </div>
                          <div>
                            <div className="mb-0.5 text-gray-600" style={{ fontSize: "0.65rem" }}>
                              Data Depunere / Deadline SLA
                            </div>
                            <div className="text-white" style={{ fontSize: "0.78rem" }}>
                              {c.dataDepunere} → {c.dataLimita}
                            </div>
                          </div>
                          <div>
                            <div className="mb-0.5 text-gray-600" style={{ fontSize: "0.65rem" }}>
                              Ultima Activitate
                            </div>
                            <div className="text-gray-300" style={{ fontSize: "0.78rem" }}>
                              {c.ultimaActivitate}
                            </div>
                          </div>
                          <div>
                            <div className="mb-0.5 text-gray-600" style={{ fontSize: "0.65rem" }}>
                              Motiv Blocare
                            </div>
                            <div
                              className={c.blocata ? "text-red-400" : "text-gray-600"}
                              style={{ fontSize: "0.78rem" }}
                            >
                              {c.motivBlocare || "—"}
                            </div>
                          </div>
                        </div>
                        {!isFinal && (
                          <div className="flex items-center gap-2 border-t border-white/[0.04] pt-2">
                            <span className="mr-1 text-gray-600" style={{ fontSize: "0.68rem" }}>
                              Admin:
                            </span>
                            <button
                              onClick={() => onReassign(c.id)}
                              className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-cyan-400 transition-all hover:bg-cyan-400/10"
                              style={{
                                fontSize: "0.72rem",
                                background: "rgba(6,182,212,0.06)",
                                border: "1px solid rgba(6,182,212,0.1)",
                              }}
                            >
                              <ArrowRightLeft className="h-3 w-3" /> Reasigneaza
                            </button>
                            {c.blocata && (
                              <button
                                onClick={() => onUnblock(c.id)}
                                className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-emerald-400 transition-all hover:bg-emerald-400/10"
                                style={{
                                  fontSize: "0.72rem",
                                  background: "rgba(16,185,129,0.06)",
                                  border: "1px solid rgba(16,185,129,0.1)",
                                }}
                              >
                                <Unlock className="h-3 w-3" /> Deblocheaza
                              </button>
                            )}
                            {!c.escaladata && (
                              <button
                                onClick={() => onEscalate(c.id)}
                                className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-amber-400 transition-all hover:bg-amber-400/10"
                                style={{
                                  fontSize: "0.72rem",
                                  background: "rgba(245,158,11,0.06)",
                                  border: "1px solid rgba(245,158,11,0.1)",
                                }}
                              >
                                <ArrowUp className="h-3 w-3" /> Escaleaza
                              </button>
                            )}
                            <button
                              onClick={() => onDetailDrawer(c.id)}
                              className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-violet-400 transition-all hover:bg-violet-400/10"
                              style={{
                                fontSize: "0.72rem",
                                background: "rgba(139,92,246,0.06)",
                                border: "1px solid rgba(139,92,246,0.1)",
                              }}
                            >
                              <History className="h-3 w-3" /> Audit Trail
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

        <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
          <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            {filtered.length > 0
              ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} din ${filtered.length}`
              : "Nicio cerere"}
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
      </div>
    </motion.div>
  );
}
