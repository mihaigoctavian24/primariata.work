"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, MessageSquare, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

interface QuestionInsight {
  questionId: string;
  questionText: string;
  questionType: "single_choice" | "multiple_choice" | "text" | "rating";
  respondentType: "citizen" | "official";
  totalResponses: number;

  // For choice questions
  choices?: {
    option: string;
    count: number;
    percentage: number;
  }[];

  // For text questions
  themes?: {
    name: string;
    mentions: number;
    sentiment: number;
  }[];
  topQuotes?: string[];

  // For rating questions
  averageRating?: number;
  ratingDistribution?: {
    rating: number;
    count: number;
    percentage: number;
  }[];

  // AI Summary
  aiSummary?: string;
  recommendations?: string[];
  sentiment?: {
    score: number;
    label: "positive" | "negative" | "neutral" | "mixed";
  };
}

interface QuestionAnalysisProps {
  citizenInsights?: QuestionInsight[];
  officialInsights?: QuestionInsight[];
}

/**
 * Question Analysis Component
 *
 * Displays detailed analysis for each survey question,
 * with tabs for Citizens vs Officials
 */
export function QuestionAnalysis({
  citizenInsights = [],
  officialInsights = [],
}: QuestionAnalysisProps) {
  const [activeTab, setActiveTab] = useState<"citizen" | "official">("citizen");

  return (
    <div className="space-y-6">
      {/* Tabs for Citizen vs Official */}
      <Tabs
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as "citizen" | "official")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="citizen" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Cetățeni ({citizenInsights.length})
          </TabsTrigger>
          <TabsTrigger value="official" className="gap-2">
            <BarChart className="h-4 w-4" />
            Funcționari ({officialInsights.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="citizen" className="mt-6 space-y-6">
          {citizenInsights.length > 0 ? (
            citizenInsights.map((insight, index) => <QuestionCard key={index} insight={insight} />)
          ) : (
            <EmptyState message="Nu există analize pentru răspunsurile cetățenilor" />
          )}
        </TabsContent>

        <TabsContent value="official" className="mt-6 space-y-6">
          {officialInsights.length > 0 ? (
            officialInsights.map((insight, index) => <QuestionCard key={index} insight={insight} />)
          ) : (
            <EmptyState message="Nu există analize pentru răspunsurile funcționarilor" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Individual Question Card
 */
function QuestionCard({ insight }: { insight: QuestionInsight }) {
  const sentimentConfig = {
    positive: {
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10 dark:bg-green-500/20",
      label: "Pozitiv",
    },
    negative: {
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 dark:bg-red-500/20",
      label: "Negativ",
    },
    neutral: {
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-500/10 dark:bg-gray-500/20",
      label: "Neutru",
    },
    mixed: {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      label: "Mixt",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2">{insight.questionText}</CardTitle>
            <CardDescription className="flex items-center gap-3">
              <Badge variant="outline">{getQuestionTypeLabel(insight.questionType)}</Badge>
              <span>{insight.totalResponses} răspunsuri</span>
              {insight.sentiment && (
                <Badge variant="outline" className={sentimentConfig[insight.sentiment.label].color}>
                  {sentimentConfig[insight.sentiment.label].label}
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Summary */}
        {insight.aiSummary && (
          <div className="border-border rounded-lg border bg-blue-50/50 p-4 dark:bg-blue-950/30">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Rezumat AI
              </span>
            </div>
            <p className="text-sm text-blue-900/80 dark:text-blue-100/70">{insight.aiSummary}</p>
          </div>
        )}

        {/* Choice Questions Visualization */}
        {insight.questionType !== "text" && insight.choices && (
          <div>
            <h4 className="mb-3 text-sm font-semibold">Distribuție răspunsuri</h4>
            <div className="space-y-2">
              {insight.choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{choice.option}</span>
                      <span className="text-muted-foreground">
                        {choice.count} ({choice.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${choice.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating Questions Visualization */}
        {insight.questionType === "rating" && insight.ratingDistribution && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Distribuție rating</h4>
              {insight.averageRating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500" />
                  <span className="text-sm font-medium">
                    Medie: {insight.averageRating.toFixed(2)} / 5.00
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {insight.ratingDistribution
                .sort((a, b) => b.rating - a.rating)
                .map((rating, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm font-medium">
                      {rating.rating} {rating.rating === 1 ? "stea" : "stele"}
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-amber-400 dark:bg-amber-500"
                          style={{ width: `${rating.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-muted-foreground w-16 text-right text-sm">
                      {rating.count} ({rating.percentage.toFixed(0)}%)
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Text Questions - Themes */}
        {insight.questionType === "text" && insight.themes && insight.themes.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold">Teme identificate</h4>
            <div className="flex flex-wrap gap-2">
              {insight.themes.map((theme, index) => {
                const sentimentColor =
                  theme.sentiment > 0.3
                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                    : theme.sentiment < -0.3
                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30";
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${sentimentColor}`}
                  >
                    <span className="text-sm font-medium">{theme.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {theme.mentions}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Text Questions - Top Quotes */}
        {insight.questionType === "text" && insight.topQuotes && insight.topQuotes.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold">Citate reprezentative</h4>
            <div className="space-y-2">
              {insight.topQuotes.slice(0, 3).map((quote, index) => (
                <div key={index} className="border-primary bg-muted/50 border-l-4 p-3">
                  <p className="text-sm italic">&ldquo;{quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insight.recommendations && insight.recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-semibold">Recomandări</h4>
            <ul className="space-y-2">
              {insight.recommendations.map((rec, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
      <MessageSquare className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/**
 * Get human-readable question type label
 */
function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    single_choice: "Alegere unică",
    multiple_choice: "Alegere multiplă",
    text: "Text liber",
    rating: "Rating 1-5",
  };
  return labels[type] || type;
}
