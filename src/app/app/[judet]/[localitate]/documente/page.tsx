"use client";

import { use, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logger } from "@/lib/logger";
import { fetchUserDocuments, fetchPublicForms, getDocumentSignedUrl } from "@/actions/documents";
import type {
  DocumentWithCerere,
  CategorizedDocuments,
  GroupedPublicForms,
} from "@/actions/documents";

interface DocumentePageProps {
  params: Promise<{ judet: string; localitate: string }>;
}

type DocumentCategory = "all" | "incarcate" | "chitante" | "confirmari";

const CATEGORY_LABELS: Record<string, string> = {
  all: "Toate",
  incarcate: "Incarcate de mine",
  chitante: "Chitante",
  confirmari: "Confirmari",
};

/**
 * Format file size from bytes to human-readable.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date in Romanian locale.
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get file extension from filename.
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts[parts.length - 1] || "").toLowerCase() : "";
}

/**
 * Get icon for document type.
 */
function getDocumentIcon(extension: string): React.ReactNode {
  const cls = "h-4 w-4";
  switch (extension) {
    case "pdf":
      return <FileText className={cls} />;
    case "doc":
    case "docx":
      return <FileText className={cls} />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className={cls} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <ImageIcon className={cls} />;
    default:
      return <File className={cls} />;
  }
}

/**
 * Get icon background color for file type.
 */
function getIconColor(extension: string): string {
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

export default function DocumentePage({ params }: DocumentePageProps): React.JSX.Element {
  const { judet, localitate } = use(params);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("all");
  const [expandedFormGroups, setExpandedFormGroups] = useState<Record<string, boolean>>({});

  // Fetch user documents
  const documentsQuery = useQuery({
    queryKey: ["user-documents"],
    queryFn: () => fetchUserDocuments(),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch public forms
  const formsQuery = useQuery({
    queryKey: ["public-forms"],
    queryFn: () => fetchPublicForms(),
    staleTime: 5 * 60 * 1000,
  });

  const categorizedDocs: CategorizedDocuments | null = documentsQuery.data?.success
    ? documentsQuery.data.data
    : null;

  const publicForms: GroupedPublicForms | null = formsQuery.data?.success
    ? formsQuery.data.data
    : null;

  // Filter documents based on search and category
  const filteredDocuments = useMemo(() => {
    if (!categorizedDocs) return [];

    let docs: DocumentWithCerere[] = [];
    if (activeCategory === "all") {
      docs = [
        ...categorizedDocs.incarcate,
        ...categorizedDocs.chitante,
        ...categorizedDocs.confirmari,
      ];
    } else {
      docs = categorizedDocs[activeCategory] ?? [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.nume_fisier.toLowerCase().includes(q) ||
          d.tip_document.toLowerCase().includes(q) ||
          (d.cerere_numar && d.cerere_numar.toLowerCase().includes(q))
      );
    }

    return docs;
  }, [categorizedDocs, activeCategory, searchQuery]);

  const handlePreview = useCallback(async (doc: DocumentWithCerere) => {
    const result = await getDocumentSignedUrl(doc.id);
    if (result.success) {
      window.open(result.url, "_blank");
    } else {
      logger.error("Failed to get signed URL for preview:", {
        docId: doc.id,
        error: result.error,
      });
    }
  }, []);

  const handleDownload = useCallback(async (doc: DocumentWithCerere) => {
    const result = await getDocumentSignedUrl(doc.id);
    if (result.success) {
      const link = document.createElement("a");
      link.href = result.url;
      link.download = doc.nume_fisier;
      link.click();
    } else {
      logger.error("Failed to get signed URL for download:", {
        docId: doc.id,
        error: result.error,
      });
    }
  }, []);

  const toggleFormGroup = useCallback((category: string) => {
    setExpandedFormGroups((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const isLoading = documentsQuery.isLoading;
  const hasDocuments = (categorizedDocs?.totalCount ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documente</h1>
          <p className="text-muted-foreground mt-1">
            Gestioneaza documentele tale si descarca formulare publice
          </p>
        </div>
      </div>

      {/* Section 1: Documentele Mele */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">
            Documentele Mele
            {categorizedDocs && (
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                ({categorizedDocs.totalCount})
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Cauta documente..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.entries(CATEGORY_LABELS) as [DocumentCategory, string][]).map(
                  ([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={activeCategory === key ? "bg-accent" : ""}
                    >
                      {label}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Category tabs */}
        {hasDocuments && (
          <div className="flex gap-2 overflow-x-auto">
            {(Object.entries(CATEGORY_LABELS) as [DocumentCategory, string][]).map(
              ([key, label]) => {
                const count =
                  key === "all"
                    ? (categorizedDocs?.totalCount ?? 0)
                    : (categorizedDocs?.[key]?.length ?? 0);
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeCategory === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              }
            )}
          </div>
        )}

        {/* Documents table */}
        <div className="border-border rounded-lg border">
          {/* Header - hide some columns on mobile */}
          <div className="border-border bg-muted/50 hidden border-b px-4 py-3 text-sm font-medium sm:grid sm:grid-cols-12 sm:gap-4">
            <div className="col-span-5">Nume Document</div>
            <div className="col-span-2">Tip</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2">Dimensiune</div>
            <div className="col-span-1">Actiuni</div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              <span className="text-muted-foreground ml-3">Se incarca documentele...</span>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredDocuments.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-4 font-medium">
                {searchQuery
                  ? "Niciun document gasit pentru cautarea ta."
                  : "Nu ai documente inca."}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {searchQuery
                  ? "Incearca sa modifici termenii de cautare."
                  : "Documentele atasate cererilor tale vor aparea aici."}
              </p>
            </div>
          )}

          {/* Document rows */}
          {!isLoading &&
            filteredDocuments.map((doc) => {
              const ext = getFileExtension(doc.nume_fisier);
              return (
                <div
                  key={doc.id}
                  className="border-border hover:bg-muted/30 border-b px-4 py-3 transition-colors last:border-b-0"
                >
                  {/* Mobile layout */}
                  <div className="flex items-center gap-3 sm:hidden">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${getIconColor(ext)}`}
                    >
                      {getDocumentIcon(ext)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.nume_fisier}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(doc.created_at)} · {formatFileSize(doc.marime_bytes)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="hover:bg-muted rounded-md p-1.5"
                        title="Previzualizare"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="hover:bg-muted rounded-md p-1.5"
                        title="Descarca"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden items-center gap-4 sm:grid sm:grid-cols-12">
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${getIconColor(ext)}`}
                      >
                        {getDocumentIcon(ext)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{doc.nume_fisier}</p>
                        {doc.cerere_numar && (
                          <button
                            onClick={() =>
                              router.push(`/app/${judet}/${localitate}/cereri/${doc.cerere_id}`)
                            }
                            className="text-primary text-xs hover:underline"
                          >
                            Cerere #{doc.cerere_numar}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground col-span-2 text-sm">
                      {doc.tip_document}
                    </div>
                    <div className="text-muted-foreground col-span-2 text-sm">
                      {formatDate(doc.created_at)}
                    </div>
                    <div className="text-muted-foreground col-span-2 text-sm">
                      {formatFileSize(doc.marime_bytes)}
                    </div>
                    <div className="col-span-1 flex gap-1">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="hover:bg-muted rounded-md p-1.5"
                        title="Previzualizare"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="hover:bg-muted rounded-md p-1.5"
                        title="Descarca"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Section 2: Formulare Publice */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Formulare Publice</h2>
        </div>

        {formsQuery.isLoading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <span className="text-muted-foreground ml-3">Se incarca formularele...</span>
          </div>
        )}

        {!formsQuery.isLoading && (!publicForms || Object.keys(publicForms).length === 0) && (
          <div className="border-border rounded-lg border">
            <div className="p-12 text-center">
              <Download className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-4 font-medium">
                Nu sunt formulare disponibile inca.
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Formularele publice ale primariei vor fi disponibile aici.
              </p>
            </div>
          </div>
        )}

        {!formsQuery.isLoading && publicForms && Object.keys(publicForms).length > 0 && (
          <div className="space-y-3">
            {Object.entries(publicForms).map(([category, forms]) => {
              const isExpanded = expandedFormGroups[category] !== false;
              return (
                <div key={category} className="border-border rounded-lg border">
                  <button
                    onClick={() => toggleFormGroup(category)}
                    className="hover:bg-muted/30 flex w-full items-center justify-between px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground text-sm">({forms.length})</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-border border-t">
                      {forms.map((form) => (
                        <div
                          key={form.id}
                          className="border-border flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{form.nume}</p>
                            {form.descriere && (
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {form.descriere}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">{form.cod}</span>
                            {form.template_document_id ? (
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                <Download className="mr-1 h-3 w-3" />
                                Descarca
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">
                                Fara sablon
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
