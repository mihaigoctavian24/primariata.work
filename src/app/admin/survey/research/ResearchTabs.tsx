"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Users,
  Download,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Loader2,
  Network,
  GitCompare,
} from "lucide-react";
import { toast } from "sonner";
import { ExecutiveSummary } from "@/components/admin/research/ExecutiveSummary";
import { AIInsightsPanel } from "@/components/admin/research/AIInsightsPanel";
import { QuestionAnalysis } from "@/components/admin/research/QuestionAnalysis";
import { DemographicsCharts } from "@/components/admin/research/DemographicsCharts";
import { ExportPanel } from "@/components/admin/research/ExportPanel";
import { CorrelationMatrix } from "@/components/admin/research/CorrelationMatrix";
import { CohortComparison } from "@/components/admin/research/CohortComparison";
import {
  AIInsightsSkeleton,
  QuestionsSkeleton,
  CorrelationsSkeleton,
  CohortsSkeleton,
} from "@/components/admin/research/ResearchSkeletons";
import { Button } from "@/components/ui/button";
import type { CorrelationAnalysisResult } from "@/lib/ai/correlation-analyzer";
import type { CohortAnalysisResult } from "@/lib/ai/cohort-analyzer";

interface HolisticInsight {
  id: string;
  survey_type: string;
  ai_summary: string | null;
  key_themes: Array<{ theme: string; frequency: number; sentiment: string }>;
  sentiment_score: number | null;
  sentiment_label: string | null;
  recommendations: Array<{
    action: string;
    priority: string;
    timeline: string;
    effort: string;
    impact: string;
    reasoning: string;
  }>;
  feature_requests: Array<{
    feature: string;
    count: number;
    priority: string;
    aiScore: number;
    roi: number;
  }>;
  total_questions: number;
  total_responses: number;
  model_version: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  confidence_score: number | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

interface QuestionInsight {
  questionId: string;
  questionText: string;
  questionType: string;
  respondentType: string;
  totalResponses: number;
  insights: string[];
  topThemes?: Array<{ theme: string; count: number }>;
  distribution?: Record<string, number>;
  averageScore?: number;
}

interface ResearchTabsProps {
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

  // Demographics data
  locationData: Array<{
    county: string;
    locality: string;
    count: number;
    citizenCount: number;
    officialCount: number;
  }>;
}

type TabType =
  | "overview"
  | "insights"
  | "demographics"
  | "questions"
  | "correlations"
  | "cohorts"
  | "export";

export function ResearchTabs({
  totalResponses,
  citizenCount,
  officialCount,
  countyCount,
  localityCount,
  dateRange,
  locationData,
}: ResearchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [holisticInsights, setHolisticInsights] = useState<HolisticInsight[]>([]);
  const [questionInsights, setQuestionInsights] = useState<{
    citizenInsights: QuestionInsight[];
    officialInsights: QuestionInsight[];
  }>({ citizenInsights: [], officialInsights: [] });
  const [correlationData, setCorrelationData] = useState<CorrelationAnalysisResult | null>(null);
  const [cohortData, setCohortData] = useState<CohortAnalysisResult | null>(null);

  // Separate loading states for each data type
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingCorrelations, setIsLoadingCorrelations] = useState(true);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch holistic insights on mount
  useEffect(() => {
    fetchHolisticInsights();
    fetchQuestionAnalysis();
    fetchCorrelations();
    fetchCohorts();
  }, []);

  const fetchHolisticInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const response = await fetch("/api/survey/research/holistic-insights");
      if (response.ok) {
        const data = await response.json();
        setHolisticInsights(data.insights || []);
      }
    } catch (error) {
      logger.error("Error fetching holistic insights:", error);
      toast.error("Eroare la încărcarea insight-urilor", {
        description: "Nu s-au putut încărca datele de analiză AI",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const fetchQuestionAnalysis = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch("/api/survey/research/question-analysis");
      if (response.ok) {
        const data = await response.json();
        setQuestionInsights({
          citizenInsights: data.citizenInsights || [],
          officialInsights: data.officialInsights || [],
        });
        logger.debug(
          `[Question Analysis] Loaded ${data.citizenInsights?.length || 0} citizen questions, ${data.officialInsights?.length || 0} official questions`
        );
      }
    } catch (error) {
      logger.error("Error fetching question analysis:", error);
      toast.error("Eroare la încărcarea analizei întrebărilor", {
        description: "Nu s-au putut încărca datele de analiză pe întrebări",
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const fetchCorrelations = async () => {
    setIsLoadingCorrelations(true);
    try {
      const response = await fetch("/api/survey/research/correlations");
      if (response.ok) {
        const data = await response.json();
        setCorrelationData(data);
        logger.debug(`[Correlations] Loaded ${data.correlations?.length || 0} correlations`);
      }
    } catch (error) {
      logger.error("Error fetching correlations:", error);
      toast.error("Eroare la încărcarea corelațiilor", {
        description: "Nu s-au putut încărca datele de corelații statistice",
      });
    } finally {
      setIsLoadingCorrelations(false);
    }
  };

  const fetchCohorts = async () => {
    setIsLoadingCohorts(true);
    try {
      const response = await fetch("/api/survey/research/cohorts");
      if (response.ok) {
        const data = await response.json();
        setCohortData(data);
        logger.debug(`[Cohorts] Loaded ${data.cohorts?.length || 0} cohorts`);
      }
    } catch (error) {
      logger.error("Error fetching cohorts:", error);
      toast.error("Eroare la încărcarea cohortelor", {
        description: "Nu s-au putut încărca datele de analiză pe cohorte",
      });
    } finally {
      setIsLoadingCohorts(false);
    }
  };

  const generateAnalysis = async () => {
    setIsGenerating(true);
    toast.info("🤖 Generare analiză AI în curs...", {
      description: "Se procesează răspunsurile și se generează insight-uri strategice",
    });
    logger.debug("🤖 Generare Analiză Holistică AI - Procesare răspunsuri...");

    try {
      const response = await fetch("/api/survey/research/analyze", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        const totalRecs =
          data.holisticInsights?.reduce(
            (sum: number, i: HolisticInsight) => sum + (i.recommendations?.length || 0),
            0
          ) || 0;
        const totalFeatures =
          data.holisticInsights?.reduce(
            (sum: number, i: HolisticInsight) => sum + (i.feature_requests?.length || 0),
            0
          ) || 0;
        logger.debug(`✅ Analiză Holistică Completă - ${totalRecs} recomandări strategice!`);

        toast.success("✅ Analiză holistică completă!", {
          description: `${totalRecs} recomandări strategice și ${totalFeatures} funcționalități identificate`,
          duration: 5000,
        });

        await fetchHolisticInsights(); // Refresh holistic insights
      } else {
        const error = await response.json();
        logger.error("❌ Eroare:", error);
        toast.error("Eroare la generarea analizei", {
          description: error.error || "Nu s-a putut genera analiza AI",
          duration: 5000,
        });
      }
    } catch (error) {
      logger.error("❌ Eroare:", error);
      toast.error("Eroare de rețea", {
        description: "Nu s-a putut conecta la serverul de analiză AI",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "Sumar Executiv", icon: TrendingUp },
    { id: "insights" as TabType, label: "Insight-uri AI", icon: Lightbulb },
    { id: "demographics" as TabType, label: "Demografice", icon: Users },
    { id: "questions" as TabType, label: "Întrebări", icon: MessageSquare },
    { id: "correlations" as TabType, label: "Corelații", icon: Network },
    { id: "cohorts" as TabType, label: "Cohorte", icon: GitCompare },
    { id: "export" as TabType, label: "Export", icon: Download },
  ];

  // Memoize Executive Summary data - persist even when holisticInsights becomes empty temporarily
  const executiveSummaryData = useMemo(() => {
    if (holisticInsights.length === 0) {
      return { overallSentiment: undefined, keyFindings: undefined };
    }

    // Calculate average sentiment
    const avgScore =
      holisticInsights.reduce((sum, insight) => sum + (insight.sentiment_score || 0), 0) /
      holisticInsights.length;

    const sentimentLabel =
      holisticInsights.length === 1
        ? holisticInsights[0]?.sentiment_label || "neutral"
        : avgScore > 0.3
          ? "positive"
          : avgScore < -0.3
            ? "negative"
            : "neutral";

    // Extract key findings from themes
    const keyFindings = holisticInsights
      .flatMap((insight: HolisticInsight) => {
        if (!insight.key_themes || !Array.isArray(insight.key_themes)) return [];
        return insight.key_themes
          .filter((t) => t && typeof t === "object")
          .slice(0, 3)
          .map(
            (t) => `${t.theme} (${insight.survey_type === "citizen" ? "cetățeni" : "funcționari"})`
          );
      })
      .slice(0, 5);

    return {
      overallSentiment: {
        score: avgScore,
        label: sentimentLabel as "positive" | "negative" | "neutral",
      },
      keyFindings: keyFindings.length > 0 ? keyFindings : undefined,
    };
  }, [holisticInsights]);

  return (
    <>
      {/* Generate AI Analysis Button */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {holisticInsights.length > 0 ? (
            <span>
              ✅ {holisticInsights.reduce((sum, i) => sum + (i.recommendations?.length || 0), 0)}{" "}
              recomandări strategice generate
            </span>
          ) : (
            <span>⚠️ Nicio analiză AI generată încă</span>
          )}
        </div>
        <Button
          onClick={generateAnalysis}
          disabled={isGenerating}
          className="w-full gap-2 sm:w-auto"
          aria-label="Generează analiză AI pentru toate răspunsurile"
          aria-busy={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="hidden sm:inline">Generare în curs...</span>
              <span className="sm:hidden">Generare...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Generează Analiză AI</span>
              <span className="sm:hidden">Generează AI</span>
            </>
          )}
        </Button>
      </div>

      {/* Navigation Tabs - Scrollable on mobile */}
      <div className="border-border bg-card rounded-lg border">
        <div
          className="hide-scrollbar flex gap-2 overflow-x-auto p-3 sm:gap-4 sm:p-4"
          role="tablist"
          aria-label="Secțiuni analiză cercetare"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    const nextIndex = (index + 1) % tabs.length;
                    const nextTab = tabs[nextIndex];
                    if (nextTab) {
                      setActiveTab(nextTab.id);
                      document.getElementById(`tab-${nextTab.id}`)?.focus();
                    }
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    const prevIndex = (index - 1 + tabs.length) % tabs.length;
                    const prevTab = tabs[prevIndex];
                    if (prevTab) {
                      setActiveTab(prevTab.id);
                      document.getElementById(`tab-${prevTab.id}`)?.focus();
                    }
                  } else if (e.key === "Home") {
                    e.preventDefault();
                    const firstTab = tabs[0];
                    if (firstTab) {
                      setActiveTab(firstTab.id);
                      document.getElementById(`tab-${firstTab.id}`)?.focus();
                    }
                  } else if (e.key === "End") {
                    e.preventDefault();
                    const lastTab = tabs[tabs.length - 1];
                    if (lastTab) {
                      setActiveTab(lastTab.id);
                      document.getElementById(`tab-${lastTab.id}`)?.focus();
                    }
                  }
                }}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview" tabIndex={0}>
            <h2 className="mb-4 text-2xl font-bold">📊 Sumar Executiv</h2>
            <ExecutiveSummary
              totalResponses={totalResponses}
              citizenCount={citizenCount}
              officialCount={officialCount}
              countyCount={countyCount}
              localityCount={localityCount}
              dateRange={dateRange}
              overallSentiment={executiveSummaryData.overallSentiment}
              keyFindings={executiveSummaryData.keyFindings}
            />
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === "insights" && (
          <div
            role="tabpanel"
            id="tabpanel-insights"
            aria-labelledby="tab-insights"
            tabIndex={0}
            aria-busy={isLoadingInsights}
          >
            <h2 className="mb-4 text-2xl font-bold">🤖 Insight-uri Strategice AI</h2>
            {isLoadingInsights ? (
              <AIInsightsSkeleton />
            ) : holisticInsights.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Sparkles className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Nu există analize generate</h3>
                <p className="text-muted-foreground mt-2">
                  Apasă butonul &ldquo;Generează Analiză AI&rdquo; pentru a crea insight-uri
                  strategice.
                </p>
              </div>
            ) : (
              <>
                {/* Display summary per survey type */}
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  {holisticInsights.map((insight: HolisticInsight) => (
                    <div key={insight.survey_type} className="rounded-lg border p-4">
                      <h3 className="mb-2 text-lg font-semibold capitalize">
                        {insight.survey_type === "citizen" ? "📋 Cetățeni" : "🏛️ Funcționari"}
                      </h3>
                      <p className="text-muted-foreground mb-3 text-sm">{insight.ai_summary}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-primary/10 text-primary rounded px-2 py-1 font-medium">
                          {insight.recommendations?.length || 0} recomandări
                        </span>
                        <span className="bg-secondary rounded px-2 py-1">
                          {insight.total_questions} întrebări
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combined insights panel */}
                <AIInsightsPanel
                  themes={holisticInsights.flatMap((insight: HolisticInsight) => {
                    if (!insight.key_themes || !Array.isArray(insight.key_themes)) return [];
                    return insight.key_themes
                      .filter((t) => t && typeof t === "object")
                      .map((t) => ({
                        name: t.theme || "",
                        score: t.frequency || 0,
                        mentions: Math.round((t.frequency || 0) * 100),
                        sentiment:
                          t.sentiment === "positive" ? 0.8 : t.sentiment === "negative" ? -0.8 : 0,
                      }));
                  })}
                  features={holisticInsights.flatMap((insight: HolisticInsight) => {
                    if (!insight.feature_requests || !Array.isArray(insight.feature_requests))
                      return [];
                    return insight.feature_requests
                      .filter((f) => f && typeof f === "object")
                      .map((f) => ({
                        feature: f.feature || "",
                        count: f.count || 0,
                        priority: (f.priority as "high" | "medium" | "low") || "medium",
                        aiScore: f.aiScore || 0,
                        roi: f.roi || 0,
                      }));
                  })}
                  recommendations={holisticInsights
                    .flatMap((insight: HolisticInsight) => {
                      if (!insight.recommendations || !Array.isArray(insight.recommendations))
                        return [];
                      return insight.recommendations
                        .filter((r) => r && typeof r === "object")
                        .map((r) => ({
                          action: r.action || "",
                          priority: (r.priority as "high" | "medium" | "low") || "medium",
                          timeline:
                            (r.timeline as
                              | "immediate"
                              | "short-term"
                              | "medium-term"
                              | "long-term"
                              | "quick-win") || "short-term",
                          effort: (r.effort as "high" | "medium" | "low") || "medium",
                          impact: (r.impact as "high" | "medium" | "low") || "medium",
                          reasoning: r.reasoning || "",
                          surveyType: insight.survey_type, // Add survey type for filtering
                        }));
                    })
                    .sort((a, b) => {
                      // Sort by impact: high > medium > low
                      const impactOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                      return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
                    })}
                />
              </>
            )}
          </div>
        )}

        {/* Demographics Tab */}
        {activeTab === "demographics" && (
          <div
            role="tabpanel"
            id="tabpanel-demographics"
            aria-labelledby="tab-demographics"
            tabIndex={0}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">📊 Date Demografice</h2>
              <p className="text-muted-foreground text-sm">
                Distribuție geografică și analiza respondenților
              </p>
            </div>
            <DemographicsCharts
              locationData={locationData}
              totalCitizens={citizenCount}
              totalOfficials={officialCount}
            />
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div
            role="tabpanel"
            id="tabpanel-questions"
            aria-labelledby="tab-questions"
            tabIndex={0}
            aria-busy={isLoadingQuestions}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">❓ Analiza pe Întrebări</h2>
              <p className="text-muted-foreground text-sm">
                Detalii și insight-uri pentru fiecare întrebare din chestionar
              </p>
            </div>
            {isLoadingQuestions ? (
              <QuestionsSkeleton />
            ) : (
              <QuestionAnalysis
                citizenInsights={questionInsights.citizenInsights.map((insight) => ({
                  ...insight,
                  questionType: insight.questionType as
                    | "text"
                    | "single_choice"
                    | "multiple_choice"
                    | "rating",
                  respondentType: "citizen" as const,
                }))}
                officialInsights={questionInsights.officialInsights.map((insight) => ({
                  ...insight,
                  questionType: insight.questionType as
                    | "text"
                    | "single_choice"
                    | "multiple_choice"
                    | "rating",
                  respondentType: "official" as const,
                }))}
              />
            )}
          </div>
        )}

        {/* Export Tab - ORIGINAL HARDCODED VERSION FOR REFERENCE */}
        {false && activeTab === "questions" && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">❓ Analiza pe Întrebări (OLD)</h2>
              <p className="text-muted-foreground text-sm">
                Detalii și insight-uri pentru fiecare întrebare din chestionar
              </p>
            </div>
            <QuestionAnalysis
              citizenInsights={[
                {
                  questionId: "q1",
                  questionText: "Cât de des interacționați cu primăria?",
                  questionType: "single_choice",
                  respondentType: "citizen",
                  totalResponses: 19,
                  choices: [
                    { option: "Săptămânal", count: 2, percentage: 10.5 },
                    { option: "Lunar", count: 7, percentage: 36.8 },
                    { option: "De câteva ori pe an", count: 8, percentage: 42.1 },
                    { option: "Rar (o dată pe an sau mai puțin)", count: 2, percentage: 10.5 },
                  ],
                  sentiment: { score: 0.3, label: "neutral" },
                  aiSummary:
                    "Majoritatea cetățenilor (78.9%) interacționează cu primăria lunar sau de câteva ori pe an, indicând un nivel moderat de engagement. Doar 10.5% au interacțiuni frecvente (săptămânal).",
                  recommendations: [
                    "Platformă digitală poate reduce nevoia de vizite fizice pentru interacțiuni de rutină",
                    "Serviciile online ar beneficia grupul cu frecvență lunară/anuală",
                  ],
                },
                {
                  questionId: "q2",
                  questionText: "Cât de utilă considerați că ar fi o platformă digitală?",
                  questionType: "rating",
                  respondentType: "citizen",
                  totalResponses: 19,
                  averageRating: 4.42,
                  ratingDistribution: [
                    { rating: 5, count: 11, percentage: 57.9 },
                    { rating: 4, count: 6, percentage: 31.6 },
                    { rating: 3, count: 2, percentage: 10.5 },
                    { rating: 2, count: 0, percentage: 0 },
                    { rating: 1, count: 0, percentage: 0 },
                  ],
                  sentiment: { score: 0.88, label: "positive" },
                  aiSummary:
                    "Entuzias m puternic pentru digitalizare: 89.5% au acordat 4-5 stele. Rating mediu de 4.42/5.00 indică demand ridicat și potențial excelent de adopție.",
                  recommendations: [
                    "Cerere clară pentru platformă digitală - procedeți cu implementare",
                    "Focus pe calitate: așteptările sunt ridicate (4.42/5)",
                  ],
                },
                {
                  questionId: "q4",
                  questionText: "Ce funcționalități doriți pe platformă? (selectare multiplă)",
                  questionType: "multiple_choice",
                  respondentType: "citizen",
                  totalResponses: 19,
                  choices: [
                    { option: "Solicitare online documente", count: 16, percentage: 84.2 },
                    { option: "Tracking status cereri", count: 17, percentage: 89.5 },
                    { option: "Plăți online taxe", count: 15, percentage: 78.9 },
                    { option: "Programări online", count: 12, percentage: 63.2 },
                    { option: "Notificări email/SMS", count: 14, percentage: 73.7 },
                    { option: "Bază cunoștințe FAQ", count: 11, percentage: 57.9 },
                    { option: "Chat suport", count: 9, percentage: 47.4 },
                    { option: "Aplicație mobilă", count: 8, percentage: 42.1 },
                  ],
                  sentiment: { score: 0.75, label: "positive" },
                  aiSummary:
                    "Top 3 funcționalități: Tracking status (89.5%), Solicitare documente (84.2%), Plăți online (78.9%). Există consens puternic asupra nevoilor principale.",
                  recommendations: [
                    "MVP trebuie să includă: tracking, solicitare documente, plăți online",
                    "Programări și notificări sunt nice-to-have pentru v1.0",
                    "Aplicație mobilă - considerați pentru v2.0 (cerere mai scăzută)",
                  ],
                },
                {
                  questionId: "q5",
                  questionText: "Care ar fi cea mai utilă funcționalitate pentru dvs.?",
                  questionType: "text",
                  respondentType: "citizen",
                  totalResponses: 19,
                  themes: [
                    { name: "Tracking status", mentions: 8, sentiment: 0.9 },
                    { name: "Solicitare documente", mentions: 7, sentiment: 0.85 },
                    { name: "Transparență", mentions: 5, sentiment: 0.7 },
                    { name: "Comunicare rapidă", mentions: 4, sentiment: 0.65 },
                  ],
                  topQuotes: [
                    "Să pot vedea în timp real unde se află cererea mea și când va fi gata documentul",
                    "Cel mai important pentru mine ar fi să pot solicita certificate online fără să merg fizic",
                    "Transparență totală - să știu cine lucrează la dosarul meu și de ce durează atât",
                  ],
                  sentiment: { score: 0.78, label: "positive" },
                  aiSummary:
                    "Răspunsurile subliniază nevoia de vizibilitate și control. Tracking-ul statusului este menționat cel mai des (8 ori), urmat de solicitare documente (7 ori). Cetățenii doresc transparență și comunicare proactivă.",
                  recommendations: [
                    "Dashboard utilizator cu status live al cererilor",
                    "Notificări automate la fiecare etapă a procesării",
                    "Afișare nume funcționar responsabil (dacă posibil, GDPR compliant)",
                  ],
                },
              ]}
              officialInsights={[
                {
                  questionId: "q8",
                  questionText:
                    "Ce instrumente digitale considerați necesare pentru lucrul dvs.? (selectare multiplă)",
                  questionType: "multiple_choice",
                  respondentType: "official",
                  totalResponses: 1,
                  choices: [
                    { option: "Sistem management documente", count: 1, percentage: 100 },
                    { option: "Portal cereri online", count: 1, percentage: 100 },
                    { option: "Dashboard statistici", count: 1, percentage: 100 },
                    { option: "Workflow automatizat", count: 1, percentage: 100 },
                    { option: "Semnătură electronică", count: 1, percentage: 100 },
                  ],
                  sentiment: { score: 0.6, label: "positive" },
                  aiSummary:
                    "Funcționarul a selectat toate opțiunile, indicând nevoi complexe și comprehensive pentru digitalizare. Recunoaște valoarea unei suite integrate de tools.",
                  recommendations: [
                    "Platformă all-in-one preferabilă față de tools separate",
                    "Training necesar pentru adoptarea multiplor sisteme simultan",
                  ],
                },
                {
                  questionId: "q10",
                  questionText: "Ce provocări anticipați în implementarea platformei digitale?",
                  questionType: "text",
                  respondentType: "official",
                  totalResponses: 1,
                  themes: [
                    { name: "Integrare sisteme", mentions: 1, sentiment: -0.3 },
                    { name: "Training personal", mentions: 1, sentiment: 0.2 },
                    { name: "Rezistență la schimbare", mentions: 1, sentiment: -0.4 },
                  ],
                  topQuotes: [
                    "Integrarea cu sistemele existente va fi dificilă. Avem multe aplicații vechi care nu comunică între ele. De asemenea, colegii mai în vârstă vor avea nevoie de training extensiv.",
                  ],
                  sentiment: { score: -0.15, label: "mixed" },
                  aiSummary:
                    "Funcționarul identifică 3 provocări majore: integrare tehnică, necesitate training, și rezistență la schimbare. Sentiment mixt - recunoaște beneficiile dar este realist despre obstacole.",
                  recommendations: [
                    "Audit tehnic al sistemelor existente înainte de implementare",
                    "Program de change management și training gradual",
                    "Pilot cu early adopters înainte de roll-out complet",
                    "Suport tehnic dedicat în primele 6 luni",
                  ],
                },
              ]}
            />
          </div>
        )}

        {/* Correlations Tab */}
        {activeTab === "correlations" && (
          <div
            role="tabpanel"
            id="tabpanel-correlations"
            aria-labelledby="tab-correlations"
            tabIndex={0}
            aria-busy={isLoadingCorrelations}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">🔗 Analiză Corelații</h2>
              <p className="text-muted-foreground text-sm">
                Corelații statistice între variabilele sondajului
              </p>
            </div>
            {isLoadingCorrelations ? (
              <CorrelationsSkeleton />
            ) : correlationData ? (
              <CorrelationMatrix
                correlations={correlationData.correlations || []}
                keyFindings={correlationData.keyFindings || []}
                recommendations={correlationData.recommendations || []}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Network className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Nu există date de corelație</h3>
                <p className="text-muted-foreground mt-2">
                  Datele de corelație vor fi generate automat când există suficiente răspunsuri.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cohorts Tab */}
        {activeTab === "cohorts" && (
          <div
            role="tabpanel"
            id="tabpanel-cohorts"
            aria-labelledby="tab-cohorts"
            tabIndex={0}
            aria-busy={isLoadingCohorts}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">👥 Analiza Cohorte</h2>
              <p className="text-muted-foreground text-sm">
                Comparație între segmente de utilizatori
              </p>
            </div>
            {isLoadingCohorts ? (
              <CohortsSkeleton />
            ) : cohortData ? (
              <CohortComparison
                cohorts={cohortData.cohorts || []}
                metrics={cohortData.metrics || []}
                comparisons={cohortData.comparisons || []}
                summary={cohortData.summary}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <GitCompare className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Nu există date de cohorte</h3>
                <p className="text-muted-foreground mt-2">
                  Datele de cohorte vor fi generate automat când există suficiente răspunsuri.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div role="tabpanel" id="tabpanel-export" aria-labelledby="tab-export" tabIndex={0}>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">📥 Export</h2>
              <p className="text-muted-foreground text-sm">
                Descarcă rapoarte și date pentru analiză offline
              </p>
            </div>
            <ExportPanel totalResponses={totalResponses} />
          </div>
        )}
      </div>
    </>
  );
}
