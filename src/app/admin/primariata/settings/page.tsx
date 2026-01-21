import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ArrowLeft, Database, Shield, Mail, Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Platform Settings (super_admin only)
 *
 * Global platform configuration:
 * - Database settings
 * - Security policies
 * - Email configuration
 * - Notification settings
 * - System maintenance
 */
export default async function PlatformSettingsPage() {
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

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/admin/primariata"
            className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Dashboard Global
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="text-primary h-10 w-10" />
            <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Setări Platformă
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Configurare globală sistem primariaTa</p>
        </div>

        {/* Settings Categories */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Database Configuration */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Configurare Bază de Date</CardTitle>
                  <CardDescription>Gestionare conexiuni, backup, migrări</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Database className="mr-2 h-4 w-4" />
                Configurare Database (în curând)
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Setări Securitate</CardTitle>
                  <CardDescription>RLS policies, autentificare, permisiuni</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Shield className="mr-2 h-4 w-4" />
                Configurare Securitate (în curând)
              </Button>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Configurare Email</CardTitle>
                  <CardDescription>SendGrid, template-uri, notificări</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Mail className="mr-2 h-4 w-4" />
                Configurare Email (în curând)
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Setări Notificări</CardTitle>
                  <CardDescription>Email, SMS, push notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Bell className="mr-2 h-4 w-4" />
                Configurare Notificări (în curând)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="border-border bg-card border shadow-sm">
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
            <CardDescription>Informații despre starea curentă a platformei</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Versiune Platformă</span>
                <span className="text-muted-foreground text-sm">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status Database</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status API</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  Operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
