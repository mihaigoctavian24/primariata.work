"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Minus,
} from "lucide-react";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface Cohort {
  id: string;
  name: string;
  description: string;
  size: number;
  percentage: number;
}

interface CohortMetrics {
  cohortId: string;
  cohortName: string;
  topFeatures: { feature: string; count: number; percentage: number }[];
  averageSentiment: number;
  sentimentLabel: "positive" | "negative" | "neutral" | "mixed";
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  painPoints: { issue: string; mentions: number; severity: "high" | "medium" | "low" }[];
  digitalReadinessScore: number;
  frequencyDistribution: { frequency: string; count: number; percentage: number }[];
}

interface CohortComparison {
  cohort1: CohortMetrics;
  cohort2: CohortMetrics;
  featureDifferences: {
    feature: string;
    cohort1Percentage: number;
    cohort2Percentage: number;
    difference: number;
    significant: boolean;
  }[];
  sentimentDifference: number;
  readinessDifference: number;
  insights: string[];
  recommendations: string[];
}

interface CohortComparisonProps {
  cohorts: Cohort[];
  metrics: CohortMetrics[];
  comparisons: CohortComparison[];
  summary?: {
    totalCohorts: number;
    largestCohort: string;
    smallestCohort: string;
    mostEngaged: string;
    keyFindings: string[];
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CohortComparison({
  cohorts = [],
  metrics = [],
  comparisons = [],
  summary,
}: CohortComparisonProps) {
  const [selectedComparison, setSelectedComparison] = useState<CohortComparison | null>(
    comparisons[0] || null
  );

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const config = {
      high: { label: "Înalt", variant: "destructive" as const, icon: AlertTriangle },
      medium: { label: "Mediu", variant: "secondary" as const, icon: Minus },
      low: { label: "Scăzut", variant: "outline" as const, icon: CheckCircle2 },
    };
    return config[severity as keyof typeof config] || config.medium;
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return "text-green-600 dark:text-green-400";
    if (sentiment < -0.3) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Summary Overview */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Rezumat Analiză Cohorte
            </CardTitle>
            <CardDescription>Segmentare și statistici generale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs">Total Cohorte</p>
                <p className="text-2xl font-bold">{summary.totalCohorts}</p>
              </div>
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs">Cea Mai Mare</p>
                <p className="truncate text-sm font-semibold">{summary.largestCohort}</p>
              </div>
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs">Cea Mai Mică</p>
                <p className="truncate text-sm font-semibold">{summary.smallestCohort}</p>
              </div>
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs">Cei Mai Angajați</p>
                <p className="truncate text-sm font-semibold">{summary.mostEngaged}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Constatări Cheie</h4>
              <ul className="space-y-1">
                {summary.keyFindings.map((finding, index) => (
                  <li key={index} className="text-muted-foreground flex items-start gap-2 text-sm">
                    <div className="bg-primary/10 mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cohort Overview */}
      <Card>
        <CardHeader>
          <CardTitle>👥 Cohorte Identificate</CardTitle>
          <CardDescription>Segmente demografice și utilizare</CardDescription>
        </CardHeader>
        <CardContent>
          {cohorts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cohorts.map((cohort) => {
                const cohortMetrics = metrics.find((m) => m.cohortId === cohort.id);

                return (
                  <div key={cohort.id} className="border-border rounded-lg border p-4">
                    <div className="mb-3">
                      <h4 className="mb-1 font-semibold">{cohort.name}</h4>
                      <p className="text-muted-foreground text-xs">{cohort.description}</p>
                    </div>

                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dimensiune</span>
                      <span className="font-medium">
                        {cohort.size} ({cohort.percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <Progress value={cohort.percentage} className="mb-3 h-2" />

                    {cohortMetrics && (
                      <>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Pregătire Digitală</span>
                          <span className="font-medium">
                            {cohortMetrics.digitalReadinessScore.toFixed(1)}/5
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sentiment</span>
                          <span
                            className={`font-medium ${getSentimentColor(cohortMetrics.averageSentiment)}`}
                          >
                            {cohortMetrics.sentimentLabel === "positive"
                              ? "Pozitiv"
                              : cohortMetrics.sentimentLabel === "negative"
                                ? "Negativ"
                                : cohortMetrics.sentimentLabel === "mixed"
                                  ? "Mixt"
                                  : "Neutru"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <div className="mb-2 text-lg">👥</div>
              Nu există cohorte definite. Executați analiza pentru a segmenta răspunsurile.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Selector */}
      {comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Comparații între Cohorte</CardTitle>
            <CardDescription>Selectați o comparație pentru a vedea detalii</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparisons.map((comparison, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedComparison(comparison)}
                  className={`hover:bg-accent w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedComparison === comparison ? "border-primary bg-accent" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comparison.cohort1.cohortName}</Badge>
                      <ArrowRight className="h-4 w-4" />
                      <Badge variant="outline">{comparison.cohort2.cohortName}</Badge>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {comparison.insights.length} insight-uri
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison */}
      {selectedComparison && (
        <>
          {/* Feature Differences */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Diferențe în Preferințe</CardTitle>
              <CardDescription>
                {selectedComparison.cohort1.cohortName} vs {selectedComparison.cohort2.cohortName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedComparison.featureDifferences.slice(0, 8).map((diff, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{diff.feature}</span>
                      {diff.significant && (
                        <Badge variant="default" className="text-xs">
                          Semnificativ
                        </Badge>
                      )}
                    </div>

                    {/* Side-by-side bars */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {selectedComparison.cohort1.cohortName}
                          </span>
                          <span className="font-medium">{diff.cohort1Percentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={diff.cohort1Percentage}
                          className="h-2 bg-blue-200 dark:bg-blue-900/50"
                        >
                          <div className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500" />
                        </Progress>
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {selectedComparison.cohort2.cohortName}
                          </span>
                          <span className="font-medium">{diff.cohort2Percentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={diff.cohort2Percentage}
                          className="h-2 bg-green-200 dark:bg-green-900/50"
                        >
                          <div className="h-full rounded-full bg-green-600 transition-all dark:bg-green-500" />
                        </Progress>
                      </div>
                    </div>

                    {/* Difference indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs">
                      {diff.difference > 0 ? (
                        <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      ) : diff.difference < 0 ? (
                        <TrendingDown className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      <span className="text-muted-foreground">
                        Diferență: {Math.abs(diff.difference).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment & Readiness Comparison */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💭 Comparație Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm">{selectedComparison.cohort1.cohortName}</span>
                      <span
                        className={`font-semibold ${getSentimentColor(selectedComparison.cohort1.averageSentiment)}`}
                      >
                        {selectedComparison.cohort1.averageSentiment.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Pozitiv</div>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {selectedComparison.cohort1.sentimentDistribution.positive}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Neutru</div>
                        <div className="font-medium">
                          {selectedComparison.cohort1.sentimentDistribution.neutral}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Negativ</div>
                        <div className="font-medium text-red-600 dark:text-red-400">
                          {selectedComparison.cohort1.sentimentDistribution.negative}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm">{selectedComparison.cohort2.cohortName}</span>
                      <span
                        className={`font-semibold ${getSentimentColor(selectedComparison.cohort2.averageSentiment)}`}
                      >
                        {selectedComparison.cohort2.averageSentiment.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Pozitiv</div>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {selectedComparison.cohort2.sentimentDistribution.positive}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Neutru</div>
                        <div className="font-medium">
                          {selectedComparison.cohort2.sentimentDistribution.neutral}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Negativ</div>
                        <div className="font-medium text-red-600 dark:text-red-400">
                          {selectedComparison.cohort2.sentimentDistribution.negative}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-border border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Diferență</span>
                      <span
                        className={`font-semibold ${getSentimentColor(selectedComparison.sentimentDifference)}`}
                      >
                        {selectedComparison.sentimentDifference > 0 ? "+" : ""}
                        {selectedComparison.sentimentDifference.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">📱 Comparație Pregătire Digitală</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm">{selectedComparison.cohort1.cohortName}</span>
                      <span className="font-semibold">
                        {selectedComparison.cohort1.digitalReadinessScore.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress
                      value={(selectedComparison.cohort1.digitalReadinessScore / 5) * 100}
                      className="h-3"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm">{selectedComparison.cohort2.cohortName}</span>
                      <span className="font-semibold">
                        {selectedComparison.cohort2.digitalReadinessScore.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress
                      value={(selectedComparison.cohort2.digitalReadinessScore / 5) * 100}
                      className="h-3"
                    />
                  </div>

                  <div className="border-border border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Diferență</span>
                      <span
                        className={`font-semibold ${
                          selectedComparison.readinessDifference > 0
                            ? "text-green-600 dark:text-green-400"
                            : selectedComparison.readinessDifference < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                        }`}
                      >
                        {selectedComparison.readinessDifference > 0 ? "+" : ""}
                        {selectedComparison.readinessDifference.toFixed(1)} puncte
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pain Points Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>⚠️ Comparație Probleme Raportate</CardTitle>
              <CardDescription>Cele mai frecvente probleme pe fiecare cohortă</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-sm font-semibold">
                    {selectedComparison.cohort1.cohortName}
                  </h4>
                  <div className="space-y-2">
                    {selectedComparison.cohort1.painPoints.map((pain, index) => {
                      const severityBadge = getSeverityBadge(pain.severity);
                      const SeverityIcon = severityBadge.icon;

                      return (
                        <div
                          key={index}
                          className="border-border flex items-center gap-3 rounded border p-2"
                        >
                          <SeverityIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm">{pain.issue}</p>
                            <p className="text-muted-foreground text-xs">
                              {pain.mentions} mențiuni
                            </p>
                          </div>
                          <Badge variant={severityBadge.variant} className="text-xs">
                            {severityBadge.label}
                          </Badge>
                        </div>
                      );
                    })}
                    {selectedComparison.cohort1.painPoints.length === 0 && (
                      <p className="text-muted-foreground text-sm">Nicio problemă raportată</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold">
                    {selectedComparison.cohort2.cohortName}
                  </h4>
                  <div className="space-y-2">
                    {selectedComparison.cohort2.painPoints.map((pain, index) => {
                      const severityBadge = getSeverityBadge(pain.severity);
                      const SeverityIcon = severityBadge.icon;

                      return (
                        <div
                          key={index}
                          className="border-border flex items-center gap-3 rounded border p-2"
                        >
                          <SeverityIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm">{pain.issue}</p>
                            <p className="text-muted-foreground text-xs">
                              {pain.mentions} mențiuni
                            </p>
                          </div>
                          <Badge variant={severityBadge.variant} className="text-xs">
                            {severityBadge.label}
                          </Badge>
                        </div>
                      );
                    })}
                    {selectedComparison.cohort2.painPoints.length === 0 && (
                      <p className="text-muted-foreground text-sm">Nicio problemă raportată</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights & Recommendations */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 Insight-uri</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedComparison.insights.map((insight, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-start gap-2 text-sm"
                    >
                      <div className="bg-primary/10 mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">🎯 Recomandări</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedComparison.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="border-border flex items-start gap-2 rounded border p-2"
                    >
                      <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
