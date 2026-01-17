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
  type SortField = "created_at" | "suma";
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
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Static header - Title, Filters, View Toggle */}
      <div className="border-border/40 bg-background sticky top-0 z-10 flex-shrink-0 border-b">
        <div className="container mx-auto space-y-4 px-4 py-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Plăți</h1>
              <p className="text-muted-foreground mt-1">Istoricul plăților pentru cereri și taxe</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Back Button */}
              <motion.button
                onClick={handleBack}
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
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <PlatiFilters
                status={status}
                onStatusChange={setStatus}
                onReset={handleResetFilters}
                search=""
                onSearchChange={() => {}}
                dateFrom={undefined}
                dateTo={undefined}
                onDateRangeChange={() => {}}
                sortBy="created_at_desc"
                onSortChange={() => {}}
              />
            </div>

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
                A apărut o eroare la încărcarea plăților
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {error?.message || "Te rugăm să încerci din nou"}
              </p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
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
                <div className="border-border/40 bg-muted/30 rounded-lg border p-12 text-center">
                  <div className="mx-auto max-w-sm space-y-4">
                    <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                      <Table2 className="text-primary h-6 w-6" />
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
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                      <p className="text-muted-foreground text-sm">
                        Pagina {pagination.page} din {pagination.total_pages} ({pagination.total}{" "}
                        plăți)
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={page === 1 || isLoading}
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
                          onClick={handleNextPage}
                          disabled={page === pagination.total_pages || isLoading}
                          className="gap-2"
                        >
                          Următoarea
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
