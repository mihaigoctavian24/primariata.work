-- =====================================================
-- Survey Platform Database Schema
-- =====================================================
-- Created: 2025-01-28
-- Purpose: Platform de chestionare pentru digitalizare servicii publice
-- Tables: survey_respondents, survey_responses, survey_questions
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: survey_respondents
-- =====================================================
-- Profil respondent (date personale)
-- =====================================================

CREATE TABLE survey_respondents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Date personale
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  age_category VARCHAR(50), -- "18-25", "26-35", "36-45", "46-60", "60+"
  county VARCHAR(100) NOT NULL,
  locality VARCHAR(100) NOT NULL,

  -- Tip respondent
  respondent_type VARCHAR(20) NOT NULL CHECK (respondent_type IN ('citizen', 'official')),
  department VARCHAR(100), -- Pentru funcionari (opional)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,

  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_age_category CHECK (age_category IN ('18-25', '26-35', '36-45', '46-60', '60+'))
);

-- Indexes pentru cutri rapide
CREATE INDEX idx_survey_respondent_type ON survey_respondents(respondent_type);
CREATE INDEX idx_survey_created_at ON survey_respondents(created_at DESC);
CREATE INDEX idx_survey_county_locality ON survey_respondents(county, locality);
CREATE INDEX idx_survey_is_completed ON survey_respondents(is_completed);
CREATE INDEX idx_survey_completed_at ON survey_respondents(completed_at DESC) WHERE completed_at IS NOT NULL;

-- =====================================================
-- TABLE: survey_responses
-- =====================================================
-- Rspunsuri individuale la întrebri
-- =====================================================

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  respondent_id UUID NOT NULL REFERENCES survey_respondents(id) ON DELETE CASCADE,

  -- Identificare întrebare
  question_id VARCHAR(50) NOT NULL, -- "q1_citizen", "q2_official", etc.
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'short_text', 'rating')),

  -- Rspunsuri (doar unul din acestea va fi populat, în funcie de tip)
  answer_text TEXT, -- Pentru rspunsuri deschise (text, short_text)
  answer_choices JSONB, -- Pentru single/multiple choice: ["option1", "option2"]
  answer_rating INTEGER CHECK (answer_rating >= 1 AND answer_rating <= 5), -- Pentru rating 1-5

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_respondent_question UNIQUE (respondent_id, question_id),
  CONSTRAINT valid_answer_type CHECK (
    (question_type IN ('text', 'short_text') AND answer_text IS NOT NULL AND answer_choices IS NULL AND answer_rating IS NULL) OR
    (question_type IN ('single_choice', 'multiple_choice') AND answer_choices IS NOT NULL AND answer_text IS NULL AND answer_rating IS NULL) OR
    (question_type = 'rating' AND answer_rating IS NOT NULL AND answer_text IS NULL AND answer_choices IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_response_respondent ON survey_responses(respondent_id);
CREATE INDEX idx_response_question_id ON survey_responses(question_id);
CREATE INDEX idx_response_question_type ON survey_responses(question_type);
CREATE INDEX idx_response_created_at ON survey_responses(created_at DESC);

-- Index pentru queries de analytics (GIN index pentru JSONB)
CREATE INDEX idx_response_choices ON survey_responses USING GIN (answer_choices);

-- =====================================================
-- TABLE: survey_questions
-- =====================================================
-- Stocare configurare întrebri (pentru management dinamic)
-- =====================================================

CREATE TABLE survey_questions (
  id VARCHAR(50) PRIMARY KEY, -- "q1_citizen", "q2_official", etc.
  survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('citizen', 'official')),
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'short_text', 'rating')),
  options JSONB, -- Pentru întrebri cu opiuni: ["Lunar", "Sptmânal", ...]
  is_required BOOLEAN DEFAULT TRUE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_survey_question_number UNIQUE (survey_type, question_number),
  CONSTRAINT unique_survey_order UNIQUE (survey_type, order_index)
);

-- Indexes
CREATE INDEX idx_question_survey_type_order ON survey_questions(survey_type, order_index);
CREATE INDEX idx_question_type ON survey_questions(question_type);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_survey_respondents_updated_at
  BEFORE UPDATE ON survey_respondents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE survey_respondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: survey_respondents
-- =====================================================

-- Public poate crea rspunsuri noi (INSERT)
CREATE POLICY "Allow public inserts on survey_respondents"
ON survey_respondents
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public poate citi propriul draft (SELECT pentru resume)
-- Folosim custom claim sau session variable pentru tracking
CREATE POLICY "Allow users to read own draft"
ON survey_respondents
FOR SELECT
TO anon, authenticated
USING (
  id::text = current_setting('app.current_respondent_id', true)
  OR
  auth.role() = 'authenticated'
);

-- Public poate update propriul draft (UPDATE)
CREATE POLICY "Allow users to update own draft"
ON survey_respondents
FOR UPDATE
TO anon, authenticated
USING (
  id::text = current_setting('app.current_respondent_id', true)
  OR
  auth.role() = 'authenticated'
)
WITH CHECK (
  id::text = current_setting('app.current_respondent_id', true)
  OR
  auth.role() = 'authenticated'
);

-- Admins pot citi toate rspunsurile (pentru dashboard)
CREATE POLICY "Admins can read all survey_respondents"
ON survey_respondents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'super_admin')
  )
);

-- =====================================================
-- RLS POLICIES: survey_responses
-- =====================================================

-- Public poate crea rspunsuri (INSERT)
CREATE POLICY "Allow public inserts on survey_responses"
ON survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public poate citi propriile rspunsuri
CREATE POLICY "Allow users to read own responses"
ON survey_responses
FOR SELECT
TO anon, authenticated
USING (
  respondent_id::text = current_setting('app.current_respondent_id', true)
  OR
  auth.role() = 'authenticated'
);

-- Public poate update propriile rspunsuri (pentru draft)
CREATE POLICY "Allow users to update own responses"
ON survey_responses
FOR UPDATE
TO anon, authenticated
USING (
  respondent_id::text = current_setting('app.current_respondent_id', true)
  OR
  auth.role() = 'authenticated'
)
WITH CHECK (
  respondent_id::text = current_setting('app.current_respondent_id', true)
  OR
  auth.role() = 'authenticated'
);

-- Admins pot citi toate rspunsurile
CREATE POLICY "Admins can read all survey_responses"
ON survey_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'super_admin')
  )
);

-- =====================================================
-- RLS POLICIES: survey_questions
-- =====================================================

-- Public poate citi toate întrebrile (pentru afiare)
CREATE POLICY "Allow public read on survey_questions"
ON survey_questions
FOR SELECT
TO anon, authenticated
USING (true);

-- Doar admins pot modifica întrebrile
CREATE POLICY "Admins can manage survey_questions"
ON survey_questions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'super_admin')
  )
);

-- =====================================================
-- COMMENTS pentru documentaie
-- =====================================================

COMMENT ON TABLE survey_respondents IS 'Profil respondeni - date personale i metadata';
COMMENT ON TABLE survey_responses IS 'Rspunsuri individuale la întrebri din chestionar';
COMMENT ON TABLE survey_questions IS 'Configurare întrebri pentru management dinamic';

COMMENT ON COLUMN survey_respondents.respondent_type IS 'Tip respondent: citizen sau official';
COMMENT ON COLUMN survey_respondents.is_completed IS 'Flag pentru survey completat i trimis';
COMMENT ON COLUMN survey_responses.answer_choices IS 'Array JSON cu opiunile selectate (single/multiple choice)';
COMMENT ON COLUMN survey_responses.answer_rating IS 'Rating 1-5 pentru întrebri de tip rating';
