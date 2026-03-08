"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { AdminModal } from "@/components/admin/shared/admin-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceInfo {
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  latency: number;
  uptime: string;
  lastCheck: string;
  icon: LucideIcon;
  description: string;
}

export interface ServiceDetailModalProps {
  open: boolean;
  service: ServiceInfo | null;
  onClose: () => void;
}

// ─── Status badge colors via CSS tokens ───────────────────────────────────────

const STATUS_COLOR: Record<ServiceInfo["status"], string> = {
  operational: "var(--color-success)",
  degraded: "var(--color-warning)",
  down: "var(--color-error)",
  maintenance: "var(--color-neutral)",
};

const STATUS_LABEL: Record<ServiceInfo["status"], string> = {
  operational: "Operațional",
  degraded: "Degradat",
  down: "Oprit",
  maintenance: "Mentenanță",
};

// ─── Custom tiny tooltip ──────────────────────────────────────────────────────

interface TinyTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function TinyTooltip({ active, payload, label }: TinyTooltipProps): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-2.5 py-1.5 text-[0.72rem]"
      style={{
        background: "var(--popover)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold text-white">{payload[0]?.value}ms</div>
    </div>
  );
}

// ─── ServiceDetailModal ───────────────────────────────────────────────────────

export function ServiceDetailModal({
  open,
  service,
  onClose,
}: ServiceDetailModalProps): React.JSX.Element {
  if (!service) {
    return <AdminModal open={open} onClose={onClose} title="" size="md"><></></AdminModal>;
  }

  const statusColor = STATUS_COLOR[service.status];
  const statusLabel = STATUS_LABEL[service.status];

  // Mock 7-point latency sparkline
  const latencyPoints = [
    { t: "-6m", v: service.latency + 10 },
    { t: "-5m", v: service.latency + 5 },
    { t: "-4m", v: service.latency - 8 },
    { t: "-3m", v: service.latency + 2 },
    { t: "-2m", v: service.latency + 7 },
    { t: "-1m", v: service.latency - 3 },
    { t: "now", v: service.latency },
  ];

  // Mock last 3 health check rows
  const mockChecks = [
    {
      time: service.lastCheck,
      result: service.status === "operational" ? "OK" : "DEGRADED",
      latency: service.latency,
    },
    { time: "acum 1 min", result: "OK", latency: service.latency - 5 },
    { time: "acum 2 min", result: "OK", latency: service.latency + 3 },
  ];

  // SVG fill: hex required for SVG attributes (project decision Phase 19)
  const chartFill = service.status === "operational" ? "#10b981" : "#f59e0b";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={service.name}
      size="md"
    >
      <div className="space-y-5">
        {/* Header info row: status + latency + uptime */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl px-3 py-2.5" style={{ background: `${statusColor}10`, border: `1px solid ${statusColor}20` }}>
            <div className="text-[0.65rem] text-muted-foreground mb-0.5">Status</div>
            <span
              className="rounded px-1.5 py-0.5 text-[0.72rem] font-semibold"
              style={{ color: statusColor, background: `${statusColor}15` }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="rounded-xl px-3 py-2.5 border border-border bg-card/50">
            <div className="text-[0.65rem] text-muted-foreground mb-0.5">Latență</div>
            <div className="text-[0.88rem] font-bold text-foreground">
              {service.latency > 0 ? `${service.latency}ms` : "—"}
            </div>
          </div>
          <div className="rounded-xl px-3 py-2.5 border border-border bg-card/50">
            <div className="text-[0.65rem] text-muted-foreground mb-0.5">Uptime</div>
            <div className="text-[0.88rem] font-bold text-foreground">{service.uptime}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{service.description}</p>

        {/* Last 3 health check rows */}
        <div>
          <div className="text-[0.72rem] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Ultimele Verificări
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            {mockChecks.map((check, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-3 py-2 text-xs"
                style={{ borderBottom: i < mockChecks.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
              >
                <span className="text-muted-foreground w-24 shrink-0">{check.time}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[0.65rem] font-semibold shrink-0"
                  style={{
                    color: check.result === "OK" ? "var(--color-success)" : "var(--color-warning)",
                    background: check.result === "OK" ? "var(--color-success-subtle, rgba(16,185,129,0.1))" : "var(--color-warning-subtle, rgba(245,158,11,0.1))",
                  }}
                >
                  {check.result}
                </span>
                <span className="text-muted-foreground ml-auto">{check.latency > 0 ? `${check.latency}ms` : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latency mini chart */}
        {service.latency > 0 && (
          <div>
            <div className="text-[0.72rem] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Tendință Latență (7 min)
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={latencyPoints} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="svcLatencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartFill} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartFill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 9, fill: "var(--muted-foreground, #6b7280)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--muted-foreground, #6b7280)" }}
                  axisLine={false}
                  tickLine={false}
                  unit="ms"
                />
                <Tooltip content={<TinyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="v"
                  name="Latență"
                  stroke={chartFill}
                  strokeWidth={1.5}
                  fill="url(#svcLatencyGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Dependencies note */}
        <p className="text-[0.72rem] text-muted-foreground italic">
          Verificare dependențe indisponibilă (mock data)
        </p>
      </div>
    </AdminModal>
  );
}
