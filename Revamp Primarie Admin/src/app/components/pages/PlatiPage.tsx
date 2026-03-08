import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  CreditCard, TrendingUp, TrendingDown, ArrowUpRight,
  Download, Wallet, Receipt, BanknoteIcon, Landmark,
  CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCcw,
  Search, Filter, Eye, BarChart3, Percent, Target,
  Smartphone, Globe, Building2, Banknote, ChevronLeft,
  ChevronRight, ArrowDownRight, ArrowUpDown, Zap, ShieldCheck,
  Activity, CircleDollarSign, X, MoreHorizontal,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  LineChart, Line, Legend,
} from "recharts";
import { AnimatedCounter } from "../AnimatedCounter";

// ─── Data ────────────────────────────────────────────────
const monthlyRevenue = [
  { month: "Sep", colectat: 125000, target: 130000, esuat: 3200 },
  { month: "Oct", colectat: 158000, target: 145000, esuat: 4100 },
  { month: "Nov", colectat: 142000, target: 150000, esuat: 2800 },
  { month: "Dec", colectat: 189000, target: 170000, esuat: 5200 },
  { month: "Ian", colectat: 213000, target: 190000, esuat: 3900 },
  { month: "Feb", colectat: 197000, target: 200000, esuat: 4500 },
  { month: "Mar", colectat: 87400, target: 210000, esuat: 1800 },
];

const dailyVolume = [
  { day: "Lun", tranzactii: 145, valoare: 28500 },
  { day: "Mar", tranzactii: 132, valoare: 24200 },
  { day: "Mie", tranzactii: 168, valoare: 32100 },
  { day: "Joi", tranzactii: 121, valoare: 19800 },
  { day: "Vin", tranzactii: 189, valoare: 37600 },
  { day: "Sâm", tranzactii: 45, valoare: 8200 },
  { day: "Dum", tranzactii: 12, valoare: 2100 },
];

const paymentMethods = [
  { name: "Card Online", value: 48, count: 892, color: "#3b82f6", icon: CreditCard },
  { name: "Transfer Bancar", value: 28, count: 521, color: "#8b5cf6", icon: Landmark },
  { name: "ghișeu.ro", value: 14, count: 260, color: "#10b981", icon: Globe },
  { name: "Numerar Ghișeu", value: 7, count: 130, color: "#f59e0b", icon: Banknote },
  { name: "POS Terminal", value: 3, count: 56, color: "#06b6d4", icon: Smartphone },
];

const categoryBreakdown = [
  { name: "Taxe Locale", colectat: 42300, target: 50000, color: "#3b82f6" },
  { name: "Autorizații", colectat: 18700, target: 20000, color: "#8b5cf6" },
  { name: "Amenzi", colectat: 12100, target: 15000, color: "#ef4444" },
  { name: "Certificări", colectat: 8200, target: 8000, color: "#10b981" },
  { name: "Impozite Proprietăți", colectat: 4800, target: 12000, color: "#f59e0b" },
  { name: "Altele", colectat: 1300, target: 5000, color: "#6b7280" },
];

type TxStatus = "success" | "pending" | "failed" | "refunded";

interface Transaction {
  id: string;
  description: string;
  payer: string;
  amount: number;
  method: string;
  status: TxStatus;
  date: string;
  time: string;
  category: string;
  reference: string;
  gateway: string;
  errorCode?: string;
}

const statusConfig: Record<TxStatus, { label: string; color: string; icon: any }> = {
  success: { label: "Succes", color: "#10b981", icon: CheckCircle2 },
  pending: { label: "Pending", color: "#f59e0b", icon: Clock },
  failed: { label: "Eșuată", color: "#ef4444", icon: XCircle },
  refunded: { label: "Rambursată", color: "#8b5cf6", icon: RefreshCcw },
};

const allTransactions: Transaction[] = [
  { id: "tx-001", description: "Taxă locală anuală", payer: "Andrei Marinescu", amount: 1250, method: "Card Online", status: "success", date: "4 Mar 2026", time: "14:32", category: "Taxe Locale", reference: "TXN-2026-8452", gateway: "Netopia" },
  { id: "tx-002", description: "Autorizație construire #AC-2041", payer: "SC Construct Pro SRL", amount: 3800, method: "Transfer Bancar", status: "success", date: "4 Mar 2026", time: "13:15", category: "Autorizații", reference: "TXN-2026-8451", gateway: "BT Pay" },
  { id: "tx-003", description: "Amendă parcare — PB-3892", payer: "Vasile Radu", amount: 120, method: "Card Online", status: "failed", date: "4 Mar 2026", time: "12:48", category: "Amenzi", reference: "TXN-2026-8450", gateway: "Netopia", errorCode: "ERR_DECLINED" },
  { id: "tx-004", description: "Certificat fiscal", payer: "Maria Popescu", amount: 50, method: "ghișeu.ro", status: "success", date: "4 Mar 2026", time: "11:20", category: "Certificări", reference: "TXN-2026-8449", gateway: "ghișeu.ro" },
  { id: "tx-005", description: "Impozit proprietate ap. 14B", payer: "Laura Dumitrescu", amount: 2100, method: "Transfer Bancar", status: "pending", date: "4 Mar 2026", time: "10:55", category: "Impozite", reference: "TXN-2026-8448", gateway: "BT Pay" },
  { id: "tx-006", description: "Taxă certificat urbanism", payer: "George Ionescu", amount: 350, method: "Card Online", status: "success", date: "3 Mar 2026", time: "16:42", category: "Taxe Locale", reference: "TXN-2026-8447", gateway: "Netopia" },
  { id: "tx-007", description: "Plată online — contribuabil", payer: "Mihai Vlad", amount: 80, method: "Card Online", status: "failed", date: "3 Mar 2026", time: "15:30", category: "Taxe Locale", reference: "TXN-2026-8446", gateway: "Netopia", errorCode: "ERR_TIMEOUT" },
  { id: "tx-008", description: "Autorizație demolare", payer: "Florin Neagu", amount: 1200, method: "Numerar Ghișeu", status: "success", date: "3 Mar 2026", time: "14:10", category: "Autorizații", reference: "TXN-2026-8445", gateway: "Manual" },
  { id: "tx-009", description: "Rambursare — taxă percepută dublu", payer: "Cristina Barbu", amount: -250, method: "Transfer Bancar", status: "refunded", date: "3 Mar 2026", time: "12:00", category: "Taxe Locale", reference: "TXN-2026-8444", gateway: "BT Pay" },
  { id: "tx-010", description: "Certificat fiscal urgent", payer: "Dan Enescu", amount: 100, method: "POS Terminal", status: "success", date: "3 Mar 2026", time: "10:30", category: "Certificări", reference: "TXN-2026-8443", gateway: "POS Primărie" },
  { id: "tx-011", description: "Amendă ordine publică", payer: "SC Media SRL", amount: 500, method: "ghișeu.ro", status: "success", date: "2 Mar 2026", time: "09:15", category: "Amenzi", reference: "TXN-2026-8442", gateway: "ghișeu.ro" },
  { id: "tx-012", description: "Plată online — fond rulment", payer: "Ana Sandu", amount: 180, method: "Card Online", status: "failed", date: "2 Mar 2026", time: "08:45", category: "Taxe Locale", reference: "TXN-2026-8441", gateway: "Netopia", errorCode: "ERR_3DS_FAIL" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="text-gray-400 mb-1" style={{ fontSize: "0.72rem" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2" style={{ fontSize: "0.8rem" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white" style={{ fontWeight: 600 }}>
            {typeof p.value === "number" ? p.value.toLocaleString("ro-RO") : p.value}
            {p.name !== "Tranzacții" ? " RON" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

export function PlatiPage() {
  const [chartPeriod, setChartPeriod] = useState<"6m" | "1y">("6m");
  const [txFilter, setTxFilter] = useState<TxStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  // KPI calculations
  const totalTx = allTransactions.length;
  const successTx = allTransactions.filter((t) => t.status === "success").length;
  const failedTx = allTransactions.filter((t) => t.status === "failed").length;
  const pendingTx = allTransactions.filter((t) => t.status === "pending").length;
  const refundedTx = allTransactions.filter((t) => t.status === "refunded").length;
  const successRate = Math.round((successTx / totalTx) * 100 * 10) / 10;
  const failRate = Math.round((failedTx / totalTx) * 100 * 10) / 10;
  const totalCollected = allTransactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const avgTxValue = Math.round(totalCollected / successTx);
  const monthTarget = 210000;
  const currentMonthCollected = 87400;
  const targetProgress = Math.round((currentMonthCollected / monthTarget) * 100);

  const filtered = useMemo(() => {
    let result = [...allTransactions];
    if (txFilter !== "all") result = result.filter((t) => t.status === txFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.payer.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q));
    }
    return result;
  }, [txFilter, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const retryTransaction = (id: string) => {
    toast.success("🔄 Retry inițiat — notificare trimisă către gateway");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            <CircleDollarSign className="w-6 h-6 text-emerald-400" /> Monitorizare Financiară
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
            Urmărire plăți, rată succes, gateway health, tranzacții — Vizualizare Admin
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer text-white transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px rgba(16,185,129,0.25)" }}>
            <Download className="w-4 h-4" />
            <span style={{ fontSize: "0.82rem" }}>Export Raport</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Cards Row 1 — Financial Metrics */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        {[
          { icon: Wallet, label: "Colectat Luna", value: currentMonthCollected, suffix: "RON", color: "#10b981", trend: "+12.3%", up: true },
          { icon: Target, label: "Target Lunar", value: monthTarget, suffix: "RON", color: "#3b82f6", trend: `${targetProgress}%`, up: targetProgress >= 50 },
          { icon: Receipt, label: "Nr. Tranzacții", value: totalTx, suffix: "", color: "#8b5cf6", trend: "+18", up: true },
          { icon: Percent, label: "Rată Succes", value: successRate, suffix: "%", color: "#10b981", trend: "+2.1%", up: true },
          { icon: AlertTriangle, label: "Rată Eșec", value: failRate, suffix: "%", color: "#ef4444", trend: "-0.8%", up: false },
          { icon: BanknoteIcon, label: "Val. Medie Tx", value: avgTxValue, suffix: "RON", color: "#f59e0b", trend: "+5%", up: true },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            whileHover={{ y: -2 }}
            className="rounded-xl p-3.5 group cursor-pointer"
            style={{ background: `${card.color}06`, border: `1px solid ${card.color}10` }}
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: card.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                {card.up ? <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> : <TrendingDown className="w-2.5 h-2.5 text-red-400" />}
                <span style={{ fontSize: "0.6rem", color: card.up ? "#10b981" : "#ef4444" }}>{card.trend}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-white" style={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.1 }}>
                {card.value.toLocaleString("ro-RO")}
              </span>
              {card.suffix && <span className="text-gray-600" style={{ fontSize: "0.65rem" }}>{card.suffix}</span>}
            </div>
            <span className="text-gray-600 mt-0.5 block" style={{ fontSize: "0.68rem" }}>{card.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Target Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl px-5 py-3.5 mb-5 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Target className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-300" style={{ fontSize: "0.82rem" }}>
              Progres Target Martie: <span className="text-white" style={{ fontWeight: 600 }}>{currentMonthCollected.toLocaleString("ro-RO")} RON</span> din {monthTarget.toLocaleString("ro-RO")} RON
            </span>
            <span className="text-white" style={{ fontSize: "0.85rem", fontWeight: 700 }}>{targetProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${targetProgress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: targetProgress >= 80 ? "linear-gradient(90deg, #10b981, #059669)" : targetProgress >= 50 ? "linear-gradient(90deg, #3b82f6, #6366f1)" : "linear-gradient(90deg, #f59e0b, #ef4444)",
              }}
            />
          </div>
        </div>
        <span className="text-gray-500 shrink-0" style={{ fontSize: "0.72rem" }}>
          {Math.round((monthTarget - currentMonthCollected) / (new Date(2026, 2, 31).getDate() - new Date().getDate())).toLocaleString("ro-RO")} RON/zi necesar
        </span>
      </motion.div>

      {/* Transaction Status Distribution + Payment Methods */}
      <div className="grid grid-cols-12 gap-5 mb-5">
        {/* Tx Status Mini Cards */}
        <div className="col-span-3 flex flex-col gap-3">
          {[
            { label: "Succes", count: successTx, color: "#10b981", icon: CheckCircle2 },
            { label: "Pending", count: pendingTx, color: "#f59e0b", icon: Clock },
            { label: "Eșuate", count: failedTx, color: "#ef4444", icon: XCircle },
            { label: "Rambursate", count: refundedTx, color: "#8b5cf6", icon: RefreshCcw },
          ].map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              whileHover={{ x: 3 }}
              onClick={() => { setTxFilter(txFilter === (s.label === "Succes" ? "success" : s.label === "Pending" ? "pending" : s.label === "Eșuate" ? "failed" : "refunded") ? "all" : (s.label === "Succes" ? "success" : s.label === "Pending" ? "pending" : s.label === "Eșuate" ? "failed" : "refunded")); setPage(1); }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all text-left"
              style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div className="flex-1">
                <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>{s.label}</div>
                <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.1 }}>{s.count}</div>
              </div>
              <div className="text-right">
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: s.color }}>
                  {Math.round((s.count / totalTx) * 100)}%
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="col-span-5 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Colectare vs Target</h3>
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["6m", "1y"] as const).map((p) => (
                <button key={p} onClick={() => setChartPeriod(p)} className={`px-3 py-1 rounded-md cursor-pointer transition-all ${chartPeriod === p ? "text-white" : "text-gray-500"}`} style={chartPeriod === p ? { background: "rgba(16,185,129,0.2)", fontSize: "0.75rem" } : { fontSize: "0.75rem" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="finGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="colectat" name="Colectat" stroke="#10b981" strokeWidth={2} fill="url(#finGreenGrad)" />
              <Line type="monotone" dataKey="target" name="Target" stroke="#3b82f680" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              <Area type="monotone" dataKey="esuat" name="Eșuat" stroke="#ef4444" strokeWidth={1.5} fill="rgba(239,68,68,0.05)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="text-white mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Metode de Plată</h3>
          <div className="flex flex-col gap-2.5">
            {paymentMethods.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${m.color}12` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 truncate" style={{ fontSize: "0.78rem" }}>{m.name}</span>
                      <span className="text-white shrink-0" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{m.value}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ background: m.color }}
                      />
                    </div>
                    <span className="text-gray-600" style={{ fontSize: "0.65rem" }}>{m.count} tranzacții</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Category Revenue Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl p-5 mb-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 className="text-white mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Colectare pe Categorii — Martie 2026</h3>
        <div className="grid grid-cols-6 gap-3">
          {categoryBreakdown.map((cat, i) => {
            const progress = Math.min(Math.round((cat.colectat / cat.target) * 100), 100);
            const overTarget = cat.colectat >= cat.target;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 + i * 0.04 }}
                className="rounded-xl p-3.5"
                style={{ background: `${cat.color}06`, border: `1px solid ${cat.color}10` }}
              >
                <div className="text-gray-400 mb-1" style={{ fontSize: "0.7rem" }}>{cat.name}</div>
                <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {(cat.colectat / 1000).toFixed(1)}k
                </div>
                <div className="text-gray-600 mb-2" style={{ fontSize: "0.62rem" }}>din {(cat.target / 1000).toFixed(0)}k target</div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.06 }}
                    className="h-full rounded-full"
                    style={{ background: overTarget ? "#10b981" : cat.color }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontSize: "0.62rem", color: overTarget ? "#10b981" : cat.color, fontWeight: 600 }}>
                    {progress}%
                  </span>
                  {overTarget && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Daily Volume Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5 mb-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 className="text-white mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Volum Zilnic — Săptămâna Curentă</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar yAxisId="left" dataKey="tranzactii" name="Tranzacții" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} opacity={0.8} />
            <Line yAxisId="right" type="monotone" dataKey="valoare" name="Valoare" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Failed Transactions Alert */}
      {failedTx > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300/80 flex-1" style={{ fontSize: "0.83rem" }}>
            <span style={{ fontWeight: 600 }}>{failedTx} tranzacții eșuate</span> în ultima perioadă — verifică gateway-urile de plată.
          </span>
          <button onClick={() => { setTxFilter("failed"); setPage(1); }} className="px-3 py-1 rounded-lg text-red-400 cursor-pointer transition-all hover:bg-red-400/10" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
            Vezi detalii
          </button>
        </motion.div>
      )}

      {/* Transactions Monitor */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Monitorizare Tranzacții</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Caută tranzacție..." className="bg-transparent text-white placeholder:text-gray-600 outline-none w-48" style={{ fontSize: "0.8rem" }} />
            </div>
            <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["all", "success", "pending", "failed", "refunded"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setTxFilter(f); setPage(1); }}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${txFilter === f ? "text-white" : "text-gray-500"}`}
                  style={txFilter === f ? { background: `${f === "all" ? "rgba(236,72,153,0.15)" : statusConfig[f as TxStatus]?.color + "20"}`, fontSize: "0.72rem" } : { fontSize: "0.72rem" }}
                >
                  {f === "all" ? "Toate" : statusConfig[f as TxStatus]?.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-white/[0.04]" style={{ fontSize: "0.67rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <div className="col-span-1">Ref.</div>
          <div className="col-span-3">Descriere / Plătitor</div>
          <div className="col-span-2">Metodă / Gateway</div>
          <div className="col-span-1">Categorie</div>
          <div className="col-span-1">Data</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Sumă</div>
          <div className="col-span-1 text-right">Acțiuni</div>
        </div>

        <AnimatePresence mode="popLayout">
          {paginated.map((tx) => {
            const sc = statusConfig[tx.status];
            const StatusIcon = sc.icon;
            const isExpanded = expandedTx === tx.id;

            return (
              <motion.div key={tx.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  className={`grid grid-cols-12 gap-2 px-5 py-3 items-center cursor-pointer transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.015]"}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                >
                  <div className="col-span-1">
                    <span className="text-gray-600 font-mono" style={{ fontSize: "0.68rem" }}>{tx.reference.split("-").pop()}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="text-white truncate" style={{ fontSize: "0.82rem" }}>{tx.description}</div>
                    <div className="text-gray-600 truncate" style={{ fontSize: "0.68rem" }}>{tx.payer}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-300" style={{ fontSize: "0.78rem" }}>{tx.method}</div>
                    <div className="text-gray-600" style={{ fontSize: "0.65rem" }}>{tx.gateway}</div>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>{tx.category}</span>
                  </div>
                  <div className="col-span-1">
                    <div className="text-gray-400" style={{ fontSize: "0.75rem" }}>{tx.date.replace(" 2026", "")}</div>
                    <div className="text-gray-600" style={{ fontSize: "0.65rem" }}>{tx.time}</div>
                  </div>
                  <div className="col-span-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.68rem", color: sc.color, background: `${sc.color}12`, border: `1px solid ${sc.color}18` }}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span style={{ fontSize: "0.92rem", fontWeight: 600, color: tx.status === "refunded" ? "#8b5cf6" : tx.amount < 0 ? "#ef4444" : "#10b981" }}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("ro-RO")} RON
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    {tx.status === "failed" && (
                      <button onClick={(e) => { e.stopPropagation(); retryTransaction(tx.id); }} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-gray-600 hover:text-amber-400 cursor-pointer transition-all" title="Retry">
                        <RefreshCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setExpandedTx(tx.id); }} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white cursor-pointer transition-all" title="Detalii">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 py-4 mx-5 mb-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="grid grid-cols-5 gap-4">
                          <div>
                            <div className="text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}>Referință Completă</div>
                            <div className="text-white font-mono" style={{ fontSize: "0.82rem" }}>{tx.reference}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}>Gateway</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{tx.gateway}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}>Metodă</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{tx.method}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}>Plătitor</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{tx.payer}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}>Data & Ora</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{tx.date} · {tx.time}</div>
                          </div>
                        </div>
                        {tx.errorCode && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-red-300" style={{ fontSize: "0.78rem" }}>Cod eroare: <span className="font-mono" style={{ fontWeight: 600 }}>{tx.errorCode}</span></span>
                            <button onClick={() => retryTransaction(tx.id)} className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-amber-400 cursor-pointer hover:bg-amber-400/10 transition-all" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                              <RefreshCcw className="w-3 h-3" /> Retry
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
          <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            {filtered.length > 0 ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} din ${filtered.length}` : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg cursor-pointer transition-all ${p === page ? "text-white" : "text-gray-600 hover:text-white hover:bg-white/5"}`} style={p === page ? { background: "rgba(236,72,153,0.2)", fontSize: "0.78rem" } : { fontSize: "0.78rem" }}>
                {p}
              </button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Gateway Health */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-5 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Gateway Status — Health Check</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "Netopia", status: "operational", latency: "245ms", uptime: "99.98%", color: "#10b981" },
            { name: "BT Pay", status: "operational", latency: "180ms", uptime: "99.95%", color: "#10b981" },
            { name: "ghișeu.ro", status: "degraded", latency: "520ms", uptime: "98.7%", color: "#f59e0b" },
            { name: "POS Primărie", status: "operational", latency: "85ms", uptime: "100%", color: "#10b981" },
          ].map((gw, i) => (
            <motion.div
              key={gw.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 + i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: `${gw.color}06`, border: `1px solid ${gw.color}12` }}
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: gw.color }} />
                {gw.status === "operational" && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-30" style={{ background: gw.color }} />}
              </div>
              <div className="flex-1">
                <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: 500 }}>{gw.name}</div>
                <div className="text-gray-600" style={{ fontSize: "0.68rem" }}>
                  {gw.status === "operational" ? "Operațional" : "Degradat"} · {gw.latency} · {gw.uptime}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
