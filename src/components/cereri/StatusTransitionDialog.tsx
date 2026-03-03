"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAvailableTransitions, requiresReason } from "@/lib/cereri/transitions";
import type { UserRole } from "@/lib/cereri/transitions";
import { transitionCerereStatus } from "@/actions/cereri-workflow";
import { getCerereStatusLabel, getCerereStatusColor } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";
import { CerereStatus } from "@/lib/validations/cereri";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, Loader2 } from "lucide-react";

interface StatusTransitionDialogProps {
  cerereId: string;
  currentStatus: CerereStatusType;
  userRole: UserRole;
  cerereTitle?: string;
  onSuccess?: () => void;
}

/**
 * Specific button labels for certain transitions.
 * Falls back to "Schimba statusul" for others.
 */
function getTransitionLabel(targetStatus: CerereStatusType): string {
  const labels: Partial<Record<CerereStatusType, string>> = {
    [CerereStatus.APROBATA]: "Aproba cererea",
    [CerereStatus.RESPINSA]: "Respinge cererea",
    [CerereStatus.FINALIZATA]: "Finalizeaza cererea",
    [CerereStatus.ANULATA]: "Anuleaza cererea",
    [CerereStatus.IN_VERIFICARE]: "Incepe verificarea",
    [CerereStatus.IN_PROCESARE]: "Trimite in procesare",
    [CerereStatus.IN_APROBARE]: "Trimite spre aprobare",
    [CerereStatus.INFO_SUPLIMENTARE]: "Solicita informatii",
  };
  return labels[targetStatus] ?? "Schimba statusul";
}

/**
 * StatusTransitionDialog Component
 * Allows staff to change a cerere's status by selecting from valid transitions.
 *
 * - Shows only transitions valid for the user's role
 * - Enforces reason/motiv for transitions that require it
 * - Calls transitionCerereStatus Server Action
 * - Shows toast notifications on success/error
 */
export function StatusTransitionDialog({
  cerereId,
  currentStatus,
  userRole,
  cerereTitle,
  onSuccess,
}: StatusTransitionDialogProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CerereStatusType | null>(null);
  const [motiv, setMotiv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = getAvailableTransitions(currentStatus, userRole);
  const needsReason = selectedStatus ? requiresReason(selectedStatus) : false;
  const isInfoSuplimentare = selectedStatus === CerereStatus.INFO_SUPLIMENTARE;

  const canSubmit = selectedStatus && !isSubmitting && (!needsReason || motiv.trim().length >= 10);

  async function handleSubmit(): Promise<void> {
    if (!selectedStatus || !canSubmit) return;

    try {
      setIsSubmitting(true);
      const result = await transitionCerereStatus(
        cerereId,
        selectedStatus,
        motiv.trim() || undefined
      );

      if (result.success) {
        toast.success(`Statusul a fost schimbat in "${getCerereStatusLabel(selectedStatus)}"`);
        setIsOpen(false);
        setSelectedStatus(null);
        setMotiv("");
        onSuccess?.();
      } else {
        toast.error(result.error || "Eroare la schimbarea statusului");
      }
    } catch (error) {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);
    if (!open) {
      setSelectedStatus(null);
      setMotiv("");
    }
  }

  if (availableTransitions.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2"
        title="Nu aveti permisiunea de a schimba statusul"
      >
        <ArrowRightLeft className="size-4" />
        Schimba statusul
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowRightLeft className="size-4" />
          Schimba statusul
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schimba statusul cererii</DialogTitle>
          <DialogDescription>
            {cerereTitle
              ? `Cerere: ${cerereTitle}`
              : "Selectati noul status pentru aceasta cerere."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status curent:</span>
            <Badge
              className={cn(getCerereStatusColor(currentStatus), "border-0")}
              variant="outline"
            >
              {getCerereStatusLabel(currentStatus)}
            </Badge>
          </div>

          {/* Available transitions as radio-style buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Noul status:</p>
            <div className="grid gap-2">
              {availableTransitions.map((targetStatus) => {
                const isSelected = selectedStatus === targetStatus;
                return (
                  <button
                    key={targetStatus}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(targetStatus);
                      setMotiv("");
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={cn(
                        "size-4 rounded-full border-2 transition-colors",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}
                    />
                    <Badge
                      className={cn(getCerereStatusColor(targetStatus), "border-0")}
                      variant="outline"
                    >
                      {getCerereStatusLabel(targetStatus)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info for info_suplimentare */}
          {isInfoSuplimentare && (
            <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
              Pentru a solicita documente specifice, folositi formularul de solicitare documente.
            </p>
          )}

          {/* Reason/motiv textarea */}
          {selectedStatus && (
            <div className="space-y-2">
              <label htmlFor="motiv" className="text-sm font-medium">
                {needsReason ? "Motiv (obligatoriu)" : "Motiv (optional)"}
              </label>
              <Textarea
                id="motiv"
                value={motiv}
                onChange={(e) => setMotiv(e.target.value)}
                placeholder={
                  needsReason
                    ? "Explicati motivul schimbarii statusului (min. 10 caractere)..."
                    : "Adaugati un motiv optional..."
                }
                className="min-h-[80px]"
                maxLength={2000}
              />
              {needsReason && motiv.trim().length > 0 && motiv.trim().length < 10 && (
                <p className="text-destructive text-xs">
                  Motivul trebuie sa contina minim 10 caractere ({motiv.trim().length}/10)
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Anuleaza
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {selectedStatus ? getTransitionLabel(selectedStatus) : "Schimba statusul"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
