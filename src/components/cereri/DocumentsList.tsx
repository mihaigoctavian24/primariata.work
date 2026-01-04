"use client";

import { useState, useEffect } from "react";
import { Download, File, FileText, Image, Trash2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import { SignatureVerificationBadge } from "@/components/signature/SignatureVerificationBadge";
import { SignaturePreview } from "@/components/signature/SignaturePreview";
import { createClient } from "@/lib/supabase/client";

interface Document {
  id: string;
  nume_fisier: string;
  tip_fisier: string;
  marime_bytes: number;
  tip_document: string;
  descriere: string | null;
  created_at: string;
  cale_fisier: string; // Document path for signature lookup
}

interface DocumentSignature {
  transaction_id: string;
  signed_document_url: string;
}

interface DocumentsListProps {
  cerereId: string;
  documents: Document[];
  onDocumentDeleted?: () => void;
}

export function DocumentsList({ cerereId, documents, onDocumentDeleted }: DocumentsListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Map<string, DocumentSignature>>(new Map());
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [loadingSignatures, setLoadingSignatures] = useState(true);

  // Fetch signature information for all documents
  useEffect(() => {
    async function fetchSignatures() {
      if (documents.length === 0) {
        setLoadingSignatures(false);
        return;
      }

      try {
        const supabase = createClient();

        // Get all document paths to check for signatures
        const documentPaths = documents.map((doc) => doc.cale_fisier).filter(Boolean);

        if (documentPaths.length === 0) {
          setLoadingSignatures(false);
          return;
        }

        // Query signature_audit_log for these documents
        const { data: signatureData, error } = await supabase
          .from("signature_audit_log")
          .select("transaction_id, document_url, signed_document_url")
          .in("document_url", documentPaths)
          .eq("status", "success");

        if (error) {
          console.error("Error fetching signatures:", error);
          setLoadingSignatures(false);
          return;
        }

        // Create a map of document_url -> signature info
        const sigMap = new Map<string, DocumentSignature>();
        signatureData?.forEach((sig) => {
          sigMap.set(sig.document_url, {
            transaction_id: sig.transaction_id,
            signed_document_url: sig.signed_document_url,
          });
        });

        setSignatures(sigMap);
      } catch (error) {
        console.error("Error fetching signatures:", error);
      } finally {
        setLoadingSignatures(false);
      }
    }

    fetchSignatures();
  }, [documents]);

  async function handleDownload(documentId: string, fileName: string) {
    try {
      setDownloading(documentId);

      const response = await fetch(`/api/cereri/${cerereId}/documents/${documentId}`);

      if (!response.ok) {
        throw new Error("Eroare la descărcarea documentului");
      }

      const data = await response.json();

      if (!data.success || !data.data.url) {
        throw new Error("Link de descărcare invalid");
      }

      // Open download URL in new tab
      window.open(data.data.url, "_blank");

      toast.success("Document descărcat cu succes");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error instanceof Error ? error.message : "Eroare la descărcarea documentului");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDelete(documentId: string, fileName: string) {
    try {
      setDeleting(documentId);

      const response = await fetch(`/api/cereri/${cerereId}/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Eroare la ștergerea documentului");
      }

      toast.success(`Documentul "${fileName}" a fost șters`);

      // Trigger refresh
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Eroare la ștergerea documentului");
    } finally {
      setDeleting(null);
    }
  }

  function getFileIcon(tipFisier: string) {
    if (tipFisier.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-600" />;
    }
    if (tipFisier === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <File className="text-muted-foreground h-5 w-5" />;
  }

  function getDocumentTypeLabel(tipDocument: string): string {
    const labels: Record<string, string> = {
      cerere: "Cerere",
      anexa: "Anexă",
      raspuns: "Răspuns",
    };
    return labels[tipDocument] || tipDocument;
  }

  if (documents.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <File className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
        <p className="text-sm">Nu există documente încărcate</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => {
          const signature = signatures.get(doc.cale_fisier);
          const hasSigned = !!signature;

          return (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getFileIcon(doc.tip_fisier)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{doc.nume_fisier}</p>
                          {hasSigned && !loadingSignatures && (
                            <SignatureVerificationBadge
                              transactionId={signature.transaction_id}
                              className="flex-shrink-0"
                            />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {formatFileSize(doc.marime_bytes)}
                          </span>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-muted-foreground text-xs">
                            {getDocumentTypeLabel(doc.tip_document)}
                          </span>
                          {doc.descriere && (
                            <>
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground truncate text-xs">
                                {doc.descriere}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {hasSigned && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSignature(signature.transaction_id)}
                            title="Vezi detalii semnătură"
                          >
                            <Shield className="h-4 w-4 text-green-600" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.id, doc.nume_fisier)}
                          disabled={downloading === doc.id || deleting === doc.id}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={downloading === doc.id || deleting === doc.id}
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Șterge document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ești sigur că vrei să ștergi documentul &quot;{doc.nume_fisier}
                                &quot;? Această acțiune nu poate fi anulată.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id, doc.nume_fisier)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Șterge
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Signature Details Modal */}
      {selectedSignature && (
        <Dialog open={!!selectedSignature} onOpenChange={() => setSelectedSignature(null)}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalii Semnătură Digitală</DialogTitle>
              <DialogDescription>
                Informații complete despre semnătura electronică aplicată pe document
              </DialogDescription>
            </DialogHeader>
            <SignaturePreview
              transactionId={selectedSignature}
              onDownloadSigned={() => {
                // Get signed document URL from signatures map
                const sig = Array.from(signatures.values()).find(
                  (s) => s.transaction_id === selectedSignature
                );
                if (sig?.signed_document_url) {
                  window.open(sig.signed_document_url, "_blank");
                  toast.success("Documentul semnat se descarcă...");
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
