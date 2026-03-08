import { motion } from "motion/react";

interface CereriCardProps {
  value: number;
  label: string;
  color: string;
  delay?: number;
}

export function CereriCard({ value, label, color, delay = 0 }: CereriCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="relative rounded-xl p-4 text-center overflow-hidden group cursor-pointer"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}25`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 80%, ${color}20, transparent 70%)`,
        }}
      />
      <div className="relative z-10">
        <div style={{ fontSize: "1.75rem", fontWeight: 700, color, lineHeight: 1.2 }}>
          {value}
        </div>
        <div className="text-gray-400 mt-1" style={{ fontSize: "0.75rem" }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}
