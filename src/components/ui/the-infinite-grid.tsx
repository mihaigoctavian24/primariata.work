"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
  useScroll,
  useTransform,
} from "framer-motion";

interface TheInfiniteGridProps {
  scrollContainer?: React.RefObject<HTMLElement>;
}

export const TheInfiniteGrid = ({ scrollContainer }: TheInfiniteGridProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  // ✅ Animate entire SVG with CSS transform - no React re-renders
  const speedX = 0.5;
  const speedY = 0.5;
  const spacing = 40; // Static spacing

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  // Scroll-based scale for grid squares (40px → 160px effect - 4x larger)
  // Use large pixel values to cover full page height (~10000px for typical long pages)
  const { scrollY } = useScroll({
    container: scrollContainer,
  });
  const gridScale = useTransform(scrollY, [0, 10000], [1, 4]);

  // Animate offset - MotionValue updates don't trigger React re-renders
  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % spacing);
    gridOffsetY.set((gridOffsetY.get() + speedY) % spacing);
  });

  // ✅ SEPARATE transforms to avoid conflicts:
  // - Translate: Updates every frame (diagonal animation)
  // - Scale: Updates on scroll (zoom effect)
  // Pre-calculate offset to avoid calc() overhead
  const offsetX = -spacing;
  const offsetY = -spacing;
  const gridTranslate = useMotionTemplate`translate(calc(${gridOffsetX}px + ${offsetX}px), calc(${gridOffsetY}px + ${offsetY}px))`;

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "pointer-events-none fixed inset-0 z-[1] flex h-full w-full flex-col items-center justify-center overflow-hidden"
      )}
      style={{ background: "transparent" }}
    >
      {/* ✅ Nested divs: Outer (scale) + Inner (translate) = No conflict */}
      <motion.div
        className="absolute inset-0 z-0 opacity-20"
        style={{ scale: gridScale, willChange: "transform" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transform: gridTranslate, willChange: "transform" }}
        >
          <GridPattern />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          scale: gridScale,
          willChange: "transform",
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transform: gridTranslate, willChange: "transform" }}
        >
          <GridPattern />
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-20%] h-[40%] w-[40%] rounded-full bg-orange-500/40 blur-[120px] dark:bg-orange-600/20" />
        <div className="bg-primary/30 absolute top-[-10%] right-[10%] h-[20%] w-[20%] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/40 blur-[120px] dark:bg-blue-600/20" />
      </div>
    </div>
  );
};

const GridPattern = () => {
  // ✅ Static pattern - animation handled by CSS transform on parent
  const spacing = 40;
  const pathD = `M ${spacing} 0 L 0 0 0 ${spacing}`;

  return (
    <svg className="h-full w-full">
      <defs>
        <pattern id="grid-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};
