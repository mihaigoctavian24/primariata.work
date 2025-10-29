/**
 * Excel Exporter with multi-sheet workbook support
 * Using xlsx library
 */

import * as XLSX from "xlsx";

export interface ExcelExportOptions {
  filename?: string;
  sheets?: ExcelSheet[];
  includeFilters?: boolean;
  autoWidth?: boolean;
  freezeTopRow?: boolean;
}

export interface ExcelSheet {
  name: string;
  data: unknown[][];
  headers?: string[];
  columnWidths?: number[];
  styles?: ExcelCellStyle[];
}

export interface ExcelCellStyle {
  row: number;
  col: number;
  style: {
    bold?: boolean;
    color?: string;
    bgColor?: string;
    fontSize?: number;
  };
}

export interface SummaryMetrics {
  totalResponses: number;
  completedResponses: number;
  citizenResponses: number;
  publicServantResponses: number;
  averageCompletionTime?: string;
  topCounties?: { county: string; count: number }[];
}

/**
 * Export data to Excel with multiple sheets
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const {
    filename = "export.xlsx",
    sheets = [],
    includeFilters = true,
    autoWidth = true,
    freezeTopRow = true,
  } = options;

  // Create new workbook
  const workbook = XLSX.utils.book_new();

  // Add each sheet
  for (const sheet of sheets) {
    const worksheet = createWorksheet(sheet, {
      includeFilters,
      autoWidth,
      freezeTopRow,
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  // Generate and download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Create worksheet from sheet data
 */
function createWorksheet(
  sheet: ExcelSheet,
  options: {
    includeFilters: boolean;
    autoWidth: boolean;
    freezeTopRow: boolean;
  }
): XLSX.WorkSheet {
  const data: unknown[][] = [];

  // Add headers if provided
  if (sheet.headers && sheet.headers.length > 0) {
    data.push(sheet.headers);
  }

  // Add data rows
  data.push(...sheet.data);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Apply column widths
  if (options.autoWidth) {
    const columnWidths = calculateColumnWidths(data);
    worksheet["!cols"] = columnWidths.map((width) => ({ wch: width || 10 }));
  } else if (sheet.columnWidths) {
    worksheet["!cols"] = sheet.columnWidths.map((width) => ({ wch: width || 10 }));
  }

  // Freeze top row
  if (options.freezeTopRow && sheet.headers) {
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  }

  // Apply filters
  if (options.includeFilters && sheet.headers) {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };
  }

  // Apply cell styles (basic styling - xlsx has limited styling)
  if (sheet.styles) {
    for (const style of sheet.styles) {
      const cellRef = XLSX.utils.encode_cell({ r: style.row, c: style.col });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = convertStyleToXLSX(style.style);
      }
    }
  }

  return worksheet;
}

/**
 * Calculate optimal column widths based on content
 */
function calculateColumnWidths(data: unknown[][]): number[] {
  if (data.length === 0) return [];

  const maxCols = Math.max(...data.map((row) => row.length));
  const widths: number[] = new Array(maxCols).fill(10);

  for (const row of data) {
    row.forEach((cell, colIdx) => {
      const cellLength = String(cell || "").length;
      const currentWidth = widths[colIdx] || 10;
      widths[colIdx] = Math.max(currentWidth, Math.min(cellLength + 2, 50));
    });
  }

  return widths;
}

/**
 * Convert style object to XLSX format (limited support)
 */
function convertStyleToXLSX(style: ExcelCellStyle["style"]): unknown {
  // Note: xlsx library has limited styling support
  // For full styling, consider using xlsx-style or exceljs
  const xlsxStyle: Record<string, unknown> = {};

  if (style.bold) {
    xlsxStyle.font = { bold: true };
  }

  if (style.fontSize) {
    xlsxStyle.font = { ...((xlsxStyle.font as object) || {}), sz: style.fontSize };
  }

  if (style.bgColor) {
    xlsxStyle.fill = { fgColor: { rgb: style.bgColor.replace("#", "") } };
  }

  return xlsxStyle;
}

/**
 * Create summary sheet with metrics
 */
export function createSummarySheet(metrics: SummaryMetrics): ExcelSheet {
  const data: unknown[][] = [
    ["Metric", "Value"],
    ["Total Responses", metrics.totalResponses],
    ["Completed Responses", metrics.completedResponses],
    [
      "Completion Rate",
      `${((metrics.completedResponses / metrics.totalResponses) * 100).toFixed(1)}%`,
    ],
    ["Citizen Responses", metrics.citizenResponses],
    ["Public Servant Responses", metrics.publicServantResponses],
  ];

  if (metrics.averageCompletionTime) {
    data.push(["Average Completion Time", metrics.averageCompletionTime]);
  }

  if (metrics.topCounties && metrics.topCounties.length > 0) {
    data.push(["", ""]); // Empty row
    data.push(["Top Counties", "Count"]);
    metrics.topCounties.forEach((county) => {
      data.push([county.county, county.count]);
    });
  }

  return {
    name: "Overview",
    data: data.slice(1), // Remove header row as it will be added separately
    headers: ["Metric", "Value"],
    columnWidths: [30, 20],
  };
}

/**
 * Create detailed responses sheet
 */
export function createResponsesSheet<T extends Record<string, unknown>>(
  responses: T[],
  columnMapping: { key: keyof T; label: string }[]
): ExcelSheet {
  const headers = columnMapping.map((m) => m.label);
  const data = responses.map((response) => columnMapping.map((m) => response[m.key]));

  return {
    name: "Detailed Responses",
    headers,
    data,
  };
}

/**
 * Export responses to Excel with multiple sheets
 */
export function exportResponsesToExcel<T extends Record<string, unknown>>(
  responses: T[],
  columnMapping: { key: keyof T; label: string }[],
  metrics?: SummaryMetrics,
  filename?: string
): void {
  const sheets: ExcelSheet[] = [];

  // Add summary sheet if metrics provided
  if (metrics) {
    sheets.push(createSummarySheet(metrics));
  }

  // Add detailed responses sheet
  sheets.push(createResponsesSheet(responses, columnMapping));

  exportToExcel({
    filename: filename || `responses_${new Date().toISOString().split("T")[0]}.xlsx`,
    sheets,
    includeFilters: true,
    autoWidth: true,
    freezeTopRow: true,
  });
}
