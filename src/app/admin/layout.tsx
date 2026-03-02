"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-react";

/**
 * Admin Layout
 *
 * Reuses DashboardSidebar and DashboardHeader with custom props
 * for admin-specific navigation and features
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Create a client outside component to persist across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication before rendering admin UI
  useEffect(() => {
    async function checkAuth(): Promise<void> {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/admin/login";
          return;
        }

        setIsAuthenticated(true);
      } catch {
        window.location.href = "/admin/login";
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Listen for resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Admin-specific navigation links
  const adminNavigationLinks = [
    { href: "/admin/primariata", label: "Global Admin", icon: LayoutDashboard },
    { href: "/admin/survey", label: "Survey Platform", icon: BarChart3 },
    { href: "/admin/users", label: "Echipă (Vechi)", icon: Users }, // Temporary - old location
    { href: "/admin/settings", label: "Setări Admin", icon: Settings },
  ];

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Se verifica autorizarea...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative flex h-screen overflow-hidden">
        {/* Reuse DashboardSidebar with custom admin navigation */}
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

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Reuse DashboardHeader but simplified for admin (no location/weather) */}
          <DashboardHeader
            onMenuClick={toggleSidebar}
            isMobile={isMobile}
            judet="admin"
            localitate="panel"
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
