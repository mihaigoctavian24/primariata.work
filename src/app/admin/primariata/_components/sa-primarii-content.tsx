"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Plus,
  Globe,
  Activity,
  Users,
  FileText,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Table2,
  ArrowUpDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import { Primarie, PrimarieTier, PrimarieStatus, statusConfig } from "./primarii-shared";
import type { PrimarieRow } from "@/actions/super-admin-stats";
import { Pagination } from "./pagination";
import { PrimariiGrid } from "./primarii-grid";
import { PrimariiTable } from "./primarii-table";
import { PrimarieDetailDrawer } from "./primarie-detail-drawer";
import { DonutChart } from "../../../../components/admin/DonutChart";
import { GlassTooltip } from "./glass-tooltip";

// ─── Mock Data ───────────────────────────────────────

const mockPrimarii: Primarie[] = [
  {
    id: "p1",
    name: "Primăria Sector 1",
    judet: "București",
    localitate: "Sector 1 B",
    status: "active",
    tier: "Premium",
    adminName: "Elena Dumitrescu",
    adminEmail: "elena.d@primaria-s1.ro",
    usersCount: 342,
    cereriMonth: 284,
    cereriTotal: 3420,
    revenue: 2500,
    createdAt: "15 Ian 2025",
    lastActivity: "acum 5 min",
    features: ["AI Analysis", "Gamification", "Advanced Analytics"],
    uptime: 99.97,
    satisfactionScore: 4.8,
    avgResponseTime: "1.2h",
    cereriTrend: [210, 230, 245, 260, 270, 284],
  },
  {
    id: "p2",
    name: "Primăria Cluj-Napoca",
    judet: "Cluj",
    localitate: "Cluj-Napoca",
    status: "active",
    tier: "Premium",
    adminName: "Andrei Pop",
    adminEmail: "admin@primaria-cj.ro",
    usersCount: 287,
    cereriMonth: 231,
    cereriTotal: 2870,
    revenue: 2500,
    createdAt: "20 Feb 2025",
    lastActivity: "acum 12 min",
    features: ["AI Analysis", "Advanced Analytics"],
    uptime: 99.94,
    satisfactionScore: 4.6,
    avgResponseTime: "1.5h",
    cereriTrend: [180, 195, 210, 218, 225, 231],
  },
  {
    id: "p3",
    name: "Primăria Timișoara",
    judet: "Timiș",
    localitate: "Timișoara",
    status: "active",
    tier: "Standard",
    adminName: "Maria Lazăr",
    adminEmail: "admin@primaria-tm.ro",
    usersCount: 198,
    cereriMonth: 176,
    cereriTotal: 2340,
    revenue: 1500,
    createdAt: "1 Mar 2025",
    lastActivity: "acum 30 min",
    features: ["AI Analysis"],
    uptime: 99.89,
    satisfactionScore: 4.3,
    avgResponseTime: "2.1h",
    cereriTrend: [140, 148, 155, 162, 170, 176],
  },
  {
    id: "p4",
    name: "Primăria Iași",
    judet: "Iași",
    localitate: "Iași",
    status: "active",
    tier: "Premium",
    adminName: "Vlad Ungureanu",
    adminEmail: "admin@primaria-is.ro",
    usersCount: 165,
    cereriMonth: 142,
    cereriTotal: 1980,
    revenue: 2500,
    createdAt: "10 Mar 2025",
    lastActivity: "acum 1h",
    features: ["AI Analysis", "Gamification"],
    uptime: 99.91,
    satisfactionScore: 4.5,
    avgResponseTime: "1.8h",
    cereriTrend: [110, 118, 125, 130, 136, 142],
  },
  {
    id: "p5",
    name: "Primăria Constanța",
    judet: "Constanța",
    localitate: "Constanța",
    status: "active",
    tier: "Standard",
    adminName: "Ana Marinescu",
    adminEmail: "admin@primaria-ct.ro",
    usersCount: 143,
    cereriMonth: 118,
    cereriTotal: 1650,
    revenue: 1500,
    createdAt: "15 Apr 2025",
    lastActivity: "acum 2h",
    features: [],
    uptime: 99.82,
    satisfactionScore: 4.1,
    avgResponseTime: "2.8h",
    cereriTrend: [90, 95, 100, 108, 112, 118],
  },
  {
    id: "p6",
    name: "Primăria Brașov",
    judet: "Brașov",
    localitate: "Brașov",
    status: "active",
    tier: "Standard",
    adminName: "George Radu",
    adminEmail: "admin@primaria-bv.ro",
    usersCount: 128,
    cereriMonth: 105,
    cereriTotal: 1420,
    revenue: 1500,
    createdAt: "20 Mai 2025",
    lastActivity: "acum 3h",
    features: ["AI Analysis"],
    uptime: 99.85,
    satisfactionScore: 4.2,
    avgResponseTime: "2.4h",
    cereriTrend: [82, 86, 90, 95, 100, 105],
  },
  {
    id: "p7",
    name: "Primăria Oradea",
    judet: "Bihor",
    localitate: "Oradea",
    status: "active",
    tier: "Standard",
    adminName: "Ioana Moldovan",
    adminEmail: "admin@primaria-or.ro",
    usersCount: 96,
    cereriMonth: 87,
    cereriTotal: 1180,
    revenue: 1500,
    createdAt: "1 Iun 2025",
    lastActivity: "acum 5h",
    features: [],
    uptime: 99.78,
    satisfactionScore: 4.0,
    avgResponseTime: "3.1h",
    cereriTrend: [65, 70, 74, 78, 82, 87],
  },
  {
    id: "p8",
    name: "Primăria Craiova",
    judet: "Dolj",
    localitate: "Craiova",
    status: "active",
    tier: "Basic",
    adminName: "Dan Popescu",
    adminEmail: "admin@primaria-dj.ro",
    usersCount: 72,
    cereriMonth: 64,
    cereriTotal: 980,
    revenue: 500,
    createdAt: "10 Iul 2025",
    lastActivity: "acum 8h",
    features: [],
    uptime: 99.65,
    satisfactionScore: 3.8,
    avgResponseTime: "4.2h",
    cereriTrend: [48, 52, 55, 58, 61, 64],
  },
  {
    id: "p9",
    name: "Primăria Sibiu",
    judet: "Sibiu",
    localitate: "Sibiu",
    status: "active",
    tier: "Premium",
    adminName: "Laura Toma",
    adminEmail: "admin@primaria-sb.ro",
    usersCount: 54,
    cereriMonth: 41,
    cereriTotal: 120,
    revenue: 2500,
    createdAt: "4 Mar 2026",
    lastActivity: "acum 2h",
    features: ["AI Analysis", "Gamification", "Advanced Analytics"],
    uptime: 99.99,
    satisfactionScore: 4.9,
    avgResponseTime: "0.8h",
    cereriTrend: [0, 5, 12, 22, 32, 41],
  },
  {
    id: "p10",
    name: "Primăria Ploiești",
    judet: "Prahova",
    localitate: "Ploiești",
    status: "active",
    tier: "Basic",
    adminName: "Ion Stanciu",
    adminEmail: "admin@primaria-ph.ro",
    usersCount: 45,
    cereriMonth: 38,
    cereriTotal: 340,
    revenue: 500,
    createdAt: "15 Dec 2025",
    lastActivity: "acum 12h",
    features: [],
    uptime: 99.72,
    satisfactionScore: 3.6,
    avgResponseTime: "5.1h",
    cereriTrend: [20, 24, 28, 31, 35, 38],
  },
  {
    id: "p11",
    name: "Primăria Focșani",
    judet: "Vrancea",
    localitate: "Focșani",
    status: "inactive",
    adminName: "Vasile Ionescu",
    adminEmail: "admin@primaria-vn.ro",
    tier: "Basic",
    usersCount: 34,
    cereriMonth: 0,
    cereriTotal: 87,
    revenue: 0,
    createdAt: "20 Aug 2025",
    lastActivity: "acum 45 zile",
    features: [],
    uptime: 0,
    satisfactionScore: 2.1,
    avgResponseTime: "—",
    cereriTrend: [12, 10, 8, 4, 1, 0],
  },
  {
    id: "p12",
    name: "Primăria Buzău",
    judet: "Buzău",
    localitate: "Buzău",
    status: "suspended",
    adminName: "Mihai Popa",
    adminEmail: "admin@primaria-bz.ro",
    tier: "Basic",
    usersCount: 28,
    cereriMonth: 0,
    cereriTotal: 56,
    revenue: 0,
    createdAt: "1 Sep 2025",
    lastActivity: "acum 30 zile",
    features: [],
    uptime: 0,
    satisfactionScore: 1.9,
    avgResponseTime: "—",
    cereriTrend: [8, 6, 5, 3, 1, 0],
  },
];

const tiers: (PrimarieTier | "Toate")[] = ["Toate", "Premium", "Standard", "Basic"];
const statuses: (PrimarieStatus | "Toate")[] = ["Toate", "active", "inactive", "suspended"];

const revenueTrend = [
  { month: "Oct", mrr: 11200 },
  { month: "Nov", mrr: 12100 },
  { month: "Dec", mrr: 11800 },
  { month: "Ian", mrr: 13400 },
  { month: "Feb", mrr: 13900 },
  { month: "Mar", mrr: 14500 },
];

// ─── PrimarieRow → Primarie mapping ─────────────────

function primarieRowToPrimarie(row: PrimarieRow): Primarie {
  return {
    id: row.id,
    name: row.name,
    judet: row.judet,
    localitate: row.localitate,
    status: (row.status as PrimarieStatus) ?? "inactive",
    tier: (row.tier as PrimarieTier) ?? "Basic",
    adminName: row.adminName ?? "",
    adminEmail: row.adminEmail ?? "",
    usersCount: row.usersCount,
    cereriMonth: row.cereriMonth,
    cereriTotal: row.cereriTotal,
    revenue: row.revenue,
    createdAt: row.createdAt,
    lastActivity: "-",
    features: [],
    uptime: row.uptime ?? 0,
    satisfactionScore: row.satisfactionScore ?? 0,
    avgResponseTime: row.avgResponseTime ?? "-",
    cereriTrend: [],
  };
}

// ─── Main Content Wrapper ───────────────────────────

interface SaPrimariiContentProps {
  initialData: { success: boolean; data?: PrimarieRow[]; error?: string };
}

export function SaPrimariiContent({ initialData }: SaPrimariiContentProps) {
  const [search, setSearch] = useState("");
  const [filterJudet, setFilterJudet] = useState("Toate județele");
  const [filterTier, setFilterTier] = useState<PrimarieTier | "Toate">("Toate");
  const [filterStatus, setFilterStatus] = useState<PrimarieStatus | "Toate">("Toate");
  const [sortBy, setSortBy] = useState<
    "cereri" | "users" | "revenue" | "name" | "uptime" | "satisfaction"
  >("cereri");
  const [selectedPrimarie, setSelectedPrimarie] = useState<Primarie | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "table">("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "overview" ? 6 : 8;

  const allPrimarii = useMemo<Primarie[]>(() => {
    if (initialData.data && initialData.data.length > 0) {
      return initialData.data.map(primarieRowToPrimarie);
    }
    return mockPrimarii;
  }, [initialData.data]);

  const judete = useMemo(
    () => ["Toate județele", ...Array.from(new Set(allPrimarii.map((p) => p.judet)))],
    [allPrimarii]
  );

  const filtered = useMemo(() => {
    let result = [...allPrimarii];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.judet.toLowerCase().includes(q) ||
          p.localitate.toLowerCase().includes(q)
      );
    }
    if (filterJudet !== "Toate județele") result = result.filter((p) => p.judet === filterJudet);
    if (filterTier !== "Toate") result = result.filter((p) => p.tier === filterTier);
    if (filterStatus !== "Toate") result = result.filter((p) => p.status === filterStatus);

    result.sort((a, b) => {
      if (sortBy === "cereri") return b.cereriMonth - a.cereriMonth;
      if (sortBy === "users") return b.usersCount - a.usersCount;
      if (sortBy === "revenue") return b.revenue - a.revenue;
      if (sortBy === "uptime") return b.uptime - a.uptime;
      if (sortBy === "satisfaction") return b.satisfactionScore - a.satisfactionScore;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [allPrimarii, search, filterJudet, filterTier, filterStatus, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJudet, filterTier, filterStatus, viewMode]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─── Computed metrics
  const totalRevenue = allPrimarii.reduce((sum, p) => sum + p.revenue, 0);
  const totalUsers = allPrimarii.reduce((sum, p) => sum + p.usersCount, 0);
  const totalCereri = allPrimarii.reduce((s, p) => s + p.cereriMonth, 0);
  const activeCount = allPrimarii.filter((p) => p.status === "active").length;
  const avgUptime =
    activeCount > 0
      ? (
          allPrimarii.filter((p) => p.status === "active").reduce((s, p) => s + p.uptime, 0) /
          activeCount
        ).toFixed(2)
      : "0.00";
  const avgSatisfaction =
    activeCount > 0
      ? (
          allPrimarii
            .filter((p) => p.status === "active")
            .reduce((s, p) => s + p.satisfactionScore, 0) / activeCount
        ).toFixed(1)
      : "0.0";
  const premiumCount = allPrimarii.filter((p) => p.tier === "Premium").length;
  const standardCount = allPrimarii.filter((p) => p.tier === "Standard").length;
  const basicCount = allPrimarii.filter((p) => p.tier === "Basic").length;

  const cereriBarData = [...allPrimarii]
    .filter((p) => p.status === "active")
    .sort((a, b) => b.cereriMonth - a.cereriMonth)
    .map((p) => ({
      name: p.localitate.length > 10 ? p.localitate.slice(0, 10) + "…" : p.localitate,
      cereri: p.cereriMonth,
      fullName: p.name,
    }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <h1
              className="flex items-center gap-2.5 text-white"
              style={{ fontSize: "1.6rem", fontWeight: 700 }}
            >
              <Building2 className="h-6 w-6 text-emerald-400" /> Management Primării
            </h1>
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.08))",
                border: "1px solid rgba(16,185,129,0.12)",
              }}
            >
              <Globe className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400" style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                {allPrimarii.length} primării
              </span>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-gray-600"
            style={{ fontSize: "0.83rem" }}
          >
            Monitorizare & control — {activeCount} active · MRR: {totalRevenue.toLocaleString()} RON
            · Uptime mediu: {avgUptime}%
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {(
              [
                { key: "overview", icon: LayoutGrid, label: "Overview" },
                { key: "table", icon: Table2, label: "Tabel" },
              ] as const
            ).map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all ${viewMode === v.key ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {viewMode === v.key && (
                  <motion.div
                    layoutId="primariiViewToggle"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.06))",
                      border: "1px solid rgba(16,185,129,0.12)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <v.icon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10" style={{ fontSize: "0.78rem" }}>
                  {v.label}
                </span>
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toast("Funcționalitate de creare primărie")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            <Plus className="h-4 w-4" /> Onboarding Nouă
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-6 gap-4">
        {[
          {
            label: "Primării Active",
            value: `${activeCount}/${allPrimarii.length}`,
            icon: Building2,
            color: "#10b981",
            bg: "rgba(16,185,129,0.08)",
            sub: `${allPrimarii.filter((p) => p.status === "inactive").length} inactive · ${allPrimarii.filter((p) => p.status === "suspended").length} suspendate`,
          },
          {
            label: "Utilizatori Totali",
            value: totalUsers.toLocaleString(),
            icon: Users,
            color: "#06b6d4",
            bg: "rgba(6,182,212,0.08)",
            sub: `~${Math.round(totalUsers / activeCount)} per primărie activă`,
            trend: "+340",
            trendUp: true,
          },
          {
            label: "MRR Total",
            value: `${(totalRevenue / 1000).toFixed(1)}k RON`,
            icon: DollarSign,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.08)",
            sub: `Premium: ${premiumCount} · Standard: ${standardCount} · Basic: ${basicCount}`,
            trend: "+8.2%",
            trendUp: true,
          },
          {
            label: "Cereri / Lună",
            value: totalCereri.toLocaleString(),
            icon: FileText,
            color: "#8b5cf6",
            bg: "rgba(139,92,246,0.08)",
            sub: `~${Math.round(totalCereri / activeCount)} per primărie activă`,
            trend: "+12%",
            trendUp: true,
          },
          {
            label: "Uptime Mediu",
            value: `${avgUptime}%`,
            icon: Activity,
            color: parseFloat(avgUptime) >= 99.8 ? "#10b981" : "#f59e0b",
            bg: parseFloat(avgUptime) >= 99.8 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
            sub: "SLA target: 99.9%",
          },
          {
            label: "Satisfacție Medie",
            value: `${avgSatisfaction}★`,
            icon: Star,
            color: "#ec4899",
            bg: "rgba(236,72,153,0.08)",
            sub: `Top: ${allPrimarii.length > 0 ? allPrimarii.reduce((best, p) => (p.satisfactionScore > best.satisfactionScore ? p : best)).localitate : "-"}`,
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group cursor-default rounded-2xl p-4 transition-transform hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: kpi.bg, border: `1px solid ${kpi.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                {kpi.trend && (
                  <div
                    className="flex items-center gap-0.5"
                    style={{ color: kpi.trendUp ? "#10b981" : "#ef4444" }}
                  >
                    {kpi.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span style={{ fontSize: "0.68rem", fontWeight: 600 }}>{kpi.trend}</span>
                  </div>
                )}
              </div>
              <div
                className="text-white"
                style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}
              >
                {kpi.value}
              </div>
              <div className="mt-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
                {kpi.label}
              </div>
              <div className="mt-0.5 text-gray-600" style={{ fontSize: "0.62rem" }}>
                {kpi.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5 grid grid-cols-12 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="col-span-3 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="mb-1 text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  Distribuție Tier
                </h3>
                <p className="mb-3 text-gray-600" style={{ fontSize: "0.68rem" }}>
                  Per nivel de abonament
                </p>
                <div className="flex justify-center">
                  <DonutChart
                    data={[
                      { label: "Premium", value: premiumCount, color: "#8b5cf6" },
                      { label: "Standard", value: standardCount, color: "#06b6d4" },
                      { label: "Basic", value: basicCount, color: "#6b7280" },
                    ]}
                    size={140}
                  />
                </div>
                <div className="mt-3 flex justify-center gap-4">
                  {[
                    { label: "Premium", count: premiumCount, color: "#8b5cf6" },
                    { label: "Standard", count: standardCount, color: "#06b6d4" },
                    { label: "Basic", count: basicCount, color: "#6b7280" },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-sm" style={{ background: t.color }} />
                      <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>
                        {t.label} ({t.count})
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="col-span-5 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="mb-1 text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  Cereri / Lună — per Primărie
                </h3>
                <p className="mb-3 text-gray-600" style={{ fontSize: "0.68rem" }}>
                  Doar primării active, sortare descrescătoare
                </p>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={cereriBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<GlassTooltip />}
                      cursor={{ fill: "rgba(16,185,129,0.06)" }}
                    />
                    <Bar
                      dataKey="cereri"
                      name="Cereri/lună"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="col-span-4 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="mb-1 text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  MRR Trend — 6 luni
                </h3>
                <p className="mb-3 text-gray-600" style={{ fontSize: "0.68rem" }}>
                  Evoluție venituri recurente lunare
                </p>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<GlassTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="mrr"
                      name="MRR (RON)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#f59e0b", stroke: "#f59e0b" }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  Monitorizare Primării
                </h2>
                <span className="text-gray-600" style={{ fontSize: "0.75rem" }}>
                  {filtered.length} rezultate
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Caută..."
                    className="w-44 rounded-lg py-2 pr-3 pl-8 text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.78rem",
                    }}
                  />
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value as PrimarieTier | "Toate")}
                  className="cursor-pointer appearance-none rounded-lg px-2.5 py-2 text-gray-300 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.78rem",
                  }}
                >
                  {tiers.map((t) => (
                    <option key={t} value={t} className="bg-[#1a1a2e]">
                      {t === "Toate" ? "Toate tier" : t}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as PrimarieStatus | "Toate")}
                  className="cursor-pointer appearance-none rounded-lg px-2.5 py-2 text-gray-300 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.78rem",
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="bg-[#1a1a2e]">
                      {s === "Toate" ? "Toate status" : statusConfig[s].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PrimariiGrid items={paginatedItems} onSelect={setSelectedPrimarie} />

            {filtered.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Caută primărie, județ, localitate..."
                  className="w-full rounded-xl py-2.5 pr-4 pl-10 text-white placeholder-gray-600 transition-all outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>
              <select
                value={filterJudet}
                onChange={(e) => setFilterJudet(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl px-3 py-2.5 text-gray-300 outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "0.82rem",
                  minWidth: 160,
                }}
              >
                {judete.map((j) => (
                  <option key={j} value={j} className="bg-[#1a1a2e]">
                    {j}
                  </option>
                ))}
              </select>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as PrimarieTier | "Toate")}
                className="cursor-pointer appearance-none rounded-xl px-3 py-2.5 text-gray-300 outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "0.82rem",
                  minWidth: 130,
                }}
              >
                {tiers.map((t) => (
                  <option key={t} value={t} className="bg-[#1a1a2e]">
                    {t === "Toate" ? "Toate tier-urile" : t}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as PrimarieStatus | "Toate")}
                className="cursor-pointer appearance-none rounded-xl px-3 py-2.5 text-gray-300 outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "0.82rem",
                  minWidth: 130,
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-[#1a1a2e]">
                    {s === "Toate" ? "Toate statusurile" : statusConfig[s].label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const order: (typeof sortBy)[] = [
                    "cereri",
                    "users",
                    "revenue",
                    "uptime",
                    "satisfaction",
                    "name",
                  ];
                  const nextSort = order[(order.indexOf(sortBy) + 1) % order.length];
                  if (nextSort) setSortBy(nextSort);
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2.5 text-gray-400 transition-all hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "0.82rem",
                }}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortBy === "cereri"
                  ? "Cereri"
                  : sortBy === "users"
                    ? "Users"
                    : sortBy === "revenue"
                      ? "Revenue"
                      : sortBy === "uptime"
                        ? "Uptime"
                        : sortBy === "satisfaction"
                          ? "Satisf."
                          : "Nume"}
              </button>
            </div>

            <PrimariiTable items={paginatedItems} onSelect={setSelectedPrimarie} />

            {filtered.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PrimarieDetailDrawer
        selectedPrimarie={selectedPrimarie}
        onClose={() => setSelectedPrimarie(null)}
      />
    </div>
  );
}
