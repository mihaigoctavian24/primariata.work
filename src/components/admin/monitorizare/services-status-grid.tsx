"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Globe,
  Lock,
  Database,
  HardDrive,
  Inbox,
  Zap,
  Layers,
  FileText,
  Bell,
  Search,
  Settings,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency: number;
  uptime: string;
  lastCheck: string;
  icon: LucideIcon; // NOT string in Phase 20 (no Server Component serialization needed)
  description: string;
}

// ─── Status Styles ───────────────────────────────────────────────────────────

const statusStyles: Record<ServiceStatus, { colorClass: string; bgClass: string; label: string }> =
  {
    operational: {
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      label: "Operațional",
    },
    degraded: {
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      label: "Degradat",
    },
    down: {
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10",
      label: "Oprit",
    },
    maintenance: {
      colorClass: "text-gray-400",
      bgClass: "bg-gray-500/10",
      label: "Mentenanță",
    },
  };

// ─── Mock Services Data ───────────────────────────────────────────────────────

const services: ServiceHealth[] = [
  {
    name: "API Gateway",
    status: "operational",
    latency: 42,
    uptime: "99.99%",
    lastCheck: "acum 30s",
    icon: Globe,
    description: "Endpoint principal REST API",
  },
  {
    name: "Auth Service",
    status: "operational",
    latency: 28,
    uptime: "100%",
    lastCheck: "acum 30s",
    icon: Lock,
    description: "Autentificare & sesiuni JWT",
  },
  {
    name: "Database Primară",
    status: "operational",
    latency: 12,
    uptime: "99.98%",
    lastCheck: "acum 15s",
    icon: Database,
    description: "PostgreSQL — date principale",
  },
  {
    name: "Storage Files",
    status: "operational",
    latency: 85,
    uptime: "99.95%",
    lastCheck: "acum 1m",
    icon: HardDrive,
    description: "Object storage documente",
  },
  {
    name: "Email Service",
    status: "degraded",
    latency: 520,
    uptime: "98.7%",
    lastCheck: "acum 30s",
    icon: Inbox,
    description: "SMTP — notificări & confirmări",
  },
  {
    name: "Payment Gateway",
    status: "operational",
    latency: 145,
    uptime: "99.96%",
    lastCheck: "acum 45s",
    icon: Zap,
    description: "Integrare Netopia/BT Pay",
  },
  {
    name: "Cache Redis",
    status: "operational",
    latency: 3,
    uptime: "100%",
    lastCheck: "acum 15s",
    icon: Layers,
    description: "Cache sesiuni & date frecvente",
  },
  {
    name: "PDF Generator",
    status: "maintenance",
    latency: 0,
    uptime: "—",
    lastCheck: "acum 2h",
    icon: FileText,
    description: "Generare certificate & documente",
  },
  {
    name: "Notification Hub",
    status: "operational",
    latency: 35,
    uptime: "99.99%",
    lastCheck: "acum 30s",
    icon: Bell,
    description: "Push, SMS, in-app notifications",
  },
  {
    name: "Search Index",
    status: "operational",
    latency: 18,
    uptime: "99.97%",
    lastCheck: "acum 1m",
    icon: Search,
    description: "Elasticsearch — căutare rapidă",
  },
  {
    name: "Background Jobs",
    status: "operational",
    latency: 0,
    uptime: "100%",
    lastCheck: "acum 30s",
    icon: Settings,
    description: "Worker queue — procesare async",
  },
  {
    name: "Audit Logger",
    status: "operational",
    latency: 8,
    uptime: "100%",
    lastCheck: "acum 15s",
    icon: Shield,
    description: "Logare acțiuni & compliance",
  },
];

// ─── ServicesStatusGrid ───────────────────────────────────────────────────────

export function ServicesStatusGrid(): React.JSX.Element {
  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => s.status === "down").length;
  const maintenanceCount = services.filter((s) => s.status === "maintenance").length;

  return (
    <div className="space-y-5">
      {/* Status summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Operaționale",
            count: operationalCount,
            Icon: CheckCircle2,
            colorClass: "text-emerald-400",
            bgClass: "bg-emerald-500/[0.06]",
            borderClass: "border-emerald-500/[0.12]",
          },
          {
            label: "Degradate",
            count: degradedCount,
            Icon: AlertTriangle,
            colorClass: "text-amber-400",
            bgClass: "bg-amber-500/[0.06]",
            borderClass: "border-amber-500/[0.12]",
          },
          {
            label: "Oprite",
            count: downCount,
            Icon: XCircle,
            colorClass: "text-red-400",
            bgClass: "bg-red-500/[0.06]",
            borderClass: "border-red-500/[0.12]",
          },
          {
            label: "Mentenanță",
            count: maintenanceCount,
            Icon: Settings,
            colorClass: "text-gray-400",
            bgClass: "bg-gray-500/[0.06]",
            borderClass: "border-gray-500/[0.12]",
          },
        ].map(({ label, count, Icon, colorClass, bgClass, borderClass }) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${bgClass} ${borderClass}`}
          >
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <div>
              <div className="text-[1.3rem] leading-none font-bold text-white">{count}</div>
              <div className="text-[0.72rem] text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service, i) => {
          const st = statusStyles[service.status];
          const Icon = service.icon;

          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              whileHover={{ y: -2 }}
              className="cursor-pointer rounded-xl border border-white/[0.05] bg-white/[0.025] p-4 transition-all"
            >
              {/* Header row */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${st.bgClass}`}
                  >
                    <Icon className={`h-4 w-4 ${st.colorClass}`} />
                  </div>
                  <div>
                    <div className="text-[0.88rem] font-medium text-white">{service.name}</div>
                    <div className="text-[0.68rem] text-gray-600">{service.description}</div>
                  </div>
                </div>

                {/* Status dot — pulsing for operational */}
                <div className="relative">
                  {service.status === "operational" ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                  ) : (
                    <span
                      className={`inline-flex h-2.5 w-2.5 rounded-full ${
                        service.status === "degraded"
                          ? "bg-amber-400"
                          : service.status === "down"
                            ? "bg-red-400"
                            : "bg-gray-400"
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[0.62rem] text-gray-600">Status</div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.68rem] font-semibold ${st.colorClass} ${st.bgClass}`}
                  >
                    {st.label}
                  </span>
                </div>
                <div>
                  <div className="text-[0.62rem] text-gray-600">Latență</div>
                  <div className="text-[0.82rem] font-semibold text-white">
                    {service.latency > 0 ? `${service.latency}ms` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[0.62rem] text-gray-600">Uptime</div>
                  <div className="text-[0.82rem] font-semibold text-white">{service.uptime}</div>
                </div>
                <div className="ml-auto">
                  <div className="text-[0.62rem] text-gray-600">Check</div>
                  <div className="text-[0.72rem] text-gray-500">{service.lastCheck}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
