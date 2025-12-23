"use client";

import { motion } from "framer-motion";

/**
 * Auth Page Template with Swipe Transition
 *
 * Wraps all auth pages with a swipe-in animation from right to left
 * Creates a smooth, app-like transition when navigating to auth pages
 */

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
        mass: 0.8,
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
