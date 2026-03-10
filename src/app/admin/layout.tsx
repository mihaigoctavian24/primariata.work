"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutDashboard, BarChart3, Settings } from "lucide-react";

/**
 * Survey Admin Layout (/admin/*)
 *
 * Uses the original DashboardSidebar/DashboardHeader pattern (pre-Phase 13).
 * Auth enforcement (unauthenticated redirect) is handled by middleware.
 * This layout provides admin-specific navigation for the Survey Admin panel.
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize(): void {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = (): void => {
    setSidebarOpen((prev) => !prev);
  };

  const adminNavigationLinks = [
    { href: "/admin/primariata", label: "Global Admin", icon: LayoutDashboard },
    { href: "/admin/survey", label: "Survey Platform", icon: BarChart3 },
    { href: "/admin/settings", label: "Setari Admin", icon: Settings },
  ];

  const pathname = usePathname();
  const isSuperAdminOrLoginRoute =
    pathname?.startsWith("/admin/primariata") || pathname?.startsWith("/admin/login");

  if (isSuperAdminOrLoginRoute) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative flex h-screen overflow-hidden">
        <DashboardSidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          customNavigationLinks={adminNavigationLinks}
          customBadge={{
            label: "Admin Panel",
            className: "border-border/40 bg-primary/10 text-primary",
          }}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            onMenuClick={toggleSidebar}
            isMobile={isMobile}
            judet="admin"
            localitate="panel"
          />

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
