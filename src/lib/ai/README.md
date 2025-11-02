# 🤖 AI Analysis Library

This directory contains the AI-powered analysis engine for survey research data.

## Architecture

```
src/lib/ai/
├── openai-client.ts           # OpenAI client wrapper and configuration
├── text-analyzer.ts            # Text analysis (sentiment, themes, phrases)
├── feature-extractor.ts        # Feature extraction and prioritization
├── demographic-analyzer.ts     # Demographics and cross-tabulation
├── correlation-analyzer.ts     # Statistical correlation analysis
├── cohort-analyzer.ts          # Cohort segmentation and comparison
└── insight-generator.ts        # Insight generation and recommendations
```

## Module Overview

### openai-client.ts

**Purpose**: Singleton OpenAI client with retry logic and error handling

**Key Functions**:

- `getOpenAIClient()`: Returns configured OpenAI instance
- `chatCompletion()`: Wrapper for chat completions with retry logic
- `estimateTokens()`: Estimate token count for text

**Configuration**:

- Model: GPT-4o-mini (gpt-4o-mini-2024-07-18)
- Temperature: 0.3 (deterministic outputs)
- Timeout: 60 seconds
- Max Retries: 3

### text-analyzer.ts

**Purpose**: Analyze text responses for sentiment, themes, and key phrases

**Main Function**: `analyzeTextResponses(input: TextAnalysisInput): Promise<TextAnalysisOutput>`

**Sub-Functions**:

- `detectSentiment()`: Sentiment analysis (-1 to 1 scale)
- `categorizeThemes()`: Extract and score themes
- `extractKeyPhrases()`: Identify important phrases
- `selectTopQuotes()`: Choose representative quotes
- `calculateWordFrequency()`: Word frequency analysis

**Input**:

```typescript
{
  questionId: string;
  questionText: string;
  responses: string[];
  respondentType: 'citizen' | 'official';
}
```

**Output**:

```typescript
{
  themes: AITheme[];              // Extracted themes with scores
  sentiment: {
    overall: number;               // -1 to 1
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  keyPhrases: string[];           // Important phrases
  topQuotes: string[];            // Representative quotes
  summary: string;                // AI-generated summary
}
```

### feature-extractor.ts

**Purpose**: Extract and prioritize feature requests from survey data

**Main Function**: `extractFeatures(input: FeatureExtractionInput): Promise<FeatureExtractionOutput>`

**Sub-Functions**:

- `extractExplicitFeatures()`: From multiple choice questions
- `extractImplicitFeatures()`: From text responses using AI
- `mergeFeatures()`: Deduplicate and normalize
- `calculatePriorityMatrix()`: Score and prioritize features
- `calculateROI()`: Return on Investment calculation
- `estimateEffort()`: Implementation effort estimation
- `getTopFeatures()`: Get top N prioritized features

**Priority Matrix**:

- **Popularity**: (mentions / total_responses) × 100
- **AI Importance**: GPT-4o-mini priority assessment (0-100)
- **Sentiment**: Average sentiment for feature mentions
- **ROI**: (popularity × normalized_sentiment) / effort
- **Priority**: high (ROI > 0.7), medium (0.4-0.7), low (<0.4)

### demographic-analyzer.ts

**Purpose**: Demographic analysis and cross-tabulation

**Main Function**: `analyzeDemographics(input: DemographicAnalysisInput): Promise<DemographicAnalysisOutput>`

**Sub-Functions**:

- `calculateAgeDistribution()`: Age category breakdown
- `calculateGeographicSpread()`: County/locality stats
- `generateCrossTabs()`: Cross-tabulation analysis
- `identifyCorrelations()`: Statistical correlations
- `calculatePearsonCorrelation()`: Pearson coefficient
- `chiSquareTest()`: Chi-square test for independence

**Cross-Tabulations**:

1. Age × Feature Preferences (Q4/Q8)
2. Location × Digital Readiness (Q3)
3. Frequency × Usefulness (Q1 × Q2)

**Statistical Tests**:

- Pearson Correlation: r coefficient, p-value
- Chi-Square: χ² statistic, p-value
- Significance: p < 0.05

### correlation-analyzer.ts

**Purpose**: Calculate statistical correlations between variables

**Main Function**: `calculateCorrelations(input: CorrelationInput): Promise<CorrelationOutput>`

**Sub-Functions**:

- `calculatePearsonCorrelation()`: Correlation coefficient
- `categorizeStrength()`: Classify correlation strength

**Correlations Analyzed**:

- Age × Digital Readiness
- Frequency of Use × Usefulness Rating
- Location × Feature Preferences
- Demographics × Sentiment Scores

**Output**:

```typescript
{
  variables: [string, string]; // e.g., ["age", "digital_readiness"]
  coefficient: number; // -1.00 to 1.00
  pValue: number; // Statistical significance
  significant: boolean; // p < 0.05
  strength: "weak" | "moderate" | "strong";
  interpretation: string; // Romanian explanation
}
```

### cohort-analyzer.ts

**Purpose**: Segment users into cohorts and compare characteristics

**Main Function**: `analyzeCohorts(input: CohortInput): Promise<CohortOutput>`

**Sub-Functions**:

- `identifyAgeCohorts()`: Age-based segmentation
- `identifyLocationCohorts()`: Urban/rural segmentation
- `identifyUsageCohorts()`: Frequency-based segmentation
- `analyzeCohortMetrics()`: Calculate cohort characteristics
- `compareCohorts()`: Pairwise comparisons

**Cohort Types**:

1. **Age**: Tineri (18-35), Maturi (36-60), Seniori (60+)
2. **Location**: Urban, Rural/Localități Mici
3. **Usage**: Frecvenți, Ocazionali, Rari

**Cohort Metrics**:

- Size (count, percentage)
- Digital Readiness (1-5 average)
- Sentiment Score (-1 to 1 average)
- Top 3 Problems (by frequency)

### insight-generator.ts

**Purpose**: Generate executive summaries and actionable recommendations

**Main Functions**:

- `generateExecutiveSummary()`: Overall research summary
- `generateQuestionInsight()`: Insight for specific question
- `generateAllInsights()`: Batch process all questions
- `generateRecommendations()`: Actionable recommendations
- `prioritizeRecommendations()`: Score and rank recommendations
- `generateComparativeInsights()`: Citizen vs Official comparison

**Recommendation Structure**:

```typescript
{
  action: string; // What to do
  priority: "high" | "medium" | "low";
  impact: string; // Expected outcome
  timeline: "quick-win" | "short-term" | "long-term";
  effort: "low" | "medium" | "high";
  reasoning: string; // Why this matters
  score: number; // 0-100 priority score
}
```

**Scoring Algorithm**:

```
Score = (Priority × 30) + (Timeline × 20) + (Effort × 20) + (Impact × 30)
```

## Usage Examples

### Example 1: Analyze Text Responses

```typescript
import { analyzeTextResponses } from "@/lib/ai/text-analyzer";

const result = await analyzeTextResponses({
  questionId: "q5_citizen",
  questionText: "Care este cel mai util serviciu?",
  responses: [
    "Cererile online sunt foarte utile",
    "Notificările automate mă ajută mult",
    // ... more responses
  ],
  respondentType: "citizen",
});

console.log(result.themes); // Extracted themes
console.log(result.sentiment); // Overall sentiment
console.log(result.topQuotes); // Representative quotes
```

### Example 2: Extract and Prioritize Features

```typescript
import { extractFeatures } from '@/lib/ai/feature-extractor';

const features = await extractFeatures({
  multipleChoiceData: [
    { questionId: 'q4_citizen', responses: [...] }
  ],
  textResponses: {
    q5_citizen: ['text1', 'text2'],
    q10_citizen: ['text3', 'text4']
  }
});

console.log(features.priorityMatrix);  // Sorted by ROI
```

### Example 3: Calculate Correlations

```typescript
import { calculateCorrelations } from '@/lib/ai/correlation-analyzer';

const correlations = await calculateCorrelations({
  respondents: [...],
  responses: [...]
});

correlations.forEach(corr => {
  if (corr.significant) {
    console.log(`${corr.variables[0]} ↔ ${corr.variables[1]}: r=${corr.coefficient}`);
  }
});
```

### Example 4: Analyze Cohorts

```typescript
import { analyzeCohorts } from '@/lib/ai/cohort-analyzer';

const cohortAnalysis = await analyzeCohorts({
  respondents: [...],
  responses: [...]
});

console.log(cohortAnalysis.cohorts);      // All cohorts
console.log(cohortAnalysis.comparisons);  // Pairwise comparisons
```

### Example 5: Generate Executive Summary

```typescript
import { generateExecutiveSummary } from '@/lib/ai/insight-generator';

const summary = await generateExecutiveSummary({
  questionAnalysis: [...],
  respondents: [...],
  responses: [...],
  featureData: {...},
  demographicData: {...}
});

console.log(summary.keyFindings);        // 3-5 bullet points
console.log(summary.overallSentiment);   // Aggregate sentiment
console.log(summary.researchValidity);   // Sample size assessment
```

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const result = await analyzeTextResponses(input);
} catch (error) {
  if (error instanceof OpenAIError) {
    // Handle OpenAI-specific errors (rate limits, API errors)
  } else if (error instanceof ValidationError) {
    // Handle input validation errors
  } else {
    // Handle unexpected errors
  }
}
```

**Common Errors**:

- `OpenAI API Error`: Rate limits, invalid API key, timeout
- `Insufficient Data`: Not enough responses for analysis
- `Invalid Input`: Missing required fields, invalid data types
- `Cache Error`: Failed to read/write cache

## Caching Strategy

All analysis functions support caching to reduce API costs:

**Cache Key Format**: `{analysis_type}:{question_id}:{respondent_type}:{response_hash}`

**Cache TTL**: 24 hours

**Cache Invalidation**:

- New responses submitted
- Manual regeneration requested
- Cache expired (>24h)

**Cache Storage**: `survey_analysis_cache` table in Supabase

## Performance Optimization

### Batch Processing

- Questions analyzed in batches of 3
- 1-second delay between batches (rate limit prevention)
- Parallel processing where possible (features, demographics, correlations)

### Token Optimization

- Concise prompts
- JSON mode for structured output
- Temperature 0.3 for consistent results (less token waste on retries)

### Cost Estimation

```
Single question analysis: ~1,500 tokens (~$0.001)
Complete analysis (10 questions): ~15,000 tokens (~$0.01)
Monthly cost (100 analyses): ~$1.00
```

## Testing

Unit tests available in `__tests__/` directory:

```bash
# Run all AI tests
pnpm test src/lib/ai/__tests__

# Run specific test file
pnpm test src/lib/ai/__tests__/text-analyzer.test.ts

# Run with coverage
pnpm test --coverage src/lib/ai
```

**Test Coverage Target**: >80% for all modules

## Type Safety

All functions are fully typed with TypeScript:

- Input/output interfaces in `src/types/survey-ai.ts`
- Strict mode enabled
- No `any` types (replaced with `unknown` where needed)

## Contributing

When adding new AI analysis functions:

1. **Add JSDoc comments** with:
   - Function description
   - `@param` for all parameters
   - `@returns` for return type
   - `@throws` for possible errors
   - `@example` usage code

2. **Add unit tests** with:
   - Happy path tests
   - Error handling tests
   - Edge case tests
   - Mock OpenAI responses

3. **Update this README** with:
   - Function signature
   - Usage example
   - Error handling notes

4. **Update RESEARCH_METHODOLOGY.md** if methodology changes

## Monitoring

Track OpenAI usage and costs:

```typescript
// Every analysis stores metadata
{
  model_version: 'gpt-4o-mini-2024-07-18',
  prompt_tokens: 1234,
  completion_tokens: 567,
  generated_at: '2025-01-02T10:00:00Z'
}
```

Query token usage:

```sql
SELECT
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  COUNT(*) as total_analyses
FROM survey_ai_insights
WHERE generated_at >= NOW() - INTERVAL '30 days';
```

## References

- **OpenAI API Docs**: https://platform.openai.com/docs
- **TypeScript Types**: `src/types/survey-ai.ts`
- **API Routes**: `src/app/api/survey/research/`
- **UI Components**: `src/components/admin/research/`

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Maintainer**: primariaTa❤️ Development Team
