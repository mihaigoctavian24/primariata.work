"use client";

import { motion } from "motion/react";
import {
  User,
  UserCheck,
  CheckCircle2,
  Clock,
  Timer,
  Lock,
  ArrowRightLeft,
  Unlock,
  ArrowUp,
  History,
  Flame,
  AlertTriangle,
} from "lucide-react";

import type { Cerere } from "./cereri-data";
import { statusConfig, priorityConfig } from "./cereri-data";

// ─── Props ────────────────────────────────────────────

interface CereriAlertsProps {
  alerts: Cerere[];
  onApprove: (id: string) => void;
  onUnblock: (id: string) => void;
  onEscalate: (id: string) => void;
  onReassign: (id: string) => void;
  onDetailDrawer: (id: string) => void;
}

// ─── Component ────────────────────────────────────────

export function CereriAlerts({
  alerts,
  onApprove,
  onUnblock,
  onEscalate,
  onReassign,
  onDetailDrawer,
}: CereriAlertsProps) {
  if (alerts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500/30" />
          <div style={{ fontSize: "1rem", fontWeight: 600 }} className="text-gray-400">
            Nicio alerta activa
          </div>
          <div style={{ fontSize: "0.82rem" }}>Toate cererile sunt in parametri normali.</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col gap-2.5">
        {alerts.map((c, i) => {
          const sc = statusConfig[c.status];
          const pc = priorityConfig[c.prioritate];
          const slaColor =
            c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
          const severity =
            c.slaZileRamase <= 0
              ? "critical"
              : c.blocata
                ? "high"
                : c.slaZileRamase <= 3
                  ? "medium"
                  : "low";
          const severityColor =
            severity === "critical"
              ? "#ef4444"
              : severity === "high"
                ? "#f97316"
                : severity === "medium"
                  ? "#f59e0b"
                  : "#6b7280";
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i }}
              className="rounded-xl p-4"
              style={{ background: `${severityColor}06`, border: `1px solid ${severityColor}15` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${severityColor}15` }}
                >
                  {severity === "critical" ? (
                    <Flame className="h-4 w-4" style={{ color: severityColor }} />
                  ) : severity === "high" ? (
                    <AlertTriangle className="h-4 w-4" style={{ color: severityColor }} />
                  ) : (
                    <Clock className="h-4 w-4" style={{ color: severityColor }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                      {c.numar}
                    </span>
                    <span className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {c.titlu}
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
                      <span className="h-1 w-1 rounded-full" style={{ background: pc.color }} />
                      {pc.label}
                    </span>
                  </div>
                  <div
                    className="mb-2 flex items-center gap-3 text-gray-500"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {c.cetatean}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />{" "}
                      {c.functionar !== "-" ? c.functionar : "Nealocat"}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{ color: slaColor, fontWeight: 600 }}
                    >
                      <Timer className="h-3 w-3" />{" "}
                      {c.slaZileRamase <= 0
                        ? `Depasit cu ${Math.abs(c.slaZileRamase)}z`
                        : `${c.slaZileRamase}z ramase`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {c.zileInStatus}z in status actual
                    </span>
                  </div>
                  {c.motivBlocare && (
                    <div
                      className="mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.1)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <Lock className="h-3 w-3 shrink-0 text-red-400" />
                      <span className="text-red-300/80">{c.motivBlocare}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
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
                        <ArrowUp className="h-3 w-3" /> Escaleaza la Primar
                      </button>
                    )}
                    <button
                      onClick={() => onApprove(c.id)}
                      className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-emerald-400 transition-all hover:bg-emerald-400/10"
                      style={{
                        fontSize: "0.72rem",
                        background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.1)",
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Aproba
                    </button>
                    <button
                      onClick={() => onDetailDrawer(c.id)}
                      className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-gray-400 transition-all hover:bg-white/5"
                      style={{
                        fontSize: "0.72rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <History className="h-3 w-3" /> Detalii
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
