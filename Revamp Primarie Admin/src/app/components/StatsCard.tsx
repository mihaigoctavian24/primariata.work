import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  delay?: number;
}

export function StatsCard({ icon: Icon, label, value, color, trend = "flat", trendValue, delay = 0 }: StatsCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative group rounded-2xl p-4 overflow-hidden cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 100%, ${color}12, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          {trendValue && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: `${trendColor}15` }}>
              <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
              <span style={{ color: trendColor, fontSize: "0.7rem" }}>{trendValue}</span>
            </div>
          )}
        </div>
        <AnimatedCounter
          target={value}
          duration={1500}
          className="text-white block"
          style={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.1 }}
        />
        <span className="text-gray-500 mt-1 block" style={{ fontSize: "0.78rem" }}>{label}</span>
      </div>
    </motion.div>
  );
}
