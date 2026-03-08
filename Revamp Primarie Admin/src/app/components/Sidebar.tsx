import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, FolderOpen, CreditCard,
  Settings, ChevronLeft, ChevronRight, Heart, Command,
  CalendarDays, Users, ShieldCheck, Activity,
} from "lucide-react";
import { motion } from "motion/react";

const navSections = [
  {
    title: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: Activity, label: "Monitorizare", path: "/monitorizare" },
    ],
  },
  {
    title: "Administrare",
    items: [
      { icon: Users, label: "Utilizatori", path: "/utilizatori", badge: 7 },
      { icon: FileText, label: "Supervizare Cereri", path: "/cereri", badge: 36 },
    ],
  },
  {
    title: "Gestiune",
    items: [
      { icon: FolderOpen, label: "Documente", path: "/documente" },
      { icon: CreditCard, label: "Financiar", path: "/plati" },
      { icon: CalendarDays, label: "Calendar", path: "/calendar" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { icon: Settings, label: "Configurare", path: "/setari" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCommandPalette: () => void;
}

export function Sidebar({ collapsed, onToggle, onCommandPalette }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen fixed left-0 top-0 z-50 flex flex-col border-r border-white/[0.04]"
      style={{ background: "linear-gradient(180deg, #0c0c18 0%, #08080f 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 shrink-0">
        {!collapsed ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}>
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white tracking-tight" style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.1 }}>
                primaria<span className="text-pink-400">Ta</span>
              </span>
              <span className="text-gray-600" style={{ fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Panou Administrator</span>
            </div>
          </motion.div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto cursor-pointer" style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }} onClick={() => navigate("/")}>
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Quick Search */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <button
            onClick={onCommandPalette}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Command className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-500 flex-1 text-left" style={{ fontSize: "0.8rem" }}>Caută rapid...</span>
            <kbd className="px-1.5 py-0.5 rounded text-gray-600" style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.06)" }}>⌘K</kbd>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 flex flex-col gap-0.5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && (
              <div className="text-gray-700 px-3 pt-3 pb-1" style={{ fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {section.title}
              </div>
            )}
            {collapsed && <div className="w-6 h-[1px] mx-auto my-2" style={{ background: "rgba(255,255,255,0.06)" }} />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));

              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${isActive ? "text-white" : "text-gray-500 hover:text-gray-200"}`}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.08))",
                        border: "1px solid rgba(236,72,153,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-[17px] h-[17px] relative z-10 shrink-0 transition-colors ${isActive ? "text-pink-400" : ""}`} />
                  {!collapsed && (
                    <span className="relative z-10 whitespace-nowrap" style={{ fontSize: "0.82rem" }}>{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="relative z-10 ml-auto min-w-[20px] text-center py-0.5 rounded-full text-white" style={{ fontSize: "0.63rem", background: "linear-gradient(135deg, #ec4899, #f43f5e)", padding: "1px 7px" }}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full" style={{ background: "#ec4899" }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin Role Badge */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", fontSize: "0.75rem", fontWeight: 600 }}>ED</div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-200 truncate" style={{ fontSize: "0.8rem" }}>Elena Dumitrescu</div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-pink-400" />
                <span className="text-pink-400/70 truncate" style={{ fontSize: "0.63rem", fontWeight: 600 }}>Admin Primărie</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      )}

      {/* Toggle */}
      <div className="px-3 pb-4">
        <button onClick={onToggle} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-all cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span style={{ fontSize: "0.78rem" }}>Restrânge</span></>}
        </button>
      </div>
    </motion.aside>
  );
}