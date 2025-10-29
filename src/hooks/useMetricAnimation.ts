"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook for animating metric value changes
 * Skeleton implementation - to be completed in Phase 2
 */

export interface UseMetricAnimationOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

export function useMetricAnimation(targetValue: number, options: UseMetricAnimationOptions = {}) {
  const { duration = 1000, decimals = 0, prefix = "", suffix = "", onComplete } = options;

  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Instantly set to target value if user prefers reduced motion
      setDisplayValue(targetValue);
      return;
    }

    setIsAnimating(true);
    startValueRef.current = displayValue;
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue =
        startValueRef.current + (targetValue - startValueRef.current) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, duration, onComplete]);

  // Format the display value
  const formattedValue = `${prefix}${displayValue.toFixed(decimals)}${suffix}`;

  return {
    displayValue,
    formattedValue,
    isAnimating,
  };
}

/**
 * Hook for animating percentage changes
 */
export function usePercentageAnimation(
  targetPercentage: number,
  options: Omit<UseMetricAnimationOptions, "suffix"> = {}
) {
  return useMetricAnimation(targetPercentage, {
    ...options,
    suffix: "%",
    decimals: options.decimals ?? 1,
  });
}

/**
 * Hook for animating currency values
 */
export function useCurrencyAnimation(
  targetAmount: number,
  options: Omit<UseMetricAnimationOptions, "prefix"> = {}
) {
  return useMetricAnimation(targetAmount, {
    ...options,
    prefix: "$",
    decimals: options.decimals ?? 2,
  });
}
