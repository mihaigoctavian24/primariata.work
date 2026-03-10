import { Zap, Globe } from "lucide-react";
import { TopBarActions } from "@/components/shell/top-bar/TopBarActions";

interface SuperAdminTopBarProps {
  onNotifications: () => void;
  onCommandPalette: () => void;
}

export function SuperAdminTopBar({ onNotifications, onCommandPalette }: SuperAdminTopBarProps) {
  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between px-6"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))",
            border: "1px solid rgba(16,185,129,0.1)",
          }}
        >
          <Zap className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400/80" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
            Super Admin
          </span>
        </div>
        <div className="bg-muted flex items-center gap-1.5 rounded-xl px-3 py-1.5">
          <Globe className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
            Platforma primariaTa
          </span>
        </div>
        <div className="bg-muted flex items-center gap-1.5 rounded-xl px-3 py-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
            Toate sistemele OK
          </span>
        </div>
      </div>

      <TopBarActions onCommandPalette={onCommandPalette} onNotifications={onNotifications} />
    </header>
  );
}
