"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * PasswordStrengthIndicator Component
 *
 * Visual indicator for password strength with:
 * - Real-time strength calculation
 * - Color-coded strength levels (weak/medium/strong)
 * - Animated progress bar
 * - Helpful strength labels
 *
 * @example
 * <PasswordStrengthIndicator password={password} />
 */

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

type StrengthLevel = "weak" | "medium" | "strong";

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  label: string;
  color: string;
}

function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return {
      level: "weak",
      score: 0,
      label: "",
      color: "bg-gray-300 dark:bg-gray-600",
    };
  }

  let score = 0;

  // Length score (max 40 points)
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety (max 60 points)
  if (/[a-z]/.test(password)) score += 10; // lowercase
  if (/[A-Z]/.test(password)) score += 15; // uppercase
  if (/[0-9]/.test(password)) score += 15; // numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 20; // special characters

  // Determine strength level
  let level: StrengthLevel;
  let label: string;
  let color: string;

  if (score < 40) {
    level = "weak";
    label = "Slabă";
    color = "bg-red-500 dark:bg-red-600";
  } else if (score < 70) {
    level = "medium";
    label = "Medie";
    color = "bg-yellow-500 dark:bg-yellow-600";
  } else {
    level = "strong";
    label = "Puternică";
    color = "bg-green-500 dark:bg-green-600";
  }

  return { level, score, label, color };
}

export function PasswordStrengthIndicator({
  password,
  className = "",
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  // Don't show indicator if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <motion.div
          className={`h-full transition-colors ${strength.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${strength.score}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">Putere parolă:</p>
        <motion.span
          className={`text-xs font-medium ${
            strength.level === "weak"
              ? "text-red-600 dark:text-red-400"
              : strength.level === "medium"
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
          }`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          key={strength.label}
        >
          {strength.label}
        </motion.span>
      </div>

      {/* Requirements Checklist */}
      <div className="text-muted-foreground mt-3 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          {password.length >= 8 ? (
            <svg
              className="size-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            </svg>
          )}
          <span>Minim 8 caractere</span>
        </div>
        <div className="flex items-center gap-2">
          {/[A-Z]/.test(password) ? (
            <svg
              className="size-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            </svg>
          )}
          <span>O literă mare</span>
        </div>
        <div className="flex items-center gap-2">
          {/[0-9]/.test(password) ? (
            <svg
              className="size-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            </svg>
          )}
          <span>O cifră</span>
        </div>
        <div className="flex items-center gap-2">
          {/[^A-Za-z0-9]/.test(password) ? (
            <svg
              className="size-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            </svg>
          )}
          <span>Un caracter special (!@#$%...)</span>
        </div>
      </div>
    </div>
  );
}
