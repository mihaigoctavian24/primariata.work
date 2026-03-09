"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Segment {
  value: number;
  label: string;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ data, size = 180, thickness = 22 }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={thickness}
        />
        {data.map((segment, i) => {
          const percent = segment.value / total;
          const offset = circumference * (1 - percent);
          const rotation = cumulativePercent * 360 - 90;
          cumulativePercent += percent;
          const isHovered = hovered === i;

          return (
            <motion.circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={isHovered ? thickness + 4 : thickness}
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
                strokeWidth: isHovered ? thickness + 4 : thickness,
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {hovered !== null && data[hovered] ? (
          <>
            <span
              className="text-white"
              style={{ fontSize: `${Math.round(size * 0.17)}px`, fontWeight: 700, lineHeight: 1 }}
            >
              {data[hovered].value}
            </span>
            <span
              className="mt-1 text-gray-400"
              style={{ fontSize: `${Math.round(size * 0.085)}px` }}
            >
              {data[hovered].label}
            </span>
          </>
        ) : (
          <>
            <span
              className="text-white"
              style={{ fontSize: `${Math.round(size * 0.17)}px`, fontWeight: 700, lineHeight: 1 }}
            >
              {total}
            </span>
            <span
              className="mt-1 text-gray-400"
              style={{ fontSize: `${Math.round(size * 0.085)}px` }}
            >
              Total
            </span>
          </>
        )}
      </div>
    </div>
  );
}
