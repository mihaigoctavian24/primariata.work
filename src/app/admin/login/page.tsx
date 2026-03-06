import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AdminLoginContent } from "./admin-login-content";

/**
 * Admin Login Page
 *
 * Dedicated login page for staff/admin users at /admin/login.
 * Uses AuthLayout with professional split-screen hero.
 * Email + password only (no Google OAuth).
 *
 * Route: /admin/login
 */

export const metadata = {
  title: "Autentificare personal - primariaTa",
  description: "Acceseza panoul de administrare al primariei",
};

export default function AdminLoginPage(): React.ReactElement {
  return (
    <div className="min-h-screen">
      <AuthHeader showBackButton backHref="/" />
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        }
      >
        <AdminLoginContent />
      </Suspense>
    </div>
  );
}
