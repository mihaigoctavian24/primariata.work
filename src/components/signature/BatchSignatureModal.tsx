"use client";

import { useState } from "react";
import { FileSignature, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSignature } from "@/hooks/use-signature";
import type { BatchDocumentResult } from "@/lib/signature";

interface BatchSignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: {
    document_url: string;
    cerere_id: string;
    signature_reason?: string;
    display_name?: string; // For UI display
  }[];
  cnp: string;
  batchReason?: string;
  onComplete?: (results: BatchDocumentResult[]) => void;
}

/**
 * Batch Signature Modal
 *
 * Modal dialog for batch signing operations
 * Shows progress, per-document status, and summary
 */
export function BatchSignatureModal({
  open,
  onOpenChange,
  documents,
  cnp,
  batchReason,
  onComplete,
}: BatchSignatureModalProps) {
  const { signBatch, isLoading } = useSignature();
  const [results, setResults] = useState<BatchDocumentResult[] | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    succeeded: number;
    failed: number;
    duration_ms: number;
  } | null>(null);

  const handleSign = async () => {
    setResults(null);
    setSummary(null);

    const result = await signBatch({
      documents: documents.map((doc) => ({
        document_url: doc.document_url,
        cerere_id: doc.cerere_id,
        signature_reason: doc.signature_reason,
      })),
      cnp,
      batch_reason: batchReason,
    });

    if (result && result.results && result.summary) {
      setResults(result.results);
      setSummary(result.summary);
      onComplete?.(result.results);
    }
  };

  const getDocumentDisplayName = (cerereId: string) => {
    const doc = documents.find((d) => d.cerere_id === cerereId);
    return doc?.display_name || `Cerere ${cerereId.substring(0, 8)}...`;
  };

  const successCount = results?.filter((r) => r.status === "success").length || 0;
  const failedCount = results?.filter((r) => r.status === "failed").length || 0;
  const progress = results ? (results.length / documents.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Semnare în Lot (Batch)
          </DialogTitle>
          <DialogDescription>
            Semnați {documents.length} documente simultan cu certificatul dvs. digital
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary Info */}
          {!results && (
            <Alert>
              <AlertDescription>
                <strong>Total documente:</strong> {documents.length}
                <br />
                {batchReason && (
                  <>
                    <strong>Motiv:</strong> {batchReason}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Se semnează documentele...</span>
                <span className="text-muted-foreground">
                  {successCount + failedCount}/{documents.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results Summary */}
          {summary && (
            <Alert variant={failedCount > 0 ? "warning" : "default"}>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>✅ Reușite:</strong> {summary.succeeded}
                  </div>
                  <div>
                    <strong>❌ Eșuate:</strong> {summary.failed}
                  </div>
                  <div>
                    <strong>📊 Total:</strong> {summary.total}
                  </div>
                  <div>
                    <strong>⏱️ Durată:</strong> {(summary.duration_ms / 1000).toFixed(1)}s
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Per-Document Results */}
          {results && results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Rezultate pe document:</h4>
              <ScrollArea className="h-[250px] rounded-md border p-3">
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.cerere_id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        {result.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {getDocumentDisplayName(result.cerere_id)}
                          </p>
                          {result.status === "failed" && result.error && (
                            <p className="text-xs text-red-500">{result.error}</p>
                          )}
                          {result.status === "success" && result.transaction_id && (
                            <p className="text-muted-foreground font-mono text-xs">
                              {result.transaction_id}
                            </p>
                          )}
                        </div>
                      </div>
                      {result.status === "success" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(result.signed_document_url, "_blank")}
                        >
                          Descarcă
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Warning about Mock Signatures */}
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Semnături MOCK</strong> - Acestea sunt semnături de demonstrație și nu sunt
              valide legal. Fiecare document semnat va avea un watermark care indică acest lucru.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          {!results ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Anulează
              </Button>
              <Button onClick={handleSign} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se semnează...
                  </>
                ) : (
                  <>
                    <FileSignature className="mr-2 h-4 w-4" />
                    Semnează {documents.length} Documente
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Închide</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
