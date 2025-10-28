import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { PersonalDataForm, RespondentType, SurveyAnswer } from "@/types/survey";

export const runtime = "nodejs";

interface SubmitSurveyRequest {
  personalData: PersonalDataForm;
  respondentType: RespondentType;
  answers: Record<string, SurveyAnswer>;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitSurveyRequest = await request.json();
    const { personalData, respondentType, answers } = body;

    // Validate required fields
    if (!personalData || !respondentType || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use service role client to bypass RLS for public survey submission
    const supabase = createServiceRoleClient();

    // Get IP address and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    // 1. Insert respondent data
    const { data: respondent, error: respondentError } = await supabase
      .from("survey_respondents")
      .insert({
        first_name: personalData.firstName,
        last_name: personalData.lastName,
        email: personalData.email || null,
        age_category: personalData.ageCategory || null,
        county: personalData.county,
        locality: personalData.locality,
        respondent_type: respondentType,
        department: null, // Will be added later if needed
        ip_address: ipAddress,
        user_agent: userAgent,
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (respondentError) {
      console.error("Error inserting respondent:", respondentError);
      return NextResponse.json(
        { error: "Failed to save respondent data", details: respondentError.message },
        { status: 500 }
      );
    }

    // 2. Prepare answers for bulk insert
    const responsesToInsert = Object.values(answers).map((answer) => {
      const baseResponse = {
        respondent_id: respondent.id,
        question_id: answer.questionId,
        question_type: answer.questionType,
      };

      // Map answer data based on question type
      switch (answer.questionType) {
        case "multiple_choice":
          return {
            ...baseResponse,
            answer_text: null,
            answer_choices: answer.answerChoices || [],
            answer_rating: null,
          };

        case "single_choice":
          return {
            ...baseResponse,
            answer_text: null,
            answer_choices: answer.answerText ? [answer.answerText] : [],
            answer_rating: null,
          };

        case "rating":
          return {
            ...baseResponse,
            answer_text: null,
            answer_choices: null,
            answer_rating: answer.answerText ? parseInt(answer.answerText, 10) : null,
          };

        case "text":
        case "short_text":
        default:
          return {
            ...baseResponse,
            answer_text: answer.answerText || null,
            answer_choices: null,
            answer_rating: null,
          };
      }
    });

    // 3. Insert all responses
    const { error: responsesError } = await supabase
      .from("survey_responses")
      .insert(responsesToInsert);

    if (responsesError) {
      console.error("Error inserting responses:", responsesError);
      return NextResponse.json(
        { error: "Failed to save survey responses", details: responsesError.message },
        { status: 500 }
      );
    }

    // Return success with respondent ID
    return NextResponse.json({
      success: true,
      respondentId: respondent.id,
      message: "Survey submitted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
