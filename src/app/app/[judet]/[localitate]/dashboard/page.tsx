"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { clearLocation } from "@/lib/location-storage";

interface DashboardPageProps {
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { judet, localitate } = use(params);
  const router = useRouter();

  // TODO: Validate județ and localitate slugs against database
  // For now, just display them

  const handleChangeLocation = () => {
    // Clear saved location
    clearLocation();

    // Redirect to landing page for re-selection
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Județul{" "}
                <span className="text-foreground font-semibold capitalize">
                  {judet.replace(/-/g, " ")}
                </span>
                , Localitatea{" "}
                <span className="text-foreground font-semibold capitalize">
                  {localitate.replace(/-/g, " ")}
                </span>
              </p>
            </div>

            {/* Change Location Button */}
            <Button variant="outline" size="sm" onClick={handleChangeLocation}>
              <MapPin className="mr-2 h-4 w-4" />
              Schimbă locația
            </Button>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-muted/50 rounded-lg border p-8">
          <h2 className="mb-4 text-2xl font-semibold">Bine ai venit! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Aceasta este pagina ta de dashboard pentru locația selectată.
          </p>

          <div className="bg-background space-y-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Județ (slug):</span>
              <code className="bg-muted rounded px-2 py-1 font-mono text-sm">{judet}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Localitate (slug):</span>
              <code className="bg-muted rounded px-2 py-1 font-mono text-sm">{localitate}</code>
            </div>
          </div>

          <p className="text-muted-foreground mt-6 text-sm">
            Această pagină este un placeholder. Funcționalitatea completă va fi implementată în
            fazele următoare.
          </p>
        </div>

        {/* Debug Info */}
        <details className="bg-muted/30 rounded-lg border p-4">
          <summary className="text-muted-foreground cursor-pointer text-sm font-medium">
            Debug Info (click to expand)
          </summary>
          <div className="mt-4 space-y-2">
            <p className="text-muted-foreground text-sm">
              <strong>Route:</strong> /app/{judet}/{localitate}/dashboard
            </p>
            <p className="text-muted-foreground text-sm">
              <strong>Params:</strong>
            </p>
            <pre className="bg-background rounded-md p-3 text-xs">
              {JSON.stringify({ judet, localitate }, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
