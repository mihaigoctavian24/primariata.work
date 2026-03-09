import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Landmark,
  Globe,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
} from "lucide-react";

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}
interface RechartsTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

// ─── Types ────────────────────────────────────────────

export type TxStatus = "success" | "pending" | "failed" | "refunded";

export interface Transaction {
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

// ─── Config ───────────────────────────────────────────

export const statusConfig: Record<TxStatus, { label: string; color: string; icon: LucideIcon }> = {
  success: { label: "Succes", color: "#10b981", icon: CheckCircle2 },
  pending: { label: "Pending", color: "#f59e0b", icon: Clock },
  failed: { label: "Eșuată", color: "#ef4444", icon: XCircle },
  refunded: { label: "Rambursată", color: "#8b5cf6", icon: RefreshCcw },
};

// ─── Mock Data ────────────────────────────────────────

export const monthlyRevenue = [
  { month: "Sep", colectat: 125000, target: 130000, esuat: 3200 },
  { month: "Oct", colectat: 158000, target: 145000, esuat: 4100 },
  { month: "Nov", colectat: 142000, target: 150000, esuat: 2800 },
  { month: "Dec", colectat: 189000, target: 170000, esuat: 5200 },
  { month: "Ian", colectat: 213000, target: 190000, esuat: 3900 },
  { month: "Feb", colectat: 197000, target: 200000, esuat: 4500 },
  { month: "Mar", colectat: 87400, target: 210000, esuat: 1800 },
];

export const dailyVolume = [
  { day: "Lun", tranzactii: 145, valoare: 28500 },
  { day: "Mar", tranzactii: 132, valoare: 24200 },
  { day: "Mie", tranzactii: 168, valoare: 32100 },
  { day: "Joi", tranzactii: 121, valoare: 19800 },
  { day: "Vin", tranzactii: 189, valoare: 37600 },
  { day: "Sâm", tranzactii: 45, valoare: 8200 },
  { day: "Dum", tranzactii: 12, valoare: 2100 },
];

export const paymentMethods = [
  { name: "Card Online", value: 48, count: 892, color: "#3b82f6", icon: CreditCard },
  { name: "Transfer Bancar", value: 28, count: 521, color: "#8b5cf6", icon: Landmark },
  { name: "ghișeu.ro", value: 14, count: 260, color: "#10b981", icon: Globe },
  { name: "Numerar Ghișeu", value: 7, count: 130, color: "#f59e0b", icon: Banknote },
  { name: "POS Terminal", value: 3, count: 56, color: "#06b6d4", icon: Smartphone },
];

export const categoryBreakdown = [
  { name: "Taxe Locale", colectat: 42300, target: 50000, color: "#3b82f6" },
  { name: "Autorizații", colectat: 18700, target: 20000, color: "#8b5cf6" },
  { name: "Amenzi", colectat: 12100, target: 15000, color: "#ef4444" },
  { name: "Certificări", colectat: 8200, target: 8000, color: "#10b981" },
  { name: "Impozite Proprietăți", colectat: 4800, target: 12000, color: "#f59e0b" },
  { name: "Altele", colectat: 1300, target: 5000, color: "#6b7280" },
];

export const allTransactions: Transaction[] = [
  {
    id: "tx-001",
    description: "Taxă locală anuală",
    payer: "Andrei Marinescu",
    amount: 1250,
    method: "Card Online",
    status: "success",
    date: "4 Mar 2026",
    time: "14:32",
    category: "Taxe Locale",
    reference: "TXN-2026-8452",
    gateway: "Netopia",
  },
  {
    id: "tx-002",
    description: "Autorizație construire #AC-2041",
    payer: "SC Construct Pro SRL",
    amount: 3800,
    method: "Transfer Bancar",
    status: "success",
    date: "4 Mar 2026",
    time: "13:15",
    category: "Autorizații",
    reference: "TXN-2026-8451",
    gateway: "BT Pay",
  },
  {
    id: "tx-003",
    description: "Amendă parcare — PB-3892",
    payer: "Vasile Radu",
    amount: 120,
    method: "Card Online",
    status: "failed",
    date: "4 Mar 2026",
    time: "12:48",
    category: "Amenzi",
    reference: "TXN-2026-8450",
    gateway: "Netopia",
    errorCode: "ERR_DECLINED",
  },
  {
    id: "tx-004",
    description: "Certificat fiscal",
    payer: "Maria Popescu",
    amount: 50,
    method: "ghișeu.ro",
    status: "success",
    date: "4 Mar 2026",
    time: "11:20",
    category: "Certificări",
    reference: "TXN-2026-8449",
    gateway: "ghișeu.ro",
  },
  {
    id: "tx-005",
    description: "Impozit proprietate ap. 14B",
    payer: "Laura Dumitrescu",
    amount: 2100,
    method: "Transfer Bancar",
    status: "pending",
    date: "4 Mar 2026",
    time: "10:55",
    category: "Impozite",
    reference: "TXN-2026-8448",
    gateway: "BT Pay",
  },
  {
    id: "tx-006",
    description: "Taxă certificat urbanism",
    payer: "George Ionescu",
    amount: 350,
    method: "Card Online",
    status: "success",
    date: "3 Mar 2026",
    time: "16:42",
    category: "Taxe Locale",
    reference: "TXN-2026-8447",
    gateway: "Netopia",
  },
  {
    id: "tx-007",
    description: "Plată online — contribuabil",
    payer: "Mihai Vlad",
    amount: 80,
    method: "Card Online",
    status: "failed",
    date: "3 Mar 2026",
    time: "15:30",
    category: "Taxe Locale",
    reference: "TXN-2026-8446",
    gateway: "Netopia",
    errorCode: "ERR_TIMEOUT",
  },
  {
    id: "tx-008",
    description: "Autorizație demolare",
    payer: "Florin Neagu",
    amount: 1200,
    method: "Numerar Ghișeu",
    status: "success",
    date: "3 Mar 2026",
    time: "14:10",
    category: "Autorizații",
    reference: "TXN-2026-8445",
    gateway: "Manual",
  },
  {
    id: "tx-009",
    description: "Rambursare — taxă percepută dublu",
    payer: "Cristina Barbu",
    amount: -250,
    method: "Transfer Bancar",
    status: "refunded",
    date: "3 Mar 2026",
    time: "12:00",
    category: "Taxe Locale",
    reference: "TXN-2026-8444",
    gateway: "BT Pay",
  },
  {
    id: "tx-010",
    description: "Certificat fiscal urgent",
    payer: "Dan Enescu",
    amount: 100,
    method: "POS Terminal",
    status: "success",
    date: "3 Mar 2026",
    time: "10:30",
    category: "Certificări",
    reference: "TXN-2026-8443",
    gateway: "POS Primărie",
  },
  {
    id: "tx-011",
    description: "Amendă ordine publică",
    payer: "SC Media SRL",
    amount: 500,
    method: "ghișeu.ro",
    status: "success",
    date: "2 Mar 2026",
    time: "09:15",
    category: "Amenzi",
    reference: "TXN-2026-8442",
    gateway: "ghișeu.ro",
  },
  {
    id: "tx-012",
    description: "Plată online — fond rulment",
    payer: "Ana Sandu",
    amount: 180,
    method: "Card Online",
    status: "failed",
    date: "2 Mar 2026",
    time: "08:45",
    category: "Taxe Locale",
    reference: "TXN-2026-8441",
    gateway: "Netopia",
    errorCode: "ERR_3DS_FAIL",
  },
];

export const gatewaysList = [
  { name: "Netopia", status: "operational", latency: "245ms", uptime: "99.98%", color: "#10b981" },
  { name: "BT Pay", status: "operational", latency: "180ms", uptime: "99.95%", color: "#10b981" },
  { name: "ghișeu.ro", status: "degraded", latency: "520ms", uptime: "98.7%", color: "#f59e0b" },
  {
    name: "POS Primărie",
    status: "operational",
    latency: "85ms",
    uptime: "100%",
    color: "#10b981",
  },
];

// ─── Shared Tooltip ───────────────────────────────────

export const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="mb-1 text-gray-400" style={{ fontSize: "0.72rem" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2" style={{ fontSize: "0.8rem" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
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

// ─── Constants ────────────────────────────────────────

export const MONTH_TARGET = 210000;
export const CURRENT_MONTH_COLLECTED = 87400;
