"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancelCerereDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motiv: string) => Promise<void>;
  cerereNumar?: string;
}

export function CancelCerereDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  cerereNumar,
}: CancelCerereDialogProps) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [motiv, setMotiv] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("input");
      setMotiv("");
      setError("");
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  // Validate and move to confirmation step
  const handleNext = () => {
    if (motiv.trim().length < 10) {
      setError("Motivul trebuie să conțină cel puțin 10 caractere");
      return;
    }
    setError("");
    setStep("confirm");
  };

  // Go back to input step
  const handleBack = () => {
    setStep("input");
    setError("");
  };

  // Final confirmation and submit
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(motiv.trim());
      handleOpenChange(false);
    } catch {
      // Error handling is done in the parent component
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "input" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="text-destructive size-5" />
                Anulare cerere
              </DialogTitle>
              <DialogDescription>
                {cerereNumar
                  ? `Cererea ${cerereNumar} va fi anulată.`
                  : "Această cerere va fi anulată."}{" "}
                Vă rugăm să introduceți motivul anulării.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="motiv">
                  Motiv anulare <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="motiv"
                  placeholder="Introduceți motivul pentru care doriți să anulați această cerere (minim 10 caractere)..."
                  value={motiv}
                  onChange={(e) => {
                    setMotiv(e.target.value);
                    if (error) setError("");
                  }}
                  className={error ? "border-destructive" : ""}
                  rows={4}
                />
                <div className="flex items-center justify-between text-xs">
                  {error ? (
                    <span className="text-destructive">{error}</span>
                  ) : (
                    <span className="text-muted-foreground">Minim 10 caractere necesare</span>
                  )}
                  <span
                    className={
                      motiv.trim().length >= 10 ? "text-green-600" : "text-muted-foreground"
                    }
                  >
                    {motiv.trim().length} / 10
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Renunță
              </Button>
              <Button type="button" onClick={handleNext} disabled={motiv.trim().length < 10}>
                Continuă
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive size-5" />
                Confirmare anulare
              </DialogTitle>
              <DialogDescription>
                Ești sigur că vrei să anulezi această cerere? Această acțiune nu poate fi anulată.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="border-border/40 bg-muted/30 rounded-lg border p-4">
                <Label className="text-sm font-medium">Motiv anulare:</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap">{motiv}</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleBack}>
                Înapoi
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Se anulează..." : "Confirmă anularea"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
