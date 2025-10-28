"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * AnimatedBackground Component
 *
 * Animated gradient mesh background for authentication pages.
 * Theme-aware with smooth color transitions.
 *
 * @example
 * <AnimatedBackground variant="gradient" intensity="subtle" />
 */

interface AnimatedBackgroundProps {
  variant?: "gradient";
  intensity?: "subtle" | "medium" | "strong";
  className?: string;
}

export function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Gradient variant
  const gradientStyle = {
    backgroundImage:
      resolvedTheme === "dark"
        ? "linear-gradient(135deg, oklch(0.372 0.044 257.287) 0%, oklch(0.310 0.055 265.000) 25%, oklch(0.278 0.033 256.848) 50%, oklch(0.310 0.055 245.000) 75%, oklch(0.372 0.044 257.287) 100%)"
        : "linear-gradient(135deg, oklch(0.929 0.013 255.508) 0%, oklch(0.955 0.008 265.000) 25%, oklch(0.985 0.002 247.839) 50%, oklch(0.955 0.008 230.000) 75%, oklch(0.929 0.013 255.508) 100%)",
    backgroundSize: "400% 400%",
    animation: "gradient-shift 15s ease infinite",
  };

  return (
    <>
      <div
        className={`fixed inset-0 -z-10 ${className}`}
        style={gradientStyle}
        aria-hidden="true"
      />

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </>
  );
}
