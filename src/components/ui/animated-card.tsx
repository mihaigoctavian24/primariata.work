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
 * - Optional glass morphism styling
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
        boxShadow: isActive ? "0 20px 40px rgba(0, 0, 0, 0.1)" : "0 0px 0px rgba(0, 0, 0, 0)",
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
        "rounded-xl p-8",
        glassEffect && "border-border/50 bg-card border shadow-lg backdrop-blur-md",
        !glassEffect && "border-border bg-card border shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
