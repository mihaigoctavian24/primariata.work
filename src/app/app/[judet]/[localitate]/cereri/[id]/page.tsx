"use client";

import { logger } from "@/lib/logger";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  X,
  AlertCircle,
  FileText,
  User,
  Calendar,
  CreditCard,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { Cerere } from "@/types/api";
import type { CerereStatusType } from "@/lib/validations/cereri";
import type { UserRole } from "@/lib/cereri/transitions";
import { DocumentsList } from "@/components/cereri/DocumentsList";
import { CancelCerereDialog } from "@/components/cereri/CancelCerereDialog";
import { StatusBadge } from "@/components/cereri/StatusBadge";
import { SlaIndicator } from "@/components/cereri/SlaIndicator";
import { CerereTimeline } from "@/components/cereri/CerereTimeline";
import { StatusTransitionDialog } from "@/components/cereri/StatusTransitionDialog";
import { InternalNoteForm } from "@/components/cereri/InternalNoteForm";
import { canCancelCerere } from "@/lib/validations/cereri";
import { resubmitCerere } from "@/actions/cereri-workflow";
import { getCerereDetails, getCerereDocuments, cancelCerere } from "@/actions/cereri-detail";
import { createClient } from "@/lib/supabase/client";

interface CerereDetailsPageProps {
  params: Promise<{
    judet: string;
    localitate: string;
    id: string;
  }>;
}

export default function CerereDetailsPage({ params }: CerereDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [cerere, setCerere] = useState<Cerere | null>(null);
  const [documents, setDocuments] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Staff role detection
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isStaff = userRole === "functionar" || userRole === "admin" || userRole === "primar";

  useEffect(() => {
    fetchCerereDetails();
    fetchDocuments();
    fetchUserRole();
    markNotificationsAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchUserRole(): Promise<void> {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setCurrentUserId(user.id);

      // Check user_primarii for staff role
      const { data: userPrimarie } = await supabase
        .from("user_primarii")
        .select("rol")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(1)
        .single();

      if (userPrimarie?.rol) {
        setUserRole(userPrimarie.rol as UserRole);
      } else {
        setUserRole("cetatean");
      }
    } catch (err) {
      logger.error("Error fetching user role:", err);
      setUserRole("cetatean");
    }
  }

  async function fetchCerereDetails(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const result = await getCerereDetails(id);

      if (result.success) {
        setCerere(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscuta");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDocuments(): Promise<void> {
    try {
      setLoadingDocuments(true);

      const result = await getCerereDocuments(id);

      if (result.success) {
        setDocuments(result.data);
      } else {
        logger.error("Failed to fetch documents:", result.error);
      }
    } catch (err) {
      logger.error("Error fetching documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function markNotificationsAsRead(): Promise<void> {
    try {
      const supabase = createClient();

      const { data: notifications } = await supabase
        .from("notifications")
        .select("id")
        .is("read_at", null)
        .contains("metadata", { cerere_id: id });

      if (notifications && notifications.length > 0) {
        await supabase
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .in(
            "id",
            notifications.map((n) => n.id)
          );
      }
    } catch (err) {
      logger.error("Error marking notifications as read:", err);
    }
  }

  async function handleCancelCerere(motiv: string): Promise<void> {
    if (!cerere) return;

    try {
      const result = await cancelCerere(cerere.id, motiv);

      if (!result.success) {
        throw new Error(result.error || "Eroare la anularea cererii");
      }

      toast.success("Cerere anulata cu succes");
      fetchCerereDetails();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la anularea cererii");
      throw err;
    }
  }

  async function handleResubmit(): Promise<void> {
    if (!cerere) return;

    try {
      setIsResubmitting(true);
      const result = await resubmitCerere(cerere.id);

      if (result.success) {
        toast.success("Cererea a fost retrimisa cu succes");
        fetchCerereDetails();
      } else {
        toast.error(result.error || "Eroare la retrimiterea cererii");
      }
    } catch (err) {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsResubmitting(false);
    }
  }

  async function handleInitiatePayment(): Promise<void> {
    if (!cerere || !cerere.valoare_plata) return;

    try {
      setInitiatingPayment(true);

      const response = await fetch("/api/plati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cerere_id: cerere.id,
          suma: cerere.valoare_plata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Eroare la initializarea platii");
      }

      const data = await response.json();
      window.location.href = data.data.redirect_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la initializarea platii");
      setInitiatingPayment(false);
    }
  }

  async function handleDownloadAll(): Promise<void> {
    if (!cerere) return;

    try {
      toast.info("Pregatire descarcare...");

      const response = await fetch(`/api/cereri/${cerere.id}/documents/download-all`);

      if (!response.ok) {
        throw new Error("Eroare la descarcarea documentelor");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cerere_${cerere.numar_inregistrare || cerere.id}_documente.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Documente descarcate cu succes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la descarcarea documentelor");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground text-sm">Se incarca cererea...</p>
        </div>
      </div>
    );
  }

  if (error || !cerere) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Cerere negasita"}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Inapoi
        </Button>
      </div>
    );
  }

  const canCancel = canCancelCerere(cerere.status as CerereStatusType);
  const canPay =
    cerere.necesita_plata &&
    !cerere.plata_efectuata &&
    cerere.status !== "anulata" &&
    cerere.status !== "respinsa";

  // Citizen can resubmit when cerere is in info_suplimentare and they are the owner
  const canResubmit =
    cerere.status === "info_suplimentare" && currentUserId === cerere.solicitant_id;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Static header - Back button */}
      <div className="border-border/40 sticky top-0 z-10 flex-shrink-0 border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Inapoi la lista de cereri
          </Button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl space-y-6 p-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-2xl">
                      {cerere.numar_inregistrare || "Fara numar"}
                    </CardTitle>
                    <StatusBadge status={cerere.status as CerereStatusType} />
                    <SlaIndicator
                      dataTermen={cerere.data_termen}
                      status={cerere.status}
                      totalPausedDays={cerere.sla_total_paused_days}
                      showDays
                    />
                  </div>
                  <CardDescription className="text-base">
                    {cerere.tip_cerere?.nume || "Tip necunoscut"}
                  </CardDescription>
                </div>
                <div className="text-muted-foreground text-right text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Depusa: {format(new Date(cerere.created_at), "dd MMMM yyyy", { locale: ro })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Timeline Card - Data-driven from cerere_istoric */}
          <Card>
            <CardHeader>
              <CardTitle>Istoricul cererii</CardTitle>
            </CardHeader>
            <CardContent>
              <CerereTimeline cerereId={cerere.id} isStaff={isStaff} />

              {/* Termen estimat */}
              {cerere.data_termen && cerere.status !== "finalizata" && (
                <div className="bg-muted/50 mt-4 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground font-medium">Termen estimat:</span>
                    <span className="font-semibold">
                      {format(new Date(cerere.data_termen), "dd MMMM yyyy", { locale: ro })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Actions Card */}
          {isStaff && userRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Actiuni personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusTransitionDialog
                    cerereId={cerere.id}
                    currentStatus={cerere.status as CerereStatusType}
                    userRole={userRole}
                    cerereTitle={cerere.numar_inregistrare}
                    onSuccess={fetchCerereDetails}
                  />
                </div>
                <Separator />
                <InternalNoteForm cerereId={cerere.id} onSuccess={fetchCerereDetails} />
              </CardContent>
            </Card>
          )}

          {/* Citizen Resubmit Card */}
          {canResubmit && (
            <Card className="border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Informatii suplimentare solicitate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Primaria a solicitat informatii sau documente suplimentare. Verificati detaliile
                  in istoricul de mai sus si incarcati documentele necesare.
                </p>
                <Button onClick={handleResubmit} disabled={isResubmitting} className="gap-2">
                  {isResubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Retrimite cererea
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Form Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalii cerere
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cerere.date_formular && Object.keys(cerere.date_formular).length > 0 ? (
                <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(cerere.date_formular).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground text-sm font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="mt-1 text-sm">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-muted-foreground text-sm">Nu exista date suplimentare</p>
              )}

              {cerere.observatii_solicitant && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Observatii solicitant
                    </dt>
                    <dd className="mt-1 text-sm whitespace-pre-wrap">
                      {cerere.observatii_solicitant}
                    </dd>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Documente
                </CardTitle>
                {documents.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                    <Download className="mr-2 h-4 w-4" />
                    Descarca tot
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingDocuments ? (
                <div className="text-muted-foreground py-8 text-center">
                  <div className="border-primary mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2" />
                  <p className="text-sm">Se incarca documentele...</p>
                </div>
              ) : (
                <DocumentsList
                  cerereId={id}
                  documents={documents as never}
                  onDocumentDeleted={fetchDocuments}
                />
              )}
            </CardContent>
          </Card>

          {/* Functionar Assigned */}
          {cerere.preluat_de_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Functionar asignat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{cerere.preluat_de_id}</p>
              </CardContent>
            </Card>
          )}

          {/* Observatii Admin */}
          {cerere.raspuns && (
            <Card>
              <CardHeader>
                <CardTitle>Raspuns administrator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{cerere.raspuns}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {canPay && (
              <Button
                onClick={handleInitiatePayment}
                disabled={initiatingPayment}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {initiatingPayment
                  ? "Initializare..."
                  : `Plateste ${cerere.valoare_plata?.toFixed(2)} RON`}
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <X className="mr-2 h-4 w-4" />
                Anuleaza cererea
              </Button>
            )}
          </div>

          {/* Cancel Dialog */}
          <CancelCerereDialog
            isOpen={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            onConfirm={handleCancelCerere}
            cerereNumar={cerere?.numar_inregistrare}
          />
        </div>
      </div>
    </div>
  );
}
