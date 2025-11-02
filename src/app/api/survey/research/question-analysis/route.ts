import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/survey/research/question-analysis
 *
 * Returns statistical analysis for each survey question
 *
 * Response:
 * {
 *   success: boolean
 *   citizenInsights: QuestionInsight[]
 *   officialInsights: QuestionInsight[]
 * }
 */
export async function GET() {
  try {
    // Create Supabase client with service role for full data access
    const supabase = await createClient();

    // Fetch all questions
    const { data: questions, error: questionsError } = await supabase
      .from("survey_questions")
      .select("*")
      .order("order_index", { ascending: true });

    if (questionsError) {
      console.error("[Question Analysis] Questions fetch error:", questionsError);
      return NextResponse.json({ success: false, error: questionsError.message }, { status: 500 });
    }

    // Fetch all responses
    const { data: responses, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*");

    if (responsesError) {
      console.error("[Question Analysis] Responses fetch error:", responsesError);
      return NextResponse.json({ success: false, error: responsesError.message }, { status: 500 });
    }

    // Process each question
    const citizenInsights = [];
    const officialInsights = [];

    for (const question of questions || []) {
      // Get responses for this question
      const questionResponses = responses?.filter((r) => r.question_id === question.id) || [];

      // Skip if no responses
      if (questionResponses.length === 0) continue;

      // Determine respondent type from question's survey_type
      const respondentType = question.survey_type as "citizen" | "official";

      // Build insight based on question type
      const insight: Record<string, unknown> = {
        questionId: question.id,
        questionText: question.question_text,
        questionType: question.question_type,
        respondentType: respondentType,
        totalResponses: questionResponses.length,
      };

      // Analyze based on question type
      if (
        question.question_type === "single_choice" ||
        question.question_type === "multiple_choice"
      ) {
        // Choice analysis
        const choiceCounts: { [key: string]: number } = {};
        let totalChoices = 0;

        for (const response of questionResponses) {
          const choices = response.answer_choices;
          if (Array.isArray(choices)) {
            // Multiple choice
            for (const choice of choices) {
              if (typeof choice === "string") {
                choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
                totalChoices++;
              }
            }
          } else if (typeof choices === "string") {
            // Single choice stored as string
            choiceCounts[choices] = (choiceCounts[choices] || 0) + 1;
            totalChoices++;
          }
        }

        // Convert to choices array
        insight.choices = Object.entries(choiceCounts)
          .map(([option, count]) => ({
            option,
            count,
            percentage: totalChoices > 0 ? (count / totalChoices) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);
      } else if (question.question_type === "rating") {
        // Rating analysis
        const ratings = questionResponses
          .map((r) => r.answer_rating)
          .filter((r): r is number => typeof r === "number");

        if (ratings.length > 0) {
          const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          insight.averageRating = Math.round(avgRating * 10) / 10;

          // Calculate distribution
          const ratingCounts: { [key: number]: number } = {};
          for (const rating of ratings) {
            ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
          }

          insight.ratingDistribution = Object.entries(ratingCounts)
            .map(([rating, count]) => ({
              rating: Number(rating),
              count,
              percentage: (count / ratings.length) * 100,
            }))
            .sort((a, b) => a.rating - b.rating);
        }
      } else if (question.question_type === "text" || question.question_type === "short_text") {
        // Text analysis - extract top quotes
        const textResponses = questionResponses
          .map((r) => r.answer_text)
          .filter((t): t is string => typeof t === "string" && t.trim().length > 0);

        if (textResponses.length > 0) {
          // Get top 5 quotes (by length or randomly)
          insight.topQuotes = textResponses.slice(0, 5);

          // Basic keyword extraction (simple word frequency)
          const words = textResponses
            .join(" ")
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 4); // Filter short words

          const wordCounts: { [key: string]: number } = {};
          for (const word of words) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }

          // Get top themes
          insight.themes = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, mentions]) => ({
              name,
              mentions,
              sentiment: 0, // Neutral for now
            }));
        }
      }

      // Add to appropriate array
      if (respondentType === "citizen") {
        citizenInsights.push(insight);
      } else {
        officialInsights.push(insight);
      }
    }

    console.log(
      `[Question Analysis] Generated analysis for ${citizenInsights.length} citizen questions, ${officialInsights.length} official questions`
    );

    return NextResponse.json({
      success: true,
      citizenInsights,
      officialInsights,
    });
  } catch (error) {
    console.error("[Question Analysis] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
