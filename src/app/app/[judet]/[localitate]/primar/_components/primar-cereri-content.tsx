"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  Building2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { approveCerere, rejectCerere, addNotaPrimar } from "@/actions/primar-actions";
import type { PrimarCereriData, CerereRow } from "@/actions/primar-actions";

// ============================================================================
// Constants
// ============================================================================

const TABS = ["Prezentare generală", "Escaladare", "Listă", "Analiză"] as const;
type TabIndex = 0 | 1 | 2 | 3;

const STATUS_COLORS: Record<string, string> = {
  depusa: "text-blue-400 bg-blue-500/10",
  in_verificare: "text-yellow-400 bg-yellow-500/10",
  in_procesare: "text-orange-400 bg-orange-500/10",
  aprobata: "text-emerald-400 bg-emerald-500/10",
  respinsa: "text-red-400 bg-red-500/10",
};

const STATUS_LABELS: Record<string, string> = {
  depusa: "Depusă",
  in_verificare: "În verificare",
  in_procesare: "În procesare",
  aprobata: "Aprobată",
  respinsa: "Respinsă",
};

// ============================================================================
// Props
// ============================================================================

interface PrimarCereriContentProps {
  initialData: { success: boolean; data?: PrimarCereriData; error?: string };
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonthLabel(luna: string): string {
  // luna is YYYY-MM
  const [year, month] = luna.split("-");
  if (!year || !month) return luna;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("ro-RO", { month: "short" });
}

function getTopDepartament(cereri: CerereRow[]): string {
  const counts: Record<string, number> = {};
  cereri.forEach((c) => {
    if (c.departament) {
      counts[c.departament] = (counts[c.departament] ?? 0) + 1;
    }
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "—";
}

// ============================================================================
// Sub-components
// ============================================================================

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

function KpiCard({ label, value, icon, colorClass }: KpiCardProps): React.ReactElement {
  return (
    <div className="bg-card flex h-24 items-center gap-4 rounded-xl border border-white/5 px-5">
      <div className={`rounded-lg p-2.5 ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-foreground text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }): React.ReactElement {
  const colorClass = STATUS_COLORS[status] ?? "text-gray-400 bg-gray-500/10";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>{label}</span>
  );
}

// ============================================================================
// Tab 0 — Prezentare generală
// ============================================================================

interface OverviewTabProps {
  data: PrimarCereriData;
}

function OverviewTab({ data }: OverviewTabProps): React.ReactElement {
  const total = data.allCereri.length;
  const escaladed = data.escalatedQueue.length;
  const rezolvate = data.allCereri.filter((c) =>
    ["aprobata", "respinsa"].includes(c.status)
  ).length;
  const topDept = getTopDepartament(data.allCereri);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Total cereri"
          value={total}
          icon={<FileText className="h-5 w-5" />}
          colorClass="bg-blue-500/10 text-blue-400"
        />
        <KpiCard
          label="În așteptare"
          value={escaladed}
          icon={<Clock className="h-5 w-5" />}
          colorClass="bg-amber-500/10 text-amber-400"
        />
        <KpiCard
          label="Rezolvate"
          value={rezolvate}
          icon={<CheckCircle2 className="h-5 w-5" />}
          colorClass="bg-emerald-500/10 text-emerald-400"
        />
        <KpiCard
          label="Top departament"
          value={topDept}
          icon={<Building2 className="h-5 w-5" />}
          colorClass="bg-violet-500/10 text-violet-400"
        />
      </div>

      <div className="bg-card rounded-xl border border-white/5 p-5">
        <p className="text-muted-foreground mb-4 text-sm">Cereri per lună (ultimele 6 luni)</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart
            data={data.cereriByMonth.map((d) => ({ ...d, luna: formatMonthLabel(d.luna) }))}
          >
            <defs>
              <linearGradient id="cereriGrad23" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="luna"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              itemStyle={{ color: "#f59e0b" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#cereriGrad23)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// Tab 1 — Escaladare
// ============================================================================

interface EscaladareTabProps {
  cereri: CerereRow[];
}

function EscaladareTab({ cereri }: EscaladareTabProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  function clearCardError(id: string): void {
    setCardErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleApprove(cerereId: string): void {
    clearCardError(cerereId);
    startTransition(async () => {
      const result = await approveCerere(cerereId);
      if (!result.error) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        router.refresh();
      } else {
        setCardErrors((prev) => ({ ...prev, [cerereId]: result.error ?? "Eroare la aprobare." }));
      }
    });
  }

  function handleReject(cerereId: string): void {
    clearCardError(cerereId);
    startTransition(async () => {
      const result = await rejectCerere(cerereId);
      if (!result.error) {
        router.refresh();
      } else {
        setCardErrors((prev) => ({ ...prev, [cerereId]: result.error ?? "Eroare la respingere." }));
      }
    });
  }

  async function handleAddNote(cerereId: string): Promise<void> {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    const result = await addNotaPrimar(cerereId, noteText.trim());
    setNoteLoading(false);
    if (!result.error) {
      setOpenNoteId(null);
      setNoteText("");
      router.refresh();
    } else {
      setCardErrors((prev) => ({ ...prev, [cerereId]: result.error ?? "Eroare la notă." }));
    }
  }

  if (cereri.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <CheckCircle2 className="h-12 w-12 text-amber-400" />
        <p className="text-foreground font-medium">Nu există cereri de aprobat</p>
        <p className="text-muted-foreground text-sm">
          Toate cererile escaladare au fost procesate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cereri.map((cerere) => (
        <div key={cerere.id} className="bg-card rounded-xl border border-white/5 p-5">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-semibold">{cerere.numar_inregistrare}</span>
                {cerere.tipuri_cereri?.nume && (
                  <span className="text-muted-foreground rounded-md bg-white/5 px-2 py-0.5 text-xs">
                    {cerere.tipuri_cereri.nume}
                  </span>
                )}
                {cerere.prioritate && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    {cerere.prioritate}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {cerere.utilizatori
                  ? `${cerere.utilizatori.prenume} ${cerere.utilizatori.nume}`
                  : "—"}
                {" · "}
                {formatDate(cerere.created_at)}
              </p>
            </div>
            <StatusBadge status={cerere.status} />
          </div>

          {/* Error */}
          {cardErrors[cerere.id] && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {cardErrors[cerere.id]}
            </div>
          )}

          {/* Note input */}
          <AnimatePresence>
            {openNoteId === cerere.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Adaugă o notă..."
                  rows={3}
                  className="bg-muted/50 focus:ring-ring w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenNoteId(null);
                      setNoteText("");
                    }}
                    className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:text-gray-200"
                  >
                    Anulează
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAddNote(cerere.id)}
                    disabled={noteLoading || !noteText.trim()}
                    className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/25 disabled:opacity-50"
                  >
                    {noteLoading ? "Se salvează..." : "Salvează nota"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApprove(cerere.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aprobă
            </button>
            <button
              type="button"
              onClick={() => handleReject(cerere.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/25 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Respinge
            </button>
            <button
              type="button"
              onClick={() => {
                if (openNoteId === cerere.id) {
                  setOpenNoteId(null);
                  setNoteText("");
                } else {
                  setOpenNoteId(cerere.id);
                  setNoteText("");
                }
              }}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/10"
            >
              <MessageSquare className="h-4 w-4" />
              Notă
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Tab 2 — Listă
// ============================================================================

interface ListaTabProps {
  cereri: CerereRow[];
}

function ListaTab({ cereri }: ListaTabProps): React.ReactElement {
  const [search, setSearch] = useState("");

  const filtered = cereri.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = c.utilizatori
      ? `${c.utilizatori.prenume} ${c.utilizatori.nume}`.toLowerCase()
      : "";
    return c.numar_inregistrare.toLowerCase().includes(q) || name.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Caută după număr sau petiționar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card focus:ring-ring w-full rounded-xl border border-white/5 py-2.5 pr-4 pl-9 text-sm outline-none focus:ring-1"
        />
      </div>

      {/* Table */}
      <div className="bg-card overflow-hidden rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="text-muted-foreground px-4 py-3 font-medium">Nr. înreg.</th>
              <th className="text-muted-foreground px-4 py-3 font-medium">Tip</th>
              <th className="text-muted-foreground px-4 py-3 font-medium">Petiționar</th>
              <th className="text-muted-foreground px-4 py-3 font-medium">Departament</th>
              <th className="text-muted-foreground px-4 py-3 font-medium">Status</th>
              <th className="text-muted-foreground px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground py-12 text-center">
                  {search ? "Niciun rezultat găsit." : "Nu există cereri."}
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`transition hover:bg-white/[0.03] ${i < filtered.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <td className="text-foreground px-4 py-3 font-medium">{c.numar_inregistrare}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {c.tipuri_cereri?.nume ?? "—"}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {c.utilizatori ? `${c.utilizatori.prenume} ${c.utilizatori.nume}` : "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{c.departament ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{formatDate(c.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Tab 3 — Analiză
// ============================================================================

interface AnalizaTabProps {
  cereriByMonth: { luna: string; total: number }[];
}

function AnalizaTab({ cereriByMonth }: AnalizaTabProps): React.ReactElement {
  const chartData = cereriByMonth.map((d) => ({ ...d, luna: formatMonthLabel(d.luna) }));
  const totals = cereriByMonth.map((d) => d.total);
  const avg = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const peakIdx = totals.indexOf(Math.max(...totals));
  const peakMonth = cereriByMonth[peakIdx] ? formatMonthLabel(cereriByMonth[peakIdx].luna) : "—";

  return (
    <div className="space-y-6">
      {/* Mini KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-white/5 p-5">
          <p className="text-muted-foreground text-sm">Medie / lună</p>
          <p className="text-foreground mt-1 text-3xl font-semibold">{avg}</p>
        </div>
        <div className="bg-card rounded-xl border border-white/5 p-5">
          <p className="text-muted-foreground text-sm">Luna cu vârf</p>
          <p className="text-foreground mt-1 text-3xl font-semibold">{peakMonth}</p>
        </div>
      </div>

      {/* Area chart */}
      <div className="bg-card rounded-xl border border-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-400" />
          <p className="text-foreground text-sm font-medium">Cereri per lună (6 luni)</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cereriAnaliza23" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="luna"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              itemStyle={{ color: "#f59e0b" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#cereriAnaliza23)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PrimarCereriContent({ initialData }: PrimarCereriContentProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabIndex>(0);

  // Error state
  if (!initialData.success) {
    return (
      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        Eroare la încărcarea datelor. Încearcă să recarci pagina.
      </div>
    );
  }

  const data = initialData.data!;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-2">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i as TabIndex)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === i ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === i && (
              <motion.span
                layoutId="cereriTab"
                className="absolute inset-0 rounded-full bg-amber-500/15"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
            {/* Badge for escaladare count */}
            {i === 1 && data.escalatedQueue.length > 0 && (
              <span className="relative z-10 ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-black">
                {data.escalatedQueue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 0 && <OverviewTab data={data} />}
          {activeTab === 1 && <EscaladareTab cereri={data.escalatedQueue} />}
          {activeTab === 2 && <ListaTab cereri={data.allCereri} />}
          {activeTab === 3 && <AnalizaTab cereriByMonth={data.cereriByMonth} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
