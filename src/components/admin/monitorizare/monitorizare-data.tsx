"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Server,
  ShieldAlert,
  Timer,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Users,
  Globe,
  Wifi,
  XCircle,
  Info,
  Settings,
  Lock,
  Database,
  HardDrive,
  Inbox,
  Zap,
  Layers,
  FileText,
  Bell,
  Search,
  UserX,
  WifiOff,
  RotateCcw,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type TabKey = "overview" | "services" | "security" | "jobs" | "audit";
export type AlertSeverity = "critical" | "warning" | "info";
export type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";
export type SecEventType =
  | "login_fail"
  | "login_success"
  | "permission_denied"
  | "ip_block"
  | "brute_force"
  | "rule_change"
  | "timeout";
export type JobStatus = "success" | "running" | "failed";
export type AuditType = "create" | "update" | "delete" | "view" | "security";

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  time: string;
  acknowledged: boolean;
}

export interface LiveEvent {
  id: string;
  time: string;
  type: "request" | "auth" | "system" | "error";
  message: string;
}

// ============================================================================
// Tab Config
// ============================================================================

export const TABS: { id: TabKey; label: string; icon: typeof BarChart3; badge?: number }[] = [
  { id: "overview", label: "Prezentare Generală", icon: BarChart3 },
  { id: "services", label: "Servicii", icon: Server },
  { id: "security", label: "Securitate", icon: ShieldAlert },
  { id: "jobs", label: "Jobs Programate", icon: Timer },
  { id: "audit", label: "Audit Log", icon: Shield },
];

// ============================================================================
// Configs
// ============================================================================

export const alertSeverityConfig: Record<
  AlertSeverity,
  { color: string; icon: typeof XCircle; bg: string }
> = {
  critical: { color: "#ef4444", icon: XCircle, bg: "rgba(239,68,68,0.06)" },
  warning: { color: "#f59e0b", icon: AlertTriangle, bg: "rgba(245,158,11,0.06)" },
  info: { color: "#3b82f6", icon: Info, bg: "rgba(59,130,246,0.06)" },
};

export const statusStyles: Record<ServiceStatus, { color: string; label: string; bg: string }> = {
  operational: { color: "#10b981", label: "Operațional", bg: "rgba(16,185,129,0.08)" },
  degraded: { color: "#f59e0b", label: "Degradat", bg: "rgba(245,158,11,0.08)" },
  down: { color: "#ef4444", label: "Oprit", bg: "rgba(239,68,68,0.08)" },
  maintenance: { color: "#6b7280", label: "Mentenanță", bg: "rgba(107,114,128,0.08)" },
};

export const secEventConfig: Record<
  SecEventType,
  { color: string; icon: typeof UserX; label: string }
> = {
  login_fail: { color: "#ef4444", icon: UserX, label: "Login eșuat" },
  login_success: { color: "#10b981", icon: CheckCircle2, label: "Login OK" },
  permission_denied: { color: "#f59e0b", icon: ShieldAlert, label: "Acces interzis" },
  ip_block: { color: "#ef4444", icon: WifiOff, label: "IP blocat" },
  brute_force: { color: "#ef4444", icon: ShieldAlert, label: "Brute Force" },
  rule_change: { color: "#3b82f6", icon: Shield, label: "Mod. Securitate" },
  timeout: { color: "#6b7280", icon: WifiOff, label: "Sesiune Expirată" },
};

export const jobStatusConfig: Record<
  JobStatus,
  { color: string; icon: typeof CheckCircle2; label: string }
> = {
  success: { color: "#10b981", icon: CheckCircle2, label: "Succes" },
  running: { color: "#3b82f6", icon: RotateCcw, label: "Rulează" },
  failed: { color: "#ef4444", icon: XCircle, label: "Eșuat" },
};

export const auditTypeLabels: Record<AuditType, string> = {
  create: "Creare",
  update: "Editare",
  delete: "Ștergere",
  view: "Vizualizare",
  security: "Securitate",
};

export const liveEventColors: Record<string, string> = {
  request: "#10b981",
  auth: "#3b82f6",
  system: "#8b5cf6",
  error: "#ef4444",
};

// ============================================================================
// Mock Data
// ============================================================================

export const uptimeData = [
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

export const responseTimeData = [
  { time: "00:00", api: 120, db: 45, cache: 8 },
  { time: "04:00", api: 95, db: 38, cache: 5 },
  { time: "08:00", api: 180, db: 62, cache: 12 },
  { time: "12:00", api: 210, db: 78, cache: 15 },
  { time: "16:00", api: 165, db: 55, cache: 9 },
  { time: "20:00", api: 140, db: 48, cache: 7 },
  { time: "24:00", api: 110, db: 40, cache: 6 },
];

export const errorRateData = [
  { time: "00:00", "4xx": 3, "5xx": 0 },
  { time: "04:00", "4xx": 1, "5xx": 0 },
  { time: "08:00", "4xx": 12, "5xx": 2 },
  { time: "12:00", "4xx": 18, "5xx": 1 },
  { time: "16:00", "4xx": 8, "5xx": 0 },
  { time: "20:00", "4xx": 5, "5xx": 1 },
  { time: "24:00", "4xx": 2, "5xx": 0 },
];

export const requestsPerHour = [
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

export const initialAlerts: SystemAlert[] = [
  {
    id: "a1",
    severity: "warning",
    title: "Latență ridicată — Email Service",
    message: "Timpul de răspuns SMTP depășește 500ms de 15 minute.",
    time: "acum 15 min",
    acknowledged: false,
  },
  {
    id: "a3",
    severity: "critical",
    title: "3 Login attempts eșuate — admin@primaria.ro",
    message: "Au fost detectate 3 încercări consecutive eșuate de autentificare.",
    time: "acum 45 min",
    acknowledged: false,
  },
  {
    id: "a4",
    severity: "warning",
    title: "Storage aproape de limită",
    message: "Utilizare storage la 87% — se recomandă curățarea fișierelor vechi.",
    time: "acum 3 ore",
    acknowledged: false,
  },
];

export const liveEventPool: Omit<LiveEvent, "id" | "time">[] = [
  { type: "request", message: "GET /api/cereri — 200 OK (42ms)" },
  { type: "request", message: "POST /api/plati/validate — 200 OK (128ms)" },
  { type: "auth", message: "Login: maria.i@primaria.ro — succes (2FA)" },
  { type: "request", message: "GET /api/documente/list — 200 OK (35ms)" },
  { type: "system", message: "Cache invalidation — cereri_recent (Redis)" },
  { type: "request", message: "PUT /api/cereri/1852/status — 200 OK (89ms)" },
  { type: "error", message: "POST /api/plati/process — 502 Gateway Timeout" },
  { type: "request", message: "GET /api/users/profile — 200 OK (18ms)" },
  { type: "auth", message: "Login: dan.p@primaria.ro — succes" },
  { type: "system", message: "Worker: email_digest — procesare 12 notificări" },
  { type: "request", message: "GET /api/monitorizare/health — 200 OK (5ms)" },
];

export const services: {
  name: string;
  icon: typeof Globe;
  status: ServiceStatus;
  latency: number;
  uptime: string;
  description: string;
  lastCheck: string;
}[] = [
  {
    name: "API Gateway",
    icon: Globe,
    status: "operational",
    latency: 45,
    uptime: "99.99%",
    description: "Intrarea principală HTTP",
    lastCheck: "Acum",
  },
  {
    name: "Supabase Auth",
    icon: Lock,
    status: "operational",
    latency: 120,
    uptime: "99.98%",
    description: "Autentificare JWT & MFA",
    lastCheck: "Acum",
  },
  {
    name: "Bază de Date",
    icon: Database,
    status: "operational",
    latency: 24,
    uptime: "99.99%",
    description: "PostgreSQL + RLS",
    lastCheck: "Acum",
  },
  {
    name: "Storage",
    icon: HardDrive,
    status: "operational",
    latency: 185,
    uptime: "99.95%",
    description: "Documente, imagini, arhive",
    lastCheck: "1m",
  },
  {
    name: "SendGrid Email",
    icon: Inbox,
    status: "operational",
    latency: 450,
    uptime: "99.90%",
    description: "Email tranzacțional",
    lastCheck: "5m",
  },
  {
    name: "Ghișeul.ro API",
    icon: Zap,
    status: "maintenance",
    latency: 0,
    uptime: "98.50%",
    description: "Plăți trezorerie",
    lastCheck: "10m",
  },
  {
    name: "Redis Cache",
    icon: Layers,
    status: "operational",
    latency: 8,
    uptime: "100%",
    description: "Cache cataloage",
    lastCheck: "Acum",
  },
  {
    name: "Generator PDF",
    icon: FileText,
    status: "degraded",
    latency: 1250,
    uptime: "99.20%",
    description: "Certificate & acte",
    lastCheck: "30s",
  },
  {
    name: "Realtime Socket",
    icon: Bell,
    status: "operational",
    latency: 15,
    uptime: "99.99%",
    description: "WebSocket notificări",
    lastCheck: "Acum",
  },
  {
    name: "Meilisearch",
    icon: Search,
    status: "operational",
    latency: 42,
    uptime: "99.90%",
    description: "Căutare indexată",
    lastCheck: "2m",
  },
  {
    name: "Worker Jobs",
    icon: Settings,
    status: "operational",
    latency: 65,
    uptime: "99.95%",
    description: "Procesare async, cron",
    lastCheck: "Acum",
  },
  {
    name: "Audit Logger",
    icon: Shield,
    status: "operational",
    latency: 12,
    uptime: "100%",
    description: "Jurnalizare WORM",
    lastCheck: "Acum",
  },
];

export const securityEvents: {
  id: string;
  type: SecEventType;
  user: string;
  ip: string;
  time: string;
  details: string;
}[] = [
  {
    id: "s1",
    type: "login_fail",
    user: "admin@primaria.ro",
    ip: "89.123.*.*",
    time: "14:32",
    details: "Parolă incorectă — tentativa 3",
  },
  {
    id: "s2",
    type: "login_success",
    user: "maria.i@primaria.ro",
    ip: "86.12.*.*",
    time: "14:28",
    details: "MFA Validat (2FA)",
  },
  {
    id: "s3",
    type: "permission_denied",
    user: "j.doe@example.com",
    ip: "92.14.*.*",
    time: "13:45",
    details: "Acces /admin blocat",
  },
  {
    id: "s4",
    type: "ip_block",
    user: "—",
    ip: "194.2.*.*",
    time: "12:10",
    details: "Rate limit depășit (>100 req/min)",
  },
  {
    id: "s5",
    type: "brute_force",
    user: "necunoscut",
    ip: "194.2.*.*",
    time: "12:08",
    details: "15 failed logins / 5min",
  },
  {
    id: "s6",
    type: "rule_change",
    user: "system",
    ip: "localhost",
    time: "10:00",
    details: "Actualizare RLS Policy",
  },
  {
    id: "s7",
    type: "login_success",
    user: "o.mihai@primaria.ro",
    ip: "89.123.*.*",
    time: "09:15",
    details: "Login standard",
  },
  {
    id: "s8",
    type: "timeout",
    user: "a.popa@primaria.ro",
    ip: "82.76.*.*",
    time: "08:30",
    details: "Inactivitate >30m",
  },
];

export const scheduledJobs: {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  duration: string;
  status: JobStatus;
}[] = [
  {
    id: "j1",
    name: "Sincronizare Ghișeul",
    schedule: "0 0 * * *",
    lastRun: "00:00:00",
    nextRun: "Mâine 00:00",
    duration: "1.2s",
    status: "success",
  },
  {
    id: "j2",
    name: "Curățare tokeni expirați",
    schedule: "0 * * * *",
    lastRun: "15:00:00",
    nextRun: "16:00:00",
    duration: "0.4s",
    status: "success",
  },
  {
    id: "j3",
    name: "Backup Bază Date",
    schedule: "0 2 * * 0",
    lastRun: "Duminică",
    nextRun: "Duminică",
    duration: "45.2s",
    status: "success",
  },
  {
    id: "j4",
    name: "Indexare Documente",
    schedule: "*/15 * * * *",
    lastRun: "15:15:00",
    nextRun: "15:30:00",
    duration: "2.1s",
    status: "running",
  },
  {
    id: "j5",
    name: "Generare Rapoarte",
    schedule: "0 1 1 * *",
    lastRun: "1 Mar",
    nextRun: "1 Apr",
    duration: "128s",
    status: "failed",
  },
];

export const auditLog: {
  id: string;
  time: string;
  user: string;
  action: string;
  type: AuditType;
  ip: string;
  details?: string;
  color: string;
}[] = [
  {
    id: "au1",
    time: "14:32",
    user: "O. Mihai",
    action: "Aprobare cerere #4892 — schimbat status",
    type: "update",
    ip: "89.123.*.*",
    details: "Cerere urbanistică aprobată",
    color: "#3b82f6",
  },
  {
    id: "au2",
    time: "12:15",
    user: "B. Abbasi",
    action: "Eliminat cont ion.popescu@...",
    type: "delete",
    ip: "82.44.*.*",
    details: "Account cleanup",
    color: "#ef4444",
  },
  {
    id: "au3",
    time: "10:05",
    user: "System",
    action: "Auto-arhivare 142 documente vechi",
    type: "update",
    ip: "localhost",
    color: "#8b5cf6",
  },
  {
    id: "au4",
    time: "09:45",
    user: "Admin",
    action: "Modificat culoare accent la Indigo",
    type: "update",
    ip: "89.123.*.*",
    details: "Theme change",
    color: "#6366f1",
  },
  {
    id: "au5",
    time: "09:30",
    user: "C. Dinescu",
    action: "Vizualizat plată #99321",
    type: "view",
    ip: "81.18.*.*",
    color: "#10b981",
  },
  {
    id: "au6",
    time: "08:15",
    user: "System",
    action: "Aplicat migrarea 0015_add_indexes",
    type: "security",
    ip: "localhost",
    details: "DB migration applied",
    color: "#f59e0b",
  },
  {
    id: "au7",
    time: "08:00",
    user: "O. Mihai",
    action: "Creat cont funcționar maria.v@",
    type: "create",
    ip: "89.123.*.*",
    color: "#3b82f6",
  },
  {
    id: "au8",
    time: "07:30",
    user: "System",
    action: "Backup automat completat",
    type: "update",
    ip: "localhost",
    color: "#8b5cf6",
  },
  {
    id: "au9",
    time: "07:00",
    user: "A. Popa",
    action: "Export raport activitate Q1",
    type: "view",
    ip: "92.14.*.*",
    color: "#10b981",
  },
  {
    id: "au10",
    time: "06:00",
    user: "System",
    action: "Cleanup sesiuni expirate (24)",
    type: "security",
    ip: "localhost",
    color: "#f59e0b",
  },
  {
    id: "au11",
    time: "05:30",
    user: "System",
    action: "Regenerare certificat SSL",
    type: "security",
    ip: "localhost",
    details: "Cert auto-renewal",
    color: "#f59e0b",
  },
  {
    id: "au12",
    time: "05:00",
    user: "Admin",
    action: "Activare 2FA obligatoriu",
    type: "security",
    ip: "89.123.*.*",
    details: "Security policy update",
    color: "#ef4444",
  },
];

// ============================================================================
// Shared Components
// ============================================================================

export function GlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5"
      style={{
        background: "rgba(20,20,36,0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(139,92,246,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {label && (
        <div className="mb-1.5 text-gray-300" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
          {label}
        </div>
      )}
      {payload.map((p) => (
        <div
          key={p.name}
          className="mb-0.5 flex items-center gap-2"
          style={{ fontSize: "0.78rem" }}
        >
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: p.color, boxShadow: `0 0 6px ${p.color}60` }}
          />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white" style={{ fontWeight: 600 }}>
            {p.value}
            {p.name === "Uptime" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CircularGauge({
  value,
  max,
  color,
  label,
  unit,
  size = 72,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  unit: string;
  size?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={5}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white" style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}>
            {Math.round(value)}
          </span>
          <span className="text-gray-500" style={{ fontSize: "0.58rem" }}>
            {unit}
          </span>
        </div>
      </div>
      <span className="mt-1 text-gray-500" style={{ fontSize: "0.68rem" }}>
        {label}
      </span>
    </div>
  );
}
