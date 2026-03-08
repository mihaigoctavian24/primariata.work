import { motion } from "motion/react";
import {
  Settings, LayoutDashboard, UserPlus, Clock, ChevronRight,
  Shield, Building2, Download, Sparkles,
} from "lucide-react";

const adminActions = [
  { icon: LayoutDashboard, label: "Dashboard Admin Complet", color: "#3b82f6" },
  { icon: UserPlus, label: "Invită Staff Nou", color: "#8b5cf6" },
  { icon: Clock, label: "Invitații Pending", color: "#f59e0b" },
  { icon: Download, label: "Export Raport", color: "#10b981" },
];

export function AdminPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Setări Primărie */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl cursor-pointer transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <Building2 className="w-4 h-4 text-indigo-400" />
        <span className="text-indigo-300" style={{ fontSize: "0.88rem" }}>Setări Primărie</span>
      </motion.button>

      {/* Acțiuni Admin */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Acțiuni Admin</span>
        </div>
        <div className="px-2 pb-2">
          {adminActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                </div>
                <span className="flex-1 text-gray-400 group-hover:text-white transition-colors" style={{ fontSize: "0.82rem" }}>
                  {action.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Admin Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-4 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.06))",
          border: "1px solid rgba(236,72,153,0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Admin</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>Primăria Sector 1 B</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>24</div>
            <div className="text-gray-500" style={{ fontSize: "0.7rem" }}>Cereri luna aceasta</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>96%</div>
            <div className="text-gray-500" style={{ fontSize: "0.7rem" }}>Rata de rezolvare</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
