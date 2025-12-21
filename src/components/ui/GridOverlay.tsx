"use client";

import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

/**
 * Grid Overlay Component - 12 Column Development Grid
 *
 * Structure:
 * - 12 columns total
 * - Columns 1 and 12: Wider outer columns (margins)
 * - Columns 2-11: Narrower inner columns (content area)
 * - Separated by double-dashed lines with scroll-based spacing
 *
 * Features:
 * - Scroll-based animation: lines separate/come together on scroll
 * - Increased transparency for subtle effect
 * - Z-index positioned above background but below content
 */

interface GridOverlayProps {
  scrollContainer?: React.RefObject<HTMLElement>;
}

export function GridOverlay({ scrollContainer }: GridOverlayProps = {}) {
  // Scroll-based spacing for double lines
  const { scrollY } = useScroll({
    container: scrollContainer,
  });
  const lineGap = useTransform(scrollY, [0, 4000], [8, 40]);
  const lineGapPx = useMotionTemplate`${lineGap}px`;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] flex opacity-40">
      {/* Container with max-width and padding to match layout */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-full grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_2fr] gap-0">
          {/* Column 1 - Wider outer column (left margin) */}
          <div className="relative h-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-gray-600 opacity-50 dark:text-gray-400">
              1
            </div>
            {/* Double dashed line separator with scroll animation */}
            <motion.div
              className="absolute top-0 right-0 flex h-full justify-between"
              style={{ width: lineGapPx, willChange: "width" }}
            >
              <div className="h-full border-r-[1px] border-dashed border-gray-600 opacity-60 dark:border-gray-400"></div>
              <div className="h-full border-r-[1px] border-dashed border-gray-600 opacity-60 dark:border-gray-400"></div>
            </motion.div>
          </div>

          {/* Columns 2-11 - Narrower inner columns */}
          {Array.from({ length: 10 }, (_, i) => i + 2).map((col) => (
            <div key={col} className="relative h-full">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-gray-600 opacity-50 dark:text-gray-400">
                {col}
              </div>
              {/* Double dashed line separator with scroll animation */}
              <motion.div
                className="absolute top-0 right-0 flex h-full justify-between"
                style={{ width: lineGapPx, willChange: "width" }}
              >
                <div className="h-full border-r-[1px] border-dashed border-gray-600 opacity-60 dark:border-gray-400"></div>
                <div className="h-full border-r-[1px] border-dashed border-gray-600 opacity-60 dark:border-gray-400"></div>
              </motion.div>
            </div>
          ))}

          {/* Column 12 - Wider outer column (right margin) */}
          <div className="relative h-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-gray-600 opacity-50 dark:text-gray-400">
              12
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
