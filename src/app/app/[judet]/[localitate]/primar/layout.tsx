import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PrimarShell } from "./_components/primar-shell";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export const metadata = { title: "Panou Primar | primariaTa" };

export default async function PrimarLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ judet: string; localitate: string }>;
}): Promise<React.ReactElement> {
  const { judet, localitate } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Role check via user_primarii — must be primar at an approved primarie
  // mandat_start/mandat_sfarsit are not yet in generated types — cast via unknown
  // TODO: types:generate after migration applied for mandat columns
  const { data: association } = await (supabase
    .from("user_primarii")
    .select("rol, status, primarii(numeOficial)")
    .eq("user_id", user.id)
    .eq("status", "approved") as unknown as {
    data: {
      rol: string;
      status: string;
      primarii: { numeOficial: string } | null;
    } | null;
    error: unknown;
  });

  if (!association || association.rol !== "primar") {
    // Redirect non-primar to admin or home
    redirect(`/app/${judet}/${localitate}/admin`);
  }

  // Fetch display name from utilizatori
  const { data: utilizatorData } = await supabase
    .from("utilizatori")
    .select("nume, prenume")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = utilizatorData?.prenume ?? "";
  const lastName = utilizatorData?.nume ?? "";
  const userName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Primar";
  const userInitials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "P";

  // Primarie name from association join
  const primarieName = association.primarii?.numeOficial ?? "Primărie";

  // Badge counts for sidebar
  // cereri.escaladata — may not be in generated types yet; use try/catch fallback
  // TODO: types:generate after cereri migration with escaladata column applied
  let pendingCereriCount = 0;
  try {
    const { count } = await (supabase
      .from("cereri")
      .select("id", { count: "exact", head: true })
      .eq("escaladata", true) as unknown as Promise<{ count: number | null; error: unknown }>);
    pendingCereriCount = count ?? 0;
  } catch {
    // escaladata column not yet in DB — return 0 gracefully
    pendingCereriCount = 0;
  }

  // proiecte_municipale — may not be in generated types yet; use try/catch fallback
  // TODO: types:generate after proiecte_municipale migration applied
  let activeProiecteCount = 0;
  try {
    const { count } = await (supabase
      .from("proiecte_municipale" as "cereri")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_derulare") as unknown as Promise<{ count: number | null; error: unknown }>);
    activeProiecteCount = count ?? 0;
  } catch {
    // proiecte_municipale table not yet in DB — return 0 gracefully
    activeProiecteCount = 0;
  }

  // Sidebar collapse cookie
  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(SIDEBAR_COLLAPSED_KEY)?.value === "true";

  const basePath = `/app/${judet}/${localitate}/primar`;

  return (
    <PrimarShell
      basePath={basePath}
      primarieName={primarieName}
      userName={userName}
      userInitials={userInitials}
      mandatStart={null}
      mandatSfarsit={null}
      initialCollapsed={initialCollapsed}
      pendingCereriCount={pendingCereriCount}
      activeProiecteCount={activeProiecteCount}
    >
      {children}
    </PrimarShell>
  );
}
