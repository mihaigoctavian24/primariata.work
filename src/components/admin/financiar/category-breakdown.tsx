"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

import { categoryBreakdown } from "./financiar-data";

// ─── Component ────────────────────────────────────────

export function CategoryBreakdown() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mb-5 rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <h3 className="mb-4 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
        Colectare pe Categorii — Martie 2026
      </h3>
      <div className="grid grid-cols-6 gap-3">
        {categoryBreakdown.map((cat, i) => {
          const progress = Math.min(Math.round((cat.colectat / cat.target) * 100), 100);
          const overTarget = cat.colectat >= cat.target;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.04 }}
              className="rounded-xl p-3.5"
              style={{ background: `${cat.color}06`, border: `1px solid ${cat.color}10` }}
            >
              <div className="mb-1 text-gray-400" style={{ fontSize: "0.7rem" }}>
                {cat.name}
              </div>
              <div
                className="text-white"
                style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.1 }}
              >
                {(cat.colectat / 1000).toFixed(1)}k
              </div>
              <div className="mb-2 text-gray-600" style={{ fontSize: "0.62rem" }}>
                din {(cat.target / 1000).toFixed(0)}k target
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.06 }}
                  className="h-full rounded-full"
                  style={{ background: overTarget ? "#10b981" : cat.color }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span
                  style={{
                    fontSize: "0.62rem",
                    color: overTarget ? "#10b981" : cat.color,
                    fontWeight: 600,
                  }}
                >
                  {progress}%
                </span>
                {overTarget && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
