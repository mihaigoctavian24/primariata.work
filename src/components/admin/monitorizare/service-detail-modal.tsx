"use client";

import type { LucideIcon } from "lucide-react";
import { AdminModal } from "@/components/admin/shared/admin-modal";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface ServiceInfo {
  id: string; // The grid uses id
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  latency: number;
  uptime: string;
  message?: string;
  icon: LucideIcon;
  description: string;
}

export interface ServiceDetailModalProps {
  open: boolean;
  service: ServiceInfo | null;
  onClose: () => void;
}

export function ServiceDetailModal({
  open,
  service,
  onClose,
}: ServiceDetailModalProps): React.JSX.Element {
  if (!service) return <></>;

  const mockChecks = [
    {
      time: "acum 0 min",
      result: service.status === "operational" ? "OK" : "DEGRADED",
      latency: service.latency,
    },
    { time: "acum 1 min", result: "OK", latency: Math.max(0, service.latency - 5) },
    { time: "acum 2 min", result: "OK", latency: service.latency + 3 },
  ];

  const latencyPoints = [
    { t: "-6m", v: service.latency + 10 },
    { t: "-5m", v: service.latency + 5 },
    { t: "-4m", v: Math.max(0, service.latency - 8) },
    { t: "-3m", v: service.latency + 2 },
    { t: "-2m", v: service.latency + 7 },
    { t: "-1m", v: Math.max(0, service.latency - 3) },
    { t: "now", v: service.latency },
  ];

  const statusColors = {
    operational: "var(--color-success)",
    degraded: "var(--color-warning)",
    down: "var(--color-error)",
    maintenance: "var(--color-neutral)",
  };

  const statusBgColors = {
    operational: "var(--color-success-subtle)",
    degraded: "var(--color-warning-subtle)",
    down: "var(--color-error-subtle)",
    maintenance: "bg-white/10",
  };

  const statusLabels = {
    operational: "Operațional",
    degraded: "Degradat",
    down: "Picat",
    maintenance: "Mentenanță",
  };

  const currentStatusColor = statusColors[service.status];
  const currentStatusBg = statusBgColors[service.status];
  const Icon = service.icon;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={service.name}
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            Închide
          </button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Header grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
            <span className="text-[0.65rem] tracking-wider text-muted-foreground uppercase mb-1 block">
              Status Curent
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
              style={{
                color: currentStatusColor,
                backgroundColor: currentStatusBg,
                borderColor: `color-mix(in srgb, ${currentStatusColor} 20%, transparent)`,
              }}
            >
              {statusLabels[service.status]}
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
            <span className="text-[0.65rem] tracking-wider text-muted-foreground uppercase mb-1 block">
              Latență
            </span>
            <span className="text-foreground font-semibold font-mono">{service.latency}ms</span>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
            <span className="text-[0.65rem] tracking-wider text-muted-foreground uppercase mb-1 block">
              Uptime (30z)
            </span>
            <span className="text-foreground font-semibold font-mono">{service.uptime}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-muted-foreground text-sm">{service.description}</p>
        </div>

        {/* Latency mini chart */}
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <span className="text-[0.7rem] tracking-wider text-muted-foreground uppercase mb-3 block">
            Evoluție Latență
          </span>
          <div className="h-[80px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyPoints} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={service.status === "operational" ? "#10b981" : "#f59e0b"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={service.status === "operational" ? "#10b981" : "#f59e0b"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border px-2 py-1 text-xs rounded shadow-lg text-foreground">
                          {payload[0]?.payload?.t}: {payload[0]?.value}ms
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={service.status === "operational" ? "#10b981" : "#f59e0b"}
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mock Health Checks */}
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <span className="text-[0.7rem] tracking-wider text-muted-foreground uppercase mb-3 block">
            Istoric Verificări (Mock)
          </span>
          <div className="space-y-2">
            {mockChecks.map((check, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/50 last:border-0 pb-2 last:pb-0"
              >
                <span className="text-muted-foreground text-xs w-[80px]">{check.time}</span>
                <span
                  className={`text-xs font-semibold ${
                    check.result === "OK" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"
                  }`}
                >
                  {check.result}
                </span>
                <span className="text-foreground text-xs font-mono">{check.latency}ms</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="text-[0.65rem] text-muted-foreground italic">
              Verificare dependențe indisponibilă (mock data).
            </span>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
