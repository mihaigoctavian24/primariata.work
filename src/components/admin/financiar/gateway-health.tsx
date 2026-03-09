"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

import { gatewaysList } from "./financiar-data";

// ─── Component ────────────────────────────────────────

export function GatewayHealth() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-5 rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
          Gateway Status — Health Check
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {gatewaysList.map((gw, i) => (
          <motion.div
            key={gw.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 + i * 0.04 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: `${gw.color}06`, border: `1px solid ${gw.color}12` }}
          >
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: gw.color }} />
              {gw.status === "operational" && (
                <div
                  className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-30"
                  style={{ background: gw.color }}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {gw.name}
              </div>
              <div className="text-gray-600" style={{ fontSize: "0.68rem" }}>
                {gw.status === "operational" ? "Operațional" : "Degradat"} · {gw.latency} ·{" "}
                {gw.uptime}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
