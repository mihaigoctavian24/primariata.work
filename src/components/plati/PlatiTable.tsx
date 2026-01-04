"use client";

import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Eye, Download, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PlataStatus } from "@/lib/validations/plati";
import type { Plata } from "@/types/api";

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
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onDownloadChitanta?: (plataId: string) => void;
}

/**
 * PlatiTable Component
 * Desktop table view for plati list
 *
 * Columns:
 * - Cerere (număr + tip)
 * - Sumă
 * - Status
 * - Metodă Plată
 * - Data Plată
 * - Acțiuni
 */
export function PlatiTable({
  plati,
  sortField,
  sortOrder,
  onSort,
  onDownloadChitanta,
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

  const renderSortButton = (field: string, label: string) => (
    <Button
      variant="ghost"
      size="sm"
      className="data-[state=open]:bg-accent -ml-3 h-8 hover:bg-transparent"
      onClick={() => onSort && onSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cerere</TableHead>
            <TableHead>{renderSortButton("suma", "Sumă")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Metodă</TableHead>
            <TableHead>{renderSortButton("created_at", "Data Plată")}</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plati.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nu există plăți.
              </TableCell>
            </TableRow>
          ) : (
            plati.map((plata) => {
              const canDownload = plata.status === PlataStatus.SUCCESS;

              return (
                <TableRow
                  key={plata.id}
                  className="cursor-pointer"
                  onClick={() => handleViewDetails(plata.id)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{plata.cerere?.numar_inregistrare || "N/A"}</div>
                      <div className="text-muted-foreground text-sm">
                        {plata.cerere?.tip_cerere?.nume || "Plată"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{plata.suma} RON</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={plata.status} />
                  </TableCell>
                  <TableCell className="capitalize">
                    {plata.metoda_plata === "card"
                      ? "Card"
                      : plata.metoda_plata === "bank_transfer"
                        ? "Transfer"
                        : plata.metoda_plata || "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(plata.created_at), "dd MMM yyyy, HH:mm", { locale: ro })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(plata.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canDownload && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(plata.id);
                          }}
                        >
                          <Download className="h-4 w-4" />
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
 * Loading skeleton for PlatiTable
 */
export function PlatiTableSkeleton() {
  return (
    <div className="rounded-md border">
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
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
