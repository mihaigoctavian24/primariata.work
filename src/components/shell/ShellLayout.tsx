"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { springTransition } from "@/lib/motion";
import { setSidebarCollapsed } from "@/lib/cookies";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./sidebar/Sidebar";
import { TopBar } from "./top-bar/TopBar";
import { PageTransition } from "./PageTransition";
import { CommandPalette } from "./command-palette/CommandPalette";
import { NotificationDrawer } from "./notification-drawer/NotificationDrawer";
import type { SidebarConfig } from "./sidebar/sidebar-config";

/**
 * ShellLayout
 *
 * Orchestrator: sidebar + top bar + main content area + Cmd+K handler.
 * Used by both admin and citizen layouts with different SidebarConfig.
 */

interface ShellLayoutProps {
  children: React.ReactNode;
  sidebarConfig: SidebarConfig;
  initialCollapsed: boolean;
}

export function ShellLayout({ children, sidebarConfig, initialCollapsed }: ShellLayoutProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const unreadCount = useUnreadNotifications(userId);

  // Fetch user ID for unread notifications subscription
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      setSidebarCollapsed(next);
      return next;
    });
  }, []);

  const toggleCommand = useCallback(() => {
    setCommandOpen((prev) => !prev);
  }, []);

  const toggleNotif = useCallback(() => {
    setNotifOpen((prev) => !prev);
  }, []);

  // Cmd+K global handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:font-medium"
      >
        Skip to main content
      </a>

      <Sidebar
        config={sidebarConfig}
        collapsed={collapsed}
        onToggle={toggleCollapse}
        onCommandPalette={toggleCommand}
      />

      <motion.div
        className="flex flex-1 flex-col overflow-hidden"
        animate={{ marginLeft: isMobile ? 0 : collapsed ? 72 : 260 }}
        transition={springTransition}
      >
        <TopBar
          config={sidebarConfig}
          onMenuClick={toggleCollapse}
          onCommandPalette={toggleCommand}
          onNotifications={toggleNotif}
          unreadCount={unreadCount}
        />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </main>
      </motion.div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        role={sidebarConfig.role}
        basePath={sidebarConfig.basePath}
      />
      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}
