"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

import type { UserRole, UserStats } from "./utilizatori-data";
import { roleConfig, registrationTrend, CustomTooltip } from "./utilizatori-data";

// ─── Props ────────────────────────────────────────────

interface UtilizatoriStatsProps {
  stats: UserStats;
  roleFilter: UserRole | "all";
  onRoleFilter: (role: UserRole | "all") => void;
}

// ─── Component ────────────────────────────────────────

export function UtilizatoriStats({ stats, roleFilter, onRoleFilter }: UtilizatoriStatsProps) {
  return (
    <div className="mb-5 grid grid-cols-12 gap-4">
      <div className="col-span-8 grid grid-cols-4 gap-2.5">
        {(Object.entries(roleConfig) as [UserRole, (typeof roleConfig)[UserRole]][]).map(
          ([key, cfg], i) => {
            const Icon = cfg.icon;
            const isActive = roleFilter === key;
            const self = key === "admin";
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                whileHover={{ y: -2 }}
                onClick={() => onRoleFilter(isActive ? "all" : key)}
                className={`flex cursor-pointer flex-col rounded-xl p-3 text-left transition-all ${isActive ? "ring-1" : ""}`}
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}${isActive ? "40" : "18"}`,
                  ...(isActive ? { ringColor: cfg.color } : {}),
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: `${cfg.color}20` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                  </div>
                  {self && <ShieldCheck className="h-3 w-3 text-violet-400/50" />}
                </div>
                <div
                  className="text-white"
                  style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1 }}
                >
                  {stats.byRole[key] || 0}
                </div>
                <div className="mt-0.5 text-gray-500" style={{ fontSize: "0.65rem" }}>
                  {cfg.label}
                </div>
              </motion.button>
            );
          }
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-4 rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 className="mb-3 text-white" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
          Înregistrări Recente
        </h3>
        <ResponsiveContainer width="100%" height={70}>
          <AreaChart data={registrationTrend}>
            <defs>
              <linearGradient id="regGradU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Utilizatori"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              fill="url(#regGradU)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
