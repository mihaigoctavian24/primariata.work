import { cookies } from "next/headers";
import { SIDEBAR_COLLAPSED_KEY } from "@/lib/cookies";
import { AdminProviders } from "./providers";

/**
 * Admin Layout (Server Component)
 *
 * Reads sidebar-collapsed cookie on the server to prevent layout shift.
 * Wraps children in client-side providers (QueryClient, ShellLayout).
 * Auth enforcement is handled by middleware (no client-side auth check).
 *
 * NOTE: sidebarConfig is built client-side in AdminProviders because
 * it contains React component references (Lucide icons) which cannot
 * be serialized across the Server-to-Client boundary.
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const collapsedCookie = cookieStore.get(SIDEBAR_COLLAPSED_KEY);
  const initialCollapsed = collapsedCookie?.value === "true";

  return <AdminProviders initialCollapsed={initialCollapsed}>{children}</AdminProviders>;
}
