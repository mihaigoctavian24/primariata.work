"use client";

import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Eye, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PlataStatus } from "@/lib/validations/plati";
import type { Plata } from "@/types/api";

type SortField = "suma" | "created_at";
type SortOrder = "asc" | "desc";

interface PlatiTableProps {
  plati: (Plata & {
    cerere?: {
      id: string;
      numar_inregistrare: string;
      tip_cerere?: {
        nume: string;
      };
    };
  })[];
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
  onDownloadChitanta?: (plataId: string) => void;
  isLoading?: boolean;
}

/**
 * PlatiTable Component
 * Desktop table view for plati list
 *
 * Columns:
 * - Cerere (număr + tip)
 * - Sumă (sortable)
 * - Status
 * - Metodă Plată
 * - Data Plată (sortable)
 * - Acțiuni (View, Download)
 */
export function PlatiTable({
  plati,
  sortField,
  sortOrder,
  onSort,
  onDownloadChitanta,
  isLoading,
}: PlatiTableProps) {
  const router = useRouter();
  const params = useParams();
  const judet = params.judet as string;
  const localitate = params.localitate as string;

  const handleViewDetails = (plataId: string) => {
    router.push(`/app/${judet}/${localitate}/plati/${plataId}`);
  };

  const handleDownload = (plataId: string) => {
    if (onDownloadChitanta) {
      onDownloadChitanta(plataId);
    }
  };

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
    return <PlatiTableSkeleton />;
  }

  return (
    <div className="border-border/40 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cerere</TableHead>
            <SortableHeader field="suma">Sumă</SortableHeader>
            <TableHead>Status</TableHead>
            <TableHead>Metodă</TableHead>
            <SortableHeader field="created_at">Data Plată</SortableHeader>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plati.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                Nu există plăți de afișat
              </TableCell>
            </TableRow>
          ) : (
            plati.map((plata, index) => {
              const canDownload = plata.status === PlataStatus.SUCCESS;

              return (
                <TableRow
                  key={plata.id}
                  className={`hover:bg-muted/70 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <TableCell className="cursor-pointer" onClick={() => handleViewDetails(plata.id)}>
                    <div className="space-y-1">
                      <div className="font-medium">{plata.cerere?.numar_inregistrare || "N/A"}</div>
                      <div className="text-muted-foreground text-sm">
                        {plata.cerere?.tip_cerere?.nume || "Plată"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="cursor-pointer font-medium"
                    onClick={() => handleViewDetails(plata.id)}
                  >
                    {plata.suma} RON
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleViewDetails(plata.id)}>
                    <PaymentStatusBadge status={plata.status} />
                  </TableCell>
                  <TableCell
                    className="cursor-pointer capitalize"
                    onClick={() => handleViewDetails(plata.id)}
                  >
                    {plata.metoda_plata === "card"
                      ? "Card"
                      : plata.metoda_plata === "bank_transfer"
                        ? "Transfer"
                        : plata.metoda_plata || "—"}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleViewDetails(plata.id)}>
                    {format(new Date(plata.created_at), "dd MMM yyyy, HH:mm", { locale: ro })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(plata.id);
                        }}
                        title="Vezi detalii"
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canDownload && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(plata.id);
                          }}
                          title="Descarcă chitanță"
                        >
                          <Download className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * PlatiTableSkeleton Component
 * Loading skeleton for table
 */
export function PlatiTableSkeleton() {
  return (
    <div className="border-border/40 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cerere</TableHead>
            <TableHead>Sumă</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Metodă</TableHead>
            <TableHead>Data Plată</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="space-y-1">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-32 animate-pulse rounded" />
                </div>
              </TableCell>
              <TableCell>
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-4 w-16 animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="bg-muted h-4 w-28 animate-pulse rounded" />
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
