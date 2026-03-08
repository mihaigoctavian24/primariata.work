"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

// ─── Mock Chart Data ─────────────────────────────────────────────────────────

const uptimeData = [
  { time: "00:00", value: 100 },
  { time: "02:00", value: 100 },
  { time: "04:00", value: 99.9 },
  { time: "06:00", value: 100 },
  { time: "08:00", value: 100 },
  { time: "10:00", value: 99.8 },
  { time: "12:00", value: 100 },
  { time: "14:00", value: 100 },
  { time: "16:00", value: 100 },
  { time: "18:00", value: 99.9 },
  { time: "20:00", value: 100 },
  { time: "22:00", value: 100 },
];

const responseTimeData = [
  { time: "00:00", api: 120, db: 45, cache: 8 },
  { time: "04:00", api: 95, db: 38, cache: 5 },
  { time: "08:00", api: 180, db: 62, cache: 12 },
  { time: "12:00", api: 210, db: 78, cache: 15 },
  { time: "16:00", api: 165, db: 55, cache: 9 },
  { time: "20:00", api: 140, db: 48, cache: 7 },
  { time: "24:00", api: 110, db: 40, cache: 6 },
];

const errorRateData = [
  { time: "00:00", errors4xx: 3, errors5xx: 0 },
  { time: "04:00", errors4xx: 1, errors5xx: 0 },
  { time: "08:00", errors4xx: 12, errors5xx: 2 },
  { time: "12:00", errors4xx: 18, errors5xx: 1 },
  { time: "16:00", errors4xx: 8, errors5xx: 0 },
  { time: "20:00", errors4xx: 5, errors5xx: 1 },
  { time: "24:00", errors4xx: 2, errors5xx: 0 },
];

const requestsPerHourData = [
  { hour: "06", requests: 120 },
  { hour: "08", requests: 450 },
  { hour: "10", requests: 680 },
  { hour: "12", requests: 520 },
  { hour: "14", requests: 710 },
  { hour: "16", requests: 590 },
  { hour: "18", requests: 320 },
  { hour: "20", requests: 180 },
  { hour: "22", requests: 90 },
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5"
      style={{
        background: "var(--popover)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="mb-1.5 text-[0.75rem] font-semibold text-gray-300">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="mb-0.5 flex items-center gap-2 text-[0.78rem]">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MonitorizareCharts ──────────────────────────────────────────────────────

export function MonitorizareCharts(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Uptime AreaChart */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
        <h3 className="mb-3 text-[0.95rem] font-semibold text-white">Uptime — Ultimele 24h</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={uptimeData}>
            <defs>
              <linearGradient id="mon20UptimeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[99.5, 100.1]}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              name="Uptime"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#mon20UptimeGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Response Time LineChart */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
        <h3 className="mb-3 text-[0.95rem] font-semibold text-white">Timp Răspuns (ms)</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="api"
              name="API"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="db"
              name="Database"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cache"
              name="Cache"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Error Rate BarChart */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
        <h3 className="mb-3 text-[0.95rem] font-semibold text-white">Error Rate — 24h</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={errorRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="errors4xx"
              name="4xx Client"
              fill="#ef4444"
              radius={[3, 3, 0, 0]}
              barSize={12}
              stackId="errors"
            />
            <Bar
              dataKey="errors5xx"
              name="5xx Server"
              fill="#f59e0b"
              radius={[3, 3, 0, 0]}
              barSize={12}
              stackId="errors"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Requests/Hour BarChart */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
        <h3 className="mb-3 text-[0.95rem] font-semibold text-white">Cereri pe Oră</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={requestsPerHourData}>
            <defs>
              <linearGradient id="mon20ReqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="requests" name="Cereri" fill="url(#mon20ReqGrad)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
