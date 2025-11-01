/**
 * Demographic Analysis Service
 *
 * Statistical analysis of survey demographics and cross-tabulations
 * - Age distribution
 * - Geographic spread (county + locality)
 * - Cross-tabulations (age × features, location × readiness)
 * - Statistical correlations (chi-square, Pearson)
 */

import { chatCompletion, AI_MODELS } from "./openai-client";
import type { DemographicAnalysisInput, DemographicAnalysisOutput } from "@/types/survey-ai";

// =====================================================
// MAIN DEMOGRAPHIC ANALYSIS FUNCTION
// =====================================================

/**
 * Analyze demographic patterns and correlations
 */
export async function analyzeDemographics(
  input: DemographicAnalysisInput
): Promise<DemographicAnalysisOutput> {
  console.log(`📊 Analyzing demographics for ${input.respondents.length} respondents...`);

  // Age distribution
  const ageDistribution = calculateAgeDistribution(input.respondents);

  // Geographic spread
  const geographicSpread = calculateGeographicSpread(input.respondents, input.responses);

  // Cross-tabulations
  const crossTabs = generateCrossTabs(input.respondents, input.responses);

  // Statistical correlations
  const correlations = await identifyCorrelations(input.respondents, input.responses);

  console.log(`✅ Demographic analysis complete`);

  return {
    ageDistribution,
    geographicSpread,
    crossTabs,
    correlations,
  };
}

// =====================================================
// AGE DISTRIBUTION
// =====================================================

/**
 * Calculate age category distribution
 */
function calculateAgeDistribution(
  respondents: DemographicAnalysisInput["respondents"]
): { category: string; count: number; percentage: number }[] {
  const ageCounts = new Map<string, number>();
  const total = respondents.length;

  // Count by age category
  for (const respondent of respondents) {
    const age = respondent.ageCategory ?? "Necunoscut";
    ageCounts.set(age, (ageCounts.get(age) || 0) + 1);
  }

  // Convert to array with percentages
  const distribution = Array.from(ageCounts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 1000) / 10, // 1 decimal
    }))
    .sort((a, b) => {
      // Sort by standard age order
      const order = ["18-25", "26-35", "36-45", "46-60", "60+", "Necunoscut"];
      return order.indexOf(a.category) - order.indexOf(b.category);
    });

  return distribution;
}

// =====================================================
// GEOGRAPHIC SPREAD
// =====================================================

/**
 * Calculate geographic distribution with sentiment
 */
function calculateGeographicSpread(
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): {
  county: string;
  localities: number;
  responses: number;
  sentiment?: number;
}[] {
  const countyData = new Map<
    string,
    {
      localities: Set<string>;
      respondentIds: Set<string>;
      sentimentScores: number[];
    }
  >();

  // Aggregate by county
  for (const respondent of respondents) {
    const county = respondent.county;

    if (!countyData.has(county)) {
      countyData.set(county, {
        localities: new Set(),
        respondentIds: new Set(),
        sentimentScores: [],
      });
    }

    const data = countyData.get(county)!;
    data.localities.add(respondent.locality);
    data.respondentIds.add(respondent.id);
  }

  // Calculate sentiment per county (from rating questions)
  for (const response of responses) {
    if (response.answerRating !== undefined) {
      const respondent = respondents.find((r) => r.id === response.respondentId);
      if (respondent) {
        const data = countyData.get(respondent.county);
        if (data) {
          // Convert 1-5 rating to -1 to 1 sentiment
          const sentiment = (response.answerRating - 3) / 2; // 1→-1, 3→0, 5→1
          data.sentimentScores.push(sentiment);
        }
      }
    }
  }

  // Convert to output format
  const spread = Array.from(countyData.entries())
    .map(([county, data]) => ({
      county,
      localities: data.localities.size,
      responses: data.respondentIds.size,
      sentiment:
        data.sentimentScores.length > 0
          ? Math.round(
              (data.sentimentScores.reduce((sum, s) => sum + s, 0) / data.sentimentScores.length) *
                100
            ) / 100
          : undefined,
    }))
    .sort((a, b) => b.responses - a.responses); // Sort by response count

  return spread;
}

// =====================================================
// CROSS-TABULATIONS
// =====================================================

/**
 * Generate cross-tabulations for insights
 */
function generateCrossTabs(
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): {
  ageXFeatures: { age: string; feature: string; count: number }[];
  locationXReadiness: { county: string; readinessScore: number }[];
  frequencyXUsefulness?: { frequency: string; avgRating: number }[];
} {
  // Age × Features (from Q4 citizen, Q8 official)
  const ageXFeatures = calculateAgeFeatureCrossTabs(respondents, responses);

  // Location × Readiness (from Q3 citizen - digital readiness rating)
  const locationXReadiness = calculateLocationReadinessCrossTabs(respondents, responses);

  // Frequency × Usefulness (from Q1 frequency, Q2 usefulness rating)
  const frequencyXUsefulness = calculateFrequencyUsefulnessCrossTabs(respondents, responses);

  return {
    ageXFeatures,
    locationXReadiness,
    frequencyXUsefulness,
  };
}

/**
 * Age × Feature preferences
 */
function calculateAgeFeatureCrossTabs(
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): { age: string; feature: string; count: number }[] {
  const crossTab = new Map<string, number>();

  // Feature questions: Q4 (citizen), Q8 (official)
  const featureQuestions = ["q4_features", "q8_internal_tools"];

  for (const response of responses) {
    if (
      featureQuestions.includes(response.questionId) &&
      response.answerChoices &&
      response.answerChoices.length > 0
    ) {
      const respondent = respondents.find((r) => r.id === response.respondentId);
      if (respondent && respondent.ageCategory) {
        for (const feature of response.answerChoices) {
          const key = `${respondent.ageCategory}|${feature}`;
          crossTab.set(key, (crossTab.get(key) || 0) + 1);
        }
      }
    }
  }

  return Array.from(crossTab.entries())
    .map(([key, count]) => {
      const parts = key.split("|");
      const age = parts[0] ?? "Unknown";
      const feature = parts[1] ?? "Unknown";
      return { age, feature, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50 combinations
}

/**
 * Location × Digital readiness
 */
function calculateLocationReadinessCrossTabs(
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): { county: string; readinessScore: number }[] {
  const countyReadiness = new Map<string, number[]>();

  // Q3 citizen: digital readiness rating (1-5)
  const readinessQuestion = "q3_readiness";

  for (const response of responses) {
    if (response.questionId === readinessQuestion && response.answerRating !== undefined) {
      const respondent = respondents.find((r) => r.id === response.respondentId);
      if (respondent) {
        if (!countyReadiness.has(respondent.county)) {
          countyReadiness.set(respondent.county, []);
        }
        countyReadiness.get(respondent.county)!.push(response.answerRating);
      }
    }
  }

  return Array.from(countyReadiness.entries())
    .map(([county, scores]) => ({
      county,
      readinessScore: Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10,
    }))
    .sort((a, b) => b.readinessScore - a.readinessScore);
}

/**
 * Frequency × Usefulness
 */
function calculateFrequencyUsefulnessCrossTabs(
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): { frequency: string; avgRating: number }[] {
  const frequencyRatings = new Map<string, number[]>();

  // Build frequency map (Q1)
  const frequencyMap = new Map<string, string>();
  for (const response of responses) {
    if (response.questionId === "q1_frequency" && response.answerText) {
      frequencyMap.set(response.respondentId, response.answerText);
    }
  }

  // Map usefulness ratings by frequency (Q2)
  for (const response of responses) {
    if (response.questionId === "q2_usefulness" && response.answerRating !== undefined) {
      const frequency = frequencyMap.get(response.respondentId);
      if (frequency) {
        if (!frequencyRatings.has(frequency)) {
          frequencyRatings.set(frequency, []);
        }
        frequencyRatings.get(frequency)!.push(response.answerRating);
      }
    }
  }

  return Array.from(frequencyRatings.entries())
    .map(([frequency, ratings]) => ({
      frequency,
      avgRating: Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10,
    }))
    .sort((a, b) => {
      // Sort by frequency order
      const order = ["Zilnic", "Săptămânal", "Lunar", "Rar", "Niciodată"];
      return order.indexOf(a.frequency) - order.indexOf(b.frequency);
    });
}

// =====================================================
// STATISTICAL CORRELATIONS
// =====================================================

/**
 * Identify significant correlations using AI + statistical tests
 */
async function identifyCorrelations(
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): Promise<
  {
    variables: [string, string];
    coefficient: number;
    pValue: number;
    significant: boolean;
    interpretation: string;
  }[]
> {
  // Prepare data for AI analysis
  const correlationCandidates = [
    {
      var1: "age_category",
      var2: "digital_readiness",
      question1: "Demographic",
      question2: "Q3",
    },
    {
      var1: "frequency",
      var2: "usefulness_rating",
      question1: "Q1",
      question2: "Q2",
    },
    {
      var1: "county",
      var2: "digital_readiness",
      question1: "Demographic",
      question2: "Q3",
    },
    {
      var1: "age_category",
      var2: "security_concerns",
      question1: "Demographic",
      question2: "Q6/Q11",
    },
  ];

  const correlations: {
    variables: [string, string];
    coefficient: number;
    pValue: number;
    significant: boolean;
    interpretation: string;
  }[] = [];

  // Calculate correlations for each candidate
  for (const candidate of correlationCandidates) {
    const correlation = await calculateCorrelation(
      candidate.var1,
      candidate.var2,
      respondents,
      responses
    );

    if (correlation) {
      correlations.push(correlation);
    }
  }

  return correlations;
}

/**
 * Calculate correlation between two variables
 */
async function calculateCorrelation(
  var1: string,
  var2: string,
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): Promise<{
  variables: [string, string];
  coefficient: number;
  pValue: number;
  significant: boolean;
  interpretation: string;
} | null> {
  // Extract data pairs
  const dataPairs = extractDataPairs(var1, var2, respondents, responses);

  if (dataPairs.length < 3) {
    return null; // Not enough data
  }

  // Calculate Pearson correlation coefficient (simplified)
  const coefficient = calculatePearsonCorrelation(dataPairs);

  // Calculate p-value (simplified - for demonstration)
  const pValue = calculatePValue(coefficient, dataPairs.length);

  // Significance test (p < 0.05)
  const significant = pValue < 0.05;

  // AI interpretation
  const interpretation = await interpretCorrelation(var1, var2, coefficient, pValue, significant);

  return {
    variables: [var1, var2],
    coefficient: Math.round(coefficient * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    significant,
    interpretation,
  };
}

/**
 * Extract paired data for correlation analysis
 */
function extractDataPairs(
  var1: string,
  var2: string,
  respondents: DemographicAnalysisInput["respondents"],
  responses: DemographicAnalysisInput["responses"]
): [number, number][] {
  const pairs: [number, number][] = [];

  for (const respondent of respondents) {
    const val1 = getVariableValue(var1, respondent, responses);
    const val2 = getVariableValue(var2, respondent, responses);

    if (val1 !== null && val2 !== null) {
      pairs.push([val1, val2]);
    }
  }

  return pairs;
}

/**
 * Get numeric value for a variable
 */
function getVariableValue(
  variable: string,
  respondent: DemographicAnalysisInput["respondents"][0],
  responses: DemographicAnalysisInput["responses"]
): number | null {
  // Age category → numeric
  if (variable === "age_category") {
    const ageMap: Record<string, number> = {
      "18-25": 1,
      "26-35": 2,
      "36-45": 3,
      "46-60": 4,
      "60+": 5,
    };
    return respondent.ageCategory ? (ageMap[respondent.ageCategory] ?? null) : null;
  }

  // County → numeric (hash for correlation)
  if (variable === "county") {
    return hashString(respondent.county);
  }

  // Digital readiness (Q3)
  if (variable === "digital_readiness") {
    const response = responses.find(
      (r) => r.respondentId === respondent.id && r.questionId === "q3_readiness"
    );
    return response?.answerRating ?? null;
  }

  // Frequency (Q1)
  if (variable === "frequency") {
    const response = responses.find(
      (r) => r.respondentId === respondent.id && r.questionId === "q1_frequency"
    );
    const frequencyMap: Record<string, number> = {
      Zilnic: 5,
      Săptămânal: 4,
      Lunar: 3,
      Rar: 2,
      Niciodată: 1,
    };
    return response?.answerText ? (frequencyMap[response.answerText] ?? null) : null;
  }

  // Usefulness rating (Q2)
  if (variable === "usefulness_rating") {
    const response = responses.find(
      (r) => r.respondentId === respondent.id && r.questionId === "q2_usefulness"
    );
    return response?.answerRating ?? null;
  }

  // Security concerns (Q6 citizen, Q11 official)
  if (variable === "security_concerns") {
    const response = responses.find(
      (r) =>
        r.respondentId === respondent.id &&
        (r.questionId === "q6_security" || r.questionId === "q11_barriers")
    );
    return response?.answerRating ?? null;
  }

  return null;
}

/**
 * Simple string hash for categorical correlation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash % 100); // 0-99
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(pairs: [number, number][]): number {
  const n = pairs.length;
  if (n === 0) return 0;

  const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
  const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
  const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
  const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);
  const sumY2 = pairs.reduce((sum, [, y]) => sum + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Calculate p-value (simplified approximation)
 */
function calculatePValue(r: number, n: number): number {
  // Simplified t-test approximation
  const t = (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
  // const df = n - 2; // Degrees of freedom (for reference)

  // Very rough p-value approximation based on t-statistic
  const absT = Math.abs(t);

  if (absT > 2.576) return 0.01; // Very significant
  if (absT > 1.96) return 0.05; // Significant
  if (absT > 1.645) return 0.1; // Marginally significant
  return 0.2; // Not significant
}

/**
 * AI interpretation of correlation
 */
async function interpretCorrelation(
  var1: string,
  var2: string,
  coefficient: number,
  pValue: number,
  significant: boolean
): Promise<string> {
  const systemPrompt = `Ești un statistician expert care interpretează corelații pentru cercetare în servicii publice digitale.

Explică corelația în limba română, pentru un public non-tehnic (funcționari publici, decidenți).

Returnează JSON:
{
  "interpretation": "Explicație clară, concisă (max 2 propoziții)"
}`;

  const userPrompt = `Variabile: "${var1}" și "${var2}"
Coeficient corelație: ${coefficient}
P-value: ${pValue}
Semnificativ statistic: ${significant ? "Da" : "Nu"}

Interpretează această corelație.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.SUMMARIZATION,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.interpretation ?? "Corelație identificată.";
  } catch (error) {
    console.error("❌ Correlation interpretation failed:", error);

    // Fallback interpretation
    const strength =
      Math.abs(coefficient) > 0.7
        ? "puternică"
        : Math.abs(coefficient) > 0.4
          ? "moderată"
          : "slabă";
    const direction = coefficient > 0 ? "pozitivă" : "negativă";

    return `Corelație ${strength} ${direction} între ${var1} și ${var2}${significant ? " (semnificativ statistic)" : ""}.`;
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate chi-square test for categorical variables
 */
export function chiSquareTest(
  observed: number[][],
  expected: number[][]
): { chiSquare: number; pValue: number; significant: boolean } {
  let chiSquare = 0;

  for (let i = 0; i < observed.length; i++) {
    const obsRow = observed[i];
    const expRow = expected[i];

    if (!obsRow || !expRow) continue;

    for (let j = 0; j < obsRow.length; j++) {
      const o = obsRow[j];
      const e = expRow[j];

      if (o !== undefined && e !== undefined && e > 0) {
        chiSquare += Math.pow(o - e, 2) / e;
      }
    }
  }

  // Degrees of freedom
  const firstRow = observed[0];
  const df = firstRow ? (observed.length - 1) * (firstRow.length - 1) : 1;

  // Simplified p-value (chi-square distribution approximation)
  let pValue = 0.5;
  if (chiSquare > 10.828 && df === 1) pValue = 0.001;
  else if (chiSquare > 6.635 && df === 1) pValue = 0.01;
  else if (chiSquare > 3.841 && df === 1) pValue = 0.05;

  return {
    chiSquare: Math.round(chiSquare * 100) / 100,
    pValue,
    significant: pValue < 0.05,
  };
}

/**
 * Calculate expected frequencies for chi-square test
 */
export function calculateExpectedFrequencies(observed: number[][]): number[][] {
  const rowTotals = observed.map((row) => row.reduce((sum, val) => sum + val, 0));
  const firstRow = observed[0];

  if (!firstRow) {
    return [];
  }

  const colTotals = firstRow.map((_, j) => observed.reduce((sum, row) => sum + (row[j] ?? 0), 0));
  const grandTotal = rowTotals.reduce((sum, val) => sum + val, 0);

  if (grandTotal === 0) {
    return observed.map((row) => row.map(() => 0));
  }

  return observed.map((row, i) => {
    const rowTotal = rowTotals[i] ?? 0;
    return row.map((_, j) => {
      const colTotal = colTotals[j] ?? 0;
      return (rowTotal * colTotal) / grandTotal;
    });
  });
}
