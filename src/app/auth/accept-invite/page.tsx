"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";
import { AnimatedCard } from "@/components/ui/animated-card";
import { motion } from "framer-motion";
import { Users, Shield, CheckCircle2 } from "lucide-react";

/**
 * Accept Invitation Page
 *
 * Public page for staff members to accept invitations and create accounts.
 *
 * Features:
 * - Token validation with invitation lookup
 * - Pre-filled email (read-only)
 * - Password creation with validation
 * - Role and inviter information display
 * - Expiration warning
 * - Automatic role assignment via invitation token
 *
 * Flow:
 * 1. User clicks invitation link from email
 * 2. Token validated against user_invitations table
 * 3. Invitation details displayed (role, expiration)
 * 4. User creates password
 * 5. signUp() called with invitation_token in metadata
 * 6. Trigger assigns role and primarie_id
 * 7. Invitation marked as accepted
 * 8. Redirect to login with success message
 *
 * Route: /auth/accept-invite?token=xxx
 * Public: Yes
 * Related: Issue #152
 * Accessibility: WCAG 2.1 AA compliant
 */

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <AuthLayout
      showHero
      heroContent={
        <div className="flex h-full flex-col items-center justify-center space-y-8 px-8">
          {/* Icon and Welcome */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="relative">
              <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-xl" />
              <div className="from-primary to-primary/80 relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-xl">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="bg-gradient-to-br from-white to-white/80 bg-clip-text text-4xl font-bold text-transparent">
                Bine ai venit în echipă!
              </h1>
              <p className="text-lg text-white/80">Crează-ți contul pentru a începe</p>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-md space-y-4"
          >
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-white/90" />
              <div>
                <p className="font-medium text-white">Acces personalizat</p>
                <p className="text-sm text-white/70">Permisiuni specifice rolului tău</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="mt-1 h-5 w-5 text-white/90" />
              <div>
                <p className="font-medium text-white">Securitate garantată</p>
                <p className="text-sm text-white/70">Invitație validată de administrator</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="mt-1 h-5 w-5 text-white/90" />
              <div>
                <p className="font-medium text-white">Lucru în echipă</p>
                <p className="text-sm text-white/70">Colaborare eficientă cu colegii</p>
              </div>
            </div>
          </motion.div>
        </div>
      }
    >
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <AnimatedCard className="overflow-hidden">
            {/* Header */}
            <div className="from-primary/5 to-primary/10 border-b bg-gradient-to-r p-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Acceptă invitația</h1>
                <p className="text-muted-foreground">Completează datele pentru a-ți crea contul</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <AcceptInviteForm token={token} />
            </div>
          </AnimatedCard>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mt-4 text-center text-sm"
          >
            Ai întrebări?{" "}
            <a
              href="mailto:support@primariata.work"
              className="text-primary font-medium hover:underline"
            >
              Contactează suportul
            </a>
          </motion.p>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex min-h-screen items-center justify-center">
            <p>Se încarcă...</p>
          </div>
        </AuthLayout>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
