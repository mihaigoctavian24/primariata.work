"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Globe,
  Wifi,
  Terminal,
  Play,
  Pause,
  Trash2,
  Radio,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

import type { SystemAlert, LiveEvent } from "./monitorizare-data";
import {
  alertSeverityConfig,
  liveEventColors,
  liveEventPool,
  uptimeData,
  responseTimeData,
  errorRateData,
  requestsPerHour,
  GlassTooltip,
  CircularGauge,
} from "./monitorizare-data";

// ─── Props ────────────────────────────────────────────

interface MonitorizareOverviewProps {
  alerts: SystemAlert[];
  onAcknowledgeAlert: (id: string) => void;
}

// ─── Component ────────────────────────────────────────

export function MonitorizareOverview({ alerts, onAcknowledgeAlert }: MonitorizareOverviewProps) {
  const [cpu, setCpu] = useState(23);
  const [ram, setRam] = useState(41);
  const [disk, setDisk] = useState(62);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [livePaused, setLivePaused] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  // CPU/RAM/Disk fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((prev) => Math.max(10, Math.min(65, prev + (Math.random() - 0.48) * 8)));
      setRam((prev) => Math.max(30, Math.min(75, prev + (Math.random() - 0.5) * 5)));
      setDisk((prev) => Math.max(55, Math.min(90, prev + (Math.random() - 0.45) * 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Live event stream
  useEffect(() => {
    if (livePaused) return;
    const interval = setInterval(() => {
      const random = liveEventPool[Math.floor(Math.random() * liveEventPool.length)]!;
      const now = new Date();
      const evt: LiveEvent = {
        id: `le-${Date.now()}`,
        time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
        type: random.type,
        message: random.message,
      };
      setLiveEvents((prev) => [evt, ...prev].slice(0, 50));
    }, 2200);
    return () => clearInterval(interval);
  }, [livePaused]);

  useEffect(() => {
    if (liveRef.current) liveRef.current.scrollTop = 0;
  }, [liveEvents]);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Row 1: Resources + Uptime + Alerts */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        {/* Resurse Sistem */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-3 flex flex-col rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-4 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Resurse Sistem
          </h3>
          <div className="grid w-full grid-cols-3 gap-3">
            {[
              {
                value: Math.round(cpu),
                max: 100,
                color: cpu > 50 ? "#f59e0b" : "#10b981",
                label: "CPU",
                unit: "%",
              },
              {
                value: Math.round(ram),
                max: 100,
                color: ram > 60 ? "#f59e0b" : "#3b82f6",
                label: "RAM",
                unit: "%",
              },
              {
                value: Math.round(disk),
                max: 100,
                color: disk > 80 ? "#ef4444" : "#8b5cf6",
                label: "Disk",
                unit: "%",
              },
            ].map((g) => (
              <div key={g.label} className="flex flex-col items-center">
                <CircularGauge {...g} size={72} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex w-full flex-col gap-2">
            {[
              { label: "Sesiuni Active", value: "24", icon: Users, color: "#f59e0b" },
              { label: "Cereri/min", value: "87", icon: Globe, color: "#ec4899" },
              { label: "Latență API", value: "142ms", icon: Wifi, color: "#06b6d4" },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-lg px-2 py-1.5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center gap-2">
                  <m.icon className="h-3 w-3" style={{ color: m.color }} />
                  <span className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                    {m.label}
                  </span>
                </div>
                <span className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Uptime Chart */}
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
          <h3 className="mb-3 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Uptime — Ultimele 24h
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={uptimeData}>
              <defs>
                <linearGradient id="uptimeGradM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[99.5, 100.1]}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Uptime"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#uptimeGradM)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-4 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Alerte Active
            </h3>
            <span className="text-gray-600" style={{ fontSize: "0.68rem" }}>
              {unacknowledgedCount} neconfirmate
            </span>
          </div>
          <div
            className="flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}
          >
            {alerts
              .filter((a) => !a.acknowledged)
              .map((alert) => {
                const sc = alertSeverityConfig[alert.severity];
                const Icon = sc.icon;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex cursor-pointer items-start gap-2 rounded-xl p-2.5 transition-all hover:brightness-110"
                    style={{ background: sc.bg, border: `1px solid ${sc.color}15` }}
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: sc.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-white" style={{ fontSize: "0.78rem" }}>
                        {alert.title}
                      </div>
                      <div className="text-gray-600" style={{ fontSize: "0.65rem" }}>
                        {alert.time}
                      </div>
                      {expandedAlert === alert.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                        >
                          <div className="mt-1.5 text-gray-400" style={{ fontSize: "0.72rem" }}>
                            {alert.message}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcknowledgeAlert(alert.id);
                            }}
                            className="mt-2 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-emerald-400 transition-all hover:bg-white/5"
                            style={{ fontSize: "0.7rem", fontWeight: 600 }}
                          >
                            <CheckCircle2 className="h-3 w-3" /> Confirmă
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            {unacknowledgedCount === 0 && (
              <div className="flex flex-col items-center py-6 text-gray-600">
                <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400/30" />
                <span style={{ fontSize: "0.82rem" }}>Nicio alertă activă</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Row 2: 3 Charts */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-4 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-3 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Timp Răspuns
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="api"
                name="API"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="db"
                name="Database"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cache"
                name="Cache"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-4 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-3 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Error Rate — 24h
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Bar
                dataKey="4xx"
                name="4xx Client"
                fill="#f59e0b"
                radius={[3, 3, 0, 0]}
                barSize={12}
                stackId="errors"
              />
              <Bar
                dataKey="5xx"
                name="5xx Server"
                fill="#ef4444"
                radius={[3, 3, 0, 0]}
                barSize={12}
                stackId="errors"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-4 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-3 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Cereri pe Oră
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={requestsPerHour}>
              <defs>
                <linearGradient id="reqGradM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area
                type="monotone"
                dataKey="requests"
                name="Cereri"
                stroke="#ec4899"
                strokeWidth={2}
                fill="url(#reqGradM)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

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
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Live Event Stream
            </h3>
            {!livePaused && (
              <span className="relative ml-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600" style={{ fontSize: "0.7rem" }}>
              {liveEvents.length} events
            </span>
            <button
              onClick={() => setLivePaused(!livePaused)}
              className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
              style={{ fontSize: "0.72rem" }}
            >
              {livePaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {livePaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => setLiveEvents([])}
              className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
              style={{ fontSize: "0.72rem" }}
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>
        <div
          ref={liveRef}
          className="max-h-48 overflow-y-auto font-mono"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.05) transparent",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <AnimatePresence initial={false}>
            {liveEvents.slice(0, 20).map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-5 py-1.5 transition-all hover:bg-white/[0.015]"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
              >
                <span className="shrink-0 text-gray-700" style={{ fontSize: "0.68rem" }}>
                  {evt.time}
                </span>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: liveEventColors[evt.type] }}
                />
                <span
                  className="shrink-0 rounded px-1 py-0.5 uppercase"
                  style={{
                    fontSize: "0.55rem",
                    fontWeight: 600,
                    color: liveEventColors[evt.type],
                    background: `${liveEventColors[evt.type]}10`,
                  }}
                >
                  {evt.type}
                </span>
                <span
                  className={`truncate ${evt.type === "error" ? "text-red-400/80" : "text-gray-500"}`}
                  style={{ fontSize: "0.72rem" }}
                >
                  {evt.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {liveEvents.length === 0 && (
            <div
              className="flex items-center justify-center py-8 text-gray-700"
              style={{ fontSize: "0.78rem" }}
            >
              <Radio className="mr-2 h-4 w-4 opacity-50" /> Se așteaptă evenimente...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
