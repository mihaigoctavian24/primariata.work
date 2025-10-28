"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CompletionStepProps {
  respondentId?: string;
}

export function CompletionStep({ respondentId }: CompletionStepProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/survey");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Title and Message */}
        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-bold">Mulțumim pentru participare!</h1>
          <p className="text-muted-foreground text-lg">
            Chestionarul tău a fost trimis cu succes și va fi analizat de echipa noastră.
          </p>
        </div>

        {/* Information Card */}
        <Card className="mt-8">
          <CardContent className="space-y-4 pt-6 text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ce urmează?</h3>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Răspunsurile tale vor fi analizate împreună cu cele ale celorlalți participanți
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Rezultatele ne vor ajuta să îmbunătățim serviciile publice digitale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Dacă ai furnizat adresa de email, vei fi notificat când rezultatele sunt
                    publicate
                  </span>
                </li>
              </ul>
            </div>

            {respondentId && (
              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  Cod confirmare:{" "}
                  <span className="text-foreground font-mono">{respondentId.substring(0, 8)}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button onClick={handleGoHome} size="lg" className="gap-2">
            <Home className="h-5 w-5" />
            Înapoi la pagina principală
          </Button>
          <Button variant="outline" size="lg" className="gap-2" disabled>
            <BarChart3 className="h-5 w-5" />
            Vezi rezultatele
            <span className="ml-2 text-xs">(În curând)</span>
          </Button>
        </div>

        {/* Footer Message */}
        <div className="bg-muted/50 mt-8 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">
            Contribuția ta este esențială pentru dezvoltarea serviciilor publice digitale.
            <br />
            Împreună construim o administrație mai eficientă și mai aproape de cetățeni!
          </p>
        </div>
      </div>
    </div>
  );
}
