"use client";

import { useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  isLoading?: boolean;
}

export function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
  isLoading = false,
}: NotificationsHeaderProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmMarkAllRead = () => {
    onMarkAllRead();
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          {/* Title and Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notificări</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-6 px-2 text-xs">
                {unreadCount} necitite
              </Badge>
            )}
          </div>

          {/* Mark All Read Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            disabled={unreadCount === 0 || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Marchează toate ca citite</span>
            <span className="sm:hidden">Marchează toate</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marchează toate ca citite?</AlertDialogTitle>
            <AlertDialogDescription>
              Sigur vrei să marchezi toate notificările ca citite? Această acțiune nu poate fi
              anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMarkAllRead}>Marchează</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
