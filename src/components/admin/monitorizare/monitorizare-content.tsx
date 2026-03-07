"use client";

import React from "react";
import { motion } from "motion/react";
import { Activity, RefreshCcw, TrendingUp, Clock, AlertTriangle, Zap } from "lucide-react";
import { stagger, slideIn, defaultTransition } from "@/lib/motion";
import {
  UptimeChart,
  ResponseTimeChart,
  ErrorRateChart,
  RequestsPerHourChart,
} from "./monitorizare-charts";
import { ServicesStatusGrid } from "./services-status-grid";
import { SecurityEventsLog } from "./security-events-log";

// ─── Shared Data Types (exported for page.tsx consumption) ──────────────────

export interface UptimePoint {
  time: string;
  value: number;
}

export interface ResponseTimePoint {
  time: string;
  api: number;
  db: number;
  cache: number;
}

export interface ErrorRatePoint {
  time: string;
  errors4xx: number;
  errors5xx: number;
}

export interface RequestsPerHourPoint {
  hour: string;
  requests: number;
}

export type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency: number;
  uptime: string;
  lastCheck: string;
  /** String key for SERVICE_ICON_MAP in ServicesStatusGrid */
  iconName: string;
  description: string;
}

export interface MonitorizareStats {
  uptimePercent: number;
  avgResponseMs: number;
  errorRatePercent: number;
  activeRequests: number;
}

export interface MonitorizareData {
  uptimeData: UptimePoint[];
  responseTimeData: ResponseTimePoint[];
  errorRateData: ErrorRatePoint[];
  requestsPerHour: RequestsPerHourPoint[];
  services: ServiceHealth[];
  stats: MonitorizareStats;
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.025] p-5 ${className}`}>
      <h2 className="mb-4 text-[0.8rem] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Stat Card (inline — works with decimal values unlike AnimatedCounter) ───

interface StatCardProps {
  icon: typeof Activity;
  label: string;
  value: string;
  subtext?: string;
  accentClass?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accentClass = "text-blue-400",
}: StatCardProps): React.JSX.Element {
  return (
    <motion.div
      variants={slideIn}
      transition={defaultTransition}
      className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.025] p-4"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06]">
          <Icon className={`h-4 w-4 ${accentClass}`} />
        </div>
        <span className="text-[0.73rem] text-gray-500">{label}</span>
      </div>
      <p className="text-[1.6rem] leading-none font-bold text-white">{value}</p>
      {subtext && <p className="text-[0.68rem] text-gray-600">{subtext}</p>}
    </motion.div>
  );
}

// ─── MonitorizareContent ──────────────────────────────────────────────────────

interface MonitorizareContentProps {
  data: MonitorizareData;
}

export function MonitorizareContent({ data }: MonitorizareContentProps): React.JSX.Element {
  const { uptimeData, responseTimeData, errorRateData, requestsPerHour, services, stats } = data;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-pink-400" />
            <h1 className="text-white" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              Monitorizare
            </h1>
          </div>
          <p className="mt-1 text-gray-600" style={{ fontSize: "0.82rem" }}>
            Starea platformei în timp real · date simulate
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2 text-[0.78rem] text-gray-400 transition-colors hover:bg-white/[0.07] hover:text-white">
          <RefreshCcw className="h-3.5 w-3.5" />
          Actualizează
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Disponibilitate"
          value={`${stats.uptimePercent}%`}
          subtext="Ultimele 24h"
          accentClass="text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="Timp răspuns mediu"
          value={`${stats.avgResponseMs}ms`}
          subtext="API Gateway"
          accentClass="text-blue-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Rată erori"
          value={`${stats.errorRatePercent}%`}
          subtext="4xx + 5xx"
          accentClass="text-amber-400"
        />
        <StatCard
          icon={Zap}
          label="Cereri active"
          value={`${stats.activeRequests}`}
          subtext="Sesiuni concurente"
          accentClass="text-violet-400"
        />
      </div>

      {/* Uptime chart */}
      <SectionCard title="Disponibilitate Servicii (24h)">
        <UptimeChart data={uptimeData} />
      </SectionCard>

      {/* Response time + requests side by side */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <SectionCard title="Timp de Răspuns (ms)">
            <ResponseTimeChart data={responseTimeData} />
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Cereri / Oră">
            <RequestsPerHourChart data={requestsPerHour} />
          </SectionCard>
        </div>
      </div>

      {/* Error rate chart */}
      <SectionCard title="Rată de Erori (4xx / 5xx)">
        <ErrorRateChart data={errorRateData} />
      </SectionCard>

      {/* Services grid */}
      <SectionCard title="Stare Servicii">
        <ServicesStatusGrid services={services} />
      </SectionCard>

      {/* Security events + audit trail */}
      <SectionCard title="Evenimente de Securitate & Jurnal Audit">
        <SecurityEventsLog />
      </SectionCard>
    </motion.div>
  );
}
