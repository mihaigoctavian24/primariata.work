/**
 * Unit Tests for Text Analyzer Service
 *
 * Tests for AI-powered text analysis functions including:
 * - Text response analysis
 * - Sentiment detection
 * - Theme categorization
 * - Key phrase extraction
 * - Quote selection
 * - Word frequency calculation
 */

import {
  analyzeTextResponses,
  detectSentiment,
  categorizeThemes,
  extractKeyPhrases,
  selectTopQuotes,
  calculateWordFrequency,
} from "../text-analyzer";
import { chatCompletion } from "../openai-client";
import type { TextAnalysisInput } from "@/types/survey-ai";

// Mock OpenAI client
jest.mock("../openai-client", () => ({
  chatCompletion: jest.fn(),
  AI_MODELS: {
    ANALYSIS: { model: "gpt-4o-mini", temperature: 0.3, maxTokens: 4096 },
    SUMMARIZATION: { model: "gpt-4o-mini", temperature: 0.4, maxTokens: 1024 },
  },
}));

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

describe("Text Analyzer Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // analyzeTextResponses Tests
  // ============================================================================

  describe("analyzeTextResponses", () => {
    const validInput: TextAnalysisInput = {
      questionId: "q5_suggestions",
      questionText: "Ce îmbunătățiri sugerați?",
      respondentType: "citizen",
      responses: [
        "Plăți online ar fi foarte utile",
        "Mai multe notificări prin email",
        "Interfață mai simplă pentru seniori",
      ],
    };

    it("should analyze text responses successfully", async () => {
      const mockResponse = {
        themes: [
          {
            name: "Plăți digitale",
            score: 0.8,
            mentions: 1,
            keywords: ["plăți", "online"],
            sentiment: 0.7,
          },
        ],
        sentiment: {
          overall: 0.5,
          label: "positive",
          distribution: { positive: 60, neutral: 30, negative: 10 },
          confidence: 0.85,
        },
        keyPhrases: ["Plăți online", "notificări email"],
        topQuotes: ["Plăți online ar fi foarte utile"],
        summary: "Cetățenii doresc mai multe funcționalități digitale.",
        wordFrequency: [
          { word: "plăți", count: 3 },
          { word: "online", count: 2 },
        ],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockResponse),
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await analyzeTextResponses(validInput);

      expect(result).toEqual(mockResponse);
      expect(mockChatCompletion).toHaveBeenCalledTimes(1);
      expect(mockChatCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonMode: true,
          userPrompt: expect.stringContaining("Ce îmbunătățiri sugerați?"),
        })
      );
    });

    it("should handle empty responses array", async () => {
      const emptyInput: TextAnalysisInput = {
        ...validInput,
        responses: [],
      };

      const result = await analyzeTextResponses(emptyInput);

      expect(result.themes).toEqual([]);
      expect(result.sentiment.label).toBe("neutral");
      expect(result.summary).toBe("Nu există răspunsuri text pentru această întrebare.");
      expect(mockChatCompletion).not.toHaveBeenCalled();
    });

    it("should filter out empty strings from responses", async () => {
      const inputWithEmptyStrings: TextAnalysisInput = {
        ...validInput,
        responses: ["Valid response", "", "   ", "Another valid response"],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify({
          themes: [],
          sentiment: { overall: 0, label: "neutral", distribution: {}, confidence: 0.7 },
          keyPhrases: [],
          topQuotes: [],
          summary: "Test summary",
          wordFrequency: [],
        }),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      await analyzeTextResponses(inputWithEmptyStrings);

      expect(mockChatCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: expect.not.stringContaining('""'),
        })
      );
    });

    it("should handle API errors gracefully", async () => {
      mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

      const result = await analyzeTextResponses(validInput);

      expect(result.themes).toEqual([]);
      expect(result.sentiment.label).toBe("neutral");
      expect(result.summary).toContain("eșuat");
      expect(result.topQuotes.length).toBeLessThanOrEqual(3);
    });

    it("should handle malformed JSON response", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: "Invalid JSON{",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await analyzeTextResponses(validInput);

      expect(result.themes).toEqual([]);
      expect(result.sentiment.label).toBe("neutral");
    });

    it("should normalize response with missing fields", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify({
          themes: null,
          sentiment: { overall: 0.5 },
        }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await analyzeTextResponses(validInput);

      expect(Array.isArray(result.themes)).toBe(true);
      expect(result.sentiment.overall).toBe(0.5);
      expect(result.sentiment.label).toBe("neutral");
      expect(result.sentiment.confidence).toBe(0.7);
    });

    it("should limit keyPhrases to 15 items", async () => {
      const mockResponseWithManyPhrases = {
        themes: [],
        sentiment: { overall: 0, label: "neutral", distribution: {}, confidence: 0.7 },
        keyPhrases: Array(20).fill("phrase"),
        topQuotes: [],
        summary: "Test",
        wordFrequency: [],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockResponseWithManyPhrases),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await analyzeTextResponses(validInput);

      expect(result.keyPhrases.length).toBe(15);
    });

    it("should limit topQuotes to 5 items", async () => {
      const mockResponseWithManyQuotes = {
        themes: [],
        sentiment: { overall: 0, label: "neutral", distribution: {}, confidence: 0.7 },
        keyPhrases: [],
        topQuotes: Array(10).fill("quote"),
        summary: "Test",
        wordFrequency: [],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockResponseWithManyQuotes),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await analyzeTextResponses(validInput);

      expect(result.topQuotes.length).toBe(5);
    });

    it("should limit wordFrequency to 20 items", async () => {
      const mockResponseWithManyWords = {
        themes: [],
        sentiment: { overall: 0, label: "neutral", distribution: {}, confidence: 0.7 },
        keyPhrases: [],
        topQuotes: [],
        summary: "Test",
        wordFrequency: Array(30)
          .fill(0)
          .map((_, i) => ({ word: `word${i}`, count: i })),
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockResponseWithManyWords),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await analyzeTextResponses(validInput);

      expect(result.wordFrequency.length).toBe(20);
    });
  });

  // ============================================================================
  // detectSentiment Tests
  // ============================================================================

  describe("detectSentiment", () => {
    it("should detect sentiment for single text", async () => {
      const mockSentiment = {
        overall: 0.7,
        label: "positive",
        distribution: { positive: 70, neutral: 20, negative: 10 },
        confidence: 0.9,
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockSentiment),
        usage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await detectSentiment("Serviciul este foarte bun!");

      expect(result).toEqual(mockSentiment);
      expect(mockChatCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonMode: true,
          userPrompt: expect.stringContaining("Serviciul este foarte bun!"),
        })
      );
    });

    it("should detect sentiment for multiple texts", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify({
          overall: -0.3,
          label: "negative",
          distribution: { positive: 10, neutral: 30, negative: 60 },
          confidence: 0.8,
        }),
        usage: { promptTokens: 30, completionTokens: 15, totalTokens: 45 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await detectSentiment(["Text 1", "Text 2", "Text 3"]);

      expect(result.label).toBe("negative");
      expect(result.overall).toBe(-0.3);
    });

    it("should handle sentiment detection errors", async () => {
      mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

      const result = await detectSentiment("Some text");

      expect(result.overall).toBe(0);
      expect(result.label).toBe("neutral");
      expect(result.confidence).toBe(0);
    });
  });

  // ============================================================================
  // categorizeThemes Tests
  // ============================================================================

  describe("categorizeThemes", () => {
    it("should extract themes from texts", async () => {
      const mockThemes = [
        {
          name: "Eficiență",
          score: 0.9,
          mentions: 5,
          keywords: ["rapid", "eficient"],
          sentiment: 0.7,
        },
        {
          name: "Securitate",
          score: 0.7,
          mentions: 3,
          keywords: ["sigur", "protecție"],
          sentiment: 0.5,
        },
      ];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockThemes),
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await categorizeThemes(["Text 1", "Text 2", "Text 3"]);

      expect(result).toEqual(mockThemes);
      expect(result.length).toBe(2);
    });

    it("should return empty array for empty texts", async () => {
      const result = await categorizeThemes([]);

      expect(result).toEqual([]);
      expect(mockChatCompletion).not.toHaveBeenCalled();
    });

    it("should limit themes to maxThemes parameter", async () => {
      const mockThemes = Array(15)
        .fill(0)
        .map((_, i) => ({
          name: `Theme ${i}`,
          score: 0.5,
          mentions: 1,
          keywords: [],
          sentiment: 0,
        }));

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockThemes),
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await categorizeThemes(["Text"], 5);

      expect(result.length).toBe(5);
    });

    it("should handle theme extraction errors", async () => {
      mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

      const result = await categorizeThemes(["Text"]);

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // extractKeyPhrases Tests
  // ============================================================================

  describe("extractKeyPhrases", () => {
    it("should extract key phrases from texts", async () => {
      const mockPhrases = ["plată online", "servicii rapide", "interfață intuitivă"];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockPhrases),
        usage: { promptTokens: 40, completionTokens: 20, totalTokens: 60 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractKeyPhrases(["Text 1", "Text 2"]);

      expect(result).toEqual(mockPhrases);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for empty texts", async () => {
      const result = await extractKeyPhrases([]);

      expect(result).toEqual([]);
      expect(mockChatCompletion).not.toHaveBeenCalled();
    });

    it("should limit phrases to maxPhrases parameter", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(Array(20).fill("phrase")),
        usage: { promptTokens: 40, completionTokens: 20, totalTokens: 60 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractKeyPhrases(["Text"], 10);

      expect(result.length).toBe(10);
    });

    it("should handle extraction errors", async () => {
      mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

      const result = await extractKeyPhrases(["Text"]);

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // selectTopQuotes Tests
  // ============================================================================

  describe("selectTopQuotes", () => {
    it("should select top quotes from responses", () => {
      const responses = [
        "This is a medium length quote that should be selected",
        "Short",
        "This is a very long quote that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on",
        "Another medium length quote that is just right",
        "Yet another good quote for selection",
      ];

      const result = selectTopQuotes(responses, 3);

      expect(result.length).toBeLessThanOrEqual(3);
      expect(result.every((q) => q.length >= 20 && q.length <= 300)).toBe(true);
    });

    it("should return empty array for empty responses", () => {
      const result = selectTopQuotes([]);

      expect(result).toEqual([]);
    });

    it("should filter out very short responses", () => {
      const responses = ["Hi", "Ok", "No"];

      const result = selectTopQuotes(responses);

      expect(result).toEqual([]);
    });

    it("should filter out very long responses", () => {
      const responses = [
        "A".repeat(400), // Too long
        "This is good",
      ];

      const result = selectTopQuotes(responses);

      expect(result).not.toContain("A".repeat(400));
    });

    it("should avoid similar quotes", () => {
      const responses = [
        "Plata online este foarte importanta pentru modernizare",
        "Plata online este esentiala",
        "Notificari prin email sunt necesare",
      ];

      const result = selectTopQuotes(responses, 5);

      // Should not select both similar "Plata online" quotes
      const plataOnlineCount = result.filter((q) => q.includes("Plata online")).length;
      expect(plataOnlineCount).toBeLessThanOrEqual(1);
    });
  });

  // ============================================================================
  // calculateWordFrequency Tests
  // ============================================================================

  describe("calculateWordFrequency", () => {
    it("should calculate word frequency correctly", () => {
      const texts = [
        "Serviciile digitale sunt importante",
        "Digitalizarea serviciilor publice este importantă",
        "Servicii online rapide",
      ];

      const result = calculateWordFrequency(texts, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("word");
      expect(result[0]).toHaveProperty("count");
      expect(result[0]!.count).toBeGreaterThan(0);
    });

    it("should return empty array for empty texts", () => {
      const result = calculateWordFrequency([]);

      expect(result).toEqual([]);
    });

    it("should exclude Romanian stop words", () => {
      const texts = ["și de la în cu pentru pe"];

      const result = calculateWordFrequency(texts);

      expect(result).toEqual([]);
    });

    it("should exclude short words (<=3 chars)", () => {
      const texts = ["ab cd efg hijk lmnop"];

      const result = calculateWordFrequency(texts);

      const shortWords = result.filter((w) => w.word.length <= 3);
      expect(shortWords.length).toBe(0);
    });

    it("should sort by frequency descending", () => {
      const texts = ["servicii servicii servicii plată plată digital"];

      const result = calculateWordFrequency(texts);

      expect(result[0]!.word).toBe("servicii");
      expect(result[0]!.count).toBe(3);
      expect(result[1]!.word).toBe("plată");
      expect(result[1]!.count).toBe(2);
    });

    it("should limit to topN parameter", () => {
      const texts = Array(30)
        .fill(0)
        .map((_, i) => `word${i}`)
        .join(" ");

      const result = calculateWordFrequency([texts], 5);

      expect(result.length).toBe(5);
    });

    it("should handle Romanian diacritics", () => {
      const texts = ["plată implementare îmbunătățire"];

      const result = calculateWordFrequency(texts);

      expect(result.some((w) => w.word === "plată")).toBe(true);
      expect(result.some((w) => w.word === "implementare")).toBe(true);
      expect(result.some((w) => w.word === "îmbunătățire")).toBe(true);
    });

    it("should be case insensitive", () => {
      const texts = ["Servicii SERVICII servicii"];

      const result = calculateWordFrequency(texts);

      expect(result[0]!.word).toBe("servicii");
      expect(result[0]!.count).toBe(3);
    });
  });
});
