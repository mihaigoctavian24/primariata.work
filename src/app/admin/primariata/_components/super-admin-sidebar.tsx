"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  Command,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/admin/primariata" }],
  },
  {
    title: "Management",
    items: [
      { icon: Building2, label: "Primarii", path: "/admin/primariata/primarii" },
      { icon: UserCog, label: "Admini", path: "/admin/primariata/admini" },
    ],
  },
  {
    title: "Analiză",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/admin/primariata/analytics" },
      { icon: Shield, label: "Audit Log", path: "/admin/primariata/audit" },
    ],
  },
  {
    title: "Sistem",
    items: [{ icon: Settings, label: "Setări Platformă", path: "/admin/primariata/setari" }],
  },
];

interface SuperAdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCommandPalette: () => void;
  userInitials: string;
  userName: string;
}

export function SuperAdminSidebar({
  collapsed,
  onToggle,
  onCommandPalette,
  userInitials,
  userName,
}: SuperAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 z-50 flex h-screen flex-col"
      style={{
        background: "var(--sidebar-background)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        {!collapsed ? (
          <Link href="/admin/primariata" className="flex cursor-pointer items-center gap-1.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
              >
                <Globe className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-foreground tracking-tight"
                  style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.1 }}
                >
                  primaria<span className="text-emerald-400">Ta</span>
                </span>
                <span
                  className="text-muted-foreground"
                  style={{
                    fontSize: "0.55rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Super Admin
                </span>
              </div>
            </motion.div>
          </Link>
        ) : (
          <Link href="/admin/primariata" className="mx-auto">
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
            >
              <Globe className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Quick Search */}
      {!collapsed && (
        <div className="mb-2 px-3">
          <button
            onClick={onCommandPalette}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all"
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Command className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground flex-1 text-left" style={{ fontSize: "0.8rem" }}>
              Caută rapid...
            </span>
            <kbd
              className="text-muted-foreground rounded px-1.5 py-0.5"
              style={{ fontSize: "0.6rem", background: "var(--muted)" }}
            >
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-1">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && (
              <div
                className="text-muted-foreground px-3 pt-3 pb-1"
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {section.title}
              </div>
            )}
            {collapsed && (
              <div
                className="mx-auto my-2 h-[1px] w-6"
                style={{ background: "var(--border-subtle)" }}
              />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.path !== "/admin/primariata" && pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="superAdminNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.08))",
                        border: "1px solid rgba(16,185,129,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-[17px] w-[17px] shrink-0 transition-colors ${isActive ? "text-emerald-400" : ""}`}
                  />
                  {!collapsed && (
                    <span
                      className="relative z-10 whitespace-nowrap"
                      style={{ fontSize: "0.82rem" }}
                    >
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className="relative z-10 ml-auto min-w-[20px] rounded-full py-0.5 text-center text-white"
                      style={{
                        fontSize: "0.63rem",
                        background: "linear-gradient(135deg, #10b981, #06b6d4)",
                        padding: "1px 7px",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span
                      className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full"
                      style={{ background: "#10b981" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin Role Badge */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>
                {userName}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-emerald-400" />
                <span
                  className="truncate text-emerald-400/70"
                  style={{ fontSize: "0.63rem", fontWeight: 600 }}
                >
                  Super Admin
                </span>
              </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      )}

      {/* Toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={onToggle}
          className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 transition-all"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span style={{ fontSize: "0.78rem" }}>Restrânge</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
