"use client";

import React from "react";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceHealth, ServiceStatus } from "./monitorizare-content";

// ─── Icon map for service icons (strings → components, SSR-safe) ────────────

const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
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
};

// ─── Status badge config — Tailwind semantic tokens only, no hex ────────────

const statusConfig: Record<ServiceStatus, { label: string; textClass: string; bgClass: string }> = {
  operational: {
    label: "Operațional",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-400/10",
  },
  degraded: {
    label: "Degradat",
    textClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
  },
  down: {
    label: "Oprit",
    textClass: "text-red-400",
    bgClass: "bg-red-400/10",
  },
  maintenance: {
    label: "Mentenanță",
    textClass: "text-sky-400",
    bgClass: "bg-sky-400/10",
  },
};

// ─── Service Card ────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceHealth;
}

function ServiceCard({ service }: ServiceCardProps): React.JSX.Element {
  const Icon = SERVICE_ICON_MAP[service.iconName] ?? Globe;
  const statusCfg = statusConfig[service.status];

  return (
    <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04]">
      {/* Header row: icon + name + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.8rem] leading-tight font-semibold text-white">
              {service.name}
            </p>
            <p className="mt-0.5 truncate text-[0.7rem] leading-tight text-gray-500">
              {service.description}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[0.65rem] font-semibold",
            statusCfg.textClass,
            statusCfg.bgClass
          )}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 text-[0.7rem] text-gray-500">
        {service.latency > 0 && (
          <span>
            <span className="font-medium text-gray-400">{service.latency}ms</span> latență
          </span>
        )}
        <span>
          <span className="font-medium text-gray-400">{service.uptime}</span> uptime
        </span>
        <span className="ml-auto">{service.lastCheck}</span>
      </div>
    </div>
  );
}

// ─── Services Status Grid ────────────────────────────────────────────────────

interface ServicesStatusGridProps {
  services: ServiceHealth[];
}

export function ServicesStatusGrid({ services }: ServicesStatusGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.name} service={service} />
      ))}
    </div>
  );
}
