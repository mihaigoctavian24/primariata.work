"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/components/providers/query-provider";
import { ShellLayout } from "@/components/shell/ShellLayout";
import { createClient } from "@/lib/supabase/client";
import { useCereriNotifications } from "@/hooks/use-cereri-notifications";
import {
  getAdminSidebarConfig,
  getCitizenSidebarConfig,
} from "@/components/shell/sidebar/sidebar-config";

/**
 * Citizen/Admin Providers (Client Component)
 *
 * Wraps pages in QueryProvider + ShellLayout + CereriNotifications.
 * Detects admin sub-path via usePathname() and switches sidebar config:
 *   - /app/[judet]/[localitate]/admin/* -> admin sidebar config
 *   - /app/[judet]/[localitate]/*       -> citizen sidebar config
 *
 * This avoids double-shell nesting since one ShellLayout handles both roles.
 */

interface CitizenProvidersProps {
  children: React.ReactNode;
  basePath: string;
  initialCollapsed: boolean;
}

function CereriNotificationsSubscriber(): null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  useCereriNotifications(userId);
  return null;
}

export function CitizenProviders({ children, basePath, initialCollapsed }: CitizenProvidersProps) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");

  const sidebarConfig = useMemo(() => {
    if (isAdmin) {
      return getAdminSidebarConfig(`${basePath}/admin`);
    }
    return getCitizenSidebarConfig(basePath);
  }, [basePath, isAdmin]);

  return (
    <QueryProvider>
      <ShellLayout sidebarConfig={sidebarConfig} initialCollapsed={initialCollapsed}>
        {!isAdmin && <CereriNotificationsSubscriber />}
        {children}
      </ShellLayout>
    </QueryProvider>
  );
}
