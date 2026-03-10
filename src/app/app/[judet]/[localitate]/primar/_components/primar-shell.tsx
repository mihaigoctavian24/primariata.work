"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { PrimarSidebar } from "./primar-sidebar";
import { PrimarTopBar } from "./primar-topbar";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

interface PrimarShellProps {
  children: React.ReactNode;
  basePath: string;
  primarieName: string;
  userName: string;
  userInitials: string;
  mandatStart: string | null;
  mandatSfarsit: string | null;
  initialCollapsed: boolean;
  pendingCereriCount: number;
  activeProiecteCount: number;
}

export function PrimarShell({
  children,
  basePath,
  primarieName,
  userName,
  userInitials,
  mandatStart,
  mandatSfarsit,
  initialCollapsed,
  pendingCereriCount,
  activeProiecteCount,
}: PrimarShellProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();

  const handleToggle = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COLLAPSED_KEY}=${next}; path=/; max-age=31536000`;
  }, [collapsed]);

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

      <PrimarSidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        onCommandPalette={toggleCommand}
        basePath={basePath}
        userName={userName}
        userInitials={userInitials}
        pendingCereriCount={pendingCereriCount}
        activeProiecteCount={activeProiecteCount}
      />

      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex min-h-screen flex-col"
      >
        <PrimarTopBar
          primarieName={primarieName}
          mandatStart={mandatStart}
          mandatSfarsit={mandatSfarsit}
          userInitials={userInitials}
          onNotifications={toggleNotif}
          onCommandPalette={toggleCommand}
        />
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
    </div>
  );
}
