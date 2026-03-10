import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "./_components/super-admin-shell";

export const metadata = {
  title: "Super Admin | primariaTa",
};

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check if the user is a super_admin
  const { data: userData } = await supabase
    .from("utilizatori")
    .select("rol, nume, prenume")
    .eq("id", user?.id || "")
    .single();

  if (!userData || userData.rol !== "super_admin") {
    // Defense in depth: reject non-super_admin users attempting to reach /admin/primariata
    redirect("/auth/login");
  }

  const userName =
    userData?.nume && userData?.prenume
      ? `${userData.prenume} ${userData.nume}`
      : user?.email?.split("@")[0] || "Super Admin";

  // Get initials (up to 2 characters) for the avatar badge
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <SuperAdminShell userInitials={initials} userName={userName}>
      {children}
    </SuperAdminShell>
  );
}
