"use client";

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
          {!collapsed ? (
            <p
              className="px-3 pt-3 pb-1 font-semibold tracking-widest text-gray-700 uppercase"
              style={{ fontSize: "0.62rem", letterSpacing: "0.08em" }}
            >
              {section.title}
            </p>
          ) : (
            <div
              className="mx-auto my-2 h-[1px] w-6"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          )}
          <div className="flex flex-col items-start gap-0.5">
            {section.items.map((item) => (
              <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
