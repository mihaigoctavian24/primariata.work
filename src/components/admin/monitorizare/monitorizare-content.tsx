"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldAlert, CheckCircle, Search, Clock, Box } from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { GaugeSVG } from "@/components/admin/shared/gauge-svg";
import { MonitorizareCharts } from "./monitorizare-charts";
import { ServicesStatusGrid } from "./services-status-grid";
import { SecurityEventsLog, ScheduledJobsTable, AuditLogTable } from "./security-events-log";

// ============================================================================
// Types
// ============================================================================

type TabKey = "overview" | "servicii" | "securitate" | "jobs" | "audit";

interface TabConfig {
  id: TabKey;
  label: string;
}

const TABS: TabConfig[] = [
  { id: "overview", label: "Overview Sistem" },
  { id: "servicii", label: "Servicii & Latență" },
  { id: "securitate", label: "Securitate" },
  { id: "jobs", label: "Scheduled Jobs" },
  { id: "audit", label: "Audit Log Global" },
];

/** Live mock live event type */
interface LiveEvent {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  time: string;
}

// ============================================================================
// Main Coordinator Component
// ============================================================================

export function MonitorizareContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  
  // Real-time animated states
  const [cpu, setCpu] = useState(34);
  const [ram, setRam] = useState(58);
  const [disk, setDisk] = useState(69);

  // Live event ticker state
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    { id: "e1", type: "success", message: "API Gateway verificat (45ms)", time: "Acum" },
    { id: "e2", type: "info", message: "Job 'Sincronizare' completat", time: "12s" },
    { id: "e3", type: "warning", message: "CPU Spike (Redis Cache)", time: "45s" },
  ]);

  // Real-time mock engine (simulate live metrics)
  useEffect(() => {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const rand = (r: number) => (Math.random() - 0.5) * r;
    
    // Live Event generator
    const generateLiveEvent = (): LiveEvent => {
      const types: ("info" | "success" | "warning" | "error")[] = ["info", "success", "success", "info", "warning"];
      const messages = [
        "Sincronizare completă DB",
        "API Ping: 42ms OK",
        "Curățare tokeni JWT expirate",
        "Redis Memory utilizat 42%",
        "Worker #4 finalizat"
      ];
      return {
        id: `ev-${Date.now()}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        message: messages[Math.floor(Math.random() * messages.length)] as string,
        time: "Acum"
      };
    };

    const interval = setInterval(() => {
      // Fluctuate CPU between 12-78, RAM 45-82, Disk 67-72
      setCpu(prev => clamp(prev + rand(8), 12, 78));
      setRam(prev => clamp(prev + rand(6), 45, 82));
      setDisk(prev => clamp(prev + rand(1), 67, 72));
      
      // Every 3rd UI tick, add a new live event
      if (Math.random() > 0.6) {
        setLiveEvents(prev => [generateLiveEvent(), ...prev].slice(0, 5)); // Keep last 5
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto min-h-screen"
    >
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Centru Monitorizare
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status sistem, latențe servicii și alerte securitate în timp real.
          </p>
        </div>
        
        {/* Overall System Health Badge */}
        <div className="flex items-center gap-3 bg-[var(--color-success)]/10 text-[var(--color-success)] px-4 py-2 rounded-full border border-[var(--color-success)]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold tracking-wide">Sistem Operațional</span>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.05] pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "text-foreground border-accent-500"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/[0.02] rounded-t-lg"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="mon-tab-indicator"
                className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent-500"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Live Ticker (Top Bar) */}
            <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl px-4 py-2.5 flex items-center gap-3 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" /> Live Stream
              </span>
              <div className="bg-white/10 w-px h-4 mx-2" />
              <div className="flex-1 flex items-center gap-6 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {liveEvents.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 whitespace-nowrap text-xs"
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        evt.type === "success" && "bg-emerald-500",
                        evt.type === "info" && "bg-blue-500",
                        evt.type === "warning" && "bg-amber-500",
                        evt.type === "error" && "bg-red-500"
                      )} />
                      <span className="text-foreground/90">{evt.message}</span>
                      <span className="text-muted-foreground opacity-60">({evt.time})</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Gauges Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <GaugeCard title="Utilizare CPU" value={cpu} color="#10b981" unit="%" />
              <GaugeCard title="Memorie RAM" value={ram} color="#3b82f6" unit="%" />
              <GaugeCard title="Stocare SSD" value={disk} color="#f59e0b" unit="%" />
            </div>

            {/* Charts Row */}
            <MonitorizareCharts />
          </motion.div>
        )}

        {activeTab === "servicii" && (
          <motion.div
            key="servicii"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <ServicesStatusGrid />
          </motion.div>
        )}

        {activeTab === "securitate" && (
          <motion.div
            key="securitate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <SecurityEventsLog />
          </motion.div>
        )}

        {activeTab === "jobs" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <ScheduledJobsTable />
          </motion.div>
        )}

        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <AuditLogTable />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Internal Helpers
// ============================================================================

function GaugeCard({ title, value, color, unit }: { title: string, value: number, color: string, unit: string }) {
  return (
    <div className="bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] transition-colors relative overflow-hidden group">
      {/* Background radial highlight */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }}
      />
      
      <GaugeSVG value={value} max={100} color={color} label={title} unit={unit} />
    </div>
  );
}
