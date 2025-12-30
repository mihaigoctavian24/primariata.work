"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Eye, Download, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { canCancelCerere } from "@/lib/validations/cereri";
import type { Cerere } from "@/types/api";
import type { CerereStatusType } from "@/lib/validations/cereri";

type SortField = "numar_inregistrare" | "tip_cerere" | "status" | "created_at" | "data_termen";
type SortOrder = "asc" | "desc";

interface CereriTableProps {
  cereri: Cerere[];
  onCancel: (cerereId: string) => void;
  onDownload: (cerereId: string) => void;
  isLoading?: boolean;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
}

/**
 * CereriTable Component
 * Desktop table view for cereri list
 *
 * Columns:
 * - Număr Cerere (sortable)
 * - Tip Cerere (sortable)
 * - Status (sortable)
 * - Data Depunere (sortable)
 * - Termen Estimat (sortable)
 * - Acțiuni (View, Cancel, Download)
 */
export function CereriTable({
  cereri,
  onCancel,
  onDownload,
  isLoading,
  sortField,
  sortOrder,
  onSort,
}: CereriTableProps) {
  const router = useRouter();

  const handleViewDetails = (cerereId: string) => {
    router.push(`cereri/${cerereId}`);
  };

  // Client-side sorting for fields not supported by API
  const sortedCereri = React.useMemo(() => {
    if (!sortField || !sortOrder) return cereri;

    const sorted = [...cereri];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "tip_cerere":
          // Alphabetical sorting for tip_cerere
          aValue = a.tip_cerere?.nume || "";
          bValue = b.tip_cerere?.nume || "";
          break;
        case "status":
          // Logical status order: draft → depusa/trimisa → in_procesare → finalizata → anulata/respinsa
          const statusOrder: Record<string, number> = {
            draft: 0,
            depusa: 1,
            trimisa: 2,
            in_procesare: 3,
            finalizata: 4,
            anulata: 5,
            respinsa: 6,
          };
          aValue = statusOrder[a.status] ?? 999;
          bValue = statusOrder[b.status] ?? 999;
          break;
        case "created_at":
        case "data_termen":
        case "numar_inregistrare":
          // These are sorted by API, so just return the original array
          return cereri;
        default:
          return cereri;
      }

      // Numeric comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      // String comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "ro");
        return sortOrder === "asc" ? comparison : -comparison;
      }

      return 0;
    });

    return sorted;
  }, [cereri, sortField, sortOrder]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="text-muted-foreground ml-2 size-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 size-4" />
    ) : (
      <ArrowDown className="ml-2 size-4" />
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <button
        onClick={() => onSort?.(field)}
        className="hover:text-foreground flex items-center transition-colors"
      >
        {children}
        {getSortIcon(field)}
      </button>
    </TableHead>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="border-border/40 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="numar_inregistrare">Număr Cerere</SortableHeader>
            <SortableHeader field="tip_cerere">Tip Cerere</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="created_at">Data Depunere</SortableHeader>
            <SortableHeader field="data_termen">Termen Estimat</SortableHeader>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCereri.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                Nu există cereri de afișat
              </TableCell>
            </TableRow>
          ) : (
            sortedCereri.map((cerere, index) => (
              <TableRow
                key={cerere.id}
                className={`hover:bg-muted/70 cursor-pointer transition-colors ${
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                }`}
              >
                <TableCell className="font-medium" onClick={() => handleViewDetails(cerere.id)}>
                  {cerere.numar_inregistrare}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(cerere.id)}>
                  {cerere.tip_cerere?.nume || "N/A"}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(cerere.id)}>
                  <StatusBadge status={cerere.status as CerereStatusType} />
                </TableCell>
                <TableCell onClick={() => handleViewDetails(cerere.id)}>
                  {format(new Date(cerere.created_at), "dd MMM yyyy", { locale: ro })}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(cerere.id)}>
                  {cerere.data_termen
                    ? format(new Date(cerere.data_termen), "dd MMM yyyy", { locale: ro })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(cerere.id);
                      }}
                      title="Vezi detalii"
                    >
                      <Eye className="size-4" />
                    </Button>

                    {/* Download button - only show if documents available */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(cerere.id);
                      }}
                      title="Descarcă documente"
                    >
                      <Download className="size-4" />
                    </Button>

                    {/* Cancel button - only if status allows */}
                    {canCancelCerere(cerere.status as CerereStatusType) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel(cerere.id);
                        }}
                        title="Anulează cerere"
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * TableSkeleton Component
 * Loading skeleton for table
 */
function TableSkeleton() {
  return (
    <div className="border-border/40 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Număr Cerere</TableHead>
            <TableHead>Tip Cerere</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Depunere</TableHead>
            <TableHead>Termen Estimat</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <div className="bg-muted size-8 animate-pulse rounded" />
                  <div className="bg-muted size-8 animate-pulse rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
