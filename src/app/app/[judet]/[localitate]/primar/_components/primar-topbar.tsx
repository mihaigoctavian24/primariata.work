"use client";

import { Crown, Landmark, Bell, Command } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface PrimarTopBarProps {
  primarieName: string;
  mandatStart: string | null;
  mandatSfarsit: string | null;
  userInitials: string;
  onNotifications: () => void;
  onCommandPalette: () => void;
}

export function PrimarTopBar({
  primarieName,
  mandatStart,
  mandatSfarsit,
  userInitials,
  onNotifications,
  onCommandPalette,
}: PrimarTopBarProps): React.ReactElement {
  const { theme, setTheme } = useTheme();

  const mandatText =
    mandatStart && mandatSfarsit
      ? `Mandat activ · ${new Date(mandatStart).getFullYear()}–${new Date(mandatSfarsit).getFullYear()}`
      : "Configurați mandatul în Setări";

  const handleThemeToggle = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between px-6"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {/* Left: 3 amber badges */}
      <div className="flex items-center gap-4">
        {/* Badge 1: Crown + Primar */}
        <div
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))",
            border: "1px solid rgba(245,158,11,0.1)",
          }}
        >
          <Crown className="h-3 w-3 text-amber-400" />
          <span className="text-amber-400/80" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
            Primar
          </span>
        </div>

        {/* Badge 2: Landmark + primarie name */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-1.5">
          <Landmark className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-gray-300" style={{ fontSize: "0.8rem" }}>
            {primarieName}
          </span>
        </div>

        {/* Badge 3: pulse dot + mandat */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-gray-300" style={{ fontSize: "0.8rem" }}>
            {mandatText}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* ⌘K button */}
        <button
          onClick={onCommandPalette}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-1.5 transition-all hover:bg-white/[0.07]"
          style={{ border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Command className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-500" style={{ fontSize: "0.78rem" }}>
            ⌘K
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={handleThemeToggle}
          className="cursor-pointer rounded-xl bg-white/[0.04] p-2 text-gray-400 transition-all hover:bg-white/[0.07] hover:text-white"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification bell */}
        <button
          onClick={onNotifications}
          className="relative cursor-pointer rounded-xl bg-white/[0.04] p-2 text-gray-400 transition-all hover:bg-white/[0.07] hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Avatar with amber gradient */}
        <button className="group relative ml-1 cursor-pointer">
          <div
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-white ring-amber-500/30 transition-all group-hover:ring-2"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {userInitials}
          </div>
          <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[var(--background)] bg-emerald-400" />
        </button>
      </div>
    </header>
  );
}
