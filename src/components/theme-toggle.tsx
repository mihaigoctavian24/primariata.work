"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isInFeaturesSection?: boolean;
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({
  isInFeaturesSection = false,
  className,
  compact = false,
}: ThemeToggleProps = {}) {
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
  const iconSize = compact ? "h-4 w-4" : "h-[1.2rem] w-[1.2rem]";

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300",
        compact ? "size-8 p-2" : "size-10 hover:scale-110 active:scale-95",
        "rounded-lg",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {/* Sun icon - visible in dark mode ("shows what you'll activate" convention) */}
      <Sun
        className={cn(
          "absolute transition-all duration-300",
          iconSize,
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
          !compact && !isInFeaturesSection && "text-white",
          !compact && isInFeaturesSection && "text-black"
        )}
      />
      {/* Moon icon - visible in light mode ("shows what you'll activate" convention) */}
      <Moon
        className={cn(
          "absolute transition-all duration-300",
          iconSize,
          !isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0",
          !compact && !isInFeaturesSection && "text-black",
          !compact && isInFeaturesSection && "text-white"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
