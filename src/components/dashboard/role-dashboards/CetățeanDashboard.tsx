"use client";

import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useCereriList } from "@/hooks/use-cereri-list";
import {
  useCereriTimeline,
  usePlatiMonthly,
  useServiceBreakdown,
} from "@/hooks/use-dashboard-charts";
import { useNextSteps } from "@/hooks/use-dashboard-recommendations";
import { useDashboardDocuments } from "@/hooks/use-dashboard-documents";
import { StatisticsCards } from "@/components/dashboard/StatisticsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";

// Phase 1: Charts
import { PlatiOverviewChart, ServiceBreakdownChart } from "@/components/dashboard";

// Phase 2: Smart Features
import {
  SmartNotificationsBannerConnected,
  NextStepsWidget,
  ActiveRequestProgressCard,
} from "@/components/dashboard";

// Phase 3: Search & Documents
import {
  GlobalSearchBar,
  RecentDocumentsWidget,
  ErrorBoundary,
  InlineError,
} from "@/components/dashboard";

// Phase 5: Tier 2 Features
import { HelpCenterWidget } from "@/components/dashboard/HelpCenterWidget";
import { CitizenBadgeWidget } from "@/components/dashboard/CitizenBadgeWidget";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";

// Dynamic import for DocumentQuickPreview to avoid SSR issues with react-pdf
const DocumentQuickPreview = dynamic(
  () =>
    import("@/components/dashboard/DocumentQuickPreview").then((mod) => ({
      default: mod.DocumentQuickPreview,
    })),
  { ssr: false }
);

// Dynamic import for MapWidget -- Leaflet requires window (no SSR)
const MapWidget = dynamic(
  () =>
    import("@/components/dashboard/MapWidget").then((m) => ({
      default: m.MapWidget,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Se incarca harta...</p>
      </div>
    ),
  }
);

interface Document {
  id: string;
  nume: string;
  tip_document: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  cerere_id?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parse PostgreSQL POINT type returned as string "(lng,lat)" from Supabase
 */
function parseCoordonate(coordonate: unknown): { lng: number; lat: number } | null {
  if (!coordonate) return null;
  const str = String(coordonate);
  const match = str.match(/\(([^,]+),([^)]+)\)/);
  if (!match || !match[1] || !match[2]) return null;
  const lng = parseFloat(match[1]);
  const lat = parseFloat(match[2]);
  if (isNaN(lng) || isNaN(lat)) return null;
  return { lng, lat };
}

interface CetățeanDashboardProps {
  judet: string;
  localitate: string;
}

/**
 * Dashboard pentru utilizatori cu rol 'cetatean'
 *
 * Features:
 * - Personal statistics (cereri, plăți)
 * - Active request progress tracking
 * - Recent documents
 * - Financial charts
 * - Next steps recommendations
 * - Help center
 * - Calendar with deadlines
 * - Global search
 */
export function CetățeanDashboard({ judet, localitate }: CetățeanDashboardProps) {
  const router = useRouter();
  const [showAllCereri, setShowAllCereri] = useState(false);

  // Fetch dashboard statistics
  const { stats, isLoading: statsLoading } = useDashboardStats({ judet, localitate });

  // Fetch recent cereri (last 5)
  useCereriList({
    page: 1,
    limit: 5,
    sort: "created_at",
    order: "desc",
  });

  // Phase 1: Fetch chart data with React Query
  const cereriTimelineQuery = useCereriTimeline();
  const platiMonthlyQuery = usePlatiMonthly();
  const serviceBreakdownQuery = useServiceBreakdown();

  // Phase 2: Fetch smart features data
  const nextStepsQuery = useNextSteps();

  // Phase 3: Fetch documents
  const documentsQuery = useDashboardDocuments({ days: 7, limit: 6 });

  // Document preview state
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Fetch localitate coordinates for static map
  const localitateQuery = useQuery({
    queryKey: ["localitate", "coordonate", localitate],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("localitati")
        .select("id, nume, coordonate")
        .eq("slug", localitate)
        .single();

      if (error) {
        logger.error("Error fetching localitate coordinates:", error);
        return null;
      }
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours -- coordinates rarely change
  });

  const mapCoordinates = useMemo(
    () => parseCoordonate(localitateQuery.data?.coordonate),
    [localitateQuery.data?.coordonate]
  );
  const localitateNume = localitateQuery.data?.nume || localitate;

  // Extract data from queries for easier access
  const nextSteps = nextStepsQuery.data?.data || [];
  const documents = documentsQuery.data?.data || [];
  const cereriTimeline = cereriTimelineQuery.data?.data || [];
  const serviceBreakdown = serviceBreakdownQuery.data?.data || { breakdown: [], total: 0 };
  const platiMonthly = platiMonthlyQuery.data?.data || {
    monthly: [],
    summary: { total_year: 0, total_month_current: 0, upcoming_payments: 0 },
  };

  // Loading states
  const documentsLoading = documentsQuery.isLoading;
  const timelineLoading = cereriTimelineQuery.isLoading;

  // Error states
  const nextStepsError = nextStepsQuery.error;
  const documentsError = documentsQuery.error;
  const cereriTimelineError = cereriTimelineQuery.error;
  const platiMonthlyError = platiMonthlyQuery.error;
  const serviceBreakdownError = serviceBreakdownQuery.error;

  const handleSearchResultClick = (result: { url: string }) => {
    router.push(result.url);
  };

  const handleDocumentPreview = (document: Document) => {
    setPreviewDocument(document);
  };

  const handleDocumentDownload = (document: Document) => {
    const link = window.document.createElement("a");
    link.href = document.file_path;
    link.download = document.nume;
    link.click();
  };

  return (
    <>
      {/* Phase 2: Smart Notifications Banner */}
      <ErrorBoundary>
        <SmartNotificationsBannerConnected maxDisplay={3} />
      </ErrorBoundary>

      {/* Main Dashboard Grid: 3-Column Layout (Layout A from Plan) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: Map + Active Request Progress Cards + Recent Documents */}
        <div className="space-y-6">
          {/* Interactive Map -- shows correct primarie location with theme-aware tiles */}
          <div
            className="border-border/40 bg-card overflow-hidden rounded-lg border"
            style={{ height: "400px" }}
          >
            {mapCoordinates ? (
              <MapWidget
                lat={mapCoordinates.lat}
                lng={mapCoordinates.lng}
                locationName={localitateNume}
              />
            ) : localitateQuery.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground text-sm">Se incarca harta...</p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <p className="text-foreground text-lg font-semibold">{localitateNume}</p>
                <p className="text-muted-foreground text-sm">Coordonatele nu sunt disponibile</p>
              </div>
            )}
          </div>

          {/* Active Request Progress Cards */}
          <ErrorBoundary>
            {cereriTimelineError && (
              <InlineError
                error={cereriTimelineError}
                onRetry={() => cereriTimelineQuery.refetch()}
              />
            )}
            {!cereriTimelineError && cereriTimeline.length > 0 && !timelineLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Cereri Active</h2>
                  {cereriTimeline.length > 1 && (
                    <button
                      onClick={() => setShowAllCereri(!showAllCereri)}
                      className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      {showAllCereri ? (
                        <>
                          <span>Arată mai puțin</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Arată toate ({cereriTimeline.length})</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="grid gap-4">
                  {(showAllCereri ? cereriTimeline : cereriTimeline.slice(0, 1)).map(
                    (cerere, index) => (
                      <motion.div
                        key={cerere.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ActiveRequestProgressCard
                          cerere={{
                            id: cerere.id,
                            numar_cerere: cerere.numar_cerere,
                            tip_cerere: cerere.tip_cerere,
                            status: cerere.status,
                            progress: cerere.progress,
                            created_at: cerere.created_at,
                            updated_at: cerere.updated_at,
                          }}
                          onViewDetails={(cerereId) =>
                            router.push(`/app/${judet}/${localitate}/cereri/${cerereId}`)
                          }
                          onContact={(cerereId) => {
                            logger.debug("Contact for cerere:", cerereId);
                          }}
                        />
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* Recent Documents Widget - Moves smoothly when cereri expand/collapse */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              layout: { type: "spring", stiffness: 120, damping: 20, mass: 1 },
              opacity: { duration: 0.4, ease: "easeOut" },
              y: { duration: 0.4, ease: "easeOut" },
            }}
          >
            <ErrorBoundary>
              {documentsError ? (
                <InlineError error={documentsError} onRetry={() => documentsQuery.refetch()} />
              ) : (
                <RecentDocumentsWidget
                  documents={documents}
                  maxDisplay={6}
                  onDocumentClick={(docId) => {
                    logger.debug("View document:", docId);
                  }}
                  onPreview={handleDocumentPreview}
                  onDownload={handleDocumentDownload}
                  isLoading={documentsLoading}
                />
              )}
            </ErrorBoundary>
          </motion.div>

          {/* Phase 5: Citizen Badge Widget */}
          <CitizenBadgeWidget
            stats={{
              totalPoints: (stats?.cereri.finalizate || 0) * 10 + (stats?.plati.total || 0) * 5,
              cereriCount: stats?.cereri.total || 0,
              cereriFinalized: stats?.cereri.finalizate || 0,
              platiOnTime: stats?.plati.total || 0,
              consecutiveMonthsOnTime: 0,
              documentsOnTime: documents.length,
              totalDocuments: documents.length,
              averageRating: 4.5,
            }}
            compact={true}
          />
        </div>

        {/* COLUMN 2: Financial Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Statistici Financiare</h2>

          {/* Service Breakdown Chart */}
          <ErrorBoundary>
            {serviceBreakdownError ? (
              <div className="border-border/40 bg-card rounded-lg border p-6">
                <InlineError
                  error={serviceBreakdownError}
                  onRetry={() => serviceBreakdownQuery.refetch()}
                />
              </div>
            ) : (
              <ServiceBreakdownChart
                data={serviceBreakdown}
                isLoading={serviceBreakdownQuery.isLoading}
              />
            )}
          </ErrorBoundary>

          {/* Plati Overview Chart */}
          <ErrorBoundary>
            {platiMonthlyError ? (
              <div className="border-border/40 bg-card rounded-lg border p-6">
                <InlineError
                  error={platiMonthlyError}
                  onRetry={() => platiMonthlyQuery.refetch()}
                />
              </div>
            ) : (
              <PlatiOverviewChart
                data={platiMonthly}
                isLoading={platiMonthlyQuery.isLoading}
                months={6}
              />
            )}
          </ErrorBoundary>
        </div>

        {/* COLUMN 3: Search + Statistics + Quick Actions + Next Steps */}
        <div className="space-y-6">
          {/* Global Search Bar */}
          <GlobalSearchBar
            onResultClick={handleSearchResultClick}
            placeholder="Caută cereri, plăți sau documente..."
            maxResults={8}
          />

          {/* Statistics Cards */}
          <StatisticsCards stats={stats} isLoading={statsLoading} />

          {/* Quick Actions */}
          <QuickActions judet={judet} localitate={localitate} />

          {/* Next Steps Widget */}
          <ErrorBoundary>
            {nextStepsError ? (
              <InlineError error={nextStepsError} onRetry={() => nextStepsQuery.refetch()} />
            ) : (
              <NextStepsWidget
                steps={nextSteps}
                maxDisplay={5}
                onStepClick={(step) => router.push(step.action_url)}
                onDismiss={(stepId) => logger.debug("Dismissed step:", stepId)}
              />
            )}
          </ErrorBoundary>

          {/* Phase 5: Help Center Widget */}
          <HelpCenterWidget
            activeCereriCount={stats?.cereri.in_progres || 0}
            pendingPlatiCount={0} // TODO: Add pending plati count when available
            isNewUser={stats?.cereri.total === 0}
            maxFAQs={5}
          />

          {/* Phase 5: Dashboard Calendar */}
          <DashboardCalendar
            events={[
              // Mock calendar events - replace with actual events when cerere detail API is ready
              ...(stats?.cereri.in_progres
                ? Array.from({ length: Math.min(stats.cereri.in_progres, 3) }, (_, i) => ({
                    id: `cerere-${i + 1}`,
                    title: `Cerere în procesare ${i + 1}`,
                    date: new Date(new Date().getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
                    type: "deadline" as const,
                    description: "Deadline pentru procesare",
                    priority: (i === 0 ? "high" : i === 1 ? "medium" : "low") as
                      | "high"
                      | "medium"
                      | "low",
                    relatedId: `cerere-${i + 1}`,
                  }))
                : []),
            ]}
            onEventClick={(event) => {
              router.push(`/app/${judet}/${localitate}/cereri/${event.relatedId}`);
            }}
            daysToShow={30}
          />
        </div>
      </div>

      {/* Phase 3: Document Quick Preview Modal */}
      {previewDocument && (
        <DocumentQuickPreview
          documentUrl={previewDocument.file_path}
          documentName={previewDocument.nume}
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDownload={() => handleDocumentDownload(previewDocument)}
        />
      )}
    </>
  );
}
