"use client";

import { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/shared/admin-modal";
import { cn } from "@/lib/utils";

export interface AdvancedFilters {
  rol: string;      // "all" | "cetatean" | "functionar" | "primar" | "admin"
  status: string;   // "all" | "activ" | "pending" | "suspendat"
  departament: string; // "all" | specific department name
}

export interface AdvancedFilterModalProps {
  open: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  departamente: string[]; // unique department list passed from parent
}

export function AdvancedFilterModal({
  open,
  onClose,
  filters,
  onApply,
  departamente,
}: AdvancedFilterModalProps): React.JSX.Element {
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(filters);

  // Sync draft filters when modal opens
  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApply(draftFilters);
  };

  const handleReset = () => {
    const resetFilters: AdvancedFilters = {
      rol: "all",
      status: "all",
      departament: "all",
    };
    setDraftFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Filtre Avansate"
      size="sm"
      footer={
        <div className="flex justify-between w-full">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-border bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
          >
            Resetează
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-white/[0.05] transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-info)] hover:brightness-110 text-white transition-colors"
            >
              Aplică Filtre
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Rol</span>
          <select
            value={draftFilters.rol}
            onChange={(e) => setDraftFilters({ ...draftFilters, rol: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none cursor-pointer focus:ring-1 focus:ring-[var(--color-info)]/50 transition-shadow"
          >
            <option value="all">Toate Rolurile</option>
            <option value="cetatean">Cetățean</option>
            <option value="functionar">Funcționar</option>
            <option value="primar">Primar</option>
            <option value="admin">Admin Primărie</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Status</span>
          <select
            value={draftFilters.status}
            onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none cursor-pointer focus:ring-1 focus:ring-[var(--color-info)]/50 transition-shadow"
          >
            <option value="all">Toate Statusurile</option>
            <option value="activ">Activ</option>
            <option value="pending">În așteptare</option>
            <option value="suspendat">Suspendat</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Departament</span>
          <select
            value={draftFilters.departament}
            onChange={(e) => setDraftFilters({ ...draftFilters, departament: e.target.value })}
            className={cn(
               "w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none cursor-pointer transition-shadow",
               departamente.length > 0 ? "focus:ring-1 focus:ring-[var(--color-info)]/50" : "opacity-50 cursor-not-allowed"
            )}
            disabled={departamente.length === 0}
          >
            <option value="all">Toate Departamentele</option>
            {departamente.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          {departamente.length === 0 && (
            <span className="text-xs text-muted-foreground mt-1">
              Nu există departamente înrudite utilizatorilor actuali.
            </span>
          )}
        </label>
      </div>
    </AdminModal>
  );
}
