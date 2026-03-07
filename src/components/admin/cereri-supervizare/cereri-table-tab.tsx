"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Flag,
  StickyNote,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setCererePrioritate, addCerereNota, reassignCerere } from "@/actions/admin-cereri";
import type { CerereRow, FunctionarRow } from "@/app/app/[judet]/[localitate]/admin/cereri/page";

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<string, string> = {
  depusa: "Depusă",
  in_verificare: "În verificare",
  info_suplimentara: "Info suplimentare",
  in_procesare: "În procesare",
  aprobata: "Aprobată",
  respinsa: "Respinsă",
};

const STATUS_CLASSES: Record<string, string> = {
  depusa: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  in_verificare: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  info_suplimentara: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  in_procesare: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  aprobata: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  respinsa: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PRIORITATE_CLASSES: Record<string, string> = {
  urgenta: "bg-red-500/10 text-red-400 border-red-500/20",
  ridicata: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  medie: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  scazuta: "bg-muted/50 text-muted-foreground border-border",
};

const PRIORITATE_LABELS: Record<string, string> = {
  urgenta: "Urgentă",
  ridicata: "Ridicată",
  medie: "Medie",
  scazuta: "Scăzută",
};

// ============================================================================
// Helpers
// ============================================================================

function computeSlaRemaining(dataTermen: string | null | undefined): number | null {
  if (!dataTermen) return null;
  const diff = new Date(dataTermen).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function SlaCountdown({ dataTermen }: { dataTermen?: string | null }): React.ReactElement {
  const days = computeSlaRemaining(dataTermen);
  if (days === null) return <span className="text-muted-foreground text-xs">—</span>;

  const colorClass =
    days < 0
      ? "text-red-400"
      : days <= 2
        ? "text-amber-400"
        : days <= 7
          ? "text-yellow-400"
          : "text-muted-foreground";

  return (
    <span className={cn("text-xs font-medium", colorClass)}>
      {days < 0 ? `+${Math.abs(days)}z depășit` : `${days}z rămase`}
    </span>
  );
}

// ============================================================================
// Modal types
// ============================================================================

type ModalType = "priority" | "note" | "reassign" | null;

interface ModalState {
  type: ModalType;
  cerereId: string;
  numar: string;
}

// ============================================================================
// Component
// ============================================================================

interface CereriTableTabProps {
  cereri: CerereRow[];
  functionari: FunctionarRow[];
}

function CereriTableTab({ cereri, functionari }: CereriTableTabProps): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState("all");
  const [prioritateFilter, setPrioritateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [prioritateValue, setPrioritateValue] = useState("medie");
  const [noteText, setNoteText] = useState("");
  const [reassignId, setReassignId] = useState("");
  const [isPending, startTransition] = useTransition();

  // === Filtering ===
  const filtered = useMemo(() => {
    return cereri.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPrioritate = prioritateFilter === "all" || c.prioritate === prioritateFilter;
      const matchesSearch =
        search === "" || c.numar_inregistrare.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesPrioritate && matchesSearch;
    });
  }, [cereri, statusFilter, prioritateFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const getFunctionarName = (id: string | null | undefined): string => {
    if (!id) return "—";
    const f = functionari.find((fn) => fn.id === id);
    return f ? `${f.prenume} ${f.nume}` : "—";
  };

  // === Actions ===
  function openModal(type: NonNullable<ModalType>, cerereId: string, numar: string): void {
    setModal({ type, cerereId, numar });
    setNoteText("");
    setPrioritateValue("medie");
    setReassignId(functionari[0]?.id ?? "");
  }

  function closeModal(): void {
    setModal(null);
  }

  function handleSetPriority(): void {
    if (!modal) return;
    startTransition(async () => {
      const result = await setCererePrioritate(modal.cerereId, prioritateValue);
      if (result.success) {
        toast.success("Prioritate actualizată");
        closeModal();
      } else {
        toast.error(result.error ?? "Eroare la actualizare");
      }
    });
  }

  function handleAddNote(): void {
    if (!modal) return;
    startTransition(async () => {
      const result = await addCerereNota(modal.cerereId, noteText, "Admin");
      if (result.success) {
        toast.success("Notă adăugată");
        closeModal();
      } else {
        toast.error(result.error ?? "Eroare la adăugare notă");
      }
    });
  }

  function handleReassign(): void {
    if (!modal || !reassignId) return;
    startTransition(async () => {
      const result = await reassignCerere(modal.cerereId, reassignId);
      if (result.success) {
        toast.success("Cerere reasignată");
        closeModal();
      } else {
        toast.error(result.error ?? "Eroare la reasignare");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            placeholder="Caută după număr..."
            className="border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-accent-500/50 h-9 rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(0);
          }}
          className="border-border bg-background/50 text-foreground h-9 rounded-lg border px-3 text-sm focus:outline-none"
        >
          <option value="all">Toate statusurile</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={prioritateFilter}
          onChange={(e) => {
            setPrioritateFilter(e.target.value);
            setCurrentPage(0);
          }}
          className="border-border bg-background/50 text-foreground h-9 rounded-lg border px-3 text-sm focus:outline-none"
        >
          <option value="all">Toate prioritățile</option>
          {Object.entries(PRIORITATE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground ml-auto text-xs">{filtered.length} cereri</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.024]">
        {/* Header */}
        <div
          className="grid items-center gap-4 border-b border-white/[0.05] px-4 py-2.5"
          style={{ gridTemplateColumns: "1fr 1.5fr 1.2fr 1fr 0.8fr 0.8fr 40px" }}
        >
          {["Număr", "Tip cerere", "Funcționar", "Status", "Prioritate", "SLA", ""].map((h) => (
            <span
              key={h}
              className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-muted-foreground text-sm">Nicio cerere găsită</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {paginated.map((cerere) => (
              <div
                key={cerere.id}
                className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                style={{ gridTemplateColumns: "1fr 1.5fr 1.2fr 1fr 0.8fr 0.8fr 40px" }}
              >
                <span className="text-foreground font-mono text-xs font-medium">
                  {cerere.numar_inregistrare}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {cerere.tip_cerere_id ?? "—"}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {getFunctionarName(cerere.preluat_de_id)}
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
                    STATUS_CLASSES[cerere.status] ??
                      "bg-muted/50 text-muted-foreground border-border"
                  )}
                >
                  {STATUS_LABELS[cerere.status] ?? cerere.status}
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
                    cerere.prioritate
                      ? (PRIORITATE_CLASSES[cerere.prioritate] ??
                          "bg-muted/50 text-muted-foreground border-border")
                      : "bg-muted/30 text-muted-foreground border-border"
                  )}
                >
                  {cerere.prioritate
                    ? (PRIORITATE_LABELS[cerere.prioritate] ?? cerere.prioritate)
                    : "—"}
                </span>
                <SlaCountdown dataTermen={cerere.data_termen} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground flex items-center justify-center rounded-lg p-1 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => openModal("priority", cerere.id, cerere.numar_inregistrare)}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Setează prioritatea
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openModal("note", cerere.id, cerere.numar_inregistrare)}
                    >
                      <StickyNote className="mr-2 h-4 w-4" />
                      Adaugă notă
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openModal("reassign", cerere.id, cerere.numar_inregistrare)}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Reasignează
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Pagina {currentPage + 1} din {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Priority modal */}
      <Dialog open={modal?.type === "priority"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Setează prioritatea — {modal?.numar}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <select
              value={prioritateValue}
              onChange={(e) => setPrioritateValue(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm"
            >
              {Object.entries(PRIORITATE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Anulează
              </Button>
              <Button size="sm" onClick={handleSetPriority} disabled={isPending}>
                Salvează
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add note modal */}
      <Dialog open={modal?.type === "note"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adaugă notă — {modal?.numar}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nota administratorului..."
              rows={4}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-accent-500/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Anulează
              </Button>
              <Button size="sm" onClick={handleAddNote} disabled={isPending || !noteText.trim()}>
                Adaugă
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign modal */}
      <Dialog open={modal?.type === "reassign"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reasignează — {modal?.numar}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <select
              value={reassignId}
              onChange={(e) => setReassignId(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm"
            >
              {functionari.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.prenume} {f.nume}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Anulează
              </Button>
              <Button size="sm" onClick={handleReassign} disabled={isPending || !reassignId}>
                Reasignează
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { CereriTableTab };
export type { CereriTableTabProps };
