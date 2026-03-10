"use client";

import { Building2, Users, FileText, DollarSign, Activity, AlertTriangle } from "lucide-react";

export function SaDashboardSkeleton() {
  const mockKpis = [
    { label: "Primării Active", icon: Building2 },
    { label: "Utilizatori Totali", icon: Users },
    { label: "Cereri Totale", icon: FileText },
    { label: "MRR", icon: DollarSign },
    { label: "Cereri/min Live", icon: Activity },
    { label: "Alerte Sistem", icon: AlertTriangle },
  ];

  return (
    <div className="flex animate-pulse flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-64 rounded-lg bg-white/5"></div>
          <div className="h-4 w-96 rounded-lg bg-white/5"></div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {mockKpis.map((kpi, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <kpi.icon className="h-4 w-4 text-white/20" />
              </div>
              <div className="h-4 w-8 rounded bg-white/10"></div>
            </div>
            <div className="mb-2 h-6 w-24 rounded bg-white/10"></div>
            <div className="h-3 w-16 rounded bg-white/10"></div>
          </div>
        ))}
      </div>

      {/* Top 3 Charts */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="col-span-1 h-[230px] rounded-2xl border border-white/5 bg-white/5 p-5 md:col-span-4"
          >
            <div className="mb-6 h-5 w-40 rounded bg-white/10"></div>
            <div className="h-[140px] w-full rounded-xl bg-white/5"></div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* User Growth */}
        <div className="col-span-1 h-[230px] rounded-2xl border border-white/5 bg-white/5 p-5 md:col-span-4">
          <div className="mb-6 h-5 w-48 rounded bg-white/10"></div>
          <div className="h-[140px] w-full rounded-xl bg-white/5"></div>
        </div>

        {/* Primarii Status List */}
        <div className="col-span-1 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5 md:col-span-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-white/10"></div>
            <div className="h-4 w-16 rounded bg-white/10"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/10"></div>
                <div className="flex-1">
                  <div className="mb-1.5 h-4 w-32 rounded bg-white/10"></div>
                  <div className="h-3 w-24 rounded bg-white/5"></div>
                </div>
                <div className="h-4 w-12 rounded-full bg-white/10"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5 md:col-span-4">
          <div className="mb-6 h-5 w-40 rounded bg-white/10"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-7 w-7 shrink-0 rounded-lg bg-white/10"></div>
                <div className="flex-1">
                  <div className="mb-1.5 h-4 w-full rounded bg-white/10"></div>
                  <div className="h-3 w-3/4 rounded bg-white/5"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
