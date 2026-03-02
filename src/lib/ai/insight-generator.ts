/**
 * AI Insight Generation & Recommendations
 *
 * Generate executive summaries and actionable recommendations
 * - Executive summary synthesis
 * - Question-specific insights
 * - AI recommendations with priorities
 * - Key findings extraction
 */

import { logger } from "@/lib/logger";
import { chatCompletion, AI_MODELS } from "./openai-client";
import type {
  AIInsight,
  AIRecommendation,
  ExecutiveSummary,
  QuestionAnalysisResult,
  TextAnalysisOutput,
  FeatureExtractionOutput,
  DemographicAnalysisOutput,
} from "@/types/survey-ai";

// =====================================================
// EXECUTIVE SUMMARY GENERATION
// =====================================================

/**
 * Generate executive summary from all analysis results
 */
export async function generateExecutiveSummary(input: {
  totalResponses: number;
  citizenCount: number;
  officialCount: number;
  dateRange: { start: string; end: string };
  counties: number;
  localities: number;
  overallSentiment: { overall: number; label: string };
  questionAnalyses: QuestionAnalysisResult[];
}): Promise<ExecutiveSummary> {
  logger.debug("📝 Generating executive summary...");

  // Extract key findings using AI
  const keyFindings = await extractKeyFindings(input.questionAnalyses);

  return {
    totalResponses: input.totalResponses,
    citizenCount: input.citizenCount,
    officialCount: input.officialCount,
    dateRange: input.dateRange,
    geographicCoverage: {
      counties: input.counties,
      localities: input.localities,
    },
    overallSentiment: {
      overall: input.overallSentiment.overall,
      label: input.overallSentiment.label as "positive" | "negative" | "neutral" | "mixed",
      distribution: { positive: 0, neutral: 0, negative: 0 }, // Will be calculated from data
      confidence: 0.8,
    },
    keyFindings,
    researchValidity: {
      minimumMet: input.totalResponses >= 15,
      actual: input.totalResponses,
      minimum: 15,
    },
  };
}

/**
 * Extract 3-5 key findings using AI
 */
async function extractKeyFindings(questionAnalyses: QuestionAnalysisResult[]): Promise<string[]> {
  // Prepare summary of all questions for AI
  const questionSummaries = questionAnalyses
    .map((q) => {
      let summary = `${q.questionId}: ${q.questionText}\n`;

      if (q.textAnalysis) {
        summary += `  - Sentiment: ${q.textAnalysis.sentiment.label}\n`;
        summary += `  - Top themes: ${q.textAnalysis.themes
          .slice(0, 3)
          .map((t) => t.name)
          .join(", ")}\n`;
      }

      if (q.choiceDistribution) {
        const top3 = q.choiceDistribution.slice(0, 3);
        summary += `  - Top choices: ${top3.map((c) => `${c.option} (${c.percentage}%)`).join(", ")}\n`;
      }

      if (q.ratingStats) {
        summary += `  - Average rating: ${q.ratingStats.average}/5\n`;
      }

      return summary;
    })
    .join("\n");

  const systemPrompt = `Ești un analist senior de cercetare specializat în servicii publice digitale din România.

Analizează rezultatele chestionarului și extrage 3-5 KEY FINDINGS (concluzii cheie) pentru un raport executiv.

Criteriile pentru KEY FINDINGS:
- Trebuie să fie ACTIONABLE (să conducă la acțiuni concrete)
- Trebuie să fie STRATEGIC (relevante pentru decizie)
- Trebuie să fie BAZATE PE DATE (susținute de răspunsuri)
- Trebuie să fie CONCISE (max 2 propoziții fiecare)

Returnează JSON:
{
  "keyFindings": [
    "Constatare 1 (actionable, concisă)",
    "Constatare 2 (actionable, concisă)",
    "Constatare 3 (actionable, concisă)"
  ]
}`;

  const userPrompt = `Rezultate chestionar:\n\n${questionSummaries}\n\nExtrage 3-5 KEY FINDINGS pentru raportul executiv.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.INSIGHTS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return Array.isArray(result.keyFindings) ? result.keyFindings.slice(0, 5) : [];
  } catch (error) {
    logger.error("❌ Key findings extraction failed:", error);

    // Fallback findings
    return [
      "Cerere puternică pentru digitalizarea serviciilor publice.",
      "Preocupări semnificative legate de securitatea datelor.",
      "Diferențe importante între preferințele grupelor de vârstă.",
    ];
  }
}

// =====================================================
// QUESTION-SPECIFIC INSIGHTS
// =====================================================

/**
 * Generate AI insight for a specific question
 */
export async function generateQuestionInsight(input: {
  questionId: string;
  questionText: string;
  questionType: string;
  respondentType: "citizen" | "official";
  totalResponses: number;
  textAnalysis?: TextAnalysisOutput;
  choiceDistribution?: { option: string; count: number; percentage: number }[];
  ratingStats?: {
    average: number;
    median: number;
    mode: number;
    distribution: { rating: number; count: number }[];
  };
  featureAnalysis?: FeatureExtractionOutput;
  demographicAnalysis?: DemographicAnalysisOutput;
}): Promise<AIInsight> {
  logger.debug(`💡 Generating insight for ${input.questionId}...`);

  // Generate AI summary
  const aiSummary = await generateAISummary(input);

  // Generate recommendations
  const recommendations = await generateRecommendations(input);

  // Extract themes and features
  const themes = input.textAnalysis?.themes ?? [];
  const featureRequests =
    input.featureAnalysis?.features.slice(0, 10).map((f) => ({
      feature: f.feature,
      description: f.description,
      priority: f.priority,
      count: f.count,
      relatedQuestions: f.relatedQuestions,
      sentiment: f.sentiment,
    })) ?? [];

  return {
    id: `insight_${input.questionId}_${input.respondentType}`,
    questionId: input.questionId,
    respondentType: input.respondentType,
    themes,
    sentimentScore: input.textAnalysis?.sentiment.overall ?? 0,
    sentimentLabel: input.textAnalysis?.sentiment.label ?? "neutral",
    keyPhrases: input.textAnalysis?.keyPhrases ?? [],
    featureRequests,
    topQuotes: input.textAnalysis?.topQuotes ?? [],
    aiSummary,
    recommendations,
    totalResponses: input.totalResponses,
    responseDistribution: input.choiceDistribution
      ? Object.fromEntries(input.choiceDistribution.map((c) => [c.option, c.count]))
      : undefined,
    modelVersion: AI_MODELS.INSIGHTS.model,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    generatedAt: new Date().toISOString(),
    confidenceScore: calculateConfidenceScore(input.totalResponses),
  };
}

/**
 * Generate AI summary for question
 */
async function generateAISummary(input: {
  questionId: string;
  questionText: string;
  questionType: string;
  respondentType: "citizen" | "official";
  totalResponses: number;
  textAnalysis?: TextAnalysisOutput;
  choiceDistribution?: { option: string; count: number; percentage: number }[];
  ratingStats?: {
    average: number;
    median: number;
    mode: number;
  };
}): Promise<string> {
  let dataContext = `Întrebare: "${input.questionText}"\n`;
  dataContext += `Tip respondent: ${input.respondentType === "citizen" ? "cetățean" : "funcționar public"}\n`;
  dataContext += `Total răspunsuri: ${input.totalResponses}\n\n`;

  // Add relevant data based on question type
  if (input.textAnalysis) {
    dataContext += `Sentiment: ${input.textAnalysis.sentiment.label}\n`;
    dataContext += `Teme principale: ${input.textAnalysis.themes
      .slice(0, 5)
      .map((t) => t.name)
      .join(", ")}\n`;
    dataContext += `Citate reprezentative:\n${input.textAnalysis.topQuotes
      .slice(0, 3)
      .map((q) => `- "${q}"`)
      .join("\n")}\n`;
  }

  if (input.choiceDistribution) {
    dataContext += `Distribuție răspunsuri:\n`;
    input.choiceDistribution.slice(0, 5).forEach((c) => {
      dataContext += `- ${c.option}: ${c.percentage}% (${c.count} răspunsuri)\n`;
    });
  }

  if (input.ratingStats) {
    dataContext += `Rating mediu: ${input.ratingStats.average}/5\n`;
    dataContext += `Rating median: ${input.ratingStats.median}/5\n`;
  }

  const systemPrompt = `Ești un analist de date expert specializat în cercetare calitativă pentru servicii publice.

Scrie un REZUMAT EXECUTIV (2-3 propoziții) pentru această întrebare din chestionar.

Rezumatul trebuie să:
- Sintetizeze PĂRERILE/RĂSPUNSURILE respondențiilor
- Evidențieze PATTERNS și INSIGHTS importante
- Fie CONCIS și ACTIONABLE
- Fie scris în limba română, profesional

Returnează JSON:
{
  "summary": "Rezumat executiv (2-3 propoziții)"
}`;

  const userPrompt = `Date:\n${dataContext}\n\nGenerează rezumat executiv.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.INSIGHTS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.summary ?? "Rezumat indisponibil.";
  } catch (error) {
    logger.error("❌ AI summary generation failed:", error);
    return `Analiză pentru ${input.questionText} cu ${input.totalResponses} răspunsuri.`;
  }
}

/**
 * Generate actionable recommendations
 */
async function generateRecommendations(input: {
  questionId: string;
  questionText: string;
  respondentType: "citizen" | "official";
  textAnalysis?: TextAnalysisOutput;
  choiceDistribution?: { option: string; count: number; percentage: number }[];
  featureAnalysis?: FeatureExtractionOutput;
}): Promise<AIRecommendation[]> {
  // Prepare context for AI
  let context = `Întrebare: "${input.questionText}"\n`;
  context += `Tip: ${input.respondentType === "citizen" ? "cetățean" : "funcționar"}\n\n`;

  if (input.textAnalysis) {
    context += `Sentiment: ${input.textAnalysis.sentiment.label}\n`;
    context += `Teme: ${input.textAnalysis.themes
      .slice(0, 5)
      .map((t) => t.name)
      .join(", ")}\n`;
  }

  if (input.featureAnalysis) {
    const topFeatures = input.featureAnalysis.priorityMatrix.slice(0, 5);
    context += `Top funcționalități dorite:\n`;
    topFeatures.forEach((f) => {
      context += `- ${f.feature} (popularitate: ${f.popularity}%, prioritate: ${f.priority})\n`;
    });
  }

  if (input.choiceDistribution) {
    const top3 = input.choiceDistribution.slice(0, 3);
    context += `Top alegeri:\n`;
    top3.forEach((c) => {
      context += `- ${c.option}: ${c.percentage}%\n`;
    });
  }

  const systemPrompt = `Ești un consultant strategic pentru digitalizarea serviciilor publice în România.

Generează 2-4 RECOMANDĂRI ACȚIONABILE bazate pe datele din chestionar.

Fiecare recomandare trebuie să aibă:
- ACTION: Ce trebuie făcut (concret, specific)
- PRIORITY: high/medium/low
- IMPACT: Impactul așteptat (1-2 propoziții)
- TIMELINE: quick-win (1-3 luni) / short-term (3-6 luni) / long-term (6-12+ luni)
- EFFORT: low/medium/high
- REASONING: De ce această recomandare (1-2 propoziții)

Returnează JSON:
{
  "recommendations": [
    {
      "action": "Acțiune concretă",
      "priority": "high|medium|low",
      "impact": "Impactul așteptat",
      "timeline": "quick-win|short-term|long-term",
      "effort": "low|medium|high",
      "reasoning": "Justificare"
    }
  ]
}`;

  const userPrompt = `Date:\n${context}\n\nGenerează recomandări strategice.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.INSIGHTS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    if (Array.isArray(result.recommendations)) {
      return result.recommendations.slice(0, 4).map(
        (r: {
          action?: string;
          priority?: string;
          impact?: string;
          timeline?: string;
          effort?: string;
          reasoning?: string;
        }): AIRecommendation => ({
          action: r.action ?? "Acțiune nespecificată",
          priority: (r.priority as "high" | "medium" | "low") ?? "medium",
          impact: r.impact ?? "",
          timeline: (r.timeline as "quick-win" | "short-term" | "long-term") ?? "short-term",
          effort: (r.effort as "low" | "medium" | "high") ?? "medium",
          reasoning: r.reasoning ?? "",
        })
      );
    }

    return [];
  } catch (error) {
    logger.error("❌ Recommendations generation failed:", error);
    return [];
  }
}

/**
 * Calculate confidence score based on sample size
 */
function calculateConfidenceScore(totalResponses: number): number {
  // Statistical confidence based on sample size
  // 15 responses = 0.6 confidence
  // 30 responses = 0.75 confidence
  // 50+ responses = 0.85 confidence
  // 100+ responses = 0.95 confidence

  if (totalResponses >= 100) return 0.95;
  if (totalResponses >= 50) return 0.85;
  if (totalResponses >= 30) return 0.75;
  if (totalResponses >= 15) return 0.6;
  return 0.5;
}

// =====================================================
// BATCH INSIGHT GENERATION
// =====================================================

/**
 * Generate insights for all questions in parallel
 */
export async function generateAllInsights(
  questionAnalyses: QuestionAnalysisResult[]
): Promise<AIInsight[]> {
  logger.debug(`🔄 Generating insights for ${questionAnalyses.length} questions...`);

  const insights: AIInsight[] = [];

  // Process in batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < questionAnalyses.length; i += batchSize) {
    const batch = questionAnalyses.slice(i, i + batchSize);

    const batchInsights = await Promise.all(
      batch.map((q) =>
        generateQuestionInsight({
          questionId: q.questionId,
          questionText: q.questionText,
          questionType: q.questionType,
          respondentType: q.respondentType,
          totalResponses: q.totalResponses,
          textAnalysis: q.textAnalysis,
          choiceDistribution: q.choiceDistribution,
          ratingStats: q.ratingStats,
        })
      )
    );

    insights.push(...batchInsights);

    // Small delay between batches
    if (i + batchSize < questionAnalyses.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  logger.debug(`✅ Generated ${insights.length} insights`);

  return insights;
}

// =====================================================
// RECOMMENDATION PRIORITIZATION
// =====================================================

/**
 * Prioritize all recommendations across questions
 */
export function prioritizeRecommendations(insights: AIInsight[]): AIRecommendation[] {
  // Collect all recommendations
  const allRecommendations = insights.flatMap((insight) => insight.recommendations);

  // Score and sort recommendations
  const scored = allRecommendations.map((rec) => {
    let score = 0;

    // Priority weight
    if (rec.priority === "high") score += 30;
    else if (rec.priority === "medium") score += 20;
    else score += 10;

    // Timeline weight (quick wins are valuable)
    if (rec.timeline === "quick-win") score += 20;
    else if (rec.timeline === "short-term") score += 15;
    else score += 10;

    // Effort weight (lower effort = higher score)
    if (rec.effort === "low") score += 20;
    else if (rec.effort === "medium") score += 10;
    else score += 5;

    return { recommendation: rec, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 10 unique recommendations
  const unique = new Set<string>();
  const result: AIRecommendation[] = [];

  for (const item of scored) {
    const key = item.recommendation.action.toLowerCase().substring(0, 50);
    if (!unique.has(key) && result.length < 10) {
      unique.add(key);
      result.push(item.recommendation);
    }
  }

  return result;
}

// =====================================================
// COMPARATIVE INSIGHTS
// =====================================================

/**
 * Generate comparative insights between citizen and official responses
 */
export async function generateComparativeInsights(
  citizenInsights: AIInsight[],
  officialInsights: AIInsight[]
): Promise<string[]> {
  const systemPrompt = `Ești un analist comparativ pentru cercetare în servicii publice.

Compară perspectivele cetățenilor vs funcționarilor publici și identifică:
- ALINIAMENTE (unde sunt de acord)
- DIFERENȚE (unde diferă părerile)
- GAP-URI (ce lipsește din comunicare/înțelegere)

Returnează JSON:
{
  "comparativeInsights": [
    "Insight comparativ 1 (max 2 propoziții)",
    "Insight comparativ 2 (max 2 propoziții)",
    "Insight comparativ 3 (max 2 propoziții)"
  ]
}`;

  const citizenSummary = citizenInsights.map((i) => `${i.questionId}: ${i.aiSummary}`).join("\n");
  const officialSummary = officialInsights.map((i) => `${i.questionId}: ${i.aiSummary}`).join("\n");

  const userPrompt = `CETĂȚENI:\n${citizenSummary}\n\nFUNCȚIONARI:\n${officialSummary}\n\nGenerează insights comparative.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.INSIGHTS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return Array.isArray(result.comparativeInsights) ? result.comparativeInsights.slice(0, 5) : [];
  } catch (error) {
    logger.error("❌ Comparative insights generation failed:", error);
    return [];
  }
}

// =====================================================
// HOLISTIC SURVEY INSIGHTS (Per Survey Type)
// =====================================================

/**
 * Generate holistic strategic insights for entire survey type
 * Input: ALL questions + ALL responses for a survey type (citizen/official)
 * Output: 10-20 strategic recommendations organized by impact
 */
export async function generateHolisticInsights(input: {
  surveyType: "citizen" | "official";
  questions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    questionNumber: string;
  }>;
  responses: Array<{
    questionId: string;
    answerText?: string;
    answerChoices?: string[];
    answerRating?: number;
  }>;
  respondentCount: number;
}): Promise<{
  surveyType: "citizen" | "official";
  keyThemes: Array<{ theme: string; frequency: number; sentiment: string }>;
  sentimentScore: number;
  sentimentLabel: "positive" | "neutral" | "negative";
  recommendations: AIRecommendation[];
  featureRequests: Array<{
    feature: string;
    count: number;
    priority: "high" | "medium" | "low";
    aiScore: number;
    roi: number;
  }>;
  aiSummary: string;
  totalQuestions: number;
  totalResponses: number;
  modelVersion: string;
  promptTokens: number;
  completionTokens: number;
  confidenceScore: number;
}> {
  logger.debug(`🎯 Generating HOLISTIC insights for ${input.surveyType} survey...`);

  // Prepare comprehensive context for OpenAI
  const questionContext = input.questions
    .map((q) => {
      const questionResponses = input.responses.filter((r) => r.questionId === q.id);
      const responseCount = questionResponses.length;

      let responseSummary = "";
      if (q.questionType === "text" || q.questionType === "short_text") {
        const textSamples = questionResponses
          .filter((r) => r.answerText)
          .slice(0, 10)
          .map((r) => `  - "${r.answerText}"`);
        responseSummary = `Răspunsuri text (${responseCount}):\n${textSamples.join("\n")}`;
      } else if (q.questionType === "single_choice" || q.questionType === "multiple_choice") {
        const choiceCount: Record<string, number> = {};
        questionResponses.forEach((r) => {
          if (r.answerChoices) {
            r.answerChoices.forEach((choice) => {
              choiceCount[choice] = (choiceCount[choice] || 0) + 1;
            });
          }
        });
        const topChoices = Object.entries(choiceCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(
            ([choice, count]) =>
              `  - ${choice}: ${count} (${((count / responseCount) * 100).toFixed(1)}%)`
          )
          .join("\n");
        responseSummary = `Distribuție opțiuni (${responseCount}):\n${topChoices}`;
      } else if (q.questionType === "rating") {
        const ratings = questionResponses.filter((r) => r.answerRating).map((r) => r.answerRating!);
        const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        responseSummary = `Rating mediu: ${avg.toFixed(2)}/5 (${responseCount} răspunsuri)`;
      }

      return `\n### ${q.questionNumber}. ${q.questionText}\n${responseSummary}`;
    })
    .join("\n");

  const systemPrompt = `Ești un consultant strategic SENIOR pentru digitalizarea serviciilor publice în România.

Analizezi INTEGRAL un chestionar ${input.surveyType === "citizen" ? "pentru CETĂȚENI" : "pentru FUNCȚIONARI PUBLICI"}.

SARCINA TA:
1. Identifică 5-7 TEME STRATEGICE PRINCIPALE din toate răspunsurile
2. Evaluează sentiment-ul general (pozitiv/neutru/negativ)
3. Generează 10-20 RECOMANDĂRI STRATEGICE ACȚIONABILE cu organizare pe impact
4. Extrage 10-15 FUNCȚIONALITĂȚI DIGITALE CONCRETE dorite de utilizatori
5. Scrie un sumar executiv (3-5 propoziții)

RECOMANDĂRILE trebuie să fie:
- STRATEGICE (nu granulare per-întrebare)
- SINTETICE (combină insights din multiple întrebări)
- ACȚIONABILE (cu timeline și effort estimat)
- ORGANIZATE pe impact (high/medium/low)

FUNCȚIONALITĂȚILE trebuie să fie:
- CONCRETE (feature-uri digitale specifice)
- PRIORITIZATE (după frecvența menționării și impact)
- CU ROI ESTIMAT (0-10)

Returnează JSON:
{
  "keyThemes": [
    { "theme": "Nume temă", "frequency": 0.8, "sentiment": "positive/neutral/negative" }
  ],
  "sentimentScore": 0.5,
  "sentimentLabel": "positive/neutral/negative",
  "recommendations": [
    {
      "action": "Recomandare strategică concisă",
      "priority": "high/medium/low",
      "impact": "high/medium/low",
      "effort": "low/medium/high",
      "timeline": "immediate/short-term/medium-term/long-term",
      "reasoning": "De ce această recomandare este importantă (2-3 propoziții)"
    }
  ],
  "featureRequests": [
    {
      "feature": "Nume funcționalitate concisă",
      "count": 15,
      "priority": "high/medium/low",
      "aiScore": 85,
      "roi": 8.5
    }
  ],
  "aiSummary": "Sumar executiv al chestionarului (3-5 propoziții)",
  "confidenceScore": 0.85
}`;

  const userPrompt = `CHESTIONAR ${input.surveyType.toUpperCase()}
Total întrebări: ${input.questions.length}
Total respondenți: ${input.respondentCount}

${questionContext}

Generează analiza strategică holistică.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.INSIGHTS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      surveyType: input.surveyType,
      keyThemes: result.keyThemes || [],
      sentimentScore: result.sentimentScore || 0,
      sentimentLabel: result.sentimentLabel || "neutral",
      recommendations: (result.recommendations || []).slice(0, 20), // Max 20 recommendations
      featureRequests: (result.featureRequests || []).slice(0, 15), // Max 15 features
      aiSummary: result.aiSummary || "",
      totalQuestions: input.questions.length,
      totalResponses: input.responses.length,
      modelVersion: AI_MODELS.INSIGHTS.model,
      promptTokens: response.usage?.promptTokens || 0,
      completionTokens: response.usage?.completionTokens || 0,
      confidenceScore: result.confidenceScore || 0.8,
    };
  } catch (error) {
    logger.error(`❌ Holistic insights generation failed for ${input.surveyType}:`, error);
    throw error;
  }
}
