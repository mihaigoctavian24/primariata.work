"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LayoutGrid, Table2, Plus, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CereriTable } from "@/components/cereri/CereriTable";
import { CereriCard, CereriCardSkeleton } from "@/components/cereri/CereriCard";
import { CereriFilters } from "@/components/cereri/CereriFilters";
import { CancelCerereDialog } from "@/components/cereri/CancelCerereDialog";
import { useCereriList } from "@/hooks/use-cereri-list";
import type { CerereStatusType } from "@/lib/validations/cereri";
import type { TipCerere } from "@/types/api";
import { toast } from "sonner";

/**
 * Cereri List Page
 * Displays user's cereri with filters, pagination, and responsive views
 *
 * Features:
 * - Table view (desktop) / Card view (mobile/tablet)
 * - Filters: Status, Tip Cerere, Search by număr
 * - Pagination (20 items per page)
 * - Quick actions: View, Cancel, Download
 * - Empty states: No cereri, No results from filters
 * - Loading states with skeletons
 */
export default function CereriPage() {
  const params = useParams();
  const router = useRouter();
  const judet = params.judet as string;
  const localitate = params.localitate as string;

  // View mode state (table/card)
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Filter states
  const [status, setStatus] = useState<CerereStatusType | undefined>();
  const [tipCerereId, setTipCerereId] = useState<string | undefined>();
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);

  // Sorting states
  type SortField = "numar_inregistrare" | "tip_cerere" | "status" | "created_at" | "data_termen";
  type SortOrder = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Helper function to check if field is API-sortable
  const isApiSortable = (
    field: SortField
  ): field is "created_at" | "data_termen" | "numar_inregistrare" => {
    return field === "created_at" || field === "data_termen" || field === "numar_inregistrare";
  };

  // Tipuri cereri state (for filter dropdown)
  const [tipuriCereri, setTipuriCereri] = useState<TipCerere[]>([]);
  const [loadingTipuri, setLoadingTipuri] = useState(true);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelCerereId, setCancelCerereId] = useState<string | null>(null);

  // Fetch cereri using custom hook
  // Only pass API-supported sort fields to avoid 400 errors
  const { cereri, pagination, isLoading, isError, error, refetch } = useCereriList({
    page,
    limit: 10,
    status,
    tipCerereId,
    search,
    sort: isApiSortable(sortField) ? sortField : "created_at",
    order: isApiSortable(sortField) ? sortOrder : "desc",
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
  }, [status, tipCerereId, search]);

  // Handlers
  const handleResetFilters = () => {
    setStatus(undefined);
    setTipCerereId(undefined);
    setSearch("");
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending order
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1); // Reset to first page when sorting changes
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

  const hasActiveFilters = status || tipCerereId || search;
  const hasNoCereri = !isLoading && cereri.length === 0 && !hasActiveFilters;
  const hasNoResults = !isLoading && cereri.length === 0 && hasActiveFilters;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Static header - Title, Filters, View Toggle */}
      <div className="border-border/40 sticky top-0 z-10 flex-shrink-0 border-b bg-white">
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
              search={search}
              tipuriCereri={tipuriCereri}
              onStatusChange={setStatus}
              onTipCerereChange={setTipCerereId}
              onSearchChange={setSearch}
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
    </div>
  );
}
