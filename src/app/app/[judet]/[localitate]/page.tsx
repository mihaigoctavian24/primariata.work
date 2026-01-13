"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft } from "lucide-react";
import { clearLocation } from "@/lib/location-storage";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useCereriList } from "@/hooks/use-cereri-list";
import {
  useCereriTimeline,
  usePlatiMonthly,
  useServiceBreakdown,
} from "@/hooks/use-dashboard-charts";
import { useNextSteps, useDashboardNotifications } from "@/hooks/use-dashboard-recommendations";
import { useDashboardDocuments } from "@/hooks/use-dashboard-documents";
import { StatisticsCards } from "@/components/dashboard/StatisticsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";

// Phase 1: Charts
import { PlatiOverviewChart, ServiceBreakdownChart } from "@/components/dashboard";

// Phase 2: Smart Features
import {
  SmartNotificationsBanner,
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
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";

// Dynamic import for DocumentQuickPreview to avoid SSR issues with react-pdf
const DocumentQuickPreview = dynamic(
  () =>
    import("@/components/dashboard/DocumentQuickPreview").then((mod) => ({
      default: mod.DocumentQuickPreview,
    })),
  { ssr: false }
);

interface DashboardPageProps {
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

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

export default function DashboardPage({ params }: DashboardPageProps) {
  const { judet, localitate } = use(params);
  const router = useRouter();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [showAllCereri, setShowAllCereri] = useState(false);

  // Fetch dashboard statistics
  const { stats, isLoading: statsLoading } = useDashboardStats();

  // Fetch recent cereri (last 5)
  const { isLoading: cereriLoading } = useCereriList({
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
  const notificationsQuery = useDashboardNotifications();
  const nextStepsQuery = useNextSteps();

  // Phase 3: Fetch documents
  const documentsQuery = useDashboardDocuments({ days: 7, limit: 6 });

  // Document preview state
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [localNextSteps, setLocalNextSteps] = useState<typeof nextSteps>([]);

  // Extract data from queries for easier access
  const notifications = notificationsQuery.data?.data || [];
  const nextSteps = nextStepsQuery.data?.data || [];
  const documents = documentsQuery.data?.data || [];
  const cereriTimeline = cereriTimelineQuery.data?.data || [];
  const serviceBreakdown = serviceBreakdownQuery.data?.data || { breakdown: [], total: 0 };
  const platiMonthly = platiMonthlyQuery.data?.data || {
    monthly: [],
    summary: { total_year: 0, total_month_current: 0, upcoming_payments: 0 },
  };

  // Loading states
  const notificationsLoading = notificationsQuery.isLoading;
  const nextStepsLoading = nextStepsQuery.isLoading;
  const documentsLoading = documentsQuery.isLoading;
  const timelineLoading = cereriTimelineQuery.isLoading;

  // Error states
  const notificationsError = notificationsQuery.error;
  const nextStepsError = nextStepsQuery.error;
  const documentsError = documentsQuery.error;
  const cereriTimelineError = cereriTimelineQuery.error;
  const platiMonthlyError = platiMonthlyQuery.error;
  const serviceBreakdownError = serviceBreakdownQuery.error;

  const handleChangeLocation = () => {
    clearLocation();
    router.push("/");
  };

  const handleNotificationDismiss = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });

      // Refetch notifications after dismiss
      notificationsQuery.refetch();
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleNotificationAction = (notificationId: string, actionUrl: string) => {
    router.push(actionUrl);
  };

  const handleSearchResultClick = (result: { url: string }) => {
    // Navigate to the result URL
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

  const isLoading =
    statsLoading ||
    cereriLoading ||
    notificationsLoading ||
    nextStepsLoading ||
    documentsLoading ||
    timelineLoading;

  return (
    <>
      {/* Page Header with Search */}
      <div
        className="px-4 py-6 sm:px-6 lg:px-8"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%)",
        }}
      >
        <div className="container mx-auto max-w-7xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Județul{" "}
                <span className="text-foreground font-semibold capitalize">
                  {judet.replace(/-/g, " ")}
                </span>
                , Localitatea{" "}
                <span className="text-foreground font-semibold capitalize">
                  {localitate.replace(/-/g, " ")}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <motion.button
                onClick={() => router.back()}
                onMouseEnter={() => setIsBackHovered(true)}
                onMouseLeave={() => setIsBackHovered(false)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <motion.div
                  animate={{ x: isBackHovered ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </motion.div>
                Înapoi
              </motion.button>

              {/* Change Location Button */}
              <Button variant="outline" size="sm" onClick={handleChangeLocation}>
                <MapPin className="mr-2 h-4 w-4" />
                Schimbă locația
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Phase 5: Weather Widget Banner */}
          <WeatherWidget
            location={`${localitate.replace(/-/g, " ")}, ${judet.replace(/-/g, " ")}`}
            apiKey={process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}
            compact={true}
            dismissible={true}
          />

          {/* Phase 2: Smart Notifications Banner */}
          {notificationsError && (
            <InlineError error={notificationsError} onRetry={() => notificationsQuery.refetch()} />
          )}
          {!notificationsError && notifications.length > 0 && !notificationsLoading && (
            <ErrorBoundary>
              <SmartNotificationsBanner
                notifications={notifications}
                onDismiss={handleNotificationDismiss}
                onAction={handleNotificationAction}
                maxDisplay={3}
              />
            </ErrorBoundary>
          )}

          {/* Main Dashboard Grid: 3-Column Layout (Layout A from Plan) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* COLUMN 1: Spline 3D + Active Request Progress Cards + Recent Documents */}
            <div className="space-y-6">
              {/* Spline 3D Map Visualization */}
              <div
                className="border-border/40 bg-card overflow-hidden rounded-lg border"
                style={{ height: "400px" }}
              >
                <iframe
                  src="https://my.spline.design/mapcopycopy-qC2bbwBGjLR6YOAqN1wwbsjj-MTk/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  title="3D Map Visualization"
                  className="h-full w-full"
                />
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
                                console.log("Contact for cerere:", cerereId);
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
                        console.log("View document:", docId);
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
                    onDismiss={(stepId) =>
                      setLocalNextSteps((prev) => prev.filter((s) => s.id !== stepId))
                    }
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
