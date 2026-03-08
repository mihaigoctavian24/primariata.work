import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, LayoutDashboard, FileText, FolderOpen, CreditCard,
  Bell, Settings, UserPlus, Building2, Zap, Moon, Sun, Users,
  LogOut, HelpCircle, ArrowRight, ShieldCheck, Activity, CalendarDays,
} from "lucide-react";

const allCommands = [
  { id: "dash", icon: LayoutDashboard, label: "Panou Administrare", category: "Navigare", shortcut: "D" },
  { id: "monitor", icon: Activity, label: "Monitorizare Sistem", category: "Navigare" },
  { id: "users", icon: Users, label: "Gestionare Utilizatori", category: "Administrare", shortcut: "U" },
  { id: "cereri", icon: FileText, label: "Supervizare Cereri", category: "Navigare", shortcut: "C" },
  { id: "docs", icon: FolderOpen, label: "Documente", category: "Navigare" },
  { id: "plati", icon: CreditCard, label: "Financiar", category: "Navigare" },
  { id: "calendar", icon: CalendarDays, label: "Calendar", category: "Navigare" },
  { id: "notif", icon: Bell, label: "Notificări", category: "Navigare", shortcut: "N" },
  { id: "settings", icon: Settings, label: "Configurare Platformă", category: "Sistem" },
  { id: "invite", icon: UserPlus, label: "Invită Utilizator Nou", category: "Acțiuni", shortcut: "I" },
  { id: "manage", icon: Users, label: "Aprobare Conturi Pending", category: "Acțiuni" },
  { id: "theme", icon: Moon, label: "Schimbă Tema (Dark/Light)", category: "Preferințe", shortcut: "T" },
  { id: "help", icon: HelpCircle, label: "Ajutor & Documentație", category: "Altele" },
  { id: "logout", icon: LogOut, label: "Deconectare", category: "Altele" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAction: (id: string) => void;
}

export function CommandPalette({ open, onClose, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = allCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, typeof allCommands>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      onAction(filtered[selectedIndex].id);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #1a1a2e 0%, #141424 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 60px rgba(236,72,153,0.1)",
            }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Caută comenzi, pagini, acțiuni..."
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none"
                style={{ fontSize: "0.95rem" }}
              />
              <kbd
                className="px-2 py-0.5 rounded-md text-gray-500"
                style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2 px-2">
              {Object.entries(grouped).map(([category, commands]) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1 text-gray-600" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {category}
                  </div>
                  {commands.map((cmd) => {
                    flatIndex++;
                    const isSelected = flatIndex === selectedIndex;
                    const Icon = cmd.icon;
                    const idx = flatIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          onAction(cmd.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                          isSelected ? "bg-white/8" : "hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-pink-400" : "text-gray-500"}`} />
                        <span className={`flex-1 text-left ${isSelected ? "text-white" : "text-gray-300"}`} style={{ fontSize: "0.88rem" }}>
                          {cmd.label}
                        </span>
                        {cmd.shortcut && (
                          <kbd
                            className={`px-1.5 py-0.5 rounded text-gray-500 ${isSelected ? "border-pink-500/30" : ""}`}
                            style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-8 text-center text-gray-500" style={{ fontSize: "0.85rem" }}>
                  Niciun rezultat pentru "{query}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-gray-600" style={{ fontSize: "0.7rem" }}>
                <kbd className="px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>↑↓</kbd>
                <span>navigare</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600" style={{ fontSize: "0.7rem" }}>
                <kbd className="px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>↵</kbd>
                <span>selectare</span>
              </div>
              <div className="ml-auto flex items-center gap-1 text-gray-600" style={{ fontSize: "0.7rem" }}>
                <Zap className="w-3 h-3 text-pink-500" />
                <span>primariaTa</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}