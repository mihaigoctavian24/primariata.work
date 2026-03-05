import type { Variants, Transition } from "motion/react";

/**
 * Detect user preference for reduced motion.
 * Falls back to false on the server (SSR-safe).
 */
const prefersReducedMotion: boolean =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

/** No-op variants for users who prefer reduced motion */
const noMotion: Variants = {
  hidden: {},
  visible: {},
};

/** Fade in from opacity 0 to 1 */
export const fadeIn: Variants = prefersReducedMotion
  ? noMotion
  : {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

/** Slide in from below with fade */
export const slideIn: Variants = prefersReducedMotion
  ? noMotion
  : {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };

/** Stagger children animations */
export const stagger: Variants = prefersReducedMotion
  ? noMotion
  : {
      visible: {
        transition: { staggerChildren: 0.08 },
      },
    };

/** Spring transition for bouncy feel */
export const springTransition: Transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: "spring", stiffness: 300, damping: 25 };

/** Default ease transition */
export const defaultTransition: Transition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] };
