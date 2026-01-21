import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { inviteStaffSchema } from "@/lib/validations/staff-invite";
import { ZodError } from "zod";

/**
 * POST /api/admin/users/invite
 * Create a new staff invitation and send invitation email
 *
 * Authorization: admin, super_admin only
 *
 * Request Body:
 * - email: string (validated, normalized)
 * - nume: string (last name, 2-100 chars)
 * - prenume: string (first name, 2-100 chars)
 * - rol: "functionar" | "admin" (cannot invite super_admin)
 * - primarie_id: UUID
 * - departament?: string (optional)
 * - permisiuni?: Record<string, boolean> (optional)
 *
 * Security Checks:
 * - Admin/super_admin authentication required
 * - Cannot invite super_admin (security policy)
 * - Check existing user with same email
 * - Check pending invitation for same email
 * - RLS enforces primarie_id match for admin
 *
 * Response:
 * - 201 Created: { invitationId, token, expiresAt, inviteLink }
 * - 400 Bad Request: Validation errors, duplicate email, super_admin attempt
 * - 401 Unauthorized: No authentication
 * - 403 Forbidden: Insufficient permissions
 * - 500 Internal Server Error: Database or email sending errors
 */
export async function POST(request: Request) {
  try {
    // ===================================================================
    // STEP 1: Authentication Check
    // ===================================================================

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // ===================================================================
    // STEP 2: Authorization Check (Admin/Super Admin)
    // ===================================================================

    const { data: userData, error: userError } = await authClient
      .from("utilizatori")
      .select("rol, primarie_id, nume, prenume")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!["admin", "super_admin"].includes(userData.rol)) {
      return NextResponse.json(
        { error: "Forbidden - Admin or super admin role required" },
        { status: 403 }
      );
    }

    // ===================================================================
    // STEP 3: Parse and Validate Request Body
    // ===================================================================

    const body = await request.json();

    let validatedData;
    try {
      validatedData = inviteStaffSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // ===================================================================
    // STEP 4: Security Check - Cannot Invite Super Admin
    // ===================================================================
    // Note: Zod validation already enforces rol is only "functionar" or "admin"
    // No super_admin check needed here as it's handled by schema validation

    // ===================================================================
    // STEP 5: Authorization Check - Primărie Match (for admin)
    // ===================================================================

    // Super admin can invite to any primărie, admin only to their own
    if (userData.rol === "admin" && userData.primarie_id !== validatedData.primarie_id) {
      return NextResponse.json(
        { error: "Forbidden - Cannot create invitations for other primării" },
        { status: 403 }
      );
    }

    // ===================================================================
    // STEP 6: Check for Existing User with Same Email
    // ===================================================================

    const supabase = createServiceRoleClient();

    const { data: existingUser } = await supabase
      .from("utilizatori")
      .select("id, email")
      .eq("email", validatedData.email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // ===================================================================
    // STEP 7: Check for Pending Invitation with Same Email
    // ===================================================================

    const { data: existingInvitation } = await supabase
      .from("user_invitations")
      .select("id, email, status, expires_at")
      .eq("email", validatedData.email.toLowerCase())
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 400 }
      );
    }

    // ===================================================================
    // STEP 8: Create Invitation
    // ===================================================================

    const { data: invitation, error: invitationError } = await supabase
      .from("user_invitations")
      .insert({
        email: validatedData.email.toLowerCase(),
        nume: validatedData.nume,
        prenume: validatedData.prenume,
        rol: validatedData.rol,
        primarie_id: validatedData.primarie_id,
        departament: validatedData.departament || null,
        permisiuni: validatedData.permisiuni || {},
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select("id, token, expires_at, email, nume, prenume, rol")
      .single();

    if (invitationError || !invitation) {
      console.error("Failed to create invitation:", invitationError);
      return NextResponse.json(
        { error: "Failed to create invitation", details: invitationError?.message },
        { status: 500 }
      );
    }

    // ===================================================================
    // STEP 9: Generate Invite Link
    // ===================================================================

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/auth/accept-invite?token=${invitation.token}`;

    // ===================================================================
    // STEP 10: Send Invitation Email via Edge Function
    // ===================================================================

    try {
      const emailPayload = {
        type: "staff_invitation",
        toEmail: invitation.email,
        toName: `${invitation.prenume} ${invitation.nume}`,
        inviteToken: invitation.token,
        inviteLink,
        expiresAt: invitation.expires_at,
        rol: invitation.rol,
        inviterName: `${userData.prenume} ${userData.nume}`,
      };

      const emailResponse = await supabase.functions.invoke("send-email", {
        body: emailPayload,
      });

      if (emailResponse.error) {
        console.error("Failed to send invitation email:", emailResponse.error);
        // Don't fail the request - invitation is created, email can be resent
        // Log the error but continue
      }
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Non-critical - invitation is still created
    }

    // ===================================================================
    // STEP 11: Return Success Response
    // ===================================================================

    return NextResponse.json(
      {
        message: "Invitation created successfully",
        invitation: {
          id: invitation.id,
          token: invitation.token,
          expiresAt: invitation.expires_at,
          inviteLink,
          email: invitation.email,
          nume: invitation.nume,
          prenume: invitation.prenume,
          rol: invitation.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/users/invite:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
