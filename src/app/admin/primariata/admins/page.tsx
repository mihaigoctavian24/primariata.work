import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

/**
 * Admins Management (super_admin only)
 *
 * Platform-wide administrators management:
 * - View all admins and super_admins
 * - Create new platform admins
 * - Manage admin permissions
 * - View admin activity
 */
export default async function AdminsManagementPage() {
  // Authentication check
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: userData } = await authClient
    .from("utilizatori")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!userData || userData.rol !== "super_admin") {
    await authClient.auth.signOut();
    redirect("/admin/login");
  }

  // Fetch all admins (admin + super_admin roles)
  const supabase = createServiceRoleClient();
  const { data: admins } = await supabase
    .from("utilizatori")
    .select(
      `
      *,
      primarii:primarie_id (
        localitati:localitate_id (
          nume,
          judete:judet_id (
            nume
          )
        )
      )
    `
    )
    .in("rol", ["admin", "super_admin"])
    .order("created_at", { ascending: false });

  const superAdminsCount = admins?.filter((a) => a.rol === "super_admin").length ?? 0;
  const primariieAdminsCount = admins?.filter((a) => a.rol === "admin").length ?? 0;

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin/primariata"
              className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la Dashboard Global
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-10 w-10" />
              <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                Administrare Administratori
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Gestionare toți administratorii platformei
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Administratori</CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins?.length ?? 0}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{superAdminsCount}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Primărie Admins</CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{primariieAdminsCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admins List */}
        <Card className="border-border bg-card border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Listă Administratori</CardTitle>
                <CardDescription>Toți administratorii platformei</CardDescription>
              </div>
              <Button disabled>
                <Shield className="mr-2 h-4 w-4" />
                Adaugă Admin (în curând)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!admins || admins.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                <Shield className="mb-4 h-12 w-12 opacity-20" />
                <p>Nu există administratori înregistrați</p>
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold">
                        {admin.prenume?.charAt(0)}
                        {admin.nume?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {admin.prenume} {admin.nume}
                        </h3>
                        <div className="text-muted-foreground flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </span>
                          {admin.primarii?.localitati && (
                            <span>
                              • {admin.primarii.localitati.nume},{" "}
                              {admin.primarii.localitati.judete?.nume}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          Înregistrat: {format(new Date(admin.created_at), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="default"
                        className={
                          admin.rol === "super_admin"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }
                      >
                        {admin.rol === "super_admin" ? "Super Admin" : "Primărie Admin"}
                      </Badge>
                      {admin.activ && (
                        <Badge variant="outline" className="border-green-600 text-green-700">
                          Activ
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
