"use client";

import { useState } from "react";
import { Check, Edit, FileText, Clock, Banknote, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TipCerere } from "@/types/api";
import { UploadedFile, WizardStep } from "@/types/wizard";
import { formatCurrency, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewSubmitProps {
  tipCerere: TipCerere;
  formData: Record<string, unknown>;
  observatii?: string;
  uploadedFiles: UploadedFile[];
  onEdit: (step: WizardStep) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function ReviewSubmit({
  tipCerere,
  formData,
  observatii,
  uploadedFiles,
  onEdit,
  onSubmit,
  onBack,
  isSubmitting = false,
}: ReviewSubmitProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function handleSubmit() {
    if (!termsAccepted) {
      toast.error("Trebuie să accepți termenii și condițiile pentru a trimite cererea");
      return;
    }

    await onSubmit();
  }

  // Calculate estimated completion date
  const estimatedDate = tipCerere.termen_legal_zile
    ? new Date(Date.now() + tipCerere.termen_legal_zile * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Revizuiește și trimite cererea</h2>
        <p className="text-muted-foreground">Verifică informațiile înainte de a trimite cererea</p>
      </div>

      {/* Tip Cerere Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{tipCerere.nume}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">Cod: {tipCerere.cod}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(WizardStep.SELECT_TYPE)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifică
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tipCerere.descriere && (
            <p className="text-muted-foreground text-sm">{tipCerere.descriere}</p>
          )}

          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            {/* Taxa */}
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Banknote className="h-4 w-4" />
                <span>Taxă</span>
              </div>
              <p className="font-medium">
                {tipCerere.necesita_taxa && tipCerere.valoare_taxa
                  ? formatCurrency(tipCerere.valoare_taxa)
                  : "Gratuită"}
              </p>
            </div>

            {/* Termen */}
            {tipCerere.termen_legal_zile && (
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Termen rezolvare</span>
                </div>
                <p className="font-medium">
                  {tipCerere.termen_legal_zile} {tipCerere.termen_legal_zile === 1 ? "zi" : "zile"}
                </p>
                {estimatedDate && (
                  <p className="text-muted-foreground text-xs">
                    Estimat: {estimatedDate.toLocaleDateString("ro-RO")}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Data Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Detalii cerere</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(WizardStep.FILL_DETAILS)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifică
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(formData).length > 0 ? (
            <dl className="space-y-3">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4 text-sm">
                  <dt className="text-muted-foreground font-medium capitalize">
                    {key.replace(/_/g, " ")}:
                  </dt>
                  <dd className="col-span-2">
                    {typeof value === "boolean" ? (value ? "Da" : "Nu") : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">Nu există câmpuri specifice completate.</p>
          )}

          {observatii && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">Observații:</h4>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{observatii}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Documente încărcate ({uploadedFiles.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(WizardStep.UPLOAD_DOCUMENTS)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifică
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <ul className="space-y-2">
              {uploadedFiles.map((file) => (
                <li key={file.id} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                  <FileText className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{file.file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {formatFileSize(file.file.size)}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Nu au fost încărcate documente.</p>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-blue-900">Informații importante</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                <li>După trimiterea cererii, vei primi un număr de înregistrare</li>
                <li>Poți urmări statusul cererii în secțiunea &quot;Cererile mele&quot;</li>
                {tipCerere.necesita_taxa && (
                  <li>Taxa va trebui achitată pentru ca cererea să fie procesată</li>
                )}
                <li>Vei fi notificat prin email la fiecare schimbare de status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Submit */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
              Confirm că informațiile furnizate sunt corecte și complete. Înțeleg că furnizarea de
              informații false poate duce la respingerea cererii sau la consecințe legale.
            </label>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Înapoi
            </Button>

            <Button onClick={handleSubmit} disabled={!termsAccepted || isSubmitting} size="lg">
              {isSubmitting ? "Se trimite..." : "Trimite cererea"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
