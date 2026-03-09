"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User,
  UserCheck,
  FileText,
  Calendar,
  Timer,
  Lock,
  StickyNote,
  History,
  Shield,
  CheckCircle2,
  XCircle,
  Zap,
  Send,
  ArrowRightLeft,
  Unlock,
  ArrowUp,
  Sparkles,
} from "lucide-react";

import type { Cerere, CerereStatus, Priority } from "./cereri-data";
import { statusConfig, priorityConfig } from "./cereri-data";

// ─── Props ────────────────────────────────────────────

interface CereriDetailDrawerProps {
  cerere: Cerere | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUnblock: (id: string) => void;
  onEscalate: (id: string) => void;
  onReassign: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  onChangePriority: (id: string, priority: Priority) => void;
  onForceStatus: (id: string, status: CerereStatus) => void;
}

// ─── Component ────────────────────────────────────────

export function CereriDetailDrawer({
  cerere: c,
  onClose,
  onApprove,
  onReject,
  onUnblock,
  onEscalate,
  onReassign,
  onAddNote,
  onChangePriority,
  onForceStatus,
}: CereriDetailDrawerProps) {
  const [adminNoteInput, setAdminNoteInput] = useState("");

  if (!c) return null;

  const sc = statusConfig[c.status];
  const pc = priorityConfig[c.prioritate];
  const slaColor = c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
  const isFinal = c.status === "aprobata" || c.status === "respinsa";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ x: 480 }}
          animate={{ x: 0 }}
          exit={{ x: 480 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 h-full w-[460px] overflow-y-auto"
          style={{
            background: "#0e0e1a",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.05) transparent",
          }}
        >
          <div className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
                Detalii Cerere
              </h3>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="mb-4 rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>
                  {c.numar}
                </span>
                <span
                  className="rounded-md px-1.5 py-0.5"
                  style={{ fontSize: "0.65rem", color: sc.color, background: sc.bg }}
                >
                  {sc.label}
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ fontSize: "0.65rem", color: pc.color }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ background: pc.color }} />{" "}
                  {pc.label}
                </span>
                {c.blocata && (
                  <span
                    className="rounded-md px-1.5 py-0.5 text-red-400"
                    style={{ fontSize: "0.65rem", background: "rgba(239,68,68,0.12)" }}
                  >
                    BLOCAT
                  </span>
                )}
                {c.escaladata && (
                  <span
                    className="rounded-md px-1.5 py-0.5 text-amber-400"
                    style={{ fontSize: "0.65rem", background: "rgba(245,158,11,0.12)" }}
                  >
                    ESCALAT
                  </span>
                )}
              </div>
              <div className="mb-2 text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                {c.titlu}
              </div>
              <p className="text-gray-400" style={{ fontSize: "0.82rem" }}>
                {c.descriere}
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              {[
                { label: "Cetatean", value: c.cetatean, icon: User },
                {
                  label: "Functionar",
                  value: c.functionar !== "-" ? c.functionar : "Nealocat",
                  icon: UserCheck,
                },
                { label: "Departament", value: c.departament, icon: FileText },
                { label: "Tip", value: c.tip, icon: FileText },
                { label: "Data Depunere", value: c.dataDepunere, icon: Calendar },
                { label: "Deadline SLA", value: c.dataLimita, icon: Timer },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-lg p-2.5"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      className="mb-0.5 flex items-center gap-1 text-gray-600"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <Icon className="h-3 w-3" /> {item.label}
                    </div>
                    <div className="text-white" style={{ fontSize: "0.82rem" }}>
                      {item.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="mb-4 rounded-xl p-3"
              style={{ background: `${slaColor}08`, border: `1px solid ${slaColor}15` }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-gray-400" style={{ fontSize: "0.78rem" }}>
                  SLA Status
                </span>
                <span style={{ fontSize: "0.85rem", color: slaColor, fontWeight: 700 }}>
                  {isFinal
                    ? "Finalizata"
                    : c.slaZileRamase <= 0
                      ? `DEPASIT cu ${Math.abs(c.slaZileRamase)} zile`
                      : `${c.slaZileRamase} zile ramase`}
                </span>
              </div>
              {!isFinal && (
                <div
                  className="h-2 w-full rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(5, c.slaZileRamase <= 0 ? 100 : (1 - c.slaZileRamase / 30) * 100))}%`,
                      background: slaColor,
                    }}
                  />
                </div>
              )}
            </div>

            {c.motivBlocare && (
              <div
                className="mb-4 flex items-start gap-2 rounded-xl p-3"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.1)",
                }}
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <div className="text-red-300" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    Motiv Blocare
                  </div>
                  <div className="text-red-300/70" style={{ fontSize: "0.78rem" }}>
                    {c.motivBlocare}
                  </div>
                </div>
              </div>
            )}

            {c.noteAdmin.length > 0 && (
              <div className="mb-4">
                <div
                  className="mb-2 flex items-center gap-1 text-gray-400"
                  style={{ fontSize: "0.78rem", fontWeight: 600 }}
                >
                  <StickyNote className="h-3.5 w-3.5 text-violet-400" /> Note Admin (
                  {c.noteAdmin.length})
                </div>
                <div className="flex flex-col gap-1.5">
                  {c.noteAdmin.map((note, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-3 py-2 text-gray-300"
                      style={{
                        fontSize: "0.78rem",
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.08)",
                      }}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div
                className="mb-2 flex items-center gap-1 text-gray-400"
                style={{ fontSize: "0.78rem", fontWeight: 600 }}
              >
                <History className="h-3.5 w-3.5 text-pink-400" /> Audit Trail ({c.auditTrail.length}
                )
              </div>
              <div className="relative flex flex-col gap-0 pl-4">
                <div className="absolute top-2 bottom-2 left-[7px] w-px bg-white/[0.06]" />
                {c.auditTrail.map((entry, i) => (
                  <div key={i} className="relative flex gap-3 py-2">
                    <div
                      className="absolute top-3 left-[-13px] h-2.5 w-2.5 shrink-0 rounded-full border-2"
                      style={{
                        borderColor:
                          i === c.auditTrail.length - 1 ? "#ec4899" : "rgba(255,255,255,0.1)",
                        background: i === c.auditTrail.length - 1 ? "#ec4899" : "#0e0e1a",
                      }}
                    />
                    <div className="ml-2">
                      <div className="text-white" style={{ fontSize: "0.78rem" }}>
                        {entry.action}
                      </div>
                      <div
                        className="flex items-center gap-2 text-gray-600"
                        style={{ fontSize: "0.68rem" }}
                      >
                        <span>{entry.timestamp}</span>
                        <span>·</span>
                        <span>{entry.actor}</span>
                      </div>
                      {entry.details && (
                        <div className="mt-0.5 text-gray-500" style={{ fontSize: "0.72rem" }}>
                          {entry.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!isFinal && (
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(139,92,246,0.04))",
                  border: "1px solid rgba(236,72,153,0.1)",
                }}
              >
                <div
                  className="mb-3 flex items-center gap-1.5 text-white"
                  style={{ fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <Shield className="h-4 w-4 text-pink-400" /> Interventii Admin
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-gray-500" style={{ fontSize: "0.72rem" }}>
                    Adauga nota admin
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="Nota..."
                      className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2 text-white outline-none placeholder:text-gray-600"
                      style={{ fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.06)" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onAddNote(c.id, adminNoteInput);
                          setAdminNoteInput("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        onAddNote(c.id, adminNoteInput);
                        setAdminNoteInput("");
                      }}
                      className="cursor-pointer rounded-lg px-3 py-2 text-violet-400 transition-all hover:bg-violet-400/10"
                      style={{
                        background: "rgba(139,92,246,0.08)",
                        border: "1px solid rgba(139,92,246,0.1)",
                        fontSize: "0.82rem",
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-gray-500" style={{ fontSize: "0.72rem" }}>
                    Schimba prioritate
                  </div>
                  <div className="flex gap-1.5">
                    {(
                      Object.entries(priorityConfig) as [
                        Priority,
                        (typeof priorityConfig)[Priority],
                      ][]
                    ).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => onChangePriority(c.id, key)}
                        className={`flex-1 cursor-pointer rounded-lg px-2 py-1.5 transition-all ${c.prioritate === key ? "ring-1" : ""}`}
                        style={{
                          fontSize: "0.72rem",
                          color: cfg.color,
                          background: `${cfg.color}10`,
                          border: `1px solid ${cfg.color}${c.prioritate === key ? "40" : "15"}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-gray-500" style={{ fontSize: "0.72rem" }}>
                    Forteaza status (override)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(["depusa", "verificare", "info_supl", "procesare"] as CerereStatus[])
                      .filter((s) => s !== c.status)
                      .map((s) => {
                        const cfg = statusConfig[s];
                        return (
                          <button
                            key={s}
                            onClick={() => onForceStatus(c.id, s)}
                            className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 transition-all hover:brightness-125"
                            style={{
                              fontSize: "0.7rem",
                              color: cfg.color,
                              background: cfg.bg,
                              border: `1px solid ${cfg.color}20`,
                            }}
                          >
                            <Zap className="h-2.5 w-2.5" /> {cfg.label}
                          </button>
                        );
                      })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-white/[0.04] pt-2">
                  <button
                    onClick={() => onReassign(c.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-cyan-400 transition-all hover:bg-cyan-400/10"
                    style={{
                      fontSize: "0.78rem",
                      background: "rgba(6,182,212,0.08)",
                      border: "1px solid rgba(6,182,212,0.12)",
                    }}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" /> Reasigneaza
                  </button>
                  {c.blocata && (
                    <button
                      onClick={() => onUnblock(c.id)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-emerald-400 transition-all hover:bg-emerald-400/10"
                      style={{
                        fontSize: "0.78rem",
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.12)",
                      }}
                    >
                      <Unlock className="h-3.5 w-3.5" /> Deblocheaza
                    </button>
                  )}
                  {!c.escaladata && (
                    <button
                      onClick={() => onEscalate(c.id)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-amber-400 transition-all hover:bg-amber-400/10"
                      style={{
                        fontSize: "0.78rem",
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.12)",
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5" /> Escaleaza la Primar
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onApprove(c.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-white"
                    style={{
                      fontSize: "0.78rem",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aproba
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onReject(c.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-white"
                    style={{
                      fontSize: "0.78rem",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Respinge
                  </motion.button>
                </div>
              </div>
            )}

            {isFinal && (
              <div
                className="flex items-center gap-2 rounded-xl p-3"
                style={{
                  background:
                    c.status === "aprobata" ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                  border: `1px solid ${sc.color}15`,
                }}
              >
                {c.status === "aprobata" ? (
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span style={{ fontSize: "0.85rem", color: sc.color, fontWeight: 600 }}>
                  Cerere {sc.label.toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
