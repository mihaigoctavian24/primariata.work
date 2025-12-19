"use client";

import "@ncdai/react-wheel-picker/style.css";

import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";

import { cn } from "@/lib/utils";

// Theme colors for wheel picker components
const THEME_COLORS = {
  wheelBg: {
    dark: "oklch(0.372 0.044 257.287 / 0.8)",
    light: "oklch(0.929 0.013 255.508 / 0.8)",
  },
  selectorBg: {
    dark: "oklch(0.278 0.033 256.848 / 0.8)",
    light: "oklch(0.985 0.002 247.839 / 0.8)",
  },
  text: {
    dark: "#ffffff",
    light: "#6b7280",
  },
} as const;

// Common text shadow for consistent styling
const TEXT_SHADOW = "3px 3px 6px rgba(0, 0, 0, 0.3), -3px -3px 4px rgba(255, 255, 255, 0.1)";

// Global style tracking to prevent duplicate style tags
let wheelPickerWrapperStyleInjected = false;
let wheelPickerStyleInjected = false;

// Custom hook to handle theme mounting and avoid hydration mismatch
function useWheelPickerTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return {
    mounted,
    isDark,
    wheelBg: isDark ? THEME_COLORS.wheelBg.dark : THEME_COLORS.wheelBg.light,
    selectorBg: isDark ? THEME_COLORS.selectorBg.dark : THEME_COLORS.selectorBg.light,
    textColor: isDark ? THEME_COLORS.text.dark : THEME_COLORS.text.light,
  };
}

type WheelPickerOption = WheelPickerPrimitive.WheelPickerOption;
type WheelPickerClassNames = WheelPickerPrimitive.WheelPickerClassNames;

function WheelPickerWrapper({
  className,
  ...props
}: React.ComponentProps<typeof WheelPickerPrimitive.WheelPickerWrapper>) {
  const { wheelBg } = useWheelPickerTheme();

  // Only inject styles once to avoid duplicates
  const styleTag = useMemo(() => {
    if (wheelPickerWrapperStyleInjected) return null;
    wheelPickerWrapperStyleInjected = true;
    return (
      <style>{`
        .wheel-picker-wrapper-bg {
          background-color: ${wheelBg} !important;
        }
      `}</style>
    );
  }, [wheelBg]);

  return (
    <>
      {styleTag}
      <WheelPickerPrimitive.WheelPickerWrapper
        className={cn(
          "wheel-picker-wrapper-bg w-72 rounded-lg px-1 shadow-lg",
          "*:data-rwp:first:*:data-rwp-highlight-wrapper:rounded-s-md",
          "*:data-rwp:last:*:data-rwp-highlight-wrapper:rounded-e-md",
          className
        )}
        {...props}
      />
    </>
  );
}

function WheelPicker({
  classNames,
  ...props
}: React.ComponentProps<typeof WheelPickerPrimitive.WheelPicker>) {
  const { selectorBg, textColor } = useWheelPickerTheme();

  // Only inject styles once to avoid duplicates
  const styleTag = useMemo(() => {
    if (wheelPickerStyleInjected) return null;
    wheelPickerStyleInjected = true;
    return (
      <style>{`
        .wheel-picker-highlight {
          background-color: ${selectorBg} !important;
          color: ${textColor} !important;
          text-shadow: ${TEXT_SHADOW} !important;
        }
        .wheel-picker-text {
          color: ${textColor} !important;
          text-shadow: ${TEXT_SHADOW} !important;
        }

        /* Increased vertical spacing on mobile for flip animation */
        @media (max-width: 640px) {
          [data-rwp-item] {
            height: 60px !important;
            line-height: 60px !important;
            font-size: 1.125rem !important;
          }
          [data-rwp-highlight-wrapper] {
            height: 60px !important;
          }
        }

        /* Default spacing on tablet and desktop */
        @media (min-width: 641px) {
          [data-rwp-item] {
            height: 48px !important;
            line-height: 48px !important;
          }
          [data-rwp-highlight-wrapper] {
            height: 48px !important;
          }
        }
      `}</style>
    );
  }, [selectorBg, textColor]);

  return (
    <>
      {styleTag}
      <WheelPickerPrimitive.WheelPicker
        classNames={{
          optionItem: "wheel-picker-text",
          highlightWrapper: "wheel-picker-highlight",
          ...classNames,
        }}
        {...props}
      />
    </>
  );
}

export { WheelPicker, WheelPickerWrapper };
export type { WheelPickerClassNames, WheelPickerOption };
