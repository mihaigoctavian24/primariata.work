/**
 * Survey Platform - TypeScript Types
 *
 * Types for survey respondents, questions, and responses
 */

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type RespondentType = "citizen" | "official";

export type QuestionType = "single_choice" | "multiple_choice" | "text" | "short_text" | "rating";

export type AgeCategory = "18-25" | "26-35" | "36-45" | "46-60" | "60+";

// =====================================================
// DATABASE ENTITY TYPES
// =====================================================

/**
 * Survey Respondent - Profil respondent (matches survey_respondents table)
 */
export interface SurveyRespondent {
  id: string; // UUID

  // Date personale
  first_name: string;
  last_name: string;
  email?: string | null;
  age_category?: AgeCategory | null;
  county: string;
  locality: string;

  // Tip respondent
  respondent_type: RespondentType;
  department?: string | null; // Pentru funcționari

  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  ip_address?: string | null;
  user_agent?: string | null;

  // Status
  is_completed: boolean;
  completed_at?: string | null; // ISO timestamp
}

/**
 * Survey Response - Răspuns la o întrebare (matches survey_responses table)
 */
export interface SurveyResponse {
  id: string; // UUID
  respondent_id: string; // UUID

  // Identificare întrebare
  question_id: string; // "q1_citizen", "q2_official", etc.
  question_type: QuestionType;

  // Răspunsuri (doar unul va fi populat)
  answer_text?: string | null; // Pentru text, short_text
  answer_choices?: string[] | null; // Pentru single_choice, multiple_choice
  answer_rating?: number | null; // Pentru rating (1-5)

  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Survey Question - Configurare întrebare (matches survey_questions table)
 */
export interface SurveyQuestion {
  id: string; // "q1_citizen"
  survey_type: RespondentType;
  question_number: number;
  question_text: string;
  question_type: QuestionType;
  options?: string[] | null; // Pentru single/multiple choice
  is_required: boolean;
  order_index: number;
  created_at: string; // ISO timestamp
}

// =====================================================
// FORM & UI TYPES
// =====================================================

/**
 * Personal Data Form - Date personale (Step 1)
 */
export interface PersonalDataForm {
  firstName: string;
  lastName: string;
  email?: string;
  ageCategory?: AgeCategory;
  county: string;
  locality: string;
}

/**
 * Survey Answer - Răspuns la o întrebare (UI state)
 */
export interface SurveyAnswer {
  questionId: string;
  questionType: QuestionType;
  answerText?: string;
  answerChoices?: string[];
  answerRating?: number;
}

/**
 * Survey State - Global state pentru survey flow
 */
export interface SurveyState {
  // Step 1: Date personale
  personalData: PersonalDataForm | null;

  // Step 2: Tip respondent
  respondentType: RespondentType | null;

  // Step 3+: Răspunsuri
  answers: Record<string, SurveyAnswer>; // Key: questionId

  // Progress tracking
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;

  // Persistence
  respondentId?: string; // UUID from database
  isDraft: boolean;
  lastSavedAt?: Date;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

/**
 * API Request: Start Survey
 */
export interface StartSurveyRequest {
  firstName: string;
  lastName: string;
  email?: string;
  ageCategory?: AgeCategory;
  county: string;
  locality: string;
  respondentType: RespondentType;
  department?: string; // Pentru funcționari
}

/**
 * API Response: Start Survey
 */
export interface StartSurveyResponse {
  respondentId: string;
  success: boolean;
  message?: string;
}

/**
 * API Request: Save Answers (bulk)
 */
export interface SaveAnswersRequest {
  respondentId: string;
  answers: SurveyAnswer[];
}

/**
 * API Response: Save Answers
 */
export interface SaveAnswersResponse {
  success: boolean;
  savedCount: number;
  message?: string;
}

/**
 * API Request: Submit Survey
 */
export interface SubmitSurveyRequest {
  respondentId: string;
}

/**
 * API Response: Submit Survey
 */
export interface SubmitSurveyResponse {
  success: boolean;
  message?: string;
  completedAt: string; // ISO timestamp
}

/**
 * API Response: Get Survey State (pentru resume)
 */
export interface GetSurveyStateResponse {
  respondent: SurveyRespondent;
  responses: SurveyResponse[];
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

/**
 * Survey Statistics - Statistici generale
 */
export interface SurveyStatistics {
  totalRespondents: number;
  completedSurveys: number;
  draftSurveys: number;
  citizenCount: number;
  officialCount: number;
  completionRate: number; // 0-100
  responsesByCounty: Record<string, number>;
  responsesByLocality: Record<string, number>;
  responsesByAgeCategory: Record<AgeCategory, number>;
}

/**
 * Question Analytics - Analytics pentru o întrebare specifică
 */
export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalResponses: number;

  // Pentru single/multiple choice
  choiceDistribution?: Record<string, number>; // { "Lunar": 45, "Săptămânal": 120 }

  // Pentru rating
  averageRating?: number;
  ratingDistribution?: Record<number, number>; // { 1: 5, 2: 10, 3: 25, 4: 40, 5: 20 }

  // Pentru text
  textResponses?: string[]; // Sample responses
}

/**
 * Dashboard Data - Date complete pentru dashboard
 */
export interface DashboardData {
  statistics: SurveyStatistics;
  questionAnalytics: QuestionAnalytics[];
  recentRespondents: SurveyRespondent[];
  trendsOverTime: {
    date: string;
    citizenCount: number;
    officialCount: number;
  }[];
}

// =====================================================
// VALIDATION TYPES
// =====================================================

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>; // { fieldName: errorMessage }
}

/**
 * Question Validation Config
 */
export interface QuestionValidationConfig {
  questionId: string;
  isRequired: boolean;
  minLength?: number; // Pentru text
  maxLength?: number; // Pentru text
  minChoices?: number; // Pentru multiple choice
  maxChoices?: number; // Pentru multiple choice
  minRating?: number; // Pentru rating
  maxRating?: number; // Pentru rating
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Survey Filter Options (pentru dashboard)
 */
export interface SurveyFilterOptions {
  respondentType?: RespondentType;
  county?: string;
  locality?: string;
  isCompleted?: boolean;
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  ageCategory?: AgeCategory;
}

/**
 * Export Options
 */
export interface ExportOptions {
  format: "csv" | "xlsx" | "json";
  filters?: SurveyFilterOptions;
  includePersonalData?: boolean;
  includeMetadata?: boolean;
}
