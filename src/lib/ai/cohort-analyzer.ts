/**
 * Cohort Analysis Service
 *
 * Segments survey respondents into cohorts and performs comparative analysis:
 * - Age-based cohorts (Young, Middle-aged, Seniors)
 * - Location-based cohorts (Urban vs Rural)
 * - Usage-based cohorts (Frequent vs Rare users)
 * - Comparative analysis of preferences, sentiment, and pain points
 */

import { Database } from "@/types/database.types";

// Type aliases
type SurveyRespondent = Database["public"]["Tables"]["survey_respondents"]["Row"];
type SurveyResponse = Database["public"]["Tables"]["survey_responses"]["Row"];

// ============================================================================
// TYPES
// ============================================================================

export interface Cohort {
  id: string;
  name: string;
  description: string;
  respondentIds: string[];
  size: number;
  percentage: number;
}

export interface CohortMetrics {
  cohortId: string;
  cohortName: string;

  // Feature preferences
  topFeatures: { feature: string; count: number; percentage: number }[];

  // Sentiment analysis
  averageSentiment: number; // -1 to 1
  sentimentLabel: "positive" | "negative" | "neutral" | "mixed";
  sentimentDistribution: {
    positive: number; // percentage
    neutral: number;
    negative: number;
  };

  // Pain points
  painPoints: { issue: string; mentions: number; severity: "high" | "medium" | "low" }[];

  // Digital readiness
  digitalReadinessScore: number; // 1-5 average

  // Usage patterns
  frequencyDistribution: { frequency: string; count: number; percentage: number }[];
}

export interface CohortComparison {
  cohort1: CohortMetrics;
  cohort2: CohortMetrics;

  // Differences
  featureDifferences: {
    feature: string;
    cohort1Percentage: number;
    cohort2Percentage: number;
    difference: number; // cohort1 - cohort2
    significant: boolean;
  }[];

  sentimentDifference: number; // cohort1 - cohort2
  readinessDifference: number;

  // Key insights
  insights: string[];
  recommendations: string[];
}

export interface CohortAnalysisInput {
  respondents: SurveyRespondent[];
  responses: SurveyResponse[];
  cohortType?: "age" | "location" | "usage" | "all";
}

export interface CohortAnalysisResult {
  cohorts: Cohort[];
  metrics: CohortMetrics[];
  comparisons: CohortComparison[];
  summary: {
    totalCohorts: number;
    largestCohort: string;
    smallestCohort: string;
    mostEngaged: string; // based on response rate
    keyFindings: string[];
  };
}

// ============================================================================
// COHORT DEFINITIONS
// ============================================================================

/**
 * Define age-based cohorts
 */
function defineAgeCohorts(respondents: SurveyRespondent[]): Cohort[] {
  const youngIds = respondents
    .filter((r) => r.age_category === "18-25" || r.age_category === "26-35")
    .map((r) => r.id);

  const middleIds = respondents
    .filter((r) => r.age_category === "36-45" || r.age_category === "46-60")
    .map((r) => r.id);

  const seniorIds = respondents.filter((r) => r.age_category === "60+").map((r) => r.id);

  const total = respondents.length;

  return [
    {
      id: "young_digitals",
      name: "Tineri Nativi Digitali",
      description: "Vârsta 18-35 ani - nativ digitali cu experiență tehnologică",
      respondentIds: youngIds,
      size: youngIds.length,
      percentage: (youngIds.length / total) * 100,
    },
    {
      id: "middle_aged",
      name: "Maturi Activi",
      description: "Vârsta 36-60 ani - activi profesional cu experiență variată",
      respondentIds: middleIds,
      size: middleIds.length,
      percentage: (middleIds.length / total) * 100,
    },
    {
      id: "seniors",
      name: "Seniori",
      description: "Peste 60 ani - pot necesita suport suplimentar pentru digital",
      respondentIds: seniorIds,
      size: seniorIds.length,
      percentage: (seniorIds.length / total) * 100,
    },
  ].filter((c) => c.size > 0);
}

/**
 * Define location-based cohorts (Urban vs Rural)
 */
function defineLocationCohorts(respondents: SurveyRespondent[]): Cohort[] {
  // Major cities in Romania
  const urbanCities = [
    "București",
    "Cluj",
    "Timișoara",
    "Iași",
    "Constanța",
    "Craiova",
    "Brașov",
    "Galați",
    "Ploiești",
    "Oradea",
  ];

  const urbanIds = respondents
    .filter((r) => {
      const locality = r.locality?.toLowerCase() || "";
      return urbanCities.some((city) => locality.includes(city.toLowerCase()));
    })
    .map((r) => r.id);

  const ruralIds = respondents.filter((r) => !urbanIds.includes(r.id)).map((r) => r.id);

  const total = respondents.length;

  return [
    {
      id: "urban",
      name: "Urban",
      description: "Orașe mari - acces mai bun la infrastructură digitală",
      respondentIds: urbanIds,
      size: urbanIds.length,
      percentage: (urbanIds.length / total) * 100,
    },
    {
      id: "rural",
      name: "Rural/Localități Mici",
      description: "Sate și orașe mici - posibil acces limitat la infrastructură",
      respondentIds: ruralIds,
      size: ruralIds.length,
      percentage: (ruralIds.length / total) * 100,
    },
  ].filter((c) => c.size > 0);
}

/**
 * Define usage-based cohorts (Frequent vs Rare)
 */
function defineUsageCohorts(
  respondents: SurveyRespondent[],
  responses: SurveyResponse[]
): Cohort[] {
  const frequencyMap: Record<string, number> = {
    Zilnic: 5,
    Săptămânal: 4,
    Lunar: 3,
    Rar: 2,
    Niciodată: 1,
  };

  const frequentIds: string[] = [];
  const occasionalIds: string[] = [];
  const rareIds: string[] = [];

  respondents.forEach((respondent) => {
    const frequencyResponse = responses.find(
      (r) => r.respondent_id === respondent.id && r.question_id === "q1_frequency"
    );

    const frequencyScore = frequencyResponse?.answer_text
      ? (frequencyMap[frequencyResponse.answer_text] ?? 0)
      : 0;

    if (frequencyScore >= 4) {
      frequentIds.push(respondent.id);
    } else if (frequencyScore >= 2) {
      occasionalIds.push(respondent.id);
    } else {
      rareIds.push(respondent.id);
    }
  });

  const total = respondents.length;

  return [
    {
      id: "frequent_users",
      name: "Utilizatori Frecvenți",
      description: "Zilnic/Săptămânal - utilizatori activi ai serviciilor publice",
      respondentIds: frequentIds,
      size: frequentIds.length,
      percentage: (frequentIds.length / total) * 100,
    },
    {
      id: "occasional_users",
      name: "Utilizatori Ocazionali",
      description: "Lunar/Rar - utilizare periodică",
      respondentIds: occasionalIds,
      size: occasionalIds.length,
      percentage: (occasionalIds.length / total) * 100,
    },
    {
      id: "rare_users",
      name: "Utilizatori Rari",
      description: "Niciodată - non-utilizatori sau foarte rar",
      respondentIds: rareIds,
      size: rareIds.length,
      percentage: (rareIds.length / total) * 100,
    },
  ].filter((c) => c.size > 0);
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculate metrics for a cohort
 */
async function calculateCohortMetrics(
  cohort: Cohort,
  respondents: SurveyRespondent[],
  responses: SurveyResponse[]
): Promise<CohortMetrics> {
  const cohortResponses = responses.filter((r) => cohort.respondentIds.includes(r.respondent_id));

  // Top features (Q4 for citizens, Q8 for officials)
  const topFeatures = extractTopFeatures(cohortResponses);

  // Sentiment analysis (from ratings Q2, Q3, etc.)
  const sentimentData = calculateSentiment(cohortResponses);

  // Pain points (from text responses)
  const painPoints = await extractPainPoints(cohortResponses);

  // Digital readiness (Q3)
  const digitalReadinessScore = calculateDigitalReadiness(cohortResponses);

  // Frequency distribution (Q1)
  const frequencyDistribution = calculateFrequencyDistribution(cohortResponses);

  return {
    cohortId: cohort.id,
    cohortName: cohort.name,
    topFeatures,
    averageSentiment: sentimentData.average,
    sentimentLabel: sentimentData.label,
    sentimentDistribution: sentimentData.distribution,
    painPoints,
    digitalReadinessScore,
    frequencyDistribution,
  };
}

/**
 * Extract top features from multiple choice responses
 */
function extractTopFeatures(
  responses: SurveyResponse[]
): { feature: string; count: number; percentage: number }[] {
  const featureCounts: Record<string, number> = {};
  const totalRespondents = new Set(responses.map((r) => r.respondent_id)).size;

  // Q4 (citizens) and Q8 (officials) feature questions
  responses
    .filter((r) => r.question_id === "q4_features" || r.question_id === "q8_features")
    .forEach((response) => {
      const features = response.answer_text?.split(",").map((f) => f.trim()) || [];
      features.forEach((feature) => {
        if (feature) {
          featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        }
      });
    });

  return Object.entries(featureCounts)
    .map(([feature, count]) => ({
      feature,
      count,
      percentage: totalRespondents > 0 ? (count / totalRespondents) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Calculate sentiment from rating responses
 */
function calculateSentiment(responses: SurveyResponse[]): {
  average: number;
  label: "positive" | "negative" | "neutral" | "mixed";
  distribution: { positive: number; neutral: number; negative: number };
} {
  const ratings = responses
    .filter((r) => r.answer_rating !== null && r.answer_rating !== undefined)
    .map((r) => r.answer_rating!);

  if (ratings.length === 0) {
    return {
      average: 0,
      label: "neutral",
      distribution: { positive: 0, neutral: 100, negative: 0 },
    };
  }

  // Convert 1-5 scale to -1 to 1 sentiment
  const sentiments = ratings.map((rating) => (rating - 3) / 2); // 1=-1, 3=0, 5=1
  const average = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

  // Distribution
  const positive = (ratings.filter((r) => r >= 4).length / ratings.length) * 100;
  const neutral = (ratings.filter((r) => r === 3).length / ratings.length) * 100;
  const negative = (ratings.filter((r) => r <= 2).length / ratings.length) * 100;

  // Label
  let label: "positive" | "negative" | "neutral" | "mixed" = "neutral";
  if (average > 0.3) label = "positive";
  else if (average < -0.3) label = "negative";
  else if (positive > 30 && negative > 30) label = "mixed";

  return {
    average: Math.round(average * 100) / 100,
    label,
    distribution: {
      positive: Math.round(positive),
      neutral: Math.round(neutral),
      negative: Math.round(negative),
    },
  };
}

/**
 * Extract pain points from text responses
 */
async function extractPainPoints(
  responses: SurveyResponse[]
): Promise<{ issue: string; mentions: number; severity: "high" | "medium" | "low" }[]> {
  // Common pain point keywords in Romanian
  const painPointKeywords: Record<string, string[]> = {
    "Interfață complicată": ["complicat", "confuz", "dificil", "greu de folosit"],
    "Lipsă informații": ["nu știu", "informații insuficiente", "lipsă explicații"],
    "Probleme tehnice": ["eroare", "bug", "nu funcționează", "crash"],
    "Timp de procesare lung": ["lent", "așteptare", "durează mult"],
    "Lipsa funcționalități": ["nu pot", "nu există", "lipsește"],
    Securitate: ["nesigur", "îngrijorare", "risc", "datele mele"],
  };

  const painPointCounts: Record<string, number> = {};

  // Analyze text responses (Q5, Q7, Q10, Q12)
  responses
    .filter(
      (r) =>
        r.answer_text &&
        (r.question_id?.includes("suggestions") ||
          r.question_id?.includes("concerns") ||
          r.question_id?.includes("useful"))
    )
    .forEach((response) => {
      const text = response.answer_text?.toLowerCase() || "";

      Object.entries(painPointKeywords).forEach(([issue, keywords]) => {
        if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
          painPointCounts[issue] = (painPointCounts[issue] || 0) + 1;
        }
      });
    });

  const totalResponses = responses.filter((r) => r.answer_text).length || 1;

  return Object.entries(painPointCounts)
    .map(([issue, mentions]) => {
      const percentage = (mentions / totalResponses) * 100;
      const severity: "high" | "medium" | "low" =
        percentage > 40 ? "high" : percentage > 20 ? "medium" : "low";

      return { issue, mentions, severity };
    })
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
}

/**
 * Calculate digital readiness score
 */
function calculateDigitalReadiness(responses: SurveyResponse[]): number {
  const readinessRatings = responses
    .filter((r) => r.question_id === "q3_readiness" && r.answer_rating !== null)
    .map((r) => r.answer_rating!);

  if (readinessRatings.length === 0) return 0;

  const average = readinessRatings.reduce((sum, r) => sum + r, 0) / readinessRatings.length;
  return Math.round(average * 10) / 10;
}

/**
 * Calculate frequency distribution
 */
function calculateFrequencyDistribution(
  responses: SurveyResponse[]
): { frequency: string; count: number; percentage: number }[] {
  const frequencyCounts: Record<string, number> = {};
  const totalRespondents = new Set(
    responses.filter((r) => r.question_id === "q1_frequency").map((r) => r.respondent_id)
  ).size;

  responses
    .filter((r) => r.question_id === "q1_frequency")
    .forEach((response) => {
      const freq = response.answer_text || "Necunoscut";
      frequencyCounts[freq] = (frequencyCounts[freq] || 0) + 1;
    });

  return Object.entries(frequencyCounts)
    .map(([frequency, count]) => ({
      frequency,
      count,
      percentage: totalRespondents > 0 ? (count / totalRespondents) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ============================================================================
// COHORT COMPARISON
// ============================================================================

/**
 * Compare two cohorts
 */
function compareCohorts(cohort1: CohortMetrics, cohort2: CohortMetrics): CohortComparison {
  // Feature differences
  const allFeatures = new Set([
    ...cohort1.topFeatures.map((f) => f.feature),
    ...cohort2.topFeatures.map((f) => f.feature),
  ]);

  const featureDifferences = Array.from(allFeatures)
    .map((feature) => {
      const c1Feature = cohort1.topFeatures.find((f) => f.feature === feature);
      const c2Feature = cohort2.topFeatures.find((f) => f.feature === feature);

      const c1Percentage = c1Feature?.percentage || 0;
      const c2Percentage = c2Feature?.percentage || 0;
      const difference = c1Percentage - c2Percentage;
      const significant = Math.abs(difference) > 15; // >15% difference is significant

      return {
        feature,
        cohort1Percentage: c1Percentage,
        cohort2Percentage: c2Percentage,
        difference,
        significant,
      };
    })
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 10);

  // Sentiment difference
  const sentimentDifference = cohort1.averageSentiment - cohort2.averageSentiment;

  // Readiness difference
  const readinessDifference = cohort1.digitalReadinessScore - cohort2.digitalReadinessScore;

  // Generate insights
  const insights = generateComparisonInsights(
    cohort1,
    cohort2,
    featureDifferences,
    sentimentDifference,
    readinessDifference
  );

  // Generate recommendations
  const recommendations = generateComparisonRecommendations(
    cohort1,
    cohort2,
    featureDifferences,
    sentimentDifference,
    readinessDifference
  );

  return {
    cohort1,
    cohort2,
    featureDifferences,
    sentimentDifference,
    readinessDifference,
    insights,
    recommendations,
  };
}

/**
 * Generate insights from cohort comparison
 */
function generateComparisonInsights(
  cohort1: CohortMetrics,
  cohort2: CohortMetrics,
  featureDifferences: CohortComparison["featureDifferences"],
  sentimentDiff: number,
  readinessDiff: number
): string[] {
  const insights: string[] = [];

  // Sentiment insight
  if (Math.abs(sentimentDiff) > 0.2) {
    insights.push(
      `${cohort1.cohortName} are un sentiment ${sentimentDiff > 0 ? "mai pozitiv" : "mai negativ"} față de ${cohort2.cohortName} (diferență: ${Math.abs(sentimentDiff).toFixed(2)})`
    );
  }

  // Readiness insight
  if (Math.abs(readinessDiff) > 0.5) {
    insights.push(
      `${cohort1.cohortName} au un scor de pregătire digitală ${readinessDiff > 0 ? "superior" : "inferior"} față de ${cohort2.cohortName} (${Math.abs(readinessDiff).toFixed(1)} puncte diferență)`
    );
  }

  // Feature preferences
  const significantFeatures = featureDifferences.filter((f) => f.significant);
  if (significantFeatures.length > 0) {
    insights.push(
      `Diferențe semnificative în preferințe: ${significantFeatures.length} funcționalități cu diferență >15%`
    );

    const topDifference = significantFeatures[0];
    if (topDifference) {
      const preferringCohort =
        topDifference.difference > 0 ? cohort1.cohortName : cohort2.cohortName;
      insights.push(
        `"${topDifference.feature}" este preferată semnificativ de ${preferringCohort} (${Math.abs(topDifference.difference).toFixed(1)}% diferență)`
      );
    }
  }

  // Pain points
  const cohort1Pain = cohort1.painPoints.length;
  const cohort2Pain = cohort2.painPoints.length;
  if (Math.abs(cohort1Pain - cohort2Pain) >= 2) {
    insights.push(
      `${cohort1Pain > cohort2Pain ? cohort1.cohortName : cohort2.cohortName} raportează mai multe probleme (${Math.max(cohort1Pain, cohort2Pain)} vs ${Math.min(cohort1Pain, cohort2Pain)})`
    );
  }

  return insights;
}

/**
 * Generate recommendations from cohort comparison
 */
function generateComparisonRecommendations(
  cohort1: CohortMetrics,
  cohort2: CohortMetrics,
  featureDifferences: CohortComparison["featureDifferences"],
  sentimentDiff: number,
  readinessDiff: number
): string[] {
  const recommendations: string[] = [];

  // Readiness-based recommendations
  if (readinessDiff > 0.5) {
    recommendations.push(
      `Oferiți suport tehnic suplimentar pentru ${cohort2.cohortName} pentru a crește pregătirea digitală`
    );
  } else if (readinessDiff < -0.5) {
    recommendations.push(
      `Oferiți suport tehnic suplimentar pentru ${cohort1.cohortName} pentru a crește pregătirea digitală`
    );
  }

  // Feature-based recommendations
  const significantFeatures = featureDifferences.filter((f) => f.significant);
  if (significantFeatures.length > 0) {
    recommendations.push(
      "Personalizați interfața în funcție de cohorta utilizatorului pentru a evidenția funcționalitățile relevante"
    );
  }

  // Sentiment-based recommendations
  if (Math.abs(sentimentDiff) > 0.3) {
    const negativeCohort = sentimentDiff > 0 ? cohort2.cohortName : cohort1.cohortName;
    recommendations.push(
      `Investigați cauzele satisfacției mai scăzute la ${negativeCohort} și implementați îmbunătățiri targetate`
    );
  }

  // Pain points recommendations
  const allPainPoints = [...cohort1.painPoints, ...cohort2.painPoints];
  const highSeverity = allPainPoints.filter((p) => p.severity === "high");
  if (highSeverity.length > 0) {
    recommendations.push(
      `Prioritizați rezolvarea problemelor de severitate înaltă: ${highSeverity[0]?.issue}`
    );
  }

  // Default recommendation
  if (recommendations.length === 0) {
    recommendations.push(
      "Continuați monitorizarea diferențelor între cohorte pentru a identifica oportunități de îmbunătățire"
    );
  }

  return recommendations;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform cohort analysis
 */
export async function analyzeCohorts(input: CohortAnalysisInput): Promise<CohortAnalysisResult> {
  const { respondents, responses, cohortType = "all" } = input;

  let allCohorts: Cohort[] = [];

  // Define cohorts based on type
  if (cohortType === "age" || cohortType === "all") {
    allCohorts = [...allCohorts, ...defineAgeCohorts(respondents)];
  }
  if (cohortType === "location" || cohortType === "all") {
    allCohorts = [...allCohorts, ...defineLocationCohorts(respondents)];
  }
  if (cohortType === "usage" || cohortType === "all") {
    allCohorts = [...allCohorts, ...defineUsageCohorts(respondents, responses)];
  }

  // Calculate metrics for each cohort
  const metricsPromises = allCohorts.map((cohort) =>
    calculateCohortMetrics(cohort, respondents, responses)
  );
  const metrics = await Promise.all(metricsPromises);

  // Generate pairwise comparisons (only for same type cohorts)
  const comparisons: CohortComparison[] = [];

  // Compare age cohorts
  const ageMetrics = metrics.filter((m) =>
    ["young_digitals", "middle_aged", "seniors"].includes(m.cohortId)
  );
  if (ageMetrics.length >= 2) {
    for (let i = 0; i < ageMetrics.length; i++) {
      for (let j = i + 1; j < ageMetrics.length; j++) {
        const m1 = ageMetrics[i];
        const m2 = ageMetrics[j];
        if (m1 && m2) {
          comparisons.push(compareCohorts(m1, m2));
        }
      }
    }
  }

  // Compare location cohorts
  const locationMetrics = metrics.filter((m) => ["urban", "rural"].includes(m.cohortId));
  if (locationMetrics.length === 2) {
    const m1 = locationMetrics[0];
    const m2 = locationMetrics[1];
    if (m1 && m2) {
      comparisons.push(compareCohorts(m1, m2));
    }
  }

  // Compare usage cohorts
  const usageMetrics = metrics.filter((m) =>
    ["frequent_users", "occasional_users", "rare_users"].includes(m.cohortId)
  );
  if (usageMetrics.length >= 2) {
    const frequent = usageMetrics.find((m) => m.cohortId === "frequent_users");
    const rare = usageMetrics.find((m) => m.cohortId === "rare_users");
    if (frequent && rare) {
      comparisons.push(compareCohorts(frequent, rare));
    }
  }

  // Generate summary
  const sortedBySize = [...allCohorts].sort((a, b) => b.size - a.size);
  const largestCohort = sortedBySize[0]?.name || "N/A";
  const smallestCohort = sortedBySize[sortedBySize.length - 1]?.name || "N/A";

  // Most engaged = highest frequency distribution
  const mostEngagedMetric = metrics.reduce((prev, current) => {
    const prevFrequent =
      prev.frequencyDistribution.find((f) => f.frequency === "Zilnic")?.percentage || 0;
    const currentFrequent =
      current.frequencyDistribution.find((f) => f.frequency === "Zilnic")?.percentage || 0;
    return currentFrequent > prevFrequent ? current : prev;
  }, metrics[0]!);

  const keyFindings: string[] = [];
  keyFindings.push(`Identificate ${allCohorts.length} cohorte distinte`);
  keyFindings.push(`Cea mai mare cohortă: ${largestCohort}`);
  if (mostEngagedMetric) {
    keyFindings.push(`Cel mai angajat segment: ${mostEngagedMetric.cohortName}`);
  }

  // Add comparison insights to key findings
  comparisons.slice(0, 2).forEach((comp) => {
    if (comp.insights[0]) {
      keyFindings.push(comp.insights[0]);
    }
  });

  return {
    cohorts: allCohorts,
    metrics,
    comparisons,
    summary: {
      totalCohorts: allCohorts.length,
      largestCohort,
      smallestCohort,
      mostEngaged: mostEngagedMetric?.cohortName || "N/A",
      keyFindings,
    },
  };
}
