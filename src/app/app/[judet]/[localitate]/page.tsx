"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { clearLocation } from "@/lib/location-storage";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  CetățeanDashboard,
  FuncționarDashboard,
  PrimarDashboard,
  AdminDashboard,
} from "@/components/dashboard/role-dashboards";

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

  // Fetch user profile with role information
  const { profile, isLoading, isError, error } = useUserProfile();

  const handleChangeLocation = () => {
    clearLocation();
    router.push("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Se încarcă dashboard-ul...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold">Eroare la încărcarea profilului</h2>
          <p className="text-muted-foreground">
            {error?.message || "Nu am putut încărca informațiile profilului. Încearcă din nou."}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.location.reload()} variant="default">
              Reîncarcă Pagina
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Înapoi Acasă
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if account is active
  if (profile.activ === false) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <div className="text-6xl">🚫</div>
          <h2 className="text-2xl font-bold">Cont Dezactivat</h2>
          <p className="text-muted-foreground">
            Contul tău a fost dezactivat. Te rugăm să contactezi administratorul primăriei pentru
            mai multe detalii.
          </p>
          <Button onClick={() => router.push("/")} variant="default">
            Înapoi Acasă
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header with Location Info */}
      <div className="via-background/50 to-background bg-gradient-to-b from-transparent px-4 py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl space-y-4">
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

      {/* Page Content - Role-Based Dashboard Rendering */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Render appropriate dashboard based on user role */}
          {profile.rol === "cetatean" && (
            <CetățeanDashboard judet={judet} localitate={localitate} />
          )}

          {profile.rol === "functionar" && (
            <FuncționarDashboard judet={judet} localitate={localitate} profile={profile} />
          )}

          {profile.rol === "primar" && (
            <PrimarDashboard judet={judet} localitate={localitate} profile={profile} />
          )}

          {(profile.rol === "admin" || profile.rol === "super_admin") && (
            <AdminDashboard judet={judet} localitate={localitate} profile={profile} />
          )}

          {/* Fallback for unknown roles */}
          {!["cetatean", "functionar", "primar", "admin", "super_admin"].includes(profile.rol) && (
            <div className="space-y-4 py-12 text-center">
              <div className="text-6xl">❓</div>
              <h2 className="text-2xl font-bold">Rol Necunoscut</h2>
              <p className="text-muted-foreground">
                Rolul tău ({profile.rol}) nu este recunoscut de sistem. Te rugăm să contactezi
                administratorul.
              </p>
              <Button onClick={() => router.push("/")} variant="default">
                Înapoi Acasă
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
