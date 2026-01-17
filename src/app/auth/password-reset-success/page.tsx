"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Password Reset Success Page
 *
 * Confirmation page after successful password update:
 * - Success message display
 * - Auto-redirect to login after 5 seconds
 * - Manual "Intră în cont" button
 *
 * Route: /auth/password-reset-success
 * Public: Yes
 * Related: Issue #61
 */

export default function PasswordResetSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/auth/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-b p-4">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <AnimatedCard delay={0.2} glassEffect className="w-full max-w-md space-y-8 text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.4 }}
          className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950"
        >
          <CheckCircle2 className="size-12 text-green-600 dark:text-green-400" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold tracking-tight">Parola actualizată! ✅</h1>
          <p className="text-muted-foreground text-sm">
            Parola ta a fost schimbată cu succes. Acum te poți autentifica cu noua parolă.
          </p>
        </motion.div>

        {/* Auto-redirect Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-muted/50 rounded-lg p-4"
        >
          <p className="text-muted-foreground text-sm">
            Vei fi redirecționat automat către autentificare în{" "}
            <span className="text-primary font-bold">{countdown}</span>{" "}
            {countdown === 1 ? "secundă" : "secunde"}...
          </p>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="space-y-4"
        >
          <Link href="/auth/login" className="block">
            <Button className="w-full">Intră în cont acum</Button>
          </Link>

          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
          >
            Înapoi la pagina principală
          </Link>
        </motion.div>
      </AnimatedCard>
    </div>
  );
}
