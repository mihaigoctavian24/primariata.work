import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Users, Settings, BarChart3, Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { LogoutButton } from "@/components/admin/LogoutButton";

/**
 * Global Admin Dashboard (super_admin only)
 *
 * Protected route - requires authentication and super_admin role
 * Platform-wide management: all primării, all admins, system settings
 *
 * Location: /app/admin/primariata/ (per ARCHITECTURE.md)
 * Scope: ALL primării (bypasses RLS with service role)
 */
export default async function GlobalAdminPage() {
  // Check authentication first with regular client
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check user role from utilizatori table
  const { data: userData, error: userError } = await authClient
    .from("utilizatori")
    .select("rol, nume, prenume, email")
    .eq("id", user.id)
    .single();

  // Debug logging
  console.log("🔍 Global Admin Auth Debug:", {
    userId: user.id,
    userEmail: user.email,
    userData,
    userError,
    hasUserData: !!userData,
    userRole: userData?.rol,
    isSuperAdmin: userData?.rol === "super_admin",
  });

  // CRITICAL: Only super_admin can access global admin dashboard
  if (!userData || userData.rol !== "super_admin") {
    console.error("❌ Access denied - not super_admin", { userData, userError });
    await authClient.auth.signOut();
    redirect("/admin/login");
  }

  const userDisplayName =
    userData.nume && userData.prenume
      ? `${userData.prenume} ${userData.nume}`
      : userData.email || user.email || "Super Admin";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  // Use service role client for platform-wide operations (bypasses RLS)
  const supabase = createServiceRoleClient();

  // Fetch platform-wide metrics
  const { count: totalPrimarii } = await supabase
    .from("primarii")
    .select("*", { count: "exact", head: true });

  const { count: totalAdmins } = await supabase
    .from("utilizatori")
    .select("*", { count: "exact", head: true })
    .in("rol", ["admin", "super_admin"]);

  const { count: totalFunctionari } = await supabase
    .from("utilizatori")
    .select("*", { count: "exact", head: true })
    .eq("rol", "functionar");

  const { count: totalCeteni } = await supabase
    .from("utilizatori")
    .select("*", { count: "exact", head: true })
    .eq("rol", "cetatean");

  const primariCount = totalPrimarii ?? 0;
  const adminsCount = totalAdmins ?? 0;
  const functionariCount = totalFunctionari ?? 0;
  const ceteniCount = totalCeteni ?? 0;

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-10 w-10" />
              <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                Dashboard Global Admin
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Administrare platformă primariaTa - viziune completă asupra tuturor primăriilor
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <LogoutButton />
              <div className="flex items-start gap-3 border-l pl-4">
                <div className="flex flex-col items-end gap-1">
                  <div className="text-right text-sm font-medium">{userDisplayName}</div>
                  <div className="text-muted-foreground text-right text-xs">
                    {userData.email || user.email}
                  </div>
                  <Badge variant="default" className="mt-0.5 bg-purple-600 hover:bg-purple-700">
                    Super Admin
                  </Badge>
                </div>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={userDisplayName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Primării</CardTitle>
              <Building2 className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{primariCount}</div>
              <p className="text-muted-foreground text-xs">Primării active în platformă</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administratori</CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminsCount}</div>
              <p className="text-muted-foreground text-xs">Admin + Super Admin</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcționari</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{functionariCount}</div>
              <p className="text-muted-foreground text-xs">Funcționari primărie activi</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cetățeni</CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ceteniCount}</div>
              <p className="text-muted-foreground text-xs">Utilizatori cetățeni înregistrați</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Manage Primării */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Administrare Primării</CardTitle>
                  <CardDescription>Gestionare toate primăriile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/primariata/primarii">
                <Button className="w-full gap-2">
                  <Building2 className="h-4 w-4" />
                  Vezi Toate Primăriile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manage Admins */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Administrare Admins</CardTitle>
                  <CardDescription>Gestionare administratori platformă</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/primariata/admins">
                <Button className="w-full gap-2">
                  <Shield className="h-4 w-4" />
                  Vezi Toți Administratorii
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Setări Platformă</CardTitle>
                  <CardDescription>Configurare generală sistem</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/primariata/settings">
                <Button className="w-full gap-2" variant="outline">
                  <Settings className="h-4 w-4" />
                  Configurare Sistem
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Survey Analytics Link */}
        <Card className="border-border bg-card border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Dashboard Chestionare</h3>
                  <p className="text-muted-foreground text-sm">
                    Analiză răspunsuri chestionar digitalizare
                  </p>
                </div>
              </div>
              <Link href="/admin/survey">
                <Button size="lg" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Vezi Survey Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
