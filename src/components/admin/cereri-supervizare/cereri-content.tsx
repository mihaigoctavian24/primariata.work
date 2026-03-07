"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, BarChart3, List, Columns, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CereriOverviewTab } from "./cereri-overview-tab";
import { CereriTableTab } from "./cereri-table-tab";
import { CereriKanbanTab } from "./cereri-kanban-tab";
import { CereriAlertsTab } from "./cereri-alerts-tab";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Types
// ============================================================================

type ActiveTab = "overview" | "table" | "kanban" | "alerts";

interface Tab {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CereriContentProps {
  cereri: CerereRow[];
  functionari: FunctionarRow[];
}

// ============================================================================
// Constants
// ============================================================================

const TABS: Tab[] = [
  { id: "overview", label: "Prezentare", icon: BarChart3 },
  { id: "table", label: "Tabel", icon: List },
  { id: "kanban", label: "Kanban", icon: Columns },
  { id: "alerts", label: "Alerte", icon: AlertTriangle },
];

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Component
// ============================================================================

function CereriContent({ cereri, functionari }: CereriContentProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [cereriState, setCereriState] = useState<CerereRow[]>(cereri);

  // Count alerts for badge
  const alertCount = cereriState.filter((c) => {
    const sla = computeSlaRemaining(c.data_termen);
    return (sla !== null && sla < 0) || c.escaladata === true;
  }).length;

  // Optimistic status change handler passed to Kanban tab
  const handleStatusChange = useCallback((id: string, newDbStatus: string) => {
    setCereriState((prev) => prev.map((c) => (c.id === id ? { ...c, status: newDbStatus } : c)));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent-500/10 flex h-9 w-9 items-center justify-center rounded-xl">
            <FileText className="text-accent-500 h-5 w-5" />
          </div>
          <div>
            <h1 className="text-foreground text-xl font-bold">Supervizare Cereri</h1>
            <p className="text-muted-foreground text-xs">{cereriState.length} cereri active</p>
          </div>
        </div>
        {alertCount > 0 && (
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-400">{alertCount} alerte active</span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAlerts = tab.id === "alerts";

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "text-foreground bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {isAlerts && alertCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
                  {alertCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 -z-10 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content with AnimatePresence transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {activeTab === "overview" && <CereriOverviewTab cereri={cereriState} />}
          {activeTab === "table" && (
            <CereriTableTab cereri={cereriState} functionari={functionari} />
          )}
          {activeTab === "kanban" && (
            <CereriKanbanTab
              cereri={cereriState}
              functionari={functionari}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "alerts" && (
            <CereriAlertsTab cereri={cereriState} functionari={functionari} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export { CereriContent };
export type { CereriContentProps };
