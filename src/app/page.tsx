"use client";

import { useEffect, Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/ui/footer";
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid";
import { getLocation } from "@/lib/location-storage";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";

/**
 * Landing Page (Home Page)
 *
 * This is the main entry point for the application.
 * Displays the Hero Section with animated branding and CTA.
 *
 * Features:
 * - Auto-redirect: If user has saved location, redirect to their dashboard
 * - Otherwise: Show hero section for location selection
 * - Inverse theme on scroll: Features section uses opposite theme of Hero
 *   - If theme is dark: Hero = dark, Features = light
 *   - If theme is light: Hero = light, Features = dark
 *
 * Route: /
 * Public: Yes
 * Responsive: 375px - 1920px
 * Accessibility: WCAG 2.1 AA compliant
 */
export default function LandingPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Determine current theme (dark or light)
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkTheme = currentTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if user has saved location
    const savedLocation = getLocation();

    if (!savedLocation) {
      return;
    }

    // Check if we should skip redirect (flag set when user explicitly navigates to /)
    const skipRedirect = sessionStorage.getItem("skipLandingRedirect");

    if (skipRedirect) {
      // User explicitly wants to stay on landing page - don't redirect
      return;
    }

    // Perform redirect only once per session
    const hasRedirected = sessionStorage.getItem("hasRedirectedFromLanding");

    if (!hasRedirected) {
      sessionStorage.setItem("hasRedirectedFromLanding", "true");
      router.replace(`/app/${savedLocation.judetSlug}/${savedLocation.localitateSlug}/dashboard`);
    }
  }, [router]);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  // Features section gets INVERSE theme
  const featuresTheme = isDarkTheme ? "light" : "dark";

  return <LandingPageContent featuresTheme={featuresTheme} isDarkTheme={isDarkTheme} />;
}

// Separate component to handle scroll animations after mount
function LandingPageContent({
  featuresTheme,
  isDarkTheme,
}: {
  featuresTheme: string;
  isDarkTheme: boolean;
}) {
  const mainRef = useRef<HTMLDivElement>(null!);
  const transitionRef = useRef<HTMLDivElement>(null!);
  const [isInFeaturesSection, setIsInFeaturesSection] = useState(false);

  const { scrollYProgress } = useScroll({
    target: transitionRef,
    container: mainRef,
    offset: ["start end", "end start"],
  });

  // Background transition based on current theme
  // Transition completes as we scroll through the transition zone
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 1],
    isDarkTheme
      ? ["rgb(0, 0, 0)", "rgb(255, 255, 255)"] // Dark → Light
      : ["rgb(255, 255, 255)", "rgb(0, 0, 0)"] // Light → Dark
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Apply features theme when we're past 70% of the transition zone
      setIsInFeaturesSection(latest > 0.7);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <motion.main
      ref={mainRef}
      id="main-content"
      style={{ backgroundColor }}
      className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth"
    >
      {/* The Infinite Grid - Animated grid background with scroll */}
      <TheInfiniteGrid scrollContainer={mainRef} />

      {/* Hero Section - Uses current theme */}
      <div className="min-h-screen snap-start snap-always">
        <Suspense fallback={<div className="min-h-screen bg-black dark:bg-white" />}>
          <HeroSection scrollContainer={mainRef} isInFeaturesSection={isInFeaturesSection} />
        </Suspense>
      </div>

      {/* Transition Zone - Magnetic scroll area */}
      <div ref={transitionRef} className="h-[400px]" />

      {/* Features Section - Uses INVERSE theme */}
      <div className={`snap-start snap-always ${isInFeaturesSection ? featuresTheme : ""}`}>
        <FeaturesSection scrollContainer={mainRef} />
        <Footer />
      </div>
    </motion.main>
  );
}
