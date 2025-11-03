# 📊 Research Dashboard - User Guide

## Table of Contents
- [Overview](#overview)
- [Accessing the Dashboard](#accessing-the-dashboard)
- [Dashboard Features](#dashboard-features)
- [Tabs Overview](#tabs-overview)
- [Export Functionality](#export-functionality)
- [Real-time Updates](#real-time-updates)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Research Dashboard provides AI-powered insights and comprehensive analysis of survey responses collected from citizens and officials. It transforms raw survey data into actionable insights through:

- **AI-Generated Insights**: Automated analysis using OpenAI's GPT-4o-mini
- **Interactive Visualizations**: Charts, graphs, and tables for data exploration
- **Demographic Analysis**: Breakdown by age, location, and respondent type
- **Feature Prioritization**: Data-driven recommendations for development
- **Professional Exports**: PDF, Excel, CSV, and JSON formats

---

## Accessing the Dashboard

### Prerequisites
- **Role Required**: Admin or Super Admin access
- **Authentication**: Must be logged into the platform
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### Navigation Path
1. Log in to the admin panel at `/admin`
2. Navigate to **Survey Dashboard** (`/admin/survey`)
3. Click on **"Analiză Cercetare AI"** card
4. You will be redirected to `/admin/survey/research`

---

## Dashboard Features

### 🎯 Real-time Connection
- **Status Indicator**: Green dot (🟢) shows "Real-time connected" in development
- **Auto-Refresh**: Dashboard automatically updates when new responses arrive
- **Auto-Analysis**: Triggers AI analysis 5 minutes after new response submission

### 📊 Data Validity
- **Minimum Threshold**: Displays warning if <15 responses
- **Validity Badge**:
  - ✅ Green badge when ≥15 responses (statistically valid)
  - ⚠️ Amber badge when <15 responses (limited validity)

---

## Tabs Overview

The dashboard is organized into **7 tabs**, each providing specific insights:

### 1️⃣ Prezentare Generală (Overview)

**Purpose**: High-level summary of research findings

**Contents**:
- **Summary Statistics**:
  - Total responses count
  - Citizens vs Officials breakdown
  - Geographic coverage (counties, localities)
  - Date range of collection

- **AI-Generated Key Findings**:
  - 3-5 strategic insights extracted by AI
  - Actionable recommendations
  - Numbered list format

- **Overall Sentiment Gauge**:
  - Score from -1.00 (very negative) to 1.00 (very positive)
  - Visual progress bar with color gradient
  - Sentiment label (Pozitiv/Negativ/Neutru/Mixt)

**Use Cases**:
- Quick executive summary for stakeholders
- Research validity check before deep analysis
- Understanding overall sentiment at a glance

---

### 2️⃣ Insight-uri AI (AI Insights)

**Purpose**: AI-powered thematic analysis and recommendations

**Contents**:
- **Theme Cloud**:
  - Visual display of extracted themes
  - Size indicates theme prevalence (score)
  - Color indicates sentiment:
    - 🟢 Green: Positive (>0.3)
    - 🟡 Yellow: Neutral (-0.3 to 0.3)
    - 🔴 Red: Negative (<-0.3)
  - Mention count badges

- **Feature Priority Matrix**:
  - Sortable table with columns:
    - Feature name
    - Mentions count
    - Priority (🔴 High, 🟡 Medium, 🟢 Low)
    - AI Score (0-100)
    - ROI (Return on Investment, 0-10)
  - Click column headers to sort

- **AI Recommendations**:
  - Actionable items with priority levels
  - Timeline indicators:
    - ⚡ Quick Win (< 1 month)
    - 📅 Short-term (1-3 months)
    - 📆 Long-term (3+ months)
  - Effort labels:
    - 🟢 Low effort
    - 🟡 Medium effort
    - 🔴 High effort
  - Impact descriptions
  - Expandable reasoning (click "Details" to expand)

**Use Cases**:
- Identifying most requested features
- Prioritizing development roadmap
- Understanding user pain points
- Strategic planning based on AI recommendations

---

### 3️⃣ Insight-uri Holistice (Holistic Insights)

**Purpose**: Cross-question analysis and synthesis

**Contents**:
- **Executive Summary**:
  - Key findings across all questions
  - Patterns identified by AI
  - Strategic recommendations

- **Cross-Question Patterns**:
  - Themes appearing in multiple questions
  - Correlations between different response areas
  - Consistency vs inconsistency detection

**Use Cases**:
- Understanding big-picture trends
- Identifying contradictions in responses
- Strategic synthesis for decision-making

---

### 4️⃣ Analiză pe Întrebări (Question Analysis)

**Purpose**: Detailed analysis for each survey question

**Contents**:
- **Tabbed Interface**:
  - **Cetățeni** (Citizens): 10 questions analyzed
  - **Funcționari** (Officials): 12 questions analyzed

- **Question Cards** (varies by type):

  **Single Choice Questions**:
  - Progress bars for each option
  - Percentage labels
  - Count + percentage display
  - Example: Q3 (Digital readiness)

  **Multiple Choice Questions**:
  - Progress bars for each option
  - Percentage labels (can exceed 100% total)
  - Example: Q4 (Citizen features), Q8 (Official features)

  **Text Questions**:
  - AI-extracted themes (tag cloud)
  - Representative quotes with citations
  - Theme mention counts
  - Sentiment-based coloring
  - Example: Q5 (Most useful), Q10/Q12 (Suggestions)

  **Rating Questions**:
  - Average rating with star icon
  - Distribution histogram (5-1 stars)
  - Percentage bars per rating level
  - Example: Q2 (Usefulness rating)

- **AI Interpretation Panel** (blue box):
  - 2-3 sentence summary
  - Key insights
  - Recommendations specific to question

**Use Cases**:
- Deep dive into specific questions
- Understanding response distribution
- Reading actual citizen/official quotes
- Identifying themes per question

---

### 5️⃣ Corelări (Correlations)

**Purpose**: Statistical relationships between variables

**Contents**:
- **Key Findings Summary**:
  - Count of significant correlations
  - Statistical significance note

- **Correlation Table**:
  - Sortable by strength
  - Columns:
    - Variables (A ↔ B)
    - Coefficient (-1.00 to 1.00)
    - Strength (Weak/Moderate/Strong)
    - Significance (p-value < 0.05)
    - Interpretation (Romanian explanation)

- **Correlation Examples**:
  - Age × Digital readiness
  - Frequency of use × Usefulness rating
  - Location (urban/rural) × Feature preferences
  - Demographics × Sentiment scores

**Use Cases**:
- Understanding relationships between demographics and preferences
- Identifying target audiences for features
- Data-driven segmentation strategies

---

### 6️⃣ Cohorte (Cohorts)

**Purpose**: Group analysis and comparison

**Contents**:
- **Summary Cards**:
  - Total cohorts count
  - Largest cohort
  - Smallest cohort
  - Most engaged segment

- **Cohort Types**:
  - **Age Cohorts**:
    - Tineri Nativi Digitali (18-35)
    - Maturi Activi (36-60)
    - Seniori (60+)
  - **Location Cohorts**:
    - Urban (orașe mari)
    - Rural/Localități Mici
  - **Usage Cohorts**:
    - Utilizatori Frecvenți
    - Ocazionali
    - Rari

- **Cohort Cards**:
  - Size (count + percentage)
  - Progress bar visualization
  - Digital readiness score
  - Sentiment score
  - Top 3 problems/concerns

- **Comparison Section**:
  - Pairwise comparisons (e.g., "Tineri vs Maturi")
  - Click to expand comparison details
  - Sentiment difference (Δ)
  - Digital readiness difference (Δ)
  - Key insights
  - Actionable recommendations

**Use Cases**:
- Segmented feature development
- Targeted communication strategies
- Understanding generational differences
- Urban vs rural digital divide analysis

---

### 7️⃣ Demografice (Demographics)

**Purpose**: Respondent demographic breakdown

**Contents**:
- **Respondent Type Split**:
  - Citizens vs Officials percentage bars
  - Count display with icons

- **County Distribution**:
  - All counties with response counts
  - Gradient progress bars (blue to green)
  - Locality count badges
  - Citizen/Official breakdown per county
  - Percentage of total responses

- **Top 10 Localities**:
  - Numbered ranking badges (1-10)
  - County + locality name
  - Citizen/Official icon counts
  - Progress bars scaled to max locality

**Use Cases**:
- Geographic representation analysis
- Identifying underrepresented areas
- Planning regional rollouts
- Ensuring balanced sampling

---

### 8️⃣ Export (Export)

**Purpose**: Download research data in various formats

**Contents**: See [Export Functionality](#export-functionality) section below

---

## Export Functionality

### 📄 PDF Executive Report

**Description**: Professional summary report for stakeholders

**Contents**:
- Executive Summary
  - Total responses, date range, geographic coverage
  - Research validity badge
  - Key findings (3-5 bullet points)
  - Overall sentiment gauge

- Demographics
  - Respondent type breakdown
  - County distribution
  - Top localities

- AI Insights
  - Top 15 themes with scores
  - Top 10 features by priority
  - AI recommendations

- Question Analysis
  - Summary per question
  - Charts and visualizations

**Format**: PDF (A4, portrait)

**Filename**: `research-report-YYYY-MM-DD.pdf`

**Use Cases**:
- Presentations to stakeholders
- Executive briefings
- Documentation for archives

---

### 📊 Excel Raw Data

**Description**: Comprehensive data export for analysis

**Worksheets**:
1. **Rezumat** (Summary):
   - Overview statistics
   - Geographic coverage
   - Response counts

2. **Respondenți** (Respondents):
   - Full respondent details
   - Demographics (age, location, department)
   - Completion date

3. **Insight-uri AI** (AI Insights):
   - AI-generated insights per question
   - Themes, sentiment scores
   - Feature requests
   - Recommendations

4. **Teme** (Themes):
   - All extracted themes
   - Theme scores, mentions
   - Sentiment per theme
   - Keywords

5. **Răspunsuri Brute** (Raw Responses) [Optional]:
   - All survey responses
   - Question text + response text
   - Respondent ID linkage

**Format**: XLSX (Excel 2007+)

**Filename**: `survey-data-YYYY-MM-DD.xlsx`

**Features**:
- Auto-sized columns
- Formatted headers (gray background)
- Filters enabled on all sheets

**Use Cases**:
- Custom analysis in Excel/PowerBI
- Data archiving
- Integration with other tools
- Statistical analysis

---

### 📋 CSV Export

**Description**: Simple comma-separated values export

**Contents**:
- Survey responses with metadata
- One row per response
- Columns: Question ID, Question Text, Response Text, Respondent Type, Date

**Format**: CSV (UTF-8 with BOM for Excel compatibility)

**Filename**: `survey-responses-YYYY-MM-DD.csv`

**Features**:
- UTF-8 BOM prefix (`\uFEFF`)
- Proper escaping (commas, quotes, newlines)
- Compatible with Excel, Google Sheets

**Use Cases**:
- Quick import to spreadsheet software
- Database imports
- Scripting and automation

---

### 🔗 JSON Export

**Description**: Machine-readable structured data

**Contents**:
- **Metadata**:
  - exportedAt timestamp
  - exportedBy user ID
  - Total counts (responses, citizens, officials)
  - Applied filters

- **Summary Statistics**:
  - County count
  - Locality count
  - Average sentiment

- **Respondents**: Full respondent objects

- **Insights**: AI-generated insights with all fields

- **Raw Responses** [Optional]: Survey responses array

**Format**: JSON (pretty-printed, 2-space indentation)

**Filename**: `survey-data-YYYY-MM-DD.json`

**Use Cases**:
- API integrations
- Data pipelines
- Programmatic analysis
- Custom visualizations

---

### Export Options

**Filters Available**:
- `respondent_type`: Filter by "citizen" or "official"
- `include_raw_data`: Include/exclude raw survey responses (Excel & JSON only)

**Disabled State**:
- All export buttons are disabled when `totalResponses === 0`
- Error message: "Nu există răspunsuri pentru export"

**Loading States**:
- Buttons show spinner (Loader2) during generation
- Success state with checkmark icon (CheckCircle2)
- Auto-reset after 3 seconds

**GDPR Compliance**:
- Export panel includes GDPR compliance note
- Warning about personal data handling
- Reminder to secure exported files

---

## Real-time Updates

### How It Works

**Subscription**:
- Dashboard subscribes to `survey_respondents` table (INSERT events)
- Dashboard subscribes to `survey_responses` table (INSERT events)
- WebSocket connection via Supabase Realtime

**Debouncing**:
- 2-second delay prevents excessive refreshes
- Multiple rapid submissions are batched

**Auto-Analysis**:
- Triggers after 5 minutes of inactivity
- Background POST to `/api/survey/research/analyze`
- Updates all AI insights automatically

**User Feedback**:
- Toast notification: "Răspuns nou primit! Actualizare date..." (New response received! Updating data...)
- Success notification: "Analiză completată cu succes!" (Analysis completed successfully!)
- Connection indicator: 🟢 Real-time connected (development mode only)

### Benefits
- No manual refresh needed
- Always shows latest data
- Automatic AI analysis when new responses arrive
- Seamless user experience

---

## Troubleshooting

### ❌ "Nu a fost încă generat un insight AI pentru această întrebare"

**Problem**: Missing AI insights for a question

**Cause**: AI analysis not yet triggered or failed

**Solution**:
1. Navigate to any tab
2. AI analysis should auto-trigger if new responses exist
3. Wait 5 minutes after last response for auto-analysis
4. Refresh page to check for updates
5. Contact admin if issue persists

---

### ❌ Empty Charts or "Fără date disponibile"

**Problem**: No data displayed in charts

**Cause**:
- No responses yet collected
- Filter applied with no matching data
- Cache issue

**Solution**:
1. Check total responses count in Overview tab
2. Verify filters are correct
3. Try refreshing the page (Ctrl+R / Cmd+R)
4. Clear browser cache if issue persists

---

### ❌ Export Fails or Hangs

**Problem**: Export button stuck in loading state

**Cause**:
- Large dataset processing
- Network timeout
- Server error

**Solution**:
1. Wait up to 30 seconds for large exports
2. Check browser console for errors (F12 > Console)
3. Try exporting with filters to reduce data size
4. Contact admin with error message

---

### ❌ Real-time Updates Not Working

**Problem**: Dashboard doesn't refresh when new responses arrive

**Cause**:
- WebSocket connection failed
- Network firewall blocking WebSockets
- Supabase Realtime not enabled

**Solution**:
1. Check connection indicator (🟢 should be visible in dev mode)
2. Refresh page to re-establish connection
3. Verify network allows WebSocket connections
4. Contact admin to verify Supabase Realtime is enabled

---

### ❌ Slow Page Load (>5 seconds)

**Problem**: Dashboard takes long time to load

**Cause**:
- Large number of responses (>100)
- Slow network connection
- Server processing time

**Solution**:
1. Check network connection speed
2. Use filters to reduce data load
3. Contact admin if consistent across sessions
4. Consider pagination for large datasets

---

## Best Practices

### For Data Interpretation

1. **Check Sample Size**: Always verify total responses before drawing conclusions
2. **Consider Validity Badge**: Amber badge (<15 responses) = limited statistical validity
3. **Cross-Reference Tabs**: Compare insights across multiple tabs for confirmation
4. **Read AI Interpretations**: Don't just look at numbers, read the AI explanations
5. **Check Sentiment Context**: Negative sentiment doesn't always mean bad feature - might indicate urgency

### For Export Usage

1. **Use PDF for Presentations**: Best for stakeholders and executives
2. **Use Excel for Analysis**: Best for custom analysis and data manipulation
3. **Use CSV for Quick Import**: Best for spreadsheet software
4. **Use JSON for Integrations**: Best for programmatic access

### For Decision-Making

1. **Prioritize High ROI Features**: Look at feature priority matrix in AI Insights tab
2. **Consider Cohort Differences**: Different user groups have different needs
3. **Validate with Correlations**: Use correlation tab to understand relationships
4. **Read Actual Quotes**: Don't rely only on themes, read actual citizen/official quotes
5. **Track Timeline**: Use recommendation timelines (Quick Win vs Long-term)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between tabs |
| `Shift + Tab` | Navigate backwards between tabs |
| `Arrow Keys` | Navigate in sortable tables |
| `Enter` | Activate focused button/link |
| `Ctrl/Cmd + R` | Refresh page |

---

## Support

**For Technical Issues**:
- Check browser console (F12 > Console) for errors
- Take screenshot of error message
- Contact system administrator

**For Data Questions**:
- Verify research methodology documentation
- Check AI model version in insights metadata
- Contact research team for interpretation assistance

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Dashboard URL**: `/admin/survey/research`
