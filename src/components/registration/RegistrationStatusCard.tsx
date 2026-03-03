"use client";

import { Clock, XCircle, Mail, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RegistrationStatusCardProps {
  status: "pending" | "rejected";
  primarieName: string;
  rejectionReason?: string | null;
  primarieEmail?: string;
  onReapply?: () => void;
  isReapplying?: boolean;
}

/**
 * Status card component displaying pending or rejected registration state.
 * Used inside PendingStatusPage for a calm, informative user experience.
 */
export function RegistrationStatusCard({
  status,
  primarieName,
  rejectionReason,
  primarieEmail,
  onReapply,
  isReapplying = false,
}: RegistrationStatusCardProps) {
  if (status === "pending") {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </motion.div>
            <div>
              <CardTitle className="text-xl">Inregistrare in asteptare</CardTitle>
              <Badge
                variant="secondary"
                className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              >
                In curs de verificare
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cererea ta de inregistrare la{" "}
            <span className="text-foreground font-semibold">{primarieName}</span> este in curs de
            verificare de catre un administrator.
          </p>
          <p className="text-muted-foreground text-sm">
            Vei fi notificat automat cand cererea ta va fi procesata. De obicei, verificarea dureaza
            intre cateva ore si 1-2 zile lucratoare.
          </p>
          {primarieEmail && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>Contact primarie: </span>
              <a
                href={`mailto:${primarieEmail}`}
                className="text-primary underline hover:no-underline"
              >
                {primarieEmail}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Rejected status
  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          <div>
            <CardTitle className="text-xl">Inregistrare respinsa</CardTitle>
            <Badge variant="destructive" className="mt-1">
              Respinsa
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Cererea ta de inregistrare la{" "}
          <span className="text-foreground font-semibold">{primarieName}</span> a fost respinsa de
          un administrator.
        </p>
        {rejectionReason && (
          <div className="rounded-md border border-red-200 bg-red-100/50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Motiv respingere:</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{rejectionReason}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          {onReapply && (
            <Button onClick={onReapply} disabled={isReapplying} variant="default">
              {isReapplying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Se trimite...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Aplica din nou
                </>
              )}
            </Button>
          )}
          {primarieEmail && (
            <a href={`mailto:${primarieEmail}`}>
              <Button variant="outline" type="button">
                <Mail className="mr-2 h-4 w-4" />
                Contacteaza primaria
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
