import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Dashboard Page (Protected Route)
 *
 * This page is protected by middleware.ts
 * Only authenticated users can access it.
 *
 * If not authenticated, middleware will redirect to /login
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative container mx-auto max-w-4xl p-8">
      {/* Theme Toggle - fixed in top right */}
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Protected route - Middleware working!</p>
          </div>
          <Badge variant="default">Protected ✓</Badge>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Welcome!</h2>
          <p className="text-muted-foreground text-sm">
            You&apos;re viewing a protected route. This page is only accessible to authenticated
            users.
          </p>
          {user && (
            <div className="mt-4">
              <p className="text-sm">
                Logged in as: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
