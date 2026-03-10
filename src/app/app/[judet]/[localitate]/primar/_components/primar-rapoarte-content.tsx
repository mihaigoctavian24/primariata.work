"use client";

import React, { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Download, BarChart3, AlertTriangle, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { robotoNormalBase64 } from "@/lib/pdf/fonts/roboto-normal";
import { robotoBoldBase64 } from "@/lib/pdf/fonts/roboto-bold";
import { getPrimarRapoarteData } from "@/actions/primar-actions";
import type { DepartamentRow } from "@/actions/primar-actions";

// ============================================================================
// Types
// ============================================================================

type Period = "luna" | "trimestru" | "semestru";

interface CereriByMonth {
  luna: string;
  total: number;
  rezolvate: number;
}

interface RapoarteData {
  cereriByMonth: CereriByMonth[];
  departamente: DepartamentRow[];
}

interface PrimarRapoarteContentProps {
  initialData: {
    success: boolean;
    data?: RapoarteData;
    error?: string;
  };
  primarieName: string;
}

// ============================================================================
// PDF generator
// ============================================================================

function generatePDF(
  cereriByMonth: CereriByMonth[],
  departamente: DepartamentRow[],
  primarieName: string,
  period: string
): void {
  const doc = new jsPDF();
  doc.addFileToVFS("Roboto-Regular.ttf", robotoNormalBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", robotoBoldBase64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto");

  // Header
  doc.setFontSize(18);
  doc.setFont("Roboto", "bold");
  doc.text(`Raport de performanță — ${primarieName}`, 14, 20);

  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
  const periodLabel =
    period === "luna" ? "Luna trecută" : period === "trimestru" ? "Trimestru" : "Semestru";
  doc.text(`Perioadă: ${periodLabel}`, 14, 28);
  doc.text(`Generat: ${new Date().toLocaleDateString("ro-RO")}`, 14, 34);

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 40, 196, 40);

  // Cereri section
  doc.setFontSize(13);
  doc.setFont("Roboto", "bold");
  doc.text("Statistici Cereri", 14, 50);

  // Table header
  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text("Lună", 14, 58);
  doc.text("Total Cereri", 70, 58);
  doc.text("Rezolvate", 120, 58);
  doc.text("Rată Rezolvare", 155, 58);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 60, 196, 60);

  let y = 67;
  doc.setFontSize(9);
  doc.setFont("Roboto", "normal");
  cereriByMonth.forEach((row) => {
    const rataRez = row.total > 0 ? `${((row.rezolvate / row.total) * 100).toFixed(1)}%` : "0%";
    doc.text(row.luna, 14, y);
    doc.text(String(row.total), 70, y);
    doc.text(String(row.rezolvate), 120, y);
    doc.text(rataRez, 155, y);
    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Departments section
  y += 8;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(13);
  doc.setFont("Roboto", "bold");
  doc.text("Departamente — Performanță", 14, y);
  y += 8;

  // Table header
  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text("Departament", 14, y);
  doc.text("Funcționari", 110, y);
  doc.text("Buget Alocat (RON)", 150, y);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y + 2, 196, y + 2);
  y += 9;

  doc.setFont("Roboto", "normal");
  departamente.forEach((dept) => {
    doc.text(dept.nume.substring(0, 45), 14, y);
    doc.text(String(dept.nr_functionari), 110, y);
    doc.text(dept.buget_alocat.toLocaleString("ro-RO"), 150, y);
    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`raport-${period}-${new Date().getFullYear()}.pdf`);
}

// ============================================================================
// Period pill labels
// ============================================================================

const PERIODS: { value: Period; label: string }[] = [
  { value: "luna", label: "Luna trecută" },
  { value: "trimestru", label: "Trimestru" },
  { value: "semestru", label: "Semestru" },
];

// ============================================================================
// Component
// ============================================================================

export function PrimarRapoarteContent({
  initialData,
  primarieName,
}: PrimarRapoarteContentProps): React.ReactElement {
  const [period, setPeriod] = useState<Period>("luna");
  const [data, setData] = useState<RapoarteData | undefined>(initialData.data);
  const [fetchError, setFetchError] = useState<string | undefined>(
    initialData.success ? undefined : (initialData.error ?? "Eroare la încărcarea datelor.")
  );
  const [isPending, startTransition] = useTransition();

  function handlePeriodChange(newPeriod: Period): void {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    startTransition(async () => {
      const result = await getPrimarRapoarteData(newPeriod);
      if (result.success && result.data) {
        setData(result.data);
        setFetchError(undefined);
      } else {
        setFetchError(result.error ?? "Eroare la încărcarea datelor.");
      }
    });
  }

  function handleDownload(): void {
    if (!data) return;
    generatePDF(data.cereriByMonth, data.departamente, primarieName, period);
  }

  const cereriByMonth = data?.cereriByMonth ?? [];
  const departamente = data?.departamente ?? [];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15">
            <BarChart3 className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Rapoarte</h1>
            <p className="text-sm text-white/50">
              Statistici și performanță pentru perioada selectată
            </p>
          </div>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handlePeriodChange(value)}
            disabled={isPending}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              period === value
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white/80"
            } disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
        {isPending && (
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white/60" />
            Se încarcă...
          </div>
        )}
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Cereri lunare table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Statistici Cereri</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide text-white/40 uppercase">
                  Lună
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Total Cereri
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Rezolvate
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Rată Rezolvare
                </th>
              </tr>
            </thead>
            <tbody>
              {cereriByMonth.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-white/30">
                    Nu există date pentru această perioadă
                  </td>
                </tr>
              ) : (
                cereriByMonth.map((row, i) => {
                  const rata =
                    row.total > 0 ? `${((row.rezolvate / row.total) * 100).toFixed(1)}%` : "—";
                  return (
                    <tr
                      key={i}
                      className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-white/70">{row.luna}</td>
                      <td className="px-5 py-3 text-right text-white/80">{row.total}</td>
                      <td className="px-5 py-3 text-right text-white/80">{row.rezolvate}</td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={
                            row.total > 0 ? "font-medium text-emerald-400" : "text-white/30"
                          }
                        >
                          {rata}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departamente performanță table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Departamente — Performanță</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide text-white/40 uppercase">
                  Departament
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Funcționari
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium tracking-wide text-white/40 uppercase">
                  Buget Alocat (RON)
                </th>
              </tr>
            </thead>
            <tbody>
              {departamente.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-white/30">
                    Nu există departamente
                  </td>
                </tr>
              ) : (
                departamente.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-medium text-white/80">{dept.nume}</td>
                    <td className="px-5 py-3 text-right text-white/60">{dept.nr_functionari}</td>
                    <td className="px-5 py-3 text-right text-white/60">
                      {dept.buget_alocat.toLocaleString("ro-RO")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download PDF button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          disabled={!data || isPending}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Descarcă PDF</span>
          <Download className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
