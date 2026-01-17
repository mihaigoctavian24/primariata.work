"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkCancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  count: number;
  isLoading?: boolean;
}

/**
 * BulkCancelDialog Component
 * Confirmation dialog for bulk cancellation of cereri
 *
 * Features:
 * - Shows count of selected cereri
 * - Warning about irreversible action
 * - Loading state during cancellation
 * - Accessible with proper ARIA labels
 */
export function BulkCancelDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  count,
  isLoading = false,
}: BulkCancelDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anulare cereri în masă</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Sigur doriți să anulați <span className="text-foreground font-semibold">{count}</span>{" "}
              {count === 1 ? "cerere" : "cereri"}?
            </span>
            <span className="text-destructive block text-sm font-medium">
              Atenție: Această acțiune nu poate fi anulată. Cererile vor fi marcate ca anulate și nu
              vor mai putea fi procesate.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Renunță</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Anulare în curs..." : "Anulează cereri"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
