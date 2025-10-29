"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * GDPR Consent Component
 *
 * Displays GDPR consent checkbox with link to privacy policy
 * Used in survey personal data step to ensure compliance with GDPR
 *
 * Features:
 * - Required checkbox before form submission
 * - Link to detailed privacy policy
 * - Visual feedback for compliance
 * - Accessible design
 */

interface GDPRConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function GDPRConsent({ checked, onCheckedChange, error }: GDPRConsentProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="space-y-3">
      <div
        className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
          checked
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/50"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Checkbox
          id="gdpr-consent"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className={`mt-0.5 ${checked ? "border-primary" : ""}`}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "gdpr-error" : "gdpr-description"}
        />

        <div className="flex-1 space-y-2">
          <Label
            htmlFor="gdpr-consent"
            className={`flex items-start gap-2 text-sm leading-relaxed font-medium ${
              isHovered ? "text-primary" : ""
            } cursor-pointer`}
          >
            <Shield className={`mt-0.5 h-4 w-4 flex-shrink-0 ${checked ? "text-primary" : ""}`} />
            <span>
              Sunt de acord cu{" "}
              <Link
                href="/survey/privacy-policy"
                className="text-primary font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Politica de Confidențialitate și Protecția Datelor
              </Link>{" "}
              conform GDPR și consimț la prelucrarea datelor mele personale pentru scopurile
              menționate în politică.
            </span>
          </Label>

          <p id="gdpr-description" className="text-muted-foreground text-xs leading-relaxed">
            ✓ Datele tale sunt criptate și protejate
            <br />
            ✓ Poți solicita ștergerea datelor oricând
            <br />✓ Datele sunt folosite doar pentru analiza digitalizării serviciilor publice
          </p>
        </div>
      </div>

      {error && (
        <p
          id="gdpr-error"
          className="text-destructive flex items-center gap-1 text-sm font-medium"
          role="alert"
        >
          <Shield className="h-4 w-4" />
          {error}
        </p>
      )}

      <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-xs">
        <p className="font-semibold">Drepturile tale GDPR:</p>
        <p className="mt-1">
          Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție.
          Pentru exercitarea acestor drepturi, contactează:{" "}
          <a href="mailto:gdpr@primariata.work" className="text-primary hover:underline">
            gdpr@primariata.work
          </a>
        </p>
      </div>
    </div>
  );
}
