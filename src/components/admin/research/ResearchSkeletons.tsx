import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for Executive Summary section
 */
export function ExecutiveSummarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Research Validity */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Key Findings */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Sentiment Gauge */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-8 w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for AI Insights Panel
 */
export function AIInsightsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="mb-3 h-12 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Theme Cloud */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-8" style={{ width: `${Math.random() * 80 + 60}px` }} />
          ))}
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="mb-2 h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Demographics section
 */
export function DemographicsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Respondent Type Split */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* County Distribution */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Top Localities */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Questions section
 */
export function QuestionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Question Cards */}
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            {/* Question Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>

            {/* AI Summary */}
            <div className="mb-4 rounded bg-blue-50 p-4 dark:bg-blue-950">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Chart/Data Area */}
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              {[...Array(2)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Correlations section
 */
export function CorrelationsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Correlation Matrix/Table */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Cohorts section
 */
export function CohortsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>

      {/* Cohort Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-3 h-5 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Section */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="mb-2 h-5 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Export section
 */
export function ExportSkeleton() {
  return (
    <div className="space-y-6">
      {/* Export Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-12 w-12" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* GDPR Notice */}
      <div className="rounded-lg border border-dashed p-6">
        <Skeleton className="mb-2 h-5 w-40" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
