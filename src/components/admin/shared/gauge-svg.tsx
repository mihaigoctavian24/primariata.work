"use client";

import { motion } from "motion/react";

interface GaugeSVGProps {
  value: number;
  max: number;
  color: string; // hex — SVG stroke attribute cannot use CSS vars
  label: string;
  unit: string;
  size?: number;
}

function GaugeSVG({
  value,
  max,
  color,
  label,
  unit,
  size = 80,
}: GaugeSVGProps): React.ReactElement {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const pct = (clampedValue / max) * 100;
  const strokeWidth = 7;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
        </svg>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <span className="font-bold text-white" style={{ fontSize: size * 0.22 }}>
            {Math.round(clampedValue)}
            {unit}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

export { GaugeSVG };
export type { GaugeSVGProps };
