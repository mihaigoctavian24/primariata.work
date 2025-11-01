/**
 * Feature Extraction Service
 *
 * Extract and prioritize feature requests from survey data
 * - Multiple choice feature selections (Q4 citizen, Q8 official)
 * - Implicit features from text responses
 * - Priority matrix (popularity × AI importance)
 * - ROI calculation (impact/effort estimates)
 */

import { chatCompletion, AI_MODELS } from "./openai-client";
import type {
  FeatureExtractionInput,
  FeatureExtractionOutput,
  FeatureRequest,
} from "@/types/survey-ai";

// =====================================================
// MAIN FEATURE EXTRACTION FUNCTION
// =====================================================

/**
 * Extract and prioritize features from survey data
 */
export async function extractFeatures(
  input: FeatureExtractionInput
): Promise<FeatureExtractionOutput> {
  console.log(`🔍 Extracting features for ${input.respondentType}...`);

  // Extract explicit features from multiple choice
  const explicitFeatures = await extractExplicitFeatures(
    input.multipleChoiceData ?? [],
    input.respondentType
  );

  // Extract implicit features from text responses
  const implicitFeatures = await extractImplicitFeatures(
    input.textResponses ?? [],
    input.respondentType
  );

  // Merge and deduplicate features
  const allFeatures = mergeFeatures(explicitFeatures, implicitFeatures);

  // Calculate priority matrix
  const priorityMatrix = calculatePriorityMatrix(allFeatures);

  console.log(`✅ Feature extraction complete: ${allFeatures.length} features identified`);

  return {
    features: allFeatures,
    priorityMatrix,
  };
}

// =====================================================
// EXPLICIT FEATURE EXTRACTION (MULTIPLE CHOICE)
// =====================================================

/**
 * Extract features from multiple choice questions (Q4 citizen, Q8 official)
 */
async function extractExplicitFeatures(
  multipleChoiceData: {
    questionId: string;
    selectedOptions: string[];
    respondentCount: number;
  }[],
  respondentType: "citizen" | "official"
): Promise<FeatureRequest[]> {
  if (multipleChoiceData.length === 0) {
    return [];
  }

  const features: FeatureRequest[] = [];

  for (const question of multipleChoiceData) {
    // Count occurrences of each option
    const optionCounts = new Map<string, number>();

    for (const option of question.selectedOptions) {
      optionCounts.set(option, (optionCounts.get(option) || 0) + 1);
    }

    // Convert to FeatureRequest format
    for (const [option, count] of optionCounts.entries()) {
      const popularity = (count / question.respondentCount) * 100;

      features.push({
        feature: option,
        description: `Funcționalitate selectată de ${respondentType === "citizen" ? "cetățeni" : "funcționari"}: ${option}`,
        priority: categorizeImportance(popularity),
        count,
        relatedQuestions: [question.questionId],
        sentiment: 0.5, // Neutral sentiment for explicit selections
      });
    }
  }

  return features;
}

// =====================================================
// IMPLICIT FEATURE EXTRACTION (TEXT ANALYSIS)
// =====================================================

/**
 * Extract features mentioned in text responses using AI
 */
async function extractImplicitFeatures(
  textResponses: {
    questionId: string;
    responses: string[];
  }[],
  respondentType: "citizen" | "official"
): Promise<FeatureRequest[]> {
  if (textResponses.length === 0) {
    return [];
  }

  // Combine all text responses
  const allTexts = textResponses.flatMap((q) => q.responses);
  const validTexts = allTexts.filter((r) => r && r.trim().length > 0);

  if (validTexts.length === 0) {
    return [];
  }

  const systemPrompt = `Ești un analist de produse digitale specializat în servicii publice digitale din România.

Sarcina ta este să identifici funcționalități (features) menționate implicit în răspunsurile text ale ${respondentType === "citizen" ? "cetățenilor" : "funcționarilor publici"}.

Returnează un JSON array de funcționalități:
[
  {
    "feature": "Nume funcționalitate (ex: Plată online, Notificări SMS)",
    "description": "Descriere detaliată a funcționalității",
    "priority": "high|medium|low",
    "mentions": număr de mențiuni,
    "sentiment": -1.0 to 1.0 (sentimentul utilizatorilor față de această funcționalitate),
    "relatedQuestions": ["question_ids unde a fost menționată"]
  }
]

IMPORTANT:
- Identifică doar funcționalități concrete, nu concepte abstracte
- Grupează funcționalități similare (ex: "plată card", "plată online" → "Plată online")
- Calculează sentimentul: pozitiv dacă e dorită, negativ dacă e frustrantă
- Prioritatea: high (>50% mentions), medium (20-50%), low (<20%)
- Maximum 15 funcționalități (cele mai importante)`;

  const userPrompt = `Răspunsuri text (${validTexts.length} total):
${validTexts.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Identifică funcționalitățile menționate și returnează JSON-ul.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.ANALYSIS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const aiFeatures = JSON.parse(response.content);

    // Convert AI response to FeatureRequest format
    const features: FeatureRequest[] = Array.isArray(aiFeatures)
      ? aiFeatures.map((f) => ({
          feature: f.feature ?? "Unknown Feature",
          description: f.description ?? "",
          priority: f.priority ?? "medium",
          count: f.mentions ?? 1,
          relatedQuestions: Array.isArray(f.relatedQuestions)
            ? f.relatedQuestions
            : textResponses.map((q) => q.questionId),
          sentiment: f.sentiment ?? 0,
        }))
      : [];

    return features.slice(0, 15); // Max 15 implicit features
  } catch (error) {
    console.error("❌ Implicit feature extraction failed:", error);
    return [];
  }
}

// =====================================================
// FEATURE MERGING & DEDUPLICATION
// =====================================================

/**
 * Merge explicit and implicit features, removing duplicates
 */
function mergeFeatures(
  explicitFeatures: FeatureRequest[],
  implicitFeatures: FeatureRequest[]
): FeatureRequest[] {
  const merged = new Map<string, FeatureRequest>();

  // Add explicit features first (higher priority)
  for (const feature of explicitFeatures) {
    const key = normalizeFeatureName(feature.feature);
    merged.set(key, feature);
  }

  // Add implicit features, merging if similar
  for (const feature of implicitFeatures) {
    const key = normalizeFeatureName(feature.feature);

    if (merged.has(key)) {
      // Merge with existing feature
      const existing = merged.get(key)!;
      merged.set(key, {
        ...existing,
        count: existing.count + feature.count,
        description:
          existing.description.length > feature.description.length
            ? existing.description
            : feature.description,
        relatedQuestions: [...new Set([...existing.relatedQuestions, ...feature.relatedQuestions])],
        sentiment: (existing.sentiment + feature.sentiment) / 2, // Average sentiment
      });
    } else {
      merged.set(key, feature);
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.count - a.count);
}

/**
 * Normalize feature name for deduplication
 */
function normalizeFeatureName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]/g, "") // Remove special chars
    .trim();
}

// =====================================================
// PRIORITY MATRIX CALCULATION
// =====================================================

/**
 * Calculate priority matrix (popularity × AI importance × sentiment)
 */
function calculatePriorityMatrix(features: FeatureRequest[]): {
  feature: string;
  popularity: number;
  aiImportance: number;
  sentiment: number;
  priority: "high" | "medium" | "low";
  roi: number;
}[] {
  if (features.length === 0) {
    return [];
  }

  // Find total mentions for percentage calculation
  const totalMentions = features.reduce((sum, f) => sum + f.count, 0);

  return features.map((feature) => {
    // Popularity: percentage of respondents who mentioned it
    const popularity = totalMentions > 0 ? (feature.count / totalMentions) * 100 : 0;

    // AI Importance: based on priority + sentiment
    const aiImportance = calculateAIImportance(feature, popularity);

    // ROI: impact (popularity × sentiment) / effort (complexity estimate)
    const roi = calculateROI(popularity, feature.sentiment, feature.feature);

    // Priority: combine popularity and AI importance
    const priority = calculateFinalPriority(popularity, aiImportance, feature.sentiment);

    return {
      feature: feature.feature,
      popularity: Math.round(popularity * 10) / 10, // 1 decimal
      aiImportance: Math.round(aiImportance * 10) / 10,
      sentiment: Math.round(feature.sentiment * 100) / 100, // 2 decimals
      priority,
      roi: Math.round(roi * 10) / 10,
    };
  });
}

/**
 * Calculate AI importance score (0-100)
 */
function calculateAIImportance(feature: FeatureRequest, popularity: number): number {
  // Base score from priority
  const priorityScore = {
    high: 80,
    medium: 50,
    low: 30,
  }[feature.priority];

  // Sentiment adjustment (-20 to +20)
  const sentimentBonus = feature.sentiment * 20;

  // Popularity bonus (0 to 30)
  const popularityBonus = Math.min(popularity * 0.3, 30);

  return Math.max(0, Math.min(100, priorityScore + sentimentBonus + popularityBonus));
}

/**
 * Calculate ROI estimate (0-10)
 */
function calculateROI(popularity: number, sentiment: number, featureName: string): number {
  // Impact = popularity × sentiment adjustment
  const sentimentMultiplier = sentiment >= 0 ? 1 + sentiment * 0.5 : 0.5 + sentiment * 0.5;
  const impact = popularity * sentimentMultiplier;

  // Effort estimate based on feature complexity (simple heuristic)
  const effort = estimateEffort(featureName);

  // ROI = impact / effort (scaled 0-10)
  const rawROI = impact / effort;

  return Math.max(0, Math.min(10, rawROI / 10)); // Normalize to 0-10
}

/**
 * Estimate implementation effort (1-10 scale)
 */
function estimateEffort(featureName: string): number {
  const name = featureName.toLowerCase();

  // Simple features (1-3)
  if (
    name.includes("notificar") ||
    name.includes("email") ||
    name.includes("sms") ||
    name.includes("reminder")
  ) {
    return 2;
  }

  // Medium features (4-6)
  if (
    name.includes("plat") ||
    name.includes("card") ||
    name.includes("online") ||
    name.includes("formular") ||
    name.includes("descărcare")
  ) {
    return 5;
  }

  // Complex features (7-10)
  if (
    name.includes("integrar") ||
    name.includes("autenticar") ||
    name.includes("securitate") ||
    name.includes("ai") ||
    name.includes("inteligenț")
  ) {
    return 8;
  }

  // Default: medium complexity
  return 5;
}

/**
 * Calculate final priority (high/medium/low)
 */
function calculateFinalPriority(
  popularity: number,
  aiImportance: number,
  sentiment: number
): "high" | "medium" | "low" {
  const score = (popularity + aiImportance) / 2;

  // Downgrade if sentiment is negative
  if (sentiment < -0.3) {
    return score > 60 ? "medium" : "low";
  }

  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

/**
 * Categorize importance based on popularity
 */
function categorizeImportance(popularity: number): "high" | "medium" | "low" {
  if (popularity >= 50) return "high";
  if (popularity >= 20) return "medium";
  return "low";
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Extract top N features by priority
 */
export function getTopFeatures(features: FeatureRequest[], count: number = 10): FeatureRequest[] {
  return features
    .sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // Then by count
      return b.count - a.count;
    })
    .slice(0, count);
}

/**
 * Group features by category (AI-based categorization)
 */
export async function categorizeFeatures(
  features: FeatureRequest[]
): Promise<Map<string, FeatureRequest[]>> {
  if (features.length === 0) {
    return new Map();
  }

  const systemPrompt = `Grupează funcționalitățile în categorii logice.

Returnează JSON:
{
  "Categoria 1": ["feature1", "feature2"],
  "Categoria 2": ["feature3", "feature4"]
}

Categorii posibile: Plăți, Notificări, Formular Digital, Autentificare, Integrări, Raportare, etc.`;

  const userPrompt = `Funcționalități:
${features.map((f) => f.feature).join("\n")}`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.SUMMARIZATION,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const categories = JSON.parse(response.content);
    const result = new Map<string, FeatureRequest[]>();

    for (const [category, featureNames] of Object.entries(categories)) {
      const categoryFeatures = features.filter((f) =>
        (featureNames as string[]).includes(f.feature)
      );
      if (categoryFeatures.length > 0) {
        result.set(category, categoryFeatures);
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Feature categorization failed:", error);

    // Fallback: single category
    return new Map([["Toate funcționalitățile", features]]);
  }
}
