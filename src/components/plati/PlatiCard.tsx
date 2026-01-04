"use client";

import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Eye, Download, Calendar, CreditCard, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PlataStatus } from "@/lib/validations/plati";
import type { Plata } from "@/types/api";

interface PlatiCardProps {
  plata: Plata & {
    cerere?: {
      id: string;
      numar_inregistrare: string;
      tip_cerere?: {
        nume: string;
      };
    };
  };
  onDownloadChitanta?: (plataId: string) => void;
}

/**
 * PlatiCard Component
 * Mobile/tablet card view for individual plata
 *
 * Displays:
 * - Payment amount and status
 * - Related cerere info
 * - Payment date and method
 * - Action buttons (View details, Download chitanta)
 */
export function PlatiCard({ plata, onDownloadChitanta }: PlatiCardProps) {
  const router = useRouter();
  const params = useParams();
  const judet = params.judet as string;
  const localitate = params.localitate as string;

  const handleViewDetails = () => {
    router.push(`/app/${judet}/${localitate}/plati/${plata.id}`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownloadChitanta) {
      onDownloadChitanta(plata.id);
    }
  };

  const canDownloadChitanta = plata.status === PlataStatus.SUCCESS;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={handleViewDetails}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg font-bold">{plata.suma} RON</CardTitle>
            <CardDescription className="text-sm">
              {plata.cerere?.tip_cerere?.nume || "Plată"}
            </CardDescription>
          </div>
          <PaymentStatusBadge status={plata.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Cerere Reference */}
        {plata.cerere && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="text-muted-foreground size-4" />
            <span className="text-muted-foreground">Cerere:</span>
            <span className="font-medium">{plata.cerere.numar_inregistrare}</span>
          </div>
        )}

        {/* Payment Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium">
            {format(new Date(plata.created_at), "dd MMM yyyy, HH:mm", { locale: ro })}
          </span>
        </div>

        {/* Payment Method */}
        {plata.metoda_plata && (
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="text-muted-foreground size-4" />
            <span className="text-muted-foreground">Metodă:</span>
            <span className="font-medium capitalize">
              {plata.metoda_plata === "card"
                ? "Card bancar"
                : plata.metoda_plata === "bank_transfer"
                  ? "Transfer bancar"
                  : plata.metoda_plata}
            </span>
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
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Detalii
        </Button>

        {canDownloadChitanta && (
          <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Chitanță
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Loading skeleton for PlatiCard
 */
export function PlatiCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}
