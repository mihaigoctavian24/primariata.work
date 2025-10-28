"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import TextType from "@/components/TextType";

/**
 * AuthHeader Component
 *
 * Header for authentication pages with:
 * - Logo with typing animation
 * - Theme toggle button
 * - Back navigation button
 * - Sticky positioning with backdrop blur
 *
 * @example
 * <AuthHeader showBackButton backHref="/?step=2" />
 */

interface AuthHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  className?: string;
}

export function AuthHeader({
  showBackButton = true,
  backHref = "/?step=2",
  onBackClick,
  className = "",
}: AuthHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push(backHref);
    }
  };

  return (
    <header
      className={`border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md ${className}`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <TextType
            text="primariaTa❤️"
            as="h1"
            className="text-2xl font-bold md:text-3xl"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))" }}
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
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {showBackButton && (
            <motion.button
              onClick={handleBack}
              className="text-muted-foreground flex items-center gap-1.5 text-sm"
              whileHover={{
                scale: 1.08,
                color: "oklch(0.712 0.194 13.428)",
              }}
              whileTap={{
                scale: 0.92,
                color: "oklch(0.612 0.194 13.428)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                mass: 2,
              }}
              aria-label="Schimbă localitatea"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Schimbă localitatea
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
