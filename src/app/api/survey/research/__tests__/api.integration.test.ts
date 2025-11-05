/**
 * Research API Integration Tests
 *
 * Comprehensive integration tests for all 10 research API routes:
 * 1. POST /api/survey/research/analyze - Trigger AI analysis
 * 2. GET /api/survey/research/analyze - Check analysis status
 * 3. GET /api/survey/research/insights - List insights with filters
 * 4. GET /api/survey/research/holistic-insights - Get holistic insights
 * 5. GET /api/survey/research/question-analysis - Get question analysis
 * 6. GET /api/survey/research/correlations - Get correlations
 * 7. GET /api/survey/research/cohorts - Get cohort analysis
 * 8. GET /api/survey/research/export/csv - Export to CSV
 * 9. GET /api/survey/research/export/excel - Export to Excel
 * 10. GET /api/survey/research/export/pdf - Export to PDF
 * 11. GET /api/survey/research/export/json - Export to JSON
 */

import { NextRequest } from "next/server";
import { POST as analyzePost, GET as analyzeGet } from "../analyze/route";
import { GET as insightsGet, DELETE as insightsDelete } from "../insights/route";
import { GET as holisticInsightsGet } from "../holistic-insights/route";
import { GET as questionAnalysisGet } from "../question-analysis/route";
import { GET as correlationsGet } from "../correlations/route";
import { GET as cohortsGet } from "../cohorts/route";
import { GET as csvExportGet } from "../export/csv/route";
import { GET as excelExportGet } from "../export/excel/route";
import { GET as pdfExportGet } from "../export/pdf/route";
import { GET as jsonExportGet } from "../export/json/route";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/ai/insight-generator");
jest.mock("@/lib/ai/correlation-analyzer");
jest.mock("@/lib/ai/cohort-analyzer");

import { createClient } from "@/lib/supabase/server";
import { generateHolisticInsights } from "@/lib/ai/insight-generator";
import { calculateCorrelations } from "@/lib/ai/correlation-analyzer";
import { analyzeCohorts } from "@/lib/ai/cohort-analyzer";

// Type mocks
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockGenerateHolisticInsights = generateHolisticInsights as jest.MockedFunction<
  typeof generateHolisticInsights
>;
const mockCalculateCorrelations = calculateCorrelations as jest.MockedFunction<
  typeof calculateCorrelations
>;
const mockAnalyzeCohorts = analyzeCohorts as jest.MockedFunction<typeof analyzeCohorts>;

// Mock data fixtures
const mockUser = {
  id: "user-123",
  email: "admin@test.com",
  aud: "authenticated",
  role: "authenticated",
};

const mockAdminProfile = {
  id: "user-123",
  rol: "admin",
};

const mockSuperAdminProfile = {
  id: "user-123",
  rol: "super_admin",
};

const mockRespondents = [
  {
    id: "resp-1",
    respondent_type: "citizen",
    county: "Bucuresti",
    locality: "Sector 1",
    age_category: "25-34",
    created_at: "2024-01-01T00:00:00Z",
    completed_at: "2024-01-01T01:00:00Z",
  },
  {
    id: "resp-2",
    respondent_type: "official",
    county: "Cluj",
    locality: "Cluj-Napoca",
    department: "IT",
    created_at: "2024-01-02T00:00:00Z",
    completed_at: "2024-01-02T01:00:00Z",
  },
];

const mockResponses = [
  {
    id: "response-1",
    respondent_id: "resp-1",
    question_id: "q1",
    answer_text: "Test answer 1",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "response-2",
    respondent_id: "resp-2",
    question_id: "q2",
    answer_rating: 5,
    created_at: "2024-01-02T00:00:00Z",
  },
];

const mockQuestions = [
  {
    id: "q1",
    question_text: "Test question 1",
    question_type: "text",
    question_number: 1,
    survey_type: "citizen",
    order_index: 1,
  },
  {
    id: "q2",
    question_text: "Test question 2",
    question_type: "rating",
    question_number: 2,
    survey_type: "official",
    order_index: 2,
  },
];

const mockHolisticInsight = {
  surveyType: "citizen" as const,
  keyThemes: [
    {
      theme: "Digital Services",
      score: 0.8,
      mentions: 5,
      sentiment: 0.7,
    },
  ],
  sentimentScore: 0.6,
  sentimentLabel: "positive" as const,
  recommendations: ["Improve UI", "Add notifications"],
  featureRequests: ["Online payments", "Mobile app"],
  aiSummary: "Users want more digital features",
  totalQuestions: 10,
  totalResponses: 50,
  modelVersion: "gpt-4o-mini",
  promptTokens: 100,
  completionTokens: 50,
  confidenceScore: 0.85,
};

const mockCorrelationResult = {
  correlations: [
    {
      variable1: "age",
      variable2: "usage",
      coefficient: 0.7,
      significant: true,
      pValue: 0.01,
    },
  ],
  matrix: [
    [1, 0.7],
    [0.7, 1],
  ],
  keyFindings: ["Age correlates with usage"],
  recommendations: ["Target younger users"],
};

const mockCohortResult = {
  cohorts: [
    {
      name: "Young users",
      size: 20,
      characteristics: { ageRange: "18-25" },
    },
  ],
  metrics: { avgSatisfaction: 4.5 },
  comparisons: [{ cohort1: "Young", cohort2: "Old", difference: 0.5 }],
  summary: { totalCohorts: 2 },
};

// Helper function to create mock Supabase client
const createMockSupabaseClient = (overrides = {}) => {
  const defaultMock = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  };

  return { ...defaultMock, ...overrides };
};

// Helper to create NextRequest with proper URL and params
const createMockRequest = (
  url: string,
  options: {
    method?: string;
    body?: unknown;
    searchParams?: Record<string, string>;
  } = {}
) => {
  const { method = "GET", body, searchParams = {} } = options;

  const urlObj = new URL(url, "http://localhost:3000");
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const request = new NextRequest(urlObj.toString(), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return request;
};

describe("Research API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // 1. POST /api/survey/research/analyze - Trigger AI analysis
  // ============================================================================

  describe("POST /api/survey/research/analyze", () => {
    it("should trigger AI analysis successfully for all survey types", async () => {
      const mockClient = createMockSupabaseClient();

      // Setup auth
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        if (table === "survey_analysis_cache") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockRespondents, error: null }),
          };
        }
        if (table === "survey_responses") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockResponses, error: null }),
          };
        }
        if (table === "survey_questions") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
          };
        }
        if (table === "survey_holistic_insights") {
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "survey_research_metadata") {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "survey_correlation_analysis") {
          return {
            delete: jest.fn().mockReturnThis(),
            neq: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "survey_cohort_analysis") {
          return {
            delete: jest.fn().mockReturnThis(),
            neq: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          upsert: jest.fn().mockResolvedValue({ error: null }),
        };
      });

      mockCreateClient.mockResolvedValue(mockClient as never);
      mockGenerateHolisticInsights.mockResolvedValue(mockHolisticInsight);
      mockCalculateCorrelations.mockResolvedValue(mockCorrelationResult as never);
      mockAnalyzeCohorts.mockResolvedValue(mockCohortResult as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
        body: {},
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.holisticInsights).toBeDefined();
      expect(data.analysisId).toBeDefined();
      expect(mockGenerateHolisticInsights).toHaveBeenCalled();
    });

    it("should return 401 if user is not authenticated", async () => {
      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: jest
            .fn()
            .mockResolvedValue({ data: { user: null }, error: new Error("Unauthorized") }),
        },
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not admin", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { rol: "user" }, error: null }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("Admin access required");
    });

    it("should return cached results when available", async () => {
      const cachedResult = {
        holisticInsights: [mockHolisticInsight],
        analysisId: "cached-123",
      };

      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        if (table === "survey_analysis_cache") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { cache_key: "test", result: cachedResult },
              error: null,
            }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cached).toBe(true);
      expect(data.holisticInsights).toBeDefined();
      expect(mockGenerateHolisticInsights).not.toHaveBeenCalled();
    });

    it("should return 400 if no respondents found", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        if (table === "survey_analysis_cache") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("No respondents found");
    });

    it("should handle database errors gracefully", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        if (table === "survey_analysis_cache") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Database error");
    });

    it("should filter by respondent type when specified", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        if (table === "survey_analysis_cache") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockRespondents.filter((r) => r.respondent_type === "citizen"),
              error: null,
            }),
          };
        }
        if (table === "survey_responses") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockResponses, error: null }),
          };
        }
        if (table === "survey_questions") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
          };
        }
        if (table === "survey_holistic_insights") {
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "survey_research_metadata") {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "survey_correlation_analysis") {
          return {
            delete: jest.fn().mockReturnThis(),
            neq: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "survey_cohort_analysis") {
          return {
            delete: jest.fn().mockReturnThis(),
            neq: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          upsert: jest.fn().mockResolvedValue({ error: null }),
        };
      });

      mockCreateClient.mockResolvedValue(mockClient as never);
      mockGenerateHolisticInsights.mockResolvedValue(mockHolisticInsight);
      mockCalculateCorrelations.mockResolvedValue(mockCorrelationResult as never);
      mockAnalyzeCohorts.mockResolvedValue(mockCohortResult as never);

      const request = createMockRequest("/api/survey/research/analyze", {
        method: "POST",
        body: { respondentType: "citizen" },
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================================================
  // 2. GET /api/survey/research/analyze - Check analysis status
  // ============================================================================

  describe("GET /api/survey/research/analyze", () => {
    it("should return latest analysis metadata", async () => {
      const mockMetadata = {
        analysis_id: "analysis-123",
        total_responses: 100,
        generated_at: "2024-01-01T00:00:00Z",
      };

      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockMetadata, error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await analyzeGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe("complete");
      expect(data.lastAnalysis).toEqual(mockMetadata);
    });

    it("should return no_analysis status when no metadata exists", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await analyzeGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("no_analysis");
    });

    it("should handle database errors", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error("DB Error")),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await analyzeGet();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  // ============================================================================
  // 3. GET /api/survey/research/insights - List insights with filters
  // ============================================================================

  describe("GET /api/survey/research/insights", () => {
    it("should fetch insights with pagination", async () => {
      const mockInsights = [
        { id: "1", survey_type: "citizen", sentiment_score: 0.7 },
        { id: "2", survey_type: "official", sentiment_score: 0.5 },
      ];

      const mockClient = createMockSupabaseClient();
      mockClient.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      };
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: mockInsights,
            error: null,
            count: 2,
          }),
        };
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/insights", {
        searchParams: { limit: "10", offset: "0" },
      });

      const response = await insightsGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.insights).toEqual(mockInsights);
      expect(data.pagination).toBeDefined();
    });

    it("should filter by respondent type", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      };
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        };
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/insights", {
        searchParams: { respondentType: "citizen" },
      });

      const response = await insightsGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 401 for unauthenticated users", async () => {
      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: jest
            .fn()
            .mockResolvedValue({ data: { user: null }, error: new Error("Unauthorized") }),
        },
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/insights");
      const response = await insightsGet(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  // ============================================================================
  // 4. GET /api/survey/research/holistic-insights
  // ============================================================================

  describe("GET /api/survey/research/holistic-insights", () => {
    it("should fetch holistic insights for all survey types", async () => {
      const mockInsights = [
        {
          id: "1",
          survey_type: "citizen",
          key_themes: [],
          sentiment_score: 0.7,
          generated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockInsights, error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/holistic-insights");
      const response = await holisticInsightsGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.insights).toEqual(mockInsights);
    });

    it("should filter by survey type", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/holistic-insights", {
        searchParams: { surveyType: "citizen" },
      });

      const response = await holisticInsightsGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.insights).toEqual([]);
    });

    it("should handle database errors", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "DB Error" },
        }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const request = createMockRequest("/api/survey/research/holistic-insights");
      const response = await holisticInsightsGet(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("DB Error");
    });
  });

  // ============================================================================
  // 5. GET /api/survey/research/question-analysis
  // ============================================================================

  describe("GET /api/survey/research/question-analysis", () => {
    it("should return question analysis for all questions", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "survey_questions") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
          };
        }
        if (table === "survey_responses") {
          return {
            select: jest.fn().mockResolvedValue({ data: mockResponses, error: null }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await questionAnalysisGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.citizenInsights).toBeDefined();
      expect(data.officialInsights).toBeDefined();
    });

    it("should handle questions fetch errors", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Questions error" },
        }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await questionAnalysisGet();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Questions error");
    });
  });

  // ============================================================================
  // 6. GET /api/survey/research/correlations
  // ============================================================================

  describe("GET /api/survey/research/correlations", () => {
    it("should return cached correlations if available", async () => {
      const cachedData = {
        correlations: mockCorrelationResult.correlations,
        key_findings: mockCorrelationResult.keyFindings,
        recommendations: mockCorrelationResult.recommendations,
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: cachedData, error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await correlationsGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cached).toBe(true);
      expect(data.correlations).toEqual(cachedData.correlations);
    });

    it("should calculate fresh correlations when cache is empty", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "survey_correlation_analysis") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockResolvedValue({ data: mockRespondents, error: null }),
          };
        }
        if (table === "survey_responses") {
          return {
            select: jest.fn().mockResolvedValue({ data: mockResponses, error: null }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);
      mockCalculateCorrelations.mockResolvedValue(mockCorrelationResult as never);

      const response = await correlationsGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.correlations).toBeDefined();
      expect(mockCalculateCorrelations).toHaveBeenCalled();
    });

    it("should handle empty respondents gracefully", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "survey_correlation_analysis") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await correlationsGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.correlations).toEqual([]);
    });
  });

  // ============================================================================
  // 7. GET /api/survey/research/cohorts
  // ============================================================================

  describe("GET /api/survey/research/cohorts", () => {
    it("should return cached cohorts if available", async () => {
      const cachedData = {
        cohorts: mockCohortResult.cohorts,
        metrics: mockCohortResult.metrics,
        comparisons: mockCohortResult.comparisons,
        summary: mockCohortResult.summary,
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: cachedData, error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await cohortsGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cached).toBe(true);
      expect(data.cohorts).toEqual(cachedData.cohorts);
    });

    it("should calculate fresh cohorts when cache is empty", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.from = jest.fn((table: string) => {
        if (table === "survey_cohort_analysis") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockResolvedValue({ data: mockRespondents, error: null }),
          };
        }
        if (table === "survey_responses") {
          return {
            select: jest.fn().mockResolvedValue({ data: mockResponses, error: null }),
          };
        }
        return mockClient.from(table);
      });

      mockCreateClient.mockResolvedValue(mockClient as never);
      mockAnalyzeCohorts.mockResolvedValue(mockCohortResult as never);

      const response = await cohortsGet();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cohorts).toBeDefined();
      expect(mockAnalyzeCohorts).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // 8-11. Export Routes (CSV, Excel, PDF, JSON)
  // ============================================================================

  describe("Export Routes", () => {
    const setupMockClientForExports = () => {
      const mockClient = createMockSupabaseClient();
      mockClient.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      };
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
          };
        }
        if (table === "survey_respondents") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockRespondents, error: null }),
          };
        }
        if (table === "survey_holistic_insights") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        if (table === "survey_responses") {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockResponses, error: null }),
          };
        }
        return mockClient.from(table);
      });
      return mockClient;
    };

    describe("GET /api/survey/research/export/csv", () => {
      it("should export CSV successfully", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/csv");
        const response = await csvExportGet(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain("text/csv");
        expect(response.headers.get("Content-Disposition")).toContain("attachment");

        const text = await response.text();
        expect(text).toContain("ID");
        expect(text).toContain("Tip");
      });

      it("should filter by respondent type", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/csv", {
          searchParams: { respondent_type: "citizen" },
        });

        const response = await csvExportGet(request);
        expect(response.status).toBe(200);
      });

      it("should return 401 for unauthenticated users", async () => {
        const mockClient = createMockSupabaseClient({
          auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
          },
        });
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/csv");
        const response = await csvExportGet(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Unauthorized");
      });

      it("should return 403 for non-admin users", async () => {
        const mockClient = createMockSupabaseClient();
        mockClient.auth = {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        };
        mockClient.from = jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { rol: "user" }, error: null }),
        }));
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/csv");
        const response = await csvExportGet(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe("Forbidden");
      });
    });

    describe("GET /api/survey/research/export/excel", () => {
      it("should export Excel successfully", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/excel");
        const response = await excelExportGet(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain("spreadsheetml");
        expect(response.headers.get("Content-Disposition")).toContain("attachment");
      });

      it("should include raw data when requested", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/excel", {
          searchParams: { include_raw_data: "true" },
        });

        const response = await excelExportGet(request);
        expect(response.status).toBe(200);
      });
    });

    describe("GET /api/survey/research/export/pdf", () => {
      it("should export PDF successfully", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/pdf");
        const response = await pdfExportGet(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain("application/pdf");
        expect(response.headers.get("Content-Disposition")).toContain("attachment");
      });
    });

    describe("GET /api/survey/research/export/json", () => {
      it("should export JSON successfully", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/json");
        const response = await jsonExportGet(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain("application/json");

        const text = await response.text();
        const data = JSON.parse(text);
        expect(data.metadata).toBeDefined();
        expect(data.respondents).toBeDefined();
      });

      it("should include metadata summary", async () => {
        const mockClient = setupMockClientForExports();
        mockCreateClient.mockResolvedValue(mockClient as never);

        const request = createMockRequest("/api/survey/research/export/json");
        const response = await jsonExportGet(request);

        const text = await response.text();
        const data = JSON.parse(text);

        expect(data.metadata.totalRespondents).toBe(2);
        expect(data.metadata.exportedBy).toBe(mockUser.email);
        expect(data.summary).toBeDefined();
      });
    });
  });

  // ============================================================================
  // DELETE /api/survey/research/insights - Cache invalidation
  // ============================================================================

  describe("DELETE /api/survey/research/insights", () => {
    it("should delete all insights for super admin", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      };
      mockClient.from = jest.fn((table: string) => {
        if (table === "utilizatori") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockSuperAdminProfile, error: null }),
          };
        }
        return {
          delete: jest.fn().mockReturnThis(),
          neq: jest.fn().mockResolvedValue({ error: null }),
        };
      });

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await insightsDelete();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("cleared successfully");
    });

    it("should return 403 for non-super-admin users", async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      };
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAdminProfile, error: null }),
      }));

      mockCreateClient.mockResolvedValue(mockClient as never);

      const response = await insightsDelete();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("Super Admin access required");
    });
  });
});
