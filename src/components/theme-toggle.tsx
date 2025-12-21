"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isInFeaturesSection?: boolean;
}

export function ThemeToggle({ isInFeaturesSection = false }: ThemeToggleProps = {}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = useCallback(() => {
    // Get button position
    const button = buttonRef.current;
    if (!button) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

    const styleId = `theme-transition-${Date.now()}`;
    const style = document.createElement("style");
    style.id = styleId;

    // Circle Blur animation from button position
    const css = `
      @supports (view-transition-name: root) {
        ::view-transition-old(root) {
          animation: none;
          z-index: -1;
        }
        ::view-transition-new(root) {
          animation: scale 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }
      @keyframes scale {
        from {
          clip-path: circle(0% at ${x}% ${y}%);
          filter: blur(8px);
        }
        to {
          clip-path: circle(200% at ${x}% ${y}%);
          filter: blur(0);
        }
      }
    `;

    style.textContent = css;
    document.head.appendChild(style);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(document as any).startViewTransition) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any)
      .startViewTransition(() => {
        setTheme(theme === "dark" ? "light" : "dark");
      })
      .finished.finally(() => {
        document.getElementById(styleId)?.remove();
      });
  }, [theme, setTheme]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button aria-label="Toggle theme" className="size-10 opacity-0" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </button>
    );
  }

  // Use resolvedTheme to get actual theme (accounts for system preference)
  const isDark = resolvedTheme === "dark";

  // Icon stays the same based on theme, ONLY color changes in features section for visibility
  // Hero: dark theme → Sun (default light color on dark bg)
  // Features (inverted): dark theme → Sun (inverted to dark color on light bg)

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex size-10 items-center justify-center",
        "rounded-lg transition-all duration-300",
        "hover:scale-110 active:scale-95",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      {/* Sun icon - visible in light mode, COLOR inverts in features section */}
      <Sun
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
          // Color invert: Light mode (Sun visible)
          // Hero (light theme, white bg) → dark icon
          // Features (light theme, black bg inverted) → white icon
          !isDark && isInFeaturesSection ? "text-white" : "",
          !isDark && !isInFeaturesSection ? "text-black" : ""
        )}
      />
      {/* Moon icon - visible in dark mode, COLOR inverts in features section */}
      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0",
          // Color invert: Dark mode (Moon visible)
          // Hero (dark theme, black bg) → white icon
          // Features (dark theme, white bg inverted) → black icon
          isDark && isInFeaturesSection ? "text-black" : "",
          isDark && !isInFeaturesSection ? "text-white" : ""
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
