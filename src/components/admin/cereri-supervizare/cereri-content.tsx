"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { FileText, Download, BarChart3, List, LayoutGrid, AlertTriangle } from "lucide-react";

import type { Cerere, CerereStatus, Priority, TabView } from "./cereri-data";
import {
  initialCereri,
  statusConfig,
  priorityConfig,
  computeStats,
  computeAlerts,
} from "./cereri-data";
import { CereriOverview } from "./cereri-overview";
import { CereriTable } from "./cereri-table";
import { CereriKanban } from "./cereri-kanban";
import { CereriAlerts } from "./cereri-alerts";
import { CereriDetailDrawer } from "./cereri-detail-drawer";
import { CereriReassignModal } from "./cereri-reassign-modal";

// ─── Preserved interface ──────────────────────────────

export interface CereriContentProps {
  cereri: unknown[];
  functionari: unknown[];
}

// ─── Component ────────────────────────────────────────

export function CereriContent(_props: CereriContentProps) {
  const [cereri, setCereri] = useState<Cerere[]>(initialCereri);
  const [activeTab, setActiveTab] = useState<TabView>("overview");
  const [showReassignModal, setShowReassignModal] = useState<string | null>(null);
  const [detailDrawer, setDetailDrawer] = useState<string | null>(null);

  const stats = useMemo(() => computeStats(cereri), [cereri]);
  const alerts = useMemo(() => computeAlerts(cereri), [cereri]);
  const drawerCerere = detailDrawer ? (cereri.find((c) => c.id === detailDrawer) ?? null) : null;

  // ─── Actions ────────────────────────────────────────

  const handleApprove = useCallback((id: string) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "aprobata" as CerereStatus,
              blocata: false,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: "Aprobata de Admin (escaladare)",
                  actor: "Admin Primarie",
                },
              ],
            }
          : c
      )
    );
    toast.success("Cerere aprobata!");
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#10b981", "#3b82f6", "#ec4899", "#f59e0b"],
    });
  }, []);
  const handleReject = useCallback((id: string) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "respinsa" as CerereStatus,
              blocata: false,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: "Respinsa de Admin",
                  actor: "Admin Primarie",
                },
              ],
            }
          : c
      )
    );
    toast.error("Cerere respinsa.");
  }, []);
  const handleReassign = useCallback((id: string, funcName: string) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              functionar: funcName,
              blocata: false,
              zileInStatus: 0,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: "Reasignata de admin",
                  actor: "Admin Primarie",
                  details: `Nou functionar: ${funcName}`,
                },
              ],
            }
          : c
      )
    );
    toast.success(`Cerere reasignata catre ${funcName}`);
    setShowReassignModal(null);
  }, []);
  const handleUnblock = useCallback((id: string) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              blocata: false,
              motivBlocare: undefined,
              zileInStatus: 0,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: "Deblocata de admin",
                  actor: "Admin Primarie",
                },
              ],
            }
          : c
      )
    );
    toast.success("Cerere deblocata!");
  }, []);
  const handleEscalate = useCallback((id: string) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              escaladata: true,
              prioritate: "urgenta" as Priority,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: "Escaladat la Primar",
                  actor: "Admin Primarie",
                },
              ],
            }
          : c
      )
    );
    toast("Cerere escaladata la Primar!", { icon: "🔺" });
  }, []);
  const handleForceStatus = useCallback((id: string, newStatus: CerereStatus) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              blocata: false,
              zileInStatus: 0,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: `Status fortat: ${statusConfig[newStatus].label}`,
                  actor: "Admin Primarie",
                },
              ],
            }
          : c
      )
    );
    toast(`Status schimbat in ${statusConfig[newStatus].label}`, { icon: "⚡" });
  }, []);
  const handleAddNote = useCallback((id: string, note: string) => {
    if (!note.trim()) return;
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              noteAdmin: [...c.noteAdmin, note],
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: "Nota admin adaugata",
                  actor: "Admin Primarie",
                  details: note,
                },
              ],
            }
          : c
      )
    );
    toast.success("Nota adaugata!");
  }, []);
  const handleChangePriority = useCallback((id: string, newPriority: Priority) => {
    setCereri((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              prioritate: newPriority,
              auditTrail: [
                ...c.auditTrail,
                {
                  timestamp: "4 Mar 2026, 10:00",
                  action: `Prioritate schimbata: ${priorityConfig[newPriority].label}`,
                  actor: "Admin Primarie",
                },
              ],
            }
          : c
      )
    );
    toast(`Prioritate: ${priorityConfig[newPriority].label}`, { icon: "🏷️" });
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <FileText className="h-6 w-6 text-pink-400" /> Supervizare Cereri
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-0.5 text-gray-600"
            style={{ fontSize: "0.83rem" }}
          >
            {stats.total} cereri · {stats.active} active ·{" "}
            {stats.blocate > 0 && <span className="text-red-400">{stats.blocate} blocate · </span>}
            {stats.nealocate > 0 && (
              <span className="text-amber-400">{stats.nealocate} nealocate</span>
            )}
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.success("Export CSV generat")}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-gray-400 transition-all hover:text-white"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Download className="h-3.5 w-3.5" />
          <span style={{ fontSize: "0.82rem" }}>Export</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex w-fit gap-1 rounded-xl p-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {[
          { id: "overview" as TabView, label: "Overview", icon: BarChart3 },
          { id: "table" as TabView, label: "Tabel", icon: List },
          { id: "kanban" as TabView, label: "Kanban", icon: LayoutGrid },
          {
            id: "alerts" as TabView,
            label: `Alerte${alerts.length > 0 ? ` (${alerts.length})` : ""}`,
            icon: AlertTriangle,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="cereriTab"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.08))",
                    border: "1px solid rgba(236,72,153,0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-pink-400" : ""}`} />
              <span className="relative z-10" style={{ fontSize: "0.82rem" }}>
                {tab.label}
              </span>
              {tab.id === "alerts" && alerts.length > 0 && !isActive && (
                <span className="relative z-10 h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <CereriOverview cereri={cereri} stats={stats} alerts={alerts} onSwitchTab={setActiveTab} />
      )}
      {activeTab === "table" && (
        <CereriTable
          cereri={cereri}
          onApprove={handleApprove}
          onReject={handleReject}
          onUnblock={handleUnblock}
          onEscalate={handleEscalate}
          onReassign={(id) => setShowReassignModal(id)}
          onDetailDrawer={(id) => setDetailDrawer(id)}
        />
      )}
      {activeTab === "kanban" && (
        <CereriKanban cereri={cereri} onDetailDrawer={(id) => setDetailDrawer(id)} />
      )}
      {activeTab === "alerts" && (
        <CereriAlerts
          alerts={alerts}
          onApprove={handleApprove}
          onUnblock={handleUnblock}
          onEscalate={handleEscalate}
          onReassign={(id) => setShowReassignModal(id)}
          onDetailDrawer={(id) => setDetailDrawer(id)}
        />
      )}

      {/* Drawer + Modal */}
      <CereriDetailDrawer
        cerere={drawerCerere}
        onClose={() => setDetailDrawer(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onUnblock={handleUnblock}
        onEscalate={handleEscalate}
        onReassign={(id) => setShowReassignModal(id)}
        onAddNote={handleAddNote}
        onChangePriority={handleChangePriority}
        onForceStatus={handleForceStatus}
      />
      <CereriReassignModal
        targetId={showReassignModal}
        cereri={cereri}
        onReassign={handleReassign}
        onClose={() => setShowReassignModal(null)}
      />
    </div>
  );
}
