import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/survey/responses/[respondentId]
 *
 * Fetches all survey responses for a specific respondent
 * Requires admin or super_admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ respondentId: string }> }
) {
  try {
    const { respondentId } = await params;

    // Check authentication with regular client
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role
    const { data: userData } = await authClient
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service role client to fetch responses (bypasses RLS)
    const supabase = createServiceRoleClient();
    const { data: responses, error } = await supabase
      .from("survey_responses")
      .select("id, question_id, question_type, answer_text, answer_choices, answer_rating")
      .eq("respondent_id", respondentId)
      .order("created_at");

    if (error) {
      console.error("Error fetching responses:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/survey/responses/[respondentId]
 *
 * Deletes a respondent and all their survey responses
 * Requires admin or super_admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ respondentId: string }> }
) {
  try {
    const { respondentId } = await params;

    // Check authentication with regular client
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role
    const { data: userData } = await authClient
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service role client to delete (bypasses RLS)
    const supabase = createServiceRoleClient();

    // First delete all responses for this respondent
    const { error: responsesError } = await supabase
      .from("survey_responses")
      .delete()
      .eq("respondent_id", respondentId);

    if (responsesError) {
      console.error("Error deleting responses:", responsesError);
      return NextResponse.json({ error: responsesError.message }, { status: 500 });
    }

    // Then delete the respondent
    const { error: respondentError } = await supabase
      .from("survey_respondents")
      .delete()
      .eq("id", respondentId);

    if (respondentError) {
      console.error("Error deleting respondent:", respondentError);
      return NextResponse.json({ error: respondentError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Respondent șters cu succes" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
