"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, X, Eye, Edit3, UserCog, PowerOff, Power } from "lucide-react";
import { toast } from "sonner";
import { PrimarieAdmin, adminStatusConfig } from "./admins-shared";
import { Sparkline } from "./primarii-shared";

interface AdminsTableProps {
  items: PrimarieAdmin[];
  onSelect: (a: PrimarieAdmin) => void;
}

export function AdminsTable({ items, onSelect }: AdminsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center" style={{ fontSize: "0.85rem" }}>
        Niciun admin găsit cu filtrele selectate.
      </div>
    );
  }

  return (
    <motion.div
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-3 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="text-muted-foreground col-span-3"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Admin
        </div>
        <div
          className="text-muted-foreground col-span-2"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Primărie
        </div>
        <div
          className="text-muted-foreground col-span-1"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Status
        </div>
        <div
          className="text-muted-foreground col-span-1 text-right"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Cereri
        </div>
        <div
          className="text-muted-foreground col-span-1 text-right"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Acțiuni
        </div>
        <div
          className="text-muted-foreground col-span-1 text-center"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Trend
        </div>
        <div
          className="text-muted-foreground col-span-1 text-center"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          2FA
        </div>
        <div
          className="text-muted-foreground col-span-2 text-right"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Acțiuni
        </div>
      </div>

      {/* Rows */}
      {items.map((admin, i) => {
        const st = adminStatusConfig[admin.status];
        const StIcon = st.icon;
        const prevVal = admin.activityTrend[admin.activityTrend.length - 2] || 0;
        const lastVal = admin.activityTrend[admin.activityTrend.length - 1] || 0;
        const trendUp = admin.activityTrend.length >= 2 && lastVal > prevVal;

        return (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(admin)}
            className="grid cursor-pointer grid-cols-12 items-center gap-3 px-5 py-3 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.02]"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            {/* Admin info */}
            <div className="col-span-3 flex min-w-0 items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                style={{
                  background:
                    admin.status === "active"
                      ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                      : admin.status === "pending"
                        ? "linear-gradient(135deg, #f59e0b, #f97316)"
                        : "linear-gradient(135deg, #6b7280, #4b5563)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                {admin.avatar}
              </div>
              <div className="min-w-0">
                <div
                  className="text-foreground truncate"
                  style={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  {admin.name}
                </div>
                <div className="text-muted-foreground truncate" style={{ fontSize: "0.65rem" }}>
                  {admin.email}
                </div>
              </div>
            </div>

            {/* Primărie */}
            <div
              className="text-foreground col-span-2 flex min-w-0 items-center gap-1"
              style={{ fontSize: "0.75rem" }}
            >
              <Building2 className="text-muted-foreground h-3 w-3 shrink-0" />
              <span className="truncate">{admin.primarie}</span>
            </div>

            {/* Status */}
            <div className="col-span-1">
              <span
                className="flex w-fit items-center gap-1 rounded-full px-2 py-0.5"
                style={{
                  background: st.bg,
                  fontSize: "0.62rem",
                  color: st.color,
                  border: `1px solid ${st.color}15`,
                }}
              >
                <StIcon className="h-2.5 w-2.5" /> <span className="truncate">{st.label}</span>
              </span>
            </div>

            {/* Cereri */}
            <div
              className="text-foreground col-span-1 text-right"
              style={{ fontSize: "0.82rem", fontWeight: 600 }}
            >
              {admin.cereriSupervised.toLocaleString()}
            </div>

            {/* Acțiuni */}
            <div className="text-foreground col-span-1 text-right" style={{ fontSize: "0.82rem" }}>
              {admin.actionsThisMonth}
            </div>

            {/* Trend sparkline */}
            <div className="col-span-1 flex justify-center">
              <Sparkline
                data={admin.activityTrend}
                color={trendUp ? "#10b981" : "#ef4444"}
                width={48}
                height={18}
              />
            </div>

            {/* 2FA */}
            <div className="col-span-1 flex justify-center">
              {admin.twoFA ? (
                <span
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    fontSize: "0.6rem",
                    color: "#10b981",
                  }}
                >
                  <ShieldCheck className="h-2.5 w-2.5" /> Da
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    fontSize: "0.6rem",
                    color: "#ef4444",
                  }}
                >
                  <X className="h-2.5 w-2.5" /> Nu
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(admin);
                }}
                className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-all"
                title="Vizualizare"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast(`Editare ${admin.name}`);
                }}
                className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-all"
                title="Editare"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast(`Impersonare: ${admin.name}`);
                }}
                className="bg-muted text-muted-foreground cursor-pointer rounded-lg p-1.5 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                title="Impersonare"
              >
                <UserCog className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast(
                    admin.status === "active"
                      ? `Suspendare ${admin.name}`
                      : `Activare ${admin.name}`
                  );
                }}
                className={`bg-muted cursor-pointer rounded-lg p-1.5 transition-all ${admin.status === "active" ? "text-muted-foreground hover:bg-red-500/10 hover:text-red-400" : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"}`}
                title={admin.status === "active" ? "Suspendare" : "Activare"}
              >
                {admin.status === "active" ? (
                  <PowerOff className="h-3.5 w-3.5" />
                ) : (
                  <Power className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
