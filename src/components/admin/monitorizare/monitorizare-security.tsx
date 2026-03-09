"use client";

import { motion } from "framer-motion";
import { ShieldAlert, UserX, WifiOff, Users, Lock } from "lucide-react";

import { securityEvents, secEventConfig } from "./monitorizare-data";

// ─── Component ────────────────────────────────────────

export function MonitorizareSecurity() {
  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* KPIs */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          {
            label: "Login-uri Eșuate (24h)",
            value: securityEvents.filter((e) => e.type === "login_fail").length,
            color: "#ef4444",
            icon: UserX,
          },
          {
            label: "IP-uri Blocate",
            value: securityEvents.filter((e) => e.type === "ip_block").length,
            color: "#f59e0b",
            icon: WifiOff,
          },
          { label: "Sesiuni Active", value: 24, color: "#3b82f6", icon: Users },
          { label: "2FA Activat", value: "78%", color: "#10b981", icon: Lock },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: `${m.color}06`, border: `1px solid ${m.color}12` }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${m.color}15` }}
            >
              <m.icon className="h-4 w-4" style={{ color: m.color }} />
            </div>
            <div>
              <div
                className="text-white"
                style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1 }}
              >
                {m.value}
              </div>
              <div className="text-gray-500" style={{ fontSize: "0.7rem" }}>
                {m.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-violet-400" />
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Evenimente Securitate
            </h3>
          </div>
          <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>
            Ultimele 24h
          </span>
        </div>
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
          style={{
            fontSize: "0.65rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-1">Ora</div>
          <div className="col-span-2">Tip</div>
          <div className="col-span-3">Utilizator</div>
          <div className="col-span-2">IP</div>
          <div className="col-span-4">Detalii</div>
        </div>
        {securityEvents.map((evt, i) => {
          const cfg = secEventConfig[evt.type];
          const EvtIcon = cfg.icon;
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 * i }}
              className="grid grid-cols-12 items-center gap-2 px-5 py-2.5 transition-all hover:bg-white/[0.015]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              <div className="col-span-1">
                <span className="font-mono text-gray-600" style={{ fontSize: "0.72rem" }}>
                  {evt.time}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
                  style={{
                    fontSize: "0.65rem",
                    color: cfg.color,
                    background: `${cfg.color}10`,
                    fontWeight: 600,
                  }}
                >
                  <EvtIcon className="h-3 w-3" /> {cfg.label}
                </span>
              </div>
              <div className="col-span-3 truncate text-gray-300" style={{ fontSize: "0.78rem" }}>
                {evt.user}
              </div>
              <div className="col-span-2">
                <span className="font-mono text-gray-500" style={{ fontSize: "0.72rem" }}>
                  {evt.ip}
                </span>
              </div>
              <div className="col-span-4 truncate text-gray-500" style={{ fontSize: "0.75rem" }}>
                {evt.details}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
