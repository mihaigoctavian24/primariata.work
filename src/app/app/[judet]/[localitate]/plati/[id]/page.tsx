"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  ArrowLeft,
  Download,
  FileText,
  CreditCard,
  Calendar,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PaymentStatusBadge } from "@/components/plati/PaymentStatusBadge";
import { PlataStatus } from "@/lib/validations/plati";
import { toast } from "sonner";
import { Database } from "@/types/database.types";

type Plata = Database["public"]["Tables"]["plati"]["Row"];
type Chitanta = Database["public"]["Tables"]["chitante"]["Row"];

// Extended type with joined relationships from API
type PlataWithRelations = Plata & {
  cerere?: {
    id: string;
    numar_inregistrare: string;
    tip_cerere?: {
      id: string;
      cod: string;
      nume: string;
    } | null;
  } | null;
};

/**
 * Payment Details Page
 * Displays comprehensive payment information and chitanta download
 *
 * Features:
 * - Payment summary (amount, status, date, method)
 * - Related cerere information
 * - Transaction details
 * - Chitanta download (if success)
 * - Gateway response (for debugging)
 */
export default function PlataDetailsPage({
  params,
}: {
  params: Promise<{ id: string; judet: string; localitate: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { id, judet, localitate } = unwrappedParams;

  const [isBackHovered, setIsBackHovered] = useState(false);
  const [plata, setPlata] = useState<PlataWithRelations | null>(null);
  const [chitanta, setChitanta] = useState<Chitanta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment details
  useEffect(() => {
    const fetchPlataDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/plati/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Eroare la încărcarea plății");
        }

        const data = await response.json();
        setPlata(data.data.plata);
        setChitanta(data.data.chitanta);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Eroare la încărcarea plății");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlataDetails();
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/app/${judet}/${localitate}/plati`);
  };

  // Handle chitanta download
  const handleDownloadChitanta = () => {
    if (chitanta?.pdf_url) {
      window.open(chitanta.pdf_url, "_blank");
      toast.success("Chitanță descărcată cu succes");
    } else {
      toast.error("Chitanța nu este disponibilă");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-8">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !plata) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-400">{error || "Plata nu a fost găsită"}</p>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            Înapoi la listă
          </Button>
        </div>
      </div>
    );
  }

  const canDownloadChitanta = plata.status === PlataStatus.SUCCESS && chitanta;

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">Detalii Plată</h1>
            <p className="text-muted-foreground">Informații complete despre tranzacție</p>
          </div>
        </div>

        {canDownloadChitanta && (
          <Button onClick={handleDownloadChitanta} className="gap-2">
            <Download className="h-4 w-4" />
            Descarcă Chitanță
          </Button>
        )}
      </div>

      {/* Payment Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{plata.suma} RON</CardTitle>
              <CardDescription>
                Plată pentru {plata.cerere?.tip_cerere?.nume || "cerere"}
              </CardDescription>
            </div>
            <PaymentStatusBadge status={plata.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Related Cerere */}
          {plata.cerere && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-5 w-5" />
                <span className="font-semibold">Cerere asociată</span>
              </div>
              <div className="ml-7 space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Număr: </span>
                  <span className="font-medium">{plata.cerere.numar_inregistrare}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Tip: </span>
                  <span>{plata.cerere.tip_cerere?.nume || "N/A"}</span>
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <span className="font-semibold">Data plății</span>
              </div>
              <p className="ml-7 text-sm">
                {format(new Date(plata.created_at), "dd MMMM yyyy, HH:mm", { locale: ro })}
              </p>
            </div>

            {plata.metoda_plata && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-muted-foreground h-5 w-5" />
                  <span className="font-semibold">Metodă plată</span>
                </div>
                <p className="ml-7 text-sm capitalize">
                  {plata.metoda_plata === "card"
                    ? "Card bancar"
                    : plata.metoda_plata === "bank_transfer"
                      ? "Transfer bancar"
                      : plata.metoda_plata}
                </p>
              </div>
            )}

            {plata.transaction_id && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="text-muted-foreground h-5 w-5" />
                  <span className="font-semibold">ID Tranzacție</span>
                </div>
                <p className="ml-7 font-mono text-sm">{plata.transaction_id}</p>
              </div>
            )}
          </div>

          {/* Chitanta Info */}
          {chitanta && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Chitanță generată</span>
                </div>
                <div className="ml-7 space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Număr chitanță: </span>
                    <span className="font-medium">{chitanta.numar_chitanta}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Data emitere: </span>
                    <span>
                      {format(new Date(chitanta.data_emitere), "dd MMMM yyyy", { locale: ro })}
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Gateway Response (for debugging - only show in dev) */}
          {process.env.NODE_ENV === "development" && plata.gateway_response && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-muted-foreground text-sm font-semibold">
                  Gateway Response (Dev Only)
                </span>
                <pre className="bg-muted overflow-auto rounded-md p-4 text-xs">
                  {JSON.stringify(plata.gateway_response, null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
