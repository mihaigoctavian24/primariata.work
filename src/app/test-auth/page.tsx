import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Test Authentication Page
 *
 * This page is used to verify that Supabase authentication is working correctly.
 * It displays the current user's information if authenticated, otherwise redirects to login.
 *
 * Features:
 * - Server Component (async)
 * - Uses server-side Supabase client
 * - Displays user metadata
 * - Protected by authentication check
 *
 * @returns Authentication test page component
 */
export default async function TestAuthPage() {
  const supabase = await createClient();

  // Get current user from session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Authentication Test</h1>
            <Badge variant="default">Authenticated ✓</Badge>
          </div>
          <p className="text-muted-foreground">
            Supabase authentication is working correctly. Here&apos;s your user information:
          </p>
        </div>

        <Separator />

        {/* User Information Card */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">User Information</h2>
          <div className="space-y-4">
            {/* User ID */}
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>

            {/* Email */}
            {user.email && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
            )}

            {/* Email Verified */}
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">Email Verified</p>
              <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                {user.email_confirmed_at ? "Yes" : "No"}
              </Badge>
            </div>

            {/* Created At */}
            {user.created_at && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Account Created</p>
                <p className="text-sm">{new Date(user.created_at).toLocaleString()}</p>
              </div>
            )}

            {/* Last Sign In */}
            {user.last_sign_in_at && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Last Sign In</p>
                <p className="text-sm">{new Date(user.last_sign_in_at).toLocaleString()}</p>
              </div>
            )}

            {/* Role */}
            {user.role && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Role</p>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            )}
          </div>
        </Card>

        {/* Raw User Object Card */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Raw User Object</h2>
          <div className="bg-muted overflow-auto rounded-md p-4">
            <pre className="text-xs">
              <code>{JSON.stringify(user, null, 2)}</code>
            </pre>
          </div>
        </Card>

        {/* Session Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Session Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500" />
              <span className="text-sm">Session Active</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your session is being managed through secure HTTP-only cookies. Try refreshing the
              page to verify session persistence.
            </p>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="border-dashed p-6">
          <h2 className="mb-4 text-xl font-semibold">✅ Next Steps</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>✓ Browser client working</li>
            <li>✓ Server client working</li>
            <li>✓ Middleware authentication functional</li>
            <li>✓ Session persistence verified (refresh this page)</li>
            <li>✓ Protected routes working</li>
            <li>→ Ready to implement login/register pages</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
