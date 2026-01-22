import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Primării Management (super_admin only)
 *
 * Platform-wide primării management:
 * - View all primării
 * - Create new primării
 * - Edit primărie details
 * - Manage primărie admins
 * - View primărie stats
 */
export default async function PrimariManagementPage() {
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

  // Fetch all primării with stats
  const supabase = createServiceRoleClient();
  const { data: primarii } = await supabase
    .from("primarii")
    .select(
      `
      *,
      localitati:localitate_id (
        nume,
        judete:judet_id (
          nume,
          cod
        )
      )
    `
    )
    .order("created_at", { ascending: false });

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
              <Building2 className="text-primary h-10 w-10" />
              <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                Administrare Primării
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Gestionare toate primăriile din platformă
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Primării</CardTitle>
              <Building2 className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{primarii?.length ?? 0}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Primării Active</CardTitle>
              <MapPin className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {primarii?.filter((p) => p.activa).length ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Primării Inactive</CardTitle>
              <MapPin className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {primarii?.filter((p) => !p.activa).length ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Primării List */}
        <Card className="border-border bg-card border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Listă Primării</CardTitle>
                <CardDescription>Toate primăriile înregistrate în platformă</CardDescription>
              </div>
              <Button disabled>
                <Building2 className="mr-2 h-4 w-4" />
                Adaugă Primărie (în curând)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!primarii || primarii.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="mb-4 h-12 w-12 opacity-20" />
                <p>Nu există primării înregistrate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {primarii.map((primarie) => (
                  <div
                    key={primarie.id}
                    className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {primarie.localitati?.nume || "Localitate Necunoscută"}
                        </h3>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          Județul {primarie.localitati?.judete?.nume || "Necunoscut"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={primarie.activa ? "default" : "secondary"}>
                        {primarie.activa ? "Activ" : "Inactiv"}
                      </Badge>
                      <Button variant="outline" size="sm" disabled>
                        <Users className="mr-2 h-4 w-4" />
                        Vezi Detalii
                      </Button>
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
