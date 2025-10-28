"use client";

import { motion } from "framer-motion";
import TextType from "@/components/TextType";

/**
 * AnimatedLogo Component
 *
 * Displays the primariaTa logo with typing animation and beating heart
 * Used in survey layout header
 */
export function AnimatedLogo() {
  return (
    <div className="inline-block text-xl font-bold">
      <span className="inline-block whitespace-nowrap">
        <TextType
          text="primariaTa"
          as="span"
          className="inline"
          charStyler={(_char, idx) => {
            // "Ta" is at indices 8 and 9
            if (idx === 8 || idx === 9) {
              return { color: "oklch(0.712 0.194 13.428)" };
            }
            return {};
          }}
          typingSpeed={75}
          initialDelay={200}
          showCursor={false}
          loop={false}
        />
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: [
              1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1,
            ],
          }}
          transition={{
            opacity: {
              duration: 0.3,
              delay: 0.9,
            },
            scale: {
              duration: 8,
              delay: 1.2,
              times: [
                0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52, 0.53,
                0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
              ],
              ease: [0.4, 0, 0.6, 1],
              repeat: Infinity,
            },
          }}
        >
          ❤️
        </motion.span>
        <motion.span
          className="inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            delay: 0.9,
            duration: 1.2,
            repeat: Infinity,
            repeatType: "loop",
            times: [0, 0.1, 0.9, 1],
          }}
        >
          _
        </motion.span>
      </span>
    </div>
  );
}
