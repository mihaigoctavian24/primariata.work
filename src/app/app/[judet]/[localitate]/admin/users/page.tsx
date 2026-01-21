import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import { StaffTable } from "@/components/admin/StaffTable";
import { InviteStaffDialog } from "@/components/admin/InviteStaffDialog";

/**
 * Staff Management Dashboard - Primărie Admin (admin role)
 *
 * Protected route - requires authentication and admin/super_admin role
 * Displays staff users, invitations, and management functionality
 *
 * Location: /app/[judet]/[localitate]/admin/users/ (per ARCHITECTURE.md)
 * Scope: SINGLE primărie (RLS isolates data by primarie_id)
 */
export default async function PrimarieStaffPage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}) {
  // Await params (Next.js 15 requirement)
  await params;

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
    .select("rol, nume, prenume, email, primarie_id")
    .eq("id", user.id)
    .single();

  // Debug logging
  console.log("🔍 Primărie Staff Admin Auth Debug:", {
    userId: user.id,
    userEmail: user.email,
    userData,
    userError,
    hasUserData: !!userData,
    userRole: userData?.rol,
    isAdmin: userData ? ["admin", "super_admin"].includes(userData.rol) : false,
  });

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    // User is authenticated but not admin - redirect to admin login with logout
    console.error("❌ Access denied - not admin", { userData, userError });

    // Sign out the user before redirecting
    await authClient.auth.signOut();

    // Redirect to main login page - access denied
    redirect("/auth/login");
  }

  // Check primarie_id exists
  if (!userData.primarie_id) {
    redirect("/location");
  }

  // Use service role client for admin operations (bypasses RLS)
  const supabase = createServiceRoleClient();

  // Fetch overview metrics
  const { count: totalStaff } = await supabase
    .from("utilizatori")
    .select("*", { count: "exact", head: true })
    .in("rol", ["functionar", "admin"])
    .eq("primarie_id", userData.primarie_id);

  const { count: pendingInvitations } = await supabase
    .from("user_invitations")
    .select("*", { count: "exact", head: true })
    .eq("primarie_id", userData.primarie_id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  const totalStaffCount = totalStaff ?? 0;
  const pendingInvitationsCount = pendingInvitations ?? 0;

  // Fetch initial staff data for table
  const { data: rawStaff } = await supabase
    .from("utilizatori")
    .select("id, email, nume, prenume, rol, departament, created_at, updated_at")
    .in("rol", ["functionar", "admin"])
    .eq("primarie_id", userData.primarie_id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Map to ensure created_at is non-null (fallback to current timestamp)
  const initialStaff =
    rawStaff?.map((user) => ({
      ...user,
      created_at: user.created_at || new Date().toISOString(),
    })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionare Echipă</h1>
        <p className="text-muted-foreground mt-2">Administrează membrii echipei și invitațiile</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Invite Staff Card */}
        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Invită Membru</h3>
                <p className="text-muted-foreground text-sm">Trimite invitație prin email</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <InviteStaffDialog
              primarieId={userData.primarie_id}
              trigger={
                <Button size="lg" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Invită Membru Nou
                </Button>
              }
            />
          </div>
        </div>

        {/* Total Staff Card */}
        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Total Echipă</h3>
                <p className="text-muted-foreground text-sm">Membri activi</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{totalStaffCount}</p>
          </div>
        </div>

        {/* Pending Invitations Card */}
        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Invitații Pending</h3>
                <p className="text-muted-foreground text-sm">În așteptare</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{pendingInvitationsCount}</p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <StaffTable initialStaff={initialStaff} currentUserRole={userData.rol} />
    </div>
  );
}
