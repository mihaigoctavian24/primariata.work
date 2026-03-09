"use client";

import { motion } from "motion/react";
import { User, UserCheck, Lock, Timer } from "lucide-react";

import type { Cerere } from "./cereri-data";
import { statusConfig, priorityConfig, kanbanColumns } from "./cereri-data";

// ─── Props ────────────────────────────────────────────

interface CereriKanbanProps {
  cereri: Cerere[];
  onDetailDrawer: (id: string) => void;
}

// ─── Component ────────────────────────────────────────

export function CereriKanban({ cereri, onDetailDrawer }: CereriKanbanProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 overflow-x-auto pb-4"
    >
      {kanbanColumns.map((status) => {
        const sc = statusConfig[status];
        const items = cereri.filter((c) => c.status === status);
        return (
          <div
            key={status}
            className="flex w-56 flex-shrink-0 flex-col overflow-hidden rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center gap-2 border-b border-white/[0.04] px-3 py-2.5">
              <div className="h-2 w-2 rounded-full" style={{ background: sc.color }} />
              <span className="text-gray-200" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                {sc.label}
              </span>
              <span
                className="ml-auto rounded px-1.5 py-0.5 text-gray-500"
                style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.05)" }}
              >
                {items.length}
              </span>
            </div>
            <div
              className="flex max-h-[55vh] flex-1 flex-col gap-2 overflow-y-auto p-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.05) transparent",
              }}
            >
              {items.map((c) => {
                const slaColor =
                  c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
                const isFinal = c.status === "aprobata" || c.status === "respinsa";
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group cursor-pointer rounded-xl p-2.5 transition-all hover:bg-white/[0.03]"
                    style={{
                      background: "rgba(255,255,255,0.015)",
                      border: c.blocata
                        ? "1px solid rgba(239,68,68,0.2)"
                        : "1px solid rgba(255,255,255,0.04)",
                    }}
                    onClick={() => onDetailDrawer(c.id)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: "0.68rem" }}>
                        {c.numar}
                      </span>
                      <div className="flex items-center gap-1">
                        {c.blocata && <Lock className="h-2.5 w-2.5 text-red-400" />}
                        <span
                          className="flex items-center gap-0.5"
                          style={{ fontSize: "0.62rem", color: priorityConfig[c.prioritate].color }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ background: priorityConfig[c.prioritate].color }}
                          />{" "}
                          {priorityConfig[c.prioritate].label}
                        </span>
                      </div>
                    </div>
                    <div className="mb-1 text-white" style={{ fontSize: "0.78rem" }}>
                      {c.titlu}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <User className="h-2.5 w-2.5 text-gray-600" />
                        <span className="truncate text-gray-500" style={{ fontSize: "0.68rem" }}>
                          {c.cetatean}
                        </span>
                      </div>
                      {!isFinal && (
                        <span
                          className="flex items-center gap-0.5"
                          style={{ fontSize: "0.62rem", color: slaColor }}
                        >
                          <Timer className="h-2.5 w-2.5" />{" "}
                          {c.slaZileRamase <= 0 ? "SLA!" : `${c.slaZileRamase}z`}
                        </span>
                      )}
                    </div>
                    {c.functionar !== "-" && (
                      <div className="mt-1 flex items-center gap-1">
                        <UserCheck className="h-2.5 w-2.5 text-gray-600" />
                        <span className="text-gray-600" style={{ fontSize: "0.65rem" }}>
                          {c.functionar}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {items.length === 0 && (
                <div
                  className="flex items-center justify-center py-6 text-gray-700"
                  style={{ fontSize: "0.75rem" }}
                >
                  Gol
                </div>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
