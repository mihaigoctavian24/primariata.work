"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  CreditCard,
  Landmark,
  CalendarDays,
  BarChart3,
  Settings,
  Crown,
  Command,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isDashboard?: boolean;
  badgeKey?: "cereri" | "proiecte";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function buildNavSections(basePath: string): NavSection[] {
  return [
    {
      title: "Principal",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          href: basePath,
          isDashboard: true,
        },
      ],
    },
    {
      title: "Administrare",
      items: [
        {
          icon: FileText,
          label: "Cereri & Petiții",
          href: `${basePath}/cereri`,
          badgeKey: "cereri",
        },
        {
          icon: Users,
          label: "Cetățeni",
          href: `${basePath}/cetateni`,
        },
        {
          icon: Megaphone,
          label: "Anunțuri",
          href: `${basePath}/anunturi`,
        },
      ],
    },
    {
      title: "Gestiune",
      items: [
        {
          icon: CreditCard,
          label: "Buget & Finanțe",
          href: `${basePath}/buget`,
        },
        {
          icon: Landmark,
          label: "Proiecte",
          href: `${basePath}/proiecte`,
          badgeKey: "proiecte",
        },
        {
          icon: CalendarDays,
          label: "Agende",
          href: `${basePath}/agende`,
        },
      ],
    },
    {
      title: "Raportare",
      items: [
        {
          icon: BarChart3,
          label: "Rapoarte",
          href: `${basePath}/rapoarte`,
        },
        {
          icon: Settings,
          label: "Setări",
          href: `${basePath}/setari`,
        },
      ],
    },
  ];
}

interface PrimarSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCommandPalette: () => void;
  basePath: string;
  userName: string;
  userInitials: string;
  pendingCereriCount: number;
  activeProiecteCount: number;
}

export function PrimarSidebar({
  collapsed,
  onToggle,
  onCommandPalette,
  basePath,
  userName,
  userInitials,
  pendingCereriCount,
  activeProiecteCount,
}: PrimarSidebarProps): React.ReactElement {
  const pathname = usePathname();
  const navSections = buildNavSections(basePath);

  const getBadgeCount = (badgeKey: NavItem["badgeKey"]): number => {
    if (badgeKey === "cereri") return pendingCereriCount;
    if (badgeKey === "proiecte") return activeProiecteCount;
    return 0;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-white/[0.04]"
      style={{ background: "linear-gradient(180deg, #0c0c18 0%, #08080f 100%)" }}
      suppressHydrationWarning
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        {!collapsed ? (
          <Link href={basePath} className="flex cursor-pointer items-center gap-1.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                <Crown className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span
                  className="tracking-tight text-white"
                  style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.1 }}
                >
                  primaria<span className="text-amber-400">Ta</span>
                </span>
                <span
                  className="text-gray-600"
                  style={{
                    fontSize: "0.55rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Panou Primar
                </span>
              </div>
            </motion.div>
          </Link>
        ) : (
          <Link href={basePath} className="mx-auto">
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <Crown className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Quick Search */}
      {!collapsed && (
        <div className="mb-2 px-3">
          <button
            onClick={onCommandPalette}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all hover:bg-white/[0.06]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Command className="h-3.5 w-3.5 text-gray-600" />
            <span className="flex-1 text-left text-gray-500" style={{ fontSize: "0.8rem" }}>
              Caută rapid...
            </span>
            <kbd
              className="rounded px-1.5 py-0.5 text-gray-600"
              style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.06)" }}
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
                className="px-3 pt-3 pb-1 text-gray-700"
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
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.isDashboard
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                    isActive ? "text-white" : "text-gray-500 hover:text-gray-200"
                  }`}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="primarNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))",
                        border: "1px solid rgba(245,158,11,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-[17px] w-[17px] shrink-0 transition-colors ${
                      isActive ? "text-amber-400" : ""
                    }`}
                  />
                  {!collapsed && (
                    <span
                      className="relative z-10 whitespace-nowrap"
                      style={{ fontSize: "0.82rem" }}
                    >
                      {item.label}
                    </span>
                  )}
                  {!collapsed && badgeCount > 0 && (
                    <span
                      className="relative z-10 ml-auto min-w-[20px] rounded-full py-0.5 text-center text-white"
                      style={{
                        fontSize: "0.63rem",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        padding: "1px 7px",
                      }}
                    >
                      {badgeCount}
                    </span>
                  )}
                  {collapsed && badgeCount > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full"
                      style={{ background: "#f59e0b" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Primar Role Badge */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-gray-200" style={{ fontSize: "0.8rem" }}>
                {userName}
              </div>
              <div className="flex items-center gap-1">
                <Crown className="h-2.5 w-2.5 text-amber-400" />
                <span
                  className="truncate text-amber-400/70"
                  style={{ fontSize: "0.63rem", fontWeight: 600 }}
                >
                  Primar
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
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:text-gray-300"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
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
