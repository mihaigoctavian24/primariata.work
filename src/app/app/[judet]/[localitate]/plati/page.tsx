"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutGrid, Table2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlatiTable, PlatiTableSkeleton } from "@/components/plati/PlatiTable";
import { PlatiCard, PlatiCardSkeleton } from "@/components/plati/PlatiCard";
import { PlatiFilters } from "@/components/plati/PlatiFilters";
import { usePlatiList } from "@/hooks/use-plati-list";
import type { PlataStatusType } from "@/lib/validations/plati";
import { toast } from "sonner";

/**
 * Plati List Page
 * Displays user's payments with filters, pagination, and responsive views
 *
 * Features:
 * - Table view (desktop) / Card view (mobile/tablet)
 * - Filters: Status, Date range
 * - Pagination (20 items per page)
 * - Download chitanta for successful payments
 * - Empty states: No payments, No results from filters
 * - Loading states with skeletons
 */
export default function PlatiPage() {
  const params = useParams();
  const router = useRouter();
  const judet = params.judet as string;
  const localitate = params.localitate as string;

  // View mode state (table/card)
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Filter states
  const [status, setStatus] = useState<PlataStatusType | undefined>();
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  // Sorting states
  type SortField = "created_at" | "updated_at" | "suma";
  type SortOrder = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch plati using custom hook
  const { plati, pagination, isLoading, isError, error, refetch } = usePlatiList({
    page,
    limit: 10,
    status,
    dateFrom,
    dateTo,
    sort: sortField,
    order: sortOrder,
  });

  // Handle filter reset
  const handleResetFilters = () => {
    setStatus(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.total_pages) setPage(page + 1);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field as SortField);
      setSortOrder("desc");
    }
  };

  // Handle chitanta download
  const handleDownloadChitanta = async (plataId: string) => {
    try {
      const response = await fetch(`/api/plati/${plataId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Eroare la descărcarea chitanței");
      }

      const data = await response.json();

      if (data.data.chitanta?.pdf_url) {
        // Open PDF in new tab (actual PDF generation in Phase 2)
        window.open(data.data.chitanta.pdf_url, "_blank");
        toast.success("Chitanță descărcată cu succes");
      } else {
        toast.error("Chitanța nu este disponibilă");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Eroare la descărcarea chitanței");
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/app/${judet}/${localitate}`);
  };

  // Check if filters are active
  const hasActiveFilters = status || dateFrom || dateTo;

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            className="gap-2"
          >
            <motion.div animate={{ x: isBackHovered ? -4 : 0 }} transition={{ duration: 0.2 }}>
              <ArrowLeft className="h-4 w-4" />
            </motion.div>
            Înapoi
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plăți</h1>
            <p className="text-muted-foreground">Istoricul plăților pentru cereri și taxe</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="gap-2"
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tabel</span>
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Card</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <PlatiFilters
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStatusChange={setStatus}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={handleResetFilters}
      />

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-400">
            {error?.message || "Eroare la încărcarea plăților"}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Încearcă din nou
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {viewMode === "table" ? (
            <PlatiTableSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PlatiCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {plati.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <div className="mx-auto max-w-sm space-y-4">
                <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <Table2 className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {hasActiveFilters ? "Nu s-au găsit plăți" : "Nu aveți plăți"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {hasActiveFilters
                      ? "Încercați să schimbați filtrele"
                      : "Plățile vor apărea aici după efectuare"}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleResetFilters}>
                    Resetează filtrele
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Table or Card View */}
              {viewMode === "table" ? (
                <PlatiTable
                  plati={plati}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onDownloadChitanta={handleDownloadChitanta}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plati.map((plata) => (
                    <PlatiCard
                      key={plata.id}
                      plata={plata}
                      onDownloadChitanta={handleDownloadChitanta}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Pagina {pagination.page} din {pagination.total_pages} ({pagination.total} plăți)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === pagination.total_pages}
                    >
                      Următor
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
