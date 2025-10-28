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
          <h1
            className="relative text-2xl font-bold md:text-3xl"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))" }}
          >
            <TextType
              text="primariaTa   "
              as="span"
              className="inline"
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
              loop={false}
            />
            <motion.span
              className="absolute inline-block"
              style={{
                left: "9.2ch",
                top: "0%",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: [
                  1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08,
                  1,
                ],
              }}
              transition={{
                opacity: {
                  duration: 0.3,
                  delay: 0.9,
                },
                scale: {
                  duration: 8,
                  delay: 1.2,
                  times: [
                    0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52, 0.53,
                    0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
                  ],
                  ease: [0.4, 0, 0.6, 1],
                  repeat: Infinity,
                },
              }}
            >
              ❤️
            </motion.span>
          </h1>
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
