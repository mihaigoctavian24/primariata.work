"use client";

import { CheckCircle2, Clock, XCircle, Gauge } from "lucide-react";

export type AdminStatus = "active" | "pending" | "suspended";

export interface PrimarieAdmin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  primarie: string;
  judet: string;
  status: AdminStatus;
  invitedAt: string;
  lastLogin: string;
  cereriSupervised: number;
  usersManaged: number;
  twoFA: boolean;
  actionsThisMonth: number;
  loginCount30d: number;
  avgResponseTime: string;
  satisfactionScore: number;
  ticketsResolved: number;
  activityTrend: number[];
  role: string;
  phone: string;
}

export const adminStatusConfig: Record<
  AdminStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  active: { label: "Activ", color: "#10b981", bg: "rgba(16,185,129,0.08)", icon: CheckCircle2 },
  pending: {
    label: "Invitație trimisă",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    icon: Clock,
  },
  suspended: { label: "Suspendat", color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: XCircle },
};

export function PerformanceBadge({ score }: { score: number }) {
  const config =
    score >= 4.5
      ? { label: "Excelent", color: "#10b981", bg: "rgba(16,185,129,0.08)" }
      : score >= 3.5
        ? { label: "Bun", color: "#06b6d4", bg: "rgba(6,182,212,0.08)" }
        : score >= 2.5
          ? { label: "Mediu", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" }
          : { label: "Slab", color: "#ef4444", bg: "rgba(239,68,68,0.08)" };
  return (
    <span
      className="flex items-center gap-1 rounded-full px-1.5 py-0.5"
      style={{
        background: config.bg,
        fontSize: "0.6rem",
        color: config.color,
        border: `1px solid ${config.color}15`,
      }}
    >
      <Gauge className="h-2.5 w-2.5" /> {config.label}
    </span>
  );
}
