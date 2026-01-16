/**
 * Authorization Helpers
 *
 * Reusable functions for verifying user permissions and resource ownership.
 * These helpers enforce the principle of least privilege and provide
 * consistent authorization checks across all API routes.
 *
 * Security Philosophy:
 * - Explicit > Implicit: Always check authorization explicitly, don't rely solely on RLS
 * - Fail Secure: Return 403 Forbidden by default if ownership cannot be verified
 * - Audit Trail: Log authorization failures for security monitoring
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types/api";
import * as Sentry from "@sentry/nextjs";

/**
 * User roles in the system
 */
export enum UserRole {
  CETATEAN = "cetatean",
  FUNCTIONAR = "functionar",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

/**
 * Get authenticated user from Supabase session
 *
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication - returns 401 response if not authenticated
 *
 * @param request - The incoming request (for logging IP)
 * @returns NextResponse with 401 error or null if authenticated
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const authError = await requireAuth(request);
 *   if (authError) return authError;
 *
 *   // User is authenticated, proceed...
 * }
 * ```
 */
export async function requireAuth(request: Request): Promise<NextResponse | null> {
  const user = await getCurrentUser();

  if (!user) {
    // Log authentication failure
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    logSecurityEvent({
      type: "auth",
      action: "unauthorized_access_attempt",
      ip,
      success: false,
      metadata: { url: new URL(request.url).pathname },
    });

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Autentificare necesară",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  return null;
}

/**
 * Verify that a resource belongs to the authenticated user
 *
 * @param resourceUserId - The user ID that owns the resource
 * @param request - The incoming request (for logging)
 * @param resourceType - Type of resource (for error messages and logging)
 * @returns NextResponse with 403 error or null if authorized
 *
 * @example
 * ```typescript
 * const cerere = await getCerere(id);
 * const ownershipError = await requireOwnership(cerere.solicitant_id, request, "cerere");
 * if (ownershipError) return ownershipError;
 * ```
 */
export async function requireOwnership(
  resourceUserId: string,
  request: Request,
  resourceType: string
): Promise<NextResponse | null> {
  const user = await getCurrentUser();

  if (!user) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Autentificare necesară",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  if (resourceUserId !== user.id) {
    // Log authorization failure
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    logSecurityEvent({
      type: "authz",
      action: "ownership_violation",
      userId: user.id,
      ip,
      success: false,
      metadata: {
        resourceType,
        attemptedResourceUserId: resourceUserId,
        url: new URL(request.url).pathname,
      },
    });

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: `Nu aveți permisiunea de a accesa acest ${resourceType}`,
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 403 });
  }

  return null;
}

/**
 * Verify that user has a specific role
 *
 * @param allowedRoles - Array of roles that are allowed
 * @param request - The incoming request (for logging)
 * @returns NextResponse with 403 error or null if authorized
 *
 * @example
 * ```typescript
 * const roleError = await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN], request);
 * if (roleError) return roleError;
 * ```
 */
export async function requireRole(
  allowedRoles: UserRole[],
  request: Request
): Promise<NextResponse | null> {
  const user = await getCurrentUser();

  if (!user) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Autentificare necesară",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  // Fetch user role from database
  const supabase = await createClient();
  const { data: userData, error } = await supabase
    .from("utilizatori")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    console.error("Error fetching user role:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare la verificarea permisiunilor",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }

  const userRole = userData.rol as UserRole;

  if (!allowedRoles.includes(userRole)) {
    // Log authorization failure
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    logSecurityEvent({
      type: "authz",
      action: "role_violation",
      userId: user.id,
      ip,
      success: false,
      metadata: {
        userRole,
        requiredRoles: allowedRoles,
        url: new URL(request.url).pathname,
      },
    });

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Nu aveți permisiunea necesară pentru această acțiune",
        details: {
          required_roles: allowedRoles,
        },
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 403 });
  }

  return null;
}

/**
 * Validate UUID format for route parameters
 *
 * @param id - The ID to validate
 * @param paramName - Name of the parameter (for error messages)
 * @returns NextResponse with 400 error or null if valid
 *
 * @example
 * ```typescript
 * const { id } = await params;
 * const validationError = validateUUID(id, "id");
 * if (validationError) return validationError;
 * ```
 */
export function validateUUID(id: string, paramName: string = "id"): NextResponse | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Format invalid pentru ${paramName}`,
        details: {
          [paramName]: "Must be a valid UUID",
        },
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  return null;
}

/**
 * Security event logger
 *
 * Logs security-related events to Sentry for monitoring and alerting.
 * Events are categorized by type (auth, authz, data_access, config_change)
 * and include contextual information for security analysis.
 */
interface SecurityEvent {
  type: "auth" | "authz" | "data_access" | "config_change";
  action: string;
  userId?: string;
  ip?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export function logSecurityEvent(event: SecurityEvent) {
  // Log to console for development
  const logLevel = event.success ? "info" : "warn";
  console[logLevel]("[Security Event]", {
    type: event.type,
    action: event.action,
    userId: event.userId || "anonymous",
    success: event.success,
    metadata: event.metadata,
  });

  // Send to Sentry for production monitoring
  try {
    Sentry.captureMessage(`Security Event: ${event.type} - ${event.action}`, {
      level: event.success ? "info" : "warning",
      contexts: {
        security: {
          type: event.type,
          action: event.action,
          userId: event.userId,
          ip: event.ip,
          success: event.success,
          metadata: event.metadata,
        },
      },
      tags: {
        security_event: event.type,
        security_action: event.action,
        security_success: event.success.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to log security event to Sentry:", error);
  }
}
