"use client";

import { MapPin } from "lucide-react";
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
import { usePrimarieSwitch, parseActionUrl } from "@/hooks/use-primarie-switch";
import type { UserPrimarieInfo } from "@/hooks/use-user-primarii";

interface ContextSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrimarie: string;
  targetPrimarie: UserPrimarieInfo;
  destinationLabel: string;
  actionUrl: string;
}

/**
 * Confirmation dialog shown before navigating to a notification from a different primarie.
 *
 * Displays source and target primarie names, the destination page, and requires
 * explicit confirmation before switching context (cookie update + full page reload).
 */
export function ContextSwitchDialog({
  open,
  onOpenChange,
  currentPrimarie,
  targetPrimarie,
  destinationLabel,
  actionUrl,
}: ContextSwitchDialogProps): React.JSX.Element {
  const { switchPrimarie } = usePrimarieSwitch();

  const handleConfirm = (): void => {
    switchPrimarie({
      judetSlug: targetPrimarie.judetSlug,
      localitateSlug: targetPrimarie.localitateSlug,
      judetId: targetPrimarie.judetId,
      localitateId: targetPrimarie.localitateId,
      redirectPath: parseActionUrl(actionUrl),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Schimbare primarie</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Vei fi redirectat de la <strong>{currentPrimarie}</strong> la{" "}
                <strong>{targetPrimarie.numeOficial}</strong>.
              </p>
              <p className="text-muted-foreground text-sm">Destinatie: {destinationLabel}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuleaza</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            <MapPin className="mr-2 h-4 w-4" />
            Continua
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
