"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft } from "lucide-react";
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
  const [isBackHovered, setIsBackHovered] = useState(false);

  // TODO: Validate județ and localitate slugs against database
  // For now, just display them

  const handleChangeLocation = () => {
    // Clear saved location
    clearLocation();

    // Redirect to landing page for re-selection
    router.push("/");
  };

  return (
    <>
      {/* Page Header - Fixed */}
      <div
        className="px-4 py-6 sm:px-6 lg:px-8"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%)",
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <motion.button
                onClick={() => router.back()}
                onMouseEnter={() => setIsBackHovered(true)}
                onMouseLeave={() => setIsBackHovered(false)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <motion.div
                  animate={{ x: isBackHovered ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </motion.div>
                Înapoi
              </motion.button>

              {/* Change Location Button */}
              <Button variant="outline" size="sm" onClick={handleChangeLocation}>
                <MapPin className="mr-2 h-4 w-4" />
                Schimbă locația
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
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
    </>
  );
}
