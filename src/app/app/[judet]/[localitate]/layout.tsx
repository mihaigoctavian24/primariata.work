import { cookies } from "next/headers";
import { SIDEBAR_COLLAPSED_KEY } from "@/lib/cookies";
import { getCitizenSidebarConfig } from "@/components/shell/sidebar/sidebar-config";
import { CitizenProviders } from "./providers";

/**
 * Citizen Dashboard Layout (Server Component)
 *
 * Reads sidebar-collapsed cookie on the server to prevent layout shift.
 * Wraps children in client-side providers (QueryProvider, ShellLayout, CereriNotifications).
 * Auth enforcement is handled by middleware.
 *
 * Route: /app/[judet]/[localitate]/*
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { judet, localitate } = await params;
  const cookieStore = await cookies();
  const collapsedCookie = cookieStore.get(SIDEBAR_COLLAPSED_KEY);
  const initialCollapsed = collapsedCookie?.value === "true";

  const basePath = `/app/${judet}/${localitate}`;
  const sidebarConfig = getCitizenSidebarConfig(basePath);

  return (
    <CitizenProviders sidebarConfig={sidebarConfig} initialCollapsed={initialCollapsed}>
      {children}
    </CitizenProviders>
  );
}
