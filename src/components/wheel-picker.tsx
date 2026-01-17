"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, useMotionValue, useVelocity, animate, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WheelPickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface WheelPickerProps {
  options: WheelPickerOption[];
  value: string;
  onValueChange: (value: string) => void;
  infinite?: boolean;
  className?: string;
  "aria-label"?: string;
}

interface WheelPickerWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const ITEM_HEIGHT = 48; // Height of each item in pixels
const VISIBLE_ITEMS = 5; // Number of visible items (must be odd for center selection)
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Custom hook to handle theme mounting and avoid hydration mismatch
function useWheelPickerTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return { mounted, isDark };
}

function WheelPickerWrapper({ children, className }: WheelPickerWrapperProps) {
  const { mounted, isDark } = useWheelPickerTheme();

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-[240px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800",
          className
        )}
      />
    );
  }

  return (
    <div className={cn("wheel-picker-container relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-300",
          "backdrop-blur-xl backdrop-saturate-150",
          isDark ? "" : "border border-white/20",
          isDark
            ? "bg-gradient-to-br from-zinc-900/70 via-zinc-800/60 to-zinc-900/70"
            : "bg-gradient-to-br from-white/70 via-white/50 to-white/70"
        )}
        style={{
          height: PICKER_HEIGHT,
          boxShadow: isDark
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)"
            : "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
        }}
      >
        {/* Subtle shine effect at top */}
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 h-px"
          style={{
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1) 50%, transparent)"
              : "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6) 50%, transparent)",
          }}
        />

        {/* Selection highlight overlay with glass effect */}
        <div
          className={cn(
            "pointer-events-none absolute right-0 left-0 z-10 rounded-xl transition-all duration-200",
            isDark ? "border border-white/10 bg-zinc-700/30" : "border border-white/40 bg-white/40"
          )}
          style={{
            top: ITEM_HEIGHT * 2,
            height: ITEM_HEIGHT,
            boxShadow: isDark
              ? "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
              : "0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          }}
        />

        {/* Top fade overlay */}
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-24"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, rgba(24, 24, 27, 0.9) 0%, transparent 100%)"
              : "linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, transparent 100%)",
          }}
        />

        {/* Bottom fade overlay */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-24"
          style={{
            background: isDark
              ? "linear-gradient(to top, rgba(24, 24, 27, 0.9) 0%, transparent 100%)"
              : "linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, transparent 100%)",
          }}
        />

        {children}
      </div>
    </div>
  );
}

function WheelPicker({
  options,
  value,
  onValueChange,
  infinite = true,
  className,
  ...props
}: WheelPickerProps) {
  const { mounted, isDark } = useWheelPickerTheme();
  const y = useMotionValue(0);
  const yVelocity = useVelocity(y);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentY, setCurrentY] = useState(0);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalChangeRef = useRef(false);

  // Create extended options for infinite scrolling
  const extendedOptions = useMemo(
    () =>
      infinite
        ? [...options, ...options, ...options] // Triple the options for smooth infinite scroll
        : options,
    [infinite, options]
  );

  // Find current index
  const currentIndex = extendedOptions.findIndex((opt) => opt.value === value);
  const centerIndex = infinite ? options.length : 0; // Start at middle set for infinite

  // Initialize position
  useEffect(() => {
    if (currentIndex !== -1) {
      const targetY = -(currentIndex * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
      y.set(targetY);
      setCurrentY(targetY);
    } else if (infinite) {
      // Default to center of middle set
      const targetY = -(centerIndex * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
      y.set(targetY);
      setCurrentY(targetY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to external value changes (from search or programmatic updates)
  useEffect(() => {
    // Skip if this is an internal change (from our own snap)
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false; // Reset for next change
      return;
    }

    if (!isDragging && currentIndex !== -1) {
      const targetY = -(currentIndex * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
      const currentYValue = y.get();

      // Only animate if the position is significantly different (more than half an item)
      if (Math.abs(currentYValue - targetY) > ITEM_HEIGHT / 2) {
        console.log("🎯 Wheel picker: Animating to new value (external)", {
          value,
          currentIndex,
          targetY,
        });
        animate(y, targetY, {
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.5,
        });
      }
    }
  }, [value, currentIndex, isDragging, y]);

  // Snap to nearest item - aggressive gear-like behavior
  const snapToNearest = useCallback(
    (immediate = false) => {
      const currentY = y.get();
      const index = Math.round(-currentY / ITEM_HEIGHT) + 2;
      const clampedIndex = Math.max(0, Math.min(extendedOptions.length - 1, index));
      const targetY = -(clampedIndex * ITEM_HEIGHT) + ITEM_HEIGHT * 2;

      // Check if already very close to snap position
      const distance = Math.abs(currentY - targetY);
      const isCloseEnough = distance < 1; // Less than 1px

      if (isCloseEnough) {
        y.set(targetY); // Snap immediately if close
      } else {
        animate(y, targetY, {
          type: "spring",
          stiffness: immediate ? 500 : 300, // Stiffer spring for immediate snap
          damping: immediate ? 40 : 30,
          mass: 0.5, // Reduced mass for quicker response
        });
      }

      // Update value - always trigger to ensure parent updates
      const selectedOption = extendedOptions[clampedIndex];
      if (selectedOption) {
        // Always call onValueChange to ensure parent component updates
        // even if technically the same value (important for dependent pickers)
        isInternalChangeRef.current = true; // Mark as internal change
        onValueChange(selectedOption.value);
      }

      // Handle infinite scroll wraparound
      if (infinite) {
        const actualIndex = clampedIndex % options.length;
        if (clampedIndex < options.length / 2) {
          // Wrapped to top, jump to middle set
          const newY =
            -(actualIndex * ITEM_HEIGHT + options.length * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
          y.set(newY);
          setCurrentY(newY);
        } else if (clampedIndex >= options.length * 2.5) {
          // Wrapped to bottom, jump to middle set
          const newY =
            -(actualIndex * ITEM_HEIGHT + options.length * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
          y.set(newY);
          setCurrentY(newY);
        }
      }
    },
    [y, extendedOptions, options, onValueChange, infinite]
  );

  // Handle velocity-based snap detection
  const handleVelocitySnap = useCallback(() => {
    const currentVelocity = yVelocity.get();
    // Double-check velocity is still low before snapping
    if (Math.abs(currentVelocity) < 10 && !isDragging) {
      snapToNearest(true);
    }
  }, [yVelocity, isDragging, snapToNearest]);

  // Track y position for scale calculations and handle infinite wraparound
  useEffect(() => {
    const unsubscribeY = y.on("change", (latest) => {
      setCurrentY(latest);

      // Handle infinite scroll wraparound during scrolling
      if (infinite && !isDragging) {
        const currentIndex = Math.round(-latest / ITEM_HEIGHT) + 2;
        const actualIndex = currentIndex % options.length;

        // If we've scrolled too far up (into first copy)
        if (currentIndex < options.length * 0.3) {
          const newY =
            -(actualIndex * ITEM_HEIGHT + options.length * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
          y.set(newY);
          setCurrentY(newY);
        }
        // If we've scrolled too far down (into third copy)
        else if (currentIndex >= options.length * 2.7) {
          const newY =
            -(actualIndex * ITEM_HEIGHT + options.length * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
          y.set(newY);
          setCurrentY(newY);
        }
      }
    });

    return () => {
      unsubscribeY();
    };
  }, [y, infinite, options.length, isDragging]);

  // Track velocity for auto-snap
  useEffect(() => {
    const unsubscribeVelocity = yVelocity.on("change", (latest) => {
      // When velocity is very low and not dragging, snap
      if (Math.abs(latest) < 10 && !isDragging) {
        // Clear any existing snap timeout
        if (snapTimeoutRef.current) {
          clearTimeout(snapTimeoutRef.current);
        }

        // Set a short timeout to ensure velocity stays low
        snapTimeoutRef.current = setTimeout(() => {
          handleVelocitySnap();
          snapTimeoutRef.current = null;
        }, 50);
      }
    });

    return () => {
      unsubscribeVelocity();
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [yVelocity, isDragging, handleVelocitySnap]);

  // Handle drag end - apply small momentum then snap
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const velocity = info.velocity.y;

      // If fast flick, apply momentum
      if (Math.abs(velocity) > 100) {
        const currentY = y.get();
        const momentumY = currentY + velocity * 0.03; // Small momentum multiplier

        animate(y, momentumY, {
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.3,
        }).then(() => {
          snapToNearest(true);
        });
      } else {
        // Slow drag - snap immediately
        snapToNearest(true);
      }
    },
    [y, snapToNearest]
  );

  // Handle wheel scroll with native event listener for proper preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentY = y.get();
      const delta = e.deltaY * 0.5; // Increased for more responsive scroll
      const newY = currentY - delta;

      // Set position immediately for smooth scrolling
      y.set(newY);

      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Snap after scrolling stops (50ms debounce - more aggressive)
      scrollTimeout = setTimeout(() => {
        snapToNearest(true);
        scrollTimeout = null;
      }, 50);
    };

    // Add event listener with passive: false to allow preventDefault
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      container.removeEventListener("wheel", handleWheel);
    };
  }, [y, snapToNearest]);

  // Calculate scale, opacity, and font weight for an item based on its distance from center
  const getItemStyle = (index: number, optionValue: string) => {
    // Item's visual position relative to container top
    const itemPosition = index * ITEM_HEIGHT + currentY;
    // Center position is at ITEM_HEIGHT * 2
    const centerPosition = ITEM_HEIGHT * 2;
    // Distance from center
    const distance = Math.abs(itemPosition - centerPosition);

    // Max distance is about 2 * ITEM_HEIGHT (2 items away)
    const maxDistance = ITEM_HEIGHT * 2;
    const normalizedDistance = Math.min(distance / maxDistance, 1);

    // Scale: 1.0 at center, down to 0.6 at max distance (stronger effect)
    const scale = 1.0 - normalizedDistance * 0.4;

    // Opacity: 1.0 at center, down to 0.4 at max distance
    const opacity = 1.0 - normalizedDistance * 0.6;

    // Font weight: bold ONLY when this option is the actual selected value (locked/snapped)
    const fontWeight = optionValue === value ? 700 : 400;

    return { scale, opacity, fontWeight };
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full select-none", className)}
      style={{ touchAction: "none" }}
      {...props}
    >
      <motion.div
        drag="y"
        dragConstraints={false} // No constraints for infinite scrolling
        dragElastic={0}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="relative"
      >
        {extendedOptions.map((option, index) => {
          const { scale, opacity, fontWeight } = getItemStyle(index, option.value);

          const isSelected = option.value === value;

          return (
            <div
              key={`${option.value}-${index}`}
              className={cn(
                "flex cursor-pointer items-center justify-center text-lg transition-all duration-200",
                // Selected item: pure black on light, white on dark
                // Non-selected: gray-700 on light, white on dark
                isSelected
                  ? isDark
                    ? "text-white"
                    : "text-black"
                  : isDark
                    ? "text-white"
                    : "text-gray-700",
                option.disabled && "cursor-not-allowed opacity-40"
              )}
              style={{
                height: ITEM_HEIGHT,
                lineHeight: `${ITEM_HEIGHT}px`,
                transform: `scale(${scale})`,
                opacity: option.disabled ? 0.4 : opacity,
                fontWeight,
                transition:
                  "transform 0.2s ease-out, opacity 0.2s ease-out, font-weight 0.2s ease-out",
              }}
              onClick={() => {
                if (!option.disabled && !isDragging) {
                  const targetY = -(index * ITEM_HEIGHT) + ITEM_HEIGHT * 2;
                  animate(y, targetY, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  });
                  isInternalChangeRef.current = true; // Mark as internal change
                  onValueChange(option.value);
                }
              }}
            >
              <div className="flex items-center justify-center px-4 text-center">
                {option.label}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export { WheelPicker, WheelPickerWrapper };
