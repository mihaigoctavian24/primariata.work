"use client";

import { useEffect, useState } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { ShellLayout } from "@/components/shell/ShellLayout";
import { createClient } from "@/lib/supabase/client";
import { useCereriNotifications } from "@/hooks/use-cereri-notifications";
import type { SidebarConfig } from "@/components/shell/sidebar/sidebar-config";

/**
 * Citizen Providers (Client Component)
 *
 * Wraps citizen pages in QueryProvider + ShellLayout + CereriNotifications.
 * Receives server-read config and collapsed state as props.
 */

interface CitizenProvidersProps {
  children: React.ReactNode;
  sidebarConfig: SidebarConfig;
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

export function CitizenProviders({
  children,
  sidebarConfig,
  initialCollapsed,
}: CitizenProvidersProps) {
  return (
    <QueryProvider>
      <ShellLayout sidebarConfig={sidebarConfig} initialCollapsed={initialCollapsed}>
        <CereriNotificationsSubscriber />
        {children}
      </ShellLayout>
    </QueryProvider>
  );
}
