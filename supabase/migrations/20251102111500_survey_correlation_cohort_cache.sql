-- Migration: Survey Correlation & Cohort Analysis Cache
-- Created: 2025-11-02
-- Purpose: Store correlation and cohort analysis results for performance optimization

-- ============================================================================
-- CORRELATION ANALYSIS CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.survey_correlation_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Analysis metadata
    survey_type TEXT CHECK (survey_type IN ('citizen', 'official', 'all')),
    analysis_type TEXT DEFAULT 'pearson' CHECK (analysis_type IN ('pearson', 'spearman', 'chi_square')),

    -- Results (JSONB for flexibility)
    correlations JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [{ variables: [string, string], coefficient: number, pValue: number, significant: boolean, ... }]

    correlation_matrix JSONB,
    -- Structure: { variables: string[], matrix: number[][], pValues: number[][], sampleSizes: number[][] }

    key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [string, string, ...]

    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [string, string, ...]

    -- Statistics
    total_correlations INTEGER NOT NULL DEFAULT 0,
    significant_correlations INTEGER NOT NULL DEFAULT 0,
    respondent_count INTEGER NOT NULL DEFAULT 0,
    response_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_correlation_analysis_survey_type
    ON public.survey_correlation_analysis(survey_type);
CREATE INDEX IF NOT EXISTS idx_correlation_analysis_created_at
    ON public.survey_correlation_analysis(created_at DESC);

-- Enable RLS
ALTER TABLE public.survey_correlation_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can view correlation analysis"
    ON public.survey_correlation_analysis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

CREATE POLICY "Super admins can insert correlation analysis"
    ON public.survey_correlation_analysis
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update correlation analysis"
    ON public.survey_correlation_analysis
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

CREATE POLICY "Super admins can delete correlation analysis"
    ON public.survey_correlation_analysis
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

-- ============================================================================
-- COHORT ANALYSIS CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.survey_cohort_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Analysis metadata
    cohort_type TEXT CHECK (cohort_type IN ('age', 'location', 'usage', 'all')),

    -- Results (JSONB for flexibility)
    cohorts JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [{ id: string, name: string, description: string, respondentIds: string[], size: number, percentage: number }]

    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [{ cohortId: string, cohortName: string, topFeatures: [...], averageSentiment: number, ... }]

    comparisons JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Structure: [{ cohort1: {...}, cohort2: {...}, featureDifferences: [...], insights: [...], ... }]

    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Structure: { totalCohorts: number, largestCohort: string, smallestCohort: string, mostEngaged: string, keyFindings: [...] }

    -- Statistics
    total_cohorts INTEGER NOT NULL DEFAULT 0,
    total_comparisons INTEGER NOT NULL DEFAULT 0,
    respondent_count INTEGER NOT NULL DEFAULT 0,
    response_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cohort_analysis_cohort_type
    ON public.survey_cohort_analysis(cohort_type);
CREATE INDEX IF NOT EXISTS idx_cohort_analysis_created_at
    ON public.survey_cohort_analysis(created_at DESC);

-- Enable RLS
ALTER TABLE public.survey_cohort_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can view cohort analysis"
    ON public.survey_cohort_analysis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

CREATE POLICY "Super admins can insert cohort analysis"
    ON public.survey_cohort_analysis
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update cohort analysis"
    ON public.survey_cohort_analysis
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

CREATE POLICY "Super admins can delete cohort analysis"
    ON public.survey_cohort_analysis
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'super_admin'
        )
    );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_survey_correlation_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_survey_correlation_analysis_updated_at
    BEFORE UPDATE ON public.survey_correlation_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_survey_correlation_analysis_updated_at();

CREATE OR REPLACE FUNCTION public.update_survey_cohort_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_survey_cohort_analysis_updated_at
    BEFORE UPDATE ON public.survey_cohort_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_survey_cohort_analysis_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.survey_correlation_analysis IS
    'Stores correlation analysis results for survey data with caching support';

COMMENT ON TABLE public.survey_cohort_analysis IS
    'Stores cohort segmentation and comparative analysis results with caching support';

COMMENT ON COLUMN public.survey_correlation_analysis.correlations IS
    'Array of correlation objects with variables, coefficients, p-values, and significance';

COMMENT ON COLUMN public.survey_cohort_analysis.cohorts IS
    'Array of cohort definitions with respondent IDs, sizes, and percentages';

COMMENT ON COLUMN public.survey_cohort_analysis.metrics IS
    'Array of cohort metrics including features, sentiment, pain points, and readiness scores';

COMMENT ON COLUMN public.survey_cohort_analysis.comparisons IS
    'Array of pairwise cohort comparisons with differences and insights';
