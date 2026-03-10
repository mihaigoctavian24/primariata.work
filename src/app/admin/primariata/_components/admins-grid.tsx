"use client";

import { motion } from "framer-motion";
import { Building2, Eye, UserCog, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { toast } from "sonner";
import { PrimarieAdmin, adminStatusConfig, PerformanceBadge } from "./admins-shared";
import { Sparkline } from "./primarii-shared";

interface AdminsGridProps {
  items: PrimarieAdmin[];
  onSelect: (a: PrimarieAdmin) => void;
}

export function AdminsGrid({ items, onSelect }: AdminsGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-16 text-center" style={{ fontSize: "0.85rem" }}>
        Niciun admin găsit cu filtrele selectate.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((admin, i) => {
        const st = adminStatusConfig[admin.status];
        const StIcon = st.icon;
        const prevVal = admin.activityTrend[admin.activityTrend.length - 2] || 0;
        const lastVal = admin.activityTrend[admin.activityTrend.length - 1] || 0;
        const trendUp = admin.activityTrend.length >= 2 && lastVal > prevVal;
        const trendPct = prevVal > 0 ? Math.round(((lastVal - prevVal) / prevVal) * 100) : 0;

        return (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(admin)}
            className="group cursor-pointer rounded-2xl p-5 transition-all"
            style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="mb-4 flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                style={{
                  background:
                    admin.status === "active"
                      ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                      : admin.status === "pending"
                        ? "linear-gradient(135deg, #f59e0b, #f97316)"
                        : "linear-gradient(135deg, #6b7280, #4b5563)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {admin.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-foreground truncate"
                    style={{ fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    {admin.name}
                  </span>
                  <span
                    className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                      background: st.bg,
                      fontSize: "0.62rem",
                      color: st.color,
                      border: `1px solid ${st.color}15`,
                    }}
                  >
                    <StIcon className="h-2.5 w-2.5" /> {st.label}
                  </span>
                  {admin.twoFA && (
                    <span
                      className="rounded p-0.5"
                      style={{ background: "rgba(16,185,129,0.1)" }}
                      title="2FA Activ"
                    >
                      <Lock className="h-2.5 w-2.5 text-emerald-400" />
                    </span>
                  )}
                  <PerformanceBadge score={admin.satisfactionScore} />
                </div>
                <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
                  {admin.email}
                </div>
                <div
                  className="text-muted-foreground mt-1 flex items-center gap-1"
                  style={{ fontSize: "0.68rem" }}
                >
                  <Building2 className="text-muted-foreground h-3 w-3 shrink-0" />
                  <span className="truncate">{admin.primarie}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-3 grid grid-cols-5 gap-2">
              {[
                { label: "Users", value: admin.usersManaged },
                { label: "Cereri", value: admin.cereriSupervised },
                { label: "Acțiuni", value: admin.actionsThisMonth },
                { label: "Login-uri", value: admin.loginCount30d },
                { label: "Resp.", value: admin.avgResponseTime },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg px-1 py-1.5 text-center"
                  style={{ background: "var(--background)" }}
                >
                  <div className="text-foreground" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground truncate" style={{ fontSize: "0.55rem" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Sparkline + Trend + Actions */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkline
                  data={admin.activityTrend}
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
                  {admin.lastLogin}
                </span>
                <div className="ml-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(admin);
                    }}
                    className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 transition-all"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast(`Impersonare: ${admin.name}`);
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
