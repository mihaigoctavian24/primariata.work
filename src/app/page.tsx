"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/HeroSection";
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

    if (savedLocation) {
      // Auto-redirect to their dashboard
      router.push(`/app/${savedLocation.judetSlug}/${savedLocation.localitateSlug}/dashboard`);
    }
  }, [router]);

  return (
    <main id="main-content" className="min-h-screen">
      <HeroSection />
    </main>
  );
}
