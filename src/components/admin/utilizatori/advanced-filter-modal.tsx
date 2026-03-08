"use client";

import { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/shared/admin-modal";

// ============================================================================
// Types
// ============================================================================

export interface AdvancedFilters {
  rol: string; // "all" | "cetatean" | "functionar" | "primar" | "admin"
  status: string; // "all" | "activ" | "pending" | "suspendat"
  departament: string; // "all" | specific department name
}

export interface AdvancedFilterModalProps {
  open: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  departamente: string[]; // unique department list passed from parent
}

const SELECT_CLASS =
  "w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm outline-none cursor-pointer focus:ring-1 focus:ring-[var(--color-info)]/50";

// ============================================================================
// Component
// ============================================================================

export function AdvancedFilterModal({
  open,
  onClose,
  filters,
  onApply,
  departamente,
}: AdvancedFilterModalProps): React.JSX.Element {
  const [draft, setDraft] = useState<AdvancedFilters>(filters);

  // Sync draft when modal opens with latest filters
  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [open, filters]);

  function handleApply(): void {
    onApply(draft);
  }

  function handleReset(): void {
    const reset: AdvancedFilters = { rol: "all", status: "all", departament: "all" };
    setDraft(reset);
    onApply(reset);
  }

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={handleReset}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        Resetează
      </button>
      <button
        type="button"
        onClick={handleApply}
        className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: "var(--color-info)" }}
      >
        Aplică Filtre
      </button>
    </div>
  );

  return (
    <AdminModal open={open} onClose={onClose} title="Filtre Avansate" size="sm" footer={footer}>
      <div className="space-y-4">
        {/* Rol filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Rol
          </label>
          <select
            value={draft.rol}
            onChange={(e) => setDraft((d) => ({ ...d, rol: e.target.value }))}
            className={SELECT_CLASS}
          >
            <option value="all">All Roluri</option>
            <option value="cetatean">Cetățean</option>
            <option value="functionar">Funcționar</option>
            <option value="primar">Primar</option>
            <option value="admin">Admin Primărie</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Status
          </label>
          <select
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
            className={SELECT_CLASS}
          >
            <option value="all">Toate Statusurile</option>
            <option value="activ">Activ</option>
            <option value="pending">În așteptare</option>
            <option value="suspendat">Suspendat</option>
          </select>
        </div>

        {/* Departament filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Departament
          </label>
          <select
            value={draft.departament}
            onChange={(e) => setDraft((d) => ({ ...d, departament: e.target.value }))}
            className={SELECT_CLASS}
          >
            <option value="all">Toate Departamentele</option>
            {departamente.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>
      </div>
    </AdminModal>
  );
}
