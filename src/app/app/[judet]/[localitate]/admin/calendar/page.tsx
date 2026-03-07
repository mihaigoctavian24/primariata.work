import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarContent } from "@/components/admin/calendar/calendar-content";
import { CalendarSkeleton } from "@/components/admin/calendar/calendar-skeleton";

/**
 * Admin Calendar Page
 *
 * Server Component — no DB data fetch needed.
 * Zustand store handles event persistence via localStorage.
 * Auth check mirrors other admin pages.
 */
export default async function CalendarPage(): Promise<React.JSX.Element> {
  // === AUTH CHECK ===
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("utilizatori")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarContent />
    </Suspense>
  );
}
