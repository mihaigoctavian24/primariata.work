"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartDataItem[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  className?: string;
}

function DonutChart({ data, centerLabel, centerValue, size = 180, className }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />

        {data.map((segment, i) => {
          const percent = segment.value / total;
          const offset = circumference * (1 - percent);
          const rotation = cumulativePercent * 360 - 90;
          cumulativePercent += percent;
          const isHovered = hovered === i;

          return (
            <motion.circle
              key={segment.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${center} ${center})`}
              style={{
                cursor: "pointer",
                filter: isHovered ? `drop-shadow(0 0 8px ${segment.color}80)` : "none",
              }}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: offset,
                strokeWidth: isHovered ? strokeWidth + 4 : strokeWidth,
              }}
              transition={{
                strokeDashoffset: { duration: 1, delay: i * 0.15, ease: "easeOut" },
                strokeWidth: { duration: 0.2 },
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              opacity={hovered !== null && hovered !== i ? 0.3 : 1}
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {hovered !== null && data[hovered] != null ? (
          (() => {
            const hoveredItem = data[hovered]!;
            return (
              <>
                <span className="text-foreground text-2xl leading-none font-bold">
                  {hoveredItem.value}
                </span>
                <span className="text-muted-foreground mt-1 text-[0.7rem]">{hoveredItem.name}</span>
              </>
            );
          })()
        ) : (
          <>
            {centerValue !== undefined && (
              <span className="text-foreground text-2xl leading-none font-bold">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-muted-foreground mt-1 text-[0.7rem]">{centerLabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { DonutChart };
export type { DonutChartProps, DonutChartDataItem };
