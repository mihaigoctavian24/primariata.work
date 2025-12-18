"use client";

import { motion } from "framer-motion";
import TextType from "@/components/TextType";

/**
 * AuthLayout Component
 *
 * Layout wrapper for all authentication pages with:
 * - Split-screen layout (40% hero / 60% form) on desktop
 * - Stacked layout on tablet/mobile
 * - Animated background (gradient mesh)
 * - Responsive breakpoints
 *
 * @example
 * <AuthLayout showHero>
 *   <YourFormComponent />
 * </AuthLayout>
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  heroContent?: React.ReactNode;
  className?: string;
}

function DefaultHeroContent() {
  return (
    <div className="space-y-8 text-center">
      {/* Large Logo with typing effect */}
      <h1 className="relative text-5xl font-bold md:text-6xl">
        <TextType
          text="primariaTa   "
          as="span"
          className="inline"
          charStyler={(_char, idx) => {
            // "Ta" is at indices 8 and 9
            if (idx === 8 || idx === 9) {
              return { color: "oklch(0.712 0.194 13.428)" };
            }
            return {};
          }}
          typingSpeed={75}
          showCursor={true}
          cursorCharacter="_"
          loop={false}
        />
        <motion.span
          className="absolute inline-block"
          style={{
            left: "9.2ch",
            top: "0%",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: [
              1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1,
            ],
          }}
          transition={{
            opacity: {
              duration: 0.3,
              delay: 0.9,
            },
            scale: {
              duration: 8,
              delay: 1.2,
              times: [
                0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52, 0.53,
                0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
              ],
              ease: [0.4, 0, 0.6, 1],
              repeat: Infinity,
            },
          }}
        >
          ❤️
        </motion.span>
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground text-lg md:text-xl">
        Accesează serviciile primăriei tale
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard value="13,851" label="Localități" />
        <StatCard value="24/7" label="Disponibil" />
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm"
    >
      <div className="text-primary text-2xl font-bold md:text-3xl">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </motion.div>
  );
}

export function AuthLayout({
  children,
  showHero = true,
  heroContent,
  className = "",
}: AuthLayoutProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* PixelBlast background now handled by GlobalPixelBlast in app/layout.tsx */}

      {/* Main Content Area */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-5">
          {/* Left Hero Section (Desktop Only) */}
          {showHero && (
            <motion.div
              className="hidden lg:col-span-2 lg:flex lg:flex-col lg:items-center lg:justify-center"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {heroContent || <DefaultHeroContent />}
            </motion.div>
          )}

          {/* Right Form Section */}
          <div
            className={`flex items-center justify-center ${
              showHero ? "lg:col-span-3" : "lg:col-span-5"
            }`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
