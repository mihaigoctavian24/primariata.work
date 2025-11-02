"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, Lightbulb, TrendingUp, Clock, Zap } from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AITheme {
  name: string;
  score: number; // 0-1
  mentions: number;
  sentiment: number; // -1 to 1
}

interface FeatureRequest {
  feature: string;
  count: number;
  priority: "high" | "medium" | "low";
  aiScore: number; // 0-100
  roi: number; // 0-10
}

interface AIRecommendation {
  action: string;
  priority: "high" | "medium" | "low";
  timeline: "immediate" | "quick-win" | "short-term" | "medium-term" | "long-term";
  effort: "low" | "medium" | "high";
  impact: string;
  reasoning: string;
}

interface AIInsightsPanelProps {
  themes?: AITheme[];
  features?: FeatureRequest[];
  recommendations?: AIRecommendation[];
}

/**
 * AI Insights Panel Component
 *
 * Displays AI-generated insights including:
 * - Theme analysis with sentiment
 * - Feature prioritization matrix
 * - Actionable recommendations
 */
export function AIInsightsPanel({
  themes = [],
  features = [],
  recommendations = [],
}: AIInsightsPanelProps) {
  const [sortBy, setSortBy] = useState<"count" | "priority" | "roi">("count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sort features
  const sortedFeatures = [...features].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "count") comparison = a.count - b.count;
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === "roi") comparison = a.roi - b.roi;

    return sortOrder === "desc" ? -comparison : comparison;
  });

  const toggleSort = (column: "count" | "priority" | "roi") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const priorityConfig = {
    high: {
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 dark:bg-red-500/20",
      label: "Înalt",
      icon: ArrowUp,
    },
    medium: {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      label: "Mediu",
      icon: Minus,
    },
    low: {
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10 dark:bg-green-500/20",
      label: "Scăzut",
      icon: ArrowDown,
    },
  };

  const timelineConfig = {
    immediate: { label: "Imediat", icon: Zap, color: "text-green-600 dark:text-green-400" },
    "quick-win": { label: "Quick Win", icon: Zap, color: "text-green-600 dark:text-green-400" },
    "short-term": { label: "1-3 luni", icon: Clock, color: "text-amber-600 dark:text-amber-400" },
    "medium-term": {
      label: "3-6 luni",
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
    },
    "long-term": { label: "6+ luni", icon: TrendingUp, color: "text-blue-600 dark:text-blue-400" },
  };

  const effortConfig = {
    low: { label: "Mic", color: "text-green-600 dark:text-green-400" },
    medium: { label: "Mediu", color: "text-amber-600 dark:text-amber-400" },
    high: { label: "Mare", color: "text-red-600 dark:text-red-400" },
  };

  return (
    <div className="space-y-6">
      {/* Themes Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏷️ Teme Identificate (AI)</CardTitle>
          <CardDescription>
            Teme extrase automat din răspunsurile text, sortate după frecvență
          </CardDescription>
        </CardHeader>
        <CardContent>
          {themes.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={themes
                  .sort((a, b) => b.mentions - a.mentions)
                  .slice(0, 10)
                  .map((theme) => ({
                    name: theme.name.length > 40 ? theme.name.substring(0, 40) + "..." : theme.name,
                    mentions: theme.mentions,
                    sentiment: theme.sentiment,
                  }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={190}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length && payload[0]?.payload) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
                          <p className="font-medium">
                            {
                              themes.find((t) =>
                                t.name.startsWith(data.name?.replace("...", "") || "")
                              )?.name
                            }
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Mențiuni:</span> {data.mentions}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Sentiment:</span>{" "}
                            {data.sentiment > 0.3
                              ? "Pozitiv"
                              : data.sentiment < -0.3
                                ? "Negativ"
                                : "Neutru"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
                  {themes
                    .sort((a, b) => b.mentions - a.mentions)
                    .slice(0, 10)
                    .map((theme, index) => {
                      // Use CSS variables for dark mode support
                      const color =
                        theme.sentiment > 0.3
                          ? "hsl(var(--chart-1))" // Positive - green/blue
                          : theme.sentiment < -0.3
                            ? "hsl(var(--chart-5))" // Negative - red/orange
                            : "hsl(var(--chart-3))"; // Neutral - blue
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <div className="mb-2 text-lg">🔄</div>
              Analiza temelor nu a fost încă generată.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Priority Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Matrice Prioritizare Funcționalități
          </CardTitle>
          <CardDescription>
            Funcționalități solicitate, sortate după popularitate, prioritate AI și ROI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {features.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium">Funcționalitate</th>
                    <th
                      className="hover:bg-accent cursor-pointer p-3 text-sm font-medium"
                      onClick={() => toggleSort("count")}
                    >
                      <div className="flex items-center gap-1">
                        Mențiuni
                        {sortBy === "count" &&
                          (sortOrder === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUp className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="hover:bg-accent cursor-pointer p-3 text-sm font-medium"
                      onClick={() => toggleSort("priority")}
                    >
                      <div className="flex items-center gap-1">
                        Prioritate
                        {sortBy === "priority" &&
                          (sortOrder === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUp className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th className="p-3 text-sm font-medium">Scor AI</th>
                    <th
                      className="hover:bg-accent cursor-pointer p-3 text-sm font-medium"
                      onClick={() => toggleSort("roi")}
                    >
                      <div className="flex items-center gap-1">
                        ROI
                        {sortBy === "roi" &&
                          (sortOrder === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUp className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFeatures.map((feature, index) => {
                    const config = priorityConfig[feature.priority];
                    const PriorityIcon = config.icon;
                    return (
                      <tr key={index} className="hover:bg-accent/50 border-b">
                        <td className="p-3 text-sm font-medium">{feature.feature}</td>
                        <td className="p-3 text-sm">{feature.count}</td>
                        <td className="p-3">
                          <div className={`flex items-center gap-1 ${config.color}`}>
                            <PriorityIcon className="h-4 w-4" />
                            <span className="text-sm">{config.label}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-muted h-2 w-20 overflow-hidden rounded-full">
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${feature.aiScore}%` }}
                              />
                            </div>
                            <span className="text-sm">{feature.aiScore}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm font-medium">{feature.roi.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <div className="mb-2 text-lg">🔄</div>
              Analiza funcționalităților nu a fost încă generată.
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">💡 Recomandări AI</CardTitle>
          <CardDescription>
            Acțiuni sugerate bazate pe analiza răspunsurilor, prioritizate după impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const priorityConf = priorityConfig[rec.priority] || priorityConfig.medium;
                const timelineConf = timelineConfig[rec.timeline] || timelineConfig["short-term"];
                const effortConf = effortConfig[rec.effort] || effortConfig.medium;
                const TimelineIcon = timelineConf.icon;

                return (
                  <div key={index} className="border-border rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-start gap-2">
                          <Lightbulb className={`mt-0.5 h-5 w-5 ${priorityConf.color}`} />
                          <h4 className="font-semibold">{rec.action}</h4>
                        </div>
                        <p className="text-muted-foreground mb-3 text-sm">{rec.impact}</p>
                      </div>
                      <Badge variant="outline" className={priorityConf.color}>
                        {priorityConf.label}
                      </Badge>
                    </div>

                    <div className="mb-3 flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <TimelineIcon className={`h-4 w-4 ${timelineConf.color}`} />
                        <span className="text-muted-foreground">{timelineConf.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Efort:</span>
                        <span className={effortConf.color}>{effortConf.label}</span>
                      </div>
                    </div>

                    <details className="text-muted-foreground text-sm">
                      <summary className="hover:text-foreground cursor-pointer font-medium">
                        Argumentare AI
                      </summary>
                      <p className="mt-2 pl-4">{rec.reasoning}</p>
                    </details>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <div className="mb-2 text-lg">🔄</div>
              Recomandările AI nu au fost încă generate.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
