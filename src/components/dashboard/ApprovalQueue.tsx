"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { SlaIndicator } from "@/components/cereri/SlaIndicator";
import { transitionCerereStatus } from "@/actions/cereri-workflow";

interface ApprovalQueueItem {
  id: string;
  numar_inregistrare: string;
  tip_cerere_name: string;
  solicitant_name: string;
  created_at: string;
  data_termen: string | null;
  status: string;
}

interface ApprovalQueueProps {
  items: ApprovalQueueItem[];
  isLoading: boolean;
  judet: string;
  localitate: string;
  onActionComplete: () => void;
}

export function ApprovalQueue({
  items,
  isLoading,
  judet,
  localitate,
  onActionComplete,
}: ApprovalQueueProps): React.ReactElement {
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCerereId, setSelectedCerereId] = useState<string | null>(null);
  const [rejectMotiv, setRejectMotiv] = useState("");

  const handleApprove = async (cerereId: string): Promise<void> => {
    setApprovingId(cerereId);
    try {
      const result = await transitionCerereStatus(cerereId, "aprobata");
      if (result.success) {
        toast.success("Cererea a fost aprobata");
        onActionComplete();
      } else {
        toast.error(result.error || "Eroare la aprobare");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectDialog = (cerereId: string): void => {
    setSelectedCerereId(cerereId);
    setRejectMotiv("");
    setRejectDialogOpen(true);
  };

  const handleReject = async (): Promise<void> => {
    if (!selectedCerereId || !rejectMotiv.trim()) return;

    setRejectingId(selectedCerereId);
    try {
      const result = await transitionCerereStatus(selectedCerereId, "respinsa", rejectMotiv.trim());
      if (result.success) {
        toast.success("Cererea a fost respinsa");
        setRejectDialogOpen(false);
        setSelectedCerereId(null);
        setRejectMotiv("");
        onActionComplete();
      } else {
        toast.error(result.error || "Eroare la respingere");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setRejectingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="ml-auto h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle className="text-muted-foreground/40 mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">Nicio cerere in asteptare pentru aprobare</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs uppercase">
              <th className="pr-4 pb-2 font-medium">Nr. Inregistrare</th>
              <th className="pr-4 pb-2 font-medium">Tip Cerere</th>
              <th className="hidden pr-4 pb-2 font-medium sm:table-cell">Solicitant</th>
              <th className="hidden pr-4 pb-2 font-medium md:table-cell">Data Depunere</th>
              <th className="pr-4 pb-2 font-medium">Termen SLA</th>
              <th className="pb-2 text-right font-medium">Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isProcessing = approvingId === item.id || rejectingId === item.id;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-muted/50 cursor-pointer border-b transition-colors last:border-0"
                  onClick={() => router.push(`/app/${judet}/${localitate}/cereri/${item.id}`)}
                >
                  <td className="py-3 pr-4 font-medium">{item.numar_inregistrare}</td>
                  <td className="py-3 pr-4">{item.tip_cerere_name}</td>
                  <td className="hidden py-3 pr-4 sm:table-cell">{item.solicitant_name}</td>
                  <td className="hidden py-3 pr-4 md:table-cell">
                    {item.created_at
                      ? format(new Date(item.created_at), "dd MMM yyyy", { locale: ro })
                      : "-"}
                  </td>
                  <td className="py-3 pr-4">
                    <SlaIndicator dataTermen={item.data_termen} status={item.status} />
                  </td>
                  <td className="py-3 text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                        onClick={() => handleApprove(item.id)}
                        disabled={isProcessing}
                      >
                        {approvingId === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4" />
                        )}
                        <span className="hidden lg:inline">Aproba</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                        onClick={() => openRejectDialog(item.id)}
                        disabled={isProcessing}
                      >
                        {rejectingId === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                        <span className="hidden lg:inline">Respinge</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respinge Cererea</DialogTitle>
            <DialogDescription>
              Introduceti motivul respingerii. Acesta va fi vizibil pentru solicitant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectMotiv}
              onChange={(e) => setRejectMotiv(e.target.value)}
              placeholder="Motivul respingerii (minim 10 caractere)..."
              className="min-h-[100px]"
              maxLength={2000}
            />
            {rejectMotiv.trim().length > 0 && rejectMotiv.trim().length < 10 && (
              <p className="text-destructive mt-1 text-xs">
                Motivul trebuie sa contina minim 10 caractere ({rejectMotiv.trim().length}/10)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejectingId !== null}
            >
              Anuleaza
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMotiv.trim().length < 10 || rejectingId !== null}
            >
              {rejectingId ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Respinge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
