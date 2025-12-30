"use client";

import { use, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QueryProvider } from "@/components/providers/query-provider";

/**
 * Dashboard Layout
 *
 * Main authenticated layout with:
 * - Sidebar navigation (240px, collapsible)
 * - Sticky header with location + user menu
 * - Responsive behavior (desktop/tablet/mobile)
 * - Auth middleware protected
 *
 * Route: /app/[judet]/[localitate]/*
 * Protected: Yes (via middleware)
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  // Unwrap params Promise for Next.js 15
  const { judet, localitate } = use(params);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setSidebarOpen(savedState === "false");
    }
  }, []);

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(!sidebarOpen));
  }, [sidebarOpen]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <QueryProvider>
      <div className="relative flex h-screen overflow-hidden">
        {/* Skip to main content link (accessibility) */}
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:font-medium"
        >
          Skip to main content
        </a>

        {/* Sidebar */}
        <DashboardSidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          judet={judet}
          localitate={localitate}
        />

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            onMenuClick={toggleSidebar}
            isMobile={isMobile}
            judet={judet}
            localitate={localitate}
          />

          {/* Page content - scrollable */}
          <main id="main-content" className="flex flex-1 flex-col overflow-hidden" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
