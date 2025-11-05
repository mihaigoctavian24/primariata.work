/**
 * Unit Tests for Feature Extraction Service
 *
 * Tests for feature extraction and prioritization functions including:
 * - Feature extraction (explicit and implicit)
 * - Priority matrix calculation
 * - ROI estimation
 * - Feature categorization
 * - Feature merging and deduplication
 */

import { extractFeatures, getTopFeatures, categorizeFeatures } from "../feature-extractor";
import { chatCompletion } from "../openai-client";
import type { FeatureExtractionInput, FeatureRequest } from "@/types/survey-ai";

// Mock OpenAI client
jest.mock("../openai-client");

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

describe("Feature Extractor Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // extractFeatures Tests
  // ============================================================================

  describe("extractFeatures", () => {
    const validInput: FeatureExtractionInput = {
      respondentType: "citizen",
      multipleChoiceData: [
        {
          questionId: "q4_features",
          selectedOptions: ["Plată online", "Plată online", "Notificări SMS", "Plată online"],
          respondentCount: 100,
        },
      ],
      textResponses: [
        {
          questionId: "q5_suggestions",
          responses: [
            "Aș dori să pot plăti online",
            "Notificări prin email ar fi utile",
            "Interfață mai simplă",
          ],
        },
      ],
    };

    it("should extract explicit features from multiple choice", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify([]),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(validInput);

      expect(result.features.length).toBeGreaterThan(0);
      const plataOnline = result.features.find((f) => f.feature === "Plată online");
      expect(plataOnline).toBeDefined();
      expect(plataOnline!.count).toBe(3);
    });

    it("should extract implicit features from text responses", async () => {
      const mockImplicitFeatures = [
        {
          feature: "Plată card",
          description: "Plată cu cardul bancar online",
          priority: "high",
          mentions: 5,
          sentiment: 0.8,
          relatedQuestions: ["q5_suggestions"],
        },
      ];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockImplicitFeatures),
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(validInput);

      expect(mockChatCompletion).toHaveBeenCalled();
      expect(result.features.length).toBeGreaterThan(0);
    });

    it("should merge explicit and implicit features", async () => {
      const mockImplicitFeatures = [
        {
          feature: "Plată online",
          description: "Plată online cu cardul",
          priority: "high",
          mentions: 2,
          sentiment: 0.7,
          relatedQuestions: ["q5_suggestions"],
        },
      ];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockImplicitFeatures),
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(validInput);

      const plataOnline = result.features.find((f) => f.feature.toLowerCase().includes("plat"));
      expect(plataOnline).toBeDefined();
      // Should merge counts from explicit and implicit
      expect(plataOnline!.count).toBeGreaterThan(2);
    });

    it("should calculate priority matrix", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify([]),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(validInput);

      expect(result.priorityMatrix).toBeDefined();
      expect(Array.isArray(result.priorityMatrix)).toBe(true);

      if (result.priorityMatrix.length > 0) {
        const firstItem = result.priorityMatrix[0]!;
        expect(firstItem).toHaveProperty("feature");
        expect(firstItem).toHaveProperty("popularity");
        expect(firstItem).toHaveProperty("aiImportance");
        expect(firstItem).toHaveProperty("sentiment");
        expect(firstItem).toHaveProperty("priority");
        expect(firstItem).toHaveProperty("roi");
      }
    });

    it("should handle empty multiple choice data", async () => {
      const emptyInput: FeatureExtractionInput = {
        respondentType: "citizen",
        multipleChoiceData: [],
        textResponses: [],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify([]),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(emptyInput);

      expect(result.features).toEqual([]);
      expect(result.priorityMatrix).toEqual([]);
    });

    it("should handle empty text responses", async () => {
      const inputWithoutText: FeatureExtractionInput = {
        respondentType: "citizen",
        multipleChoiceData: [
          {
            questionId: "q4_features",
            selectedOptions: ["Plată online"],
            respondentCount: 10,
          },
        ],
        textResponses: [],
      };

      const result = await extractFeatures(inputWithoutText);

      expect(result.features.length).toBeGreaterThan(0);
      expect(mockChatCompletion).not.toHaveBeenCalled();
    });

    it("should filter empty text responses", async () => {
      const inputWithEmptyText: FeatureExtractionInput = {
        respondentType: "citizen",
        multipleChoiceData: [],
        textResponses: [
          {
            questionId: "q5_suggestions",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            responses: ["", "   ", null as any],
          },
        ],
      };

      const result = await extractFeatures(inputWithEmptyText);

      expect(mockChatCompletion).not.toHaveBeenCalled();
      expect(result.features).toHaveLength(0);
    });

    it("should handle API errors for implicit features", async () => {
      mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

      const result = await extractFeatures(validInput);

      // Should still have explicit features even if implicit extraction fails
      expect(result.features.length).toBeGreaterThan(0);
    });

    it("should limit implicit features to 15", async () => {
      const mockManyFeatures = Array(20)
        .fill(0)
        .map((_, i) => ({
          feature: `Feature ${i}`,
          description: `Description ${i}`,
          priority: "medium",
          mentions: 1,
          sentiment: 0.5,
          relatedQuestions: [],
        }));

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockManyFeatures),
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const inputWithTextOnly: FeatureExtractionInput = {
        respondentType: "citizen",
        multipleChoiceData: [],
        textResponses: [
          {
            questionId: "q5_suggestions",
            responses: ["Some text"],
          },
        ],
      };

      const result = await extractFeatures(inputWithTextOnly);

      expect(result.features.length).toBeLessThanOrEqual(15);
    });

    it("should normalize feature names for deduplication", async () => {
      const mockImplicitFeatures = [
        {
          feature: "Plată Online",
          description: "Test",
          priority: "medium",
          mentions: 1,
          sentiment: 0.5,
          relatedQuestions: [],
        },
      ];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockImplicitFeatures),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(validInput);

      // "Plată online" and "Plată Online" should be treated as same feature
      const plataFeatures = result.features.filter((f) =>
        f.feature.toLowerCase().includes("plată online")
      );
      expect(plataFeatures.length).toBeLessThanOrEqual(1);
    });
  });

  // ============================================================================
  // Priority Matrix Calculation Tests
  // ============================================================================

  describe("Priority Matrix Calculation", () => {
    it("should assign high priority to popular features", async () => {
      const input: FeatureExtractionInput = {
        respondentType: "citizen",
        multipleChoiceData: [
          {
            questionId: "q4_features",
            selectedOptions: Array(60).fill("Popular Feature"),
            respondentCount: 100,
          },
        ],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify([]),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await extractFeatures(input);

      const popularFeature = result.priorityMatrix[0];
      expect(popularFeature!.priority).toBe("high");
      expect(popularFeature!.popularity).toBeGreaterThan(50);
    });

    it("should calculate ROI correctly", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify([]),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: FeatureExtractionInput = {
        respondentType: "citizen",
        multipleChoiceData: [
          {
            questionId: "q4_features",
            selectedOptions: ["Notificări Email"],
            respondentCount: 10,
          },
        ],
      };

      const result = await extractFeatures(input);

      const feature = result.priorityMatrix[0];
      expect(feature!.roi).toBeGreaterThanOrEqual(0);
      expect(feature!.roi).toBeLessThanOrEqual(10);
    });

    it("should adjust priority based on negative sentiment", async () => {
      const mockNegativeFeature = [
        {
          feature: "Negative Feature",
          description: "Test",
          priority: "high",
          mentions: 10,
          sentiment: -0.8,
          relatedQuestions: [],
        },
      ];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockNegativeFeature),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: FeatureExtractionInput = {
        respondentType: "citizen",
        textResponses: [
          {
            questionId: "q5_suggestions",
            responses: ["Some text"],
          },
        ],
      };

      const result = await extractFeatures(input);

      const negFeature = result.priorityMatrix.find((f) => f.feature === "Negative Feature");
      // Negative sentiment should lower priority
      expect(negFeature?.priority).not.toBe("high");
    });
  });

  // ============================================================================
  // getTopFeatures Tests
  // ============================================================================

  describe("getTopFeatures", () => {
    const mockFeatures: FeatureRequest[] = [
      {
        feature: "High Priority Feature",
        description: "Test",
        priority: "high",
        count: 10,
        relatedQuestions: [],
        sentiment: 0.8,
      },
      {
        feature: "Medium Priority Feature",
        description: "Test",
        priority: "medium",
        count: 15,
        relatedQuestions: [],
        sentiment: 0.5,
      },
      {
        feature: "Low Priority Feature",
        description: "Test",
        priority: "low",
        count: 20,
        relatedQuestions: [],
        sentiment: 0.2,
      },
    ];

    it("should sort by priority first", () => {
      const result = getTopFeatures(mockFeatures, 10);

      expect(result[0]!.priority).toBe("high");
      expect(result[result.length - 1]!.priority).toBe("low");
    });

    it("should sort by count within same priority", () => {
      const samePriorityFeatures: FeatureRequest[] = [
        {
          feature: "Feature A",
          description: "Test",
          priority: "high",
          count: 5,
          relatedQuestions: [],
          sentiment: 0.5,
        },
        {
          feature: "Feature B",
          description: "Test",
          priority: "high",
          count: 10,
          relatedQuestions: [],
          sentiment: 0.5,
        },
      ];

      const result = getTopFeatures(samePriorityFeatures, 10);

      expect(result[0]!.count).toBeGreaterThan(result[1]!.count);
    });

    it("should limit to count parameter", () => {
      const result = getTopFeatures(mockFeatures, 2);

      expect(result.length).toBe(2);
    });

    it("should handle empty features array", () => {
      const result = getTopFeatures([], 10);

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // categorizeFeatures Tests
  // ============================================================================

  describe("categorizeFeatures", () => {
    const mockFeatures: FeatureRequest[] = [
      {
        feature: "Plată online",
        description: "Test",
        priority: "high",
        count: 10,
        relatedQuestions: [],
        sentiment: 0.8,
      },
      {
        feature: "Notificări SMS",
        description: "Test",
        priority: "medium",
        count: 5,
        relatedQuestions: [],
        sentiment: 0.6,
      },
    ];

    it("should categorize features using AI", async () => {
      const mockCategories = {
        Plăți: ["Plată online"],
        Notificări: ["Notificări SMS"],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockCategories),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await categorizeFeatures(mockFeatures);

      expect(result instanceof Map).toBe(true);
      expect(result.size).toBeGreaterThan(0);
      expect(result.has("Plăți") || result.has("Notificări")).toBe(true);
    });

    it("should return empty map for empty features", async () => {
      const result = await categorizeFeatures([]);

      expect(result instanceof Map).toBe(true);
      expect(result.size).toBe(0);
      expect(mockChatCompletion).not.toHaveBeenCalled();
    });

    it("should handle AI categorization errors", async () => {
      mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

      const result = await categorizeFeatures(mockFeatures);

      expect(result instanceof Map).toBe(true);
      expect(result.has("Toate funcționalitățile")).toBe(true);
      expect(result.get("Toate funcționalitățile")).toEqual(mockFeatures);
    });

    it("should filter out empty categories", async () => {
      const mockCategories = {
        Plăți: ["Plată online"],
        "Empty Category": [],
        Notificări: ["Notificări SMS"],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockCategories),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await categorizeFeatures(mockFeatures);

      expect(result.has("Empty Category")).toBe(false);
    });

    it("should map features correctly to categories", async () => {
      const mockCategories = {
        Plăți: ["Plată online"],
      };

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockCategories),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const result = await categorizeFeatures(mockFeatures);

      const platiCategory = result.get("Plăți");
      expect(platiCategory).toBeDefined();
      expect(platiCategory!.length).toBe(1);
      expect(platiCategory![0]!.feature).toBe("Plată online");
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle malformed AI responses", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: "Invalid JSON{",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: FeatureExtractionInput = {
        respondentType: "citizen",
        textResponses: [
          {
            questionId: "q5_suggestions",
            responses: ["Text"],
          },
        ],
      };

      const result = await extractFeatures(input);

      expect(result.features).toBeDefined();
      expect(Array.isArray(result.features)).toBe(true);
    });

    it("should handle null/undefined in AI response", async () => {
      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(null),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: FeatureExtractionInput = {
        respondentType: "citizen",
        textResponses: [
          {
            questionId: "q5_suggestions",
            responses: ["Text"],
          },
        ],
      };

      const result = await extractFeatures(input);

      expect(result.features).toEqual([]);
    });

    it("should handle features with missing fields", async () => {
      const mockIncompleteFeatures = [
        {
          feature: "Test Feature",
          // Missing other required fields
        },
      ];

      mockChatCompletion.mockResolvedValueOnce({
        content: JSON.stringify(mockIncompleteFeatures),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: FeatureExtractionInput = {
        respondentType: "citizen",
        textResponses: [
          {
            questionId: "q5_suggestions",
            responses: ["Text"],
          },
        ],
      };

      const result = await extractFeatures(input);

      expect(result.features.length).toBeGreaterThan(0);
      const feature = result.features[0]!;
      expect(feature.feature).toBeDefined();
      expect(feature.description).toBeDefined();
      expect(feature.priority).toBeDefined();
    });
  });
});
