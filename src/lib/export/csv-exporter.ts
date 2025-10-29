/**
 * CSV Exporter with UTF-8 BOM and advanced options
 */

export interface CSVExportOptions {
  delimiter?: "," | ";" | "\t";
  includeHeaders?: boolean;
  includeBOM?: boolean; // UTF-8 BOM for Excel compatibility
  quoteAll?: boolean;
  filename?: string;
}

export interface CSVData {
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(
  field: string | number | boolean | null | undefined,
  quoteAll: boolean
): string {
  if (field === null || field === undefined) {
    return "";
  }

  const value = String(field);

  // Check if field needs quoting (contains delimiter, quotes, or newlines)
  const needsQuotes =
    quoteAll ||
    value.includes(",") ||
    value.includes(";") ||
    value.includes("\t") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  if (needsQuotes) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}

/**
 * Export data to CSV format with advanced options
 */
export function exportToCSV(data: CSVData, options: CSVExportOptions = {}): void {
  const {
    delimiter = ",",
    includeHeaders = true,
    includeBOM = true,
    quoteAll = false,
    filename = "export.csv",
  } = options;

  const lines: string[] = [];

  // Add headers if requested
  if (includeHeaders && data.headers.length > 0) {
    const headerLine = data.headers
      .map((header) => escapeCSVField(header, quoteAll))
      .join(delimiter);
    lines.push(headerLine);
  }

  // Add data rows
  for (const row of data.rows) {
    const rowLine = row.map((field) => escapeCSVField(field, quoteAll)).join(delimiter);
    lines.push(rowLine);
  }

  // Join lines with CRLF (Windows line endings for Excel compatibility)
  const csvContent = lines.join("\r\n");

  // Add UTF-8 BOM for Excel compatibility if requested
  const bom = includeBOM ? "\uFEFF" : "";
  const fullContent = bom + csvContent;

  // Create blob and trigger download
  const blob = new Blob([fullContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Export large datasets using streaming (for client-side)
 * This breaks data into chunks to avoid memory issues
 */
export function exportToCSVStreaming(
  data: CSVData,
  options: CSVExportOptions = {},
  chunkSize: number = 1000
): void {
  const {
    delimiter = ",",
    includeHeaders = true,
    includeBOM = true,
    quoteAll = false,
    filename = "export.csv",
  } = options;

  const chunks: string[] = [];

  // Add BOM if requested
  if (includeBOM) {
    chunks.push("\uFEFF");
  }

  // Add headers
  if (includeHeaders && data.headers.length > 0) {
    const headerLine = data.headers
      .map((header) => escapeCSVField(header, quoteAll))
      .join(delimiter);
    chunks.push(headerLine + "\r\n");
  }

  // Process rows in chunks
  for (let i = 0; i < data.rows.length; i += chunkSize) {
    const chunk = data.rows.slice(i, i + chunkSize);
    const chunkLines = chunk
      .map((row) => row.map((field) => escapeCSVField(field, quoteAll)).join(delimiter))
      .join("\r\n");

    chunks.push(chunkLines);
    if (i + chunkSize < data.rows.length) {
      chunks.push("\r\n");
    }
  }

  // Create blob from chunks
  const blob = new Blob(chunks, { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Utility to trigger file download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSVData format
 */
export function convertObjectsToCSVData<T extends Record<string, unknown>>(
  objects: T[],
  columnMapping?: { key: keyof T; label: string }[]
): CSVData {
  if (objects.length === 0) {
    return { headers: [], rows: [] };
  }

  // Use provided mapping or auto-generate from first object
  const firstObject = objects[0];
  if (!firstObject) {
    return { headers: [], rows: [] };
  }

  const mapping =
    columnMapping ||
    Object.keys(firstObject).map((key) => ({
      key: key as keyof T,
      label: key,
    }));

  const headers = mapping.map((m) => m.label);
  const rows = objects.map((obj) =>
    mapping.map((m) => obj[m.key] as string | number | boolean | null | undefined)
  );

  return { headers, rows };
}
