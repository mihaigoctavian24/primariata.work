"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { SuperAdminSidebar } from "./super-admin-sidebar";
import { SuperAdminTopBar } from "./super-admin-topbar";
import { CommandPalette } from "@/components/shell/command-palette/CommandPalette";
import { NotificationDrawer } from "@/components/shell/notification-drawer/NotificationDrawer";

interface SuperAdminShellProps {
  children: React.ReactNode;
  userInitials: string;
  userName: string;
}

export function SuperAdminShell({ children, userInitials, userName }: SuperAdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();

  const toggleCommand = useCallback(() => setCommandOpen((prev) => !prev), []);
  const toggleNotif = useCallback(() => setNotifOpen((prev) => !prev), []);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--popover)",
            border: "1px solid var(--border-subtle)",
            color: "var(--foreground)",
          },
        }}
      />

      <SuperAdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onCommandPalette={toggleCommand}
        userInitials={userInitials}
        userName={userName}
      />

      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex min-h-screen flex-col"
      >
        <SuperAdminTopBar onNotifications={toggleNotif} onCommandPalette={toggleCommand} />
        <main className="relative w-full flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="min-h-full p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        role="admin"
        basePath="/admin/primariata"
      />
      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}
