"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserX,
  CheckCircle,
  ShieldAlert,
  Lock,
  Shield,
  WifiOff,
  ShieldCheck,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

// ─── Security Events ──────────────────────────────────────────────────────────

type SecurityEventType =
  | "login_fail"
  | "login_success"
  | "permission_denied"
  | "password_change"
  | "role_change"
  | "ip_block"
  | "2fa_enable";

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  user: string;
  ip: string;
  time: string;
  details: string;
}

const secEventConfig: Record<
  SecurityEventType,
  { color: string; icon: LucideIcon; label: string }
> = {
  login_fail: { color: "#ef4444", icon: UserX, label: "Login eșuat" },
  login_success: { color: "#10b981", icon: CheckCircle, label: "Login OK" },
  permission_denied: { color: "#f59e0b", icon: ShieldAlert, label: "Acces interzis" },
  password_change: { color: "#3b82f6", icon: Lock, label: "Schimbare parolă" },
  role_change: { color: "#8b5cf6", icon: Shield, label: "Schimbare rol" },
  ip_block: { color: "#ef4444", icon: WifiOff, label: "IP blocat" },
  "2fa_enable": { color: "#10b981", icon: ShieldCheck, label: "2FA activat" },
};

const securityEvents: SecurityEvent[] = [
  {
    id: "s1",
    type: "login_fail",
    user: "admin@primaria.ro",
    ip: "185.45.12.87",
    time: "16:48",
    details: "Parolă incorectă — încercare 3/5",
  },
  {
    id: "s2",
    type: "login_fail",
    user: "admin@primaria.ro",
    ip: "185.45.12.87",
    time: "16:47",
    details: "Parolă incorectă — încercare 2/5",
  },
  {
    id: "s3",
    type: "login_success",
    user: "elena.d@primaria.ro",
    ip: "86.120.45.23",
    time: "16:42",
    details: "Autentificare reușită cu 2FA",
  },
  {
    id: "s4",
    type: "role_change",
    user: "elena.d@primaria.ro",
    ip: "86.120.45.23",
    time: "16:40",
    details: "A modificat rolul: George R. → Funcționar",
  },
  {
    id: "s5",
    type: "permission_denied",
    user: "ion.p@primaria.ro",
    ip: "86.120.45.24",
    time: "16:30",
    details: "Acces interzis la /admin/settings — lipsă permisiuni",
  },
  {
    id: "s6",
    type: "login_success",
    user: "maria.i@primaria.ro",
    ip: "79.112.33.41",
    time: "16:20",
    details: "Autentificare reușită — sesiune nouă",
  },
  {
    id: "s7",
    type: "password_change",
    user: "dan.p@primaria.ro",
    ip: "86.120.45.25",
    time: "15:50",
    details: "Schimbare parolă — inițiată de utilizator",
  },
  {
    id: "s8",
    type: "2fa_enable",
    user: "ana.m@primaria.ro",
    ip: "79.112.33.42",
    time: "15:30",
    details: "2FA activat — authenticator app",
  },
  {
    id: "s9",
    type: "ip_block",
    user: "—",
    ip: "203.0.113.42",
    time: "15:15",
    details: "IP blocat automat — 10 încercări eșuate în 5 min",
  },
  {
    id: "s10",
    type: "login_fail",
    user: "unknown@test.com",
    ip: "203.0.113.42",
    time: "15:14",
    details: "Cont inexistent — tentativă de acces",
  },
];

// ─── SecurityEventsLog ────────────────────────────────────────────────────────

export function SecurityEventsLog(): React.JSX.Element {
  const failCount = securityEvents.filter((e) => e.type === "login_fail").length;
  const blockedCount = securityEvents.filter((e) => e.type === "ip_block").length;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Login-uri Eșuate (24h)", value: failCount, color: "#ef4444", Icon: UserX },
          { label: "IP-uri Blocate", value: blockedCount, color: "#f59e0b", Icon: WifiOff },
          { label: "Sesiuni Active", value: 24, color: "#3b82f6", Icon: Shield },
          { label: "2FA Activat", value: "78%", color: "#10b981", Icon: Lock },
        ].map(({ label, value, color, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: `${color}06`,
              border: `1px solid ${color}12`,
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${color}15` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <div className="text-[1.2rem] leading-none font-bold text-white">{value}</div>
              <div className="text-[0.7rem] text-gray-500">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Events table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-violet-400" />
            <h3 className="text-[0.95rem] font-semibold text-white">Evenimente Securitate</h3>
          </div>
          <span className="text-[0.72rem] text-gray-600">Ultimele 24h</span>
        </div>

        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
          style={{
            fontSize: "0.65rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-1">Ora</div>
          <div className="col-span-2">Tip</div>
          <div className="col-span-3">Utilizator</div>
          <div className="col-span-2">IP</div>
          <div className="col-span-4">Detalii</div>
        </div>

        {securityEvents.map((evt, i) => {
          const cfg = secEventConfig[evt.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 * i }}
              className="grid grid-cols-12 items-center gap-2 px-5 py-2.5 transition-all hover:bg-white/[0.015]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              <div className="col-span-1">
                <span className="font-mono text-[0.72rem] text-gray-600">{evt.time}</span>
              </div>
              <div className="col-span-2">
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold"
                  style={{ color: cfg.color, background: `${cfg.color}10` }}
                >
                  <Icon className="h-3 w-3" /> {cfg.label}
                </span>
              </div>
              <div className="col-span-3 truncate text-[0.78rem] text-gray-300">{evt.user}</div>
              <div className="col-span-2">
                <span className="font-mono text-[0.72rem] text-gray-500">{evt.ip}</span>
              </div>
              <div className="col-span-4 truncate text-[0.75rem] text-gray-500">{evt.details}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Scheduled Jobs ───────────────────────────────────────────────────────────

type JobStatus = "success" | "running" | "failed" | "scheduled";

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  duration: string;
  status: JobStatus;
}

// Scheduled jobs: static mock data — real pg_cron integration deferred
const scheduledJobs: ScheduledJob[] = [
  {
    id: "j1",
    name: "Backup Database",
    schedule: "Zilnic 03:00",
    lastRun: "4 Mar, 03:00",
    nextRun: "5 Mar, 03:00",
    duration: "3m 42s",
    status: "success",
  },
  {
    id: "j2",
    name: "Cleanup Temp Files",
    schedule: "Zilnic 04:00",
    lastRun: "4 Mar, 04:00",
    nextRun: "5 Mar, 04:00",
    duration: "28s",
    status: "success",
  },
  {
    id: "j3",
    name: "Sync Registre Externe",
    schedule: "La 6 ore",
    lastRun: "4 Mar, 12:00",
    nextRun: "4 Mar, 18:00",
    duration: "1m 15s",
    status: "running",
  },
  {
    id: "j4",
    name: "Generare Rapoarte Zilnice",
    schedule: "Zilnic 06:00",
    lastRun: "4 Mar, 06:00",
    nextRun: "5 Mar, 06:00",
    duration: "2m 08s",
    status: "success",
  },
  {
    id: "j5",
    name: "Email Digest Funcționari",
    schedule: "Zilnic 07:30",
    lastRun: "4 Mar, 07:30",
    nextRun: "5 Mar, 07:30",
    duration: "45s",
    status: "success",
  },
  {
    id: "j6",
    name: "Verificare Certificat SSL",
    schedule: "Zilnic 00:00",
    lastRun: "4 Mar, 00:00",
    nextRun: "5 Mar, 00:00",
    duration: "2s",
    status: "success",
  },
  {
    id: "j7",
    name: "Notificări Deadline Cereri",
    schedule: "La 2 ore",
    lastRun: "4 Mar, 14:00",
    nextRun: "4 Mar, 16:00",
    duration: "12s",
    status: "failed",
  },
  {
    id: "j8",
    name: "Index Search Update",
    schedule: "La 30 min",
    lastRun: "4 Mar, 15:30",
    nextRun: "4 Mar, 16:00",
    duration: "8s",
    status: "success",
  },
];

const jobStatusConfig: Record<JobStatus, { color: string; icon: LucideIcon; label: string }> = {
  success: { color: "#10b981", icon: CheckCircle2, label: "Succes" },
  running: { color: "#3b82f6", icon: RotateCcw, label: "Rulează" },
  failed: { color: "#ef4444", icon: XCircle, label: "Eșuat" },
  scheduled: { color: "#6b7280", icon: Timer, label: "Programat" },
};

export function ScheduledJobsTable(): React.JSX.Element {
  const totalCount = scheduledJobs.length;
  const successCount = scheduledJobs.filter((j) => j.status === "success").length;
  const runningCount = scheduledJobs.filter((j) => j.status === "running").length;
  const failedCount = scheduledJobs.filter((j) => j.status === "failed").length;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Jobs", value: totalCount, color: "#3b82f6", Icon: Timer },
          { label: "Succes", value: successCount, color: "#10b981", Icon: CheckCircle2 },
          { label: "Rulează", value: runningCount, color: "#3b82f6", Icon: RotateCcw },
          { label: "Eșuate", value: failedCount, color: "#ef4444", Icon: XCircle },
        ].map(({ label, value, color, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: `${color}06`, border: `1px solid ${color}12` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
            <div>
              <div className="text-[1.3rem] leading-none font-bold text-white">{value}</div>
              <div className="text-[0.72rem] text-gray-500">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Jobs table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-blue-400" />
            <h3 className="text-[0.95rem] font-semibold text-white">Jobs Programate</h3>
          </div>
        </div>

        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
          style={{
            fontSize: "0.65rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-3">Nume</div>
          <div className="col-span-2">Program</div>
          <div className="col-span-2">Ultima Rulare</div>
          <div className="col-span-2">Următoarea</div>
          <div className="col-span-1">Durată</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Acțiuni</div>
        </div>

        {scheduledJobs.map((job, i) => {
          const jc = jobStatusConfig[job.status];
          const StatusIcon = jc.icon;
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i }}
              className="grid grid-cols-12 items-center gap-2 px-5 py-3 transition-all hover:bg-white/[0.015]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              <div className="col-span-3 truncate text-[0.85rem] text-white">{job.name}</div>
              <div className="col-span-2 text-[0.78rem] text-gray-400">{job.schedule}</div>
              <div className="col-span-2 text-[0.75rem] text-gray-500">{job.lastRun}</div>
              <div className="col-span-2 text-[0.75rem] text-gray-500">{job.nextRun}</div>
              <div className="col-span-1 text-[0.78rem] text-gray-400">{job.duration}</div>
              <div className="col-span-1">
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold"
                  style={{ color: jc.color, background: `${jc.color}12` }}
                >
                  <StatusIcon
                    className={`h-3 w-3 ${job.status === "running" ? "animate-spin" : ""}`}
                  />
                  {jc.label}
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <button
                  onClick={() => toast.success(`Job "${job.name}" — rulare manuală inițiată`)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-emerald-400"
                  title="Rulează manual"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toast(`Log-uri job: ${job.name}`)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                  title="Vezi log-uri"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

type AuditType =
  | "role"
  | "cerere"
  | "doc"
  | "system"
  | "user"
  | "view"
  | "config"
  | "security"
  | "payment";

interface AuditEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  type: AuditType;
  color: string;
  ip: string;
  details?: string;
}

// Audit log: static mock data — real DB table connection deferred
const auditLog: AuditEntry[] = [
  {
    id: "al1",
    time: "16:42",
    user: "Elena D.",
    action: "A modificat rolul lui George R. → Funcționar",
    type: "role",
    color: "#8b5cf6",
    ip: "86.120.45.23",
    details: "Rol anterior: Cetățean",
  },
  {
    id: "al2",
    time: "16:38",
    user: "Ion P.",
    action: "A aprobat cererea #1852",
    type: "cerere",
    color: "#10b981",
    ip: "86.120.45.24",
    details: "Tip: Certificat Fiscal",
  },
  {
    id: "al3",
    time: "16:20",
    user: "Maria I.",
    action: "A încărcat document — Aviz_Mediu.pdf (2.4MB)",
    type: "doc",
    color: "#3b82f6",
    ip: "79.112.33.41",
  },
  {
    id: "al4",
    time: "15:55",
    user: "System",
    action: "Backup automat completat cu succes (24.7GB)",
    type: "system",
    color: "#6b7280",
    ip: "127.0.0.1",
  },
  {
    id: "al5",
    time: "15:30",
    user: "Elena D.",
    action: "A suspendat contul Vasile R. — motiv: inactivitate",
    type: "user",
    color: "#ef4444",
    ip: "86.120.45.23",
    details: "Cont suspendat pe perioadă nedeterminată",
  },
  {
    id: "al6",
    time: "14:45",
    user: "Ana M.",
    action: "A respins cererea #1848 — documente incomplete",
    type: "cerere",
    color: "#f59e0b",
    ip: "79.112.33.42",
    details: "Motiv: lipsă copie CI",
  },
  {
    id: "al7",
    time: "14:20",
    user: "System",
    action: "Certificat SSL verificat — valid până la 15 Sep 2026",
    type: "system",
    color: "#6b7280",
    ip: "127.0.0.1",
  },
  {
    id: "al8",
    time: "13:10",
    user: "Dan P.",
    action: "Primar — a vizualizat raport buget Q1 2026",
    type: "view",
    color: "#f59e0b",
    ip: "86.120.45.25",
  },
  {
    id: "al9",
    time: "12:45",
    user: "Elena D.",
    action: "A modificat configurare primărie — program lucru",
    type: "config",
    color: "#06b6d4",
    ip: "86.120.45.23",
    details: "Program actualizat: L-V 08:00-16:00",
  },
  {
    id: "al10",
    time: "12:30",
    user: "System",
    action: "Plată primită — 1250 RON, Taxă locală, ref. TXN-2026-8452",
    type: "payment",
    color: "#10b981",
    ip: "—",
  },
  {
    id: "al11",
    time: "11:50",
    user: "Ion P.",
    action: "A reasignat cererea #1845 către Maria I.",
    type: "cerere",
    color: "#3b82f6",
    ip: "86.120.45.24",
  },
  {
    id: "al12",
    time: "11:20",
    user: "System",
    action: "Sync registre externe completat — 3 actualizări",
    type: "system",
    color: "#6b7280",
    ip: "127.0.0.1",
  },
  {
    id: "al13",
    time: "10:40",
    user: "Ana M.",
    action: "A generat certificat fiscal pentru contribuabil #4521",
    type: "doc",
    color: "#3b82f6",
    ip: "79.112.33.42",
  },
  {
    id: "al14",
    time: "10:15",
    user: "Elena D.",
    action: "A invitat utilizator nou — george.r@primaria.ro",
    type: "user",
    color: "#8b5cf6",
    ip: "86.120.45.23",
  },
  {
    id: "al15",
    time: "09:50",
    user: "System",
    action: "Alertă: IP 203.0.113.42 blocat — brute force",
    type: "security",
    color: "#ef4444",
    ip: "127.0.0.1",
  },
  {
    id: "al16",
    time: "09:30",
    user: "Dan P.",
    action: "A aprobat buget extindere digitalizare — 15,000 RON",
    type: "payment",
    color: "#10b981",
    ip: "86.120.45.25",
  },
];

const auditTypeLabels: Record<AuditType, string> = {
  role: "Roluri",
  cerere: "Cereri",
  doc: "Documente",
  system: "Sistem",
  user: "Utilizatori",
  view: "Vizualizări",
  config: "Configurare",
  security: "Securitate",
  payment: "Plăți",
};

const AUDIT_PER_PAGE = 10;

export function AuditLogTable(): React.JSX.Element {
  const [auditFilter, setAuditFilter] = useState<AuditType | "all">("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditPage, setAuditPage] = useState(1);

  const filteredAudit = useMemo(() => {
    let result = [...auditLog];
    if (auditFilter !== "all") result = result.filter((a) => a.type === auditFilter);
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      result = result.filter(
        (a) => a.action.toLowerCase().includes(q) || a.user.toLowerCase().includes(q)
      );
    }
    return result;
  }, [auditFilter, auditSearch]);

  const auditTotalPages = Math.ceil(filteredAudit.length / AUDIT_PER_PAGE);
  const paginatedAudit = filteredAudit.slice(
    (auditPage - 1) * AUDIT_PER_PAGE,
    auditPage * AUDIT_PER_PAGE
  );

  function handleFilterChange(filter: AuditType | "all"): void {
    setAuditFilter(filter);
    setAuditPage(1);
  }

  function handleSearchChange(value: string): void {
    setAuditSearch(value);
    setAuditPage(1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025]"
    >
      {/* Header with search + filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.04] px-5 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-400" />
          <h3 className="text-[0.95rem] font-semibold text-white">Audit Log — Acțiuni Recente</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search className="h-3.5 w-3.5 text-gray-500" />
            <input
              value={auditSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Caută acțiune..."
              className="w-44 bg-transparent text-white outline-none placeholder:text-gray-600"
              style={{ fontSize: "0.8rem" }}
            />
          </div>
          {/* Type filters */}
          <div
            className="flex flex-wrap gap-0.5 rounded-lg p-0.5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <button
              onClick={() => handleFilterChange("all")}
              className={`cursor-pointer rounded-md px-2 py-1 text-[0.68rem] transition-all ${auditFilter === "all" ? "bg-violet-500/15 text-white" : "text-gray-600 hover:text-gray-300"}`}
            >
              Toate
            </button>
            {(Object.keys(auditTypeLabels) as AuditType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(t)}
                className={`cursor-pointer rounded-md px-2 py-1 text-[0.68rem] transition-all ${auditFilter === t ? "bg-violet-500/15 text-white" : "text-gray-600 hover:text-gray-300"}`}
              >
                {auditTypeLabels[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
        style={{
          fontSize: "0.65rem",
          color: "#6b7280",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <div className="col-span-1">Ora</div>
        <div className="col-span-2">Utilizator</div>
        <div className="col-span-5">Acțiune</div>
        <div className="col-span-1">Tip</div>
        <div className="col-span-2">IP</div>
        <div className="col-span-1">Detalii</div>
      </div>

      {/* Rows */}
      <AnimatePresence mode="popLayout">
        {paginatedAudit.map((entry, i) => (
          <motion.div
            key={entry.id}
            layout
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.02 * i }}
            className="grid grid-cols-12 items-center gap-2 px-5 py-2.5 transition-all hover:bg-white/[0.02]"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
          >
            <div className="col-span-1">
              <span className="font-mono text-[0.75rem] text-gray-600">{entry.time}</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
                <span className="text-[0.82rem] font-medium text-gray-300">{entry.user}</span>
              </div>
            </div>
            <div className="col-span-5 truncate text-[0.82rem] text-gray-500">{entry.action}</div>
            <div className="col-span-1">
              <span
                className="rounded px-1.5 py-0.5 text-[0.62rem] text-gray-400"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {entry.type}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-mono text-[0.68rem] text-gray-600">{entry.ip}</span>
            </div>
            <div className="col-span-1">
              {entry.details ? (
                <button
                  onClick={() =>
                    toast(entry.details!, { description: `${entry.user} · ${entry.time}` })
                  }
                  className="cursor-pointer rounded-lg p-1 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="text-[0.68rem] text-gray-800">—</span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredAudit.length === 0 && (
        <div className="flex items-center justify-center py-10 text-[0.85rem] text-gray-600">
          Nicio înregistrare găsită
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
        <span className="text-[0.78rem] text-gray-600">
          {filteredAudit.length > 0
            ? `${(auditPage - 1) * AUDIT_PER_PAGE + 1}–${Math.min(auditPage * AUDIT_PER_PAGE, filteredAudit.length)} din ${filteredAudit.length}`
            : "0 rezultate"}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={auditPage <= 1}
            onClick={() => setAuditPage(auditPage - 1)}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: auditTotalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setAuditPage(p)}
              className={`h-7 w-7 cursor-pointer rounded-lg text-[0.78rem] transition-all ${
                p === auditPage
                  ? "bg-violet-500/20 text-white"
                  : "text-gray-600 hover:bg-white/5 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={auditPage >= auditTotalPages}
            onClick={() => setAuditPage(auditPage + 1)}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
