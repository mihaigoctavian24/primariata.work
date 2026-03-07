import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { MonitorizareSkeleton } from "@/components/admin/monitorizare/monitorizare-skeleton";
import { MonitorizareContent } from "@/components/admin/monitorizare/monitorizare-content";
import type {
  MonitorizareData,
  UptimePoint,
  ResponseTimePoint,
  ErrorRatePoint,
  RequestsPerHourPoint,
  ServiceHealth,
} from "@/components/admin/monitorizare/monitorizare-content";

// ─── Mock Data ──────────────────────────────────────────────────────────────

function buildMonitorizareMockData(): MonitorizareData {
  const uptimeData: UptimePoint[] = [
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

  const responseTimeData: ResponseTimePoint[] = [
    { time: "00:00", api: 120, db: 45, cache: 8 },
    { time: "04:00", api: 95, db: 38, cache: 5 },
    { time: "08:00", api: 180, db: 62, cache: 12 },
    { time: "12:00", api: 210, db: 78, cache: 15 },
    { time: "16:00", api: 165, db: 55, cache: 9 },
    { time: "20:00", api: 140, db: 48, cache: 7 },
    { time: "24:00", api: 110, db: 40, cache: 6 },
  ];

  const errorRateData: ErrorRatePoint[] = [
    { time: "00:00", errors4xx: 3, errors5xx: 0 },
    { time: "04:00", errors4xx: 1, errors5xx: 0 },
    { time: "08:00", errors4xx: 12, errors5xx: 2 },
    { time: "12:00", errors4xx: 18, errors5xx: 1 },
    { time: "16:00", errors4xx: 8, errors5xx: 0 },
    { time: "20:00", errors4xx: 5, errors5xx: 1 },
    { time: "24:00", errors4xx: 2, errors5xx: 0 },
  ];

  const requestsPerHour: RequestsPerHourPoint[] = [
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

  const services: ServiceHealth[] = [
    {
      name: "API Gateway",
      status: "operational",
      latency: 42,
      uptime: "99.99%",
      lastCheck: "acum 30s",
      iconName: "Globe",
      description: "Endpoint principal REST API",
    },
    {
      name: "Auth Service",
      status: "operational",
      latency: 28,
      uptime: "100%",
      lastCheck: "acum 30s",
      iconName: "Lock",
      description: "Autentificare & sesiuni JWT",
    },
    {
      name: "Database Primară",
      status: "operational",
      latency: 12,
      uptime: "99.98%",
      lastCheck: "acum 15s",
      iconName: "Database",
      description: "PostgreSQL — date principale",
    },
    {
      name: "Storage Files",
      status: "operational",
      latency: 85,
      uptime: "99.95%",
      lastCheck: "acum 1m",
      iconName: "HardDrive",
      description: "Object storage documente",
    },
    {
      name: "Email Service",
      status: "degraded",
      latency: 520,
      uptime: "98.7%",
      lastCheck: "acum 30s",
      iconName: "Inbox",
      description: "SMTP — notificări & confirmări",
    },
    {
      name: "Payment Gateway",
      status: "operational",
      latency: 145,
      uptime: "99.96%",
      lastCheck: "acum 45s",
      iconName: "Zap",
      description: "Integrare Netopia/BT Pay",
    },
    {
      name: "Cache Redis",
      status: "operational",
      latency: 3,
      uptime: "100%",
      lastCheck: "acum 15s",
      iconName: "Layers",
      description: "Cache sesiuni & date frecvente",
    },
    {
      name: "PDF Generator",
      status: "maintenance",
      latency: 0,
      uptime: "—",
      lastCheck: "acum 2h",
      iconName: "FileText",
      description: "Generare certificate & documente",
    },
    {
      name: "Notification Hub",
      status: "operational",
      latency: 35,
      uptime: "99.99%",
      lastCheck: "acum 30s",
      iconName: "Bell",
      description: "Push, SMS, in-app notifications",
    },
    {
      name: "Search Index",
      status: "operational",
      latency: 18,
      uptime: "99.97%",
      lastCheck: "acum 1m",
      iconName: "Search",
      description: "Elasticsearch — căutare rapidă",
    },
    {
      name: "Background Jobs",
      status: "operational",
      latency: 0,
      uptime: "100%",
      lastCheck: "acum 30s",
      iconName: "Settings",
      description: "Worker queue — procesare async",
    },
    {
      name: "Audit Logger",
      status: "operational",
      latency: 8,
      uptime: "100%",
      lastCheck: "acum 15s",
      iconName: "Shield",
      description: "Logare acțiuni & compliance",
    },
  ];

  return {
    uptimeData,
    responseTimeData,
    errorRateData,
    requestsPerHour,
    services,
    stats: {
      uptimePercent: 99.97,
      avgResponseMs: 148,
      errorRatePercent: 0.3,
      activeRequests: 247,
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function MonitorizarePage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}): Promise<React.JSX.Element> {
  await params; // consume params (not used, but required by Next.js type contract)

  // === AUTH CHECK ===
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData, error: userError } = await supabase
    .from("utilizatori")
    .select("rol")
    .eq("id", user.id)
    .single();

  logger.debug("Monitorizare Page Auth:", {
    userId: user.id,
    userRole: userData?.rol,
    userError,
  });

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    logger.error("Access denied — not admin", { userError });
    redirect("/auth/login");
  }

  // === BUILD MOCK DATA ===
  const mockData = buildMonitorizareMockData();

  // === RENDER ===
  return (
    <Suspense fallback={<MonitorizareSkeleton />}>
      <MonitorizareContent data={mockData} />
    </Suspense>
  );
}
