"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  CheckCircle2,
  Calendar,
  Columns3,
  Settings,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "json";

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, options: ExportOptions) => Promise<void>;
  formats?: ExportFormat[];
  title?: string;
  description?: string;
  isExporting?: boolean;
  availableColumns?: ColumnOption[];
  defaultDateRange?: DateRangeOption;
}

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders?: boolean;
  dateRange?: DateRangeOption;
  selectedColumns?: string[];
  csvOptions?: {
    delimiter: "," | ";" | "\t";
    quoteAll: boolean;
    includeBOM: boolean;
  };
  excelOptions?: {
    includeFilters: boolean;
    includeSummary: boolean;
    autoWidth: boolean;
  };
  pdfOptions?: {
    includeCharts: boolean;
    orientation: "portrait" | "landscape";
  };
}

export interface DateRangeOption {
  start: Date;
  end: Date;
  label?: string;
}

export interface ColumnOption {
  id: string;
  label: string;
  required?: boolean;
}

const FORMAT_ICONS = {
  csv: FileText,
  xlsx: FileSpreadsheet,
  pdf: FileImage,
  json: FileText,
};

const FORMAT_LABELS = {
  csv: "CSV",
  xlsx: "Excel",
  pdf: "PDF",
  json: "JSON",
};

const FORMAT_DESCRIPTIONS = {
  csv: "Simple text format, best for data analysis",
  xlsx: "Excel workbook with multiple sheets and formatting",
  pdf: "Professional report with charts and summaries",
  json: "Raw data in JSON format for developers",
};

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  formats = ["csv", "xlsx", "pdf"],
  title = "Export Data",
  description = "Configure your export settings",
  isExporting = false,
  availableColumns = [],
  defaultDateRange,
}: ExportDialogProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Export options state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(formats[0] || "csv");
  const [dateRange, setDateRange] = useState<DateRangeOption | null>(defaultDateRange || null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    availableColumns.filter((col) => col.required).map((col) => col.id)
  );
  const [includeHeaders, setIncludeHeaders] = useState(true);

  // CSV options
  const [csvDelimiter, setCsvDelimiter] = useState<"," | ";" | "\t">(",");
  const [csvQuoteAll, setCsvQuoteAll] = useState(false);
  const [csvIncludeBOM, setCsvIncludeBOM] = useState(true);

  // Excel options
  const [excelIncludeFilters, setExcelIncludeFilters] = useState(true);
  const [excelIncludeSummary, setExcelIncludeSummary] = useState(true);
  const [excelAutoWidth, setExcelAutoWidth] = useState(true);

  // PDF options
  const [pdfIncludeCharts, setPdfIncludeCharts] = useState(true);
  const [pdfOrientation, setPdfOrientation] = useState<"portrait" | "landscape">("portrait");

  const totalSteps = 5;

  // Reset state when dialog closes
  const handleClose = () => {
    if (!isExporting) {
      setCurrentStep(1);
      setExportComplete(false);
      setExportError(null);
      onClose();
    }
  };

  // Handle export
  const handleExport = async () => {
    setExportError(null);

    const options: ExportOptions = {
      format: selectedFormat,
      includeHeaders,
      dateRange: dateRange || undefined,
      selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined,
      csvOptions: {
        delimiter: csvDelimiter,
        quoteAll: csvQuoteAll,
        includeBOM: csvIncludeBOM,
      },
      excelOptions: {
        includeFilters: excelIncludeFilters,
        includeSummary: excelIncludeSummary,
        autoWidth: excelAutoWidth,
      },
      pdfOptions: {
        includeCharts: pdfIncludeCharts,
        orientation: pdfOrientation,
      },
    };

    try {
      await onExport(selectedFormat, options);
      setExportComplete(true);
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(error instanceof Error ? error.message : "Export failed");
    }
  };

  // Calculate preview data count
  const previewCount = useMemo(() => {
    // This would normally calculate based on filters
    return 10;
  }, []);

  // Progress percentage
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {!exportComplete && !exportError && (
          <div className="space-y-2">
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Success State */}
        {exportComplete && (
          <div className="space-y-4 py-8 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold">Export Complete!</h3>
            <p className="text-muted-foreground">Your file has been downloaded successfully.</p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        )}

        {/* Error State */}
        {exportError && (
          <div className="space-y-4 py-8 text-center">
            <div className="flex justify-center">
              <AlertCircle className="text-destructive h-16 w-16" />
            </div>
            <h3 className="text-xl font-semibold">Export Failed</h3>
            <p className="text-muted-foreground">{exportError}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => setExportError(null)} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}

        {/* Wizard Steps */}
        {!exportComplete && !exportError && (
          <>
            {/* Step 1: Format Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 py-4">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Select Export Format</h3>
                </div>
                <RadioGroup
                  value={selectedFormat}
                  onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
                >
                  {formats.map((format) => {
                    const Icon = FORMAT_ICONS[format];
                    return (
                      <div
                        key={format}
                        className="hover:bg-muted/50 flex cursor-pointer items-start space-x-3 rounded-lg border p-4"
                      >
                        <RadioGroupItem value={format} id={format} />
                        <Label htmlFor={format} className="flex-1 cursor-pointer">
                          <div className="mb-1 flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            <span className="font-semibold">{FORMAT_LABELS[format]}</span>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {FORMAT_DESCRIPTIONS[format]}
                          </p>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Date Range */}
            {currentStep === 2 && (
              <div className="space-y-4 py-4">
                <div className="mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Select Date Range</h3>
                </div>
                <div className="space-y-3">
                  <RadioGroup
                    value={dateRange?.label || "all"}
                    onValueChange={(value) => {
                      if (value === "all") {
                        setDateRange(null);
                      } else {
                        const now = new Date();
                        const start = new Date();

                        switch (value) {
                          case "last7":
                            start.setDate(now.getDate() - 7);
                            break;
                          case "last30":
                            start.setDate(now.getDate() - 30);
                            break;
                          case "last90":
                            start.setDate(now.getDate() - 90);
                            break;
                        }

                        setDateRange({ start, end: now, label: value });
                      }
                    }}
                  >
                    <div className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="flex-1 cursor-pointer">
                        All Time
                      </Label>
                    </div>
                    <div className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="last7" id="last7" />
                      <Label htmlFor="last7" className="flex-1 cursor-pointer">
                        Last 7 Days
                      </Label>
                    </div>
                    <div className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="last30" id="last30" />
                      <Label htmlFor="last30" className="flex-1 cursor-pointer">
                        Last 30 Days
                      </Label>
                    </div>
                    <div className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="last90" id="last90" />
                      <Label htmlFor="last90" className="flex-1 cursor-pointer">
                        Last 90 Days
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 3: Column Selection */}
            {currentStep === 3 && availableColumns.length > 0 && (
              <div className="space-y-4 py-4">
                <div className="mb-4 flex items-center gap-2">
                  <Columns3 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Select Columns</h3>
                </div>
                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                  {availableColumns.map((column) => (
                    <div
                      key={column.id}
                      className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={column.id}
                        checked={selectedColumns.includes(column.id)}
                        disabled={column.required}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColumns([...selectedColumns, column.id]);
                          } else {
                            setSelectedColumns(selectedColumns.filter((id) => id !== column.id));
                          }
                        }}
                      />
                      <Label htmlFor={column.id} className="flex-1 cursor-pointer">
                        {column.label}
                        {column.required && (
                          <span className="text-muted-foreground ml-2 text-xs">(Required)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Format Options */}
            {currentStep === 4 && (
              <div className="space-y-4 py-4">
                <div className="mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Export Options</h3>
                </div>

                {/* General Options */}
                <div className="space-y-3">
                  <div className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3">
                    <Checkbox
                      id="includeHeaders"
                      checked={includeHeaders}
                      onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                    />
                    <Label htmlFor="includeHeaders" className="flex-1 cursor-pointer">
                      Include Column Headers
                    </Label>
                  </div>
                </div>

                {/* Format-specific options */}
                {selectedFormat === "csv" && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium">CSV Options</h4>
                    <div className="space-y-2">
                      <Label>Delimiter</Label>
                      <RadioGroup
                        value={csvDelimiter}
                        onValueChange={(v) => setCsvDelimiter(v as "," | ";" | "\t")}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="," id="comma" />
                          <Label htmlFor="comma">Comma (,)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value=";" id="semicolon" />
                          <Label htmlFor="semicolon">Semicolon (;)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={"\t"} id="tab" />
                          <Label htmlFor="tab">Tab</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id="csvQuoteAll"
                        checked={csvQuoteAll}
                        onCheckedChange={(checked) => setCsvQuoteAll(checked as boolean)}
                      />
                      <Label htmlFor="csvQuoteAll" className="cursor-pointer">
                        Quote All Fields
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id="csvBOM"
                        checked={csvIncludeBOM}
                        onCheckedChange={(checked) => setCsvIncludeBOM(checked as boolean)}
                      />
                      <Label htmlFor="csvBOM" className="cursor-pointer">
                        Include BOM (Excel compatibility)
                      </Label>
                    </div>
                  </div>
                )}

                {selectedFormat === "xlsx" && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium">Excel Options</h4>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id="excelFilters"
                        checked={excelIncludeFilters}
                        onCheckedChange={(checked) => setExcelIncludeFilters(checked as boolean)}
                      />
                      <Label htmlFor="excelFilters" className="cursor-pointer">
                        Include Auto-Filters
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id="excelSummary"
                        checked={excelIncludeSummary}
                        onCheckedChange={(checked) => setExcelIncludeSummary(checked as boolean)}
                      />
                      <Label htmlFor="excelSummary" className="cursor-pointer">
                        Include Summary Sheet
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id="excelAutoWidth"
                        checked={excelAutoWidth}
                        onCheckedChange={(checked) => setExcelAutoWidth(checked as boolean)}
                      />
                      <Label htmlFor="excelAutoWidth" className="cursor-pointer">
                        Auto-Adjust Column Width
                      </Label>
                    </div>
                  </div>
                )}

                {selectedFormat === "pdf" && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium">PDF Options</h4>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id="pdfCharts"
                        checked={pdfIncludeCharts}
                        onCheckedChange={(checked) => setPdfIncludeCharts(checked as boolean)}
                      />
                      <Label htmlFor="pdfCharts" className="cursor-pointer">
                        Include Charts
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Page Orientation</Label>
                      <RadioGroup
                        value={pdfOrientation}
                        onValueChange={(v) => setPdfOrientation(v as "portrait" | "landscape")}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="portrait" id="portrait" />
                          <Label htmlFor="portrait">Portrait</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="landscape" id="landscape" />
                          <Label htmlFor="landscape">Landscape</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Preview & Confirm */}
            {currentStep === 5 && (
              <div className="space-y-4 py-4">
                <div className="mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Review & Export</h3>
                </div>

                <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                  <div>
                    <span className="text-sm font-medium">Format:</span>
                    <span className="ml-2 text-sm">{FORMAT_LABELS[selectedFormat]}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Date Range:</span>
                    <span className="ml-2 text-sm">
                      {dateRange
                        ? `${format(dateRange.start, "MMM d, yyyy")} - ${format(dateRange.end, "MMM d, yyyy")}`
                        : "All time"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Columns:</span>
                    <span className="ml-2 text-sm">
                      {selectedColumns.length > 0
                        ? `${selectedColumns.length} selected`
                        : "All columns"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Estimated Rows:</span>
                    <span className="ml-2 text-sm">~{previewCount}</span>
                  </div>
                </div>

                <div className="text-muted-foreground text-sm">
                  Click &ldquo;Export&rdquo; to download your file. This may take a few moments for
                  large datasets.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || isExporting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleClose} disabled={isExporting}>
                  Cancel
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={isExporting}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

ExportDialog.displayName = "ExportDialog";
