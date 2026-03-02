import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface UserProfile {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  rol: string;
  departament: string | null;
  permisiuni: Record<string, unknown> | null;
  primarie_id: string | null;
  localitate_id: number | null;
  avatar_url: string | null;
  telefon: string | null;
  cnp: string | null;
  activ: boolean | null;
}

/**
 * GET /api/user/profile
 *
 * Fetch authenticated user's profile with role information
 *
 * Returns:
 * - 200: User profile data
 * - 401: Not authenticated
 * - 404: User profile not found
 * - 500: Server error
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Not authenticated",
            code: "AUTH_REQUIRED",
          },
        },
        { status: 401 }
      );
    }

    // Fetch user profile from utilizatori table
    const { data: profile, error: profileError } = await supabase
      .from("utilizatori")
      .select(
        `
        id,
        email,
        nume,
        prenume,
        rol,
        departament,
        permisiuni,
        primarie_id,
        localitate_id,
        avatar_url,
        telefon,
        cnp,
        activ
      `
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      logger.error("Profile fetch error:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Failed to fetch user profile",
            code: "PROFILE_FETCH_ERROR",
            details: profileError.message,
          },
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User profile not found",
            code: "PROFILE_NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (profile.activ === false) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User account is deactivated",
            code: "ACCOUNT_DEACTIVATED",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile as UserProfile,
    });
  } catch (error) {
    logger.error("Unexpected error in /api/user/profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
