"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, CreditCard, ChevronRight, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { Cerere, Plata } from "@/types/api";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  cereri: Cerere[];
  plati: Plata[];
  isLoading: boolean;
  judet: string;
  localitate: string;
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-border/40 flex items-center gap-3 rounded-lg border p-3">
          <div className="bg-muted h-10 w-10 flex-shrink-0 animate-pulse rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  );
}

function CerereItem({
  cerere,
  judet,
  localitate,
}: {
  cerere: Cerere;
  judet: string;
  localitate: string;
}) {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_procesare: "bg-blue-100 text-blue-800",
    in_asteptare: "bg-yellow-100 text-yellow-800",
    aprobat: "bg-green-100 text-green-800",
    respins: "bg-red-100 text-red-800",
    anulat: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    draft: "Ciornă",
    in_procesare: "În procesare",
    in_asteptare: "În așteptare",
    aprobat: "Aprobat",
    respins: "Respins",
    anulat: "Anulat",
  };

  return (
    <Link
      href={`/app/${judet}/${localitate}/cereri/${cerere.id}`}
      className="hover:bg-muted/50 group border-border/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
        <FileText className="h-5 w-5 text-blue-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">
          {cerere.tip_cerere?.nume || "Cerere"}
        </p>
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          {format(new Date(cerere.created_at), "d MMM yyyy", { locale: ro })}
        </p>
      </div>
      <Badge variant="outline" className={statusColors[cerere.status]}>
        {statusLabels[cerere.status]}
      </Badge>
      <ChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 flex-shrink-0 transition-colors" />
    </Link>
  );
}

function PlataItem({
  plata,
  judet,
  localitate,
}: {
  plata: Plata;
  judet: string;
  localitate: string;
}) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "În așteptare",
    processing: "În procesare",
    success: "Finalizată",
    failed: "Eșuată",
    cancelled: "Anulată",
  };

  return (
    <Link
      href={`/app/${judet}/${localitate}/plati/${plata.id}`}
      className="hover:bg-muted/50 group border-border/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
        <CreditCard className="h-5 w-5 text-violet-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground flex items-center gap-1 text-sm font-medium">
          <DollarSign className="h-3.5 w-3.5" />
          {plata.suma.toFixed(2)} RON
        </p>
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          {format(new Date(plata.created_at), "d MMM yyyy", { locale: ro })}
        </p>
      </div>
      <Badge variant="outline" className={statusColors[plata.status]}>
        {statusLabels[plata.status]}
      </Badge>
      <ChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 flex-shrink-0 transition-colors" />
    </Link>
  );
}

export function RecentActivity({
  cereri,
  plati,
  isLoading,
  judet,
  localitate,
}: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border-border/40 rounded-lg border p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Cereri Recente</h3>
          <ActivitySkeleton />
        </div>
        <div className="bg-card border-border/40 rounded-lg border p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Plăți Recente</h3>
          <ActivitySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Cereri */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="bg-card border-border/40 rounded-lg border p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cereri Recente</h3>
          <Link
            href={`/app/${judet}/${localitate}/cereri`}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Vezi toate →
          </Link>
        </div>
        {cereri.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm">Nu ai cereri încă</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cereri.slice(0, 5).map((cerere) => (
              <CerereItem key={cerere.id} cerere={cerere} judet={judet} localitate={localitate} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Plăți */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="bg-card border-border/40 rounded-lg border p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Plăți Recente</h3>
          <Link
            href={`/app/${judet}/${localitate}/plati`}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Vezi toate →
          </Link>
        </div>
        {plati.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <CreditCard className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm">Nu ai plăți încă</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plati.slice(0, 5).map((plata) => (
              <PlataItem key={plata.id} plata={plata} judet={judet} localitate={localitate} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
