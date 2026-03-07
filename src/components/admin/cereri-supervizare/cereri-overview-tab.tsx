"use client";

import { useMemo } from "react";
import { FileText, CheckCircle2, XCircle, Loader2, AlertTriangle, Clock } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { DonutChart } from "@/components/admin/donut-chart";
import type { CerereRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const DB_STATUS_LABELS: Record<string, string> = {
  depusa: "Depuse",
  in_verificare: "În verificare",
  info_suplimentara: "Info suplimenare",
  in_procesare: "În procesare",
  aprobata: "Aprobate",
  respinsa: "Respinse",
};

/** Tailwind-compatible CSS variable colors for status chart segments */
const STATUS_COLORS: Record<string, string> = {
  depusa: "var(--color-sky-500, #0ea5e9)",
  in_verificare: "var(--color-violet-500, #8b5cf6)",
  info_suplimentara: "var(--color-orange-400, #fb923c)",
  in_procesare: "var(--color-cyan-500, #06b6d4)",
  aprobata: "var(--color-emerald-500, #10b981)",
  respinsa: "var(--color-red-500, #ef4444)",
};

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

    const slaRemaining = cereri.map((c) => ({
      id: c.id,
      remaining: computeSlaRemaining(c.data_termen),
    }));

    const slaCritical = slaRemaining.filter(
      (s) => s.remaining !== null && s.remaining >= 0 && s.remaining <= 7
    ).length;

    const slaOverdue = slaRemaining.filter((s) => s.remaining !== null && s.remaining < 0).length;

    // Donut chart data per status
    const statusCounts = cereri.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});

    const donutData = Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: DB_STATUS_LABELS[status] ?? status,
        value: count,
        color: STATUS_COLORS[status] ?? "var(--muted-foreground)",
      }));

    return { total, aprobate, inProcesare, respinse, slaCritical, slaOverdue, donutData };
  }, [cereri]);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={FileText}
          value={stats.total}
          label="Total cereri"
          colorVariant="default"
        />
        <StatsCard
          icon={CheckCircle2}
          value={stats.aprobate}
          label="Aprobate"
          colorVariant="success"
        />
        <StatsCard
          icon={Loader2}
          value={stats.inProcesare}
          label="În procesare"
          colorVariant="accent"
        />
        <StatsCard
          icon={XCircle}
          value={stats.respinse}
          label="Respinse"
          colorVariant="destructive"
        />
      </div>

      {/* Donut chart + SLA summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status distribution donut */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Distribuție pe statusuri</h3>
          <div className="flex items-center gap-6">
            <DonutChart
              data={stats.donutData}
              centerValue={stats.total}
              centerLabel="total"
              size={160}
            />
            <div className="flex-1 space-y-2">
              {stats.donutData.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: segment.color }}
                    />
                    <span className="text-muted-foreground text-xs">{segment.name}</span>
                  </div>
                  <span className="text-foreground text-xs font-semibold">{segment.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLA summary */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Situație SLA</h3>
          <div className="space-y-3">
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
                  <p className="text-sm font-semibold text-amber-400">Critice (&le;7 zile)</p>
                  <p className="text-muted-foreground text-xs">Necesită atenție</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-400">{stats.slaCritical}</span>
            </div>
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
              <span className="text-2xl font-bold text-emerald-400">
                {stats.total - stats.slaOverdue - stats.slaCritical}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CereriOverviewTab };
export type { CereriOverviewTabProps };
