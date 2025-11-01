-- =====================================================
-- Survey AI Insights & Analysis Cache Tables
-- =====================================================
-- Purpose: Store AI-generated insights, analysis results, and caching
-- for the Research Analysis Platform
-- =====================================================

-- =====================================================
-- Table: survey_ai_insights
-- =====================================================
-- Stores AI-generated insights for survey questions
CREATE TABLE IF NOT EXISTS survey_ai_insights (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Question identification
  question_id VARCHAR(50) NOT NULL,
  respondent_type VARCHAR(20), -- 'citizen', 'official', or NULL for combined

  -- AI Generated Insights
  themes JSONB, -- [{"name": "efficiency", "score": 0.85, "mentions": 12, "keywords": [...], "sentiment": 0.7}]
  sentiment_score NUMERIC(3,2), -- -1.00 to 1.00
  sentiment_label VARCHAR(20), -- "positive", "negative", "neutral", "mixed"
  key_phrases TEXT[], -- Array of extracted key phrases
  feature_requests JSONB, -- [{"feature": "...", "priority": "high", "count": 15, "description": "..."}]
  top_quotes TEXT[], -- Representative quotes from responses
  ai_summary TEXT, -- AI-generated summary paragraph
  recommendations JSONB, -- [{"action": "...", "priority": "high", "impact": "...", "timeline": "..."}]

  -- Statistics
  total_responses INTEGER NOT NULL DEFAULT 0,
  response_distribution JSONB, -- For single/multiple choice: {"option1": 5, "option2": 12}

  -- AI Metadata
  model_version VARCHAR(50) NOT NULL, -- "gpt-4-turbo-2024-04-09"
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00

  -- Constraints
  CONSTRAINT valid_sentiment_score CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1),
  CONSTRAINT valid_respondent_type CHECK (respondent_type IS NULL OR respondent_type IN ('citizen', 'official')),
  CONSTRAINT valid_sentiment_label CHECK (sentiment_label IN ('positive', 'negative', 'neutral', 'mixed'))
);

-- Indexes for performance
CREATE INDEX idx_ai_insights_question ON survey_ai_insights(question_id);
CREATE INDEX idx_ai_insights_type ON survey_ai_insights(respondent_type);
CREATE INDEX idx_ai_insights_generated ON survey_ai_insights(generated_at DESC);
CREATE INDEX idx_ai_insights_question_type ON survey_ai_insights(question_id, respondent_type);

-- =====================================================
-- Table: survey_analysis_cache
-- =====================================================
-- Cache expensive AI computations to avoid redundant API calls
CREATE TABLE IF NOT EXISTS survey_analysis_cache (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Cache key (unique identifier for this analysis)
  cache_key VARCHAR(255) NOT NULL UNIQUE,

  -- Cache data
  analysis_type VARCHAR(50) NOT NULL, -- 'text_analysis', 'feature_extraction', 'demographic_correlation', etc.
  input_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of input data for validation
  result JSONB NOT NULL, -- Cached analysis result

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Size tracking
  result_size_bytes INTEGER
);

-- Indexes
CREATE INDEX idx_analysis_cache_key ON survey_analysis_cache(cache_key);
CREATE INDEX idx_analysis_cache_type ON survey_analysis_cache(analysis_type);
CREATE INDEX idx_analysis_cache_expires ON survey_analysis_cache(expires_at);

-- Auto-cleanup expired cache entries (runs daily)
CREATE OR REPLACE FUNCTION cleanup_expired_analysis_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM survey_analysis_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Table: survey_research_metadata
-- =====================================================
-- Store metadata about research analysis runs
CREATE TABLE IF NOT EXISTS survey_research_metadata (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Analysis run information
  analysis_run_id VARCHAR(100) NOT NULL UNIQUE, -- "run_2025-01-01_14-30-00"
  triggered_by UUID, -- admin user ID who triggered

  -- Scope
  questions_analyzed TEXT[], -- Array of question_ids
  respondent_types TEXT[], -- ['citizen', 'official']
  total_responses_analyzed INTEGER NOT NULL,
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,

  -- Results summary
  insights_generated INTEGER DEFAULT 0,
  total_ai_tokens_used INTEGER DEFAULT 0,
  total_analysis_time_seconds NUMERIC(10,2),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_status CHECK (status IN ('running', 'completed', 'failed'))
);

-- Indexes
CREATE INDEX idx_research_metadata_run_id ON survey_research_metadata(analysis_run_id);
CREATE INDEX idx_research_metadata_triggered_by ON survey_research_metadata(triggered_by);
CREATE INDEX idx_research_metadata_started ON survey_research_metadata(started_at DESC);
CREATE INDEX idx_research_metadata_status ON survey_research_metadata(status);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE survey_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_research_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all AI insights
CREATE POLICY "Admins can read all AI insights"
ON survey_ai_insights FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can insert AI insights
CREATE POLICY "Admins can insert AI insights"
ON survey_ai_insights FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can update AI insights (for regeneration)
CREATE POLICY "Admins can update AI insights"
ON survey_ai_insights FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can delete AI insights (cache invalidation)
CREATE POLICY "Admins can delete AI insights"
ON survey_ai_insights FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Service role can manage cache (for background jobs)
CREATE POLICY "Service role can manage analysis cache"
ON survey_analysis_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Admins can read cache
CREATE POLICY "Admins can read analysis cache"
ON survey_analysis_cache FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can read research metadata
CREATE POLICY "Admins can read research metadata"
ON survey_research_metadata FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can insert research metadata
CREATE POLICY "Admins can insert research metadata"
ON survey_research_metadata FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can update research metadata
CREATE POLICY "Admins can update research metadata"
ON survey_research_metadata FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilizatori
    WHERE utilizatori.id = auth.uid()
    AND utilizatori.rol IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get latest AI insight for a question
CREATE OR REPLACE FUNCTION get_latest_ai_insight(
  p_question_id VARCHAR(50),
  p_respondent_type VARCHAR(20) DEFAULT NULL
)
RETURNS survey_ai_insights AS $$
  SELECT *
  FROM survey_ai_insights
  WHERE question_id = p_question_id
    AND (p_respondent_type IS NULL OR respondent_type = p_respondent_type)
  ORDER BY generated_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to check if cache is valid
CREATE OR REPLACE FUNCTION is_cache_valid(p_cache_key VARCHAR(255))
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM survey_analysis_cache
    WHERE cache_key = p_cache_key
      AND expires_at > NOW()
  );
$$ LANGUAGE sql STABLE;

-- Function to update cache access statistics
CREATE OR REPLACE FUNCTION update_cache_access(p_cache_key VARCHAR(255))
RETURNS void AS $$
BEGIN
  UPDATE survey_analysis_cache
  SET access_count = access_count + 1,
      last_accessed_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE survey_ai_insights IS 'AI-generated insights and analysis for survey questions';
COMMENT ON TABLE survey_analysis_cache IS 'Cache for expensive AI computations (24h TTL)';
COMMENT ON TABLE survey_research_metadata IS 'Metadata about research analysis runs for tracking and auditing';

COMMENT ON COLUMN survey_ai_insights.themes IS 'AI-extracted themes with scores, mentions, keywords, and sentiment';
COMMENT ON COLUMN survey_ai_insights.sentiment_score IS 'Overall sentiment score from -1 (very negative) to 1 (very positive)';
COMMENT ON COLUMN survey_ai_insights.feature_requests IS 'Extracted and categorized feature requests with priorities';
COMMENT ON COLUMN survey_ai_insights.confidence_score IS 'AI confidence in analysis quality (0-1)';

COMMENT ON COLUMN survey_analysis_cache.input_hash IS 'SHA-256 hash of input data for cache validation';
COMMENT ON COLUMN survey_analysis_cache.expires_at IS 'Cache expiration timestamp (default 24 hours)';

COMMENT ON FUNCTION cleanup_expired_analysis_cache IS 'Removes expired cache entries (should be called daily)';
COMMENT ON FUNCTION get_latest_ai_insight IS 'Helper to retrieve most recent AI insight for a question';
COMMENT ON FUNCTION is_cache_valid IS 'Check if cached analysis is still valid';
COMMENT ON FUNCTION update_cache_access IS 'Update cache access statistics for monitoring';
