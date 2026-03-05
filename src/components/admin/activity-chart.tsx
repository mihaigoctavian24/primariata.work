"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ActivityChartDataItem {
  date: string;
  value: number;
  [key: string]: string | number;
}

interface ActivityChartProps {
  data: ActivityChartDataItem[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  className?: string;
}

function ActivityChart({
  data,
  dataKey = "value",
  xAxisKey = "date",
  color: _color,
  height: _height,
  className,
}: ActivityChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    const vals = data.map((d) => Number(d[dataKey]) || 0);
    return Math.max(...vals, 1);
  }, [data, dataKey]);

  const highestIndex = useMemo(() => {
    let idx = 0;
    let max = -Infinity;
    for (let i = 0; i < data.length; i++) {
      const v = Number(data[i]?.[dataKey]) || 0;
      if (v > max) {
        max = v;
        idx = i;
      }
    }
    return idx;
  }, [data, dataKey]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex h-36 items-end gap-3">
        {data.map((item, i) => {
          const value = Number(item[dataKey]) || 0;
          const pct = (value / maxValue) * 100;
          const isHighest = value === Number(data[highestIndex]?.[dataKey]);
          const isHovered = hovered === i;
          const isHighlighted = isHighest || isHovered;

          return (
            <div
              key={`${i}-${String(item[xAxisKey])}`}
              className="flex flex-1 flex-col items-center gap-2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Animated tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md px-2 py-1 whitespace-nowrap text-white"
                  style={{
                    fontSize: "0.7rem",
                    background: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {value} cereri
                </motion.div>
              )}

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                className="relative w-full cursor-pointer overflow-hidden rounded-lg"
                style={{
                  minHeight: 4,
                  background: isHighlighted
                    ? "linear-gradient(180deg, #ec4899, #f43f5e)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
                  boxShadow: isHighlighted ? "0 0 20px rgba(236,72,153,0.3)" : "none",
                }}
              />

              {/* Label */}
              <span
                className={isHighlighted ? "text-pink-400" : "text-gray-600"}
                style={{ fontSize: "0.7rem" }}
              >
                {String(item[xAxisKey])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ActivityChart };
export type { ActivityChartProps, ActivityChartDataItem };
