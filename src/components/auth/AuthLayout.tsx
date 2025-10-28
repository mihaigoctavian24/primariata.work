"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import TextType from "@/components/TextType";
import PixelBlast from "@/components/ui/PixelBlast";

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
      <TextType
        text="primariaTa❤️"
        as="h1"
        className="text-5xl font-bold md:text-6xl"
        charStyler={(char, idx) => {
          // "Ta" is at indices 8 and 9
          if (idx === 8 || idx === 9) {
            return { color: "oklch(0.712 0.194 13.428)" };
          }
          return {};
        }}
        typingSpeed={75}
        showCursor={true}
        cursorCharacter="_"
      />

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get PixelBlast color based on theme
  const pixelBlastColor = mounted && resolvedTheme === "dark" ? "#90a1b9" : "#e2e8f0";

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* PixelBlast Animated Background - client-side only */}
      {mounted && (
        <div className="fixed inset-0 -z-10" aria-hidden="true">
          <PixelBlast
            variant="triangle"
            pixelSize={6}
            color={pixelBlastColor}
            patternScale={1.75}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            liquid={false}
            speed={0.5}
            edgeFade={0.25}
            transparent={true}
          />
        </div>
      )}

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
