"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Eye, Edit3, UserCog, PowerOff, Power } from "lucide-react";
import { toast } from "sonner";
import { Primarie, statusConfig, tierConfig, HealthBadge, Sparkline } from "./primarii-shared";

interface PrimariiTableProps {
  items: Primarie[];
  onSelect: (p: Primarie) => void;
}

export function PrimariiTable({ items, onSelect }: PrimariiTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center" style={{ fontSize: "0.85rem" }}>
        Nicio primărie găsită cu filtrele selectate.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="text-muted-foreground col-span-3"
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
          className="text-muted-foreground col-span-1"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Tier
        </div>
        <div
          className="text-muted-foreground col-span-1 text-right"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Users
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
          Revenue
        </div>
        <div
          className="text-muted-foreground col-span-1 text-center"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Uptime
        </div>
        <div
          className="text-muted-foreground col-span-1 text-center"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Trend
        </div>
        <div
          className="text-muted-foreground col-span-2 text-right"
          style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          Acțiuni
        </div>
      </div>

      {/* Rows */}
      {items.map((p, i) => {
        const st = statusConfig[p.status];
        const StIcon = st.icon;
        const tc = tierConfig[p.tier];
        const prevVal = p.cereriTrend[p.cereriTrend.length - 2] || 0;
        const lastVal = p.cereriTrend[p.cereriTrend.length - 1] || 0;
        const trendUp = p.cereriTrend.length >= 2 && lastVal >= prevVal;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            className="grid cursor-pointer grid-cols-12 items-center gap-2 px-5 py-3 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.02]"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
            onClick={() => onSelect(p)}
          >
            <div className="col-span-3 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.12)",
                }}
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>
                  {p.name}
                </div>
                <div
                  className="text-muted-foreground flex items-center gap-1 truncate"
                  style={{ fontSize: "0.63rem" }}
                >
                  <MapPin className="h-2.5 w-2.5 shrink-0" /> {p.localitate}, {p.judet}
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <span
                className="flex w-fit max-w-full items-center gap-1 overflow-hidden rounded-full px-2 py-0.5"
                style={{
                  background: st.bg,
                  fontSize: "0.65rem",
                  color: st.color,
                  border: `1px solid ${st.color}15`,
                }}
              >
                <StIcon className="h-2.5 w-2.5 shrink-0" />{" "}
                <span className="truncate">{st.label}</span>
              </span>
            </div>
            <div className="col-span-1">
              <span
                className="rounded-full px-2 py-0.5"
                style={{
                  background: tc.bg,
                  color: tc.color,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  border: `1px solid ${tc.border}`,
                }}
              >
                {p.tier}
              </span>
            </div>
            <div
              className="text-foreground col-span-1 text-right"
              style={{ fontSize: "0.82rem", fontWeight: 600 }}
            >
              {p.usersCount}
            </div>
            <div
              className="text-foreground col-span-1 text-right"
              style={{ fontSize: "0.82rem", fontWeight: 600 }}
            >
              {p.cereriMonth}
            </div>
            <div
              className="text-foreground col-span-1 text-right"
              style={{ fontSize: "0.82rem", fontWeight: 600 }}
            >
              {p.revenue > 0 ? `${p.revenue}` : "—"}
            </div>
            <div className="col-span-1 flex justify-center">
              <HealthBadge uptime={p.uptime} status={p.status} />
            </div>
            <div className="col-span-1 flex justify-center">
              <Sparkline
                data={p.cereriTrend}
                color={trendUp ? "#10b981" : "#ef4444"}
                width={48}
                height={18}
              />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(p);
                }}
                className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-all"
                title="Vizualizare"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast(`Editare ${p.name}`);
                }}
                className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-all"
                title="Editare"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast(`Impersonare admin: ${p.adminName}`);
                }}
                className="bg-muted text-muted-foreground cursor-pointer rounded-lg p-1.5 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                title="Impersonare"
              >
                <UserCog className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast(p.status === "active" ? `Dezactivare ${p.name}` : `Activare ${p.name}`);
                }}
                className={`bg-muted cursor-pointer rounded-lg p-1.5 transition-all ${p.status === "active" ? "text-muted-foreground hover:bg-red-500/10 hover:text-red-400" : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"}`}
                title={p.status === "active" ? "Dezactivare" : "Activare"}
              >
                {p.status === "active" ? (
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
