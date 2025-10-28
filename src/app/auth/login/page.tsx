"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LocationBadge } from "@/components/auth/LocationBadge";
import { LoginForm } from "@/components/auth/LoginForm";
import { AnimatedCard } from "@/components/ui/animated-card";
import { motion } from "framer-motion";

/**
 * Login Page
 *
 * Revamped authentication page with:
 * - Split-screen layout (hero + form)
 * - Animated gradient background
 * - Dynamic location badge
 * - Theme-aware design
 * - Premium animations and transitions
 *
 * Route: /auth/login
 * Public: Yes
 * Related: Issue #59
 * Accessibility: WCAG 2.1 AA compliant
 */

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

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

          {/* Hero Text */}
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
              Bine ai revenit!
            </h1>
            <p
              className="text-muted-foreground text-lg md:text-xl"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
            >
              Accesează serviciile primăriei tale
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
      {/* Form Section */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <AnimatedCard delay={0.6} glassEffect className="w-full max-w-md space-y-8">
          {/* Form Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-2 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">Intră în cont</h2>
            <p className="text-muted-foreground text-sm">
              Completează datele tale pentru a continua
            </p>
          </motion.div>

          {/* Login Form */}
          <LoginForm
            redirectTo={redirectTo}
            className="motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
          />
        </AnimatedCard>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
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
        <LoginContent />
      </Suspense>
    </>
  );
}
