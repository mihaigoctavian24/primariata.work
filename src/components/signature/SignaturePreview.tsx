"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  User,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifySignature, type SignatureVerification } from "@/lib/signature";
import { SignatureVerificationBadge } from "./SignatureVerificationBadge";

interface SignaturePreviewProps {
  transactionId: string;
  onDownloadSigned?: () => void;
  onViewOriginal?: () => void;
  className?: string;
}

/**
 * Signature Preview Component
 *
 * Displays comprehensive signature information including:
 * - Verification status
 * - Signer details
 * - Document links
 * - Certificate status
 * - Timestamp and age
 */
export function SignaturePreview({
  transactionId,
  onDownloadSigned,
  onViewOriginal,
  className,
}: SignaturePreviewProps) {
  const [verification, setVerification] = useState<SignatureVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      setIsLoading(true);
      const result = await verifySignature(transactionId);
      setVerification(result);
      setIsLoading(false);
    }

    verify();
  }, [transactionId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Se încarcă detalii semnătură...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!verification || !verification.success) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Eroare verificare semnătură</CardTitle>
          <CardDescription>
            {verification?.error || "Nu s-a putut verifica semnătura"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { signature, certificate, documents, is_mock, is_valid } = verification;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detalii Semnătură Digitală
            </CardTitle>
            <CardDescription className="mt-1">Transaction ID: {transactionId}</CardDescription>
          </div>
          <SignatureVerificationBadge transactionId={transactionId} showDetails />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mock Warning */}
        {is_mock && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Semnătură MOCK (PoC)</strong> - Această semnătură este generată pentru
              demonstrație și nu este validă legal. Nu utilizați în producție.
            </AlertDescription>
          </Alert>
        )}

        {/* Certificate Warning */}
        {certificate?.warning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{certificate.warning}</AlertDescription>
          </Alert>
        )}

        {/* Signer Information */}
        {signature && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              Informații Semnatar
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Nume</p>
                <p className="font-medium">{signature.signer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CNP (mascat)</p>
                <p className="font-mono font-medium">{signature.signer_cnp_masked}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Certificat Serial</p>
                <p className="font-mono text-xs font-medium">{signature.certificate_serial}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Algoritm</p>
                <p className="font-medium">{signature.algorithm}</p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Signature Details */}
        {signature && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4" />
              Detalii Semnare
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Data semnării</p>
                <p className="font-medium">
                  {new Date(signature.timestamp).toLocaleString("ro-RO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Vechime semnătură</p>
                <p className="font-medium">
                  {signature.age_days === 0 ? "Astăzi" : `${signature.age_days} zile`}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Motiv semnare</p>
                <p className="font-medium">{signature.reason}</p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Certificate Status */}
        {certificate && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4" />
              Status Certificat
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{certificate.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Validitate semnătură</p>
                <p className="font-medium">{is_valid ? "✅ Valid" : "❌ Invalid"}</p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Documents */}
        {documents && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" />
              Documente
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Document semnat</p>
                    <p className="text-muted-foreground text-xs">
                      {documents.signed_url.split("/").pop()?.substring(0, 40)}...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(documents.signed_url, "_blank")}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Vizualizează
                  </Button>
                  {onDownloadSigned && (
                    <Button variant="default" size="sm" onClick={onDownloadSigned}>
                      <Download className="mr-1 h-3 w-3" />
                      Descarcă
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Document original</p>
                    <p className="text-muted-foreground text-xs">
                      {documents.original_url.split("/").pop()?.substring(0, 40)}...
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onViewOriginal
                      ? onViewOriginal()
                      : window.open(documents.original_url, "_blank")
                  }
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Vizualizează
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
