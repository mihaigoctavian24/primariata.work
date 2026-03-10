"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UserCog,
  Search,
  Plus,
  CheckCircle2,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Table2,
  ArrowUpDown,
  FileText,
  ShieldCheck,
  Gauge,
  X,
  AlertTriangle,
} from "lucide-react";
import { inviteAdminToPrimarie } from "@/actions/super-admin-write";
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
import { DonutChart } from "../../../../components/admin/DonutChart";

import { PrimarieAdmin, AdminStatus, adminStatusConfig } from "./admins-shared";
import type { AdminRow } from "@/actions/super-admin-stats";
import { Pagination } from "./pagination";
import { AdminsGrid } from "./admins-grid";
import { AdminsTable } from "./admins-table";
import { AdminDetailDrawer } from "./admin-detail-drawer";
import { GlassTooltip } from "./glass-tooltip";

// ─── Mock Data ───────────────────────────────────────

const admins: PrimarieAdmin[] = [
  {
    id: "adm1",
    name: "Elena Dumitrescu",
    email: "elena.d@primaria-s1.ro",
    avatar: "ED",
    primarie: "Sector 1 B, București",
    judet: "București",
    status: "active",
    invitedAt: "15 Ian 2025",
    lastLogin: "acum 5 min",
    cereriSupervised: 284,
    usersManaged: 342,
    twoFA: true,
    actionsThisMonth: 145,
    loginCount30d: 62,
    avgResponseTime: "1.2h",
    satisfactionScore: 4.8,
    ticketsResolved: 267,
    activityTrend: [110, 118, 125, 132, 138, 145],
    role: "Admin Principal",
    phone: "+40 721 234 567",
  },
  {
    id: "adm2",
    name: "Andrei Pop",
    email: "admin@primaria-cj.ro",
    avatar: "AP",
    primarie: "Cluj-Napoca, Cluj",
    judet: "Cluj",
    status: "active",
    invitedAt: "20 Feb 2025",
    lastLogin: "acum 12 min",
    cereriSupervised: 231,
    usersManaged: 287,
    twoFA: true,
    actionsThisMonth: 128,
    loginCount30d: 58,
    avgResponseTime: "1.5h",
    satisfactionScore: 4.6,
    ticketsResolved: 218,
    activityTrend: [95, 102, 108, 115, 122, 128],
    role: "Admin Principal",
    phone: "+40 742 345 678",
  },
  {
    id: "adm3",
    name: "Maria Lazăr",
    email: "admin@primaria-tm.ro",
    avatar: "ML",
    primarie: "Timișoara, Timiș",
    judet: "Timiș",
    status: "active",
    invitedAt: "1 Mar 2025",
    lastLogin: "acum 30 min",
    cereriSupervised: 176,
    usersManaged: 198,
    twoFA: true,
    actionsThisMonth: 97,
    loginCount30d: 45,
    avgResponseTime: "2.1h",
    satisfactionScore: 4.3,
    ticketsResolved: 162,
    activityTrend: [72, 78, 82, 88, 92, 97],
    role: "Admin Principal",
    phone: "+40 733 456 789",
  },
  {
    id: "adm4",
    name: "Vlad Ungureanu",
    email: "admin@primaria-is.ro",
    avatar: "VU",
    primarie: "Iași, Iași",
    judet: "Iași",
    status: "active",
    invitedAt: "10 Mar 2025",
    lastLogin: "acum 1h",
    cereriSupervised: 142,
    usersManaged: 165,
    twoFA: false,
    actionsThisMonth: 82,
    loginCount30d: 38,
    avgResponseTime: "1.8h",
    satisfactionScore: 4.5,
    ticketsResolved: 134,
    activityTrend: [60, 65, 70, 74, 78, 82],
    role: "Admin Principal",
    phone: "+40 755 567 890",
  },
  {
    id: "adm5",
    name: "Ana Marinescu",
    email: "admin@primaria-ct.ro",
    avatar: "AM",
    primarie: "Constanța, Constanța",
    judet: "Constanța",
    status: "active",
    invitedAt: "15 Apr 2025",
    lastLogin: "acum 2h",
    cereriSupervised: 118,
    usersManaged: 143,
    twoFA: true,
    actionsThisMonth: 63,
    loginCount30d: 32,
    avgResponseTime: "2.8h",
    satisfactionScore: 4.1,
    ticketsResolved: 105,
    activityTrend: [45, 48, 52, 56, 59, 63],
    role: "Admin Principal",
    phone: "+40 766 678 901",
  },
  {
    id: "adm6",
    name: "George Radu",
    email: "admin@primaria-bv.ro",
    avatar: "GR",
    primarie: "Brașov, Brașov",
    judet: "Brașov",
    status: "active",
    invitedAt: "20 Mai 2025",
    lastLogin: "acum 3h",
    cereriSupervised: 105,
    usersManaged: 128,
    twoFA: false,
    actionsThisMonth: 51,
    loginCount30d: 28,
    avgResponseTime: "2.4h",
    satisfactionScore: 4.2,
    ticketsResolved: 94,
    activityTrend: [38, 40, 43, 46, 48, 51],
    role: "Admin Secundar",
    phone: "+40 777 789 012",
  },
  {
    id: "adm7",
    name: "Ioana Moldovan",
    email: "admin@primaria-or.ro",
    avatar: "IM",
    primarie: "Oradea, Bihor",
    judet: "Bihor",
    status: "active",
    invitedAt: "1 Iun 2025",
    lastLogin: "acum 5h",
    cereriSupervised: 87,
    usersManaged: 96,
    twoFA: true,
    actionsThisMonth: 44,
    loginCount30d: 24,
    avgResponseTime: "3.1h",
    satisfactionScore: 4.0,
    ticketsResolved: 78,
    activityTrend: [30, 33, 36, 38, 41, 44],
    role: "Admin Principal",
    phone: "+40 788 890 123",
  },
  {
    id: "adm8",
    name: "Dan Popescu",
    email: "admin@primaria-dj.ro",
    avatar: "DP",
    primarie: "Craiova, Dolj",
    judet: "Dolj",
    status: "active",
    invitedAt: "10 Iul 2025",
    lastLogin: "acum 8h",
    cereriSupervised: 64,
    usersManaged: 72,
    twoFA: false,
    actionsThisMonth: 28,
    loginCount30d: 18,
    avgResponseTime: "4.2h",
    satisfactionScore: 3.8,
    ticketsResolved: 52,
    activityTrend: [18, 20, 22, 24, 26, 28],
    role: "Admin Secundar",
    phone: "+40 799 901 234",
  },
  {
    id: "adm9",
    name: "Laura Toma",
    email: "admin@primaria-sb.ro",
    avatar: "LT",
    primarie: "Sibiu, Sibiu",
    judet: "Sibiu",
    status: "active",
    invitedAt: "4 Mar 2026",
    lastLogin: "acum 2h",
    cereriSupervised: 41,
    usersManaged: 54,
    twoFA: true,
    actionsThisMonth: 15,
    loginCount30d: 12,
    avgResponseTime: "0.8h",
    satisfactionScore: 4.9,
    ticketsResolved: 39,
    activityTrend: [0, 3, 6, 9, 12, 15],
    role: "Admin Principal",
    phone: "+40 712 012 345",
  },
  {
    id: "adm10",
    name: "Ion Stanciu",
    email: "admin@primaria-ph.ro",
    avatar: "IS",
    primarie: "Ploiești, Prahova",
    judet: "Prahova",
    status: "active",
    invitedAt: "15 Dec 2025",
    lastLogin: "acum 12h",
    cereriSupervised: 38,
    usersManaged: 45,
    twoFA: false,
    actionsThisMonth: 12,
    loginCount30d: 14,
    avgResponseTime: "5.1h",
    satisfactionScore: 3.6,
    ticketsResolved: 30,
    activityTrend: [8, 9, 10, 10, 11, 12],
    role: "Admin Secundar",
    phone: "+40 723 123 456",
  },
  {
    id: "adm11",
    name: "Vasile Ionescu",
    email: "admin@primaria-vn.ro",
    avatar: "VI",
    primarie: "Focșani, Vrancea",
    judet: "Vrancea",
    status: "suspended",
    invitedAt: "20 Aug 2025",
    lastLogin: "acum 45 zile",
    cereriSupervised: 0,
    usersManaged: 34,
    twoFA: false,
    actionsThisMonth: 0,
    loginCount30d: 0,
    avgResponseTime: "—",
    satisfactionScore: 2.1,
    ticketsResolved: 12,
    activityTrend: [15, 12, 8, 4, 1, 0],
    role: "Admin Principal",
    phone: "+40 734 234 567",
  },
  {
    id: "adm12",
    name: "Mihai Popa",
    email: "admin@primaria-bz.ro",
    avatar: "MP",
    primarie: "Buzău, Buzău",
    judet: "Buzău",
    status: "suspended",
    invitedAt: "1 Sep 2025",
    lastLogin: "acum 30 zile",
    cereriSupervised: 0,
    usersManaged: 28,
    twoFA: false,
    actionsThisMonth: 0,
    loginCount30d: 0,
    avgResponseTime: "—",
    satisfactionScore: 1.9,
    ticketsResolved: 8,
    activityTrend: [10, 8, 6, 3, 1, 0],
    role: "Admin Secundar",
    phone: "+40 745 345 678",
  },
  {
    id: "adm13",
    name: "Cristian Dragomir",
    email: "admin.galati@primariata.work",
    avatar: "CD",
    primarie: "Galați, Galați",
    judet: "Galați",
    status: "pending",
    invitedAt: "5 Mar 2026",
    lastLogin: "—",
    cereriSupervised: 0,
    usersManaged: 0,
    twoFA: false,
    actionsThisMonth: 0,
    loginCount30d: 0,
    avgResponseTime: "—",
    satisfactionScore: 0,
    ticketsResolved: 0,
    activityTrend: [0, 0, 0, 0, 0, 0],
    role: "Admin Principal",
    phone: "+40 756 456 789",
  },
];

const activityTrendData = [
  { month: "Oct", actions: 520, logins: 340 },
  { month: "Nov", actions: 580, logins: 365 },
  { month: "Dec", actions: 545, logins: 352 },
  { month: "Ian", actions: 640, logins: 398 },
  { month: "Feb", actions: 690, logins: 412 },
  { month: "Mar", actions: 730, logins: 435 },
];

// ─── Invite Admin Schema ──────────────────────────────

const inviteAdminSchema = z.object({
  primarieId: z.string().min(1, "Selectează o primărie"),
  email: z.string().email("Email invalid"),
  role: z.enum(["admin", "primar"]),
});

type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>;

// ─── AdminRow → PrimarieAdmin mapping ────────────────

function adminRowToPrimarieAdmin(row: AdminRow): PrimarieAdmin {
  const initials = row.name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: initials,
    primarie: row.primarie ?? "",
    judet: row.judet ?? "",
    status: row.status as AdminStatus,
    invitedAt: row.invitedAt,
    lastLogin: "-",
    cereriSupervised: row.cereriSupervised,
    usersManaged: row.usersManaged,
    twoFA: row.twoFA,
    actionsThisMonth: 0,
    loginCount30d: 0,
    avgResponseTime: "-",
    satisfactionScore: 0,
    ticketsResolved: 0,
    activityTrend: [0, 0, 0, 0, 0, 0],
    role: row.role ?? "Admin Principal",
    phone: "",
  };
}

// ─── Component ────────────────────────────────────────

interface SaAdminsContentProps {
  initialData: { success: boolean; data?: AdminRow[]; error?: string };
}

export function SaAdminsContent({ initialData }: SaAdminsContentProps) {
  const router = useRouter();
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AdminStatus | "all">("all");
  const [filterJudet, setFilterJudet] = useState("Toate județele");
  const [sortBy, setSortBy] = useState<
    "cereri" | "users" | "actions" | "name" | "satisfaction" | "logins"
  >("cereri");
  const [selectedAdmin, setSelectedAdmin] = useState<PrimarieAdmin | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "table">("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "overview" ? 6 : 8;
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteForm = useForm<InviteAdminFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { primarieId: "", email: "", role: "admin" },
  });

  async function handleInviteAdmin(values: InviteAdminFormValues) {
    setIsSubmitting(true);
    try {
      const result = await inviteAdminToPrimarie({
        primarieId: values.primarieId,
        email: values.email,
        role: values.role,
      });
      if (result.success) {
        toast.success("Invitație trimisă cu succes");
        setIsInviteOpen(false);
        inviteForm.reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "A apărut o eroare");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const mappedAdmins = useMemo<PrimarieAdmin[]>(() => {
    if (initialData.data && initialData.data.length > 0) {
      return initialData.data.map(adminRowToPrimarieAdmin);
    }
    return admins;
  }, [initialData.data]);

  const judete = useMemo(
    () => ["Toate județele", ...Array.from(new Set(mappedAdmins.map((a) => a.judet)))],
    [mappedAdmins]
  );

  const filtered = useMemo(() => {
    let result = [...mappedAdmins];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.primarie.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") result = result.filter((a) => a.status === filterStatus);
    if (filterJudet !== "Toate județele") result = result.filter((a) => a.judet === filterJudet);

    result.sort((a, b) => {
      if (sortBy === "cereri") return b.cereriSupervised - a.cereriSupervised;
      if (sortBy === "users") return b.usersManaged - a.usersManaged;
      if (sortBy === "actions") return b.actionsThisMonth - a.actionsThisMonth;
      if (sortBy === "satisfaction") return b.satisfactionScore - a.satisfactionScore;
      if (sortBy === "logins") return b.loginCount30d - a.loginCount30d;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [mappedAdmins, search, filterStatus, filterJudet, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterJudet, viewMode]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Computed metrics
  const activeCount = mappedAdmins.filter((a) => a.status === "active").length;
  const pendingCount = mappedAdmins.filter((a) => a.status === "pending").length;
  const suspendedCount = mappedAdmins.filter((a) => a.status === "suspended").length;
  const totalCereri = mappedAdmins.reduce((s, a) => s + a.cereriSupervised, 0);
  const totalActions = mappedAdmins.reduce((s, a) => s + a.actionsThisMonth, 0);
  const twoFARate =
    mappedAdmins.length > 0
      ? Math.round((mappedAdmins.filter((a) => a.twoFA).length / mappedAdmins.length) * 100)
      : 0;
  const avgSatisfaction =
    activeCount > 0
      ? (
          mappedAdmins
            .filter((a) => a.status === "active")
            .reduce((s, a) => s + a.satisfactionScore, 0) / activeCount
        ).toFixed(1)
      : "0.0";

  // Bar chart: cereri per admin (top active)
  const cereriBarData = [...mappedAdmins]
    .filter((a) => a.status === "active")
    .sort((a, b) => b.cereriSupervised - a.cereriSupervised)
    .map((a) => ({
      name: a.name.split(" ")[1] || a.name.split(" ")[0],
      cereri: a.cereriSupervised,
      fullName: a.name,
    }));

  // DonutChart data (status distribution)
  const donutData = [
    { label: "Activi", value: activeCount, color: "#10b981" },
    { label: "Pending", value: pendingCount, color: "#f59e0b" },
    { label: "Suspendați", value: suspendedCount, color: "#ef4444" },
  ];

  return (
    <div>
      {/* Error Banner */}
      {!errorDismissed && !initialData.success && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span className="flex-1 text-red-400" style={{ fontSize: "0.82rem" }}>
            Eroare la încărcarea datelor.{" "}
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer underline hover:no-underline"
            >
              Încearcă să recarci pagina.
            </button>
          </span>
          <button
            onClick={() => setErrorDismissed(true)}
            className="ml-2 cursor-pointer text-red-400/60 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.08))",
                border: "1px solid rgba(6,182,212,0.15)",
              }}
            >
              <UserCog className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1
                className="text-foreground flex items-center gap-2"
                style={{ fontSize: "1.5rem", fontWeight: 700 }}
              >
                Management Admini
              </h1>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.78rem" }}>
                Monitorizare · Performanță · Securitate — {mappedAdmins.length} admini de primărie
              </p>
            </div>
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsInviteOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #10b981, #06b6d4)",
            fontSize: "0.82rem",
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(16,185,129,0.2)",
          }}
        >
          <Plus className="h-4 w-4" /> Invită Admin Nou
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-6 gap-3">
        {[
          {
            label: "Total Admini",
            value: mappedAdmins.length,
            icon: Users,
            color: "#8b5cf6",
            trend: "+2",
            trendUp: true,
          },
          {
            label: "Activi",
            value: activeCount,
            icon: CheckCircle2,
            color: "#10b981",
            trend: `${mappedAdmins.length > 0 ? Math.round((activeCount / mappedAdmins.length) * 100) : 0}%`,
            trendUp: true,
          },
          {
            label: "Cereri / Lună",
            value: totalCereri.toLocaleString(),
            icon: FileText,
            color: "#06b6d4",
            trend: "+12%",
            trendUp: true,
          },
          {
            label: "Acțiuni / Lună",
            value: totalActions.toLocaleString(),
            icon: Activity,
            color: "#f59e0b",
            trend: "+8%",
            trendUp: true,
          },
          {
            label: "Rata 2FA",
            value: `${twoFARate}%`,
            icon: ShieldCheck,
            color: twoFARate >= 60 ? "#10b981" : "#f59e0b",
            trend: twoFARate >= 60 ? "Bun" : "Risc",
            trendUp: twoFARate >= 60,
          },
          {
            label: "Satisfacție Medie",
            value: `${avgSatisfaction}★`,
            icon: Gauge,
            color: "#ec4899",
            trend: "+0.2",
            trendUp: true,
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl p-3.5"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: `${kpi.color}12`, border: `1px solid ${kpi.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                <span
                  className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    color: kpi.trendUp ? "#10b981" : "#f59e0b",
                    background: kpi.trendUp ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                  }}
                >
                  {kpi.trendUp ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {kpi.trend}
                </span>
              </div>
              <div className="text-foreground" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {kpi.value}
              </div>
              <div className="text-muted-foreground mt-0.5" style={{ fontSize: "0.65rem" }}>
                {kpi.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="text-muted-foreground mb-3"
            style={{ fontSize: "0.78rem", fontWeight: 600 }}
          >
            Distribuție Status
          </div>
          <DonutChart data={donutData} size={130} thickness={18} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="text-muted-foreground mb-3"
            style={{ fontSize: "0.78rem", fontWeight: 600 }}
          >
            Cereri Supervizate / Admin
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={cereriBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.15)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar
                dataKey="cereri"
                fill="rgba(6,182,212,0.6)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="text-muted-foreground mb-3"
            style={{ fontSize: "0.78rem", fontWeight: 600 }}
          >
            Trend Activitate (6 luni)
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={activityTrendData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.15)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="actions"
                name="Acțiuni"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="logins"
                name="Login-uri"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tools toggles */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border-subtle)",
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
              className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${viewMode === v.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {viewMode === v.key && (
                <motion.div
                  layoutId="adminViewToggle"
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

        <div className="flex items-center gap-2">
          <ArrowUpDown className="text-muted-foreground h-3.5 w-3.5" />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "cereri"
                  | "users"
                  | "actions"
                  | "name"
                  | "satisfaction"
                  | "logins"
              )
            }
            className="text-foreground cursor-pointer appearance-none rounded-lg px-2.5 py-1.5 outline-none"
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.78rem",
            }}
          >
            <option value="cereri" className="bg-popover">
              Cereri
            </option>
            <option value="users" className="bg-popover">
              Users
            </option>
            <option value="actions" className="bg-popover">
              Acțiuni
            </option>
            <option value="logins" className="bg-popover">
              Login-uri
            </option>
            <option value="satisfaction" className="bg-popover">
              Satisfacție
            </option>
            <option value="name" className="bg-popover">
              Nume
            </option>
          </select>
        </div>
      </div>

      {/* Main views */}
      <AnimatePresence mode="wait">
        {viewMode === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Caută admin, email, primărie..."
                  className="text-foreground w-full rounded-xl py-2.5 pr-4 pl-10 outline-none"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>
              <div
                className="flex gap-1 rounded-xl p-1"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {(["all", "active", "pending", "suspended"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`relative cursor-pointer rounded-lg px-3 py-1.5 transition-all ${filterStatus === s ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {filterStatus === s && (
                      <motion.div
                        layoutId="adminFilter"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.06))",
                          border: "1px solid rgba(16,185,129,0.12)",
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10" style={{ fontSize: "0.78rem" }}>
                      {s === "all" ? "Toți" : adminStatusConfig[s].label}
                    </span>
                  </button>
                ))}
              </div>
              <select
                value={filterJudet}
                onChange={(e) => setFilterJudet(e.target.value)}
                className="text-foreground cursor-pointer appearance-none rounded-xl px-2.5 py-2.5 outline-none"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.82rem",
                }}
              >
                {judete.map((j) => (
                  <option key={j} value={j} className="bg-popover">
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {mappedAdmins.length === 0 && initialData.success ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <UserCog className="text-muted-foreground h-5 w-5" />
                </div>
                <p className="text-foreground mb-1 font-medium" style={{ fontSize: "0.9rem" }}>
                  Nu există admini înregistrați.
                </p>
                <p className="text-muted-foreground mb-4" style={{ fontSize: "0.8rem" }}>
                  Invită primul admin pentru a gestiona o primărie.
                </p>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
                >
                  <Plus className="h-4 w-4" /> Invită Admin
                </button>
              </div>
            ) : (
              <>
                <AdminsGrid items={paginatedItems} onSelect={setSelectedAdmin} />
                {filtered.length > 0 && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
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
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Caută admin, email, primărie..."
                  className="text-foreground w-full rounded-xl py-2.5 pr-4 pl-10 outline-none"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>
              <div
                className="flex gap-1 rounded-xl p-1"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {(["all", "active", "pending", "suspended"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`relative cursor-pointer rounded-lg px-3 py-1.5 transition-all ${filterStatus === s ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {filterStatus === s && (
                      <motion.div
                        layoutId="adminFilterTable"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.06))",
                          border: "1px solid rgba(16,185,129,0.12)",
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10" style={{ fontSize: "0.78rem" }}>
                      {s === "all" ? "Toți" : adminStatusConfig[s].label}
                    </span>
                  </button>
                ))}
              </div>
              <select
                value={filterJudet}
                onChange={(e) => setFilterJudet(e.target.value)}
                className="text-foreground cursor-pointer appearance-none rounded-xl px-2.5 py-2.5 outline-none"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.82rem",
                }}
              >
                {judete.map((j) => (
                  <option key={j} value={j} className="bg-popover">
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {mappedAdmins.length === 0 && initialData.success ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <UserCog className="text-muted-foreground h-5 w-5" />
                </div>
                <p className="text-foreground mb-1 font-medium" style={{ fontSize: "0.9rem" }}>
                  Nu există admini înregistrați.
                </p>
                <p className="text-muted-foreground mb-4" style={{ fontSize: "0.8rem" }}>
                  Invită primul admin pentru a gestiona o primărie.
                </p>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
                >
                  <Plus className="h-4 w-4" /> Invită Admin
                </button>
              </div>
            ) : (
              <>
                <AdminsTable items={paginatedItems} onSelect={setSelectedAdmin} />
                {filtered.length > 0 && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AdminDetailDrawer selectedAdmin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />

      {/* Invite Admin Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteOpen(false)}
              className="fixed inset-0 z-50 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ pointerEvents: "none" }}
            >
              <div
                className="w-full max-w-md rounded-2xl p-6"
                style={{
                  background: "var(--popover)",
                  border: "1px solid var(--border-subtle)",
                  backdropFilter: "blur(24px)",
                  pointerEvents: "auto",
                }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-foreground" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    Invită Admin Nou
                  </h2>
                  <button
                    onClick={() => setIsInviteOpen(false)}
                    className="text-muted-foreground hover:text-foreground bg-muted hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={inviteForm.handleSubmit(handleInviteAdmin)} className="space-y-4">
                  <div>
                    <label
                      className="text-muted-foreground mb-1.5 block"
                      style={{ fontSize: "0.75rem" }}
                    >
                      ID Primărie *
                    </label>
                    <input
                      {...inviteForm.register("primarieId")}
                      placeholder="ex: uuid-ul primăriei"
                      className="text-foreground placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 outline-none"
                      style={{
                        background: "var(--muted)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.85rem",
                      }}
                    />
                    {inviteForm.formState.errors.primarieId && (
                      <p className="mt-1 text-red-400" style={{ fontSize: "0.72rem" }}>
                        {inviteForm.formState.errors.primarieId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="text-muted-foreground mb-1.5 block"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Email Admin *
                    </label>
                    <input
                      {...inviteForm.register("email")}
                      type="email"
                      placeholder="ex: admin@primarie.ro"
                      className="text-foreground placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 outline-none"
                      style={{
                        background: "var(--muted)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.85rem",
                      }}
                    />
                    {inviteForm.formState.errors.email && (
                      <p className="mt-1 text-red-400" style={{ fontSize: "0.72rem" }}>
                        {inviteForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="text-muted-foreground mb-1.5 block"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Rol *
                    </label>
                    <select
                      {...inviteForm.register("role")}
                      className="text-foreground w-full cursor-pointer appearance-none rounded-xl px-3 py-2.5 outline-none"
                      style={{
                        background: "var(--muted)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <option value="admin" className="bg-popover">
                        Admin
                      </option>
                      <option value="primar" className="bg-popover">
                        Primar
                      </option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsInviteOpen(false)}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent flex-1 cursor-pointer rounded-xl px-4 py-2.5 transition-all"
                      style={{
                        background: "var(--muted)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.82rem",
                      }}
                    >
                      Anulare
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #06b6d4)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {isSubmitting ? "Se trimite..." : "Trimite Invitație"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
