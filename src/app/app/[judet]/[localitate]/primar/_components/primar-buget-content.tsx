"use client";

import { motion } from "motion/react";
import { TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { DonutChart } from "@/components/admin/shared/donut-chart";
import type { DepartamentRow } from "@/actions/primar-actions";

// Color palette cycling for department segments
const DEPT_COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f97316", // orange
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ef4444", // red
  "#ec4899", // pink
];

interface PrimarBugetContentProps {
  initialData: {
    success: boolean;
    data?: {
      departamente: DepartamentRow[];
      totalBuget: number;
      totalConsumat: number;
    };
    error?: string;
  };
}

function formatRON(value: number): string {
  return value.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function PrimarBugetContent({ initialData }: PrimarBugetContentProps): React.ReactElement {
  if (!initialData.success || !initialData.data) {
    return (
      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            {initialData.error ?? "Eroare la încărcarea datelor. Încearcă să recarci pagina."}
          </span>
        </div>
      </div>
    );
  }

  const { departamente, totalBuget, totalConsumat } = initialData.data;
  const consumatPct = totalBuget > 0 ? Math.round((totalConsumat / totalBuget) * 100) : 0;

  // Map departamente to DonutChart segments
  const donutData = departamente.map((dept, i) => ({
    name: dept.nume,
    value: dept.buget_alocat ?? 0,
    color: DEPT_COLORS[i % DEPT_COLORS.length] ?? "#f59e0b",
  }));

  const hasDepartamente = departamente.length > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-white">Buget &amp; Finanțe</h1>
        <p className="mt-1 text-sm text-white/50">
          Vizualizare buget pe departamente și proiecte municipale
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Total Buget */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Wallet className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Buget</p>
              <p className="mt-0.5 text-xl font-bold text-white">{formatRON(totalBuget)} RON</p>
            </div>
          </div>
        </div>

        {/* Total Consumat */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">Total Consumat</p>
              <p className="mt-0.5 text-xl font-bold text-white">{formatRON(totalConsumat)} RON</p>
            </div>
          </div>
          {/* Progress bar showing consumed vs total */}
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] text-white/40">
              <span>Consumat</span>
              <span>{consumatPct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
              <div
                className="h-1.5 rounded-full bg-amber-400 transition-all duration-700"
                style={{ width: `${consumatPct}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* DonutChart + Allocation list */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Left: DonutChart */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] p-8">
          {hasDepartamente ? (
            <>
              <DonutChart
                data={donutData}
                size={220}
                centerLabel="departamente"
                centerValue={departamente.length}
              />
              <p className="mt-4 text-xs text-white/40">Distribuție buget pe departamente</p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <Wallet className="h-8 w-8 text-amber-400/50" />
              </div>
              <p className="text-sm text-white/40">Nu există departamente configurate</p>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                Adaugă departamente din setări
              </span>
            </div>
          )}
        </div>

        {/* Right: Allocation list */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/70">Alocare pe departamente</h2>
          {hasDepartamente ? (
            <div className="space-y-3">
              {departamente.map((dept, i) => {
                const color = DEPT_COLORS[i % DEPT_COLORS.length] ?? "#f59e0b";
                const pct = totalBuget > 0 ? Math.round((dept.buget_alocat / totalBuget) * 100) : 0;
                return (
                  <div key={dept.id} className="flex items-center gap-3">
                    {/* Color dot */}
                    <div
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium text-white/80">
                          {dept.nume}
                        </span>
                        <span className="ml-2 flex-shrink-0 text-sm font-semibold text-white">
                          {formatRON(dept.buget_alocat)} RON
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-white/[0.06]">
                          <div
                            className="h-1 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-[10px] text-white/30">{pct}%</span>
                      </div>
                      {dept.nr_functionari > 0 && (
                        <p className="mt-0.5 text-[11px] text-white/30">
                          {dept.nr_functionari} funcționari
                          {dept.sef ? ` · Șef: ${dept.sef}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/30">Nu există departamente de afișat.</p>
          )}
        </div>
      </motion.div>

      {/* Projects budget summary */}
      {totalBuget > 0 && (
        <motion.div
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="mb-3 text-sm font-semibold text-white/70">Rezumat financiar</h2>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[11px] text-white/40">Buget total alocat</p>
              <p className="mt-0.5 text-base font-bold text-white">{formatRON(totalBuget)} RON</p>
            </div>
            <div>
              <p className="text-[11px] text-white/40">Buget consumat (proiecte)</p>
              <p className="mt-0.5 text-base font-bold text-amber-400">
                {formatRON(totalConsumat)} RON
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/40">Buget rămas</p>
              <p className="mt-0.5 text-base font-bold text-emerald-400">
                {formatRON(Math.max(0, totalBuget - totalConsumat))} RON
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
