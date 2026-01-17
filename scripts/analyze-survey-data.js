#!/usr/bin/env node

/**
 * Survey Data Analysis Script
 *
 * Connects to Supabase and retrieves all survey data for comprehensive analysis
 * Outputs JSON data that can be analyzed by Claude Code
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@supabase/supabase-js");

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!SUPABASE_URL);
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!SERVICE_ROLE_KEY);
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fetchSurveyData() {
  console.log("🔍 Connecting to Supabase...\n");

  try {
    // 1. Fetch all respondents
    const { data: respondents, error: respondentsError } = await supabase
      .from("survey_respondents")
      .select("*")
      .order("created_at", { ascending: false });

    if (respondentsError) throw respondentsError;

    // 2. Fetch all responses
    const { data: responses, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (responsesError) throw responsesError;

    // 3. Fetch survey questions
    const { data: questions, error: questionsError } = await supabase
      .from("survey_questions")
      .select("*")
      .order("survey_type", { ascending: true })
      .order("question_number", { ascending: true });

    if (questionsError) throw questionsError;

    // Build comprehensive dataset
    const dataset = {
      metadata: {
        fetched_at: new Date().toISOString(),
        total_respondents: respondents.length,
        total_responses: responses.length,
        total_questions: questions.length,
      },
      respondents: respondents,
      responses: responses,
      questions: questions,

      // Aggregate statistics
      statistics: {
        completed_surveys: respondents.filter((r) => r.is_completed).length,
        draft_surveys: respondents.filter((r) => !r.is_completed).length,
        citizen_count: respondents.filter((r) => r.respondent_type === "citizen").length,
        official_count: respondents.filter((r) => r.respondent_type === "official").length,
        completion_rate:
          respondents.length > 0
            ? (
                (respondents.filter((r) => r.is_completed).length / respondents.length) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
    };

    // Group responses by respondent for easier analysis
    const responsesByRespondent = {};
    responses.forEach((response) => {
      if (!responsesByRespondent[response.respondent_id]) {
        responsesByRespondent[response.respondent_id] = [];
      }
      responsesByRespondent[response.respondent_id].push(response);
    });

    dataset.responses_by_respondent = responsesByRespondent;

    // Group responses by question for aggregate analysis
    const responsesByQuestion = {};
    responses.forEach((response) => {
      if (!responsesByQuestion[response.question_id]) {
        responsesByQuestion[response.question_id] = {
          question_id: response.question_id,
          question_type: response.question_type,
          responses: [],
        };
      }
      responsesByQuestion[response.question_id].responses.push(response);
    });

    dataset.responses_by_question = responsesByQuestion;

    // Print summary
    console.log("✅ Data fetched successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Total Respondents: ${dataset.metadata.total_respondents}`);
    console.log(`   - Completed: ${dataset.statistics.completed_surveys}`);
    console.log(`   - Draft: ${dataset.statistics.draft_surveys}`);
    console.log(`   - Citizens: ${dataset.statistics.citizen_count}`);
    console.log(`   - Officials: ${dataset.statistics.official_count}`);
    console.log(`   Completion Rate: ${dataset.statistics.completion_rate}`);
    console.log(`   Total Responses: ${dataset.metadata.total_responses}`);
    console.log(`   Total Questions: ${dataset.metadata.total_questions}\n`);

    // Output JSON for Claude analysis
    console.log("📄 Full dataset (JSON):");
    console.log(JSON.stringify(dataset, null, 2));

    return dataset;
  } catch (error) {
    console.error("❌ Error fetching survey data:", error);
    process.exit(1);
  }
}

// Run the script
fetchSurveyData();
