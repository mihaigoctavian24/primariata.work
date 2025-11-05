"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { getLocation } from "@/lib/location-storage";

/**
 * Landing Page (Home Page)
 *
 * This is the main entry point for the application.
 * Displays the Hero Section with animated branding and CTA.
 *
 * Features:
 * - Auto-redirect: If user has saved location, redirect to their dashboard
 * - Otherwise: Show hero section for location selection
 *
 * Route: /
 * Public: Yes
 * Responsive: 375px - 1920px
 * Accessibility: WCAG 2.1 AA compliant
 */
export default function LandingPage() {
  const router = useRouter();

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

  return (
    <main id="main-content">
      {/* Hero Section - Full Screen */}
      <div className="min-h-screen">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <HeroSection />
        </Suspense>
      </div>

      {/* Features Section - Below hero, scrollable */}
      <FeaturesSection />
    </main>
  );
}
