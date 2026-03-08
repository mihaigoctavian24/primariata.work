import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Activity, Server, Cpu, HardDrive, Wifi, Users,
  Clock, AlertTriangle, CheckCircle2, TrendingUp,
  Globe, Database, Shield, Zap, RefreshCcw, Search,
  ChevronLeft, ChevronRight, Filter, Eye, XCircle,
  BarChart3, Bug, Lock, Unlock, UserX, ShieldAlert,
  Calendar, Play, Pause, AlertCircle, Info,
  Timer, ArrowUpDown, Radio, Layers, FileText,
  Terminal, Inbox, Settings, Trash2, RotateCcw,
  WifiOff, CheckCircle, ArrowDown, ArrowUp, X, Bell,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, LineChart, Line,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────

const uptimeData = [
  { time: "00:00", value: 100 }, { time: "02:00", value: 100 }, { time: "04:00", value: 99.9 },
  { time: "06:00", value: 100 }, { time: "08:00", value: 100 }, { time: "10:00", value: 99.8 },
  { time: "12:00", value: 100 }, { time: "14:00", value: 100 }, { time: "16:00", value: 100 },
  { time: "18:00", value: 99.9 }, { time: "20:00", value: 100 }, { time: "22:00", value: 100 },
];

const responseTimeData = [
  { time: "00:00", api: 120, db: 45, cache: 8 }, { time: "04:00", api: 95, db: 38, cache: 5 },
  { time: "08:00", api: 180, db: 62, cache: 12 }, { time: "12:00", api: 210, db: 78, cache: 15 },
  { time: "16:00", api: 165, db: 55, cache: 9 }, { time: "20:00", api: 140, db: 48, cache: 7 },
  { time: "24:00", api: 110, db: 40, cache: 6 },
];

const errorRateData = [
  { time: "00:00", "4xx": 3, "5xx": 0 }, { time: "04:00", "4xx": 1, "5xx": 0 },
  { time: "08:00", "4xx": 12, "5xx": 2 }, { time: "12:00", "4xx": 18, "5xx": 1 },
  { time: "16:00", "4xx": 8, "5xx": 0 }, { time: "20:00", "4xx": 5, "5xx": 1 },
  { time: "24:00", "4xx": 2, "5xx": 0 },
];

const requestsPerHour = [
  { hour: "06", requests: 120 }, { hour: "08", requests: 450 }, { hour: "10", requests: 680 },
  { hour: "12", requests: 520 }, { hour: "14", requests: 710 }, { hour: "16", requests: 590 },
  { hour: "18", requests: 320 }, { hour: "20", requests: 180 }, { hour: "22", requests: 90 },
];

type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency: number;
  uptime: string;
  lastCheck: string;
  icon: any;
  description: string;
}

const services: ServiceHealth[] = [
  { name: "API Gateway", status: "operational", latency: 42, uptime: "99.99%", lastCheck: "acum 30s", icon: Globe, description: "Endpoint principal REST API" },
  { name: "Auth Service", status: "operational", latency: 28, uptime: "100%", lastCheck: "acum 30s", icon: Lock, description: "Autentificare & sesiuni JWT" },
  { name: "Database Primară", status: "operational", latency: 12, uptime: "99.98%", lastCheck: "acum 15s", icon: Database, description: "PostgreSQL — date principale" },
  { name: "Storage Files", status: "operational", latency: 85, uptime: "99.95%", lastCheck: "acum 1m", icon: HardDrive, description: "Object storage documente" },
  { name: "Email Service", status: "degraded", latency: 520, uptime: "98.7%", lastCheck: "acum 30s", icon: Inbox, description: "SMTP — notificări & confirmări" },
  { name: "Payment Gateway", status: "operational", latency: 145, uptime: "99.96%", lastCheck: "acum 45s", icon: Zap, description: "Integrare Netopia/BT Pay" },
  { name: "Cache Redis", status: "operational", latency: 3, uptime: "100%", lastCheck: "acum 15s", icon: Layers, description: "Cache sesiuni & date frecvente" },
  { name: "PDF Generator", status: "maintenance", latency: 0, uptime: "—", lastCheck: "acum 2h", icon: FileText, description: "Generare certificate & documente" },
  { name: "Notification Hub", status: "operational", latency: 35, uptime: "99.99%", lastCheck: "acum 30s", icon: Bell, description: "Push, SMS, in-app notifications" },
  { name: "Search Index", status: "operational", latency: 18, uptime: "99.97%", lastCheck: "acum 1m", icon: Search, description: "Elasticsearch — căutare rapidă" },
  { name: "Background Jobs", status: "operational", latency: 0, uptime: "100%", lastCheck: "acum 30s", icon: Settings, description: "Worker queue — procesare async" },
  { name: "Audit Logger", status: "operational", latency: 8, uptime: "100%", lastCheck: "acum 15s", icon: Shield, description: "Logare acțiuni & compliance" },
];

const statusStyles: Record<ServiceStatus, { color: string; bg: string; label: string }> = {
  operational: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Operațional" },
  degraded: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Degradat" },
  down: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Oprit" },
  maintenance: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Mentenanță" },
};

type AlertSeverity = "critical" | "warning" | "info";

interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  service: string;
  time: string;
  acknowledged: boolean;
}

const systemAlerts: SystemAlert[] = [
  { id: "a1", severity: "warning", title: "Latență ridicată — Email Service", message: "Timpul de răspuns SMTP depășește 500ms de 15 minute. Posibilă supraîncărcare furnizor.", service: "Email Service", time: "acum 15 min", acknowledged: false },
  { id: "a2", severity: "info", title: "PDF Generator — Mentenanță planificată", message: "Serviciul de generare PDF este în mentenanță programată până la 18:00.", service: "PDF Generator", time: "acum 2 ore", acknowledged: true },
  { id: "a3", severity: "critical", title: "3 Login attempts eșuate — admin@primaria.ro", message: "Au fost detectate 3 încercări consecutive eșuate de autentificare pentru contul de administrator principal.", service: "Auth Service", time: "acum 45 min", acknowledged: false },
  { id: "a4", severity: "warning", title: "Storage aproape de limită", message: "Utilizare storage la 87% — se recomandă extinderea sau curățarea fișierelor vechi.", service: "Storage Files", time: "acum 3 ore", acknowledged: false },
  { id: "a5", severity: "info", title: "Backup zilnic completat", message: "Backup-ul automat al bazei de date s-a finalizat cu succes (24.7 GB, durată: 3m42s).", service: "Database Primară", time: "acum 6 ore", acknowledged: true },
];

const alertSeverityConfig: Record<AlertSeverity, { color: string; icon: any; bg: string }> = {
  critical: { color: "#ef4444", icon: XCircle, bg: "rgba(239,68,68,0.06)" },
  warning: { color: "#f59e0b", icon: AlertTriangle, bg: "rgba(245,158,11,0.06)" },
  info: { color: "#3b82f6", icon: Info, bg: "rgba(59,130,246,0.06)" },
};

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  duration: string;
  status: "success" | "running" | "failed" | "scheduled";
}

const scheduledJobs: ScheduledJob[] = [
  { id: "j1", name: "Backup Database", schedule: "Zilnic 03:00", lastRun: "4 Mar, 03:00", nextRun: "5 Mar, 03:00", duration: "3m 42s", status: "success" },
  { id: "j2", name: "Cleanup Temp Files", schedule: "Zilnic 04:00", lastRun: "4 Mar, 04:00", nextRun: "5 Mar, 04:00", duration: "28s", status: "success" },
  { id: "j3", name: "Sync Registre Externe", schedule: "La 6 ore", lastRun: "4 Mar, 12:00", nextRun: "4 Mar, 18:00", duration: "1m 15s", status: "running" },
  { id: "j4", name: "Generare Rapoarte Zilnice", schedule: "Zilnic 06:00", lastRun: "4 Mar, 06:00", nextRun: "5 Mar, 06:00", duration: "2m 08s", status: "success" },
  { id: "j5", name: "Email Digest Funcționari", schedule: "Zilnic 07:30", lastRun: "4 Mar, 07:30", nextRun: "5 Mar, 07:30", duration: "45s", status: "success" },
  { id: "j6", name: "Verificare Certificat SSL", schedule: "Zilnic 00:00", lastRun: "4 Mar, 00:00", nextRun: "5 Mar, 00:00", duration: "2s", status: "success" },
  { id: "j7", name: "Notificări Deadline Cereri", schedule: "La 2 ore", lastRun: "4 Mar, 14:00", nextRun: "4 Mar, 16:00", duration: "12s", status: "failed" },
  { id: "j8", name: "Index Search Update", schedule: "La 30 min", lastRun: "4 Mar, 15:30", nextRun: "4 Mar, 16:00", duration: "8s", status: "success" },
];

const jobStatusConfig: Record<string, { color: string; icon: any; label: string }> = {
  success: { color: "#10b981", icon: CheckCircle2, label: "Succes" },
  running: { color: "#3b82f6", icon: RotateCcw, label: "Rulează" },
  failed: { color: "#ef4444", icon: XCircle, label: "Eșuat" },
  scheduled: { color: "#6b7280", icon: Clock, label: "Programat" },
};

interface SecurityEvent {
  id: string;
  type: "login_fail" | "login_success" | "permission_denied" | "password_change" | "role_change" | "ip_block" | "2fa_enable";
  user: string;
  ip: string;
  time: string;
  details: string;
}

const securityEvents: SecurityEvent[] = [
  { id: "s1", type: "login_fail", user: "admin@primaria.ro", ip: "185.45.12.87", time: "16:48", details: "Parolă incorectă — încercare 3/5" },
  { id: "s2", type: "login_fail", user: "admin@primaria.ro", ip: "185.45.12.87", time: "16:47", details: "Parolă incorectă — încercare 2/5" },
  { id: "s3", type: "login_success", user: "elena.d@primaria.ro", ip: "86.120.45.23", time: "16:42", details: "Autentificare reușită cu 2FA" },
  { id: "s4", type: "role_change", user: "elena.d@primaria.ro", ip: "86.120.45.23", time: "16:40", details: "A modificat rolul: George R. → Funcționar" },
  { id: "s5", type: "permission_denied", user: "ion.p@primaria.ro", ip: "86.120.45.24", time: "16:30", details: "Acces interzis la /admin/settings — lipsă permisiuni" },
  { id: "s6", type: "login_success", user: "maria.i@primaria.ro", ip: "79.112.33.41", time: "16:20", details: "Autentificare reușită — sesiune nouă" },
  { id: "s7", type: "password_change", user: "dan.p@primaria.ro", ip: "86.120.45.25", time: "15:50", details: "Schimbare parolă — inițiată de utilizator" },
  { id: "s8", type: "2fa_enable", user: "ana.m@primaria.ro", ip: "79.112.33.42", time: "15:30", details: "2FA activat — authenticator app" },
  { id: "s9", type: "ip_block", user: "—", ip: "203.0.113.42", time: "15:15", details: "IP blocat automat — 10 încercări eșuate în 5 min" },
  { id: "s10", type: "login_fail", user: "unknown@test.com", ip: "203.0.113.42", time: "15:14", details: "Cont inexistent — tentativă de acces" },
];

const secEventConfig: Record<string, { color: string; icon: any; label: string }> = {
  login_fail: { color: "#ef4444", icon: UserX, label: "Login eșuat" },
  login_success: { color: "#10b981", icon: CheckCircle, label: "Login OK" },
  permission_denied: { color: "#f59e0b", icon: ShieldAlert, label: "Acces interzis" },
  password_change: { color: "#3b82f6", icon: Lock, label: "Schimbare parolă" },
  role_change: { color: "#8b5cf6", icon: Shield, label: "Schimbare rol" },
  ip_block: { color: "#ef4444", icon: WifiOff, label: "IP blocat" },
  "2fa_enable": { color: "#10b981", icon: Lock, label: "2FA activat" },
};

type AuditType = "role" | "cerere" | "doc" | "system" | "user" | "view" | "config" | "security" | "payment";

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

const auditLog: AuditEntry[] = [
  { id: "al1", time: "16:42", user: "Elena D.", action: "A modificat rolul lui George R. → Funcționar", type: "role", color: "#8b5cf6", ip: "86.120.45.23", details: "Rol anterior: Cetățean" },
  { id: "al2", time: "16:38", user: "Ion P.", action: "A aprobat cererea #1852", type: "cerere", color: "#10b981", ip: "86.120.45.24", details: "Tip: Certificat Fiscal" },
  { id: "al3", time: "16:20", user: "Maria I.", action: "A încărcat document — Aviz_Mediu.pdf (2.4MB)", type: "doc", color: "#3b82f6", ip: "79.112.33.41" },
  { id: "al4", time: "15:55", user: "System", action: "Backup automat completat cu succes (24.7GB)", type: "system", color: "#6b7280", ip: "127.0.0.1" },
  { id: "al5", time: "15:30", user: "Elena D.", action: "A suspendat contul Vasile R. — motiv: inactivitate", type: "user", color: "#ef4444", ip: "86.120.45.23", details: "Cont suspendat pe perioadă nedeterminată" },
  { id: "al6", time: "14:45", user: "Ana M.", action: "A respins cererea #1848 — documente incomplete", type: "cerere", color: "#f59e0b", ip: "79.112.33.42", details: "Motiv: lipsă copie CI" },
  { id: "al7", time: "14:20", user: "System", action: "Certificat SSL verificat — valid până la 15 Sep 2026", type: "system", color: "#6b7280", ip: "127.0.0.1" },
  { id: "al8", time: "13:10", user: "Dan P.", action: "Primar — a vizualizat raport buget Q1 2026", type: "view", color: "#f59e0b", ip: "86.120.45.25" },
  { id: "al9", time: "12:45", user: "Elena D.", action: "A modificat configurare primărie — program lucru", type: "config", color: "#06b6d4", ip: "86.120.45.23", details: "Program actualizat: L-V 08:00-16:00" },
  { id: "al10", time: "12:30", user: "System", action: "Plată primită — 1250 RON, Taxă locală, ref. TXN-2026-8452", type: "payment", color: "#10b981", ip: "—" },
  { id: "al11", time: "11:50", user: "Ion P.", action: "A reasignat cererea #1845 către Maria I.", type: "cerere", color: "#3b82f6", ip: "86.120.45.24" },
  { id: "al12", time: "11:20", user: "System", action: "Sync registre externe completat — 3 actualizări", type: "system", color: "#6b7280", ip: "127.0.0.1" },
  { id: "al13", time: "10:40", user: "Ana M.", action: "A generat certificat fiscal pentru contribuabil #4521", type: "doc", color: "#3b82f6", ip: "79.112.33.42" },
  { id: "al14", time: "10:15", user: "Elena D.", action: "A invitat utilizator nou — george.r@primaria.ro", type: "user", color: "#8b5cf6", ip: "86.120.45.23" },
  { id: "al15", time: "09:50", user: "System", action: "Alertă: IP 203.0.113.42 blocat — brute force", type: "security", color: "#ef4444", ip: "127.0.0.1" },
  { id: "al16", time: "09:30", user: "Dan P.", action: "A aprobat buget extindere digitalizare — 15,000 RON", type: "payment", color: "#10b981", ip: "86.120.45.25" },
];

const auditTypeLabels: Record<AuditType, string> = {
  role: "Roluri", cerere: "Cereri", doc: "Documente", system: "Sistem",
  user: "Utilizatori", view: "Vizualizări", config: "Configurare", security: "Securitate", payment: "Plăți",
};

// Live event stream
interface LiveEvent {
  id: string;
  time: string;
  type: "request" | "auth" | "system" | "error";
  message: string;
}

const liveEventPool: Omit<LiveEvent, "id" | "time">[] = [
  { type: "request", message: "GET /api/cereri — 200 OK (42ms)" },
  { type: "request", message: "POST /api/plati/validate — 200 OK (128ms)" },
  { type: "auth", message: "Login: maria.i@primaria.ro — succes (2FA)" },
  { type: "request", message: "GET /api/documente/list — 200 OK (35ms)" },
  { type: "system", message: "Cache invalidation — cereri_recent (Redis)" },
  { type: "request", message: "PUT /api/cereri/1852/status — 200 OK (89ms)" },
  { type: "error", message: "POST /api/plati/process — 502 Gateway Timeout" },
  { type: "request", message: "GET /api/users/profile — 200 OK (18ms)" },
  { type: "auth", message: "Token refresh: ion.p@primaria.ro" },
  { type: "system", message: "Worker: email_digest — procesare 12 notificări" },
  { type: "request", message: "GET /api/calendar/events — 200 OK (55ms)" },
  { type: "request", message: "POST /api/documente/upload — 201 Created (340ms)" },
  { type: "auth", message: "Login: dan.p@primaria.ro — succes" },
  { type: "error", message: "SMTP timeout — notificare #4521 în retry queue" },
  { type: "system", message: "Cron: cleanup_temp — 3 fișiere șterse" },
  { type: "request", message: "GET /api/monitorizare/health — 200 OK (5ms)" },
];

const liveEventColors: Record<string, string> = {
  request: "#10b981", auth: "#3b82f6", system: "#8b5cf6", error: "#ef4444",
};

// ─── Chart Tooltip ────────────────────────────────────

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="px-3.5 py-2.5 rounded-xl" style={{
      background: "rgba(20,20,36,0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(139,92,246,0.2)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.08)",
    }}>
      <div className="text-gray-300 mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5" style={{ fontSize: "0.78rem" }}>
          <span className="w-2 h-2 rounded-sm" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}60` }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white" style={{ fontWeight: 600 }}>
            {p.value}{p.name === "Uptime" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Circular Gauge ───────────────────────────────────

function CircularGauge({ value, max, color, label, unit, size = 80 }: { value: number; max: number; color: string; label: string; unit: string; size?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-white" style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}</span>
        <span className="text-gray-500" style={{ fontSize: "0.58rem" }}>{unit}</span>
      </div>
      <span className="text-gray-500 mt-1" style={{ fontSize: "0.68rem" }}>{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────

export function MonitorizarePage() {
  const [cpuUsage, setCpuUsage] = useState(23);
  const [memUsage, setMemUsage] = useState(41);
  const [diskUsage, setDiskUsage] = useState(62);
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "security" | "jobs" | "audit">("overview");
  const [auditFilter, setAuditFilter] = useState<AuditType | "all">("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const [alerts, setAlerts] = useState(systemAlerts);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [livePaused, setLivePaused] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const auditPerPage = 8;

  // Simulate live CPU/MEM/Disk
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(10, Math.min(65, prev + (Math.random() - 0.48) * 8)));
      setMemUsage((prev) => Math.max(30, Math.min(75, prev + (Math.random() - 0.5) * 5)));
      setDiskUsage((prev) => Math.max(55, Math.min(90, prev + (Math.random() - 0.45) * 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Live event stream
  useEffect(() => {
    if (livePaused) return;
    const interval = setInterval(() => {
      const random = liveEventPool[Math.floor(Math.random() * liveEventPool.length)];
      const now = new Date();
      const evt: LiveEvent = {
        id: `le-${Date.now()}`,
        time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
        ...random,
      };
      setLiveEvents((prev) => [evt, ...prev].slice(0, 50));
    }, 2200);
    return () => clearInterval(interval);
  }, [livePaused]);

  // Auto-scroll live events
  useEffect(() => {
    if (liveRef.current) liveRef.current.scrollTop = 0;
  }, [liveEvents]);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success("Alertă confirmată");
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  // Audit filtering
  const filteredAudit = useMemo(() => {
    let result = [...auditLog];
    if (auditFilter !== "all") result = result.filter((a) => a.type === auditFilter);
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      result = result.filter((a) => a.action.toLowerCase().includes(q) || a.user.toLowerCase().includes(q));
    }
    return result;
  }, [auditFilter, auditSearch]);

  const auditTotalPages = Math.ceil(filteredAudit.length / auditPerPage);
  const paginatedAudit = filteredAudit.slice((auditPage - 1) * auditPerPage, auditPage * auditPerPage);

  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => s.status === "down").length;
  const maintenanceCount = services.filter((s) => s.status === "maintenance").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            <Activity className="w-6 h-6 text-emerald-400" /> Monitorizare Sistem
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
            Status platformă, servicii, securitate, jobs & audit — vizualizare Admin
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400" style={{ fontSize: "0.72rem" }}>{operationalCount}/{services.length} Servicii OK</span>
          </div>
          {unacknowledgedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.12)" }}>
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-red-400" style={{ fontSize: "0.72rem" }}>{unacknowledgedCount} Alerte</span>
            </div>
          )}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => toast.success("🔄 Date actualizate")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </motion.button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}>
        {([
          { id: "overview" as const, label: "Prezentare Generală", icon: BarChart3 },
          { id: "services" as const, label: "Servicii", icon: Server, badge: degradedCount + downCount > 0 ? degradedCount + downCount : undefined },
          { id: "security" as const, label: "Securitate", icon: ShieldAlert },
          { id: "jobs" as const, label: "Jobs Programate", icon: Timer },
          { id: "audit" as const, label: "Audit Log", icon: Shield },
        ]).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="monitorTab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.06))", border: "1px solid rgba(16,185,129,0.12)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-emerald-400" : ""}`} />
              <span className="relative z-10" style={{ fontSize: "0.82rem" }}>{tab.label}</span>
              {tab.badge && (
                <span className="relative z-10 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: "#ef4444", fontSize: "0.55rem", fontWeight: 700 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Resource Gauges + Live Metrics */}
            <div className="grid grid-cols-12 gap-5 mb-5">
              {/* Gauges */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="col-span-3 rounded-2xl p-5 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-white self-start mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Resurse Sistem</h3>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {[
                    { value: Math.round(cpuUsage), max: 100, color: cpuUsage > 50 ? "#f59e0b" : "#10b981", label: "CPU", unit: "%" },
                    { value: Math.round(memUsage), max: 100, color: memUsage > 60 ? "#f59e0b" : "#3b82f6", label: "RAM", unit: "%" },
                    { value: Math.round(diskUsage), max: 100, color: diskUsage > 80 ? "#ef4444" : "#8b5cf6", label: "Disk", unit: "%" },
                  ].map((g) => (
                    <div key={g.label} className="relative flex flex-col items-center">
                      <CircularGauge {...g} size={72} />
                    </div>
                  ))}
                </div>
                <div className="w-full mt-4 flex flex-col gap-2">
                  {[
                    { label: "Sesiuni Active", value: 24, icon: Users, color: "#f59e0b" },
                    { label: "Cereri/min", value: 87, icon: Globe, color: "#ec4899" },
                    { label: "Latență API", value: "142ms", icon: Wifi, color: "#06b6d4" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-2">
                        <m.icon className="w-3 h-3" style={{ color: m.color }} />
                        <span className="text-gray-500" style={{ fontSize: "0.72rem" }}>{m.label}</span>
                      </div>
                      <span className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Uptime Chart */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-5 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-white mb-3" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Uptime — Ultimele 24h</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={uptimeData}>
                    <defs>
                      <linearGradient id="uptimeGradM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[99.5, 100.1]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Area type="monotone" dataKey="value" name="Uptime" stroke="#10b981" strokeWidth={2} fill="url(#uptimeGradM)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Alerts Summary */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="col-span-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Alerte Active</h3>
                  <span className="text-gray-600" style={{ fontSize: "0.68rem" }}>{unacknowledgedCount} neconfirmate</span>
                </div>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}>
                  {alerts.filter((a) => !a.acknowledged).map((alert) => {
                    const sc = alertSeverityConfig[alert.severity];
                    const Icon = sc.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 p-2.5 rounded-xl cursor-pointer transition-all hover:brightness-110"
                        style={{ background: sc.bg, border: `1px solid ${sc.color}15` }}
                        onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: sc.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white truncate" style={{ fontSize: "0.78rem" }}>{alert.title}</div>
                          <div className="text-gray-600" style={{ fontSize: "0.65rem" }}>{alert.time}</div>
                          {expandedAlert === alert.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                              <div className="text-gray-400 mt-1.5" style={{ fontSize: "0.72rem" }}>{alert.message}</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); acknowledgeAlert(alert.id); }}
                                className="mt-2 flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer hover:bg-white/5 transition-all text-emerald-400"
                                style={{ fontSize: "0.7rem", fontWeight: 600 }}
                              >
                                <CheckCircle2 className="w-3 h-3" /> Confirmă
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {unacknowledgedCount === 0 && (
                    <div className="flex flex-col items-center py-6 text-gray-600">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400/30 mb-2" />
                      <span style={{ fontSize: "0.82rem" }}>Nicio alertă activă</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-12 gap-5 mb-5">
              {/* Response Times */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-white mb-3" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Timp Răspuns</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Line type="monotone" dataKey="api" name="API" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="db" name="Database" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cache" name="Cache" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Error Rate */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="col-span-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-white mb-3" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Error Rate — 24h</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={errorRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(245,158,11,0.06)", radius: 6 } as any} />
                    <Bar dataKey="4xx" name="4xx Client" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={12} stackId="errors" />
                    <Bar dataKey="5xx" name="5xx Server" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={12} stackId="errors" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Requests per Hour */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-white mb-3" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Cereri pe Oră</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={requestsPerHour}>
                    <defs>
                      <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Area type="monotone" dataKey="requests" name="Cereri" stroke="#ec4899" strokeWidth={2} fill="url(#reqGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Live Event Stream */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Live Event Stream</h3>
                  {!livePaused && (
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600" style={{ fontSize: "0.7rem" }}>{liveEvents.length} events</span>
                  <button onClick={() => setLivePaused(!livePaused)} className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-all text-gray-500 hover:text-white hover:bg-white/5" style={{ fontSize: "0.72rem" }}>
                    {livePaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {livePaused ? "Resume" : "Pause"}
                  </button>
                  <button onClick={() => setLiveEvents([])} className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-all text-gray-500 hover:text-white hover:bg-white/5" style={{ fontSize: "0.72rem" }}>
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>
              <div ref={liveRef} className="max-h-48 overflow-y-auto font-mono" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent", background: "rgba(0,0,0,0.15)" }}>
                <AnimatePresence initial={false}>
                  {liveEvents.slice(0, 20).map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 px-5 py-1.5 hover:bg-white/[0.015] transition-all"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                    >
                      <span className="text-gray-700 shrink-0" style={{ fontSize: "0.68rem" }}>{evt.time}</span>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: liveEventColors[evt.type] }} />
                      <span className="uppercase shrink-0 px-1 py-0.5 rounded" style={{ fontSize: "0.55rem", fontWeight: 600, color: liveEventColors[evt.type], background: `${liveEventColors[evt.type]}10` }}>
                        {evt.type}
                      </span>
                      <span className={`truncate ${evt.type === "error" ? "text-red-400/80" : "text-gray-500"}`} style={{ fontSize: "0.72rem" }}>{evt.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {liveEvents.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-gray-700" style={{ fontSize: "0.78rem" }}>
                    <Radio className="w-4 h-4 mr-2 opacity-50" /> Se așteaptă evenimente...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ SERVICES TAB ═══ */}
        {activeTab === "services" && (
          <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Status summary */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Operaționale", count: operationalCount, color: "#10b981", icon: CheckCircle2 },
                { label: "Degradate", count: degradedCount, color: "#f59e0b", icon: AlertTriangle },
                { label: "Oprite", count: downCount, color: "#ef4444", icon: XCircle },
                { label: "Mentenanță", count: maintenanceCount, color: "#6b7280", icon: Settings },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  <div>
                    <div className="text-white" style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{s.count}</div>
                    <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-3 gap-3">
              {services.map((svc, i) => {
                const st = statusStyles[svc.status];
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl p-4 cursor-pointer transition-all group"
                    style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${st.color}15` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: st.bg }}>
                          <Icon className="w-4 h-4" style={{ color: st.color }} />
                        </div>
                        <div>
                          <div className="text-white" style={{ fontSize: "0.88rem", fontWeight: 500 }}>{svc.name}</div>
                          <div className="text-gray-600" style={{ fontSize: "0.68rem" }}>{svc.description}</div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: st.color }} />
                        {svc.status === "operational" && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-30" style={{ background: st.color }} />}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>Status</div>
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.68rem", color: st.color, background: `${st.color}12`, fontWeight: 600 }}>{st.label}</span>
                      </div>
                      <div>
                        <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>Latență</div>
                        <div className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{svc.latency > 0 ? `${svc.latency}ms` : "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>Uptime</div>
                        <div className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{svc.uptime}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>Check</div>
                        <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>{svc.lastCheck}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ SECURITY TAB ═══ */}
        {activeTab === "security" && (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Security KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Login-uri Eșuate (24h)", value: securityEvents.filter((e) => e.type === "login_fail").length, color: "#ef4444", icon: UserX },
                { label: "IP-uri Blocate", value: securityEvents.filter((e) => e.type === "ip_block").length, color: "#f59e0b", icon: WifiOff },
                { label: "Sesiuni Active", value: 24, color: "#3b82f6", icon: Users },
                { label: "2FA Activat", value: "78%", color: "#10b981", icon: Lock },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: `${m.color}06`, border: `1px solid ${m.color}12` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${m.color}15` }}>
                    <m.icon className="w-4 h-4" style={{ color: m.color }} />
                  </div>
                  <div>
                    <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
                    <div className="text-gray-500" style={{ fontSize: "0.7rem" }}>{m.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Security Events Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Evenimente Securitate</h3>
                </div>
                <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>Ultimele 24h</span>
              </div>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-white/[0.04]" style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                    className="grid grid-cols-12 gap-2 px-5 py-2.5 items-center hover:bg-white/[0.015] transition-all"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    <div className="col-span-1">
                      <span className="text-gray-600 font-mono" style={{ fontSize: "0.72rem" }}>{evt.time}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ fontSize: "0.65rem", color: cfg.color, background: `${cfg.color}10`, fontWeight: 600 }}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <div className="col-span-3 text-gray-300 truncate" style={{ fontSize: "0.78rem" }}>{evt.user}</div>
                    <div className="col-span-2">
                      <span className="text-gray-500 font-mono" style={{ fontSize: "0.72rem" }}>{evt.ip}</span>
                    </div>
                    <div className="col-span-4 text-gray-500 truncate" style={{ fontSize: "0.75rem" }}>{evt.details}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ═══ JOBS TAB ═══ */}
        {activeTab === "jobs" && (
          <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Jobs KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total Jobs", value: scheduledJobs.length, color: "#3b82f6", icon: Timer },
                { label: "Succes", value: scheduledJobs.filter((j) => j.status === "success").length, color: "#10b981", icon: CheckCircle2 },
                { label: "Rulează", value: scheduledJobs.filter((j) => j.status === "running").length, color: "#3b82f6", icon: RotateCcw },
                { label: "Eșuate", value: scheduledJobs.filter((j) => j.status === "failed").length, color: "#ef4444", icon: XCircle },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: `${m.color}06`, border: `1px solid ${m.color}12` }}>
                  <m.icon className="w-5 h-5" style={{ color: m.color }} />
                  <div>
                    <div className="text-white" style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
                    <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>{m.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Jobs Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Jobs Programate</h3>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-white/[0.04]" style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                const Icon = jc.icon;
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-white/[0.015] transition-all"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    <div className="col-span-3 text-white truncate" style={{ fontSize: "0.85rem" }}>{job.name}</div>
                    <div className="col-span-2 text-gray-400" style={{ fontSize: "0.78rem" }}>{job.schedule}</div>
                    <div className="col-span-2 text-gray-500" style={{ fontSize: "0.75rem" }}>{job.lastRun}</div>
                    <div className="col-span-2 text-gray-500" style={{ fontSize: "0.75rem" }}>{job.nextRun}</div>
                    <div className="col-span-1 text-gray-400" style={{ fontSize: "0.78rem" }}>{job.duration}</div>
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ fontSize: "0.65rem", color: jc.color, background: `${jc.color}12`, fontWeight: 600 }}>
                        <Icon className={`w-3 h-3 ${job.status === "running" ? "animate-spin" : ""}`} /> {jc.label}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => toast.success(`▶️ Job "${job.name}" — rulare manuală inițiată`)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-emerald-400 cursor-pointer transition-all"
                        title="Rulează manual"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toast(`🔍 Log-uri job: ${job.name}`)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white cursor-pointer transition-all"
                        title="Vezi log-uri"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ═══ AUDIT TAB ═══ */}
        {activeTab === "audit" && (
          <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Audit Log — Acțiuni Recente</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Search className="w-3.5 h-3.5 text-gray-500" />
                    <input value={auditSearch} onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }} placeholder="Caută acțiune..." className="bg-transparent text-white placeholder:text-gray-600 outline-none w-44" style={{ fontSize: "0.8rem" }} />
                  </div>
                  <div className="flex gap-0.5 p-0.5 rounded-lg flex-wrap" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <button onClick={() => { setAuditFilter("all"); setAuditPage(1); }} className={`px-2 py-1 rounded-md cursor-pointer transition-all ${auditFilter === "all" ? "text-white" : "text-gray-600"}`} style={auditFilter === "all" ? { background: "rgba(139,92,246,0.15)", fontSize: "0.68rem" } : { fontSize: "0.68rem" }}>
                      Toate
                    </button>
                    {(Object.keys(auditTypeLabels) as AuditType[]).map((t) => (
                      <button key={t} onClick={() => { setAuditFilter(t); setAuditPage(1); }} className={`px-2 py-1 rounded-md cursor-pointer transition-all ${auditFilter === t ? "text-white" : "text-gray-600"}`} style={auditFilter === t ? { background: "rgba(139,92,246,0.15)", fontSize: "0.68rem" } : { fontSize: "0.68rem" }}>
                        {auditTypeLabels[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-white/[0.04]" style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div className="col-span-1">Ora</div>
                <div className="col-span-2">Utilizator</div>
                <div className="col-span-5">Acțiune</div>
                <div className="col-span-1">Tip</div>
                <div className="col-span-2">IP</div>
                <div className="col-span-1">Detalii</div>
              </div>

              <AnimatePresence mode="popLayout">
                {paginatedAudit.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.02 * i }}
                    className="grid grid-cols-12 gap-2 px-5 py-2.5 items-center hover:bg-white/[0.02] transition-all"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    <div className="col-span-1">
                      <span className="text-gray-600 font-mono" style={{ fontSize: "0.75rem" }}>{entry.time}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
                        <span className="text-gray-300" style={{ fontSize: "0.82rem", fontWeight: 500 }}>{entry.user}</span>
                      </div>
                    </div>
                    <div className="col-span-5 text-gray-500 truncate" style={{ fontSize: "0.82rem" }}>{entry.action}</div>
                    <div className="col-span-1">
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.62rem", background: "rgba(255,255,255,0.04)", color: "#9ca3af" }}>{entry.type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 font-mono" style={{ fontSize: "0.68rem" }}>{entry.ip}</span>
                    </div>
                    <div className="col-span-1">
                      {entry.details ? (
                        <button
                          onClick={() => toast(entry.details!, { description: `${entry.user} · ${entry.time}` })}
                          className="p-1 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white cursor-pointer transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-gray-800" style={{ fontSize: "0.68rem" }}>—</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredAudit.length === 0 && (
                <div className="flex items-center justify-center py-10 text-gray-600" style={{ fontSize: "0.85rem" }}>
                  Nicio înregistrare găsită
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
                <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
                  {filteredAudit.length > 0 ? `${(auditPage - 1) * auditPerPage + 1}–${Math.min(auditPage * auditPerPage, filteredAudit.length)} din ${filteredAudit.length}` : "0 rezultate"}
                </span>
                <div className="flex items-center gap-1">
                  <button disabled={auditPage <= 1} onClick={() => setAuditPage(auditPage - 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: auditTotalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setAuditPage(p)} className={`w-7 h-7 rounded-lg cursor-pointer transition-all ${p === auditPage ? "text-white" : "text-gray-600 hover:text-white hover:bg-white/5"}`} style={p === auditPage ? { background: "rgba(139,92,246,0.2)", fontSize: "0.78rem" } : { fontSize: "0.78rem" }}>
                      {p}
                    </button>
                  ))}
                  <button disabled={auditPage >= auditTotalPages} onClick={() => setAuditPage(auditPage + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
