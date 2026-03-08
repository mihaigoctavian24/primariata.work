import { MapPin, Cloud, Moon, Sun, Bell, Command, ShieldCheck } from "lucide-react";

interface TopBarProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onNotifications: () => void;
  onCommandPalette: () => void;
  unreadCount: number;
}

export function TopBar({ darkMode, onToggleDark, onNotifications, onCommandPalette, unreadCount }: TopBarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.04]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.05))", border: "1px solid rgba(236,72,153,0.1)" }}>
          <ShieldCheck className="w-3 h-3 text-pink-400" />
          <span className="text-pink-400/80" style={{ fontSize: "0.7rem", fontWeight: 600 }}>Admin Primărie</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <MapPin className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-gray-200" style={{ fontSize: "0.82rem" }}>Sector 1 B, Jud. București</span>
          <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04]">
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-gray-300" style={{ fontSize: "0.8rem" }}>12°C</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all cursor-pointer"
          style={{ border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Command className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-500" style={{ fontSize: "0.78rem" }}>⌘K</span>
        </button>

        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onNotifications}
          className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-white" style={{ fontSize: "0.6rem", background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}>
              {unreadCount}
            </span>
          )}
        </button>

        <button className="relative ml-1 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white overflow-hidden group-hover:ring-2 ring-pink-500/30 transition-all" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", fontSize: "0.85rem", fontWeight: 600 }}>
            E
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#09090f]" />
        </button>
      </div>
    </header>
  );
}