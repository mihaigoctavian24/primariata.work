/**
 * Text Analysis Service
 *
 * AI-powered analysis of text responses from survey questions
 * - Sentiment analysis
 * - Theme extraction
 * - Key phrase identification
 * - Quote selection
 */

import { chatCompletion, AI_MODELS } from "./openai-client";
import type {
  TextAnalysisInput,
  TextAnalysisOutput,
  AITheme,
  SentimentAnalysis,
} from "@/types/survey-ai";

// =====================================================
// MAIN TEXT ANALYSIS FUNCTION
// =====================================================

/**
 * Analyze text responses using AI
 */
export async function analyzeTextResponses(input: TextAnalysisInput): Promise<TextAnalysisOutput> {
  console.log(`🔍 Analyzing ${input.responses.length} text responses for ${input.questionId}...`);

  // Filter out empty responses
  const validResponses = input.responses.filter((r) => r && r.trim().length > 0);

  if (validResponses.length === 0) {
    return {
      themes: [],
      sentiment: {
        overall: 0,
        label: "neutral",
        distribution: { positive: 0, neutral: 100, negative: 0 },
        confidence: 1,
      },
      keyPhrases: [],
      topQuotes: [],
      summary: "Nu există răspunsuri text pentru această întrebare.",
      wordFrequency: [],
    };
  }

  // Prepare prompt for AI analysis
  const systemPrompt = `Ești un analist de date expert specializat în analiza feedback-ului pentru servicii publice digitale în România.

Sarcina ta este să analizezi răspunsurile text ale cetățenilor/funcționarilor la chestionarul despre digitalizarea serviciilor publice.

Trebuie să returnezi un JSON cu următoarea structură:
{
  "themes": [
    {
      "name": "Nume temă (ex: Eficiență, Securitate)",
      "score": 0.0-1.0 (relevanță),
      "mentions": număr de mențiuni,
      "keywords": ["cuvinte", "cheie"],
      "sentiment": -1.0 to 1.0
    }
  ],
  "sentiment": {
    "overall": -1.0 to 1.0,
    "label": "positive|negative|neutral|mixed",
    "distribution": {
      "positive": 0-100,
      "neutral": 0-100,
      "negative": 0-100
    },
    "confidence": 0.0-1.0
  },
  "keyPhrases": ["fraze importante", "extrase din răspunsuri"],
  "topQuotes": ["cele mai reprezentative 3-5 citate complete"],
  "summary": "Rezumat în 2-3 propoziții",
  "wordFrequency": [
    {"word": "cuvânt", "count": număr}
  ]
}

IMPORTANT:
- Analizează în limba română
- Identifică teme recurente (5-10 teme maxim)
- Extrage fraze cheie exacte din răspunsuri
- Selectează citate reprezentative (nu modifica textul)
- Calculează sentimentul global și pe teme
- Frecvența cuvintelor (top 20, exclude cuvinte comune: "de", "la", "și", etc.)`;

  const userPrompt = `Întrebare: "${input.questionText}"
Tip respondent: ${input.respondentType === "citizen" ? "cetățean" : "funcționar public"}

Răspunsuri text (${validResponses.length} total):
${validResponses.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Analizează aceste răspunsuri și returnează JSON-ul cerut.`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.ANALYSIS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    // Parse JSON response
    const analysis = JSON.parse(response.content);

    // Validate and normalize the response
    const result: TextAnalysisOutput = {
      themes: Array.isArray(analysis.themes) ? analysis.themes : [],
      sentiment: {
        overall: analysis.sentiment?.overall ?? 0,
        label: analysis.sentiment?.label ?? "neutral",
        distribution: analysis.sentiment?.distribution ?? {
          positive: 0,
          neutral: 100,
          negative: 0,
        },
        confidence: analysis.sentiment?.confidence ?? 0.7,
      },
      keyPhrases: Array.isArray(analysis.keyPhrases) ? analysis.keyPhrases.slice(0, 15) : [],
      topQuotes: Array.isArray(analysis.topQuotes) ? analysis.topQuotes.slice(0, 5) : [],
      summary: analysis.summary ?? "Analiză indisponibilă.",
      wordFrequency: Array.isArray(analysis.wordFrequency)
        ? analysis.wordFrequency.slice(0, 20)
        : [],
    };

    console.log(
      `✅ Text analysis complete: ${result.themes.length} themes, sentiment: ${result.sentiment.label}`
    );

    return result;
  } catch (error) {
    console.error("❌ Text analysis failed:", error);

    // Return fallback result
    return {
      themes: [],
      sentiment: {
        overall: 0,
        label: "neutral",
        distribution: { positive: 0, neutral: 100, negative: 0 },
        confidence: 0,
      },
      keyPhrases: [],
      topQuotes: validResponses.slice(0, 3), // At least show some quotes
      summary: "Analiza AI a eșuat. Verificați răspunsurile manual.",
      wordFrequency: [],
    };
  }
}

// =====================================================
// SENTIMENT ANALYSIS (STANDALONE)
// =====================================================

/**
 * Analyze sentiment of a single text or multiple texts
 */
export async function detectSentiment(texts: string | string[]): Promise<SentimentAnalysis> {
  const textArray = Array.isArray(texts) ? texts : [texts];
  const combinedText = textArray.join("\n");

  const systemPrompt = `Analizează sentimentul textului în limba română.
Returnează JSON: { "overall": -1.0 to 1.0, "label": "positive|negative|neutral|mixed", "distribution": {"positive": 0-100, "neutral": 0-100, "negative": 0-100}, "confidence": 0.0-1.0 }`;

  const userPrompt = `Text:\n${combinedText}`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.SUMMARIZATION,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const sentiment = JSON.parse(response.content);

    return {
      overall: sentiment.overall ?? 0,
      label: sentiment.label ?? "neutral",
      distribution: sentiment.distribution ?? {
        positive: 0,
        neutral: 100,
        negative: 0,
      },
      confidence: sentiment.confidence ?? 0.7,
    };
  } catch (error) {
    console.error("❌ Sentiment detection failed:", error);
    return {
      overall: 0,
      label: "neutral",
      distribution: { positive: 0, neutral: 100, negative: 0 },
      confidence: 0,
    };
  }
}

// =====================================================
// THEME EXTRACTION (STANDALONE)
// =====================================================

/**
 * Extract themes from text responses
 */
export async function categorizeThemes(
  texts: string[],
  maxThemes: number = 10
): Promise<AITheme[]> {
  const validTexts = texts.filter((t) => t && t.trim().length > 0);

  if (validTexts.length === 0) {
    return [];
  }

  const systemPrompt = `Identifică teme recurente în răspunsurile text (limba română).
Returnează JSON array de maxim ${maxThemes} teme:
[
  {
    "name": "Nume temă",
    "score": 0.0-1.0 (relevanță),
    "mentions": număr,
    "keywords": ["lista", "cuvinte"],
    "sentiment": -1.0 to 1.0
  }
]`;

  const userPrompt = `Răspunsuri:\n${validTexts.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.ANALYSIS,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const themes = JSON.parse(response.content);
    return Array.isArray(themes) ? themes.slice(0, maxThemes) : [];
  } catch (error) {
    console.error("❌ Theme extraction failed:", error);
    return [];
  }
}

// =====================================================
// KEY PHRASE EXTRACTION (STANDALONE)
// =====================================================

/**
 * Extract key phrases from text
 */
export async function extractKeyPhrases(
  texts: string[],
  maxPhrases: number = 15
): Promise<string[]> {
  const validTexts = texts.filter((t) => t && t.trim().length > 0);

  if (validTexts.length === 0) {
    return [];
  }

  const systemPrompt = `Extrage maxim ${maxPhrases} fraze cheie din răspunsurile text (limba română).
Returnează JSON array de string-uri: ["frază 1", "frază 2", ...]
Frazele trebuie să fie exacte din text, nu modificate.`;

  const userPrompt = `Răspunsuri:\n${validTexts.join("\n")}`;

  try {
    const response = await chatCompletion({
      ...AI_MODELS.SUMMARIZATION,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const phrases = JSON.parse(response.content);
    return Array.isArray(phrases) ? phrases.slice(0, maxPhrases) : [];
  } catch (error) {
    console.error("❌ Key phrase extraction failed:", error);
    return [];
  }
}

// =====================================================
// QUOTE SELECTION
// =====================================================

/**
 * Select most representative quotes from responses
 */
export function selectTopQuotes(responses: string[], count: number = 5): string[] {
  const validResponses = responses
    .filter((r) => r && r.trim().length > 0)
    .filter((r) => r.length >= 20 && r.length <= 300); // Filter by reasonable length

  if (validResponses.length === 0) {
    return [];
  }

  // Simple heuristic: diversity and medium length
  // Sort by length (prefer medium-length responses)
  const sorted = [...validResponses].sort((a, b) => {
    const aScore = Math.abs(a.length - 100); // Ideal length: ~100 chars
    const bScore = Math.abs(b.length - 100);
    return aScore - bScore;
  });

  // Take diverse quotes (skip similar ones)
  const selected: string[] = [];
  for (const quote of sorted) {
    if (selected.length >= count) break;

    // Check if not too similar to already selected
    const isSimilar = selected.some(
      (s) =>
        s.toLowerCase().includes(quote.toLowerCase().substring(0, 30)) ||
        quote.toLowerCase().includes(s.toLowerCase().substring(0, 30))
    );

    if (!isSimilar) {
      selected.push(quote);
    }
  }

  return selected.slice(0, count);
}

// =====================================================
// WORD FREQUENCY ANALYSIS
// =====================================================

/**
 * Calculate word frequency for word cloud
 */
export function calculateWordFrequency(
  texts: string[],
  topN: number = 20
): { word: string; count: number }[] {
  const validTexts = texts.filter((t) => t && t.trim().length > 0);

  if (validTexts.length === 0) {
    return [];
  }

  // Romanian stop words (extended list)
  const stopWords = new Set([
    "și",
    "de",
    "la",
    "în",
    "cu",
    "pentru",
    "pe",
    "sa",
    "că",
    "este",
    "sunt",
    "un",
    "o",
    "ai",
    "au",
    "din",
    "ce",
    "nu",
    "se",
    "a",
    "am",
    "mă",
    "te",
    "le",
    "lor",
    "mai",
    "dar",
    "sau",
    "foarte",
    "daca",
    "dacă",
    "este",
    "este",
    "fi",
    "fost",
    "avea",
    "avea",
    "fi",
    "fost",
    "ar",
    "ar",
    "poate",
    "poate",
    "către",
    "către",
    "despre",
    "fără",
    "fara",
    "prin",
    "ca",
    "care",
    "acest",
    "această",
    "aceasta",
    "acesta",
  ]);

  // Combine all texts
  const combinedText = validTexts.join(" ").toLowerCase();

  // Extract words (Romanian diacritics preserved)
  const words = combinedText.match(/[a-zăâîșțĂÂÎȘȚ]+/gi) || [];

  // Count frequency
  const frequency = new Map<string, number>();

  for (const word of words) {
    if (word.length <= 3 || stopWords.has(word)) continue; // Skip short words and stop words

    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  // Convert to array and sort
  const sorted = Array.from(frequency.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, topN);
}
