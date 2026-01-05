/**
 * Unit Tests for Demographic Analysis Service
 *
 * Tests for demographic analysis and statistical functions including:
 * - Age distribution calculation
 * - Geographic spread analysis
 * - Cross-tabulations
 * - Statistical correlations
 * - Chi-square tests
 */

import {
  analyzeDemographics,
  chiSquareTest,
  calculateExpectedFrequencies,
} from "../demographic-analyzer";
import { chatCompletion } from "../openai-client";
import type { DemographicAnalysisInput } from "@/types/survey-ai";

// Mock OpenAI client
jest.mock("../openai-client");

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

describe("Demographic Analyzer Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Sample test data
  const mockRespondents: DemographicAnalysisInput["respondents"] = [
    {
      id: "resp1",
      ageCategory: "18-25",
      county: "București",
      locality: "București",
    },
    {
      id: "resp2",
      ageCategory: "26-35",
      county: "Cluj",
      locality: "Cluj-Napoca",
    },
    {
      id: "resp3",
      ageCategory: "36-45",
      county: "București",
      locality: "Sector 1",
    },
    {
      id: "resp4",
      ageCategory: "46-60",
      county: "Cluj",
      locality: "Cluj-Napoca",
    },
    {
      id: "resp5",
      ageCategory: "60+",
      county: "Timiș",
      locality: "Timișoara",
    },
  ];

  const mockResponses: DemographicAnalysisInput["responses"] = [
    {
      respondentId: "resp1",
      questionId: "q3_readiness",
      answerRating: 5,
    },
    {
      respondentId: "resp2",
      questionId: "q3_readiness",
      answerRating: 4,
    },
    {
      respondentId: "resp3",
      questionId: "q3_readiness",
      answerRating: 3,
    },
    {
      respondentId: "resp4",
      questionId: "q4_features",
      answerChoices: ["Plată online", "Notificări SMS"],
    },
    {
      respondentId: "resp5",
      questionId: "q4_features",
      answerChoices: ["Plată online"],
    },
  ];

  // ============================================================================
  // analyzeDemographics Tests
  // ============================================================================

  describe("analyzeDemographics", () => {
    it("should analyze demographics successfully", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({
          interpretation: "Test interpretation",
        }),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      expect(result).toHaveProperty("ageDistribution");
      expect(result).toHaveProperty("geographicSpread");
      expect(result).toHaveProperty("crossTabs");
      expect(result).toHaveProperty("correlations");
    });

    it("should handle empty respondents", async () => {
      const input: DemographicAnalysisInput = {
        respondents: [],
        responses: [],
      };

      const result = await analyzeDemographics(input);

      expect(result.ageDistribution).toEqual([]);
      expect(result.geographicSpread).toEqual([]);
    });
  });

  // ============================================================================
  // Age Distribution Tests
  // ============================================================================

  describe("Age Distribution", () => {
    it("should calculate age distribution correctly", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: [],
      };

      const result = await analyzeDemographics(input);

      expect(result.ageDistribution.length).toBeGreaterThan(0);
      expect(result.ageDistribution[0]).toHaveProperty("category");
      expect(result.ageDistribution[0]).toHaveProperty("count");
      expect(result.ageDistribution[0]).toHaveProperty("percentage");
    });

    it("should calculate correct percentages", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: [],
      };

      const result = await analyzeDemographics(input);

      const totalPercentage = result.ageDistribution.reduce(
        (sum, item) => sum + item.percentage,
        0
      );
      expect(Math.round(totalPercentage)).toBe(100);
    });

    it("should sort age categories correctly", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: [],
      };

      const result = await analyzeDemographics(input);

      const order = ["18-25", "26-35", "36-45", "46-60", "60+"];
      const resultOrder = result.ageDistribution.map((d) => d.category);

      expect(resultOrder.filter((c) => order.includes(c))).toEqual(
        resultOrder
          .filter((c) => order.includes(c))
          .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      );
    });

    it("should handle missing age categories", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const respondentsWithoutAge = [
        { id: "resp1", ageCategory: undefined, county: "București", locality: "București" },
      ];

      const input: DemographicAnalysisInput = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        respondents: respondentsWithoutAge as any,
        responses: [],
      };

      const result = await analyzeDemographics(input);

      const necunoscutCategory = result.ageDistribution.find((d) => d.category === "Necunoscut");
      expect(necunoscutCategory).toBeDefined();
    });
  });

  // ============================================================================
  // Geographic Spread Tests
  // ============================================================================

  describe("Geographic Spread", () => {
    it("should calculate geographic spread", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      expect(result.geographicSpread.length).toBeGreaterThan(0);
      expect(result.geographicSpread[0]).toHaveProperty("county");
      expect(result.geographicSpread[0]).toHaveProperty("localities");
      expect(result.geographicSpread[0]).toHaveProperty("responses");
    });

    it("should count unique localities per county", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      const bucuresti = result.geographicSpread.find((g) => g.county === "București");
      expect(bucuresti).toBeDefined();
      expect(bucuresti!.localities).toBeGreaterThan(0);
    });

    it("should sort by response count descending", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      for (let i = 0; i < result.geographicSpread.length - 1; i++) {
        expect(result.geographicSpread[i]!.responses).toBeGreaterThanOrEqual(
          result.geographicSpread[i + 1]!.responses
        );
      }
    });

    it("should calculate sentiment per county", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      const countiesWithSentiment = result.geographicSpread.filter(
        (g) => g.sentiment !== undefined
      );
      expect(countiesWithSentiment.length).toBeGreaterThan(0);

      countiesWithSentiment.forEach((county) => {
        expect(county.sentiment).toBeGreaterThanOrEqual(-1);
        expect(county.sentiment).toBeLessThanOrEqual(1);
      });
    });
  });

  // ============================================================================
  // Cross-Tabulations Tests
  // ============================================================================

  describe("Cross-Tabulations", () => {
    it("should generate age x features cross-tabs", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      expect(result.crossTabs).toHaveProperty("ageXFeatures");
      expect(Array.isArray(result.crossTabs.ageXFeatures)).toBe(true);
    });

    it("should generate location x readiness cross-tabs", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      expect(result.crossTabs).toHaveProperty("locationXReadiness");
      expect(Array.isArray(result.crossTabs.locationXReadiness)).toBe(true);
    });

    it("should limit age x features to top 50", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const manyResponses = Array(100)
        .fill(0)
        .map((_, i) => ({
          respondentId: `resp${i}`,
          questionId: "q4_features",
          answerChoices: [`Feature ${i}`],
        }));

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responses: manyResponses as any,
      };

      const result = await analyzeDemographics(input);

      expect(result.crossTabs.ageXFeatures.length).toBeLessThanOrEqual(50);
    });

    it("should calculate readiness scores correctly", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      result.crossTabs.locationXReadiness.forEach((item) => {
        expect(item.readinessScore).toBeGreaterThanOrEqual(1);
        expect(item.readinessScore).toBeLessThanOrEqual(5);
      });
    });
  });

  // ============================================================================
  // Statistical Correlations Tests
  // ============================================================================

  describe("Statistical Correlations", () => {
    it("should identify correlations", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({
          interpretation: "Strong positive correlation between age and digital readiness.",
        }),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      expect(Array.isArray(result.correlations)).toBe(true);
    });

    it("should calculate correlation coefficients", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      result.correlations.forEach((corr) => {
        expect(corr.coefficient).toBeGreaterThanOrEqual(-1);
        expect(corr.coefficient).toBeLessThanOrEqual(1);
      });
    });

    it("should calculate p-values", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      result.correlations.forEach((corr) => {
        expect(corr.pValue).toBeGreaterThanOrEqual(0);
        expect(corr.pValue).toBeLessThanOrEqual(1);
      });
    });

    it("should determine statistical significance", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      result.correlations.forEach((corr) => {
        if (corr.pValue < 0.05) {
          expect(corr.significant).toBe(true);
        } else {
          expect(corr.significant).toBe(false);
        }
      });
    });

    it("should provide interpretations", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({
          interpretation: "Correlation interpretation text",
        }),
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      result.correlations.forEach((corr) => {
        expect(corr.interpretation).toBeDefined();
        expect(typeof corr.interpretation).toBe("string");
        expect(corr.interpretation.length).toBeGreaterThan(0);
      });
    });

    it("should handle AI interpretation errors", async () => {
      // Suppress console.error for this test to avoid CI failures
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockChatCompletion.mockRejectedValue(new Error("API Error"));

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      // Should still have correlations with fallback interpretations
      result.correlations.forEach((corr) => {
        expect(corr.interpretation).toBeDefined();
      });

      // Verify console.error was called (but suppressed)
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ============================================================================
  // Chi-Square Test Tests
  // ============================================================================

  describe("chiSquareTest", () => {
    it("should calculate chi-square statistic", () => {
      const observed = [
        [10, 20, 30],
        [15, 25, 35],
      ];
      const expected = [
        [12, 22, 32],
        [13, 23, 33],
      ];

      const result = chiSquareTest(observed, expected);

      expect(result).toHaveProperty("chiSquare");
      expect(result.chiSquare).toBeGreaterThanOrEqual(0);
    });

    it("should calculate p-value", () => {
      const observed = [
        [10, 20],
        [15, 25],
      ];
      const expected = [
        [12, 22],
        [13, 23],
      ];

      const result = chiSquareTest(observed, expected);

      expect(result).toHaveProperty("pValue");
      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
    });

    it("should determine significance", () => {
      const observed = [
        [10, 20],
        [30, 40],
      ];
      const expected = [
        [15, 15],
        [35, 35],
      ];

      const result = chiSquareTest(observed, expected);

      expect(result).toHaveProperty("significant");
      expect(typeof result.significant).toBe("boolean");
    });

    it("should handle zero expected values", () => {
      const observed = [
        [10, 20],
        [15, 25],
      ];
      const expected = [
        [0, 0],
        [0, 0],
      ];

      const result = chiSquareTest(observed, expected);

      expect(result.chiSquare).toBe(0);
    });

    it("should handle empty arrays", () => {
      const result = chiSquareTest([], []);

      expect(result.chiSquare).toBeDefined();
    });
  });

  // ============================================================================
  // calculateExpectedFrequencies Tests
  // ============================================================================

  describe("calculateExpectedFrequencies", () => {
    it("should calculate expected frequencies", () => {
      const observed = [
        [10, 20, 30],
        [15, 25, 35],
      ];

      const result = calculateExpectedFrequencies(observed);

      expect(result.length).toBe(observed.length);
      expect(result[0]?.length).toBe(observed[0]?.length);
    });

    it("should sum to row and column totals", () => {
      const observed = [
        [10, 20],
        [30, 40],
      ];

      const expected = calculateExpectedFrequencies(observed);

      const observedRowSum = observed[0]!.reduce((sum, val) => sum + val, 0);
      const expectedRowSum = expected[0]!.reduce((sum, val) => sum + val, 0);

      expect(Math.round(expectedRowSum)).toBe(observedRowSum);
    });

    it("should handle empty arrays", () => {
      const result = calculateExpectedFrequencies([]);

      expect(result).toEqual([]);
    });

    it("should handle arrays with single value", () => {
      const observed = [[10]];

      const result = calculateExpectedFrequencies(observed);

      expect(result[0]![0]).toBe(10);
    });

    it("should return zeros for zero grand total", () => {
      const observed = [
        [0, 0],
        [0, 0],
      ];

      const result = calculateExpectedFrequencies(observed);

      result.forEach((row) => {
        row.forEach((val) => {
          expect(val).toBe(0);
        });
      });
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle respondents without responses", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: [],
      };

      const result = await analyzeDemographics(input);

      expect(result).toBeDefined();
      expect(result.ageDistribution.length).toBeGreaterThan(0);
    });

    it("should handle malformed JSON from AI", async () => {
      mockChatCompletion.mockResolvedValue({
        content: "Invalid JSON{",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const input: DemographicAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeDemographics(input);

      expect(result).toBeDefined();
      expect(Array.isArray(result.correlations)).toBe(true);
    });

    it("should handle insufficient data for correlations", async () => {
      mockChatCompletion.mockResolvedValue({
        content: JSON.stringify({ interpretation: "Test" }),
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: "gpt-4o-mini",
        finishReason: "stop",
      });

      const minimalRespondents = [mockRespondents[0]!];
      const minimalResponses = [mockResponses[0]!];

      const input: DemographicAnalysisInput = {
        respondents: minimalRespondents,
        responses: minimalResponses,
      };

      const result = await analyzeDemographics(input);

      expect(result).toBeDefined();
    });
  });
});
