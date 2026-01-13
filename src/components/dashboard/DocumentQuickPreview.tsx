"use client";

/**
 * IMPORTANT: This component MUST be dynamically imported with ssr: false
 *
 * react-pdf includes browser-specific code that cannot be tree-shaken by Next.js.
 * Always use dynamic import to prevent SSR errors:
 *
 * @example
 * const DocumentQuickPreview = dynamic(
 *   () => import("@/components/dashboard/DocumentQuickPreview").then(mod => ({ default: mod.DocumentQuickPreview })),
 *   { ssr: false }
 * );
 *
 * This component is intentionally NOT exported from the dashboard barrel file (index.ts)
 * to enforce proper usage and prevent accidental SSR inclusion.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Configure PDF.js worker (only runs in browser)
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface DocumentQuickPreviewProps {
  documentUrl: string;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

/**
 * Document Quick Preview - PDF Viewer Modal
 *
 * Features:
 * - PDF preview with react-pdf
 * - Page navigation (prev/next)
 * - Zoom controls (in/out)
 * - Download button
 * - Loading states
 * - Error handling
 * - Keyboard shortcuts (Escape to close, Arrow keys for navigation)
 * - Responsive design
 *
 * Supports:
 * - PDF files (primary)
 * - Fallback for other document types
 */
export function DocumentQuickPreview({
  documentUrl,
  documentName,
  isOpen,
  onClose,
  onDownload,
}: DocumentQuickPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPDF = documentUrl.toLowerCase().endsWith(".pdf");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("Nu s-a putut încărca documentul");
    setIsLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentName;
      link.click();
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowLeft":
        goToPrevPage();
        break;
      case "ArrowRight":
        goToNextPage();
        break;
      case "+":
      case "=":
        zoomIn();
        break;
      case "-":
        zoomOut();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card relative h-full w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl">
              {/* Header */}
              <div className="border-border bg-muted/30 flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary h-5 w-5" />
                  <div>
                    <h3 className="text-foreground font-semibold">{documentName}</h3>
                    {numPages > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {numPages} {numPages === 1 ? "pagină" : "pagini"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download button */}
                  <button
                    onClick={handleDownload}
                    className="border-border bg-background text-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
                    title="Descarcă document"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors"
                    title="Închide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Controls Bar (for PDF) */}
              {isPDF && !error && (
                <div className="border-border bg-background flex items-center justify-between border-b p-3">
                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      title="Pagina anterioară"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-foreground text-sm">
                      Pagina {pageNumber} din {numPages || "..."}
                    </span>

                    <button
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      title="Pagina următoare"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                      className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      title="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>

                    <span className="text-foreground text-sm">{Math.round(scale * 100)}%</span>

                    <button
                      onClick={zoomIn}
                      disabled={scale >= 3.0}
                      className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      title="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div className="bg-muted/20 flex h-[calc(100%-120px)] items-center justify-center overflow-auto p-4">
                {isLoading && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-primary h-12 w-12 animate-spin" />
                    <p className="text-muted-foreground text-sm">Se încarcă documentul...</p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <div className="text-center">
                      <p className="text-foreground font-medium">Eroare la încărcare</p>
                      <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {isPDF && !error && (
                  <Document
                    file={documentUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                    />
                  </Document>
                )}

                {!isPDF && !error && (
                  <div className="text-center">
                    <FileText className="text-muted-foreground/50 mx-auto h-16 w-16" />
                    <p className="text-foreground mt-4 font-medium">Previzualizare indisponibilă</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Acest tip de document nu poate fi previzualizat în browser
                    </p>
                    <button
                      onClick={handleDownload}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Descarcă pentru vizualizare
                    </button>
                  </div>
                )}
              </div>

              {/* Footer with keyboard shortcuts */}
              <div className="border-border bg-muted/30 border-t px-4 py-2">
                <p className="text-muted-foreground text-xs">
                  Taste: <kbd className="bg-background rounded px-1">Esc</kbd> închide,{" "}
                  <kbd className="bg-background rounded px-1">←</kbd>
                  <kbd className="bg-background rounded px-1">→</kbd> navigare,{" "}
                  <kbd className="bg-background rounded px-1">+</kbd>
                  <kbd className="bg-background rounded px-1">-</kbd> zoom
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
