"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Building2,
  Users,
  FileText,
  DollarSign,
  Activity,
  AlertTriangle,
  XCircle,
  Shield,
} from "lucide-react";
import { DashboardKPIs } from "./dashboard-kpis";
import { PlatformStatsCharts, UserGrowthChart } from "./platform-stats-charts";
import { PrimariiStatusList, PrimarieStatus } from "./primarii-status-list";
import { RecentActivityList, ActivityItem } from "./recent-activity-list";

// ─── Inline Mock Data ────────────────────────────────

const platformStats = {
  totalPrimarii: 12,
  activePrimarii: 10,
  inactivePrimarii: 2,
  totalUsers: 3847,
  totalCereri: 18432,
  cereriThisMonth: 1247,
  mrr: 14500,
  systemAlerts: 3,
};

const cereriTrend = [
  { month: "Oct", cereri: 980 },
  { month: "Nov", cereri: 1120 },
  { month: "Dec", cereri: 870 },
  { month: "Ian", cereri: 1340 },
  { month: "Feb", cereri: 1190 },
  { month: "Mar", cereri: 1247 },
];

const topPrimarii = [
  { name: "Sector 1 B", cereri: 3420, color: "#10b981" },
  { name: "Cluj-Napoca", cereri: 2870, color: "#06b6d4" },
  { name: "Timișoara", cereri: 2340, color: "#8b5cf6" },
  { name: "Iași", cereri: 1980, color: "#3b82f6" },
  { name: "Constanța", cereri: 1650, color: "#f59e0b" },
  { name: "Brașov", cereri: 1420, color: "#ec4899" },
  { name: "Oradea", cereri: 1180, color: "#14b8a6" },
  { name: "Craiova", cereri: 980, color: "#f97316" },
];

const userGrowth = [
  { month: "Oct", users: 180 },
  { month: "Nov", users: 220 },
  { month: "Dec", users: 150 },
  { month: "Ian", users: 310 },
  { month: "Feb", users: 280 },
  { month: "Mar", users: 340 },
];

const revenueData = [
  { month: "Oct", revenue: 11200 },
  { month: "Nov", revenue: 12100 },
  { month: "Dec", revenue: 11800 },
  { month: "Ian", revenue: 13400 },
  { month: "Feb", revenue: 13900 },
  { month: "Mar", revenue: 14500 },
];

const recentActivity: ActivityItem[] = [
  {
    id: "ra1",
    action: "Primărie nouă onboarded",
    detail: "Primăria Sibiu — Tier Premium",
    time: "acum 2h",
    color: "#10b981",
    icon: Building2,
  },
  {
    id: "ra2",
    action: "Admin invitat",
    detail: "admin.sibiu@primariata.work",
    time: "acum 2h",
    color: "#06b6d4",
    icon: Users,
  },
  {
    id: "ra3",
    action: "Alertă critică rezolvată",
    detail: "DB Primary — latență normalizată",
    time: "acum 4h",
    color: "#f59e0b",
    icon: AlertTriangle,
  },
  {
    id: "ra4",
    action: "Feature flag activat",
    detail: "AI Analysis — Cluj-Napoca",
    time: "acum 6h",
    color: "#8b5cf6",
    icon: Zap,
  },
  {
    id: "ra5",
    action: "Primărie dezactivată",
    detail: "Primăria Focșani — neplată",
    time: "acum 8h",
    color: "#ef4444",
    icon: XCircle,
  },
  {
    id: "ra6",
    action: "Backup platform completat",
    detail: "342 GB — toate primăriile",
    time: "acum 12h",
    color: "#6b7280",
    icon: Shield,
  },
];

const primariiStatusData: PrimarieStatus[] = [
  { name: "Sector 1 B, București", status: "active", users: 342, cereri: 284, tier: "Premium" },
  { name: "Cluj-Napoca, Cluj", status: "active", users: 287, cereri: 231, tier: "Premium" },
  { name: "Timișoara, Timiș", status: "active", users: 198, cereri: 176, tier: "Standard" },
  { name: "Iași, Iași", status: "active", users: 165, cereri: 142, tier: "Premium" },
  { name: "Focșani, Vrancea", status: "inactive", users: 34, cereri: 0, tier: "Basic" },
];

// ─── Component ───────────────────────────────────────

export function SaDashboardContent(): React.ReactElement {
  const [liveRequests, setLiveRequests] = useState(847);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRequests((prev) =>
        Math.max(600, Math.min(1200, prev + Math.floor((Math.random() - 0.48) * 40)))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      label: "Primării Active",
      value: platformStats.activePrimarii,
      total: platformStats.totalPrimarii,
      suffix: `/${platformStats.totalPrimarii}`,
      trend: "+2",
      trendUp: true,
      icon: Building2,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
    },
    {
      label: "Utilizatori Totali",
      value: platformStats.totalUsers,
      trend: "+340",
      trendUp: true,
      icon: Users,
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.08)",
    },
    {
      label: "Cereri Totale",
      value: platformStats.totalCereri,
      subtitle: `${platformStats.cereriThisMonth} luna aceasta`,
      trend: "+12%",
      trendUp: true,
      icon: FileText,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.08)",
    },
    {
      label: "MRR",
      value: platformStats.mrr,
      prefix: "",
      suffix: " RON",
      trend: "+8.2%",
      trendUp: true,
      icon: DollarSign,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      label: "Cereri/min Live",
      value: liveRequests,
      trend: "real-time",
      trendUp: true,
      icon: Activity,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.08)",
    },
    {
      label: "Alerte Sistem",
      value: platformStats.systemAlerts,
      trend: "-2",
      trendUp: false,
      icon: AlertTriangle,
      color: platformStats.systemAlerts > 0 ? "#ef4444" : "#10b981",
      bg: platformStats.systemAlerts > 0 ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <h1 className="text-[1.6rem] font-bold text-white">Platform Overview</h1>
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 px-2.5 py-1">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span className="text-[0.68rem] font-semibold text-emerald-400">Super Admin</span>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-[0.83rem] text-gray-400"
          >
            Platforma primariaTa — vizualizare globală ·{" "}
            {new Date().toLocaleDateString("ro-RO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>
        </div>
      </div>

      <DashboardKPIs kpis={kpis} />

      {/* Top 3 Charts Row */}
      <PlatformStatsCharts
        cereriTrend={cereriTrend}
        topPrimarii={topPrimarii}
        revenueData={revenueData}
      />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        <UserGrowthChart userGrowth={userGrowth} />
        <PrimariiStatusList primarii={primariiStatusData} />
        <RecentActivityList activities={recentActivity} />
      </div>
    </div>
  );
}
