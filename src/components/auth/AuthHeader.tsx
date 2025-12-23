"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import TextType from "@/components/TextType";

/**
 * AuthHeader Component
 *
 * Header for authentication pages with:
 * - Logo with typing animation and SVG heart icon
 * - Apple-style liquid glass background
 * - Theme toggle button
 * - Back navigation button
 * - Sticky positioning with enhanced backdrop blur
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
  const [isHovered, setIsHovered] = useState(false);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push(backHref);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 ${className}`}
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
          backdropFilter: "blur(3px) saturate(120%)",
          WebkitBackdropFilter: "blur(3px) saturate(120%)",
          border: "none",
        }}
      >
        {/* Subtle shine effect at top */}
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
          }}
        />

        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl font-bold md:text-3xl"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))" }}
            >
              <span className="inline-block whitespace-nowrap">
                <TextType
                  text="primariaTa"
                  as="span"
                  className="inline"
                  charStyler={(_char, idx) => {
                    // "Ta" is at indices 8 and 9
                    if (idx === 8 || idx === 9) {
                      return { color: "#be3144" };
                    }
                    return {};
                  }}
                  typingSpeed={75}
                  showCursor={false}
                  loop={false}
                />
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: [
                      1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1,
                      1.08, 1,
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
                        0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52,
                        0.53, 0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
                      ],
                      ease: [0.4, 0, 0.6, 1],
                      repeat: Infinity,
                    },
                  }}
                >
                  <Image
                    src="/vector_heart.svg"
                    alt="❤️"
                    width={24}
                    height={24}
                    className="inline-block"
                    style={{ width: "1em", height: "1em" }}
                  />
                </motion.span>
                <motion.span
                  className="inline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    delay: 0.9,
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    times: [0, 0.1, 0.9, 1],
                  }}
                >
                  _
                </motion.span>
              </span>
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <motion.button
                onClick={handleBack}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                aria-label="Schimbă localitatea"
              >
                <motion.div
                  animate={{ x: isHovered ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </motion.div>
                Schimbă localitatea
              </motion.button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
