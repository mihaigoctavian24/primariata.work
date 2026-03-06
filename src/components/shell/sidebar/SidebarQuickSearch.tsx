"use client";

import { Command } from "lucide-react";

interface SidebarQuickSearchProps {
  collapsed: boolean;
  onCommandPalette: () => void;
}

export function SidebarQuickSearch({ collapsed, onCommandPalette }: SidebarQuickSearchProps) {
  if (collapsed) return null;

  return (
    <div className="mb-2 px-3">
      <button
        onClick={onCommandPalette}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all hover:bg-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Command className="h-3.5 w-3.5 shrink-0 text-gray-600" />
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
  );
}
