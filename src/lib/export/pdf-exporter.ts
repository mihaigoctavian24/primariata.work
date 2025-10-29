/**
 * PDF Exporter with professional report template
 * Using jsPDF and html2canvas
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  dateRange?: string;
  includeCharts?: boolean;
  maxRowsPerPage?: number;
  orientation?: "portrait" | "landscape";
}

export interface PDFReportData<T> {
  title: string;
  subtitle?: string;
  dateRange?: string;
  summary?: PDFSummaryMetrics;
  data: T[];
  columns: { key: keyof T; label: string; width?: number }[];
  charts?: HTMLElement[];
}

export interface PDFSummaryMetrics {
  totalResponses: number;
  completedResponses: number;
  completionRate: string;
  citizenResponses: number;
  publicServantResponses: number;
  topCounties?: { county: string; count: number }[];
}

/**
 * Export data to PDF with professional report template
 */
export async function exportToPDF<T = unknown>(
  reportData: PDFReportData<T>,
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = "report.pdf", maxRowsPerPage = 50, orientation = "portrait" } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Add cover page
  yPosition = addCoverPage(doc, reportData, pageWidth, margin, yPosition);

  // Add new page for content
  doc.addPage();
  yPosition = margin;

  // Add executive summary if provided
  if (reportData.summary) {
    yPosition = addExecutiveSummary(
      doc,
      reportData.summary,
      pageWidth,
      margin,
      yPosition,
      pageHeight
    );
  }

  // Add charts if provided and requested
  if (reportData.charts && reportData.charts.length > 0) {
    doc.addPage();
    yPosition = margin;
    yPosition = await addChartsPage(
      doc,
      reportData.charts,
      pageWidth,
      margin,
      yPosition,
      pageHeight
    );
  }

  // Add data table
  doc.addPage();
  yPosition = margin;
  await addDataTable(doc, reportData, pageWidth, pageHeight, margin, yPosition, maxRowsPerPage);

  // Add footer to all pages
  addFooters(doc, reportData.title);

  // Save PDF
  doc.save(filename);
}

/**
 * Add cover page
 */
function addCoverPage<T = unknown>(
  doc: jsPDF,
  reportData: PDFReportData<T>,
  pageWidth: number,
  margin: number,
  yPosition: number
): number {
  // Add logo placeholder (if logo URL provided, could load and add image)
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Survey Report", pageWidth / 2, yPosition + 30, { align: "center" });

  yPosition += 50;

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text(reportData.title, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 15;

  // Add subtitle if provided
  if (reportData.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(reportData.subtitle, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
  }

  // Add date range
  if (reportData.dateRange) {
    doc.setFontSize(10);
    doc.text(`Period: ${reportData.dateRange}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
  }

  // Add generation date
  const now = new Date();
  const dateStr = now.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated: ${dateStr}`, pageWidth / 2, yPosition, { align: "center" });

  return yPosition;
}

/**
 * Add executive summary page
 */
function addExecutiveSummary(
  doc: jsPDF,
  summary: PDFSummaryMetrics,
  pageWidth: number,
  margin: number,
  yPosition: number,
  pageHeight: number
): number {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Executive Summary", margin, yPosition);
  yPosition += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Key metrics in a grid
  const metrics = [
    { label: "Total Responses", value: summary.totalResponses.toString() },
    { label: "Completed", value: summary.completedResponses.toString() },
    { label: "Completion Rate", value: summary.completionRate },
    { label: "Citizens", value: summary.citizenResponses.toString() },
    { label: "Public Servants", value: summary.publicServantResponses.toString() },
  ];

  const boxWidth = (pageWidth - 2 * margin - 10) / 2;
  const boxHeight = 15;
  let col = 0;
  let row = 0;

  for (const metric of metrics) {
    const x = margin + col * (boxWidth + 10);
    const y = yPosition + row * (boxHeight + 5);

    // Draw box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, boxWidth, boxHeight, "FD");

    // Add label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label, x + 3, y + 5);

    // Add value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(metric.value, x + 3, y + 11);

    col++;
    if (col >= 2) {
      col = 0;
      row++;
    }
  }

  yPosition += Math.ceil(metrics.length / 2) * (boxHeight + 5) + 10;

  // Top counties if provided
  if (summary.topCounties && summary.topCounties.length > 0) {
    if (yPosition + 60 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Top Counties", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    for (const county of summary.topCounties.slice(0, 5)) {
      doc.text(`${county.county}: ${county.count} responses`, margin + 5, yPosition);
      yPosition += 6;
    }
  }

  return yPosition;
}

/**
 * Add charts page
 */
async function addChartsPage(
  doc: jsPDF,
  charts: HTMLElement[],
  pageWidth: number,
  margin: number,
  yPosition: number,
  pageHeight: number
): Promise<number> {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Charts & Visualizations", margin, yPosition);
  yPosition += 15;

  for (const chart of charts) {
    try {
      const canvas = await html2canvas(chart, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if need new page
      if (yPosition + imgHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error("Error rendering chart to PDF:", error);
    }
  }

  return yPosition;
}

/**
 * Add data table with pagination
 */
async function addDataTable<T = unknown>(
  doc: jsPDF,
  reportData: PDFReportData<T>,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  yPosition: number,
  maxRowsPerPage: number
): Promise<void> {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Data", margin, yPosition);
  yPosition += 12;

  const tableWidth = pageWidth - 2 * margin;
  const rowHeight = 8;
  const headerHeight = 10;

  // Calculate column widths
  const totalCustomWidth = reportData.columns.reduce((sum, col) => sum + (col.width || 0), 0);
  const remainingWidth = tableWidth - totalCustomWidth;
  const autoWidthCols = reportData.columns.filter((col) => !col.width).length;
  const autoWidth = autoWidthCols > 0 ? remainingWidth / autoWidthCols : 0;

  const columnWidths = reportData.columns.map((col) => col.width || autoWidth);

  // Draw table
  let rowsOnPage = 0;

  // Header
  drawTableHeader(doc, reportData.columns, columnWidths, margin, yPosition, headerHeight);
  yPosition += headerHeight;

  // Rows
  for (let i = 0; i < reportData.data.length; i++) {
    const row = reportData.data[i];

    // Check if need new page
    if (rowsOnPage >= maxRowsPerPage || yPosition + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
      rowsOnPage = 0;

      // Redraw header on new page
      drawTableHeader(doc, reportData.columns, columnWidths, margin, yPosition, headerHeight);
      yPosition += headerHeight;
    }

    // Draw row (skip if row is undefined)
    if (row) {
      drawTableRow(
        doc,
        row,
        reportData.columns,
        columnWidths,
        margin,
        yPosition,
        rowHeight,
        i % 2 === 0
      );
      yPosition += rowHeight;
      rowsOnPage++;
    }
  }
}

/**
 * Draw table header
 */
function drawTableHeader<T>(
  doc: jsPDF,
  columns: { key: keyof T; label: string }[],
  columnWidths: number[],
  x: number,
  y: number,
  height: number
): void {
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  let currentX = x;

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const width = columnWidths[i];

    if (!col || !width) continue;

    // Draw header cell background
    doc.rect(currentX, y, width, height, "F");

    // Draw header text
    doc.text(col.label, currentX + 2, y + height / 2 + 1.5, {
      baseline: "middle",
      maxWidth: width - 4,
    });

    currentX += width;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
}

/**
 * Draw table row
 */
function drawTableRow<T = unknown>(
  doc: jsPDF,
  row: T,
  columns: { key: keyof T; label: string }[],
  columnWidths: number[],
  x: number,
  y: number,
  height: number,
  isEven: boolean
): void {
  // Alternating row colors
  if (isEven) {
    doc.setFillColor(245, 245, 245);
    doc.rect(
      x,
      y,
      columnWidths.reduce((sum, w) => sum + (w || 10), 0),
      height,
      "F"
    );
  }

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  let currentX = x;

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const width = columnWidths[i] || 10;

    if (!col) continue;

    const value =
      row && typeof row === "object" && col.key in row
        ? (row as Record<string, unknown>)[col.key as string]
        : undefined;

    // Draw cell border
    doc.setDrawColor(220, 220, 220);
    doc.rect(currentX, y, width, height);

    // Draw cell text
    const text = value !== null && value !== undefined ? String(value) : "-";
    doc.text(text, currentX + 2, y + height / 2 + 1, {
      baseline: "middle",
      maxWidth: width - 4,
    });

    currentX += width;
  }
}

/**
 * Add footers to all pages
 */
function addFooters(doc: jsPDF, title: string): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });

    // Footer text
    doc.text(`${title} - Generated by Survey System`, pageWidth - 15, pageHeight - 10, {
      align: "right",
    });

    // Timestamp
    doc.text(new Date().toLocaleDateString("ro-RO"), 15, pageHeight - 10);
  }
}

/**
 * Quick export with minimal options
 */
export async function quickExportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  title: string,
  filename?: string
): Promise<void> {
  const reportData: PDFReportData<T> = {
    title,
    data,
    columns,
  };

  await exportToPDF(reportData, { filename });
}
