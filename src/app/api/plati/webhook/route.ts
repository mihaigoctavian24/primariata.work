import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/plati/webhook
 *
 * @deprecated Use /api/webhooks/ghiseul instead.
 * This endpoint is kept for backward compatibility and permanently redirects
 * to the consolidated webhook handler using HTTP 308 (preserves POST method).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = new URL("/api/webhooks/ghiseul", request.url);
  return NextResponse.redirect(url, { status: 308 });
}
