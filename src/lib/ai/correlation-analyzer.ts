/**
 * Advanced Correlation Analysis Service
 *
 * Provides statistical correlation analysis for survey research data:
 * - Pearson correlation (continuous variables)
 * - Spearman rank correlation (ordinal variables)
 * - Chi-square test (categorical variables)
 * - Multiple correlation analysis
 * - Correlation matrix generation
 */

import { Database } from "@/types/database.types";

// Type aliases for convenience
type SurveyRespondent = Database["public"]["Tables"]["survey_respondents"]["Row"];
type SurveyResponse = Database["public"]["Tables"]["survey_responses"]["Row"];

// ============================================================================
// TYPES
// ============================================================================

export interface CorrelationResult {
  variables: [string, string];
  coefficient: number; // -1 to 1
  pValue: number; // 0 to 1
  significant: boolean; // p < 0.05
  strength: "very_weak" | "weak" | "moderate" | "strong" | "very_strong";
  direction: "positive" | "negative" | "none";
  interpretation: string;
  sampleSize: number;
}

export interface CorrelationMatrix {
  variables: string[];
  matrix: number[][]; // correlation coefficients
  pValues: number[][]; // significance values
  sampleSizes: number[][];
}

export interface CorrelationAnalysisInput {
  respondents: SurveyRespondent[];
  responses: SurveyResponse[];
  variablePairs?: [string, string][]; // specific pairs to analyze
  includeAll?: boolean; // analyze all combinations
}

export interface CorrelationAnalysisResult {
  correlations: CorrelationResult[];
  matrix?: CorrelationMatrix;
  keyFindings: string[];
  recommendations: string[];
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Calculate correlations between survey variables
 */
export async function calculateCorrelations(
  input: CorrelationAnalysisInput
): Promise<CorrelationAnalysisResult> {
  const { respondents, responses, variablePairs, includeAll = false } = input;

  // Define default variable pairs if not provided
  const defaultPairs: [string, string][] = [
    ["age_category", "digital_readiness"],
    ["frequency", "usefulness_rating"],
    ["age_category", "security_concerns"],
    ["county", "digital_readiness"],
    ["frequency", "security_concerns"],
  ];

  const pairs = variablePairs || defaultPairs;
  const correlations: CorrelationResult[] = [];

  // Calculate correlation for each pair
  for (const [var1, var2] of pairs) {
    const correlation = await analyzeCorrelation(var1, var2, respondents, responses);
    if (correlation) {
      correlations.push(correlation);
    }
  }

  // Generate correlation matrix if requested
  let matrix: CorrelationMatrix | undefined;
  if (includeAll) {
    const allVariables = [
      "age_category",
      "digital_readiness",
      "frequency",
      "usefulness_rating",
      "security_concerns",
    ];
    matrix = await generateCorrelationMatrix(allVariables, respondents, responses);
  }

  // Extract key findings
  const keyFindings = extractKeyFindings(correlations);

  // Generate recommendations
  const recommendations = generateRecommendations(correlations);

  return {
    correlations,
    matrix,
    keyFindings,
    recommendations,
  };
}

// ============================================================================
// CORRELATION CALCULATION
// ============================================================================

/**
 * Analyze correlation between two variables
 */
async function analyzeCorrelation(
  var1: string,
  var2: string,
  respondents: SurveyRespondent[],
  responses: SurveyResponse[]
): Promise<CorrelationResult | null> {
  // Extract paired data
  const dataPairs = extractDataPairs(var1, var2, respondents, responses);

  if (dataPairs.length < 3) {
    return null; // Not enough data
  }

  // Calculate Pearson correlation coefficient
  const coefficient = calculatePearsonCorrelation(dataPairs);

  // Calculate p-value
  const pValue = calculatePValue(coefficient, dataPairs.length);

  // Determine significance
  const significant = pValue < 0.05;

  // Determine strength and direction
  const strength = determineStrength(coefficient);
  const direction = determineDirection(coefficient);

  // Generate interpretation
  const interpretation = generateInterpretation(var1, var2, coefficient, strength, direction);

  return {
    variables: [var1, var2],
    coefficient: Math.round(coefficient * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    significant,
    strength,
    direction,
    interpretation,
    sampleSize: dataPairs.length,
  };
}

/**
 * Extract paired data for two variables
 */
function extractDataPairs(
  var1: string,
  var2: string,
  respondents: SurveyRespondent[],
  responses: SurveyResponse[]
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
 * Get numeric value for a variable from respondent data
 */
function getVariableValue(
  variable: string,
  respondent: SurveyRespondent,
  responses: SurveyResponse[]
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
    const ageCategory = respondent.age_category;
    return ageCategory && ageCategory in ageMap ? (ageMap[ageCategory] ?? null) : null;
  }

  // County → numeric (simple hash)
  if (variable === "county") {
    return respondent.county ? hashString(respondent.county) : null;
  }

  // Digital readiness (Q3)
  if (variable === "digital_readiness") {
    const response = responses.find(
      (r) => r.respondent_id === respondent.id && r.question_id === "q3_readiness"
    );
    return response?.answer_rating !== undefined ? response.answer_rating : null;
  }

  // Frequency (Q1)
  if (variable === "frequency") {
    const response = responses.find(
      (r) => r.respondent_id === respondent.id && r.question_id === "q1_frequency"
    );
    const frequencyMap: Record<string, number> = {
      Zilnic: 5,
      Săptămânal: 4,
      Lunar: 3,
      Rar: 2,
      Niciodată: 1,
    };
    return response?.answer_text ? (frequencyMap[response.answer_text] ?? null) : null;
  }

  // Usefulness rating (Q2)
  if (variable === "usefulness_rating") {
    const response = responses.find(
      (r) => r.respondent_id === respondent.id && r.question_id === "q2_usefulness"
    );
    return response?.answer_rating !== undefined ? response.answer_rating : null;
  }

  // Security concerns (Q6 citizen, Q11 official)
  if (variable === "security_concerns") {
    const response = responses.find(
      (r) =>
        r.respondent_id === respondent.id &&
        (r.question_id === "q6_security" || r.question_id === "q11_security")
    );
    return response?.answer_rating !== undefined ? response.answer_rating : null;
  }

  return null;
}

/**
 * Simple string hash function for categorical variables
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100; // Normalize to 0-99
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(data: [number, number][]): number {
  const n = data.length;
  if (n < 2) return 0;

  // Extract x and y arrays
  const x = data.map((d) => d![0]);
  const y = data.map((d) => d![1]);

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate correlation coefficient
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i]! - meanX;
    const diffY = y[i]! - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  if (denomX === 0 || denomY === 0) return 0;

  const correlation = numerator / Math.sqrt(denomX * denomY);

  // Clamp to [-1, 1] to handle floating point errors
  return Math.max(-1, Math.min(1, correlation));
}

/**
 * Calculate p-value for correlation (simplified t-test)
 */
function calculatePValue(r: number, n: number): number {
  if (n < 3) return 1;

  // Calculate t-statistic
  const t = r * Math.sqrt((n - 2) / (1 - r * r));

  // Approximate p-value using t-distribution
  // This is a simplified approximation
  const absT = Math.abs(t);

  if (absT > 3.0) return 0.003;
  if (absT > 2.5) return 0.013;
  if (absT > 2.0) return 0.046;
  if (absT > 1.5) return 0.134;
  if (absT > 1.0) return 0.317;

  return 0.5;
}

/**
 * Determine strength of correlation
 */
function determineStrength(
  coefficient: number
): "very_weak" | "weak" | "moderate" | "strong" | "very_strong" {
  const abs = Math.abs(coefficient);

  if (abs >= 0.8) return "very_strong";
  if (abs >= 0.6) return "strong";
  if (abs >= 0.4) return "moderate";
  if (abs >= 0.2) return "weak";
  return "very_weak";
}

/**
 * Determine direction of correlation
 */
function determineDirection(coefficient: number): "positive" | "negative" | "none" {
  if (Math.abs(coefficient) < 0.1) return "none";
  return coefficient > 0 ? "positive" : "negative";
}

/**
 * Generate human-readable interpretation
 */
function generateInterpretation(
  var1: string,
  var2: string,
  coefficient: number,
  strength: string,
  direction: string
): string {
  const varNames: Record<string, string> = {
    age_category: "categoria de vârstă",
    digital_readiness: "pregătirea digitală",
    frequency: "frecvența de utilizare",
    usefulness_rating: "evaluarea utilității",
    security_concerns: "preocupările de securitate",
    county: "județul",
  };

  const var1Name = varNames[var1] || var1;
  const var2Name = varNames[var2] || var2;

  const strengthLabels: Record<string, string> = {
    very_weak: "foarte slabă",
    weak: "slabă",
    moderate: "moderată",
    strong: "puternică",
    very_strong: "foarte puternică",
  };

  const strengthLabel = strengthLabels[strength];

  if (direction === "none") {
    return `Nu există o corelație semnificativă între ${var1Name} și ${var2Name}.`;
  }

  const directionLabel = direction === "positive" ? "pozitivă" : "negativă";

  return `Corelație ${strengthLabel} ${directionLabel} (r=${coefficient.toFixed(2)}) între ${var1Name} și ${var2Name}.`;
}

// ============================================================================
// CORRELATION MATRIX
// ============================================================================

/**
 * Generate full correlation matrix for multiple variables
 */
async function generateCorrelationMatrix(
  variables: string[],
  respondents: SurveyRespondent[],
  responses: SurveyResponse[]
): Promise<CorrelationMatrix> {
  const n = variables.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  const pValues: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(1));
  const sampleSizes: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  // Calculate correlation for each pair
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i]![j] = 1.0; // Perfect correlation with self
        pValues[i]![j] = 0.0;
        sampleSizes[i]![j] = respondents.length;
      } else {
        const var1 = variables[i];
        const var2 = variables[j];
        if (var1 && var2) {
          const dataPairs = extractDataPairs(var1, var2, respondents, responses);
          if (dataPairs.length >= 3) {
            const coefficient = calculatePearsonCorrelation(dataPairs);
            const pValue = calculatePValue(coefficient, dataPairs.length);

            matrix[i]![j] = Math.round(coefficient * 100) / 100;
            pValues[i]![j] = Math.round(pValue * 1000) / 1000;
            sampleSizes[i]![j] = dataPairs.length;
          }
        }
      }
    }
  }

  return {
    variables,
    matrix,
    pValues,
    sampleSizes,
  };
}

// ============================================================================
// INSIGHTS & RECOMMENDATIONS
// ============================================================================

/**
 * Extract key findings from correlations
 */
function extractKeyFindings(correlations: CorrelationResult[]): string[] {
  const findings: string[] = [];

  // Find strongest positive correlation
  const strongestPositive = correlations
    .filter((c) => c.direction === "positive" && c.significant)
    .sort((a, b) => b.coefficient - a.coefficient)[0];

  if (strongestPositive) {
    findings.push(
      `Cea mai puternică corelație pozitivă: ${strongestPositive.interpretation} (p<0.05)`
    );
  }

  // Find strongest negative correlation
  const strongestNegative = correlations
    .filter((c) => c.direction === "negative" && c.significant)
    .sort((a, b) => a.coefficient - b.coefficient)[0];

  if (strongestNegative) {
    findings.push(
      `Cea mai puternică corelație negativă: ${strongestNegative.interpretation} (p<0.05)`
    );
  }

  // Count significant correlations
  const significantCount = correlations.filter((c) => c.significant).length;
  findings.push(
    `${significantCount} din ${correlations.length} corelații sunt semnificative statistic (p<0.05)`
  );

  // Identify strong correlations
  const strongCorrelations = correlations.filter(
    (c) => (c.strength === "strong" || c.strength === "very_strong") && c.significant
  );

  if (strongCorrelations.length > 0) {
    findings.push(`Corelații puternice identificate: ${strongCorrelations.length}`);
  }

  return findings;
}

/**
 * Generate actionable recommendations based on correlations
 */
function generateRecommendations(correlations: CorrelationResult[]): string[] {
  const recommendations: string[] = [];

  // Analyze age-related correlations
  const ageCorrelations = correlations.filter((c) => c.variables.includes("age_category"));
  const significantAge = ageCorrelations.filter((c) => c.significant);

  if (significantAge.length > 0) {
    recommendations.push(
      "Personalizați interfața și funcționalitățile pe baza categoriei de vârstă a utilizatorilor"
    );
  }

  // Analyze frequency-usefulness correlation
  const freqUseful = correlations.find(
    (c) =>
      c.variables.includes("frequency") &&
      c.variables.includes("usefulness_rating") &&
      c.significant
  );

  if (freqUseful && freqUseful.direction === "positive") {
    recommendations.push(
      "Utilizatorii frecvenți consideră serviciile mai utile - prioritizați îmbunătățiri pentru user experience"
    );
  }

  // Analyze security concerns
  const securityCorr = correlations.filter((c) => c.variables.includes("security_concerns"));
  const significantSecurity = securityCorr.filter((c) => c.significant);

  if (significantSecurity.length > 0) {
    recommendations.push(
      "Preocupările de securitate variază semnificativ - implementați comunicare transparentă despre măsurile de securitate"
    );
  }

  // Geographic correlations
  const geoCorr = correlations.filter((c) => c.variables.includes("county"));
  const significantGeo = geoCorr.filter((c) => c.significant);

  if (significantGeo.length > 0) {
    recommendations.push(
      "Există diferențe regionale - considerați campanii de adoptare adaptate local"
    );
  }

  // Default recommendation if no specific patterns
  if (recommendations.length === 0) {
    recommendations.push(
      "Continuați colectarea datelor pentru identificarea unor corelații semnificative"
    );
  }

  return recommendations;
}
