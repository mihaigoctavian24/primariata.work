/**
 * Unit Tests for Correlation Analysis Service
 *
 * Tests for statistical correlation analysis functions including:
 * - Pearson correlation calculation
 * - Correlation matrix generation
 * - Statistical significance testing
 * - Variable extraction and pairing
 * - Insight generation
 */

import { calculateCorrelations, type CorrelationAnalysisInput } from "../correlation-analyzer";
import { Database } from "@/types/database.types";

type SurveyRespondent = Database["public"]["Tables"]["survey_respondents"]["Row"];
type SurveyResponse = Database["public"]["Tables"]["survey_responses"]["Row"];

describe("Correlation Analyzer Service", () => {
  // Sample test data
  const mockRespondents: SurveyRespondent[] = [
    {
      id: "resp1",
      age_category: "18-25",
      county: "București",
      locality: "București",
      respondent_type: "citizen",
      submitted_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "resp2",
      age_category: "26-35",
      county: "Cluj",
      locality: "Cluj-Napoca",
      respondent_type: "citizen",
      submitted_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "resp3",
      age_category: "36-45",
      county: "București",
      locality: "București",
      respondent_type: "citizen",
      submitted_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "resp4",
      age_category: "46-60",
      county: "Cluj",
      locality: "Cluj-Napoca",
      respondent_type: "citizen",
      submitted_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "resp5",
      age_category: "60+",
      county: "Timiș",
      locality: "Timișoara",
      respondent_type: "citizen",
      submitted_at: null,
      created_at: new Date().toISOString(),
    },
  ];

  const mockResponses: SurveyResponse[] = [
    {
      id: 1,
      respondent_id: "resp1",
      question_id: "q3_readiness",
      answer_rating: 5,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      respondent_id: "resp2",
      question_id: "q3_readiness",
      answer_rating: 4,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      respondent_id: "resp3",
      question_id: "q3_readiness",
      answer_rating: 3,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      respondent_id: "resp4",
      question_id: "q1_frequency",
      answer_text: "Zilnic",
      answer_rating: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      respondent_id: "resp5",
      question_id: "q1_frequency",
      answer_text: "Rar",
      answer_rating: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 6,
      respondent_id: "resp4",
      question_id: "q2_usefulness",
      answer_rating: 4,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 7,
      respondent_id: "resp5",
      question_id: "q2_usefulness",
      answer_rating: 2,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
  ];

  // ============================================================================
  // calculateCorrelations Tests
  // ============================================================================

  describe("calculateCorrelations", () => {
    it("should calculate correlations for default pairs", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      expect(result).toHaveProperty("correlations");
      expect(Array.isArray(result.correlations)).toBe(true);
      expect(result).toHaveProperty("keyFindings");
      expect(result).toHaveProperty("recommendations");
    });

    it("should calculate correlations for custom pairs", async () => {
      const customPairs: [string, string][] = [
        ["age_category", "digital_readiness"],
        ["frequency", "usefulness_rating"],
      ];

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        variablePairs: customPairs,
      };

      const result = await calculateCorrelations(input);

      expect(result.correlations.length).toBeGreaterThan(0);
    });

    it("should skip pairs with insufficient data", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents.slice(0, 2), // Only 2 respondents
        responses: [],
      };

      const result = await calculateCorrelations(input);

      // Should handle gracefully even with insufficient data
      expect(result).toBeDefined();
    });

    it("should generate correlation matrix when includeAll is true", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: true,
      };

      const result = await calculateCorrelations(input);

      expect(result.matrix).toBeDefined();
      expect(result.matrix!.variables.length).toBeGreaterThan(0);
      expect(result.matrix!.matrix.length).toBe(result.matrix!.variables.length);
    });

    it("should not generate matrix when includeAll is false", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: false,
      };

      const result = await calculateCorrelations(input);

      expect(result.matrix).toBeUndefined();
    });
  });

  // ============================================================================
  // Correlation Result Validation Tests
  // ============================================================================

  describe("Correlation Result Validation", () => {
    it("should have valid coefficient range", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      result.correlations.forEach((corr) => {
        expect(corr.coefficient).toBeGreaterThanOrEqual(-1);
        expect(corr.coefficient).toBeLessThanOrEqual(1);
      });
    });

    it("should have valid p-value range", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      result.correlations.forEach((corr) => {
        expect(corr.pValue).toBeGreaterThanOrEqual(0);
        expect(corr.pValue).toBeLessThanOrEqual(1);
      });
    });

    it("should determine significance correctly", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      result.correlations.forEach((corr) => {
        if (corr.pValue < 0.05) {
          expect(corr.significant).toBe(true);
        } else {
          expect(corr.significant).toBe(false);
        }
      });
    });

    it("should have valid strength values", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      const validStrengths = ["very_weak", "weak", "moderate", "strong", "very_strong"];

      result.correlations.forEach((corr) => {
        expect(validStrengths).toContain(corr.strength);
      });
    });

    it("should have valid direction values", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      const validDirections = ["positive", "negative", "none"];

      result.correlations.forEach((corr) => {
        expect(validDirections).toContain(corr.direction);
      });
    });

    it("should provide interpretation", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      result.correlations.forEach((corr) => {
        expect(corr.interpretation).toBeDefined();
        expect(typeof corr.interpretation).toBe("string");
        expect(corr.interpretation.length).toBeGreaterThan(0);
      });
    });

    it("should track sample size", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      result.correlations.forEach((corr) => {
        expect(corr.sampleSize).toBeGreaterThan(0);
        expect(corr.sampleSize).toBeLessThanOrEqual(mockRespondents.length);
      });
    });
  });

  // ============================================================================
  // Correlation Matrix Tests
  // ============================================================================

  describe("Correlation Matrix", () => {
    it("should generate square matrix", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: true,
      };

      const result = await calculateCorrelations(input);

      const matrix = result.matrix!;
      expect(matrix.matrix.length).toBe(matrix.variables.length);
      matrix.matrix.forEach((row) => {
        expect(row.length).toBe(matrix.variables.length);
      });
    });

    it("should have perfect correlation on diagonal", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: true,
      };

      const result = await calculateCorrelations(input);

      const matrix = result.matrix!;
      for (let i = 0; i < matrix.variables.length; i++) {
        expect(matrix.matrix[i]![i]).toBe(1.0);
      }
    });

    it("should have symmetric matrix", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: true,
      };

      const result = await calculateCorrelations(input);

      const matrix = result.matrix!;
      for (let i = 0; i < matrix.variables.length; i++) {
        for (let j = 0; j < matrix.variables.length; j++) {
          expect(matrix.matrix[i]![j]).toBe(matrix.matrix[j]![i]);
        }
      }
    });

    it("should have matching p-value dimensions", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: true,
      };

      const result = await calculateCorrelations(input);

      const matrix = result.matrix!;
      expect(matrix.pValues.length).toBe(matrix.matrix.length);
      matrix.pValues.forEach((row) => {
        expect(row.length).toBe(matrix.variables.length);
      });
    });

    it("should have matching sample size dimensions", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        includeAll: true,
      };

      const result = await calculateCorrelations(input);

      const matrix = result.matrix!;
      expect(matrix.sampleSizes.length).toBe(matrix.matrix.length);
      matrix.sampleSizes.forEach((row) => {
        expect(row.length).toBe(matrix.variables.length);
      });
    });
  });

  // ============================================================================
  // Key Findings Tests
  // ============================================================================

  describe("Key Findings", () => {
    it("should extract key findings", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      expect(Array.isArray(result.keyFindings)).toBe(true);
      expect(result.keyFindings.length).toBeGreaterThan(0);
    });

    it("should count significant correlations", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      const significantCount = result.correlations.filter((c) => c.significant).length;
      const findingWithCount = result.keyFindings.some((f) => f.includes(`${significantCount}`));

      expect(findingWithCount).toBe(true);
    });

    it("should identify strongest positive correlation", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      const positiveCorrelations = result.correlations.filter(
        (c) => c.direction === "positive" && c.significant
      );

      if (positiveCorrelations.length > 0) {
        const hasPositiveFinding = result.keyFindings.some((f) => f.includes("pozitivă"));
        expect(hasPositiveFinding).toBe(true);
      }
    });

    it("should identify strongest negative correlation", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      const negativeCorrelations = result.correlations.filter(
        (c) => c.direction === "negative" && c.significant
      );

      if (negativeCorrelations.length > 0) {
        const hasNegativeFinding = result.keyFindings.some((f) => f.includes("negativă"));
        expect(hasNegativeFinding).toBe(true);
      }
    });
  });

  // ============================================================================
  // Recommendations Tests
  // ============================================================================

  describe("Recommendations", () => {
    it("should generate recommendations", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should provide age-related recommendations", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      const hasAgeCorrelations = result.correlations.some(
        (c) => c.variables.includes("age_category") && c.significant
      );

      if (hasAgeCorrelations) {
        const hasAgeRecommendation = result.recommendations.some((r) =>
          r.toLowerCase().includes("vârst")
        );
        expect(hasAgeRecommendation).toBe(true);
      }
    });

    it("should provide actionable recommendations", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await calculateCorrelations(input);

      result.recommendations.forEach((rec) => {
        expect(rec.length).toBeGreaterThan(0);
        expect(typeof rec).toBe("string");
      });
    });
  });

  // ============================================================================
  // Variable Value Extraction Tests
  // ============================================================================

  describe("Variable Value Extraction", () => {
    it("should extract age category values", async () => {
      const pairs: [string, string][] = [["age_category", "digital_readiness"]];

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        variablePairs: pairs,
      };

      const result = await calculateCorrelations(input);

      // Should have correlation result if data exists
      const ageCorr = result.correlations.find((c) => c.variables.includes("age_category"));
      expect(ageCorr).toBeDefined();
    });

    it("should extract frequency values", async () => {
      const pairs: [string, string][] = [["frequency", "usefulness_rating"]];

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        variablePairs: pairs,
      };

      const result = await calculateCorrelations(input);

      const freqCorr = result.correlations.find((c) => c.variables.includes("frequency"));
      expect(freqCorr).toBeDefined();
    });

    it("should handle null values in responses", async () => {
      const responsesWithNull: SurveyResponse[] = [
        {
          id: 1,
          respondent_id: "resp1",
          question_id: "q3_readiness",
          answer_rating: null,
          answer_text: null,
          answer_choices: null,
          created_at: new Date().toISOString(),
        },
      ];

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: responsesWithNull,
      };

      const result = await calculateCorrelations(input);

      // Should handle gracefully
      expect(result).toBeDefined();
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty respondents", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: [],
        responses: [],
      };

      const result = await calculateCorrelations(input);

      expect(result.correlations).toEqual([]);
      expect(result.keyFindings.length).toBeGreaterThan(0);
    });

    it("should handle empty responses", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: [],
      };

      const result = await calculateCorrelations(input);

      expect(result).toBeDefined();
    });

    it("should handle single respondent", async () => {
      const input: CorrelationAnalysisInput = {
        respondents: [mockRespondents[0]!],
        responses: [mockResponses[0]!],
      };

      const result = await calculateCorrelations(input);

      // Should handle gracefully with insufficient data
      expect(result).toBeDefined();
    });

    it("should handle all same values (zero variance)", async () => {
      const sameValueResponses: SurveyResponse[] = mockRespondents.map((r, i) => ({
        id: i,
        respondent_id: r.id,
        question_id: "q3_readiness",
        answer_rating: 5, // All same value
        answer_text: null,
        answer_choices: null,
        created_at: new Date().toISOString(),
      }));

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: sameValueResponses,
      };

      const result = await calculateCorrelations(input);

      // Should handle zero variance gracefully
      expect(result).toBeDefined();
    });

    it("should handle perfect positive correlation", async () => {
      const perfectResponses: SurveyResponse[] = mockRespondents.map((r, i) => ({
        id: i,
        respondent_id: r.id,
        question_id: "q3_readiness",
        answer_rating: i + 1,
        answer_text: null,
        answer_choices: null,
        created_at: new Date().toISOString(),
      }));

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: perfectResponses,
      };

      const result = await calculateCorrelations(input);

      expect(result).toBeDefined();
    });

    it("should handle invalid variable names", async () => {
      const pairs: [string, string][] = [["invalid_var1", "invalid_var2"]];

      const input: CorrelationAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        variablePairs: pairs,
      };

      const result = await calculateCorrelations(input);

      // Should handle gracefully
      expect(result).toBeDefined();
    });
  });
});
