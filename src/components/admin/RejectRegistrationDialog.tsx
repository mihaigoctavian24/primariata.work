"use client";

import { useState } from "react";
import { rejectRegistration } from "@/actions/admin-registration";
import { REJECTION_REASONS } from "@/lib/constants/registration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RejectRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  primarieId: string;
  userName: string;
  onSuccess: () => void;
}

export function RejectRegistrationDialog({
  open,
  onOpenChange,
  registrationId,
  primarieId,
  userName,
  onSuccess,
}: RejectRegistrationDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (!selectedReason) {
      toast.error("Selectati un motiv");
      return;
    }

    setIsSubmitting(true);

    // Build final reason
    const presetLabel =
      REJECTION_REASONS.find((r) => r.value === selectedReason)?.label ?? selectedReason;
    const finalReason = customText.trim() ? `${presetLabel}. ${customText.trim()}` : presetLabel;

    try {
      const result = await rejectRegistration(registrationId, primarieId, finalReason);
      if (result.success) {
        toast.success("Inregistrare respinsa");
        setSelectedReason("");
        setCustomText("");
        onSuccess();
      } else {
        toast.error(result.error ?? "Eroare la respingere");
      }
    } catch {
      toast.error("Eroare la respingere");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Respinge inregistrarea</DialogTitle>
          <DialogDescription>
            Respingeti inregistrarea utilizatorului <strong>{userName}</strong>. Acesta va fi
            notificat prin email si in aplicatie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preset reason dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Motiv <span className="text-red-500">*</span>
            </label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selectati motivul respingerii" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional free-text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Detalii suplimentare (optional)</label>
            <Textarea
              placeholder="Adaugati detalii suplimentare..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value.slice(0, 500))}
              rows={3}
              maxLength={500}
            />
            <p className="text-muted-foreground text-xs">{customText.length}/500 caractere</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Anuleaza
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? "Se proceseaza..." : "Confirma Respingerea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
