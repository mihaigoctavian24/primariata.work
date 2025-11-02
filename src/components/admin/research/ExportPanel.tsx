"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ExportPanelProps {
  totalResponses: number;
}

/**
 * Export Panel Component
 *
 * Provides export functionality for research analysis data
 * - PDF Executive Report (formatted for presentation)
 * - Excel Raw Data (all responses and analysis)
 */
export function ExportPanel({ totalResponses }: ExportPanelProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState(false);

  const handlePdfExport = async () => {
    setPdfLoading(true);
    setPdfSuccess(false);

    try {
      const response = await fetch("/api/survey/research/export/pdf", { method: "GET" });

      if (!response.ok) {
        throw new Error(`PDF export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `research-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcelExport = async () => {
    setExcelLoading(true);
    setExcelSuccess(false);

    try {
      const response = await fetch("/api/survey/research/export/excel", { method: "GET" });

      if (!response.ok) {
        throw new Error(`Excel export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-data-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExcelSuccess(true);
      setTimeout(() => setExcelSuccess(false), 3000);
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Date
        </CardTitle>
        <CardDescription>Descarcă rapoarte și date brute pentru analiză offline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* PDF Export */}
          <div className="border-border rounded-lg border p-4">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold">Raport Executiv PDF</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Raport formatat profesional cu toate insight-urile și graficele
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Conține:</span>
              </div>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Rezumat executiv cu validare cercetare
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Insight-uri AI și recomandări
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Analiză pe întrebări cu grafice
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Date demografice și geografice
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePdfExport}
                disabled={pdfLoading || totalResponses === 0}
                className="flex-1"
                variant={pdfSuccess ? "outline" : "default"}
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generare...
                  </>
                ) : pdfSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Descărcat!
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descarcă PDF
                  </>
                )}
              </Button>
              {totalResponses === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Niciun răspuns
                </Badge>
              )}
            </div>
          </div>

          {/* Excel Export */}
          <div className="border-border rounded-lg border p-4">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Date Brute Excel</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Toate răspunsurile și analizele în format editabil
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Conține foi:</span>
              </div>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Răspunsuri individuale (toate câmpurile)
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Statistici agregate per întrebare
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Teme AI și scor sentiment
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 h-1.5 w-1.5 rounded-full" />
                  Prioritizare funcționalități
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExcelExport}
                disabled={excelLoading || totalResponses === 0}
                className="flex-1"
                variant={excelSuccess ? "outline" : "default"}
              >
                {excelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generare...
                  </>
                ) : excelSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Descărcat!
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descarcă Excel
                  </>
                )}
              </Button>
              {totalResponses === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Niciun răspuns
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-muted/50 mt-4 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
              <span className="text-xs font-bold">ℹ️</span>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">
                <strong>Notă:</strong> Exporturile conțin date agregate și anonimizate conform GDPR.
                Răspunsurile individuale sunt disponibile doar în format Excel pentru analiză
                statistică.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
