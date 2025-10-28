"use client";

import { motion } from "framer-motion";

/**
 * AnimatedStats Component for Survey Landing Page
 *
 * Displays three key statistics with blur-in animations:
 * - Estimated time (~5 min)
 * - Number of questions (10-12)
 * - Privacy level (100% Anonim)
 */
export function AnimatedStats() {
  const stats = [
    { value: "~5 min", label: "Timp estimat" },
    { value: "10-12", label: "Întrebări simple" },
    { value: "100%", label: "Anonim (opțional)" },
  ];

  return (
    <section className="border-border/50 bg-muted/30 border-y px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                delay: 3.5 + index * 0.15,
                duration: 0.8,
              }}
            >
              <div className="text-primary mb-2 text-4xl font-bold">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
