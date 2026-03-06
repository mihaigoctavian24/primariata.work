"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

/**
 * AdminLoginContent - Client component for admin login page.
 *
 * Uses AuthLayout with professional hero for split-screen layout.
 * Contains AnimatedCard with AdminLoginForm.
 */

function AdminLoginHero(): React.ReactElement {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex justify-center"
      >
        <Shield className="text-accent-500 size-16" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-foreground text-3xl font-bold md:text-4xl"
        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" }}
      >
        Panou de administrare
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="text-muted-foreground text-lg"
      >
        Gestioneaza primaria ta digital
      </motion.p>
    </div>
  );
}

export function AdminLoginContent(): React.ReactElement {
  return (
    <AuthLayout showHero heroContent={<AdminLoginHero />}>
      <AnimatedCard glassEffect className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-foreground text-2xl font-bold">Autentificare personal</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Acceseza panoul de administrare al primariei
            </p>
          </div>

          <AdminLoginForm />
        </div>
      </AnimatedCard>
    </AuthLayout>
  );
}
