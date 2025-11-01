/**
 * Survey AI Analysis Types
 *
 * TypeScript types for AI-powered research analysis platform
 */

// =====================================================
// AI ANALYSIS TYPES
// =====================================================

/**
 * AI Theme - Extracted theme from text responses
 */
export interface AITheme {
  name: string; // "Efficiency", "Security", "User Experience"
  score: number; // 0-1 (relevance score)
  mentions: number; // How many times mentioned
  keywords: string[]; // ["rapid", "eficient", "simplu"]
  sentiment: number; // -1 to 1 (sentiment for this theme)
}

/**
 * Feature Request - Extracted or identified feature request
 */
export interface FeatureRequest {
  feature: string; // Feature name
  description: string; // AI-generated description
  priority: "high" | "medium" | "low";
  count: number; // Times mentioned/selected
  relatedQuestions: string[]; // question_ids where mentioned
  sentiment: number; // User sentiment towards this feature
}

/**
 * AI Sentiment Analysis Result
 */
export interface SentimentAnalysis {
  overall: number; // -1 to 1
  label: "positive" | "negative" | "neutral" | "mixed";
  distribution: {
    positive: number; // percentage (0-100)
    neutral: number;
    negative: number;
  };
  confidence: number; // 0-1
}

/**
 * AI Recommendation
 */
export interface AIRecommendation {
  action: string; // What to do
  priority: "high" | "medium" | "low";
  impact: string; // Expected impact description
  timeline: "quick-win" | "short-term" | "long-term"; // Implementation timeline
  effort: "low" | "medium" | "high"; // Estimated effort
  reasoning: string; // Why this recommendation
}

/**
 * AI Insight - Complete AI analysis for a question
 */
export interface AIInsight {
  id: string; // UUID
  questionId: string; // "q1_frequency", "q5_most_useful", etc.
  respondentType: "citizen" | "official" | null; // null = combined analysis

  // AI Analysis Results
  themes: AITheme[];
  sentimentScore: number; // -1 to 1
  sentimentLabel: "positive" | "negative" | "neutral" | "mixed";
  keyPhrases: string[];
  featureRequests: FeatureRequest[];
  topQuotes: string[];
  aiSummary: string;
  recommendations: AIRecommendation[];

  // Statistics
  totalResponses: number;
  responseDistribution?: Record<string, number>; // For single/multiple choice

  // AI Metadata
  modelVersion: string; // "gpt-4-turbo-2024-04-09"
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  generatedAt: string; // ISO timestamp
  confidenceScore: number; // 0-1
}

// =====================================================
// ANALYSIS INPUT/OUTPUT TYPES
// =====================================================

/**
 * Text Analysis Input
 */
export interface TextAnalysisInput {
  questionId: string;
  questionText: string;
  questionType: "text" | "short_text";
  responses: string[]; // Array of text responses
  respondentType: "citizen" | "official";
}

/**
 * Text Analysis Output
 */
export interface TextAnalysisOutput {
  themes: AITheme[];
  sentiment: SentimentAnalysis;
  keyPhrases: string[];
  topQuotes: string[]; // Most representative quotes
  summary: string; // AI-generated summary
  wordFrequency: { word: string; count: number }[]; // For word cloud
}

/**
 * Feature Extraction Input
 */
export interface FeatureExtractionInput {
  multipleChoiceData?: {
    questionId: string;
    selectedOptions: string[];
    respondentCount: number;
  }[];
  textResponses?: {
    questionId: string;
    responses: string[];
  }[];
  respondentType: "citizen" | "official";
}

/**
 * Feature Extraction Output
 */
export interface FeatureExtractionOutput {
  features: FeatureRequest[];
  priorityMatrix: {
    feature: string;
    popularity: number; // 0-100 (% selected)
    aiImportance: number; // 0-100 (AI-assessed importance)
    sentiment: number; // -1 to 1
    priority: "high" | "medium" | "low";
    roi: number; // Impact / Effort estimate (0-10)
  }[];
}

/**
 * Demographic Analysis Input
 */
export interface DemographicAnalysisInput {
  respondents: Array<{
    id: string;
    ageCategory?: string;
    county: string;
    locality: string;
    respondentType: "citizen" | "official";
  }>;
  responses: Array<{
    respondentId: string;
    questionId: string;
    answerText?: string;
    answerChoices?: string[];
    answerRating?: number;
  }>;
}

/**
 * Demographic Analysis Output
 */
export interface DemographicAnalysisOutput {
  ageDistribution: { category: string; count: number; percentage: number }[];
  geographicSpread: {
    county: string;
    localities: number;
    responses: number;
    sentiment?: number;
  }[];
  crossTabs: {
    ageXFeatures: { age: string; feature: string; count: number }[];
    locationXReadiness: { county: string; readinessScore: number }[];
    frequencyXUsefulness?: { frequency: string; avgRating: number }[];
  };
  correlations: {
    variables: [string, string];
    coefficient: number;
    pValue: number;
    significant: boolean;
    interpretation: string;
  }[];
}

// =====================================================
// RESEARCH ANALYSIS TYPES
// =====================================================

/**
 * Executive Summary
 */
export interface ExecutiveSummary {
  totalResponses: number;
  citizenCount: number;
  officialCount: number;
  dateRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  geographicCoverage: {
    counties: number;
    localities: number;
  };
  overallSentiment: SentimentAnalysis;
  keyFindings: string[]; // 3-5 bullet points
  researchValidity: {
    minimumMet: boolean; // >= 15 responses
    actual: number;
    minimum: number;
  };
}

/**
 * Question Analysis Result
 */
export interface QuestionAnalysisResult {
  questionId: string;
  questionText: string;
  questionType: "single_choice" | "multiple_choice" | "text" | "short_text" | "rating";
  respondentType: "citizen" | "official";

  // Response statistics
  totalResponses: number;
  responseRate: number; // Percentage of total respondents who answered

  // Type-specific data
  choiceDistribution?: { option: string; count: number; percentage: number }[]; // For single/multiple choice
  ratingStats?: {
    average: number;
    median: number;
    mode: number;
    distribution: { rating: number; count: number }[]; // 1-5
    nps?: number; // Net Promoter Score equivalent
  }; // For rating questions
  textAnalysis?: TextAnalysisOutput; // For text questions

  // AI Insights
  aiInsight?: AIInsight;
}

/**
 * Cohort - User segment for analysis
 */
export interface Cohort {
  id: string;
  name: string; // "Young Digital Natives", "Seniors", "Urban", "Frequent Users"
  description: string;
  filter: {
    ageCategories?: string[];
    counties?: string[];
    localities?: string[];
    respondentType?: "citizen" | "official";
    customFilter?: (respondent: unknown) => boolean;
  };
  size: number; // Number of respondents in cohort
}

/**
 * Cohort Comparison Result
 */
export interface CohortComparisonResult {
  cohorts: Cohort[];
  comparisons: {
    metric: string; // "Feature Preference", "Sentiment", "Digital Readiness"
    values: { cohortId: string; value: number }[];
    visualization: "bar" | "line" | "radar";
  }[];
  keyDifferences: string[]; // AI-generated insights about differences
}

/**
 * Correlation Analysis Result
 */
export interface CorrelationAnalysisResult {
  correlations: {
    variable1: string;
    variable2: string;
    coefficient: number; // -1 to 1
    pValue: number;
    significant: boolean;
    strength: "weak" | "moderate" | "strong";
    direction: "positive" | "negative" | "none";
    interpretation: string; // AI-generated explanation
  }[];
  heatmapData: {
    rows: string[];
    columns: string[];
    values: number[][]; // correlation matrix
  };
}

// =====================================================
// DASHBOARD DATA TYPES
// =====================================================

/**
 * Research Dashboard Data
 */
export interface ResearchDashboardData {
  executiveSummary: ExecutiveSummary;
  questionAnalyses: QuestionAnalysisResult[];
  demographicAnalysis: DemographicAnalysisOutput;
  featureAnalysis: FeatureExtractionOutput;
  cohortComparison?: CohortComparisonResult;
  correlationAnalysis?: CorrelationAnalysisResult;
  generatedAt: string; // ISO timestamp
  dataVersion: string; // For cache invalidation
}

// =====================================================
// EXPORT TYPES
// =====================================================

/**
 * PDF Export Options
 */
export interface PDFExportOptions {
  includeCharts: boolean;
  includeRawData: boolean;
  includeAIInsights: boolean;
  includeQuotes: boolean;
  sections: (
    | "executive_summary"
    | "demographics"
    | "question_analysis"
    | "feature_analysis"
    | "ai_insights"
    | "recommendations"
  )[];
}

/**
 * Excel Export Options
 */
export interface ExcelExportOptions {
  worksheets: (
    | "summary"
    | "raw_data"
    | "demographics"
    | "ai_insights"
    | "feature_requests"
    | "correlations"
  )[];
  includeCharts: boolean;
  includePivotTables: boolean;
}

/**
 * Export Job Status
 */
export interface ExportJobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  format: "pdf" | "xlsx" | "csv" | "json";
  progress: number; // 0-100
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// =====================================================
// CACHE TYPES
// =====================================================

/**
 * Analysis Cache Entry
 */
export interface AnalysisCacheEntry {
  id: string;
  cacheKey: string;
  analysisType:
    | "text_analysis"
    | "feature_extraction"
    | "demographic_analysis"
    | "correlation_analysis"
    | "sentiment_analysis";
  inputHash: string; // SHA-256 hash for validation
  result: Record<string, unknown>; // Cached result (type depends on analysisType)
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  lastAccessedAt?: string;
  resultSizeBytes?: number;
}

// =====================================================
// RESEARCH METADATA TYPES
// =====================================================

/**
 * Research Analysis Run Metadata
 */
export interface ResearchAnalysisRun {
  id: string;
  analysisRunId: string; // "run_2025-01-01_14-30-00"
  triggeredBy?: string; // Admin user ID

  // Scope
  questionsAnalyzed: string[];
  respondentTypes: ("citizen" | "official")[];
  totalResponsesAnalyzed: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;

  // Results
  insightsGenerated: number;
  totalAiTokensUsed: number;
  totalAnalysisTimeSeconds: number;

  // Status
  status: "running" | "completed" | "failed";
  errorMessage?: string;

  // Timestamps
  startedAt: string;
  completedAt?: string;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

/**
 * Trigger AI Analysis Request
 */
export interface TriggerAnalysisRequest {
  questionIds?: string[]; // If null, analyze all
  respondentTypes?: ("citizen" | "official")[]; // If null, analyze both
  forceRegenerate?: boolean; // Bypass cache
}

/**
 * Trigger AI Analysis Response
 */
export interface TriggerAnalysisResponse {
  success: boolean;
  analysisRunId: string;
  status: "running" | "completed";
  questionsAnalyzed: number;
  estimatedTimeSeconds?: number;
  message?: string;
}

/**
 * Get AI Insights Request
 */
export interface GetAIInsightsRequest {
  questionId?: string; // If null, get all
  respondentType?: "citizen" | "official"; // If null, get both
  includeCache?: boolean; // Include cache metadata
}

/**
 * Get AI Insights Response
 */
export interface GetAIInsightsResponse {
  insights: AIInsight[];
  totalCount: number;
  cacheStatus?: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Word Cloud Data Point
 */
export interface WordCloudDataPoint {
  text: string;
  value: number; // Frequency
  sentiment?: number; // -1 to 1
}

/**
 * Chart Data Point (generic)
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Time Series Data Point
 */
export interface TimeSeriesDataPoint {
  date: string; // ISO date
  value: number;
  label?: string;
}

/**
 * Heatmap Data Point
 */
export interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
  color?: string;
}

/**
 * AI Model Configuration
 */
export interface AIModelConfig {
  model: string; // "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"
  temperature: number; // 0-2
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Analysis Progress Event
 */
export interface AnalysisProgressEvent {
  analysisRunId: string;
  stage: "started" | "analyzing" | "generating_insights" | "completed" | "failed";
  progress: number; // 0-100
  message: string;
  timestamp: string;
}
