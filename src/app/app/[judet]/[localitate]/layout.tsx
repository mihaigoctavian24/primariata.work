import { cookies } from "next/headers";
import { SIDEBAR_COLLAPSED_KEY } from "@/lib/cookies";
import { CitizenProviders } from "./providers";

/**
 * Dashboard Layout (Server Component)
 *
 * Reads sidebar-collapsed cookie on the server to prevent layout shift.
 * Wraps children in client-side providers (QueryProvider, ShellLayout, CereriNotifications).
 * Auth enforcement is handled by middleware.
 *
 * Route: /app/[judet]/[localitate]/*
 *
 * NOTE: This layout also wraps /admin/* sub-paths. The CitizenProviders component
 * uses usePathname() to detect admin paths and switches to admin sidebar config
 * automatically -- no double-shell nesting.
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

  return (
    <CitizenProviders basePath={basePath} initialCollapsed={initialCollapsed}>
      {children}
    </CitizenProviders>
  );
}
