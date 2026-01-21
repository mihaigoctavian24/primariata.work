import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, FileText, CreditCard, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LogoutButton } from "@/components/admin/LogoutButton";

// Type definition for userData with nested relations
interface UserDataWithRelations {
  rol: string;
  nume: string;
  prenume: string;
  email: string;
  primarie_id: string;
  primarii: {
    localitati: {
      nume: string;
      id: string;
      judete: {
        nume: string;
      };
    };
  } | null;
}

/**
 * Primărie Admin Dashboard (admin role)
 *
 * Protected route - requires authentication and admin role
 * Single primărie management (RLS enforced by primarie_id)
 *
 * Location: /app/[judet]/[localitate]/admin/ (per ARCHITECTURE.md)
 * Scope: SINGLE primărie (RLS isolates data by primarie_id)
 */
export default async function PrimarieAdminPage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}) {
  const { judet, localitate } = await params;

  // Check authentication first with regular client
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check user role from utilizatori table
  const { data: userData, error: userError } = await authClient
    .from("utilizatori")
    .select("rol, nume, prenume, email, primarie_id, primarii(localitati(id, nume, judete(nume)))")
    .eq("id", user.id)
    .single();

  // Debug logging
  console.log("🔍 Primărie Admin Auth Debug:", {
    userId: user.id,
    userEmail: user.email,
    userData,
    userError,
    hasUserData: !!userData,
    userRole: userData?.rol,
    isAdmin: userData ? ["admin", "super_admin"].includes(userData.rol) : false,
  });

  // CRITICAL: Only admin and super_admin can access primărie admin dashboard
  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    console.error("❌ Access denied - not admin", { userData, userError });
    await authClient.auth.signOut();
    redirect("/auth/login");
  }

  const userDisplayName =
    userData.nume && userData.prenume
      ? `${userData.prenume} ${userData.nume}`
      : userData.email || user.email || "Admin";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  // Use service role client for admin operations (bypasses RLS for this primărie)
  const supabase = createServiceRoleClient();

  // Fetch primărie-specific metrics (filtered by primarie_id)
  const primarieId = userData.primarie_id;

  const { count: totalStaff } = await supabase
    .from("utilizatori")
    .select("*", { count: "exact", head: true })
    .in("rol", ["functionar", "admin"])
    .eq("primarie_id", primarieId);

  const { count: totalCereri } = await supabase
    .from("cereri")
    .select("*", { count: "exact", head: true })
    .eq("primarie_id", primarieId);

  const { count: totalPlati } = await supabase
    .from("plati")
    .select("*", { count: "exact", head: true })
    .eq("primarie_id", primarieId);

  const { count: totalCeteni } = await supabase
    .from("utilizatori")
    .select("*", { count: "exact", head: true })
    .eq("rol", "cetatean")
    .eq("localitate_id", (userData as UserDataWithRelations).primarii?.localitati?.id);

  const staffCount = totalStaff ?? 0;
  const cereriCount = totalCereri ?? 0;
  const platiCount = totalPlati ?? 0;
  const ceteniCount = totalCeteni ?? 0;

  // Get primărie name
  const primarieName =
    (userData as UserDataWithRelations).primarii?.localitati?.nume || localitate.replace(/-/g, " ");
  const judetName = (userData as UserDataWithRelations).primarii?.localitati?.judete?.nume || judet;

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`/app/${judet}/${localitate}`}
              className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-10 w-10" />
              <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                Dashboard Admin Primărie
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Administrare Primăria {primarieName}, Județul {judetName}
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
                  <Badge
                    variant="default"
                    className={
                      userData.rol === "super_admin"
                        ? "mt-0.5 bg-purple-600 hover:bg-purple-700"
                        : "mt-0.5 bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    {userData.rol === "super_admin" ? "Super Admin" : "Administrator"}
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

        {/* Primărie Overview Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Echipă</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffCount}</div>
              <p className="text-muted-foreground text-xs">Funcționari + Admini</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cereri</CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cereriCount}</div>
              <p className="text-muted-foreground text-xs">Total cereri primite</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plăți</CardTitle>
              <CreditCard className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platiCount}</div>
              <p className="text-muted-foreground text-xs">Total plăți procesate</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cetățeni</CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ceteniCount}</div>
              <p className="text-muted-foreground text-xs">Utilizatori înregistrați</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Manage Staff */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Echipă</CardTitle>
                  <CardDescription>Gestionare membrii echipei</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/app/${judet}/${localitate}/admin/users`}>
                <Button className="w-full gap-2">
                  <Users className="h-4 w-4" />
                  Vezi Echipa
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manage Cereri (Placeholder) */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Cereri</CardTitle>
                  <CardDescription>Administrare cereri cetățeni</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2" variant="outline" disabled>
                <FileText className="h-4 w-4" />
                Gestionare Cereri (în curând)
              </Button>
            </CardContent>
          </Card>

          {/* Manage Plăți (Placeholder) */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Plăți</CardTitle>
                  <CardDescription>Administrare plăți și taxe</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2" variant="outline" disabled>
                <CreditCard className="h-4 w-4" />
                Gestionare Plăți (în curând)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Global Admin Access (super_admin only) */}
        {userData.rol === "super_admin" && (
          <Card className="border-border bg-card border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Dashboard Global Admin</h3>
                    <p className="text-muted-foreground text-sm">
                      Acces complet platformă (toate primăriile)
                    </p>
                  </div>
                </div>
                <Link href="/admin/primariata">
                  <Button size="lg" className="gap-2" variant="default">
                    <Shield className="h-4 w-4" />
                    Global Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
