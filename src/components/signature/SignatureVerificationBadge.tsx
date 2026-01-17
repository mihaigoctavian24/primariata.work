"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { verifySignature, type SignatureVerification } from "@/lib/signature";

interface SignatureVerificationBadgeProps {
  transactionId: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * Signature Verification Badge
 *
 * Displays a visual badge indicating signature validity status
 * Automatically fetches and verifies signature on mount
 */
export function SignatureVerificationBadge({
  transactionId,
  showDetails = false,
  className,
}: SignatureVerificationBadgeProps) {
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
      <Badge variant="secondary" className={className}>
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Se verifică...
      </Badge>
    );
  }

  if (!verification || !verification.success) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className={className}>
              <ShieldX className="mr-1 h-3 w-3" />
              Verificare eșuată
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{verification?.error || "Nu s-a putut verifica semnătura"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Valid signature
  if (verification.is_valid) {
    const isMock = verification.is_mock;
    const ageDays = verification.signature?.age_days || 0;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={isMock ? "warning" : "success"} className={className}>
              <ShieldCheck className="mr-1 h-3 w-3" />
              {isMock ? "Mock Valid" : "Semnătură validă"}
              {showDetails && ageDays > 0 && <span className="ml-1">({ageDays}z)</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{verification.signature?.signer_name}</p>
              <p className="text-xs">CNP: {verification.signature?.signer_cnp_masked}</p>
              <p className="text-xs">
                Semnat:{" "}
                {new Date(verification.signature?.timestamp || "").toLocaleDateString("ro-RO")}
              </p>
              {isMock && (
                <p className="text-xs font-semibold text-orange-500">
                  ⚠️ Semnătură MOCK (nu este validă legal)
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Invalid signature (revoked, expired certificate, etc.)
  const warning = verification.certificate?.warning;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="warning" className={className}>
            <ShieldAlert className="mr-1 h-3 w-3" />
            Semnătură invalidă
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">Semnătură invalidă</p>
            {warning && <p className="text-xs text-orange-500">{warning}</p>}
            <p className="text-xs">Status certificat: {verification.certificate?.status}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
