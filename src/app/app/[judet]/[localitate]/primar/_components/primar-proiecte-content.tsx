"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, X, AlertTriangle, Landmark, Check, Loader2 } from "lucide-react";
import { createProiect, updateProiect, deleteProiect } from "@/actions/primar-actions";
import type { ProiectRow } from "@/actions/primar-actions";

// ============================================================================
// Status badge styles
// ============================================================================

const STATUS_CONFIG: Record<ProiectRow["status"], { label: string; className: string }> = {
  in_derulare: {
    label: "În derulare",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  planificat: {
    label: "Planificat",
    className: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  },
  finalizat: {
    label: "Finalizat",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  intarziat: {
    label: "Întârziat",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

function formatRON(value: number): string {
  return value.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// Default form state
// ============================================================================

interface ProiectFormState {
  nume: string;
  categorie: string;
  status: ProiectRow["status"];
  progres_pct: number;
  buget: number;
  buget_consumat: number;
  deadline: string;
  responsabil: string;
}

const EMPTY_FORM: ProiectFormState = {
  nume: "",
  categorie: "",
  status: "planificat",
  progres_pct: 0,
  buget: 0,
  buget_consumat: 0,
  deadline: "",
  responsabil: "",
};

function formFromProiect(p: ProiectRow): ProiectFormState {
  return {
    nume: p.nume,
    categorie: p.categorie ?? "",
    status: p.status,
    progres_pct: p.progres_pct,
    buget: p.buget,
    buget_consumat: p.buget_consumat,
    deadline: p.deadline ?? "",
    responsabil: p.responsabil ?? "",
  };
}

// ============================================================================
// Inline form component (shared by create and edit)
// ============================================================================

interface ProiectFormProps {
  form: ProiectFormState;
  onChange: (patch: Partial<ProiectFormState>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  error: string | null;
  submitLabel: string;
}

function ProiectForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  error,
  submitLabel,
}: ProiectFormProps): React.ReactElement {
  return (
    <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Nume + Categorie */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-white/50">
            Nume proiect <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={form.nume}
            onChange={(e) => onChange({ nume: e.target.value })}
            placeholder="ex: Reabilitare str. Principală"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Categorie</label>
          <input
            type="text"
            value={form.categorie}
            onChange={(e) => onChange({ categorie: e.target.value })}
            placeholder="ex: Infrastructură"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Row 2: Status + Progres */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-white/50">Status</label>
          <select
            value={form.status}
            onChange={(e) => onChange({ status: e.target.value as ProiectRow["status"] })}
            className="w-full rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          >
            <option value="planificat">Planificat</option>
            <option value="in_derulare">În derulare</option>
            <option value="finalizat">Finalizat</option>
            <option value="intarziat">Întârziat</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Progres ({form.progres_pct}%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.progres_pct}
            onChange={(e) =>
              onChange({ progres_pct: Math.min(100, Math.max(0, Number(e.target.value))) })
            }
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Row 3: Buget + Buget consumat */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-white/50">Buget alocat (RON)</label>
          <input
            type="number"
            min={0}
            value={form.buget}
            onChange={(e) => onChange({ buget: Number(e.target.value) })}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Buget consumat (RON)</label>
          <input
            type="number"
            min={0}
            value={form.buget_consumat}
            onChange={(e) => onChange({ buget_consumat: Number(e.target.value) })}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Row 4: Deadline + Responsabil */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-white/50">Termen limită</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => onChange({ deadline: e.target.value })}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Responsabil</label>
          <input
            type="text"
            value={form.responsabil}
            onChange={(e) => onChange({ responsabil: e.target.value })}
            placeholder="Nume responsabil"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white/80 disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
          Anulează
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || !form.nume.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30 disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ProiectCard component
// ============================================================================

interface ProiectCardProps {
  proiect: ProiectRow;
  onEdit: (p: ProiectRow) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deleteConfirmId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

function ProiectCard({
  proiect,
  onEdit,
  onDelete,
  isDeleting,
  deleteConfirmId,
  onConfirmDelete,
  onCancelDelete,
}: ProiectCardProps): React.ReactElement {
  const statusCfg = STATUS_CONFIG[proiect.status];
  const isConfirming = deleteConfirmId === proiect.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Name + status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white">{proiect.nume}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
            {proiect.categorie && (
              <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/40">
                {proiect.categorie}
              </span>
            )}
          </div>

          {/* Responsabil */}
          {proiect.responsabil && (
            <p className="mt-1 text-xs text-white/40">Resp: {proiect.responsabil}</p>
          )}

          {/* Progress bar */}
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/40">
              <span>Progres</span>
              <span>{proiect.progres_pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
              <div
                className="h-1.5 rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: `${proiect.progres_pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onEdit(proiect)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/40 transition-colors hover:border-white/10 hover:text-white/70"
            title="Editează proiect"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(proiect.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400/50 transition-colors hover:border-red-500/20 hover:text-red-400"
            title="Șterge proiect"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Budget + deadline */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/40">
        <span>
          <span className="text-white/60">{formatRON(proiect.buget_consumat)}</span>
          {" / "}
          {formatRON(proiect.buget)} RON
        </span>
        {proiect.deadline && <span>Termen: {formatDate(proiect.deadline)}</span>}
      </div>

      {/* Inline delete confirm */}
      <AnimatePresence>
        {isConfirming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5">
              <span className="text-sm text-red-400">Ești sigur că vrei să ștergi?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="rounded-lg border border-white/[0.08] px-3 py-1 text-xs text-white/60 hover:text-white/80"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={() => onConfirmDelete(proiect.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-40"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Da, șterge
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Main content component
// ============================================================================

interface PrimarProiecteContentProps {
  initialData: {
    success: boolean;
    data?: { proiecte: ProiectRow[] };
    error?: string;
  };
}

export function PrimarProiecteContent({
  initialData,
}: PrimarProiecteContentProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [createForm, setCreateForm] = useState<ProiectFormState>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<ProiectFormState>(EMPTY_FORM);

  // Error state
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ---- Error banner ----
  if (!initialData.success || !initialData.data) {
    return (
      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            {initialData.error ?? "Eroare la încărcarea datelor. Încearcă să recarci pagina."}
          </span>
        </div>
      </div>
    );
  }

  const proiecte = initialData.data.proiecte;

  // ---- Handlers ----

  function handleCreate(): void {
    if (!createForm.nume.trim()) return;
    setCreateError(null);
    startTransition(async () => {
      const { error } = await createProiect({
        nume: createForm.nume.trim(),
        categorie: createForm.categorie.trim() || undefined,
        status: createForm.status,
        progres_pct: createForm.progres_pct,
        buget: createForm.buget,
        buget_consumat: createForm.buget_consumat,
        deadline: createForm.deadline || undefined,
        responsabil: createForm.responsabil.trim() || undefined,
      });
      if (error) {
        setCreateError(error);
      } else {
        setCreateForm(EMPTY_FORM);
        setShowCreateForm(false);
        router.refresh();
      }
    });
  }

  function handleOpenEdit(proiect: ProiectRow): void {
    setEditingId(proiect.id);
    setEditForm(formFromProiect(proiect));
    setEditError(null);
    setDeleteConfirmId(null);
  }

  function handleSaveEdit(): void {
    if (!editingId || !editForm.nume.trim()) return;
    setEditError(null);
    startTransition(async () => {
      const { error } = await updateProiect(editingId, {
        nume: editForm.nume.trim(),
        categorie: editForm.categorie.trim() || null,
        status: editForm.status,
        progres_pct: editForm.progres_pct,
        buget: editForm.buget,
        buget_consumat: editForm.buget_consumat,
        deadline: editForm.deadline || null,
        responsabil: editForm.responsabil.trim() || null,
      });
      if (error) {
        setEditError(error);
      } else {
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function handleDeleteRequest(id: string): void {
    setDeleteConfirmId(id);
    setDeleteError(null);
  }

  function handleConfirmDelete(id: string): void {
    setDeleteError(null);
    startTransition(async () => {
      const { error } = await deleteProiect(id);
      if (error) {
        setDeleteError(error);
      } else {
        setDeleteConfirmId(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Proiecte municipale</h1>
          <p className="mt-1 text-sm text-white/50">
            {proiecte.length === 0
              ? "Nu există proiecte înregistrate"
              : `${proiecte.length} proiect${proiecte.length !== 1 ? "e" : ""} înregistrat${proiecte.length !== 1 ? "e" : ""}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreateForm((v) => !v);
            setCreateForm(EMPTY_FORM);
            setCreateError(null);
          }}
          className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30"
        >
          <Plus className="h-4 w-4" />
          Proiect nou
        </button>
      </motion.div>

      {/* Delete error banner */}
      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{deleteError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <ProiectForm
              form={createForm}
              onChange={(patch) => setCreateForm((prev) => ({ ...prev, ...patch }))}
              onSubmit={handleCreate}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateError(null);
              }}
              isPending={isPending}
              error={createError}
              submitLabel="Creează proiect"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {proiecte.length === 0 && !showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] py-16"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Landmark className="h-8 w-8 text-amber-400/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/60">Nu există proiecte</p>
            <p className="mt-1 text-xs text-white/30">Adaugă primul proiect municipal</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30"
          >
            <Plus className="h-4 w-4" />
            Proiect nou
          </button>
        </motion.div>
      )}

      {/* Project list */}
      <AnimatePresence mode="popLayout">
        {proiecte.map((proiect) =>
          editingId === proiect.id ? (
            <motion.div
              key={proiect.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProiectForm
                form={editForm}
                onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={handleSaveEdit}
                onCancel={() => {
                  setEditingId(null);
                  setEditError(null);
                }}
                isPending={isPending}
                error={editError}
                submitLabel="Salvează modificările"
              />
            </motion.div>
          ) : (
            <ProiectCard
              key={proiect.id}
              proiect={proiect}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteRequest}
              isDeleting={isPending}
              deleteConfirmId={deleteConfirmId}
              onConfirmDelete={handleConfirmDelete}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}
