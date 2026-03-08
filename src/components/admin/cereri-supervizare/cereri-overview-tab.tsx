"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DonutChart } from "@/components/admin/shared/donut-chart";
import { StatsCard } from "@/components/admin/shared/stats-card";
import { stagger } from "@/lib/motion";
import type { CerereRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Constants
// ============================================================================

/** Human-readable labels for each DB status */
const DB_STATUS_LABELS: Record<string, string> = {
  depusa: "Depuse",
  in_verificare: "În verificare",
  info_suplimentara: "Info suplimentare",
  in_procesare: "În procesare",
  aprobata: "Aprobate",
  respinsa: "Respinse",
};

/**
 * Hex colors for DonutChart segment fills (SVG stroke attribute — CSS vars not supported here).
 * These are semantic semantic palette values, not dark-only colors.
 */
const STATUS_HEX_COLORS: Record<string, string> = {
  depusa: "#0ea5e9", // sky-500
  in_verificare: "#8b5cf6", // violet-500
  info_suplimentara: "#fb923c", // orange-400
  in_procesare: "#06b6d4", // cyan-500
  aprobata: "#10b981", // emerald-500
  respinsa: "#ef4444", // red-500
};

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Component
// ============================================================================

interface CereriOverviewTabProps {
  cereri: CerereRow[];
}

function CereriOverviewTab({ cereri }: CereriOverviewTabProps): React.ReactElement {
  const stats = useMemo(() => {
    const total = cereri.length;
    const aprobate = cereri.filter((c) => c.status === "aprobata").length;
    const inProcesare = cereri.filter((c) => c.status === "in_procesare").length;
    const respinse = cereri.filter((c) => c.status === "respinsa").length;
    const escalate = cereri.filter((c) => c.escaladata === true).length;

    const slaValues = cereri.map((c) => computeSlaRemaining(c.data_termen));
    const slaRisc = slaValues.filter((d) => d !== null && d >= 0 && d <= 3).length;
    const slaOverdue = slaValues.filter((d) => d !== null && d < 0).length;
    const slaAtTime = total - slaRisc - slaOverdue;

    // Donut data per status (skip zero-count statuses)
    const statusCounts = cereri.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});

    const donutData = Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: DB_STATUS_LABELS[status] ?? status,
        value: count,
        color: STATUS_HEX_COLORS[status] ?? "#64748b",
      }));

    // Top 5 cereri closest to (or past) deadline for SLA summary
    const slaList = cereri
      .filter((c) => c.data_termen)
      .map((c) => ({ ...c, remaining: computeSlaRemaining(c.data_termen)! }))
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 5);

    return {
      total,
      aprobate,
      inProcesare,
      respinse,
      escalate,
      slaRisc,
      slaOverdue,
      slaAtTime,
      donutData,
      slaList,
    };
  }, [cereri]);

  return (
    <div className="space-y-6">
      {/* KPI stat cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"
      >
        {[
          {
            icon: FileText,
            value: stats.total,
            label: "Total cereri",
            variant: "default" as const,
          },
          {
            icon: Loader2,
            value: stats.inProcesare,
            label: "În procesare",
            variant: "accent" as const,
          },
          {
            icon: CheckCircle2,
            value: stats.aprobate,
            label: "Aprobate",
            variant: "success" as const,
          },
          {
            icon: XCircle,
            value: stats.respinse,
            label: "Respinse",
            variant: "destructive" as const,
          },
          {
            icon: AlertTriangle,
            value: stats.slaRisc,
            label: "SLA în risc",
            variant: "warning" as const,
          },
          {
            icon: TrendingUp,
            value: stats.escalate,
            label: "Escalate",
            variant: "warning" as const,
          },
        ].map((card) => (
          <StatsCard
            key={card.label}
            icon={card.icon}
            value={card.value}
            label={card.label}
            colorVariant={card.variant}
          />
        ))}
      </motion.div>

      {/* Donut chart + SLA summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status distribution */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Distribuție pe statusuri</h3>
          {stats.donutData.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground text-sm">Nicio cerere înregistrată</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <DonutChart
                data={stats.donutData}
                centerValue={stats.total}
                centerLabel="total"
                size={160}
              />
              <div className="flex-1 space-y-2">
                {stats.donutData.map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: seg.color }}
                      />
                      <span className="text-muted-foreground text-xs">{seg.name}</span>
                    </div>
                    <span className="text-foreground text-xs font-semibold">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SLA summary */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Situație SLA</h3>
          <div className="space-y-3">
            {/* Overdue */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Depășite</p>
                  <p className="text-muted-foreground text-xs">SLA expirat</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-400">{stats.slaOverdue}</span>
            </div>

            {/* Critical ≤3 days */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-400">Critice (&le;3 zile)</p>
                  <p className="text-muted-foreground text-xs">Necesită atenție</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-400">{stats.slaRisc}</span>
            </div>

            {/* On time */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">La timp</p>
                  <p className="text-muted-foreground text-xs">SLA respectat</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{stats.slaAtTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 closest-to-deadline cereri */}
      {stats.slaList.length > 0 && (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <h3 className="text-foreground mb-4 text-sm font-semibold">
            Top cereri aproape de termen (SLA)
          </h3>
          <div className="divide-y divide-white/[0.04]">
            {stats.slaList.map((cerere) => {
              const isOverdue = cerere.remaining < 0;
              const isCritical = cerere.remaining >= 0 && cerere.remaining <= 3;

              const badgeClass = isOverdue
                ? "bg-red-500/15 text-red-400"
                : isCritical
                  ? "bg-amber-400/15 text-amber-400"
                  : "bg-emerald-500/15 text-emerald-400";

              const label = isOverdue
                ? `+${Math.abs(cerere.remaining)}z depășit`
                : `${cerere.remaining}z rămase`;

              return (
                <div
                  key={cerere.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-foreground font-mono text-xs font-medium">
                    {cerere.numar_inregistrare}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${badgeClass}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { CereriOverviewTab };
export type { CereriOverviewTabProps };
