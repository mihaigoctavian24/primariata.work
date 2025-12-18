"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Dynamic import for PixelBlast to prevent SSR issues
const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
  loading: () => <div className="bg-background fixed inset-0 -z-10" />,
});

type PixelBlastProps = ComponentProps<typeof PixelBlast>;

/**
 * GlobalPixelBlast - Singleton WebGL Background
 *
 * Single shared PixelBlast instance across all pages to prevent:
 * - Dual WebGL contexts during navigation
 * - Memory leaks from overlapping instances
 * - Visual artifacts (multiple pixel colors simultaneously)
 *
 * Configuration changes based on current route:
 * - Landing page (/): Purple circles with liquid effects
 * - Auth pages (/auth/*): Theme-based triangles without liquid
 * - Default: Purple circles
 *
 * @see claudedocs/PIXELBLAST_DUAL_SESSION_ANALYSIS.md
 */
export function GlobalPixelBlast() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine PixelBlast configuration based on current route
  const config: Partial<PixelBlastProps> = useMemo(() => {
    if (pathname === "/") {
      // Landing page: Purple circles with liquid effects
      return {
        variant: "triangle",
        pixelSize: 5,
        color: "#ebebeb",
        patternScale: 6,
        patternDensity: 1.5,
        pixelSizeJitter: 0.25,
        enableRipples: false,
        rippleSpeed: 0.6,
        rippleThickness: 0.2,
        rippleIntensityScale: 2,
        liquid: false,
        liquidStrength: 0.12,
        liquidRadius: 1.2,
        liquidWobbleSpeed: 5,
        speed: 0.8,
        edgeFade: 0.5,
        transparent: true,
      };
    } else if (pathname?.startsWith("/auth")) {
      // Auth pages: Theme-based triangles without liquid
      const color = mounted && resolvedTheme === "dark" ? "#90a1b9" : "#e2e8f0";
      return {
        variant: "triangle",
        pixelSize: 6,
        color,
        patternScale: 1.75,
        patternDensity: 1,
        pixelSizeJitter: 0,
        enableRipples: true,
        rippleSpeed: 0.3,
        rippleThickness: 0.1,
        rippleIntensityScale: 1,
        liquid: false,
        speed: 0.5,
        edgeFade: 0.25,
        transparent: true,
      };
    }

    // Default config (fallback for other routes)
    return {
      variant: "circle",
      pixelSize: 6,
      color: "#B19EEF",
      patternScale: 3,
      patternDensity: 1.2,
      pixelSizeJitter: 0.5,
      enableRipples: true,
      rippleSpeed: 0.4,
      rippleThickness: 0.12,
      rippleIntensityScale: 1.5,
      liquid: true,
      liquidStrength: 0.12,
      liquidRadius: 1.2,
      liquidWobbleSpeed: 5,
      speed: 0.6,
      edgeFade: 0.25,
      transparent: true,
    };
  }, [pathname, mounted, resolvedTheme]);

  // Don't render until client-side mounted
  if (!mounted) {
    return <div className="bg-background fixed inset-0 -z-10" />;
  }

  return (
    <div className="bg-background fixed inset-0 -z-10" aria-hidden="true">
      {/* Add stable key to prevent recreation when config changes */}
      <PixelBlast key="global-pixelblast-singleton" {...config} />
    </div>
  );
}
