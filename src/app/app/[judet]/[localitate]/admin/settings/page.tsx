"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPrimarieSettings } from "@/actions/dashboard-stats";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { ArrowLeft } from "lucide-react";

interface AdminSettingsPageProps {
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

/**
 * Admin Settings Page
 * Route: /app/[judet]/[localitate]/admin/settings
 *
 * Allows admin/primar to edit primarie info and notification preferences.
 */
export default function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { judet, localitate } = use(params);

  const {
    data: settingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["primarie-settings"],
    queryFn: async () => {
      const result = await getPrimarieSettings();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/app/${judet}/${localitate}`}
          className="hover:bg-accent rounded-lg p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Setari Primarie</h1>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-card border-border/40 rounded-lg border p-6">
          <div className="space-y-4">
            <div className="bg-muted h-6 w-48 animate-pulse rounded" />
            <div className="bg-muted h-10 w-full animate-pulse rounded" />
            <div className="bg-muted h-10 w-full animate-pulse rounded" />
            <div className="bg-muted h-24 w-full animate-pulse rounded" />
            <div className="bg-muted h-10 w-full animate-pulse rounded" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-medium">Eroare la incarcarea setarilor</p>
          <p className="mt-1 text-sm">{(error as Error).message}</p>
        </div>
      )}

      {/* Settings Form */}
      {settingsData && (
        <AdminSettingsForm
          primarieId={settingsData.id}
          initialData={{
            email: settingsData.email,
            telefon: settingsData.telefon,
            adresa: settingsData.adresa,
            program_lucru: settingsData.program_lucru,
            nume_oficial: settingsData.nume_oficial,
            config: settingsData.config,
          }}
        />
      )}
    </div>
  );
}
