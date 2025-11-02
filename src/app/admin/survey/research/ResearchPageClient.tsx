"use client";

import { RealtimeProvider } from "./RealtimeProvider";
import { ResearchTabs } from "./ResearchTabs";
import { ErrorBoundary } from "@/components/admin/research/ErrorBoundary";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface ResearchPageClientProps {
  // Executive Summary data
  totalResponses: number;
  citizenCount: number;
  officialCount: number;
  countyCount: number;
  localityCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  overallSentiment: {
    score: number;
    label: string;
  };
  keyFindings: string[];

  // Demographics data
  ageDistribution: Array<{
    ageCategory: string;
    count: number;
    percentage: number;
  }>;
  locationData: Array<{
    county: string;
    locality: string;
    count: number;
    citizenCount: number;
    officialCount: number;
  }>;
}

/**
 * Client wrapper for Research Analysis page
 *
 * Handles real-time updates and refreshes data when new responses arrive
 */
export function ResearchPageClient(props: ResearchPageClientProps) {
  const router = useRouter();

  /**
   * Handle real-time data updates
   * For now, we simply refresh the page to get latest server-side data
   * In the future, we could implement client-side data fetching
   */
  const handleDataUpdate = useCallback(() => {
    console.log("[ResearchPageClient] Refreshing page due to new data...");
    router.refresh();
  }, [router]);

  return (
    <ErrorBoundary>
      <RealtimeProvider onDataUpdate={handleDataUpdate}>
        <ResearchTabs {...props} />
      </RealtimeProvider>
    </ErrorBoundary>
  );
}
