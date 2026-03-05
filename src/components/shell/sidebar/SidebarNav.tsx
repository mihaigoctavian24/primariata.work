"use client";

import { cn } from "@/lib/utils";
import { SidebarNavItem } from "./SidebarNavItem";
import type { SidebarConfig } from "./sidebar-config";

interface SidebarNavProps {
  config: SidebarConfig;
  collapsed: boolean;
}

export function SidebarNav({ config, collapsed }: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2" aria-label="Sidebar navigation">
      {config.sections.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <p
              className={cn(
                "mb-2 px-3 text-[11px] font-semibold tracking-wider uppercase",
                "text-sidebar-foreground/40"
              )}
            >
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
