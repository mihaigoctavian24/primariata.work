"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Eye, Download, XCircle, Calendar, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { canCancelCerere } from "@/lib/validations/cereri";
import type { Cerere } from "@/types/api";
import type { CerereStatusType } from "@/lib/validations/cereri";

interface CereriCardProps {
  cerere: Cerere;
  onCancel: (cerereId: string) => void;
  onDownload: (cerereId: string) => void;
}

/**
 * CereriCard Component
 * Mobile/tablet card view for individual cerere
 *
 * Displays:
 * - Număr Cerere and Status
 * - Tip Cerere
 * - Data Depunere and Termen Estimat
 * - Action buttons (View, Cancel, Download)
 */
export function CereriCard({ cerere, onCancel, onDownload }: CereriCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`cereri/${cerere.id}`);
  };

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={handleViewDetails}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{cerere.numar_inregistrare}</CardTitle>
            <CardDescription className="text-sm">
              {cerere.tip_cerere?.nume || "N/A"}
            </CardDescription>
          </div>
          <StatusBadge status={cerere.status as CerereStatusType} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Data Depunere */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">Depusă:</span>
          <span className="font-medium">
            {format(new Date(cerere.created_at), "dd MMM yyyy", { locale: ro })}
          </span>
        </div>

        {/* Termen Estimat */}
        {cerere.data_termen && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="text-muted-foreground size-4" />
            <span className="text-muted-foreground">Termen:</span>
            <span className="font-medium">
              {format(new Date(cerere.data_termen), "dd MMM yyyy", { locale: ro })}
            </span>
          </div>
        )}

        {/* Payment Info */}
        {cerere.necesita_plata && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Plată:</span>
            <span className={cerere.plata_efectuata ? "text-green-600" : "text-orange-600"}>
              {cerere.plata_efectuata ? "Efectuată" : "Neplătită"}
            </span>
            {cerere.valoare_plata && (
              <span className="font-medium">{cerere.valoare_plata} RON</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
          className="flex-1 gap-2"
        >
          <Eye className="size-4" />
          Vezi detalii
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(cerere.id);
            }}
            title="Descarcă documente"
          >
            <Download className="size-4" />
          </Button>

          {canCancelCerere(cerere.status as CerereStatusType) && (
            <Button
              variant="outline"
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
      </CardFooter>
    </Card>
  );
}

/**
 * CereriCardSkeleton Component
 * Loading skeleton for card view
 */
export function CereriCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-5 w-32 animate-pulse rounded" />
            <div className="bg-muted h-4 w-48 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-muted size-4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-4 w-28 animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted size-4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-4 w-28 animate-pulse rounded" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className="bg-muted h-9 flex-1 animate-pulse rounded" />
        <div className="flex items-center gap-2">
          <div className="bg-muted size-9 animate-pulse rounded" />
          <div className="bg-muted size-9 animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}
