"use client";

import { Heart } from "lucide-react";

interface SidebarLogoProps {
  collapsed: boolean;
}

export function SidebarLogo({ collapsed }: SidebarLogoProps) {
  return (
    <div className="border-sidebar-border flex h-16 shrink-0 items-center border-b px-5">
      {!collapsed ? (
        <div className="flex items-center gap-1.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
          >
            <Heart className="h-3.5 w-3.5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span
              className="tracking-tight text-white"
              style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.1 }}
            >
              primaria<span className="text-pink-400">Ta</span>
            </span>
            <span
              className="mt-0.5 text-gray-600"
              style={{ fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Panou Administrator
            </span>
          </div>
        </div>
      ) : (
        <div
          className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
        >
          <Heart className="h-4 w-4 fill-white text-white" />
        </div>
      )}
    </div>
  );
}
