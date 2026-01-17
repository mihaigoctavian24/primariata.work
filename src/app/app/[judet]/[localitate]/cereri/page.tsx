"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Table2, Plus, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CereriTable } from "@/components/cereri/CereriTable";
import { CereriCard, CereriCardSkeleton } from "@/components/cereri/CereriCard";
import { CereriFilters } from "@/components/cereri/CereriFilters";
import { CancelCerereDialog } from "@/components/cereri/CancelCerereDialog";
import { BulkCancelDialog } from "@/components/cereri/BulkCancelDialog";
import { useCereriList } from "@/hooks/use-cereri-list";
import { useDebounce } from "@/hooks/use-debounce";
import type { CerereStatusType } from "@/lib/validations/cereri";
import type { TipCerere } from "@/types/api";
import { toast } from "sonner";
import JSZip from "jszip";

/**
 * Cereri List Page
 * Displays user's cereri with filters, pagination, and responsive views
 *
 * Features (Enhanced Issue #88):
 * - Table view (desktop) / Card view (mobile/tablet)
 * - Advanced Filters: Status, Tip Cerere, Search, Date Range, Sort
 * - Debounced search (300ms)
 * - URL state persistence for shareable links
 * - Pagination (10 items per page)
 * - Quick actions: View, Cancel, Download
 * - Empty states: No cereri, No results from filters
 * - Loading states with skeletons
 */
export default function CereriPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const judet = params.judet as string;
  const localitate = params.localitate as string;

  // View mode state (table/card)
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Initialize filter states from URL
  const [status, setStatus] = useState<CerereStatusType | undefined>(
    (searchParams.get("status") as CerereStatusType) || undefined
  );
  const [tipCerereId, setTipCerereId] = useState<string | undefined>(
    searchParams.get("tip") || undefined
  );
  const [searchInput, setSearchInput] = useState<string>(searchParams.get("search") || "");

  // Parse dates from URL params with proper null handling
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    fromParam ? new Date(fromParam) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(toParam ? new Date(toParam) : undefined);

  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "created_at_desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Parse sortBy into sort field and order
  // Split on last underscore to handle fields like "created_at"
  const lastUnderscoreIndex = sortBy.lastIndexOf("_");
  const sortField = sortBy.substring(0, lastUnderscoreIndex) as
    | "created_at"
    | "numar_inregistrare"
    | "status";
  const sortOrder = sortBy.substring(lastUnderscoreIndex + 1) as "asc" | "desc";

  // Helper function to check if field is API-sortable
  type ApiSortField = "created_at" | "data_termen" | "numar_inregistrare";
  const isApiSortable = (field: string): field is ApiSortField => {
    return field === "created_at" || field === "data_termen" || field === "numar_inregistrare";
  };

  // Tipuri cereri state (for filter dropdown)
  const [tipuriCereri, setTipuriCereri] = useState<TipCerere[]>([]);
  const [, setLoadingTipuri] = useState(true);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelCerereId, setCancelCerereId] = useState<string | null>(null);

  // Bulk cancel dialog state
  const [showBulkCancelDialog, setShowBulkCancelDialog] = useState(false);
  const [bulkCancelIds, setBulkCancelIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (tipCerereId) params.set("tip", tipCerereId);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (dateFrom) {
      const fromStr = dateFrom.toISOString().split("T")[0];
      if (fromStr) params.set("from", fromStr);
    }
    if (dateTo) {
      const toStr = dateTo.toISOString().split("T")[0];
      if (toStr) params.set("to", toStr);
    }
    if (sortBy !== "created_at_desc") params.set("sort", sortBy);
    if (page !== 1) params.set("page", page.toString());

    const paramsString = params.toString();
    const newUrl = `${window.location.pathname}${paramsString ? `?${paramsString}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [
    status,
    tipCerereId,
    debouncedSearch,
    dateFrom,
    dateTo,
    sortBy,
    page,
    judet,
    localitate,
    router,
  ]);

  // Fetch cereri using custom hook
  // Only pass API-supported sort fields to avoid 400 errors
  const { cereri, pagination, isLoading, isError, error, refetch } = useCereriList({
    page,
    limit: 10,
    status,
    tipCerereId,
    search: debouncedSearch,
    dateFrom,
    dateTo,
    sort: isApiSortable(sortField) ? sortField : "created_at",
    order: sortOrder,
  });

  // Fetch tipuri cereri for filter
  useEffect(() => {
    const fetchTipuriCereri = async () => {
      try {
        const response = await fetch("/api/tipuri-cereri");
        if (response.ok) {
          const data = await response.json();
          setTipuriCereri(data.data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch tipuri cereri:", err);
      } finally {
        setLoadingTipuri(false);
      }
    };

    fetchTipuriCereri();
  }, []);

  // Auto-detect view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode("card");
      } else {
        setViewMode("table");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [status, tipCerereId, debouncedSearch, dateFrom, dateTo, sortBy]);

  // Handlers
  const handleResetFilters = () => {
    setStatus(undefined);
    setTipCerereId(undefined);
    setSearchInput("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortBy("created_at_desc");
    setPage(1);
  };

  const handleDateRangeChange = (from?: Date, to?: Date) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  // Keep old handleSort for table column sorting (if used)
  type SortField = "numar_inregistrare" | "tip_cerere" | "status" | "created_at" | "data_termen";
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortBy(`${field}_${newOrder}`);
    } else {
      // Set new field with ascending order
      setSortBy(`${field}_asc`);
    }
  };

  const handleCancel = (cerereId: string) => {
    setCancelCerereId(cerereId);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async (motiv: string) => {
    if (!cancelCerereId) return;

    try {
      const response = await fetch(`/api/cereri/${cancelCerereId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motiv_anulare: motiv }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Eroare la anularea cererii");
      }

      toast.success("Cerere anulată cu succes");
      refetch(); // Refresh list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la anularea cererii");
      throw err; // Re-throw to let dialog know there was an error
    }
  };

  const handleDownload = async (cerereId: string) => {
    // TODO: Implement download documents logic
    console.log("Download documents for cerere:", cerereId);
  };

  // Bulk cancel handler
  const handleBulkCancel = async (cereriIds: string[]) => {
    setBulkCancelIds(cereriIds);
    setShowBulkCancelDialog(true);
  };

  const handleConfirmBulkCancel = async () => {
    try {
      setIsBulkProcessing(true);

      const response = await fetch("/api/cereri/bulk-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cereri_ids: bulkCancelIds,
          motiv_anulare: "Anulare în masă din interfață utilizator",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Eroare la anularea cererilor");
      }

      const result = await response.json();

      if (result.data.succeeded > 0) {
        toast.success(
          `${result.data.succeeded} ${result.data.succeeded === 1 ? "cerere anulată" : "cereri anulate"} cu succes`
        );
      }

      if (result.data.failed > 0) {
        toast.error(
          `${result.data.failed} ${result.data.failed === 1 ? "cerere" : "cereri"} nu au putut fi anulate`
        );
      }

      refetch(); // Refresh list
      setShowBulkCancelDialog(false);
      setBulkCancelIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la anularea cererilor");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk download handler
  const handleBulkDownload = async (cereriIds: string[]) => {
    try {
      toast.info("Pregătire descărcare documente...");

      const zip = new JSZip();
      let documentsFound = 0;
      let errors = 0;

      // Download documents for each cerere
      for (const cerereId of cereriIds) {
        try {
          const response = await fetch(`/api/cereri/${cerereId}/documents`);

          if (!response.ok) {
            errors++;
            continue;
          }

          const result = await response.json();
          const documents = result.data?.items || [];

          if (documents.length === 0) {
            continue;
          }

          // Get cerere info for folder name
          const cerere = cereri.find((c) => c.id === cerereId);
          const folderName = cerere?.numar_inregistrare || cerereId.substring(0, 8);

          // Download each document
          for (const doc of documents) {
            try {
              const docResponse = await fetch(`/api/cereri/${cerereId}/documents/${doc.id}`);

              if (!docResponse.ok) {
                continue;
              }

              const docBlob = await docResponse.blob();
              zip.file(`${folderName}/${doc.nume_fisier}`, docBlob);
              documentsFound++;
            } catch (err) {
              console.error(`Error downloading document ${doc.id}:`, err);
            }
          }
        } catch (err) {
          console.error(`Error fetching documents for cerere ${cerereId}:`, err);
          errors++;
        }
      }

      if (documentsFound === 0) {
        toast.error("Nu s-au găsit documente pentru cererile selectate");
        return;
      }

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cereri_${judet}_${localitate}_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `${documentsFound} ${documentsFound === 1 ? "document descărcat" : "documente descărcate"}${errors > 0 ? ` (${errors} erori)` : ""}`
      );
    } catch (err) {
      console.error("Error creating ZIP:", err);
      toast.error("Eroare la crearea arhivei ZIP");
    }
  };

  const hasActiveFilters = status || tipCerereId || debouncedSearch || dateFrom || dateTo;
  const hasNoCereri = !isLoading && cereri.length === 0 && !hasActiveFilters;
  const hasNoResults = !isLoading && cereri.length === 0 && hasActiveFilters;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Static header - Title, Filters, View Toggle */}
      <div className="border-border/40 bg-background sticky top-0 z-10 flex-shrink-0 border-b">
        <div className="container mx-auto space-y-4 px-4 py-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Cererile Mele</h1>
              <p className="text-muted-foreground mt-1">
                Vizualizează și gestionează toate cererile tale
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Back Button */}
              <motion.button
                onClick={() => router.back()}
                onMouseEnter={() => setIsBackHovered(true)}
                onMouseLeave={() => setIsBackHovered(false)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <motion.div
                  animate={{ x: isBackHovered ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </motion.div>
                Înapoi
              </motion.button>

              <Link href={`/app/${judet}/${localitate}/cereri/wizard`}>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Cerere Nouă
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CereriFilters
              status={status}
              tipCerereId={tipCerereId}
              search={searchInput}
              dateFrom={dateFrom}
              dateTo={dateTo}
              sortBy={sortBy}
              tipuriCereri={tipuriCereri}
              onStatusChange={setStatus}
              onTipCerereChange={setTipCerereId}
              onSearchChange={setSearchInput}
              onDateRangeChange={handleDateRangeChange}
              onSortChange={handleSortChange}
              onReset={handleResetFilters}
              className="flex-1"
            />

            {/* View Mode Toggle (Desktop only) */}
            <div className="border-border/40 hidden items-center gap-2 rounded-lg border p-1 lg:flex">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <Table2 className="size-4" />
                Tabel
              </Button>
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="gap-2"
              >
                <LayoutGrid className="size-4" />
                Card
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto space-y-6 px-4 py-6">
          {/* Error State */}
          {isError && (
            <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6 text-center">
              <p className="text-destructive font-medium">
                A apărut o eroare la încărcarea cererilor
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {error?.message || "Te rugăm să încerci din nou"}
              </p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Încearcă din nou
              </Button>
            </div>
          )}

          {/* No Cereri State */}
          {hasNoCereri && (
            <div className="border-border/40 bg-muted/30 rounded-lg border p-12 text-center">
              <div className="mx-auto max-w-md space-y-4">
                <div className="bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-full">
                  <Plus className="text-primary size-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Nu aveți cereri depuse</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Începeți prin a depune o cerere nouă către primărie
                  </p>
                </div>
                <Link href={`/app/${judet}/${localitate}/cereri/wizard`}>
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Cerere Nouă
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No Results State */}
          {hasNoResults && (
            <div className="border-border/40 bg-muted/30 rounded-lg border p-12 text-center">
              <div className="mx-auto max-w-md space-y-4">
                <h3 className="text-lg font-semibold">Nu s-au găsit cereri</h3>
                <p className="text-muted-foreground text-sm">
                  Încercați să modificați filtrele sau să căutați altceva
                </p>
                <Button variant="outline" onClick={handleResetFilters}>
                  Resetează filtre
                </Button>
              </div>
            </div>
          )}

          {/* Content - Table View (Desktop) */}
          {!hasNoCereri && !hasNoResults && viewMode === "table" && (
            <CereriTable
              cereri={cereri}
              onCancel={handleCancel}
              onDownload={handleDownload}
              onBulkCancel={handleBulkCancel}
              onBulkDownload={handleBulkDownload}
              isLoading={isLoading}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}

          {/* Content - Card View (Mobile/Tablet) */}
          {!hasNoCereri && !hasNoResults && viewMode === "card" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => <CereriCardSkeleton key={index} />)
                : cereri.map((cerere) => (
                    <CereriCard
                      key={cerere.id}
                      cerere={cerere}
                      onCancel={handleCancel}
                      onDownload={handleDownload}
                    />
                  ))}
            </div>
          )}

          {/* Pagination */}
          {!hasNoCereri && !hasNoResults && pagination.total_pages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-muted-foreground text-sm">
                Pagina {pagination.page} din {pagination.total_pages} ({pagination.total} cereri)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1 || isLoading}
                  className="gap-2"
                >
                  <ChevronLeft className="size-4" />
                  Anterioara
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        disabled={isLoading}
                        className="hidden size-9 p-0 sm:inline-flex"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                  disabled={pagination.page === pagination.total_pages || isLoading}
                  className="gap-2"
                >
                  Următoarea
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <CancelCerereDialog
        isOpen={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
        cerereNumar={
          cancelCerereId
            ? cereri.find((c) => c.id === cancelCerereId)?.numar_inregistrare
            : undefined
        }
      />

      {/* Bulk Cancel Dialog */}
      <BulkCancelDialog
        isOpen={showBulkCancelDialog}
        onOpenChange={setShowBulkCancelDialog}
        onConfirm={handleConfirmBulkCancel}
        count={bulkCancelIds.length}
        isLoading={isBulkProcessing}
      />
    </div>
  );
}
