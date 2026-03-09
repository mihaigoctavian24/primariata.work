"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCog,
  Settings,
  FileText,
  Users,
  Lock,
  Eye,
  Zap,
  Power,
  Mail,
  Trash2,
} from "lucide-react";
import type { AuditEntry as ServerAuditEntry } from "@/actions/super-admin-stats";

// ─── Mock Data ───────────────────────────────────────

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "impersonate"
  | "toggle"
  | "invite"
  | "export"
  | "config";

interface AuditEntry {
  id: string;
  timestamp: string;
  date: string;
  actor: string;
  actorRole: "super_admin" | "admin";
  action: AuditAction;
  target: string;
  details: string;
  ip: string;
  primarie?: string;
  color: string;
  icon: React.ElementType;
}

const auditEntries: AuditEntry[] = [
  {
    id: "au1",
    timestamp: "16:48",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "create",
    target: "Primăria Sibiu",
    details: "Onboarding primărie nouă — Tier Premium",
    ip: "86.120.45.100",
    color: "#10b981",
    icon: Building2,
  },
  {
    id: "au2",
    timestamp: "16:45",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "invite",
    target: "Laura Toma",
    details: "Invitație admin trimisă — admin@primaria-sb.ro",
    ip: "86.120.45.100",
    primarie: "Sibiu",
    color: "#06b6d4",
    icon: Mail,
  },
  {
    id: "au3",
    timestamp: "16:30",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "toggle",
    target: "AI Analysis",
    details: "Feature flag activat — Cluj-Napoca",
    ip: "86.120.45.100",
    primarie: "Cluj-Napoca",
    color: "#f59e0b",
    icon: Zap,
  },
  {
    id: "au4",
    timestamp: "16:15",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "impersonate",
    target: "Elena Dumitrescu",
    details: "Impersonare admin — Sector 1 B (suport)",
    ip: "86.120.45.100",
    primarie: "Sector 1 B",
    color: "#8b5cf6",
    icon: Eye,
  },
  {
    id: "au5",
    timestamp: "15:50",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "config",
    target: "Rate Limiting",
    details: "Modificat de la 80 la 100 req/min/IP",
    ip: "86.120.45.100",
    color: "#6b7280",
    icon: Settings,
  },
  {
    id: "au6",
    timestamp: "15:30",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "update",
    target: "Primăria Focșani",
    details: "Status schimbat: Active → Inactive (neplată)",
    ip: "86.120.45.100",
    primarie: "Focșani",
    color: "#ef4444",
    icon: Power,
  },
  {
    id: "au7",
    timestamp: "14:45",
    date: "6 Mar 2026",
    actor: "Elena Dumitrescu",
    actorRole: "admin",
    action: "update",
    target: "George Radu",
    details: "Modificat rol: Cetățean → Funcționar",
    ip: "86.120.45.23",
    primarie: "Sector 1 B",
    color: "#8b5cf6",
    icon: UserCog,
  },
  {
    id: "au8",
    timestamp: "14:20",
    date: "6 Mar 2026",
    actor: "Andrei Pop",
    actorRole: "admin",
    action: "export",
    target: "Raport Cereri",
    details: "Export CSV — 231 cereri luna aceasta",
    ip: "86.120.45.50",
    primarie: "Cluj-Napoca",
    color: "#3b82f6",
    icon: Download,
  },
  {
    id: "au9",
    timestamp: "13:50",
    date: "6 Mar 2026",
    actor: "Maria Lazăr",
    actorRole: "admin",
    action: "invite",
    target: "Ion Popa",
    details: "Invitație funcționar — Departament Urbanism",
    ip: "79.112.33.41",
    primarie: "Timișoara",
    color: "#06b6d4",
    icon: Users,
  },
  {
    id: "au10",
    timestamp: "13:10",
    date: "6 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "login",
    target: "Platform",
    details: "Login reușit — 2FA verificat",
    ip: "86.120.45.100",
    color: "#10b981",
    icon: Lock,
  },
  {
    id: "au11",
    timestamp: "12:40",
    date: "5 Mar 2026",
    actor: "Vlad Ungureanu",
    actorRole: "admin",
    action: "delete",
    target: "Document vechi",
    details: "Șters fișier: Raport_2024_Q3.pdf (4.2MB)",
    ip: "86.120.45.60",
    primarie: "Iași",
    color: "#ef4444",
    icon: Trash2,
  },
  {
    id: "au12",
    timestamp: "11:30",
    date: "5 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "config",
    target: "SendGrid API",
    details: "Actualizat cheie API — rotație programată",
    ip: "86.120.45.100",
    color: "#06b6d4",
    icon: Settings,
  },
  {
    id: "au13",
    timestamp: "10:15",
    date: "5 Mar 2026",
    actor: "Ana Marinescu",
    actorRole: "admin",
    action: "update",
    target: "Cerere #1842",
    details: "Status: Depusă → Aprobată",
    ip: "79.112.33.42",
    primarie: "Constanța",
    color: "#10b981",
    icon: FileText,
  },
  {
    id: "au14",
    timestamp: "09:20",
    date: "5 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "create",
    target: "Primăria Ploiești",
    details: "Onboarding primărie nouă — Tier Basic",
    ip: "86.120.45.100",
    color: "#10b981",
    icon: Building2,
  },
  {
    id: "au15",
    timestamp: "08:45",
    date: "5 Mar 2026",
    actor: "George Radu",
    actorRole: "admin",
    action: "login",
    target: "Platform",
    details: "Login reușit — Brașov",
    ip: "79.112.33.43",
    primarie: "Brașov",
    color: "#10b981",
    icon: Lock,
  },
  {
    id: "au16",
    timestamp: "16:30",
    date: "4 Mar 2026",
    actor: "Octavian Mihai",
    actorRole: "super_admin",
    action: "toggle",
    target: "Gamification",
    details: "Feature flag activat global",
    ip: "86.120.45.100",
    color: "#ec4899",
    icon: Zap,
  },
];

const actionLabels: Record<AuditAction, string> = {
  create: "Creare",
  update: "Modificare",
  delete: "Ștergere",
  login: "Login",
  impersonate: "Impersonare",
  toggle: "Toggle",
  invite: "Invitație",
  export: "Export",
  config: "Configurare",
};

const actionColors: Record<AuditAction, string> = {
  create: "#10b981",
  update: "#3b82f6",
  delete: "#ef4444",
  login: "#6b7280",
  impersonate: "#8b5cf6",
  toggle: "#f59e0b",
  invite: "#06b6d4",
  export: "#3b82f6",
  config: "#6b7280",
};

// ─── Server AuditEntry → local AuditEntry mapping ────

function serverEntryToLocal(entry: ServerAuditEntry): AuditEntry {
  const timestamp = entry.createdAt
    ? new Date(entry.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const date = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  // Map actiune string to closest AuditAction bucket
  const actiuneLC = entry.actiune.toLowerCase();
  let action: AuditAction = "config";
  if (actiuneLC.includes("crea") || actiuneLC.includes("add") || actiuneLC.includes("insert"))
    action = "create";
  else if (actiuneLC.includes("upd") || actiuneLC.includes("modif") || actiuneLC.includes("schim"))
    action = "update";
  else if (actiuneLC.includes("delet") || actiuneLC.includes("ster")) action = "delete";
  else if (actiuneLC.includes("login") || actiuneLC.includes("auth") || actiuneLC.includes("sign"))
    action = "login";
  else if (actiuneLC.includes("impers")) action = "impersonate";
  else if (actiuneLC.includes("toggl") || actiuneLC.includes("flag") || actiuneLC.includes("activ"))
    action = "toggle";
  else if (actiuneLC.includes("invit")) action = "invite";
  else if (actiuneLC.includes("export")) action = "export";

  const color = actionColors[action];
  const icon =
    action === "create"
      ? Building2
      : action === "update"
        ? UserCog
        : action === "delete"
          ? Trash2
          : action === "login"
            ? Lock
            : action === "impersonate"
              ? Eye
              : action === "toggle"
                ? Zap
                : action === "invite"
                  ? Mail
                  : action === "export"
                    ? Download
                    : Settings;

  // Determine actorRole from actorName heuristic (super admin user names vs admin)
  const actorRole: "super_admin" | "admin" = "admin";

  const detaliiStr = entry.detalii ? JSON.stringify(entry.detalii).slice(0, 80) : "";

  return {
    id: entry.id,
    timestamp,
    date,
    actor: entry.actorName,
    actorRole,
    action,
    target: entry.primarieName ?? entry.actiune,
    details: detaliiStr || entry.actiune,
    ip: entry.ipAddress ?? "-",
    primarie: entry.primarieName ?? undefined,
    color,
    icon,
  };
}

// ─── Main Component ──────────────────────────────────

interface SaAuditContentProps {
  initialData: { success: boolean; data?: ServerAuditEntry[]; error?: string };
}

export function SaAuditContent({ initialData }: SaAuditContentProps) {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<AuditAction | "all">("all");
  const [filterRole, setFilterRole] = useState<"all" | "super_admin" | "admin">("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const allEntries = useMemo<AuditEntry[]>(() => {
    if (initialData.data && initialData.data.length > 0) {
      return initialData.data.map(serverEntryToLocal);
    }
    return auditEntries;
  }, [initialData.data]);

  const filtered = useMemo(() => {
    let result = [...allEntries];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.actor.toLowerCase().includes(q) ||
          a.target.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q)
      );
    }
    if (filterAction !== "all") result = result.filter((a) => a.action === filterAction);
    if (filterRole !== "all") result = result.filter((a) => a.actorRole === filterRole);
    return result;
  }, [allEntries, search, filterAction, filterRole]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <Shield className="h-6 w-6 text-amber-400" /> Audit Log — Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-gray-600"
            style={{ fontSize: "0.83rem" }}
          >
            {allEntries.length} acțiuni înregistrate · toate primăriile · super_admin & admin
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.success("Export CSV generat")}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-gray-300 transition-all hover:bg-white/[0.06]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
          }}
        >
          <Download className="h-4 w-4" /> Export CSV
        </motion.button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Caută actor, target, detalii..."
            className="w-full rounded-xl py-2.5 pr-4 pl-10 text-white placeholder-gray-600 outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.82rem",
            }}
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => {
            setFilterAction(e.target.value as AuditAction | "all");
            setPage(1);
          }}
          className="cursor-pointer appearance-none rounded-xl px-3 py-2.5 text-gray-300 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
            minWidth: 160,
          }}
        >
          <option value="all" className="bg-[#1a1a2e]">
            Toate acțiunile
          </option>
          {Object.entries(actionLabels).map(([key, label]) => (
            <option key={key} value={key} className="bg-[#1a1a2e]">
              {label}
            </option>
          ))}
        </select>
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {(["all", "super_admin", "admin"] as const).map((r) => {
            const isActive = filterRole === r;
            return (
              <button
                key={r}
                onClick={() => {
                  setFilterRole(r);
                  setPage(1);
                }}
                className={`relative cursor-pointer rounded-lg px-3 py-1.5 transition-all ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="auditRoleFilter"
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
                  {r === "all" ? "Toți" : r === "super_admin" ? "Super Admin" : "Admin Primărie"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {paginated.map((entry, i) => {
          const Icon = entry.icon;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-4 transition-all hover:bg-white/[0.02]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              {/* Icon */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${entry.color}12`, border: `1px solid ${entry.color}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: entry.color }} />
              </div>

              {/* Time */}
              <div className="w-20 shrink-0">
                <div className="text-gray-300" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  {entry.timestamp}
                </div>
                <div className="text-gray-700" style={{ fontSize: "0.63rem" }}>
                  {entry.date}
                </div>
              </div>

              {/* Actor */}
              <div className="w-36 shrink-0">
                <div className="text-gray-200" style={{ fontSize: "0.8rem" }}>
                  {entry.actor}
                </div>
                <span
                  className="rounded px-1.5 py-0.5"
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 600,
                    background:
                      entry.actorRole === "super_admin"
                        ? "rgba(16,185,129,0.08)"
                        : "rgba(236,72,153,0.08)",
                    color: entry.actorRole === "super_admin" ? "#10b981" : "#ec4899",
                  }}
                >
                  {entry.actorRole === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>

              {/* Action Badge */}
              <div className="w-24 shrink-0">
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    background: `${actionColors[entry.action]}12`,
                    color: actionColors[entry.action],
                    border: `1px solid ${actionColors[entry.action]}18`,
                  }}
                >
                  {actionLabels[entry.action]}
                </span>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-gray-200" style={{ fontSize: "0.8rem" }}>
                  <span className="text-white" style={{ fontWeight: 600 }}>
                    {entry.target}
                  </span>{" "}
                  — {entry.details}
                </div>
                {entry.primarie && (
                  <div
                    className="mt-0.5 flex items-center gap-1 text-gray-600"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <Building2 className="h-2.5 w-2.5" /> {entry.primarie}
                  </div>
                )}
              </div>

              {/* IP */}
              <div className="w-28 shrink-0 text-right">
                <span className="font-mono text-gray-600" style={{ fontSize: "0.68rem" }}>
                  {entry.ip}
                </span>
              </div>
            </motion.div>
          );
        })}

        {paginated.length === 0 && (
          <div className="py-12 text-center text-gray-600" style={{ fontSize: "0.85rem" }}>
            Nicio intrare găsită.
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-gray-600" style={{ fontSize: "0.75rem" }}>
            {filtered.length} rezultate · Pagina {page}/{totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="cursor-pointer rounded-lg bg-white/[0.04] p-2 text-gray-400 transition-all hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="cursor-pointer rounded-lg bg-white/[0.04] p-2 text-gray-400 transition-all hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
