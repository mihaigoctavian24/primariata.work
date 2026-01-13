"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { Cerere } from "@/types/api";
import { DocumentsList } from "@/components/cereri/DocumentsList";
import { CancelCerereDialog } from "@/components/cereri/CancelCerereDialog";
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

  useEffect(() => {
    fetchCerereDetails();
    fetchDocuments();
    markNotificationsAsRead();
  }, [id]);

  async function fetchCerereDetails() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cereri/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Cererea nu a fost găsită");
        }
        throw new Error("Eroare la încărcarea cererii");
      }

      const data = await response.json();
      setCerere(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDocuments() {
    try {
      setLoadingDocuments(true);

      const response = await fetch(`/api/cereri/${id}/documents`);

      if (!response.ok) {
        console.error("Failed to fetch documents");
        return;
      }

      const data = await response.json();
      setDocuments(data.data || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function markNotificationsAsRead() {
    try {
      const supabase = createClient();

      // Update all unread notifications for this cerere
      // First find notifications related to this cerere
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
      console.error("Error marking notifications as read:", err);
      // Silent fail - don't interrupt user experience
    }
  }

  async function handleCancelCerere(motiv: string) {
    if (!cerere) return;

    try {
      const response = await fetch(`/api/cereri/${cerere.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motiv_anulare: motiv }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Eroare la anularea cererii");
      }

      toast.success("Cerere anulată cu succes");
      fetchCerereDetails(); // Refresh data
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la anularea cererii");
      throw err; // Re-throw to let dialog know there was an error
    }
  }

  async function handleInitiatePayment() {
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
        throw new Error(error.error?.message || "Eroare la inițializarea plății");
      }

      const data = await response.json();

      // Redirect to checkout page
      window.location.href = data.data.redirect_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la inițializarea plății");
      setInitiatingPayment(false);
    }
  }

  async function handleDownloadAll() {
    if (!cerere) return;

    try {
      toast.info("Pregătire descărcare...");

      const response = await fetch(`/api/cereri/${cerere.id}/documents/download-all`);

      if (!response.ok) {
        throw new Error("Eroare la descărcarea documentelor");
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

      toast.success("Documente descărcate cu succes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la descărcarea documentelor");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground text-sm">Se încarcă cererea...</p>
        </div>
      </div>
    );
  }

  if (error || !cerere) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Cerere negăsită"}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi
        </Button>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "Ciornă", color: "bg-gray-500" },
    depusa: { label: "Depusă", color: "bg-blue-500" },
    trimisa: { label: "Trimisă", color: "bg-blue-500" },
    in_procesare: { label: "În procesare", color: "bg-yellow-500" },
    finalizata: { label: "Finalizată", color: "bg-green-500" },
    anulata: { label: "Anulată", color: "bg-red-500" },
    respinsa: { label: "Respinsă", color: "bg-red-600" },
  };

  const currentStatus = statusConfig[cerere.status] || {
    label: cerere.status,
    color: "bg-gray-400",
  };
  const canCancel =
    cerere.status === "draft" || cerere.status === "trimisa" || cerere.status === "depusa";

  const canPay =
    cerere.necesita_plata &&
    !cerere.plata_efectuata &&
    cerere.status !== "anulata" &&
    cerere.status !== "respinsa";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Static header - Back button */}
      <div className="border-border/40 sticky top-0 z-10 flex-shrink-0 border-b bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la lista de cereri
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
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">
                      {cerere.numar_inregistrare || "Fără număr"}
                    </CardTitle>
                    <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
                  </div>
                  <CardDescription className="text-base">
                    {cerere.tip_cerere?.nume || "Tip necunoscut"}
                  </CardDescription>
                </div>
                <div className="text-muted-foreground text-right text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Depusă: {format(new Date(cerere.created_at), "dd MMMM yyyy", { locale: ro })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Starea cererii</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Horizontal Timeline */}
                <div className="py-4">
                  {/* Timeline steps - Grid layout (same as WizardLayout) */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Step 1: Depusă */}
                    <div
                      className={`relative ${"after:absolute after:top-5 after:left-1/2 after:h-0.5 after:w-[calc(100%+1rem)]"} ${
                        ["in_procesare", "finalizata"].includes(cerere.status)
                          ? "after:bg-orange-400"
                          : "after:bg-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* Circle */}
                        <div
                          className={`relative z-10 mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm ${
                            [
                              "depusa",
                              "trimisa",
                              "in_verificare",
                              "in_procesare",
                              "finalizata",
                            ].includes(cerere.status)
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {[
                            "depusa",
                            "trimisa",
                            "in_verificare",
                            "in_procesare",
                            "finalizata",
                          ].includes(cerere.status) && (
                            <div className="h-4 w-4 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Label */}
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              [
                                "depusa",
                                "trimisa",
                                "in_verificare",
                                "in_procesare",
                                "finalizata",
                              ].includes(cerere.status)
                                ? "text-blue-700"
                                : "text-gray-500"
                            }`}
                          >
                            Cerere depusă
                          </p>
                          {cerere.created_at && (
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {format(new Date(cerere.created_at), "dd MMM yyyy, HH:mm", {
                                locale: ro,
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 2: În procesare */}
                    <div
                      className={`relative ${"after:absolute after:top-5 after:left-1/2 after:h-0.5 after:w-[calc(100%+1rem)]"} ${
                        cerere.status === "finalizata"
                          ? "after:bg-green-500"
                          : ["anulata", "respinsa"].includes(cerere.status)
                            ? "after:bg-red-500"
                            : "after:bg-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* Circle */}
                        <div
                          className={`relative z-10 mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm ${
                            ["in_procesare", "finalizata"].includes(cerere.status)
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {["in_procesare", "finalizata"].includes(cerere.status) && (
                            <div className="h-4 w-4 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Label */}
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              ["in_procesare", "finalizata"].includes(cerere.status)
                                ? "text-orange-600"
                                : "text-gray-500"
                            }`}
                          >
                            În procesare
                          </p>
                          {cerere.status === "in_procesare" && (
                            <p className="mt-0.5 text-xs font-medium text-orange-600">În curs...</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Finalizată */}
                    <div className="relative">
                      <div className="flex flex-col items-center text-center">
                        {/* Circle */}
                        <div
                          className={`relative z-10 mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm ${
                            cerere.status === "finalizata"
                              ? "border-green-600 bg-green-600"
                              : cerere.status === "anulata"
                                ? "border-red-600 bg-red-600"
                                : cerere.status === "respinsa"
                                  ? "border-red-700 bg-red-700"
                                  : "border-gray-300 bg-white"
                          }`}
                        >
                          {["finalizata", "anulata", "respinsa"].includes(cerere.status) && (
                            <div className="h-4 w-4 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Label */}
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              cerere.status === "finalizata"
                                ? "text-green-700"
                                : cerere.status === "anulata"
                                  ? "text-red-700"
                                  : cerere.status === "respinsa"
                                    ? "text-red-800"
                                    : "text-gray-500"
                            }`}
                          >
                            {cerere.status === "anulata"
                              ? "Anulată"
                              : cerere.status === "respinsa"
                                ? "Respinsă"
                                : "Finalizată"}
                          </p>
                          {cerere.status === "finalizata" && cerere.data_termen && (
                            <p className="mt-0.5 text-xs font-medium text-green-700">
                              {format(new Date(cerere.data_termen), "dd MMM yyyy", { locale: ro })}
                            </p>
                          )}
                          {cerere.status === "anulata" && cerere.motiv_respingere && (
                            <p
                              className="mt-0.5 max-w-[120px] truncate text-xs font-medium text-red-700"
                              title={cerere.motiv_respingere}
                            >
                              {cerere.motiv_respingere}
                            </p>
                          )}
                          {cerere.status === "respinsa" && cerere.raspuns && (
                            <p
                              className="mt-0.5 max-w-[120px] truncate text-xs font-medium text-red-800"
                              title={cerere.raspuns}
                            >
                              {cerere.raspuns}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Termen estimat */}
                {cerere.data_termen && cerere.status !== "finalizata" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground font-medium">Termen estimat:</span>
                      <span className="font-semibold">
                        {format(new Date(cerere.data_termen), "dd MMMM yyyy", { locale: ro })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                <p className="text-muted-foreground text-sm">Nu există date suplimentare</p>
              )}

              {cerere.observatii_solicitant && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Observații solicitant
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
                    Descarcă tot
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingDocuments ? (
                <div className="text-muted-foreground py-8 text-center">
                  <div className="border-primary mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2" />
                  <p className="text-sm">Se încarcă documentele...</p>
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
                  Funcționar asignat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{cerere.preluat_de_id}</p>
              </CardContent>
            </Card>
          )}

          {/* Observații Admin */}
          {cerere.raspuns && (
            <Card>
              <CardHeader>
                <CardTitle>Răspuns administrator</CardTitle>
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
                  ? "Inițializare..."
                  : `Plătește ${cerere.valoare_plata?.toFixed(2)} RON`}
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <X className="mr-2 h-4 w-4" />
                Anulează cererea
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
