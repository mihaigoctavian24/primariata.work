"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowRightLeft, X } from "lucide-react";

import type { Cerere } from "./cereri-data";
import { functionariList } from "./cereri-data";

// ─── Props ────────────────────────────────────────────

interface CereriReassignModalProps {
  targetId: string | null;
  cereri: Cerere[];
  onReassign: (id: string, funcName: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────

export function CereriReassignModal({
  targetId,
  cereri,
  onReassign,
  onClose,
}: CereriReassignModalProps) {
  if (!targetId) return null;

  const currentCerere = cereri.find((c) => c.id === targetId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl p-5"
          style={{
            background: "linear-gradient(180deg, #1a1a2e, #141424)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="flex items-center gap-2 text-white"
              style={{ fontSize: "1rem", fontWeight: 600 }}
            >
              <ArrowRightLeft className="h-4 w-4 text-cyan-400" /> Reasigneaza Cerere
            </h3>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-3 text-gray-500" style={{ fontSize: "0.82rem" }}>
            Selecteaza functionarul caruia doresti sa-i reasignezi cererea {currentCerere?.numar}:
          </div>
          <div className="flex flex-col gap-2">
            {functionariList.map((f) => {
              const isCurrent = currentCerere?.functionar === f.name;
              const activeCnt = cereri.filter(
                (c) => c.functionar === f.name && !["aprobata", "respinsa"].includes(c.status)
              ).length;
              return (
                <button
                  key={f.id}
                  onClick={() => !isCurrent && onReassign(targetId, f.name)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-all ${isCurrent ? "ring-1 ring-cyan-500/30" : "hover:bg-white/[0.03]"}`}
                  style={{
                    background: isCurrent ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf680, #ec489980)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {f.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="flex items-center gap-2 text-white"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {f.name}
                      {isCurrent && (
                        <span
                          className="rounded px-1.5 py-0.5 text-cyan-400"
                          style={{ fontSize: "0.6rem", background: "rgba(6,182,212,0.12)" }}
                        >
                          actual
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                      {f.dept} · {activeCnt} cereri active
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div
                      className={`h-2 w-8 rounded-full ${activeCnt > 8 ? "bg-red-500/30" : activeCnt > 4 ? "bg-amber-500/30" : "bg-emerald-500/30"}`}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (activeCnt / 12) * 100)}%`,
                          background:
                            activeCnt > 8 ? "#ef4444" : activeCnt > 4 ? "#f59e0b" : "#10b981",
                        }}
                      />
                    </div>
                    <div className="mt-0.5 text-right text-gray-600" style={{ fontSize: "0.6rem" }}>
                      workload
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
