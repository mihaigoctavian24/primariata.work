"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserX, CheckCircle, ShieldAlert, Lock, Shield, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  colorClass: string;
  ip: string;
  details?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SECURITY_EVENTS: SecurityEvent[] = [
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

const AUDIT_LOG: AuditEntry[] = [
  {
    id: "al1",
    time: "16:42",
    user: "Elena D.",
    action: "A modificat rolul lui George R. → Funcționar",
    type: "role",
    colorClass: "text-violet-400",
    ip: "86.120.45.23",
    details: "Rol anterior: Cetățean",
  },
  {
    id: "al2",
    time: "16:38",
    user: "Ion P.",
    action: "A aprobat cererea #1852",
    type: "cerere",
    colorClass: "text-emerald-400",
    ip: "86.120.45.24",
    details: "Tip: Certificat Fiscal",
  },
  {
    id: "al3",
    time: "16:20",
    user: "Maria I.",
    action: "A încărcat document — Aviz_Mediu.pdf (2.4MB)",
    type: "doc",
    colorClass: "text-blue-400",
    ip: "79.112.33.41",
  },
  {
    id: "al4",
    time: "15:55",
    user: "System",
    action: "Backup automat completat cu succes (24.7GB)",
    type: "system",
    colorClass: "text-gray-400",
    ip: "127.0.0.1",
  },
  {
    id: "al5",
    time: "15:30",
    user: "Elena D.",
    action: "A suspendat contul Vasile R. — motiv: inactivitate",
    type: "user",
    colorClass: "text-red-400",
    ip: "86.120.45.23",
    details: "Cont suspendat pe perioadă nedeterminată",
  },
  {
    id: "al6",
    time: "14:45",
    user: "Ana M.",
    action: "A respins cererea #1848 — documente incomplete",
    type: "cerere",
    colorClass: "text-amber-400",
    ip: "79.112.33.42",
    details: "Motiv: lipsă copie CI",
  },
  {
    id: "al7",
    time: "14:20",
    user: "System",
    action: "Certificat SSL verificat — valid până la 15 Sep 2026",
    type: "system",
    colorClass: "text-gray-400",
    ip: "127.0.0.1",
  },
  {
    id: "al8",
    time: "13:10",
    user: "Dan P.",
    action: "Primar — a vizualizat raport buget Q1 2026",
    type: "view",
    colorClass: "text-amber-400",
    ip: "86.120.45.25",
  },
];

// ─── Event config — Tailwind tokens only ────────────────────────────────────

interface EventConfig {
  icon: LucideIcon;
  label: string;
  textClass: string;
  bgClass: string;
}

const secEventConfig: Record<SecurityEventType, EventConfig> = {
  login_fail: {
    icon: UserX,
    label: "Login eșuat",
    textClass: "text-red-400",
    bgClass: "bg-red-400/10",
  },
  login_success: {
    icon: CheckCircle,
    label: "Login OK",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-400/10",
  },
  permission_denied: {
    icon: ShieldAlert,
    label: "Acces interzis",
    textClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
  },
  password_change: {
    icon: Lock,
    label: "Schimbare parolă",
    textClass: "text-blue-400",
    bgClass: "bg-blue-400/10",
  },
  role_change: {
    icon: Shield,
    label: "Schimbare rol",
    textClass: "text-violet-400",
    bgClass: "bg-violet-400/10",
  },
  ip_block: {
    icon: WifiOff,
    label: "IP blocat",
    textClass: "text-red-400",
    bgClass: "bg-red-400/10",
  },
  "2fa_enable": {
    icon: Lock,
    label: "2FA activat",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-400/10",
  },
};

// ─── Filter tabs ─────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "Toate", value: "all" },
  { label: "Login eșuat", value: "login_fail" },
  { label: "Login OK", value: "login_success" },
  { label: "Acces interzis", value: "permission_denied" },
  { label: "IP blocat", value: "ip_block" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function SecurityEventsLog(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredEvents =
    activeFilter === "all"
      ? SECURITY_EVENTS
      : SECURITY_EVENTS.filter((e) => e.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* Security Events */}
      <div>
        {/* Filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[0.73rem] font-medium transition-colors",
                activeFilter === tab.value
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredEvents.map((event) => {
              const cfg = secEventConfig[event.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      cfg.bgClass
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", cfg.textClass)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-[0.62rem] font-semibold",
                          cfg.textClass,
                          cfg.bgClass
                        )}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[0.68rem] text-gray-600">{event.time}</span>
                    </div>
                    <p className="mt-1 truncate text-[0.75rem] text-gray-300">{event.details}</p>
                    <p className="mt-0.5 text-[0.68rem] text-gray-600">
                      {event.user} · {event.ip}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Audit Trail */}
      <div>
        <h3 className="mb-3 text-[0.8rem] font-semibold tracking-wider text-gray-400 uppercase">
          Jurnal Audit
        </h3>
        <div className="space-y-1">
          {AUDIT_LOG.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
            >
              <div
                className={cn(
                  "mt-0.5 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  entry.colorClass.replace("text-", "bg-")
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.75rem] leading-snug text-gray-300">{entry.action}</span>
                </div>
                <p className="mt-0.5 text-[0.68rem] text-gray-600">
                  {entry.user} · {entry.time} · {entry.ip}
                  {entry.details && <span className="ml-1 text-gray-700">— {entry.details}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
