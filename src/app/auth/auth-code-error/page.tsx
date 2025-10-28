import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Authentication Error Page
 *
 * Displayed when OAuth callback fails or authorization code is invalid.
 * Provides user-friendly error message and recovery options.
 *
 * Route: /auth/auth-code-error
 * Public: Yes
 */
export default function AuthCodeErrorPage() {
  return (
    <main className="from-background via-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md space-y-6 p-8 text-center">
        {/* Error Icon */}
        <div className="bg-destructive/10 mx-auto flex size-16 items-center justify-center rounded-full">
          <svg
            className="text-destructive size-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div>
          <h1 className="text-2xl font-bold">Eroare la autentificare</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            A apărut o problemă în procesul de autentificare. Te rugăm să încerci din nou.
          </p>
        </div>

        {/* Recovery Actions */}
        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">Încearcă din nou</Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Înapoi la pagina principală
            </Button>
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-muted-foreground text-xs">
          Dacă problema persistă, te rugăm să{" "}
          <Link href="/contact" className="text-primary hover:underline">
            ne contactezi
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
