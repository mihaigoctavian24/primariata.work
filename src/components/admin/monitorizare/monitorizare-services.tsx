"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Settings } from "lucide-react";

import { services, statusStyles } from "./monitorizare-data";

// ─── Component ────────────────────────────────────────

export function MonitorizareServices() {
  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => s.status === "down").length;
  const maintenanceCount = services.filter((s) => s.status === "maintenance").length;

  return (
    <motion.div
      key="services"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* KPIs */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: "Operaționale", count: operationalCount, color: "#10b981", icon: CheckCircle2 },
          { label: "Degradate", count: degradedCount, color: "#f59e0b", icon: AlertTriangle },
          { label: "Oprite", count: downCount, color: "#ef4444", icon: XCircle },
          { label: "Mentenanță", count: maintenanceCount, color: "#6b7280", icon: Settings },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}
          >
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
            <div>
              <div
                className="text-white"
                style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}
              >
                {s.count}
              </div>
              <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {services.map((svc, i) => {
          const st = statusStyles[svc.status];
          const Icon = svc.icon;
          return (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              whileHover={{ y: -2 }}
              className="group cursor-pointer rounded-xl p-4 transition-all"
              style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${st.color}15` }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: st.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: st.color }} />
                  </div>
                  <div>
                    <div className="text-white" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                      {svc.name}
                    </div>
                    <div className="text-gray-600" style={{ fontSize: "0.68rem" }}>
                      {svc.description}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: st.color }} />
                  {svc.status === "operational" && (
                    <div
                      className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-30"
                      style={{ background: st.color }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>
                    Status
                  </div>
                  <span
                    className="rounded px-1.5 py-0.5"
                    style={{
                      fontSize: "0.68rem",
                      color: st.color,
                      background: `${st.color}12`,
                      fontWeight: 600,
                    }}
                  >
                    {st.label}
                  </span>
                </div>
                <div>
                  <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>
                    Latență
                  </div>
                  <div className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {svc.latency > 0 ? `${svc.latency}ms` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>
                    Uptime
                  </div>
                  <div className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {svc.uptime}
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>
                    Check
                  </div>
                  <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                    {svc.lastCheck}
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
