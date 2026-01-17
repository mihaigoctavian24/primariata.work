"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Eye,
  ExternalLink,
  Clock,
  Paperclip,
} from "lucide-react";

interface Document {
  id: string;
  nume: string;
  tip_document: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  cerere_id?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface RecentDocumentsWidgetProps {
  documents: Document[];
  maxDisplay?: number;
  onDocumentClick?: (documentId: string) => void;
  onPreview?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  isLoading?: boolean;
}

/**
 * Recent Documents Widget - Dashboard Quick Access
 *
 * Features:
 * - Recently uploaded/viewed documents (last 7 days)
 * - Document type icons and file size display
 * - Quick preview integration with DocumentQuickPreview
 * - Download functionality
 * - Navigate to full document view
 * - Responsive grid layout
 * - Loading and empty states
 * - Relative time display ("2 hours ago")
 *
 * Supports:
 * - PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and more
 * - File size formatting (KB, MB, GB)
 */
export function RecentDocumentsWidget({
  documents,
  maxDisplay = 6,
  onDocumentClick,
  onPreview,
  onDownload,
  isLoading = false,
}: RecentDocumentsWidgetProps) {
  const displayedDocuments = documents.slice(0, maxDisplay);

  const handlePreview = (doc: Document) => {
    if (onPreview) {
      onPreview(doc);
    }
  };

  const handleDownload = (doc: Document) => {
    if (onDownload) {
      onDownload(doc);
    } else {
      // Default download behavior
      const link = document.createElement("a");
      link.href = doc.file_path;
      link.download = doc.nume;
      link.click();
    }
  };

  const handleDocumentClick = (doc: Document) => {
    if (onDocumentClick) {
      onDocumentClick(doc.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="text-primary h-5 w-5" />
          <h3 className="text-foreground font-semibold">Documente Recente</h3>
        </div>
        {documents.length > maxDisplay && (
          <button
            className="text-primary text-sm hover:underline"
            onClick={() => documents[0] && handleDocumentClick(documents[0])}
          >
            Vezi toate ({documents.length})
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: Math.min(maxDisplay, 3) }).map((_, index) => (
            <div
              key={index}
              className="border-border/40 bg-card animate-pulse rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="bg-muted h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-3/4 rounded" />
                  <div className="bg-muted h-3 w-1/2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayedDocuments.length === 0 && (
        <div className="border-border/40 bg-card rounded-lg border p-8 text-center">
          <FileText className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <p className="text-foreground mt-3 text-sm font-medium">Niciun document recent</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Documentele încărcate vor apărea aici
          </p>
        </div>
      )}

      {/* Documents List - Full Width Stacked */}
      {!isLoading && displayedDocuments.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {displayedDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                index={index}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onClick={handleDocumentClick}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Document Card
 */
function DocumentCard({
  document: doc,
  index,
  onPreview,
  onDownload,
  onClick,
}: {
  document: Document;
  index: number;
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onClick: (doc: Document) => void;
}) {
  const fileExtension = getFileExtension(doc.nume);
  const icon = getDocumentIcon(fileExtension);
  const iconColor = getDocumentIconColor(fileExtension);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group border-border/40 bg-card hover:border-primary/30 relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
    >
      {/* Document Info */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${iconColor}`}
        >
          {icon}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-hidden">
          <h4
            className="text-foreground hover:text-primary cursor-pointer truncate text-sm font-medium transition-colors"
            onClick={() => onClick(doc)}
            title={doc.nume}
          >
            {doc.nume}
          </h4>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <span>{formatFileSize(doc.file_size)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(doc.uploaded_at)}
            </span>
          </div>
          {doc.tip_document && (
            <p className="text-muted-foreground mt-1 truncate text-xs">{doc.tip_document}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex items-center gap-2">
        {/* Preview Button */}
        <button
          onClick={() => onPreview(doc)}
          className="border-border bg-background text-foreground hover:bg-muted flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          title="Previzualizare"
        >
          <Eye className="h-3.5 w-3.5" />
          Previzualizare
        </button>

        {/* Download Button */}
        <button
          onClick={() => onDownload(doc)}
          className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors"
          title="Descarcă"
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        {/* View Details Button */}
        <button
          onClick={() => onClick(doc)}
          className="border-border bg-background text-foreground hover:bg-muted rounded-md border p-1.5 transition-colors"
          title="Vezi detalii"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Status Badge (if applicable) */}
      {doc.status && (
        <div className="absolute top-2 right-2">
          <StatusBadge status={doc.status} />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; badgeClass: string }> = {
    verified: {
      label: "Verificat",
      badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    pending: {
      label: "În așteptare",
      badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    rejected: {
      label: "Respins",
      badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const config = configs[status] || {
    label: status,
    badgeClass: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
    >
      {config.label}
    </span>
  );
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts[parts.length - 1] || "").toLowerCase() : "";
}

/**
 * Get icon component for document type
 */
function getDocumentIcon(extension: string): React.ReactNode {
  const iconClass = "h-5 w-5";

  switch (extension) {
    case "pdf":
      return <FileText className={iconClass} />;
    case "doc":
    case "docx":
      return <FileText className={iconClass} />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className={iconClass} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <ImageIcon className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
}

/**
 * Get icon background color for document type
 */
function getDocumentIconColor(extension: string): string {
  switch (extension) {
    case "pdf":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "doc":
    case "docx":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case "xls":
    case "xlsx":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

/**
 * Format file size from bytes to human-readable
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date to relative time ("2 hours ago", "3 days ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Acum câteva secunde";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Acum ${minutes} ${minutes === 1 ? "minut" : "minute"}`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Acum ${hours} ${hours === 1 ? "oră" : "ore"}`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Acum ${days} ${days === 1 ? "zi" : "zile"}`;
  }

  // More than a week, show actual date
  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
