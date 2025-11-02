/**
 * Unit Tests for Cohort Analysis Service
 *
 * Tests for cohort segmentation and analysis functions including:
 * - Age-based cohort definition
 * - Location-based cohort definition
 * - Usage-based cohort definition
 * - Cohort metrics calculation
 * - Cohort comparison
 */

import { analyzeCohorts, type CohortAnalysisInput } from "../cohort-analyzer";
import { Database } from "@/types/database.types";

type SurveyRespondent = Database["public"]["Tables"]["survey_respondents"]["Row"];
type SurveyResponse = Database["public"]["Tables"]["survey_responses"]["Row"];

describe("Cohort Analyzer Service", () => {
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
      question_id: "q1_frequency",
      answer_text: "Zilnic",
      answer_rating: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      respondent_id: "resp2",
      question_id: "q1_frequency",
      answer_text: "Săptămânal",
      answer_rating: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      respondent_id: "resp3",
      question_id: "q1_frequency",
      answer_text: "Lunar",
      answer_rating: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      respondent_id: "resp4",
      question_id: "q3_readiness",
      answer_rating: 4,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      respondent_id: "resp5",
      question_id: "q3_readiness",
      answer_rating: 3,
      answer_text: null,
      answer_choices: null,
      created_at: new Date().toISOString(),
    },
  ];

  // ============================================================================
  // analyzeCohorts Tests
  // ============================================================================

  describe("analyzeCohorts", () => {
    it("should analyze cohorts successfully", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "all",
      };

      const result = await analyzeCohorts(input);

      expect(result).toHaveProperty("cohorts");
      expect(result).toHaveProperty("metrics");
      expect(result).toHaveProperty("comparisons");
      expect(result).toHaveProperty("summary");
    });

    it("should define age cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      expect(result.cohorts.length).toBeGreaterThan(0);
      const hasAgeCohorts = result.cohorts.some((c) =>
        ["young_digitals", "middle_aged", "seniors"].includes(c.id)
      );
      expect(hasAgeCohorts).toBe(true);
    });

    it("should define location cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "location",
      };

      const result = await analyzeCohorts(input);

      expect(result.cohorts.length).toBeGreaterThan(0);
      const hasLocationCohorts = result.cohorts.some((c) => ["urban", "rural"].includes(c.id));
      expect(hasLocationCohorts).toBe(true);
    });

    it("should define usage cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "usage",
      };

      const result = await analyzeCohorts(input);

      expect(result.cohorts.length).toBeGreaterThan(0);
      const hasUsageCohorts = result.cohorts.some((c) =>
        ["frequent_users", "occasional_users", "rare_users"].includes(c.id)
      );
      expect(hasUsageCohorts).toBe(true);
    });

    it("should handle empty respondents", async () => {
      const input: CohortAnalysisInput = {
        respondents: [],
        responses: [],
      };

      const result = await analyzeCohorts(input);

      expect(result.cohorts.length).toBe(0);
      expect(result.metrics.length).toBe(0);
    });

    it("should calculate correct percentages for cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "all",
      };

      const result = await analyzeCohorts(input);

      result.cohorts.forEach((cohort) => {
        expect(cohort.percentage).toBeGreaterThanOrEqual(0);
        expect(cohort.percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  // ============================================================================
  // Cohort Definition Tests
  // ============================================================================

  describe("Cohort Definitions", () => {
    it("should define young digitals cohort correctly", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      const youngCohort = result.cohorts.find((c) => c.id === "young_digitals");
      if (youngCohort) {
        expect(youngCohort.respondentIds.length).toBeGreaterThan(0);
        expect(youngCohort.size).toBe(youngCohort.respondentIds.length);
      }
    });

    it("should define middle aged cohort correctly", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      const middleCohort = result.cohorts.find((c) => c.id === "middle_aged");
      if (middleCohort) {
        expect(middleCohort.respondentIds.length).toBeGreaterThan(0);
      }
    });

    it("should define seniors cohort correctly", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      const seniorsCohort = result.cohorts.find((c) => c.id === "seniors");
      if (seniorsCohort) {
        expect(seniorsCohort.respondentIds.length).toBeGreaterThan(0);
      }
    });

    it("should identify urban cohort", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "location",
      };

      const result = await analyzeCohorts(input);

      const urbanCohort = result.cohorts.find((c) => c.id === "urban");
      if (urbanCohort) {
        expect(urbanCohort.respondentIds.length).toBeGreaterThan(0);
      }
    });

    it("should categorize frequent users", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "usage",
      };

      const result = await analyzeCohorts(input);

      const frequentCohort = result.cohorts.find((c) => c.id === "frequent_users");
      if (frequentCohort) {
        expect(frequentCohort.respondentIds.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // Cohort Metrics Tests
  // ============================================================================

  describe("Cohort Metrics", () => {
    it("should calculate top features for cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      result.metrics.forEach((metric) => {
        expect(metric).toHaveProperty("topFeatures");
        expect(Array.isArray(metric.topFeatures)).toBe(true);
      });
    });

    it("should calculate sentiment for cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      result.metrics.forEach((metric) => {
        expect(metric).toHaveProperty("averageSentiment");
        expect(metric).toHaveProperty("sentimentLabel");
        expect(metric).toHaveProperty("sentimentDistribution");

        expect(metric.averageSentiment).toBeGreaterThanOrEqual(-1);
        expect(metric.averageSentiment).toBeLessThanOrEqual(1);

        expect(["positive", "negative", "neutral", "mixed"]).toContain(metric.sentimentLabel);
      });
    });

    it("should extract pain points for cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      result.metrics.forEach((metric) => {
        expect(metric).toHaveProperty("painPoints");
        expect(Array.isArray(metric.painPoints)).toBe(true);
      });
    });

    it("should calculate digital readiness scores", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      result.metrics.forEach((metric) => {
        expect(metric).toHaveProperty("digitalReadinessScore");
        if (metric.digitalReadinessScore > 0) {
          expect(metric.digitalReadinessScore).toBeGreaterThanOrEqual(1);
          expect(metric.digitalReadinessScore).toBeLessThanOrEqual(5);
        }
      });
    });

    it("should calculate frequency distribution", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      result.metrics.forEach((metric) => {
        expect(metric).toHaveProperty("frequencyDistribution");
        expect(Array.isArray(metric.frequencyDistribution)).toBe(true);
      });
    });
  });

  // ============================================================================
  // Cohort Comparison Tests
  // ============================================================================

  describe("Cohort Comparisons", () => {
    it("should generate comparisons between cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "all",
      };

      const result = await analyzeCohorts(input);

      expect(Array.isArray(result.comparisons)).toBe(true);
    });

    it("should compare feature differences", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      result.comparisons.forEach((comparison) => {
        expect(comparison).toHaveProperty("featureDifferences");
        expect(Array.isArray(comparison.featureDifferences)).toBe(true);
      });
    });

    it("should calculate sentiment differences", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      result.comparisons.forEach((comparison) => {
        expect(comparison).toHaveProperty("sentimentDifference");
        expect(typeof comparison.sentimentDifference).toBe("number");
      });
    });

    it("should calculate readiness differences", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      result.comparisons.forEach((comparison) => {
        expect(comparison).toHaveProperty("readinessDifference");
        expect(typeof comparison.readinessDifference).toBe("number");
      });
    });

    it("should generate insights from comparisons", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      result.comparisons.forEach((comparison) => {
        expect(comparison).toHaveProperty("insights");
        expect(Array.isArray(comparison.insights)).toBe(true);
      });
    });

    it("should generate recommendations from comparisons", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      result.comparisons.forEach((comparison) => {
        expect(comparison).toHaveProperty("recommendations");
        expect(Array.isArray(comparison.recommendations)).toBe(true);
        expect(comparison.recommendations.length).toBeGreaterThan(0);
      });
    });

    it("should identify significant feature differences", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      result.comparisons.forEach((comparison) => {
        comparison.featureDifferences.forEach((diff) => {
          expect(diff).toHaveProperty("significant");
          expect(typeof diff.significant).toBe("boolean");

          // If significant, difference should be > 15%
          if (diff.significant) {
            expect(Math.abs(diff.difference)).toBeGreaterThan(15);
          }
        });
      });
    });
  });

  // ============================================================================
  // Summary Tests
  // ============================================================================

  describe("Summary", () => {
    it("should generate summary with correct total cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      expect(result.summary.totalCohorts).toBe(result.cohorts.length);
    });

    it("should identify largest cohort", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      expect(result.summary.largestCohort).toBeDefined();
      expect(typeof result.summary.largestCohort).toBe("string");
    });

    it("should identify smallest cohort", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      expect(result.summary.smallestCohort).toBeDefined();
      expect(typeof result.summary.smallestCohort).toBe("string");
    });

    it("should identify most engaged cohort", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      expect(result.summary.mostEngaged).toBeDefined();
      expect(typeof result.summary.mostEngaged).toBe("string");
    });

    it("should generate key findings", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      expect(Array.isArray(result.summary.keyFindings)).toBe(true);
      expect(result.summary.keyFindings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle single respondent", async () => {
      const input: CohortAnalysisInput = {
        respondents: [mockRespondents[0]!],
        responses: [mockResponses[0]!],
      };

      const result = await analyzeCohorts(input);

      expect(result).toBeDefined();
      expect(result.cohorts.length).toBeGreaterThan(0);
    });

    it("should handle respondents without responses", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: [],
      };

      const result = await analyzeCohorts(input);

      expect(result).toBeDefined();
    });

    it("should handle missing age categories", async () => {
      const respondentsWithoutAge = [
        {
          id: "resp1",
          age_category: null,
          county: "București",
          locality: "București",
          respondent_type: "citizen",
          submitted_at: null,
          created_at: new Date().toISOString(),
        },
      ];

      const input: CohortAnalysisInput = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        respondents: respondentsWithoutAge as any,
        responses: [],
      };

      const result = await analyzeCohorts(input);

      expect(result).toBeDefined();
    });

    it("should handle missing location data", async () => {
      const respondentsWithoutLocation = mockRespondents.map((r) => ({
        ...r,
        county: "",
        locality: "",
      }));

      const input: CohortAnalysisInput = {
        respondents: respondentsWithoutLocation,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      expect(result).toBeDefined();
    });

    it("should handle all respondents in same cohort", async () => {
      const sameAgeRespondents = mockRespondents.map((r) => ({
        ...r,
        age_category: "18-25" as const,
      }));

      const input: CohortAnalysisInput = {
        respondents: sameAgeRespondents,
        responses: mockResponses,
        cohortType: "age",
      };

      const result = await analyzeCohorts(input);

      expect(result.cohorts.length).toBeGreaterThan(0);
    });

    it("should filter out empty cohorts", async () => {
      const input: CohortAnalysisInput = {
        respondents: mockRespondents,
        responses: mockResponses,
      };

      const result = await analyzeCohorts(input);

      result.cohorts.forEach((cohort) => {
        expect(cohort.size).toBeGreaterThan(0);
        expect(cohort.respondentIds.length).toBeGreaterThan(0);
      });
    });
  });
});
