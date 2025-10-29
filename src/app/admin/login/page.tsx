"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

/**
 * Admin Login Page
 *
 * Dedicated login page for Survey Admin Platform
 * Uses Google OAuth with direct redirect to /admin/survey
 *
 * Handles:
 * - Logged in admin → redirect to /admin/survey
 * - Logged in non-admin → logout + show error
 * - Not logged in → show Google OAuth button
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // User is logged in, check if admin
          const { data: userData } = await supabase
            .from("utilizatori")
            .select("rol")
            .eq("id", user.id)
            .single();

          if (userData && ["admin", "super_admin"].includes(userData.rol)) {
            // User is admin, redirect to dashboard
            router.push("/admin/survey");
            return;
          } else {
            // User is logged in but not admin - logout and show error
            await supabase.auth.signOut();
            setError("Acces restricționat: Contul tău nu are permisiuni de administrator.");
          }
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkAuthStatus();
  }, [supabase, router]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm">Verificare autentificare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto mb-4">
            <Image src="/logo.svg" alt="Logo" width={80} height={80} className="mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Survey Platform</CardTitle>
          <CardDescription>
            Autentifică-te pentru a accesa dashboard-ul de administrare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">
              {error}
            </div>
          )}

          <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Se încarcă...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Autentificare cu Google
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Doar administratorii și super-administratorii pot accesa această platformă
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
