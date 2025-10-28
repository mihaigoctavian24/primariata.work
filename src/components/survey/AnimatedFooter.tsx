"use client";

import { motion } from "framer-motion";

/**
 * AnimatedFooter Component
 *
 * Footer note with animation
 */
export function AnimatedFooter() {
  return (
    <motion.footer
      className="border-border/50 border-t px-4 py-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 6.0, duration: 0.6 }}
    >
      <p className="text-muted-foreground text-sm">
        🔒 Toate răspunsurile sunt confidențiale și vor fi folosite doar pentru îmbunătățirea
        serviciilor publice digitale.
      </p>
    </motion.footer>
  );
}
