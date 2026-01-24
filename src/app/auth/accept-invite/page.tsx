"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LocationBadge } from "@/components/auth/LocationBadge";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";
import { AnimatedCard } from "@/components/ui/animated-card";
import { motion } from "framer-motion";

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
          {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <LocationBadge />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-4 text-center"
          >
            <h1
              className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))" }}
            >
              Alătură-te echipei!
            </h1>
            <p
              className="text-muted-foreground text-lg md:text-xl"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
            >
              Ai fost invitat să te alături primăriei tale
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4"
          >
            <div className="bg-primary/20 h-2 w-16 rounded-full" />
            <div className="bg-primary/40 h-2 w-16 rounded-full" />
            <div className="bg-primary/60 h-2 w-16 rounded-full" />
          </motion.div>
        </div>
      }
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Form Card */}
        <AnimatedCard delay={0.6} glassEffect className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Acceptă invitația</h2>
            <p className="text-muted-foreground text-sm">
              Completează datele pentru a-ți crea contul
            </p>
          </div>

          {/* Form */}
          <AcceptInviteForm token={token} />

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-center text-sm"
          >
            Ai întrebări?{" "}
            <a
              href="mailto:support@primariata.work"
              className="text-primary font-medium hover:underline"
            >
              Contactează suportul
            </a>
          </motion.p>
        </AnimatedCard>
      </div>
    </AuthLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <>
      <AuthHeader showBackButton backHref="/?step=2" />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </>
  );
}
