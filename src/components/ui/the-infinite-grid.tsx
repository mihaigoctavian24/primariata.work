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
  type MotionValue,
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

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  // Scroll-based spacing
  const { scrollY } = useScroll({
    container: scrollContainer,
  });
  const gridSpacing = useTransform(scrollY, [0, 1000], [40, 80]);

  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    const spacing = gridSpacing.get();
    gridOffsetX.set((currentX + speedX) % spacing);
    gridOffsetY.set((currentY + speedY) % spacing);
  });

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
      <div className="absolute inset-0 z-0 opacity-20">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} spacing={gridSpacing} />
      </div>
      <motion.div
        className="absolute inset-0 z-0 opacity-50"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} spacing={gridSpacing} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-20%] h-[40%] w-[40%] rounded-full bg-orange-500/40 blur-[120px] dark:bg-orange-600/20" />
        <div className="bg-primary/30 absolute top-[-10%] right-[10%] h-[20%] w-[20%] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/40 blur-[120px] dark:bg-blue-600/20" />
      </div>
    </div>
  );
};

const GridPattern = ({
  offsetX,
  offsetY,
  spacing,
}: {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  spacing: MotionValue<number>;
}) => {
  return (
    <svg className="h-full w-full">
      <defs>
        <motion.pattern
          id="grid-pattern"
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <motion.path
            d={useTransform(spacing, (s) => `M ${s} 0 L 0 0 0 ${s}`)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};
