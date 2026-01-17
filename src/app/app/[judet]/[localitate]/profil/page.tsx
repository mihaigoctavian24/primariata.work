"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { NotificationPreferencesForm } from "@/components/profile/NotificationPreferencesForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const router = useRouter();
  const [userFullName, setUserFullName] = useState<string>("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Fetch user data for avatar
  useEffect(() => {
    async function fetchUserData() {
      try {
        const supabase = createClient();
        console.log("🔄 Profile page: Fetching user data...");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          console.log("👤 Profile page: User data:", {
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
          });
          setUserFullName(user.user_metadata?.full_name || "");
          setCurrentAvatarUrl(user.user_metadata?.avatar_url || "");
          console.log(
            "✅ Profile page: State updated with avatar_url:",
            user.user_metadata?.avatar_url
          );
        } else {
          console.log("❌ Profile page: No user found");
        }
      } catch (err) {
        console.error("💥 Profile page: Failed to fetch user data:", err);
      }
    }

    fetchUserData();
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    // Clear error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  }, []);

  const handleAvatarSuccess = useCallback((avatarUrl: string) => {
    setCurrentAvatarUrl(avatarUrl);
    setError(null);
  }, []);

  return (
    <>
      {/* Page Header - Fixed */}
      <div className="via-background/50 to-background bg-gradient-to-b from-transparent px-4 py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profilul Meu</h1>
              <p className="text-muted-foreground mt-2">
                Gestionează informațiile contului tău și preferințele de securitate
              </p>
            </div>

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
          </div>
        </div>
      </div>

      {/* Page Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Global Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Imagine de profil</CardTitle>
                <CardDescription>Încarcă o imagine pentru a personaliza contul tău</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentAvatarUrl={currentAvatarUrl}
                  userFullName={userFullName}
                  onUploadSuccess={handleAvatarSuccess}
                  onUploadError={handleError}
                />
              </CardContent>
            </Card>

            {/* Personal Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Informații personale</CardTitle>
                <CardDescription>Actualizează datele tale personale și de contact</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalInfoForm onError={handleError} />
              </CardContent>
            </Card>

            {/* Notification Preferences Section */}
            <Card>
              <CardHeader>
                <CardTitle>Preferințe notificări</CardTitle>
                <CardDescription>
                  Gestionează modul în care primești notificări despre cereri și plăți
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationPreferencesForm onError={handleError} />
              </CardContent>
            </Card>

            {/* Password Change Section */}
            <Card>
              <CardHeader>
                <CardTitle>Securitate</CardTitle>
                <CardDescription>
                  Schimbă parola pentru a-ți menține contul în siguranță
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm onError={handleError} />
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informații cont</CardTitle>
                <CardDescription>Detalii despre contul tău</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Tip cont</p>
                    <p className="text-sm">Cont personal</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Status</p>
                    <p className="text-sm">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                        Activ
                      </span>
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="text-muted-foreground text-xs">
                  <p>
                    Pentru asistență sau întrebări, contactează echipa de suport la{" "}
                    <a
                      href="mailto:support@primariata.work"
                      className="text-primary hover:underline"
                    >
                      support@primariata.work
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
