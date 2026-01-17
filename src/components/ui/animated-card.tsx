"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * AnimatedCard Component
 *
 * Card wrapper with framer-motion animations:
 * - Entry animations (fade + blur + slide)
 * - Hover effects (lift + shadow)
 * - Apple-style liquid glass morphism styling
 *
 * @example
 * <AnimatedCard delay={0.2} glassEffect>
 *   <YourContent />
 * </AnimatedCard>
 */

export interface AnimatedCardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart" | "onAnimationEnd"
  > {
  children: React.ReactNode;
  delay?: number;
  glassEffect?: boolean;
  hoverEffect?: boolean;
}

export function AnimatedCard({
  children,
  delay = 0.2,
  glassEffect = true,
  hoverEffect = true,
  className,
  ...props
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isActive = hoverEffect && (isHovered || isFocused);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        y: isActive ? -15 : 0,
        filter: "blur(0px)",
      }}
      transition={{
        opacity: {
          duration: 0.6,
          ease: "easeOut",
          delay,
        },
        filter: {
          duration: 0.6,
          ease: "easeOut",
          delay,
        },
        y: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 2.5,
        },
        boxShadow: {
          duration: 0.6,
          ease: "easeInOut",
        },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl p-8 transition-all duration-300",
        isActive ? "shadow-2xl" : "shadow-none",
        !glassEffect && "border-border bg-card border shadow-lg",
        className
      )}
      style={
        glassEffect
          ? {
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
              backdropFilter: "blur(3px) saturate(120%)",
              WebkitBackdropFilter: "blur(3px) saturate(120%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }
          : undefined
      }
      {...props}
    >
      {/* Subtle shine effect at top */}
      {glassEffect && (
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
