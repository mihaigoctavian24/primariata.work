"use client";

import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  UserX, 
  CheckCircle, 
  Lock, 
  Shield, 
  WifiOff, 
  Search, 
  FileText, 
  Clock, 
  Eye, 
  Settings 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Security Events Log
// ============================================================================

const secEventConfig: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  login_fail: { color: "text-red-400 bg-red-500/10", icon: UserX, label: "Autentificare Eșuată" },
  login_success: { color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle, label: "Autentificare Reușită" },
  permission_denied: { color: "text-amber-400 bg-amber-500/10", icon: Lock, label: "Eroare Permisiune" },
  brute_force: { color: "text-red-500 bg-red-500/20", icon: ShieldAlert, label: "Atac Brute Force" },
  rule_change: { color: "text-blue-400 bg-blue-500/10", icon: Shield, label: "Modificare Securitate" },
  timeout: { color: "text-gray-400 bg-gray-500/10", icon: WifiOff, label: "Sesiune Expirată" },
};

const securityEvents = [
  { id: "1", type: "login_fail", user: "admin@primariata.work", ip: "89.123.*.*", time: "Acum 2 min", details: "Parolă incorectă" },
  { id: "2", type: "login_success", user: "o.mihai@primariata.work", ip: "86.12.*.*", time: "Acum 15 min", details: "MFA Validat" },
  { id: "3", type: "permission_denied", user: "j.doe@example.com", ip: "92.14.*.*", time: "Acum 1h 20m", details: "Acces /admin blocat" },
  { id: "4", type: "rule_change", user: "system", ip: "localhost", time: "Acum 3h", details: "Actualizare RLS Policy" },
  { id: "5", type: "brute_force", user: "necunoscut", ip: "194.2.*.*", time: "Acum 5h", details: "15 failed logins / 5min" },
  { id: "6", type: "timeout", user: "a.popa@primariata.work", ip: "82.76.*.*", time: "Ieri", details: "Inactivitate >30m" },
];

export function SecurityEventsLog() {
  return (
    <div className="bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 transition-all">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold">Evenimente Securitate</h3>
          <p className="text-xs text-muted-foreground mt-1">Ultimele alerte și logări în sistem</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Caută IP sau user..." 
            className="bg-white/[0.03] border border-white/[0.05] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 w-[200px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {securityEvents.map((evt, idx) => {
          const config = secEventConfig[evt.type];
          const Icon = config?.icon || Shield;
          
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors"
            >
              <div className={cn("p-2 rounded-lg mt-0.5", config?.color || "text-gray-400 bg-gray-500/10")}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{config?.label || evt.type}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{evt.time}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="text-foreground/80">{evt.user}</span>
                  <span>IP: {evt.ip}</span>
                  <span className="text-accent-400">{evt.details}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-t border-white/[0.05]">
        Vezi toate evenimentele (142)
      </button>
    </div>
  );
}

// ============================================================================
// Scheduled Jobs Table
// ============================================================================

// Scheduled jobs: static mock data — real pg_cron integration deferred
const scheduledJobs = [
  { id: "j1", name: "Sincronizare Ghișeul", schedule: "0 0 * * *", lastRun: "00:00:00", nextRun: "Mâine 00:00", duration: "1.2s", status: "success" },
  { id: "j2", name: "Curățare tokeni expirați", schedule: "0 * * * *", lastRun: "15:00:00", nextRun: "16:00:00", duration: "0.4s", status: "success" },
  { id: "j3", name: "Backup Bază Date", schedule: "0 2 * * 0", lastRun: "Duminică", nextRun: "Duminică", duration: "45.2s", status: "success" },
  { id: "j4", name: "Indexare Documente", schedule: "*/15 * * * *", lastRun: "15:15:00", nextRun: "15:30:00", duration: "2.1s", status: "running" },
  { id: "j5", name: "Generare Rapoarte Lunare", schedule: "0 1 1 * *", lastRun: "1 Mar", nextRun: "1 Apr", duration: "128s", status: "failed" },
];

export function ScheduledJobsTable() {
  return (
    <div className="bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 transition-all w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold">Scheduled Jobs (pg_cron)</h3>
          <p className="text-xs text-muted-foreground mt-1">Sarcini automate background</p>
        </div>
        <button className="bg-white/[0.05] hover:bg-white/10 text-xs px-3 py-1.5 rounded-lg transition-colors">
          Rulează Acum
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-white/[0.02] border-y border-white/[0.05]">
            <tr>
              <th className="px-4 py-3 font-medium">Nume Job</th>
              <th className="px-4 py-3 font-medium">Program (Cron)</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Ultima Rulare</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Următoarea</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Durată</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {scheduledJobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-medium">{job.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{job.schedule}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{job.lastRun}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{job.nextRun}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">{job.duration}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider inline-block",
                    job.status === "success" && "bg-emerald-500/10 text-emerald-400",
                    job.status === "running" && "bg-blue-500/10 text-blue-400 animate-pulse",
                    job.status === "failed" && "bg-red-500/10 text-red-400"
                  )}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Audit Log Table
// ============================================================================

// Audit log: static mock data — real DB table connection deferred
const auditLog = [
  { id: "a1", time: "2026-03-08 14:32:15", user: "o.mihai@primariata.work", action: "UPDATE_CERERE_STATUS", type: "cereri", details: "Status cerere #4892 schimbat în 'Aprobată'", ip: "89.123.*.*" },
  { id: "a2", time: "2026-03-08 12:15:00", user: "b.abbasi@primariata.work", action: "DELETE_USER", type: "utilizatori", details: "Eliminat cont ion.popescu@...", ip: "82.44.*.*" },
  { id: "a3", time: "2026-03-08 10:05:22", user: "system", action: "AUTO_ARCHIVE_DOCS", type: "documente", details: "Arhivat 142 documente vechi", ip: "localhost" },
  { id: "a4", time: "2026-03-07 18:45:10", user: "admin@primariata.work", action: "UPDATE_SETTINGS", type: "configurari", details: "Modificat culoare accent sistem la Indigo", ip: "89.123.*.*" },
  { id: "a5", time: "2026-03-07 16:30:00", user: "c.dinescu@primariata.work", action: "VIEW_PAYMENT", type: "financiar", details: "Vizualizat plată #99321", ip: "81.18.*.*" },
  { id: "a6", time: "2026-03-07 14:22:45", user: "system", action: "MIGRATE_DB", type: "securitate", details: "Aplicat migrarea 0015_add_indexes", ip: "localhost" },
  { id: "a7", time: "2026-03-07 09:15:10", user: "o.mihai@primariata.work", action: "CREATE_USER", type: "utilizatori", details: "Creat cont funcționar maria.v@", ip: "89.123.*.*" },
];

const typeColorConfig: Record<string, string> = {
  cereri: "bg-blue-500/10 text-blue-400",
  utilizatori: "bg-emerald-500/10 text-emerald-400",
  documente: "bg-amber-500/10 text-amber-400",
  configurari: "bg-indigo-500/10 text-indigo-400",
  financiar: "bg-emerald-500/10 text-emerald-400",
  securitate: "bg-red-500/10 text-red-400",
};

export function AuditLogTable() {
  return (
    <div className="bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 transition-all w-full overflow-hidden flex flex-col min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold">Audit Log Global</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Jurnal imutabil al tuturor acțiunilor sensibile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 text-muted-foreground sm:w-[150px]">
            <option value="toate">Toate Tipurile</option>
            <option value="cereri">Cereri</option>
            <option value="utilizatori">Utilizatori</option>
            <option value="documente">Documente</option>
            <option value="securitate">Securitate</option>
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Caută în log..." 
              className="bg-white/[0.03] border border-white/[0.05] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 w-full sm:w-[200px]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-muted-foreground bg-white/[0.02] border-y border-white/[0.05]">
            <tr>
              <th className="px-4 py-3 font-medium">Dată / Oră</th>
              <th className="px-4 py-3 font-medium">Utilizator</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Acțiune / Detalii</th>
              <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">IP Adresă</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {auditLog.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-muted-foreground text-xs">{log.time}</td>
                <td className="px-4 py-3 font-medium text-xs">{log.user}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider",
                    typeColorConfig[log.type] || "bg-gray-500/10 text-gray-400"
                  )}>
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[300px] truncate">
                  <span className="font-mono text-xs opacity-70 block mb-0.5">{log.action}</span>
                  <span className="text-muted-foreground">{log.details}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground text-right hidden sm:table-cell">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.05] text-xs text-muted-foreground">
        <span>Afișare 1-7 din 1,245 rezultate</span>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-white/[0.05] hover:bg-white/[0.05] disabled:opacity-50" disabled>Anterior</button>
          <button className="px-3 py-1.5 rounded-lg border border-white/[0.05] hover:bg-white/[0.05]">Următor</button>
        </div>
      </div>
    </div>
  );
}
