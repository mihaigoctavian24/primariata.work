/**
 * Animation Library - Framer Motion Variants
 * Provides reusable animation variants for the dashboard with accessibility support
 */

import { Variants, Transition } from "framer-motion";

// Check for reduced motion preference
export const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Default transition settings
const defaultTransition: Transition = {
  duration: prefersReducedMotion ? 0.01 : 0.3,
  ease: "easeOut",
};

const springTransition: Transition = prefersReducedMotion
  ? { duration: 0.01 }
  : {
      type: "spring",
      stiffness: 260,
      damping: 20,
    };

// Fade In Animation
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: defaultTransition,
  },
};

// Slide Up Animation
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
    transition: defaultTransition,
  },
};

// Slide Down Animation
export const slideDown: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
    transition: defaultTransition,
  },
};

// Slide Left Animation
export const slideLeft: Variants = {
  hidden: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -20,
    transition: defaultTransition,
  },
};

// Slide Right Animation
export const slideRight: Variants = {
  hidden: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 20,
    transition: defaultTransition,
  },
};

// Scale In Animation
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
    transition: defaultTransition,
  },
};

// Scale On Hover (for interactive elements)
export const scaleOnHover: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: prefersReducedMotion ? 1 : 1.05,
    transition: springTransition,
  },
  tap: {
    scale: prefersReducedMotion ? 1 : 0.98,
    transition: springTransition,
  },
};

// Stagger Container (for list animations)
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.1,
      delayChildren: prefersReducedMotion ? 0 : 0.05,
    },
  },
};

// Stagger Item (used with staggerContainer)
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
};

// Counter Animation (for numeric values)
export const counterAnimation = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

// Card Hover Animation
export const cardHover: Variants = {
  initial: {
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    boxShadow: "0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)",
    y: prefersReducedMotion ? 0 : -4,
    transition: springTransition,
  },
};

// Collapse/Expand Animation
export const collapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: defaultTransition,
  },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "visible",
    transition: defaultTransition,
  },
};

// Modal/Dialog Animation
export const modalBackdrop: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: prefersReducedMotion ? 0.01 : 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: prefersReducedMotion ? 0.01 : 0.2,
    },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
    y: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
    y: prefersReducedMotion ? 0 : 20,
    transition: defaultTransition,
  },
};

// Notification/Toast Animation
export const notification: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
    scale: prefersReducedMotion ? 1 : 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 100,
    transition: defaultTransition,
  },
};

// Progress Bar Animation
export const progressBar: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: (value: number) => ({
    scaleX: value / 100,
    transition: {
      duration: prefersReducedMotion ? 0.01 : 0.5,
      ease: "easeOut",
    },
  }),
};

// Skeleton Pulse Animation
export const skeletonPulse: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: prefersReducedMotion ? 1 : [1, 0.5, 1],
    transition: {
      duration: prefersReducedMotion ? 0 : 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Page Transition Animation
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 20,
    transition: defaultTransition,
  },
};

// Chart Animation Helpers
export const chartBarAnimation = {
  initial: { scaleY: 0, originY: 1 },
  animate: {
    scaleY: 1,
    transition: {
      duration: prefersReducedMotion ? 0.01 : 0.5,
      ease: "easeOut",
    },
  },
};

export const chartLineAnimation = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: prefersReducedMotion ? 0.01 : 1,
        ease: "easeInOut",
      },
      opacity: {
        duration: prefersReducedMotion ? 0.01 : 0.2,
      },
    },
  },
};

// Utility function to create custom stagger
export const createStagger = (staggerDelay = 0.1, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
      delayChildren: prefersReducedMotion ? 0 : delayChildren,
    },
  },
});

// Utility function to create custom slide animation
export const createSlide = (
  direction: "up" | "down" | "left" | "right",
  distance = 20
): Variants => {
  const axis = direction === "up" || direction === "down" ? "y" : "x";
  const value = direction === "up" || direction === "left" ? distance : -distance;

  if (axis === "y") {
    return {
      hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : value,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: defaultTransition,
      },
      exit: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : -value,
        transition: defaultTransition,
      },
    };
  } else {
    return {
      hidden: {
        opacity: 0,
        x: prefersReducedMotion ? 0 : value,
      },
      visible: {
        opacity: 1,
        x: 0,
        transition: defaultTransition,
      },
      exit: {
        opacity: 0,
        x: prefersReducedMotion ? 0 : -value,
        transition: defaultTransition,
      },
    };
  }
};
