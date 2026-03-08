import { Suspense } from "react";
import { Settings } from "lucide-react";
import { getSettingsPageData } from "@/actions/admin-settings";
import { AdminSettingsTabs } from "@/components/admin/settings/admin-settings-tabs";

/**
 * Admin Settings Page (Server Component)
 * Route: /app/[judet]/[localitate]/admin/settings
 *
 * Fetches all settings data server-side and passes to client tab layout.
 */
export default async function AdminSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent(): Promise<React.JSX.Element> {
  const result = await getSettingsPageData();

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-semibold">Eroare la incarcarea setarilor</p>
          <p className="mt-1 text-sm">{result.error ?? "A aparut o eroare neasteptata"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="text-muted-foreground h-6 w-6" />
          Setari
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestionează profilul, notificările și preferințele
        </p>
      </div>
      <AdminSettingsTabs data={result.data} />
    </div>
  );
}

function SettingsSkeleton(): React.JSX.Element {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
        <div className="bg-muted mt-2 h-4 w-64 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="lg:col-span-9">
          <div className="border-border/40 rounded-xl border p-6">
            <div className="space-y-4">
              <div className="bg-muted h-6 w-48 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded" />
              <div className="bg-muted h-24 w-full animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
