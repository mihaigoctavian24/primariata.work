"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  BarChart3,
  Server,
  ShieldAlert,
  Timer,
  Shield,
  RefreshCcw,
  Users,
  Globe,
  Wifi,
  Terminal,
  Play,
  Pause,
  Trash2,
  Radio,
} from "lucide-react";
import { GaugeSVG } from "@/components/admin/shared/gauge-svg";
import { MonitorizareCharts } from "./monitorizare-charts";
import { ServicesStatusGrid } from "./services-status-grid";
import { SecurityEventsLog, ScheduledJobsTable, AuditLogTable } from "./security-events-log";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "servicii" | "securitate" | "jobs" | "audit";

interface LiveEvent {
  id: string;
  time: string;
  type: "request" | "auth" | "system" | "error";
  message: string;
}

// ─── Live Event Pool ──────────────────────────────────────────────────────────

const liveEventPool: Omit<LiveEvent, "id" | "time">[] = [
  { type: "request", message: "GET /api/cereri — 200 OK (42ms)" },
  { type: "request", message: "POST /api/plati/validate — 200 OK (128ms)" },
  { type: "auth", message: "Login: maria.i@primaria.ro — succes (2FA)" },
  { type: "request", message: "GET /api/documente/list — 200 OK (35ms)" },
  { type: "system", message: "Cache invalidation — cereri_recent (Redis)" },
  { type: "request", message: "PUT /api/cereri/1852/status — 200 OK (89ms)" },
  { type: "error", message: "POST /api/plati/process — 502 Gateway Timeout" },
  { type: "request", message: "GET /api/users/profile — 200 OK (18ms)" },
  { type: "auth", message: "Token refresh: ion.p@primaria.ro" },
  { type: "system", message: "Worker: email_digest — procesare 12 notificări" },
  { type: "request", message: "GET /api/calendar/events — 200 OK (55ms)" },
  { type: "request", message: "POST /api/documente/upload — 201 Created (340ms)" },
  { type: "auth", message: "Login: dan.p@primaria.ro — succes" },
  { type: "error", message: "SMTP timeout — notificare #4521 în retry queue" },
  { type: "system", message: "Cron: cleanup_temp — 3 fișiere șterse" },
  { type: "request", message: "GET /api/monitorizare/health — 200 OK (5ms)" },
];

const liveEventTypeColors: Record<string, string> = {
  request: "#10b981",
  auth: "#3b82f6",
  system: "#8b5cf6",
  error: "#ef4444",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function rand(range: number): number {
  return (Math.random() - 0.5) * range;
}

function generateLiveEvent(): LiveEvent {
  const idx = Math.floor(Math.random() * liveEventPool.length);
  const pool = liveEventPool[idx] ?? liveEventPool[0]!;
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");
  return {
    id: `le-${Date.now()}-${Math.random()}`,
    time: `${hh}:${mm}:${ss}`,
    type: pool.type,
    message: pool.message,
  };
}

// ─── Tab navigation config ────────────────────────────────────────────────────

const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Prezentare Generală", icon: BarChart3 },
  { id: "servicii", label: "Servicii", icon: Server },
  { id: "securitate", label: "Securitate", icon: ShieldAlert },
  { id: "jobs", label: "Jobs Programate", icon: Timer },
  { id: "audit", label: "Audit Log", icon: Shield },
];

// ─── MonitorizareContent ──────────────────────────────────────────────────────

export function MonitorizareContent(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [cpu, setCpu] = useState(34);
  const [ram, setRam] = useState(58);
  const [disk, setDisk] = useState(69);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(() =>
    Array.from({ length: 5 }, () => generateLiveEvent())
  );
  const [livePaused, setLivePaused] = useState(false);

  // setInterval: CPU/RAM/Disk live fluctuation every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((prev) => clamp(prev + rand(8), 12, 78));
      setRam((prev) => clamp(prev + rand(6), 45, 82));
      setDisk((prev) => clamp(prev + rand(1), 67, 72));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Live event stream every 2.2s
  useEffect(() => {
    if (livePaused) return;
    const interval = setInterval(() => {
      setLiveEvents((prev) => [generateLiveEvent(), ...prev].slice(0, 20));
    }, 2200);
    return () => clearInterval(interval);
  }, [livePaused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h1 className="text-[1.6rem] font-bold text-white">Monitorizare Sistem</h1>
          </div>
          <p className="mt-1 text-[0.83rem] text-gray-600">
            Status platformă, servicii, securitate, jobs &amp; audit
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Servicii OK badge */}
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.12)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-emerald-400" style={{ fontSize: "0.72rem" }}>
              11/12 Servicii OK
            </span>
          </div>
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-gray-400 transition-all hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.82rem",
            }}
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mon-tab-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.06))",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
              <span className="relative z-10 text-[0.82rem]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Row 1: Gauges + Uptime Chart + Mini metrics */}
            <div className="grid grid-cols-12 gap-5">
              {/* Gauges panel */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="col-span-3 flex flex-col items-center rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="mb-4 self-start text-[0.95rem] font-semibold text-white">
                  Resurse Sistem
                </h3>
                {/* 3 GaugeSVG — DO NOT pass to AnimatedCounter (decimals); GaugeSVG renders value directly */}
                <div className="grid w-full grid-cols-3 justify-items-center gap-3">
                  <GaugeSVG value={cpu} max={100} color="#10b981" label="CPU" unit="%" size={72} />
                  <GaugeSVG value={ram} max={100} color="#3b82f6" label="RAM" unit="%" size={72} />
                  <GaugeSVG
                    value={disk}
                    max={100}
                    color="#f59e0b"
                    label="Disk"
                    unit="%"
                    size={72}
                  />
                </div>
                {/* Mini stats */}
                <div className="mt-4 w-full space-y-2">
                  {[
                    { label: "Sesiuni Active", value: "24", Icon: Users, color: "#f59e0b" },
                    { label: "Cereri/min", value: "87", Icon: Globe, color: "#ec4899" },
                    { label: "Latență API", value: "142ms", Icon: Wifi, color: "#06b6d4" },
                  ].map(({ label, value, Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3" style={{ color }} />
                        <span className="text-[0.72rem] text-gray-500">{label}</span>
                      </div>
                      <span className="text-[0.82rem] font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Uptime chart */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-5 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="mb-3 text-[0.95rem] font-semibold text-white">
                  Uptime — Ultimele 24h
                </h3>
                {/* Embedded inline uptime chart to avoid duplicate chart setup */}
                <div className="mt-2 text-[0.82rem] text-gray-500">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-emerald-400">99.97%</span>
                    <span className="text-gray-600">disponibilitate medie — ultimele 24h</span>
                  </div>
                  <div className="flex h-[140px] w-full items-end gap-0.5">
                    {[100, 100, 99.9, 100, 100, 99.8, 100, 100, 100, 99.9, 100, 100].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${((v - 99.5) / 0.6) * 100}%`,
                          background: v >= 100 ? "#10b981" : "#f59e0b",
                          opacity: 0.7 + (i / 12) * 0.3,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-[0.62rem] text-gray-700">
                    {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mini metrics column */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="col-span-4 space-y-3 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="text-[0.95rem] font-semibold text-white">Metrici Cheie</h3>
                {[
                  { label: "Disponibilitate", value: "99.97%", color: "#10b981" },
                  { label: "Timp Răspuns Mediu", value: "148ms", color: "#3b82f6" },
                  { label: "Rată Erori", value: "0.3%", color: "#f59e0b" },
                  { label: "Cereri Active", value: "247", color: "#8b5cf6" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{ background: `${color}06`, border: `1px solid ${color}12` }}
                  >
                    <span className="text-[0.78rem] text-gray-400">{label}</span>
                    <span className="text-[1rem] font-bold" style={{ color }}>
                      {value}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Row 2: Charts (4-panel grid — full width) */}
            <MonitorizareCharts />

            {/* Live Event Stream */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-[0.95rem] font-semibold text-white">Live Event Stream</h3>
                  {!livePaused && (
                    <span className="relative ml-1 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.7rem] text-gray-600">{liveEvents.length} events</span>
                  <button
                    onClick={() => setLivePaused((p) => !p)}
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[0.72rem] text-gray-500 transition-all hover:bg-white/5 hover:text-white"
                  >
                    {livePaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    {livePaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={() => setLiveEvents([])}
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[0.72rem] text-gray-500 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </div>
              </div>
              <div
                className="max-h-48 overflow-y-auto font-mono"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.05) transparent",
                  background: "rgba(0,0,0,0.15)",
                }}
              >
                <AnimatePresence initial={false}>
                  {liveEvents.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 px-5 py-1.5 transition-all hover:bg-white/[0.015]"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                    >
                      <span className="shrink-0 text-[0.68rem] text-gray-700">{evt.time}</span>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: liveEventTypeColors[evt.type] }}
                      />
                      <span
                        className="shrink-0 rounded px-1 py-0.5 text-[0.55rem] font-semibold uppercase"
                        style={{
                          color: liveEventTypeColors[evt.type],
                          background: `${liveEventTypeColors[evt.type]}10`,
                        }}
                      >
                        {evt.type}
                      </span>
                      <span
                        className={`truncate text-[0.72rem] ${evt.type === "error" ? "text-red-400/80" : "text-gray-500"}`}
                      >
                        {evt.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {liveEvents.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-[0.78rem] text-gray-700">
                    <Radio className="mr-2 h-4 w-4 opacity-50" /> Se așteaptă evenimente...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ SERVICII ═══ */}
        {activeTab === "servicii" && (
          <motion.div
            key="servicii"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ServicesStatusGrid />
          </motion.div>
        )}

        {/* ═══ SECURITATE ═══ */}
        {activeTab === "securitate" && (
          <motion.div
            key="securitate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SecurityEventsLog />
          </motion.div>
        )}

        {/* ═══ JOBS ═══ */}
        {activeTab === "jobs" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ScheduledJobsTable />
          </motion.div>
        )}

        {/* ═══ AUDIT ═══ */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AuditLogTable />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
