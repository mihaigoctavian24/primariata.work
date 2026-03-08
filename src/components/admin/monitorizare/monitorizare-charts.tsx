"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Clock, AlertTriangle, BarChart as ChartBar, Server } from "lucide-react";

// ============================================================================
// Mock Data (Static from Phase 19/20 Figma Reference)
// ============================================================================

const uptimeData = [
  { time: "00:00", value: 99.99 },
  { time: "02:00", value: 99.99 },
  { time: "04:00", value: 99.98 },
  { time: "06:00", value: 99.99 },
  { time: "08:00", value: 99.95 },   // Dip
  { time: "10:00", value: 99.99 },
  { time: "12:00", value: 99.98 },
  { time: "14:00", value: 99.99 },
  { time: "16:00", value: 100.0 },
  { time: "18:00", value: 100.0 },
  { time: "20:00", value: 99.99 },
  { time: "22:00", value: 99.99 },
];

const responseTimeData = [
  { time: "00:00", api: 120, db: 45, cache: 12 },
  { time: "02:00", api: 115, db: 42, cache: 11 },
  { time: "04:00", api: 118, db: 48, cache: 13 },
  { time: "06:00", api: 125, db: 55, cache: 15 },
  { time: "08:00", api: 180, db: 85, cache: 22 },   // Peak
  { time: "10:00", api: 150, db: 65, cache: 18 },
  { time: "12:00", api: 145, db: 60, cache: 15 },
  { time: "14:00", api: 160, db: 70, cache: 18 },
  { time: "16:00", api: 135, db: 50, cache: 14 },
  { time: "18:00", api: 130, db: 48, cache: 13 },
  { time: "20:00", api: 125, db: 45, cache: 12 },
  { time: "22:00", api: 122, db: 44, cache: 12 },
];

const errorRateData = [
  { time: "00:00", "4xx": 12, "5xx": 2 },
  { time: "02:00", "4xx": 8,  "5xx": 1 },
  { time: "04:00", "4xx": 15, "5xx": 0 },
  { time: "06:00", "4xx": 25, "5xx": 5 },
  { time: "08:00", "4xx": 85, "5xx": 42 },   // Peak
  { time: "10:00", "4xx": 55, "5xx": 15 },
  { time: "12:00", "4xx": 40, "5xx": 8 },
  { time: "14:00", "4xx": 45, "5xx": 12 },
  { time: "16:00", "4xx": 30, "5xx": 5 },
  { time: "18:00", "4xx": 20, "5xx": 3 },
  { time: "20:00", "4xx": 15, "5xx": 2 },
  { time: "22:00", "4xx": 10, "5xx": 1 },
];

const requestsPerHour = [
  { hour: "00:00", count: 1200 },
  { hour: "02:00", count: 850 },
  { hour: "04:00", count: 600 },
  { hour: "06:00", count: 2400 },
  { hour: "08:00", count: 8500 },
  { hour: "10:00", count: 12400 },
  { hour: "12:00", count: 11200 },
  { hour: "14:00", count: 14500 },
  { hour: "16:00", count: 10800 },
  { hour: "18:00", count: 8200 },
  { hour: "20:00", count: 5400 },
  { hour: "22:00", count: 3200 },
];

// ============================================================================
// Tooltip Component
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const CustomTooltip = ({ active, payload, label, valuePrefix = "", valueSuffix = "" }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--popover)] border border-white/[0.08] p-3 rounded-lg shadow-xl backdrop-blur-xl">
        <p className="text-muted-foreground text-xs mb-2 font-medium">{label}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-muted-foreground capitalize">
                {entry.name || entry.dataKey}:
              </span>
              <span className="font-semibold text-foreground">
                {valuePrefix}{entry.value}{valueSuffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Component Export
// ============================================================================

export function MonitorizareCharts() {
  // Chart standard styling configuration
  const chartProps = useMemo(() => ({
    margin: { top: 10, right: 10, left: -20, bottom: 0 },
    height: 200,
  }), []);

  const gridProps = {
    strokeDasharray: "3 3",
    vertical: false,
    stroke: "rgba(255,255,255,0.05)"
  };

  const axisProps = {
    stroke: "#6b7280",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
      
      {/* 1. Uptime Chart */}
      <div className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              SLA & Uptime (30 zile)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Disponibilitatea sistemului principal</p>
          </div>
          <span className="text-emerald-400 font-mono font-bold">99.98%</span>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={uptimeData} {...chartProps}>
              <defs>
                <linearGradient id="mon20_uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} dy={10} />
              <YAxis domain={['dataMin - 0.05', 'dataMax + 0.01']} {...axisProps} tickFormatter={(val) => `${val}%`} />
              <Tooltip content={<CustomTooltip valueSuffix="%" />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Uptime"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#mon20_uptimeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Response Time Chart */}
      <div className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Timp de răspuns
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Latența medie per subsistem</p>
          </div>
          <span className="text-sky-400 font-mono font-bold">~145ms</span>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseTimeData} {...chartProps}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} dy={10} />
              <YAxis {...axisProps} tickFormatter={(val) => `${val}ms`} />
              <Tooltip content={<CustomTooltip valueSuffix="ms" />} />
              <Line type="monotone" dataKey="api" name="API Gateway" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="db" name="Bază de date" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cache" name="Cache (Redis)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Error Rate Chart */}
      <div className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Rată de Erori (HTTP)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Erori 4xx Client vs 5xx Server</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> 4xx</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> 5xx</span>
          </div>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorRateData} {...chartProps}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} dy={10} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="4xx" name="Client (4xx)" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="5xx" name="Server (5xx)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Requests Volume Chart */}
      <div className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <ChartBar className="w-4 h-4 text-violet-400" />
              Volum Cereri (req/h)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Trafic agregat ultimele 24h</p>
          </div>
          <span className="text-violet-400 font-mono font-bold">14.5k<span className="text-xs text-muted-foreground ml-1">vârf</span></span>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestsPerHour} {...chartProps}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="hour" {...axisProps} dy={10} />
              <YAxis {...axisProps} tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Cereri" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
