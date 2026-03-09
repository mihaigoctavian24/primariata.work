"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Activity, AlertTriangle, RefreshCcw } from "lucide-react";

import type { TabKey, SystemAlert } from "./monitorizare-data";
import { TABS, initialAlerts, services } from "./monitorizare-data";
import { MonitorizareOverview } from "./monitorizare-overview";
import { MonitorizareServices } from "./monitorizare-services";
import { MonitorizareSecurity } from "./monitorizare-security";
import { MonitorizareJobs } from "./monitorizare-jobs";
import { MonitorizareAudit } from "./monitorizare-audit";

// ─── Component ────────────────────────────────────────

export function MonitorizareContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const operationalServices = services.filter((s) => s.status === "operational").length;
  const totalServices = services.length;

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    toast.success("Alertă confirmată");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <Activity className="h-6 w-6 text-emerald-400" /> Monitorizare Sistem
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-gray-600"
            style={{ fontSize: "0.83rem" }}
          >
            Status platformă, servicii, securitate, jobs & audit — vizualizare Admin
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.12)",
            }}
          >
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-emerald-400" style={{ fontSize: "0.72rem" }}>
              {operationalServices}/{totalServices} Servicii OK
            </span>
          </div>
          {unacknowledgedCount > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.12)",
              }}
            >
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-red-400" style={{ fontSize: "0.72rem" }}>
                {unacknowledgedCount} Alerte
              </span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toast.success("🔄 Date actualizate")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-gray-400 transition-all hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.82rem",
            }}
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </motion.button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = tab.id === "services" ? 1 : undefined;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="monitorTab"
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
              <span className="relative z-10" style={{ fontSize: "0.82rem" }}>
                {tab.label}
              </span>
              {badge && (
                <span
                  className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full text-white"
                  style={{ background: "#ef4444", fontSize: "0.55rem", fontWeight: 700 }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <MonitorizareOverview alerts={alerts} onAcknowledgeAlert={acknowledgeAlert} />
        )}
        {activeTab === "services" && <MonitorizareServices />}
        {activeTab === "security" && <MonitorizareSecurity />}
        {activeTab === "jobs" && <MonitorizareJobs />}
        {activeTab === "audit" && <MonitorizareAudit />}
      </AnimatePresence>
    </motion.div>
  );
}
