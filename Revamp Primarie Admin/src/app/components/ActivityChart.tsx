import { useState } from "react";
import { motion } from "motion/react";

const weekData = [
  { day: "Lun", value: 35 },
  { day: "Mar", value: 52 },
  { day: "Mie", value: 41 },
  { day: "Joi", value: 67 },
  { day: "Vin", value: 48 },
  { day: "Sâm", value: 20 },
  { day: "Dum", value: 12 },
];

const monthData = [
  { day: "S1", value: 120 },
  { day: "S2", value: 185 },
  { day: "S3", value: 145 },
  { day: "S4", value: 210 },
];

export function ActivityChart() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const data = period === "week" ? weekData : monthData;
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
          Activitate
        </h3>
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                period === p ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              style={period === p ? { background: "rgba(236,72,153,0.2)", fontSize: "0.75rem" } : { fontSize: "0.75rem" }}
            >
              {p === "week" ? "Săptămânal" : "Lunar"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-3 h-36">
        {data.map((d, i) => {
          const height = (d.value / maxValue) * 100;
          const isHighest = d.value === maxValue;
          const isHovered = hoveredBar === i;

          return (
            <div
              key={`${period}-${d.day}`}
              className="flex-1 flex flex-col items-center gap-2"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2 py-1 rounded-md text-white whitespace-nowrap"
                  style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {d.value} cereri
                </motion.div>
              )}
              <motion.div
                key={`bar-${period}-${d.day}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                className="w-full rounded-lg relative overflow-hidden cursor-pointer"
                style={{
                  background: isHighest || isHovered
                    ? "linear-gradient(180deg, #ec4899, #f43f5e)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
                  minHeight: 4,
                  boxShadow: isHighest || isHovered ? "0 0 20px rgba(236,72,153,0.3)" : "none",
                }}
              />
              <span
                className={isHighest ? "text-pink-400" : "text-gray-600"}
                style={{ fontSize: "0.7rem" }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
