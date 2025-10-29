"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { ExportFormat, ExportOptions } from "@/components/dashboard/ExportDialog";
import {
  exportToCSV,
  exportToCSVStreaming,
  convertObjectsToCSVData,
} from "@/lib/export/csv-exporter";
import { exportResponsesToExcel, type SummaryMetrics } from "@/lib/export/excel-exporter";
import { exportToPDF, type PDFReportData, type PDFSummaryMetrics } from "@/lib/export/pdf-exporter";
import { format } from "date-fns";

export interface UseExportOptions {
  filename?: string;
  onSuccess?: (format: ExportFormat) => void;
  onError?: (error: Error) => void;
}

export interface ExportData<T = unknown> {
  data: T[];
  columns: { key: keyof T; label: string }[];
  summary?: ExportSummaryData;
  charts?: HTMLElement[];
}

export interface ExportSummaryData {
  totalResponses: number;
  completedResponses: number;
  citizenResponses: number;
  publicServantResponses: number;
  averageCompletionTime?: string;
  topCounties?: { county: string; count: number }[];
}

/**
 * Hook for data export functionality with support for CSV, Excel, and PDF
 */
export function useExport(hookOptions: UseExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Export to CSV format
   */
  const exportCSV = useCallback(
    async <T extends Record<string, unknown>>(
      exportData: ExportData<T>,
      options: ExportOptions
    ): Promise<void> => {
      const { data, columns } = exportData;
      const { csvOptions, selectedColumns, includeHeaders, dateRange } = options;

      // Filter columns if specified
      const activeColumns = selectedColumns
        ? columns.filter((col) => selectedColumns.includes(String(col.key)))
        : columns;

      // Filter data by date range if specified
      let filteredData = data;
      if (dateRange && data.length > 0 && data[0] && "created_at" in data[0]) {
        filteredData = data.filter((row) => {
          const createdAt = new Date(row.created_at as string);
          return createdAt >= dateRange.start && createdAt <= dateRange.end;
        });
      }

      // Convert to CSV format
      const csvData = convertObjectsToCSVData(filteredData, activeColumns);

      // Generate filename
      const filename =
        hookOptions.filename || `export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;

      // Export with options
      if (filteredData.length > 5000) {
        // Use streaming for large datasets
        exportToCSVStreaming(csvData, {
          delimiter: csvOptions?.delimiter || ",",
          includeHeaders: includeHeaders !== false,
          includeBOM: csvOptions?.includeBOM !== false,
          quoteAll: csvOptions?.quoteAll || false,
          filename,
        });
      } else {
        // Standard export for smaller datasets
        exportToCSV(csvData, {
          delimiter: csvOptions?.delimiter || ",",
          includeHeaders: includeHeaders !== false,
          includeBOM: csvOptions?.includeBOM !== false,
          quoteAll: csvOptions?.quoteAll || false,
          filename,
        });
      }
    },
    [hookOptions.filename]
  );

  /**
   * Export to Excel format with multiple sheets
   */
  const exportExcel = useCallback(
    async <T extends Record<string, unknown>>(
      exportData: ExportData<T>,
      options: ExportOptions
    ): Promise<void> => {
      const { data, columns, summary } = exportData;
      const { excelOptions, selectedColumns, dateRange } = options;

      // Filter columns if specified
      const activeColumns = selectedColumns
        ? columns.filter((col) => selectedColumns.includes(String(col.key)))
        : columns;

      // Filter data by date range if specified
      let filteredData = data;
      if (dateRange && data.length > 0 && data[0] && "created_at" in data[0]) {
        filteredData = data.filter((row) => {
          const createdAt = new Date(row.created_at as string);
          return createdAt >= dateRange.start && createdAt <= dateRange.end;
        });
      }

      // Prepare summary metrics
      const metrics: SummaryMetrics | undefined = summary
        ? {
            totalResponses: summary.totalResponses,
            completedResponses: summary.completedResponses,
            citizenResponses: summary.citizenResponses,
            publicServantResponses: summary.publicServantResponses,
            averageCompletionTime: summary.averageCompletionTime,
            topCounties: summary.topCounties,
          }
        : undefined;

      // Generate filename
      const filename =
        hookOptions.filename || `export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;

      // Export to Excel
      exportResponsesToExcel(
        filteredData,
        activeColumns,
        excelOptions?.includeSummary !== false ? metrics : undefined,
        filename
      );
    },
    [hookOptions.filename]
  );

  /**
   * Export to PDF format with professional report
   */
  const exportPDF = useCallback(
    async <T extends Record<string, unknown>>(
      exportData: ExportData<T>,
      options: ExportOptions
    ): Promise<void> => {
      const { data, columns, summary, charts } = exportData;
      const { pdfOptions, selectedColumns, dateRange } = options;

      // Filter columns if specified
      const activeColumns = selectedColumns
        ? columns.filter((col) => selectedColumns.includes(String(col.key)))
        : columns;

      // Filter data by date range if specified
      let filteredData = data;
      if (dateRange && data.length > 0 && data[0] && "created_at" in data[0]) {
        filteredData = data.filter((row) => {
          const createdAt = new Date(row.created_at as string);
          return createdAt >= dateRange.start && createdAt <= dateRange.end;
        });
      }

      // Prepare PDF summary metrics
      const pdfSummary: PDFSummaryMetrics | undefined = summary
        ? {
            totalResponses: summary.totalResponses,
            completedResponses: summary.completedResponses,
            completionRate: `${((summary.completedResponses / summary.totalResponses) * 100).toFixed(1)}%`,
            citizenResponses: summary.citizenResponses,
            publicServantResponses: summary.publicServantResponses,
            topCounties: summary.topCounties,
          }
        : undefined;

      // Prepare report data
      const reportData: PDFReportData<T> = {
        title: "Survey Responses Report",
        subtitle: dateRange
          ? `${format(dateRange.start, "MMM d, yyyy")} - ${format(dateRange.end, "MMM d, yyyy")}`
          : "All Time",
        dateRange: dateRange
          ? `${format(dateRange.start, "MMM d, yyyy")} - ${format(dateRange.end, "MMM d, yyyy")}`
          : undefined,
        summary: pdfSummary,
        data: filteredData,
        columns: activeColumns,
        charts: pdfOptions?.includeCharts !== false ? charts : undefined,
      };

      // Generate filename
      const filename =
        hookOptions.filename || `export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`;

      // Export to PDF
      await exportToPDF(reportData, {
        filename,
        orientation: pdfOptions?.orientation || "portrait",
        maxRowsPerPage: 50,
      });
    },
    [hookOptions.filename]
  );

  /**
   * Main export function that routes to appropriate exporter
   */
  const exportData = useCallback(
    async <T extends Record<string, unknown>>(
      exportData: ExportData<T>,
      options: ExportOptions
    ): Promise<void> => {
      setIsExporting(true);
      setError(null);
      setProgress(0);

      try {
        // Show loading toast
        const loadingToast = toast.loading(`Exporting to ${options.format.toUpperCase()}...`);

        // Update progress
        setProgress(25);

        // Route to appropriate exporter
        switch (options.format) {
          case "csv":
            await exportCSV(exportData, options);
            break;

          case "xlsx":
            await exportExcel(exportData, options);
            break;

          case "pdf":
            await exportPDF(exportData, options);
            break;

          case "json": {
            // Simple JSON export
            const jsonString = JSON.stringify(exportData.data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download =
              hookOptions.filename || `export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.json`;
            a.click();
            URL.revokeObjectURL(url);
            break;
          }

          default:
            throw new Error(`Unsupported format: ${options.format}`);
        }

        setProgress(100);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`Successfully exported to ${options.format.toUpperCase()}`);

        if (hookOptions.onSuccess) {
          hookOptions.onSuccess(options.format);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Export failed");
        setError(error);

        toast.error(`Export failed: ${error.message}`);

        if (hookOptions.onError) {
          hookOptions.onError(error);
        }

        throw error;
      } finally {
        setIsExporting(false);
        setProgress(0);
      }
    },
    [exportCSV, exportExcel, exportPDF, hookOptions]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsExporting(false);
    setProgress(0);
  }, []);

  return {
    exportData,
    exportCSV,
    exportExcel,
    exportPDF,
    isExporting,
    progress,
    error,
    reset,
  };
}
