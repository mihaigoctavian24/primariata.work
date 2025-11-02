"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp, Users, Building2, MapPin } from "lucide-react";

interface ExecutiveSummaryProps {
  totalResponses: number;
  citizenCount: number;
  officialCount: number;
  countyCount: number;
  localityCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  overallSentiment?: {
    score: number; // -1 to 1
    label: "positive" | "negative" | "neutral" | "mixed";
  };
  keyFindings?: string[];
}

/**
 * Executive Summary Component
 *
 * Displays high-level research statistics, validity check,
 * AI-generated key findings, and overall sentiment
 */
export function ExecutiveSummary({
  totalResponses,
  citizenCount,
  officialCount,
  countyCount,
  localityCount,
  dateRange,
  overallSentiment,
  keyFindings = [],
}: ExecutiveSummaryProps) {
  const isValidResearch = totalResponses >= 15;
  const citizenPercentage = totalResponses > 0 ? (citizenCount / totalResponses) * 100 : 0;
  const officialPercentage = totalResponses > 0 ? (officialCount / totalResponses) * 100 : 0;

  // Sentiment display
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

  const sentiment = overallSentiment
    ? sentimentConfig[overallSentiment.label]
    : sentimentConfig.neutral;

  return (
    <div className="space-y-6">
      {/* Research Validity Badge */}
      <Card
        className={
          isValidResearch
            ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
            : "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30"
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isValidResearch ? (
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {isValidResearch ? "✅ Cercetare Validă" : "⚠️ Volum Insuficient de Date"}
              </h3>
              <p className="text-muted-foreground text-sm">
                <span className="font-medium">{totalResponses} răspunsuri</span>{" "}
                {isValidResearch
                  ? `(depășește minimul de 15 - validitate ${Math.round((totalResponses / 15) * 100)}%)`
                  : `(necesare cel puțin ${15 - totalResponses} răspunsuri suplimentare)`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-xs">Perioada</div>
              <div className="text-sm font-medium">
                {new Date(dateRange.start).toLocaleDateString("ro-RO")} -{" "}
                {new Date(dateRange.end).toLocaleDateString("ro-RO")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Responses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Răspunsuri</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-muted-foreground text-xs">Chestionare completate</p>
          </CardContent>
        </Card>

        {/* Citizens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cetățeni</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizenCount}</div>
            <p className="text-muted-foreground text-xs">
              {citizenPercentage.toFixed(1)}% din total
            </p>
          </CardContent>
        </Card>

        {/* Officials */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcționari</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officialCount}</div>
            <p className="text-muted-foreground text-xs">
              {officialPercentage.toFixed(1)}% din total
            </p>
          </CardContent>
        </Card>

        {/* Geographic Coverage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acoperire Geografică</CardTitle>
            <MapPin className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countyCount}</div>
            <p className="text-muted-foreground text-xs">
              {countyCount} {countyCount === 1 ? "județ" : "județe"}, {localityCount}{" "}
              {localityCount === 1 ? "localitate" : "localități"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🤖 Constatări Cheie (AI)</CardTitle>
          <CardDescription>
            Insight-uri strategice extrase automat din răspunsurile chestionarului
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keyFindings.length > 0 ? (
            <ul className="space-y-3">
              {keyFindings.map((finding, index) => (
                <li key={index} className="flex gap-3">
                  <div className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm">{finding}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <div className="mb-2 text-lg">🔄</div>
              Analiza AI nu a fost încă generată.
              <br />
              Constatările cheie vor apărea aici după procesarea răspunsurilor.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Sentiment */}
      {overallSentiment && (
        <Card>
          <CardHeader>
            <CardTitle>Sentiment General</CardTitle>
            <CardDescription>
              Analiza sentimentului bazată pe toate răspunsurile text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${sentiment.bg}`}
              >
                <div className={`text-2xl font-bold ${sentiment.color}`}>
                  {overallSentiment.score >= 0 ? "😊" : "😟"}
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className={sentiment.color}>
                    {sentiment.label}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    Scor: {overallSentiment.score.toFixed(2)} / 1.00
                  </span>
                </div>
                {/* Sentiment Progress Bar */}
                <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 dark:from-red-600 dark:via-yellow-600 dark:to-green-600"
                    style={{
                      width: `${((overallSentiment.score + 1) / 2) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                  <span>Negativ</span>
                  <span>Neutru</span>
                  <span>Pozitiv</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
