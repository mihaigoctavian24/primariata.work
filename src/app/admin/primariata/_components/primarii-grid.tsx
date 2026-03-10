"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Eye, UserCog, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Primarie, tierConfig, HealthBadge, Sparkline } from "./primarii-shared";

interface PrimariiGridProps {
  items: Primarie[];
  onSelect: (p: Primarie) => void;
}

export function PrimariiGrid({ items, onSelect }: PrimariiGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-16 text-center" style={{ fontSize: "0.85rem" }}>
        Nicio primărie găsită cu filtrele selectate.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => {
        const tc = tierConfig[p.tier];
        const lastVal = p.cereriTrend[p.cereriTrend.length - 1] || 0;
        const prevVal = p.cereriTrend[p.cereriTrend.length - 2] || 0;
        const trendUp = p.cereriTrend.length >= 2 && lastVal >= prevVal;
        const trendPct = prevVal > 0 ? Math.round(((lastVal - prevVal) / prevVal) * 100) : 0;

        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(p)}
            className="group cursor-pointer rounded-2xl p-4 transition-all hover:scale-[1.01]"
            style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
            whileHover={{ borderColor: "rgba(16,185,129,0.15)" }}
          >
            {/* Card Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex max-w-[70%] items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                >
                  <Building2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-foreground group-hover:text-foreground truncate transition-colors"
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}
                  >
                    {p.name}
                  </div>
                  <div
                    className="text-muted-foreground flex items-center gap-1 truncate"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <MapPin className="h-2.5 w-2.5 shrink-0" /> {p.localitate}, {p.judet}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{
                    background: tc.bg,
                    color: tc.color,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    border: `1px solid ${tc.border}`,
                  }}
                >
                  {p.tier}
                </span>
                <HealthBadge uptime={p.uptime} status={p.status} />
              </div>
            </div>

            {/* Metrics Row */}
            <div className="mb-3 grid grid-cols-4 gap-2">
              {[
                { label: "Users", value: p.usersCount, color: "#06b6d4" },
                { label: "Cereri/lun", value: p.cereriMonth, color: "#8b5cf6" },
                { label: "Revenue", value: `${p.revenue > 0 ? p.revenue : "—"}`, color: "#f59e0b" },
                {
                  label: "Satisf.",
                  value: p.status === "active" ? `${p.satisfactionScore}★` : "—",
                  color: "#ec4899",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg px-1 py-1.5 text-center"
                  style={{ background: "var(--background)" }}
                >
                  <div className="text-foreground" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {typeof m.value === "number" ? m.value.toLocaleString() : m.value}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "0.58rem" }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Sparkline + Trend */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkline
                  data={p.cereriTrend}
                  color={trendUp ? "#10b981" : "#ef4444"}
                  width={56}
                  height={20}
                />
                {trendPct !== 0 && (
                  <span
                    className="flex items-center gap-0.5"
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: trendUp ? "#10b981" : "#ef4444",
                    }}
                  >
                    {trendUp ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5" />
                    )}
                    {trendUp ? "+" : ""}
                    {trendPct}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>
                  Resp: {p.avgResponseTime}
                </span>
                <div className="ml-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(p);
                    }}
                    className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 transition-all"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast(`Impersonare admin: ${p.adminName}`);
                    }}
                    className="bg-muted text-muted-foreground cursor-pointer rounded p-1 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <UserCog className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
