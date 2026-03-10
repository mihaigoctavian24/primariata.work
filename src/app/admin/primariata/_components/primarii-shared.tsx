"use client";

import { Wifi, WifiOff, CheckCircle2, Clock, XCircle } from "lucide-react";

export type PrimarieTier = "Premium" | "Standard" | "Basic";
export type PrimarieStatus = "active" | "inactive" | "suspended";

export interface Primarie {
  id: string;
  name: string;
  judet: string;
  localitate: string;
  status: PrimarieStatus;
  tier: PrimarieTier;
  adminName: string;
  adminEmail: string;
  usersCount: number;
  cereriMonth: number;
  cereriTotal: number;
  revenue: number;
  createdAt: string;
  lastActivity: string;
  features: string[];
  uptime: number;
  satisfactionScore: number;
  avgResponseTime: string;
  cereriTrend: number[];
}

export const statusConfig: Record<
  PrimarieStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  active: { label: "Activă", color: "#10b981", bg: "rgba(16,185,129,0.08)", icon: CheckCircle2 },
  inactive: { label: "Inactivă", color: "#6b7280", bg: "rgba(107,114,128,0.08)", icon: Clock },
  suspended: { label: "Suspendată", color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: XCircle },
};

export const tierConfig: Record<PrimarieTier, { color: string; bg: string; border: string }> = {
  Premium: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.15)" },
  Standard: { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.15)" },
  Basic: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.15)" },
};

export function Sparkline({
  data,
  color,
  width = 64,
  height = 24,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const lastStr = points.split(" ").pop();
  const lastParts = lastStr ? lastStr.split(",") : ["0", "0"];
  const cx = parseFloat(lastParts[0] || "0");
  const cy = parseFloat(lastParts[1] || "0");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      <circle cx={cx} cy={cy} r={2} fill={color} />
    </svg>
  );
}

export function HealthBadge({ uptime, status }: { uptime: number; status: PrimarieStatus }) {
  if (status !== "active")
    return (
      <span
        className="flex items-center gap-1 rounded-full px-2 py-0.5"
        style={{ background: "rgba(107,114,128,0.1)", fontSize: "0.65rem", color: "#6b7280" }}
      >
        <WifiOff className="h-2.5 w-2.5" /> Offline
      </span>
    );
  const color = uptime >= 99.9 ? "#10b981" : uptime >= 99.5 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{
        background: `${color}12`,
        fontSize: "0.65rem",
        color,
        border: `1px solid ${color}15`,
      }}
    >
      <Wifi className="h-2.5 w-2.5" /> {uptime}%
    </span>
  );
}
