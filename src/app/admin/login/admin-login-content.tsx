"use client";

import { motion } from "framer-motion";
import { Shield, FileText, CreditCard, Bell, Users } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

/**
 * AdminLoginContent - Client component for admin login page.
 *
 * Uses AuthLayout with professional hero for split-screen layout.
 * Contains AnimatedCard with AdminLoginForm.
 */

const heroFeatures = [
  { icon: FileText, label: "Gestionare cereri" },
  { icon: CreditCard, label: "Monitorizare plati" },
  { icon: Bell, label: "Notificari in timp real" },
  { icon: Users, label: "Administrare cetateni" },
] as const;

function AdminLoginHero(): React.ReactElement {
  return (
    <div className="space-y-8 text-center">
      {/* Shield icon with gradient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="relative">
          <div className="bg-primary/40 absolute inset-0 rounded-full blur-2xl" />
          <div className="bg-primary relative flex size-24 items-center justify-center rounded-full border border-white/10 backdrop-blur-sm">
            <Shield className="size-12 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="space-y-3"
      >
        <h1
          className="text-foreground text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" }}
        >
          Panou de <span className="text-primary">administrare</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-sm text-lg">
          Gestioneaza primaria ta digital, intr-un singur loc
        </p>
      </motion.div>

      {/* Feature list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mx-auto grid max-w-xs grid-cols-2 gap-3"
      >
        {heroFeatures.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
            className="bg-foreground/5 flex items-center gap-2 rounded-lg px-3 py-2 backdrop-blur-sm"
          >
            <Icon className="text-primary size-4 shrink-0" />
            <span className="text-foreground/80 text-xs font-medium">{label}</span>
          </motion.div>
        ))}
      </motion.div>
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
