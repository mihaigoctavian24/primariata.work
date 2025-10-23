import { HeroSection } from "@/components/landing/HeroSection";

/**
 * Landing Page (Home Page)
 *
 * This is the main entry point for the application.
 * Displays the Hero Section with animated branding and CTA.
 *
 * Route: /
 * Public: Yes
 * Responsive: 375px - 1920px
 * Accessibility: WCAG 2.1 AA compliant
 */
export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <HeroSection />
    </main>
  );
}
