"use client";

import { motion } from "framer-motion";
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
  Shield 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Styles
// ============================================================================

interface ServiceHealth {
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  latency: number;
  uptime: string;
  lastCheck: string;
  icon: LucideIcon;
  description: string;
}

const statusStyles = {
  operational: { colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", label: "Operațional" },
  degraded:    { colorClass: "text-amber-400",   bgClass: "bg-amber-500/10",   label: "Degradat" },
  down:        { colorClass: "text-red-400",     bgClass: "bg-red-500/10",     label: "Oprit" },
  maintenance: { colorClass: "text-gray-400",    bgClass: "bg-gray-500/10",    label: "Mentenanță" },
} as const;

// ============================================================================
// Mock Data (Static from Phase 19/20 Figma Reference)
// ============================================================================

const services: ServiceHealth[] = [
  {
    name: "API Gateway",
    status: "operational",
    latency: 45,
    uptime: "99.99%",
    lastCheck: "Acum",
    icon: Globe,
    description: "Intrarea principală pentru toate cererile HTTP",
  },
  {
    name: "Supabase Auth",
    status: "operational",
    latency: 120,
    uptime: "99.98%",
    lastCheck: "Acum",
    icon: Lock,
    description: "Autentificare JWT și management sesiuni",
  },
  {
    name: "Bază de Date",
    status: "operational",
    latency: 24,
    uptime: "99.99%",
    lastCheck: "Acum",
    icon: Database,
    description: "PostgreSQL primar + RLS activ",
  },
  {
    name: "Storage",
    status: "operational",
    latency: 185,
    uptime: "99.95%",
    lastCheck: "1m ago",
    icon: HardDrive,
    description: "Găzduire documente pdf, imagini, arhive",
  },
  {
    name: "SendGrid E-mail",
    status: "operational",
    latency: 450,
    uptime: "99.90%",
    lastCheck: "5m ago",
    icon: Inbox,
    description: "Procesare trimiteri e-mail tranzacționale",
  },
  {
    name: "Ghișeul.ro API",
    status: "maintenance",
    latency: 0,
    uptime: "98.50%",
    lastCheck: "10m ago",
    icon: Zap,
    description: "Procesare plăți conturi trezorerie",
  },
  {
    name: "Redis Cache",
    status: "operational",
    latency: 8,
    uptime: "100%",
    lastCheck: "Acum",
    icon: Layers,
    description: "Caching pentru cataloage și configurări",
  },
  {
    name: "Generator PDF",
    status: "degraded",
    latency: 1250,
    uptime: "99.20%",
    lastCheck: "30s ago",
    icon: FileText,
    description: "Generare certificate și acte cu diacritice",
  },
  {
    name: "Realtime Socket",
    status: "operational",
    latency: 15,
    uptime: "99.99%",
    lastCheck: "Acum",
    icon: Bell,
    description: "Notificări WebSocket și live updates",
  },
  {
    name: "Meilisearch",
    status: "operational",
    latency: 42,
    uptime: "99.90%",
    lastCheck: "2m ago",
    icon: Search,
    description: "Motor căutare indexată documente",
  },
  {
    name: "Worker Jobs",
    status: "operational",
    latency: 65,
    uptime: "99.95%",
    lastCheck: "Acum",
    icon: Settings,
    description: "Cozi procesare async, cron, curățare",
  },
  {
    name: "Audit Logger",
    status: "operational",
    latency: 12,
    uptime: "100%",
    lastCheck: "Acum",
    icon: Shield,
    description: "Jurnalizare evenimente securitate WORM",
  },
];

// ============================================================================
// Component Export
// ============================================================================

export function ServicesStatusGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
      {services.map((service, idx) => {
        const Icon = service.icon;
        const styleInfo = statusStyles[service.status];

        return (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="group bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 rounded-xl p-4 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg flex items-center justify-center", styleInfo.bgClass, styleInfo.colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{service.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    
                    {/* Pulsing Dot / Static Dot */}
                    {service.status === "operational" ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    ) : (
                      <span className={cn(
                        "inline-flex rounded-full h-2 w-2",
                        service.status === "degraded" && "bg-amber-500",
                        service.status === "down" && "bg-red-500",
                        service.status === "maintenance" && "bg-gray-500"
                      )} />
                    )}

                    <span className={cn("text-xs font-medium", styleInfo.colorClass)}>
                      {styleInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
              {service.description}
            </p>

            <div className="grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground/70">Latență</span>
                <span className="font-mono text-foreground">{service.status === "maintenance" ? "—" : `${service.latency}ms`}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground/70">Uptime</span>
                <span className="font-mono text-foreground">{service.uptime}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground/70">Verificat</span>
                <span className="text-foreground">{service.lastCheck}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
