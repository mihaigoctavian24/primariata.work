"use client";

import { useState } from "react";
import { Download, File, FileText, Image, Trash2 } from "lucide-react";
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
import { formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

interface Document {
  id: string;
  nume_fisier: string;
  tip_fisier: string;
  marime_bytes: number;
  tip_document: string;
  descriere: string | null;
  created_at: string;
}

interface DocumentsListProps {
  cerereId: string;
  documents: Document[];
  onDocumentDeleted?: () => void;
}

export function DocumentsList({ cerereId, documents, onDocumentDeleted }: DocumentsListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getFileIcon(doc.tip_fisier)}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.nume_fisier}</p>
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
                            Ești sigur că vrei să ștergi documentul &quot;{doc.nume_fisier}&quot;?
                            Această acțiune nu poate fi anulată.
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
      ))}
    </div>
  );
}
