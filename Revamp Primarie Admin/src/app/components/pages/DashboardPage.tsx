import { motion } from "motion/react";
import {
  Users, UserCheck, ShieldCheck, MailWarning,
  TrendingUp, Shield, Sparkles, ArrowUpRight,
  Clock, BarChart3, CalendarDays, Activity,
  Server, Cpu, HardDrive, Wifi, AlertTriangle,
  Crown, UserCog, User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { StatsCard } from "../StatsCard";
import { CereriCard } from "../CereriCard";
import { ActivityChart } from "../ActivityChart";
import { DonutChart } from "../DonutChart";
import { LiveActivityFeed } from "../LiveActivityFeed";
import { ProgressRing } from "../ProgressRing";

const cereriData = [
  { value: 17, label: "Depusă", color: "#3b82f6" },
  { value: 5, label: "În verificare", color: "#8b5cf6" },
  { value: 3, label: "Info suplim.", color: "#f59e0b" },
  { value: 8, label: "Aprobată", color: "#10b981" },
  { value: 2, label: "În procesare", color: "#06b6d4" },
  { value: 1, label: "Respinsă", color: "#ef4444" },
];

const functionariPerformance = [
  { name: "Ion Popescu", role: "Funcționar", cereriRezolvate: 34, rata: 92, online: true },
  { name: "Maria Ionescu", role: "Funcționar", cereriRezolvate: 28, rata: 87, online: true },
  { name: "George Radu", role: "Funcționar", cereriRezolvate: 21, rata: 78, online: false },
  { name: "Ana Moldovan", role: "Funcționar", cereriRezolvate: 19, rata: 95, online: true },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <h1 className="text-white" style={{ fontSize: "1.6rem", fontWeight: 700 }}>Panou Administrare</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.08))", border: "1px solid rgba(236,72,153,0.12)" }}>
              <ShieldCheck className="w-3 h-3 text-pink-400" />
              <span className="text-pink-400" style={{ fontSize: "0.68rem", fontWeight: 600 }}>Admin Primărie</span>
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
            Primăria Sector 1 B, București · {new Date().toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400" style={{ fontSize: "0.72rem" }}>Toate sistemele operaționale</span>
          </div>
        </div>
      </div>

      {/* Admin Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-5 overflow-hidden mb-5"
        style={{ background: "linear-gradient(135deg, #ec4899, #a855f7, #6366f1)", boxShadow: "0 8px 32px rgba(236,72,153,0.2)" }}
      >
        <motion.div animate={{ x: [0, 15, 0], y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 65%)", transform: "translate(30%, -50%)" }} />
        <motion.div animate={{ x: [0, -10, 0], y: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 65%)", transform: "translate(0%, 50%)" }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-white" style={{ fontSize: "1.25rem", fontWeight: 700 }}>Bine ai revenit, Elena!</h2>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-white/60 mt-0.5" style={{ fontSize: "0.85rem" }}>
              7 conturi în așteptare · 3 funcționari online · 2 alerte de sistem
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <ProgressRing value={98} label="Uptime" size={56} color="#10b981" />
            <ProgressRing value={86} label="Rez. Cereri" size={56} color="#3b82f6" />
            <ProgressRing value={94} label="SLA" size={56} color="#f59e0b" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-5">
          {/* User Stats - by Role */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Utilizatori Platformă — pe Rol</h3>
              </div>
              <button onClick={() => navigate("/utilizatori")} className="flex items-center gap-1 text-pink-400 hover:text-pink-300 cursor-pointer transition-colors" style={{ fontSize: "0.78rem" }}>
                Gestionează <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatsCard icon={Users} label="Cetățeni" value={1247} color="#3b82f6" trend="up" trendValue="+12%" delay={0.15} />
              <StatsCard icon={UserCheck} label="Funcționari" value={18} color="#10b981" trend="up" trendValue="+2" delay={0.2} />
              <StatsCard icon={Crown} label="Primar" value={1} color="#f59e0b" trend="flat" delay={0.25} />
              <StatsCard icon={ShieldCheck} label="Admini" value={3} color="#8b5cf6" trend="flat" delay={0.3} />
              <StatsCard icon={MailWarning} label="Pending" value={7} color="#ef4444" trend="down" trendValue="-3" delay={0.35} />
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-sky-400" />
              <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Sănătate Platformă</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Cpu, label: "CPU", value: "23%", color: "#10b981", status: "OK" },
                { icon: HardDrive, label: "Storage", value: "24.7 / 100 GB", color: "#3b82f6", status: "OK" },
                { icon: Wifi, label: "API Response", value: "142ms", color: "#8b5cf6", status: "OK" },
                { icon: Activity, label: "Sesiuni Active", value: "24", color: "#f59e0b", status: "Normal" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl group"
                  style={{ background: `${item.color}06`, border: `1px solid ${item.color}10` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}12` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>{item.value}</div>
                    <div className="text-gray-500" style={{ fontSize: "0.7rem" }}>{item.label} · {item.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cereri Overview (Admin supervizes) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Supervizare Cereri — Privire de Ansamblu</h3>
              </div>
              <button onClick={() => navigate("/cereri")} className="flex items-center gap-1 text-pink-400 hover:text-pink-300 cursor-pointer transition-colors" style={{ fontSize: "0.78rem" }}>
                Supervizează <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <DonutChart data={cereriData} size={170} />
              <div className="flex-1 grid grid-cols-3 gap-2 w-full">
                {cereriData.map((item, i) => (
                  <CereriCard key={item.label} value={item.value} label={item.label} color={item.color} delay={0.35 + i * 0.04} />
                ))}
              </div>
            </div>
          </motion.div>

          <ActivityChart />
        </div>

        {/* Right Panel */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">
          {/* Funcționari Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-violet-400" />
                <h3 className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Performanță Funcționari</h3>
              </div>
              <button onClick={() => navigate("/utilizatori")} className="text-gray-500 hover:text-white transition-colors cursor-pointer" style={{ fontSize: "0.72rem" }}>
                Toți →
              </button>
            </div>
            {functionariPerformance.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", fontSize: "0.65rem", fontWeight: 600 }}>
                    {f.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0c0c18] ${f.online ? "bg-emerald-400" : "bg-gray-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 truncate" style={{ fontSize: "0.82rem" }}>{f.name}</div>
                  <div className="text-gray-600" style={{ fontSize: "0.68rem" }}>{f.cereriRezolvate} cereri rez.</div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: f.rata >= 90 ? "#10b981" : f.rata >= 80 ? "#f59e0b" : "#ef4444" }}>{f.rata}%</div>
                  <div className="text-gray-600" style={{ fontSize: "0.6rem" }}>rată</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Admin Deadlines */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Atenție Admin</h3>
              </div>
            </div>
            {[
              { title: "7 conturi neasignate", desc: "Cetățeni noi fără funcționar alocat", color: "#ef4444", action: "Alocă" },
              { title: "2 funcționari inactivi", desc: "Fără activitate > 48h", color: "#f59e0b", action: "Verifică" },
              { title: "Backup programat", desc: "Mâine, 03:00 — confirmare necesară", color: "#3b82f6", action: "Confirmă" },
              { title: "Licență expiră", desc: "Certificat SSL — mai 15 zile", color: "#8b5cf6", action: "Reînnoiește" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0">
                <div className="w-1 h-8 rounded-full" style={{ background: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200" style={{ fontSize: "0.82rem" }}>{item.title}</div>
                  <div className="text-gray-600" style={{ fontSize: "0.68rem" }}>{item.desc}</div>
                </div>
                <button className="px-2 py-1 rounded-lg text-white cursor-pointer transition-all hover:brightness-110" style={{ fontSize: "0.65rem", background: `${item.color}25`, color: item.color, fontWeight: 600 }}>
                  {item.action}
                </button>
              </div>
            ))}
          </motion.div>

          <LiveActivityFeed />
        </div>
      </div>
    </>
  );
}
